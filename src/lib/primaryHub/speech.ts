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

/** Normalize display text for cloud TTS (apostrophe tokens often fail silently). */
export function toHubTtsText(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return trimmed;
  if (/^o['']clock$/i.test(trimmed)) return "o clock";
  return trimmed;
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
