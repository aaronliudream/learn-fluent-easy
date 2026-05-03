import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  DEFAULT_LANG,
  LANGUAGES,
  type LangCode,
  detectBrowserLang,
  getLanguageInfo,
} from "./languages";
import { BUILTIN, EN, ZH, type StringKey, interpolate } from "./strings";
import { localizeProtagonist } from "./protagonistName";
import { startDomLeakScanner } from "./devLeakDetector";

const STORAGE_LANG = "fluentpath.lang";
const STORAGE_PICKED = "fluentpath.langPicked";
// v4: earlier versions persisted Chinese source text into non-Chinese
// catalogs (ja/ko/etc.), so even after adding new keys the provider would
// "find" a cached value and skip re-translating. Bump the prefix and add a
// stricter sanitiser (see sanitizeCachedCatalog) to evict stale entries.
// v5: previously we sent English as the translation source, which made the
// model occasionally echo the English back unchanged for less-common target
// languages (Punjabi, Bengali, etc.). Those fallbacks then poisoned the
// catalog. Bump the prefix so every client re-fetches once with the new
// Chinese-source pipeline.
const STORAGE_CACHE_PREFIX = "fluentpath.i18n.v5.";
const TRANSLATION_FETCH_TIMEOUT_MS = 2500;

type Catalog = Partial<Record<StringKey, string>>;

const CJK_TEXT_RE = /[\u3400-\u9fff\u3040-\u30ff\uac00-\ud7af]/;
const HANGUL_TEXT_RE = /[\uac00-\ud7af]/;
const JAPANESE_TEXT_RE = /[\u3040-\u30ff]/;
// Han ideographs (shared by zh / ja / ko). A pure-Han string can be valid
// Japanese (e.g. "単元", "学習") or valid Korean Hanja, so we must NOT reject
// it just because it lacks kana / hangul. Only reject when the value is
// identical to the original Chinese source (i.e. translation didn't happen).
const HAN_RE = /[\u3400-\u9fff]/;

// Strip any HTML tags (e.g. <b>, </b>, <i>) the translator may have added,
// decode common entities, and collapse whitespace. Translations are rendered
// as plain text, so any tag would otherwise show up literally on screen.
function stripHtml(value: string): string {
  if (!value) return value;
  return value
    .replace(/<\/?[a-zA-Z][^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function hasWrongScript(lang: LangCode, value: string | undefined) {
  if (!value) return false;
  if (lang === "zh" || lang === "zh-TW") return false;
  // Japanese and Korean both legitimately use Han characters, so we only
  // flag values that contain CJK characters that are clearly *not* valid
  // for the target language. A value made of pure Han (no kana/hangul)
  // is allowed — the "is it really a translation?" check is handled by
  // the source-equality test in isUsableTranslation.
  if (lang === "ja" || lang === "ko") return false;
  // Other Latin / Cyrillic / etc. languages should never contain CJK at all.
  return CJK_TEXT_RE.test(value);
}

function isUsableTranslation(lang: LangCode, source: string, value: string | undefined) {
  if (!value) return false;
  const cleaned = stripHtml(value);
  if (!cleaned) return false;
  if (lang !== "zh" && lang !== "zh-TW" && cleaned.trim() === stripHtml(source).trim()) return false;
  // For Japanese / Korean, a *long* value with no kana/hangul almost
  // certainly wasn't translated (the model echoed the Chinese back).
  // Short pure-Han results like "単元" are valid translations.
  if (lang === "ja" && cleaned.length > 6 && HAN_RE.test(cleaned) && !JAPANESE_TEXT_RE.test(cleaned)) return false;
  if (lang === "ko" && cleaned.length > 6 && HAN_RE.test(cleaned) && !HANGUL_TEXT_RE.test(cleaned)) return false;
  return !hasWrongScript(lang, cleaned);
}

function sanitizeCachedCatalog(lang: LangCode, cat: Catalog): Catalog {
  const cleaned: Catalog = {};
  for (const [k, v] of Object.entries(cat)) {
    if (typeof v !== "string") continue;
    if (hasWrongScript(lang, v)) continue;
    const stripped = stripHtml(v);
    // Drop entries that aren't actually translated for the target language.
    // This catches stale cache entries where the value equals the English
    // source, or where (for ja/ko) the value is pure Han characters that
    // are really just the original Chinese leaking through. Dropping them
    // forces the next load to re-fetch a real translation.
    const sourceEn = EN[k as StringKey];
    if (sourceEn && !isUsableTranslation(lang, sourceEn, stripped)) continue;
    cleaned[k as StringKey] = stripped;
  }
  return cleaned;
}

function sanitizeDynCache(lang: LangCode, cache: Record<string, string>) {
  const cleaned: Record<string, string> = {};
  for (const [k, v] of Object.entries(cache)) {
    if (typeof v !== "string") continue;
    if (hasWrongScript(lang, v)) continue;
    cleaned[k] = stripHtml(v);
  }
  return cleaned;
}

type I18nContextValue = {
  lang: LangCode;
  setLang: (l: LangCode) => void;
  hasPicked: boolean;
  markPicked: () => void;
  t: (key: StringKey, vars?: Record<string, string | number>) => string;
  tDynamic: (text: string) => string; // for content (dialogue Chinese hints, etc.)
};

const I18nContext = createContext<I18nContextValue | null>(null);

function loadCachedCatalog(lang: LangCode): Catalog {
  try {
    const raw = localStorage.getItem(STORAGE_CACHE_PREFIX + lang);
    const parsed = raw ? (JSON.parse(raw) as Catalog) : {};
    return sanitizeCachedCatalog(lang, parsed);
  } catch {
    return {};
  }
}

function saveCachedCatalog(lang: LangCode, cat: Catalog) {
  try {
    localStorage.setItem(STORAGE_CACHE_PREFIX + lang, JSON.stringify(cat));
  } catch {
    /* ignore quota */
  }
}

// Per-page dynamic-text cache (e.g., Chinese hint strings inside dialogues
// translated into the user's language). Keyed by source string.
function loadDynCache(lang: LangCode): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_CACHE_PREFIX + lang + ".dyn");
    const parsed = raw ? JSON.parse(raw) : {};
    return sanitizeDynCache(lang, parsed);
  } catch { return {}; }
}
function saveDynCache(lang: LangCode, c: Record<string, string>) {
  try { localStorage.setItem(STORAGE_CACHE_PREFIX + lang + ".dyn", JSON.stringify(c)); } catch { /* ignore */ }
}

