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
    return raw ? (JSON.parse(raw) as Catalog) : {};
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
    return raw ? JSON.parse(raw) : {};
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
        const merged: Catalog = { ...catalog, ...translations };
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
        if (tr) next[src] = tr;
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
    if (lang === "en") return text; // hint text stays as authored; English-only
                                    // users still see the English line above it.
    const cached = dynCacheRef.current[text];
    if (cached) return cached;
    // Queue and debounce
    dynQueueRef.current.add(text);
    if (dynTimerRef.current) window.clearTimeout(dynTimerRef.current);
    dynTimerRef.current = window.setTimeout(() => {
      dynTimerRef.current = null;
      flushDynQueue(lang);
    }, 250);
    // Return source for now; will re-render when batch resolves.
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