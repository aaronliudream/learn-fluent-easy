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
 * The `rate` argument is kept for backward compatibility with existing call
 * sites, but is effectively ignored — `speakKid` picks an age-appropriate
 * speed based on the learner's grade (stored in localStorage by the grade
 * picker). Calls passing rate ≤ 0.75 are interpreted as "extra slow" and
 * mapped to a grade-1 speed.
 */
import { speakKid } from "@/lib/speak";

export function hubSpeak(text: string, rate = 0.85) {
  if (typeof window === "undefined") return;
  // Map the legacy `rate` parameter onto a grade hint so existing call sites
  // that asked for an extra-slow read (e.g. listening-comprehension prompts
  // at 0.7) still sound noticeably slower.
  const gradeHint = rate <= 0.75 ? 1 : undefined;
  void speakKid(text, gradeHint ? { grade: gradeHint } : undefined);
}
