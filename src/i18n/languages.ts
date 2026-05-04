// 30 languages by global speakers. `code` is BCP-47-ish; `englishName` is the
// language's English name (used for prompting the translator); `nativeName` is
// what we show in the picker.
export type LangCode =
  | "en" | "zh" | "zh-TW" | "es" | "hi" | "ar" | "pt" | "ru" | "ja" | "pa" | "de"
  | "jv" | "ko" | "fr" | "tr" | "vi" | "it" | "th" | "fa" | "pl" | "nl"
  | "uk" | "id" | "ms" | "ro" | "el" | "cs" | "sv" | "hu" | "he" | "fil" | "bn";

export type LanguageInfo = {
  code: LangCode;
  englishName: string;
  nativeName: string;
  flag: string; // emoji flag
};

// English is always available as the second language alongside the user's
// mother tongue. The picker hides English (everyone gets it).
export const LANGUAGES: LanguageInfo[] = [
  { code: "en",  englishName: "English",         nativeName: "English",     flag: "🇺🇸" },
  { code: "zh",  englishName: "Simplified Chinese",  nativeName: "中文（简体）", flag: "🇨🇳" },
  { code: "zh-TW", englishName: "Traditional Chinese", nativeName: "中文（繁體）", flag: "🇹🇼" },
  { code: "es",  englishName: "Spanish",         nativeName: "Español",     flag: "🇪🇸" },
  { code: "hi",  englishName: "Hindi",           nativeName: "हिन्दी",        flag: "🇮🇳" },
  { code: "ar",  englishName: "Arabic",          nativeName: "العربية",      flag: "🇸🇦" },
  { code: "pt",  englishName: "Portuguese",      nativeName: "Português",   flag: "🇵🇹" },
  { code: "ru",  englishName: "Russian",         nativeName: "Русский",     flag: "🇷🇺" },
  { code: "ja",  englishName: "Japanese",        nativeName: "日本語",        flag: "🇯🇵" },
  { code: "pa",  englishName: "Punjabi",         nativeName: "ਪੰਜਾਬੀ",       flag: "🇮🇳" },
  { code: "de",  englishName: "German",          nativeName: "Deutsch",     flag: "🇩🇪" },
  { code: "jv",  englishName: "Javanese",        nativeName: "Basa Jawa",   flag: "🇮🇩" },
  { code: "ko",  englishName: "Korean",          nativeName: "한국어",        flag: "🇰🇷" },
  { code: "fr",  englishName: "French",          nativeName: "Français",    flag: "🇫🇷" },
  { code: "tr",  englishName: "Turkish",         nativeName: "Türkçe",      flag: "🇹🇷" },
  { code: "vi",  englishName: "Vietnamese",      nativeName: "Tiếng Việt",  flag: "🇻🇳" },
  { code: "it",  englishName: "Italian",         nativeName: "Italiano",    flag: "🇮🇹" },
  { code: "th",  englishName: "Thai",            nativeName: "ไทย",          flag: "🇹🇭" },
  { code: "fa",  englishName: "Persian",         nativeName: "فارسی",        flag: "🇮🇷" },
  { code: "pl",  englishName: "Polish",          nativeName: "Polski",      flag: "🇵🇱" },
  { code: "nl",  englishName: "Dutch",           nativeName: "Nederlands",  flag: "🇳🇱" },
  { code: "uk",  englishName: "Ukrainian",       nativeName: "Українська",  flag: "🇺🇦" },
  { code: "id",  englishName: "Indonesian",      nativeName: "Bahasa Indonesia", flag: "🇮🇩" },
  { code: "ms",  englishName: "Malay",           nativeName: "Bahasa Melayu",    flag: "🇲🇾" },
  { code: "ro",  englishName: "Romanian",        nativeName: "Română",      flag: "🇷🇴" },
  { code: "el",  englishName: "Greek",           nativeName: "Ελληνικά",    flag: "🇬🇷" },
  { code: "cs",  englishName: "Czech",           nativeName: "Čeština",     flag: "🇨🇿" },
  { code: "sv",  englishName: "Swedish",         nativeName: "Svenska",     flag: "🇸🇪" },
  { code: "hu",  englishName: "Hungarian",       nativeName: "Magyar",      flag: "🇭🇺" },
  { code: "he",  englishName: "Hebrew",          nativeName: "עברית",        flag: "🇮🇱" },
  { code: "fil", englishName: "Filipino",        nativeName: "Filipino",    flag: "🇵🇭" },
  { code: "bn",  englishName: "Bengali",         nativeName: "বাংলা",        flag: "🇧🇩" },
];

export const DEFAULT_LANG: LangCode = "en";

export function detectBrowserLang(): LangCode {
  if (typeof navigator === "undefined") return DEFAULT_LANG;
  const cands = [navigator.language, ...(navigator.languages || [])].filter(Boolean);
  for (const raw of cands) {
    const lower = raw.toLowerCase();
    const base = lower.split("-")[0];
    // special cases
    if (lower.startsWith("zh")) {
      // Traditional Chinese locales: zh-TW (Taiwan), zh-HK (Hong Kong),
      // zh-MO (Macau), zh-Hant (script tag).
      if (/^zh-(tw|hk|mo|hant)/.test(lower)) return "zh-TW";
      return "zh";
    }
    if (lower.startsWith("fil") || lower.startsWith("tl")) return "fil";
    const hit = LANGUAGES.find((l) => l.code === base);
    if (hit) return hit.code;
  }
  return DEFAULT_LANG;
}

export function getLanguageInfo(code: LangCode): LanguageInfo {
  return LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];
}