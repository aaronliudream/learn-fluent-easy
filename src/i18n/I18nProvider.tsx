import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  DEFAULT_LANG,
  LANGUAGES,
  type LangCode,
  getLanguageInfo,
} from "./languages";
import { BUILTIN, EN, ZH, type StringKey, interpolate } from "./strings";
import { localizeProtagonist } from "./protagonistName";

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

// =====================================================
// Bilingual EN-translation observability
// Lightweight in-memory metrics for the EN-side translation pipeline.
// Logged to console every 30s and exposed via window.__i18nEnStats() so
// you can call it from the dev console at any time.
// =====================================================
const enStats = {
  hits: 0,            // dyn cache hit
  misses: 0,          // queued for translation
  requests: 0,        // edge-function calls
  translated: 0,      // successful items returned
  errors: 0,
  totalMs: 0,         // accumulated request latency
  lastFlushAt: 0,
};
function logEnStats(reason: string) {
  const total = enStats.hits + enStats.misses;
  const hitRate = total ? ((enStats.hits / total) * 100).toFixed(1) : "0.0";
  const avgMs = enStats.requests ? Math.round(enStats.totalMs / enStats.requests) : 0;
  console.info(
    `[i18n.en] ${reason} hits=${enStats.hits} misses=${enStats.misses} ` +
    `hitRate=${hitRate}% requests=${enStats.requests} translated=${enStats.translated} ` +
    `errors=${enStats.errors} avgMs=${avgMs}`,
  );
}
if (typeof window !== "undefined") {
  // @ts-expect-error dev hook
  window.__i18nEnStats = () => ({ ...enStats });
  // Periodic snapshot every 30s if there was activity since last log.
  setInterval(() => {
    if (enStats.hits + enStats.misses === enStats.lastFlushAt) return;
    logEnStats("snapshot");
    enStats.lastFlushAt = enStats.hits + enStats.misses;
  }, 30000);
}

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
  /** English version of a static key (for bilingual display). */
  tEn: (key: StringKey, vars?: Record<string, string | number>) => string;
  /** English translation of an arbitrary source text. Async — returns
   *  empty string for one tick if not yet cached, then re-renders. */
  tDynamicEn: (text: string) => string;
  /** Chinese version of a static key (for fixed bilingual zh/EN display). */
  tZh: (key: StringKey, vars?: Record<string, string | number>) => string;
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

