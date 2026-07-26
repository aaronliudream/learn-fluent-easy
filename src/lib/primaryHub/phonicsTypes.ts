/** Default CDN/public path for unit phonics MP3 assets. */
export function defaultPhonicsAudioBase(unitId: string): string {
  return `/audio/primary/phonics/${unitId}`;
}

/** Stage 1 — listen and recognize the target sound. */
export type PhonicsListenItem = {
  word: string;
  zh: string;
  emoji: string;
  /**
   * Filename of a REAL recorded MP3, relative to {@link PhonicsConfig.audioBase}.
   * Optional and opt-in: set it only when the file actually exists under `public/`.
   * Omit it (the default) and the word is spoken by the shared kid-voice TTS.
   *
   * WHY optional: a filename pointing at a missing file used to be indistinguishable
   * from a real one at runtime — the SPA rewrite answered 200 + index.html, so
   * `new Audio()` silently failed to decode before falling back. Declaring audio
   * only when the asset is committed keeps that failure mode impossible.
   */
  audio?: string;
};

/** Stage 2 — pick words that contain the unit's phonics pattern. */
export type PhonicsFindItem = {
  word: string;
  /** Whether the word contains this unit's {@link PhonicsConfig.phonics_rule}. */
  matchesRule: boolean;
};

/** Stage 3 — fill-in-the-blank with options. */
export type PhonicsChallengeItem = {
  image: string;
  sentence: string;
  hint: string;
  options: string[];
  /** Index into `options` for the correct answer. */
  correct: number;
};

export type PhonicsConfig = {
  unitId: string;
  semesterId: string;
  title: string;
  /**
   * Grapheme / pattern taught in this unit (e.g. er, ir, or, ar, ur, ch, sh).
   * Common PEP patterns include R-controlled vowels and vowel teams; stored as
   * plain string so new rules do not require type updates.
   */
  phonics_rule: string;
  phonics_sound: string;
  rule_explanation: string;
  /** Base URL/path for stage audio files; see {@link defaultPhonicsAudioBase}. */
  audioBase: string;
  stage_1_listen: PhonicsListenItem[];
  stage_2_find: PhonicsFindItem[];
  stage_3_challenge: PhonicsChallengeItem[];
};

export function isPhonicsConfig(value: unknown): value is PhonicsConfig {
  if (!value || typeof value !== "object") return false;
  const v = value as PhonicsConfig;
  return (
    typeof v.unitId === "string" &&
    typeof v.semesterId === "string" &&
    typeof v.title === "string" &&
    typeof v.phonics_rule === "string" &&
    typeof v.phonics_sound === "string" &&
    typeof v.rule_explanation === "string" &&
    typeof v.audioBase === "string" &&
    Array.isArray(v.stage_1_listen) &&
    Array.isArray(v.stage_2_find) &&
    Array.isArray(v.stage_3_challenge)
  );
}
