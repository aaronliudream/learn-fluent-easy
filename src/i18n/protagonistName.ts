// Localized display name for the protagonist (originally "Mei / 梅").
//
// We do NOT modify the underlying lesson data (which still uses "Mei" so that
// fill-in-the-blank answers, audio scripts, OpenAI TTS, and existing user
// progress all keep working). Instead, every UI string that flows through
// <T> / tDynamic is post-processed to swap "Mei" / "梅" for a name that
// fits the user's chosen interface language — keeping the "young woman who
// just arrived in California" vibe intact across cultures.

import type { LangCode } from "./languages";

// One feminine given name per supported UI language. Pick names that read
// natural in the user's mother tongue and feel like a peer to the original
// character (early-20s student abroad).
const NAME_BY_LANG: Record<LangCode, { latin: string; native?: string }> = {
  en:  { latin: "Mei" },
  zh:  { latin: "Mei",     native: "梅" },
  es:  { latin: "Lucía" },
  hi:  { latin: "Aanya",   native: "आन्या" },
  ar:  { latin: "Layla",   native: "ليلى" },
  pt:  { latin: "Sofia" },
  ru:  { latin: "Anya",    native: "Аня" },
  ja:  { latin: "Misaki",  native: "美咲" },
  pa:  { latin: "Simran",  native: "ਸਿਮਰਨ" },
  de:  { latin: "Mia" },
  jv:  { latin: "Ayu" },
  ko:  { latin: "Jimin",   native: "지민" },
  fr:  { latin: "Camille" },
  tr:  { latin: "Elif" },
  vi:  { latin: "Linh" },
  it:  { latin: "Sofia" },
  th:  { latin: "Ploy",    native: "พลอย" },
  fa:  { latin: "Sara",    native: "سارا" },
  pl:  { latin: "Zosia" },
  nl:  { latin: "Sanne" },
  uk:  { latin: "Olia",    native: "Оля" },
  id:  { latin: "Sari" },
  ms:  { latin: "Aisyah" },
  ro:  { latin: "Ioana" },
  el:  { latin: "Eleni",   native: "Ελένη" },
  cs:  { latin: "Tereza" },
  sv:  { latin: "Elsa" },
  hu:  { latin: "Réka" },
  he:  { latin: "Maya",    native: "מאיה" },
  fil: { latin: "Maria" },
  bn:  { latin: "Anika",   native: "অনিকা" },
};

export function getProtagonistName(lang: LangCode): { latin: string; native: string } {
  const entry = NAME_BY_LANG[lang] ?? NAME_BY_LANG.en;
  return { latin: entry.latin, native: entry.native ?? entry.latin };
}

// Word-boundary replace for the Latin form "Mei" (handles "Mei", "Mei's",
// "Mei,", "Mei!" etc.). We only treat it as the protagonist when it appears
// as a whole word — never as a substring of another token.
const MEI_LATIN_RE = /\bMei\b/g;
// In Chinese the character 梅 also means "plum" / shows up in surnames, but
// inside this app's content it almost exclusively refers to the protagonist
// (see lessonSamples / aiLessons / course). Replacing every occurrence is
// the safer trade-off for end-user experience.
const MEI_HAN_RE = /梅/g;

/**
 * Replace every occurrence of the protagonist name in `text` with the
 * culturally-appropriate name for `lang`. No-ops when the chosen language
 * keeps the original "Mei" (English / Chinese display).
 */
export function localizeProtagonist(text: string, lang: LangCode): string {
  if (!text) return text;
  const { latin, native } = getProtagonistName(lang);
  let out = text;
  if (latin !== "Mei") {
    out = out.replace(MEI_LATIN_RE, latin);
  }
  if (lang === "zh") {
    // Keep 梅 as-is for Chinese UI users.
    return out;
  }
  if (native && native !== "梅") {
    out = out.replace(MEI_HAN_RE, native);
  } else if (latin !== "梅") {
    out = out.replace(MEI_HAN_RE, latin);
  }
  return out;
}