function isSupportedLang(value: unknown): value is LangCode {
  return typeof value === "string" && LANGUAGES.some((l) => l.code === value);
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
    return DEFAULT_LANG;
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
  // Separate cache for English translations (used by bilingual UI when the
  // user's chosen language is not English). Keyed by source string.
  const dynEnCacheRef = useRef<Record<string, string>>({});
  // Bumped whenever a batch of dynamic translations lands. We MUST include
  // this in the memoised context value so that <T> / useT() consumers
  // actually re-render and pick up the freshly cached translation —
  // otherwise translations sit in the cache forever and the user keeps
  // seeing the original Chinese source.
  const [dynVersion, bump] = useState(0);

  // Pending dynamic-translation queue (debounced batch).
  const dynQueueRef = useRef<Set<string>>(new Set());
  const dynTimerRef = useRef<number | null>(null);
  const dynEnQueueRef = useRef<Set<string>>(new Set());
  const dynEnTimerRef = useRef<number | null>(null);
  const lastManualLangAtRef = useRef(0);

  // Load catalog + dyn cache when language changes.
  useEffect(() => {
    const builtin = BUILTIN[lang];
    if (builtin) {
      setCatalog(builtin);
    } else {
      setCatalog(loadCachedCatalog(lang));
    }
    dynCacheRef.current = lang === "zh" ? {} : loadDynCache(lang);
    dynEnCacheRef.current = loadDynCache("en" as LangCode);
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
    lastManualLangAtRef.current = Date.now();
    setLangState(l);
    try { localStorage.setItem(STORAGE_LANG, l); } catch { /* ignore */ }
    supabase.auth.getUser().then(({ data }) => {
      const uid = data.user?.id;
      if (!uid) return;
      return supabase.from("profiles").update({ preferred_language: l } as never).eq("user_id", uid);
    }).catch(() => { /* best-effort sync */ });
  }, []);

  useEffect(() => {
    let cancelled = false;
    const syncProfileLanguage = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user?.id;
      if (!uid || cancelled) return;
      const { data } = await supabase
        .from("profiles")
        .select("preferred_language")
        .eq("user_id", uid)
        .maybeSingle();
      const profileLang = (data as any)?.preferred_language;
      if (isSupportedLang(profileLang) && profileLang !== lang) {
        if (Date.now() - lastManualLangAtRef.current < 5000) {
          await supabase.from("profiles").update({ preferred_language: lang } as never).eq("user_id", uid);
          return;
        }
        setLangState(profileLang);
        try { localStorage.setItem(STORAGE_LANG, profileLang); } catch { /* ignore */ }
      } else if (!profileLang && lang) {
        await supabase.from("profiles").update({ preferred_language: lang } as never).eq("user_id", uid);
      }
    };
    void syncProfileLanguage();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      void syncProfileLanguage();
    });
    return () => { cancelled = true; subscription.unsubscribe(); };
  }, [lang]);

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

  // Flush English-translation queue (for bilingual mode).
  const flushDynEnQueue = useCallback(async () => {
    const toSend = Array.from(dynEnQueueRef.current);
    dynEnQueueRef.current.clear();
    if (toSend.length === 0) return;
    const items = toSend.slice(0, 12).map((text, i) => ({ key: String(i), text }));
    const sent = toSend.slice(0, 12);
    enStats.requests += 1;
    const startedAt = performance.now();
    try {
      const { data, error } = await invokeTranslateWithTimeout("English", items);
      enStats.totalMs += performance.now() - startedAt;
      if (error) { enStats.errors += 1; return; }
      const translations: Record<string, string> = data?.translations || {};
      const next = { ...dynEnCacheRef.current };
      sent.forEach((src, i) => {
        const tr = translations[String(i)];
        if (typeof tr === "string" && tr.trim()) {
          next[src] = stripHtml(tr);
          enStats.translated += 1;
        }
      });
      dynEnCacheRef.current = next;
      saveDynCache("en" as LangCode, next);
      bump((x) => x + 1);
    } catch (e) {
      enStats.errors += 1;
      console.error("dyn en translate failed", e);
    }
  }, []);

  const tDynamic = useCallback((text: string) => {
    if (!text) return text;
    // No translation needed if the user chose Chinese, which is the app's
    // original helper-language for lesson notes and hints.
    if (lang === "zh") return localizeProtagonist(text, lang);
    // For English (and every other non-Chinese language): if the source text
    // contains CJK characters we MUST translate it. Previously English users
    // saw raw Chinese on the home page (e.g. "今天已经开练了") because we
    // short-circuited here.
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
    // For distant networks, never block the UI on AI translation. If the
    // source is Chinese, show a readable fallback immediately and swap in the
    // chosen-language translation only if it arrives quickly.
    // Source contains CJK and we don't have a translation yet. Showing the
    // raw Chinese to a non-Chinese user is the bug we're fixing — return an
    // empty string so the UI shows nothing for one tick instead of leaking
    // Chinese. The component re-renders as soon as the translation lands
    // (dynVersion bumps).
    if (CJK_TEXT_RE.test(text)) return "";
    // Source string contains no CJK — safe to show as-is while we wait
    // (e.g. an English helper string being translated into Spanish).
    return localizeProtagonist(text, lang);
  // dynVersion is intentionally a dep: when a translation batch resolves
  // we want every memoised consumer to recompute against the new cache.
  }, [lang, flushDynQueue, dynVersion]);

  const tEn = useCallback((key: StringKey, vars?: Record<string, string | number>) => {
    const tmpl = EN[key] ?? key;
    return interpolate(tmpl, vars);
  }, []);

  const tZh = useCallback((key: StringKey, vars?: Record<string, string | number>) => {
    const tmpl = ZH[key] ?? EN[key] ?? key;
    return interpolate(tmpl, vars);
  }, []);

  const tDynamicEn = useCallback((text: string) => {
    if (!text) return text;
    // Source already English (no CJK) → just return it.
    if (!CJK_TEXT_RE.test(text)) return localizeProtagonist(text, "en" as LangCode);
    const cached = dynEnCacheRef.current[text];
    if (cached) { enStats.hits += 1; return localizeProtagonist(cached, "en" as LangCode); }
    enStats.misses += 1;
    dynEnQueueRef.current.add(text);
    if (dynEnTimerRef.current === null) {
      dynEnTimerRef.current = window.setTimeout(() => {
        dynEnTimerRef.current = null;
        flushDynEnQueue();
      }, 0);
    }
    if (dynEnQueueRef.current.size >= 24 && dynEnTimerRef.current !== null) {
      window.clearTimeout(dynEnTimerRef.current);
      dynEnTimerRef.current = null;
      void flushDynEnQueue();
    }
    return "";
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flushDynEnQueue, dynVersion]);

  const value = useMemo<I18nContextValue>(() => ({
    lang, setLang, hasPicked, markPicked, t, tDynamic, tEn, tDynamicEn, tZh,
  }), [lang, setLang, hasPicked, markPicked, t, tDynamic, tEn, tDynamicEn, tZh, dynVersion]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}