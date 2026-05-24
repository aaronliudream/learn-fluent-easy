/**
 * Lightweight English playback for primary hub stages.
 *
 * Default: `speakKid` → ElevenLabs Lily → Edge → CDN.
 * Exception: vocab token `o'clock` uses a bundled MP3 (see `public/audio/hub/oclock.mp3`).
 * Cloud TTS often splits "o'clock" into two beats; the asset was synthesized as the
 * single token "oclock" via OpenAI alloy — sounds like one word (/əˈklɒk/). UI still shows o'clock.
 */
import { prefetchTTSBatchKid, speakFromUrl, speakKid } from "@/lib/speak";

/** Bundled pronunciation for the lone vocab card `o'clock` only. */
export const OCLOCK_STATIC_MP3 = "/audio/hub/oclock.mp3";

/** Curly/smart apostrophes → ASCII U+0027 (display + TTS stay one word). */
const CURLY_APOSTROPHE_RE = /[\u2018\u2019\u201B\u2032]/g;

/**
 * Normalize only apostrophe *characters* for TTS/cache keys.
 * Does NOT remove apostrophes — o'clock must reach TTS as o'clock for /əˈklɒk/.
 */
export function toHubTtsText(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return trimmed;
  return trimmed.replace(CURLY_APOSTROPHE_RE, "'");
}

/** Vocab card for the word o'clock only (not sentences containing o'clock). */
export function isOClockVocabToken(text: string): boolean {
  const t = toHubTtsText(text).toLowerCase();
  return t === "o'clock";
}

/**
 * Screen label for tricky tokens (Windows fonts often render U+0027 as a gap → looks like "o clock").
 */
export function formatHubVocabDisplay(en: string): string {
  if (isOClockVocabToken(en)) return "o\u2019clock";
  return en;
}

function prefetchStaticMp3(path: string) {
  if (typeof window === "undefined") return;
  const url = path.startsWith("/") ? `${window.location.origin}${path}` : path;
  void fetch(url, { method: "GET" }).catch(() => {});
}

export function hubSpeak(text: string, rate = 0.85, grade?: number) {
  if (typeof window === "undefined") return;
  if (isOClockVocabToken(text)) {
    void speakFromUrl(OCLOCK_STATIC_MP3);
    return;
  }
  const gradeHint = rate <= 0.75 ? 1 : grade;
  const spoken = toHubTtsText(text);
  void speakKid(spoken, { grade: gradeHint, speed: rate });
}

/** Kid-voice playback with an explicit TTS speed (for unit sentence lessons). */
export function hubSpeakAtSpeed(text: string, speed: number, grade?: number) {
  if (typeof window === "undefined") return;
  void speakKid(toHubTtsText(text), { grade, speed });
}

/** Prefetch vocab audio — o'clock uses bundled MP3, other words via Lily. */
export function prefetchHubVocabulary(words: string[], grade: number, speed = 0.85) {
  const kidTexts: string[] = [];
  for (const w of words) {
    if (isOClockVocabToken(w)) {
      prefetchStaticMp3(OCLOCK_STATIC_MP3);
    } else {
      kidTexts.push(toHubTtsText(w));
    }
  }
  if (kidTexts.length) prefetchTTSBatchKid(kidTexts, { grade, speed });
}
