import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  DEFAULT_LANG,
  LANGUAGES,
  type LangCode,
  detectBrowserLang,
  getLanguageInfo,
} from "./languages";
import { BUILTIN, EN, type StringKey, interpolate } from "./strings";

const STORAGE_LANG = "fluentpath.lang";
const STORAGE_PICKED = "fluentpath.langPicked";
const STORAGE_CACHE_PREFIX = "fluentpath.i18n.v2.";

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
  if (lang === "zh") return false;
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
  if (lang !== "zh" && cleaned.trim() === stripHtml(source).trim()) return false;
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
    cleaned[k as StringKey] = stripHtml(v);
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
  // Re-render bump when dynamic translations land.
  const [, bump] = useState(0);

  // Pending dynamic-translation queue (debounced batch).
  const dynQueueRef = useRef<Set<string>>(new Set());
  const dynTimerRef = useRef<number | null>(null);

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
      const items = missingKeys.map((k) => ({ key: k, text: EN[k] }));
      const targetLanguage = getLanguageInfo(lang).englishName;
      try {
        const { data, error } = await supabase.functions.invoke("translate", {
          body: { targetLanguage, sourceLanguage: "English", items },
        });
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
    const items = toSend.map((text, i) => ({ key: String(i), text }));
    try {
      const { data, error } = await supabase.functions.invoke("translate", {
        body: { targetLanguage, items },
      });
      if (error) return;
      const translations: Record<string, string> = data?.translations || {};
      const next = { ...dynCacheRef.current };
      toSend.forEach((src, i) => {
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
    if (lang === "zh") return text;
    if (lang === "en" && !CJK_TEXT_RE.test(text)) return text;
    const cached = dynCacheRef.current[text];
    if (isUsableTranslation(lang, text, cached)) return cached;
    // Queue and debounce
    dynQueueRef.current.add(text);
    if (dynTimerRef.current) window.clearTimeout(dynTimerRef.current);
    dynTimerRef.current = window.setTimeout(() => {
      dynTimerRef.current = null;
      flushDynQueue(lang);
    }, 250);
    // Show source text while the translation is loading; it will swap to the
    // translated string as soon as the batch resolves. Returning "" here would
    // leave the UI blank, which is worse than a brief Chinese flash.
    return text;
  }, [lang, flushDynQueue]);

  const value = useMemo<I18nContextValue>(() => ({
    lang, setLang, hasPicked, markPicked, t, tDynamic,
  }), [lang, setLang, hasPicked, markPicked, t, tDynamic]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}