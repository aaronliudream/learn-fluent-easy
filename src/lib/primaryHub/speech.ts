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
import { speakFromUrl, speakKid } from "@/lib/speak";

/** Bundled Lily voice clip — bypasses CDN/localStorage for a word that often caches badly. */
const OCLOCK_STATIC_MP3 = "/audio/hub/oclock.mp3";

function isOClockVocabToken(text: string): boolean {
  const t = text.trim().toLowerCase();
  return t === "o'clock" || t === "oclock" || t === "oh clock" || t === "o clock";
}

/** ASCII + curly apostrophes that break or silence cloud TTS when sent verbatim. */
const APOSTROPHE_RE = /[''\u2019\u02BC\uFF07´`]/g;

/** Cloud TTS reads lone "o" as the letter; "oh clock" matches how kids say o'clock. */
function normalizeOClockPhrase(spoken: string): string {
  return spoken.replace(/\bo\s*clock\b/gi, "oh clock");
}

/** Normalize display text for cloud TTS (UI still shows the original string). */
export function toHubTtsText(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return trimmed;
  const lower = trimmed.toLowerCase();
  if (lower === "o'clock" || lower === "oclock") return "oh clock";
  const spoken = trimmed.replace(APOSTROPHE_RE, " ").replace(/\s+/g, " ").trim();
  return normalizeOClockPhrase(spoken);
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
