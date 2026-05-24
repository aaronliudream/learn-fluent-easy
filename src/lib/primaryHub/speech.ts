/**
 * Lightweight English playback for primary hub stages.
 *
 * Default: `speakKid` → ElevenLabs Lily → Edge → CDN.
 * Exception: vocab token `o'clock` uses OpenAI (ChatGPT TTS) — Lily often splits it
 * into two words; gpt-4o-mini-tts reads it as one word (/əˈklɒk/).
 */
import { prefetchTTS, prefetchTTSBatchKid, speak, speakKid } from "@/lib/speak";

/** OpenAI voice for the lone vocab card `o'clock` (edge uses gpt-4o-mini-tts). */
export const OCLOCK_OPENAI_VOICE = "shimmer";

/** Curly/smart apostrophes → ASCII U+0027 (display + TTS stay one word). */
const CURLY_APOSTROPHE_RE = /[\u2018\u2019\u201B\u2032]/g;

/**
 * Normalize only apostrophe *characters* for TTS/cache keys.
 * Does NOT remove apostrophes — o'clock must reach TTS as o'clock.
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

export function hubSpeak(text: string, rate = 0.85, grade?: number) {
  if (typeof window === "undefined") return;
  const spoken = toHubTtsText(text);
  if (isOClockVocabToken(text)) {
    void speak(spoken, { voiceId: OCLOCK_OPENAI_VOICE, speed: rate, accent: "US" });
    return;
  }
  const gradeHint = rate <= 0.75 ? 1 : grade;
  void speakKid(spoken, { grade: gradeHint, speed: rate });
}

/** Kid-voice playback with an explicit TTS speed (for unit sentence lessons). */
export function hubSpeakAtSpeed(text: string, speed: number, grade?: number) {
  if (typeof window === "undefined") return;
  void speakKid(toHubTtsText(text), { grade, speed });
}

/** Prefetch vocab audio — o'clock via OpenAI, other words via Lily. */
export function prefetchHubVocabulary(words: string[], grade: number, speed = 0.85) {
  const kidTexts: string[] = [];
  for (const w of words) {
    const spoken = toHubTtsText(w);
    if (isOClockVocabToken(w)) {
      prefetchTTS(spoken, { voiceId: OCLOCK_OPENAI_VOICE, speed, accent: "US" });
    } else {
      kidTexts.push(spoken);
    }
  }
  if (kidTexts.length) prefetchTTSBatchKid(kidTexts, { grade, speed });
}
