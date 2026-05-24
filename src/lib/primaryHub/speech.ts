/**
 * Lightweight English playback for primary hub stages.
 *
 * Routes through the cloud TTS pipeline (`speakKid` → ElevenLabs Lily → Edge
 * Function → Supabase Storage → Cloudflare CDN at audio.bigmooneducation.com).
 * The previous implementation used the browser's built-in `speechSynthesis`,
 * which produced inconsistent voices across devices, didn't work well in
 * mainland China (Chrome there often has no English voices installed), and
 * completely bypassed the CDN we set up.
 *
 * The `rate` argument sets TTS speed (default 0.85 for primary hub). Calls
 * with rate ≤ 0.75 also map grade hint to 1 for extra-slow kid voice.
 */
import { speakKid } from "@/lib/speak";

/** Hard-coded TTS text for the vocab token o'clock (never send the apostrophe to TTS/cache). */
export const OCLOCK_TTS_TEXT = "o clock";

/** ASCII + curly apostrophes that break or silence cloud TTS when sent verbatim. */
const APOSTROPHE_RE = /[''\u2019\u02BC\uFF07´`]/g;

function normalizeOClockPhrase(spoken: string): string {
  return spoken.replace(/\bo\s*clock\b/gi, OCLOCK_TTS_TEXT);
}

/** Normalize display text for cloud TTS (UI still shows the original string). */
export function toHubTtsText(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return trimmed;
  const lower = trimmed.toLowerCase();
  if (lower === "o'clock" || lower === "oclock") return OCLOCK_TTS_TEXT;
  const spoken = trimmed.replace(APOSTROPHE_RE, " ").replace(/\s+/g, " ").trim();
  return normalizeOClockPhrase(spoken);
}

export function hubSpeak(text: string, rate = 0.85, grade?: number) {
  if (typeof window === "undefined") return;
  const gradeHint = rate <= 0.75 ? 1 : grade;
  const spoken = toHubTtsText(text);
  void speakKid(spoken, { grade: gradeHint, speed: rate });
}

/** Kid-voice playback with an explicit TTS speed (for unit sentence lessons). */
export function hubSpeakAtSpeed(text: string, speed: number, grade?: number) {
  if (typeof window === "undefined") return;
  void speakKid(toHubTtsText(text), { grade, speed });
}
