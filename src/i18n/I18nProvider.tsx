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
const STORAGE_CACHE_PREFIX = "fluentpath.i18n.";

type Catalog = Partial<Record<StringKey, string>>;

const CJK_TEXT_RE = /[\u3400-\u9fff\u3040-\u30ff\uac00-\ud7af]/;
const CJK_LANGS = new Set<LangCode>(["zh", "ja", "ko"]);

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
  return Boolean(value && !CJK_LANGS.has(lang) && CJK_TEXT_RE.test(value));
}

function sanitizeCachedCatalog(lang: LangCode, cat: Catalog): Catalog {
  const cleaned: Catalog = {};
  for (const [k, v] of Object.entries(cat)) {
    if (typeof v !== "string") continue;
    if (!CJK_LANGS.has(lang) && hasWrongScript(lang, v)) continue;
    cleaned[k as StringKey] = stripHtml(v);
  }
  return cleaned;
}

function sanitizeDynCache(lang: LangCode, cache: Record<string, string>) {
  const cleaned: Record<string, string> = {};
  for (const [k, v] of Object.entries(cache)) {
    if (typeof v !== "string") continue;
    if (!CJK_LANGS.has(lang) && hasWrongScript(lang, v)) continue;
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
    dynCacheRef.current = lang === "en" || lang === "zh" ? {} : loadDynCache(lang);
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
        body: { targetLanguage, sourceLanguage: "Chinese", items },
      });
      if (error) return;
      const translations: Record<string, string> = data?.translations || {};
      const next = { ...dynCacheRef.current };
      toSend.forEach((src, i) => {
        const tr = translations[String(i)];
        if (tr && !hasWrongScript(l, tr)) next[src] = stripHtml(tr);
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
    // No translation needed if user reads English or if app authored it in zh.
    // (We treat zh as the source for dynamic content because lessons/scenes are
    // currently authored with Chinese hints.)
    if (lang === "zh") return text;
    const cached = dynCacheRef.current[text];
    if (cached && !hasWrongScript(lang, cached)) return cached;
    // Queue and debounce
    dynQueueRef.current.add(text);
    if (dynTimerRef.current) window.clearTimeout(dynTimerRef.current);
    dynTimerRef.current = window.setTimeout(() => {
      dynTimerRef.current = null;
      flushDynQueue(lang);
    }, 250);
    // Never flash Chinese source text for non-Chinese users; the translated
    // string will appear as soon as the batch resolves.
    return "";
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