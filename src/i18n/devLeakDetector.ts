/**
 * Dev-only "language leak" detector.
 *
 * Goal: make it loud when a component renders text in the *wrong* script
 * for the currently-selected UI language. Two layers:
 *
 *   1. `reportRenderedText(text, lang)` — call from <T> with every string
 *      the i18n layer hands to React. If the rendered text contains
 *      characters that are clearly wrong for the active language, log.
 *
 *   2. `startDomLeakScanner(getLang)` — observes document.body and walks
 *      newly-added text nodes. Catches strings that bypassed <T> entirely
 *      (hardcoded JSX text like `开始测试` or `Start test`).
 *
 * Both no-op in production builds. Each unique offending string is only
 * warned about once per session to keep the console readable.
 */
import type { LangCode } from "./languages";

const isDev = typeof import.meta !== "undefined" && (import.meta as any).env?.DEV;

const CJK_RE  = /[\u3400-\u9fff\u3040-\u30ff\uac00-\ud7af]/;
const HAN_RE  = /[\u3400-\u9fff]/;
const KANA_RE = /[\u3040-\u30ff]/;
const HANGUL_RE = /[\uac00-\ud7af]/;
// "Looks like an English sentence" — at least one ASCII letter run of 4+ chars.
// We use this only to flag English leaking into a non-English UI; we never
// flag short tokens like "OK", "AI", proper nouns, etc.
const ENGLISH_SENTENCE_RE = /[A-Za-z]{4,}.*[A-Za-z]/;

const seen = new Set<string>();

function shouldFlag(lang: LangCode, text: string): null | string {
  const t = text.trim();
  if (!t || t.length < 2) return null;
  // Numbers / punctuation only — never flag.
  if (!/[A-Za-z\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]/.test(t)) return null;

  switch (lang) {
    case "zh":
    case "zh-TW":
      // Chinese UI: any text is fine (English mixed in is normal here).
      return null;
    case "ja":
      // Japanese legitimately uses Han + Kana. Flag pure-Han strings only
      // when long enough to be a sentence — those are usually leaked Chinese.
      if (HAN_RE.test(t) && !KANA_RE.test(t) && t.length >= 4) {
        return "looks like Chinese leaked into a Japanese UI";
      }
      return null;
    case "ko":
      if (HAN_RE.test(t) && !HANGUL_RE.test(t) && t.length >= 4) {
        return "looks like Chinese leaked into a Korean UI";
      }
      return null;
    case "en":
      if (CJK_RE.test(t)) return "CJK characters leaked into the English UI";
      return null;
    default:
      // Any other Latin / Cyrillic language: CJK is always wrong, and a
      // long English sentence is also a leak (the user picked, say, French).
      if (CJK_RE.test(t)) return `CJK characters leaked into the ${lang} UI`;
      if (ENGLISH_SENTENCE_RE.test(t) && !/[^\x00-\x7f]/.test(t)) {
        return `untranslated English sentence in the ${lang} UI`;
      }
      return null;
  }
}

function warnOnce(text: string, lang: LangCode, reason: string, source: string) {
  const key = `${lang}::${source}::${text.slice(0, 80)}`;
  if (seen.has(key)) return;
  seen.add(key);
  // eslint-disable-next-line no-console
  console.warn(
    `[i18n-leak] ${reason} (lang="${lang}", via=${source}):`,
    JSON.stringify(text.length > 120 ? text.slice(0, 120) + "…" : text),
  );
}

/** Called by <T> for every string the i18n layer renders. */
export function reportRenderedText(text: string | undefined | null, lang: LangCode) {
  if (!isDev || !text) return;
  const reason = shouldFlag(lang, String(text));
  if (reason) warnOnce(String(text), lang, reason, "<T>");
}

let scannerStarted = false;

/**
 * Start a MutationObserver that walks newly-added text nodes and flags
 * leaks. Catches hardcoded JSX strings that never go through <T>.
 * Idempotent — safe to call from React strict mode double-effects.
 */
export function startDomLeakScanner(getLang: () => LangCode) {
  if (!isDev || scannerStarted || typeof window === "undefined") return;
  scannerStarted = true;

  const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE", "TEXTAREA", "INPUT"]);

  const inspect = (node: Node) => {
    if (node.nodeType !== Node.TEXT_NODE) return;
    const parent = node.parentElement;
    if (!parent) return;
    if (SKIP_TAGS.has(parent.tagName)) return;
    if (parent.closest("[data-i18n-skip]")) return;
    const text = node.textContent;
    if (!text) return;
    const lang = getLang();
    const reason = shouldFlag(lang, text);
    if (reason) warnOnce(text, lang, reason, "DOM");
  };

  const walk = (root: Node) => {
    if (root.nodeType === Node.TEXT_NODE) {
      inspect(root);
      return;
    }
    if (root.nodeType !== Node.ELEMENT_NODE) return;
    const el = root as Element;
    if (SKIP_TAGS.has(el.tagName)) return;
    const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let n: Node | null;
    while ((n = tw.nextNode())) inspect(n);
  };

  // Initial sweep.
  if (document.body) walk(document.body);

  const obs = new MutationObserver((muts) => {
    for (const m of muts) {
      m.addedNodes.forEach(walk);
      if (m.type === "characterData" && m.target) inspect(m.target);
    }
  });
  obs.observe(document.body, { subtree: true, childList: true, characterData: true });
}