async function invokeTranslateWithTimeout(
  targetLanguage: string,
  items: { key: string; text: string }[],
) {
  return Promise.race([
    supabase.functions.invoke("translate", { body: { targetLanguage, items } }),
    new Promise<{ data: null; error: Error }>((resolve) => {
      window.setTimeout(() => resolve({ data: null, error: new Error("translation timeout") }), TRANSLATION_FETCH_TIMEOUT_MS);
    }),
  ]);
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LangCode>(() => {
    if (typeof window === "undefined") return DEFAULT_LANG;
    const saved = localStorage.getItem(STORAGE_LANG) as LangCode | null;
    if (saved && LANGUAGES.some((l) => l.code === saved)) return saved;
    return detectBrowserLang();
  });
  const [hasPicked, setHasPicked] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem(STORAGE_PICKED) === "1";
  });

  // Static UI catalog for current language.
  const [catalog, setCatalog] = useState<Catalog>(() => {
    const builtin = BUILTIN[lang];
    if (builtin) return builtin;
    return loadCachedCatalog(lang);
  });

  // Dynamic-text cache (translated content snippets).
  const dynCacheRef = useRef<Record<string, string>>({});
  // Bumped whenever a batch of dynamic translations lands. We MUST include
  // this in the memoised context value so that <T> / useT() consumers
  // actually re-render and pick up the freshly cached translation —
  // otherwise translations sit in the cache forever and the user keeps
  // seeing the original Chinese source.
  const [dynVersion, bump] = useState(0);

  // Pending dynamic-translation queue (debounced batch).
  const dynQueueRef = useRef<Set<string>>(new Set());
  const dynTimerRef = useRef<number | null>(null);

  // Dev-only: start a DOM-wide scanner that warns when text in the wrong
  // script appears (catches hardcoded JSX strings that bypass <T>).
  // Uses a ref so the scanner always sees the *current* language even
  // though it's started exactly once.
  const langRef = useRef<LangCode>(lang);
  useEffect(() => { langRef.current = lang; }, [lang]);
  useEffect(() => {
    startDomLeakScanner(() => langRef.current);
  }, []);

  // Load catalog + dyn cache when language changes.
  useEffect(() => {
    const builtin = BUILTIN[lang];
    if (builtin) {
      setCatalog(builtin);
    } else {
      setCatalog(loadCachedCatalog(lang));
    }
    dynCacheRef.current = lang === "zh" ? {} : loadDynCache(lang);
  }, [lang]);

  // Fetch missing static-string translations from edge function.
  useEffect(() => {
    if (BUILTIN[lang]) return; // built-in catalog, no fetch needed
    const missingKeys = (Object.keys(EN) as StringKey[]).filter((k) => !catalog[k]);
    if (missingKeys.length === 0) return;
    let cancelled = false;
    (async () => {
      // Prefer the Chinese source when available: the AI is much less likely
      // to echo a Chinese string back unchanged when asked to translate into
      // (say) Punjabi or Spanish, which means our isUsableTranslation filter
      // doesn't end up discarding the result and falling back to raw English.
      const items = missingKeys.map((k) => ({
        key: k,
        text: (ZH as Record<string, string>)[k] || EN[k],
      }));
      const targetLanguage = getLanguageInfo(lang).englishName;
      try {
        const { data, error } = await invokeTranslateWithTimeout(targetLanguage, items);
        if (cancelled) return;
        if (error) {
          console.error("translate error", error);
          return;
        }
        const translations: Record<string, string> = data?.translations || {};
        const cleaned: Record<string, string> = {};
        for (const [k, v] of Object.entries(translations)) {
          if (typeof v === "string") cleaned[k] = stripHtml(v);
        }
        const merged: Catalog = { ...catalog, ...(cleaned as Catalog) };
        setCatalog(merged);
        saveCachedCatalog(lang, merged);
      } catch (e) {
        console.error("translate invoke failed", e);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const setLang = useCallback((l: LangCode) => {
    setLangState(l);
    try { localStorage.setItem(STORAGE_LANG, l); } catch { /* ignore */ }
  }, []);

  const markPicked = useCallback(() => {
    setHasPicked(true);
    try { localStorage.setItem(STORAGE_PICKED, "1"); } catch { /* ignore */ }
  }, []);

  const t = useCallback((key: StringKey, vars?: Record<string, string | number>) => {
    const tmpl = catalog[key] ?? EN[key] ?? key;
    return interpolate(tmpl, vars);
  }, [catalog]);

  const flushDynQueue = useCallback(async (l: LangCode) => {
    const toSend = Array.from(dynQueueRef.current);
    dynQueueRef.current.clear();
    if (toSend.length === 0) return;
    const targetLanguage = getLanguageInfo(l).englishName;
    // Use index keys so we keep mapping; truncate text to a sane length.
      const items = toSend.slice(0, 12).map((text, i) => ({ key: String(i), text }));
      const sent = toSend.slice(0, 12);
    try {
      const { data, error } = await invokeTranslateWithTimeout(targetLanguage, items);
      if (error) return;
      const translations: Record<string, string> = data?.translations || {};
      const next = { ...dynCacheRef.current };
      sent.forEach((src, i) => {
        const tr = translations[String(i)];
        if (isUsableTranslation(l, src, tr)) next[src] = stripHtml(tr);
      });
      dynCacheRef.current = next;
      saveDynCache(l, next);
      bump((x) => x + 1);
    } catch (e) {
      console.error("dyn translate failed", e);
    }
  }, []);

  const tDynamic = useCallback((text: string) => {
    if (!text) return text;
    // No translation needed if the user chose Chinese, which is the app's
    // original helper-language for lesson notes and hints.
    if (lang === "zh") return localizeProtagonist(text, lang);
    if (lang === "en" && !CJK_TEXT_RE.test(text)) return localizeProtagonist(text, lang);
    const cached = dynCacheRef.current[text];
    if (isUsableTranslation(lang, text, cached)) return localizeProtagonist(cached, lang);
    // Queue the request. Use a microtask-style 0ms timer so the *first*
    // render's strings ship in a single batch within the same tick — the
    // user perceives this as "instant" (only one network roundtrip per
    // page load instead of multiple debounced ones).
    dynQueueRef.current.add(text);
    if (dynTimerRef.current === null) {
      dynTimerRef.current = window.setTimeout(() => {
        dynTimerRef.current = null;
        flushDynQueue(lang);
      }, 0);
    }
    // If the queue is already big (e.g. a long lesson page just rendered),
    // flush immediately without waiting for the timer.
    if (dynQueueRef.current.size >= 24 && dynTimerRef.current !== null) {
      window.clearTimeout(dynTimerRef.current);
      dynTimerRef.current = null;
      // Fire and forget — flushDynQueue handles its own state.
      void flushDynQueue(lang);
    }
    // STRICT MODE: never show the original Chinese source to a user whose
    // mother-tongue is something else (e.g. Spanish, French). Showing the
    // raw source text would violate the rule "only English + the chosen
    // language may appear on screen". Instead we render a short placeholder
    // (an ellipsis) that will be swapped out the instant the translation
    // batch resolves a few hundred ms later. For English users with a
    // CJK source we also redact, since they shouldn't see Chinese either.
    if (CJK_TEXT_RE.test(text)) return localizeProtagonist(text, "en" as LangCode);
    // Source string contains no CJK — safe to show as-is while we wait
    // (e.g. an English helper string being translated into Spanish).
    return localizeProtagonist(text, lang);
  // dynVersion is intentionally a dep: when a translation batch resolves
  // we want every memoised consumer to recompute against the new cache.
  }, [lang, flushDynQueue, dynVersion]);

  const value = useMemo<I18nContextValue>(() => ({
    lang, setLang, hasPicked, markPicked, t, tDynamic,
  }), [lang, setLang, hasPicked, markPicked, t, tDynamic, dynVersion]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}