/**
 * Primary / Junior / Gaokao hub English playback.
 *
 * Default: cloud TTS (`speakKid` → Lily).
 * Exception: lone vocab token `o'clock` → Web Speech API (browser handles apostrophe).
 * Apostrophe normalization only (U+2019 → U+0027); never strip apostrophes.
 */
import { prefetchTTSBatchKid, speakKid, stopSpeaking } from "@/lib/speak";
import { isWebSpeechSupported, speakWebSpeech } from "@/lib/webSpeech";
import { HUB_FIXED_SPEAK_SPEED } from "@/lib/primaryHub/hubSpeakSpeed";

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
export function hubSpeak(text: string, rate = HUB_FIXED_SPEAK_SPEED, grade?: number) {
  if (typeof window === "undefined") return;
  const spoken = toHubTtsText(text);
  // 去重已下沉到 speak.ts 的 inflightCold(同词并发只合成一次;冷窗口内的点击不再被丢弃,
  // 而是复用同一合成、在本次手势上下文里播放 → 最新一次点击胜出)。此处直接停旧再播即可。
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
export function prefetchHubVocabulary(
  words: string[],
  grade: number,
  speed = HUB_FIXED_SPEAK_SPEED,
) {
  const kidTexts: string[] = [];
  for (const w of words) {
    if (isOClockVocabToken(w) && isWebSpeechSupported()) continue;
    kidTexts.push(toHubTtsText(w));
  }
  if (kidTexts.length) prefetchTTSBatchKid(kidTexts, { grade, speed });
}

/**
 * 固定档模块的预热入口：句子/短语类文本（句型对话、拼读词、情景关整句…）。
 *
 * 与 `hubSpeak` 的默认 rate 同源（`HUB_FIXED_SPEAK_SPEED`），所以预热出来的 key
 * 与播放时算出的 key 必然一致。**不要**改回 `prefetchTTSBatchKid(texts, { grade })`：
 * 那样 speed 会落到 `getKidSpeed(grade)`，四~六年级变成 1.0，预热全部作废（C2-1 / C2-2）。
 */
export function prefetchHubFixed(texts: string[], grade: number) {
  const kidTexts: string[] = [];
  for (const t of texts) {
    if (!t) continue;
    if (isOClockVocabToken(t) && isWebSpeechSupported()) continue;
    kidTexts.push(toHubTtsText(t));
  }
  if (kidTexts.length) {
    prefetchTTSBatchKid(kidTexts, { grade, speed: HUB_FIXED_SPEAK_SPEED });
  }
}
