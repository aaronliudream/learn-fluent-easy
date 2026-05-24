/**
 * Primary / Junior / Gaokao hub English playback.
 *
 * Default: cloud TTS (`speakKid` → Lily).
 * Exception: lone vocab token `o'clock` → Web Speech API (browser handles apostrophe).
 * Apostrophe normalization only (U+2019 → U+0027); never strip apostrophes.
 */
import { prefetchTTSBatchKid, speakKid, stopSpeaking } from "@/lib/speak";
import { isWebSpeechSupported, speakWebSpeech } from "@/lib/webSpeech";

/** Curly/smart apostrophes → ASCII U+0027 (display + TTS stay one word). */
const CURLY_APOSTROPHE_RE = /[\u2018\u2019\u201B\u2032]/g;

/**
 * Normalize only apostrophe *characters* for TTS.
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

/** Screen label passthrough; tight rendering uses `OClockVocabLabel`. */
export function formatHubVocabDisplay(en: string): string {
  return en;
}

function hubSpeakCloud(text: string, rate: number, grade?: number) {
  const gradeHint = rate <= 0.75 ? 1 : grade;
  void speakKid(text, { grade: gradeHint, speed: rate });
}

/** Hub TTS — Web Speech only for vocab `o'clock`; everything else uses cloud TTS. */
export function hubSpeak(text: string, rate = 0.85, grade?: number) {
  if (typeof window === "undefined") return;
  const spoken = toHubTtsText(text);
  stopSpeaking();

  if (isOClockVocabToken(text)) {
    if (!isWebSpeechSupported()) {
      hubSpeakCloud(spoken, rate, grade);
      return;
    }
    void speakWebSpeech(spoken, rate).then((ok) => {
      if (!ok) hubSpeakCloud(spoken, rate, grade);
    });
    return;
  }

  hubSpeakCloud(spoken, rate, grade);
}

/** Kid-voice playback with explicit speed (sentence lessons + speed control). */
export function hubSpeakAtSpeed(text: string, speed: number, grade?: number) {
  hubSpeak(text, speed, grade);
}

/** Prefetch cloud audio for all words except `o'clock` when Web Speech handles it. */
export function prefetchHubVocabulary(words: string[], grade: number, speed = 0.85) {
  const kidTexts: string[] = [];
  for (const w of words) {
    if (isOClockVocabToken(w) && isWebSpeechSupported()) continue;
    kidTexts.push(toHubTtsText(w));
  }
  if (kidTexts.length) prefetchTTSBatchKid(kidTexts, { grade, speed });
}
