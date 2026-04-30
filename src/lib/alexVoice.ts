// Picks a stable, random voice for "Alex" (the AI Talk partner) so each
// user gets a personalized buddy without ever being asked to choose. We
// rotate across the 6 OpenAI TTS voice IDs (3 female + 3 male). The
// chosen voice is cached in localStorage so the same user keeps the same
// Alex across sessions (avoids a jarring voice swap mid-learning).
//
// NOTE: When Alex's voice is male, the on-screen name is still "Alex" —
// it's a unisex name in California, which fits both presentations.

const KEY = "alexVoice.v1";

const FEMALE_VOICES = ["nova", "shimmer", "alloy"] as const;
const MALE_VOICES = ["echo", "onyx", "fable"] as const;
const ALL_VOICES = [...FEMALE_VOICES, ...MALE_VOICES] as const;

export type AlexVoiceId = (typeof ALL_VOICES)[number];

function isAlexVoice(v: unknown): v is AlexVoiceId {
  return typeof v === "string" && (ALL_VOICES as readonly string[]).includes(v);
}

export function getAlexVoice(): AlexVoiceId {
  try {
    const cached = localStorage.getItem(KEY);
    if (isAlexVoice(cached)) return cached;
  } catch {
    /* localStorage unavailable */
  }
  const picked = ALL_VOICES[Math.floor(Math.random() * ALL_VOICES.length)];
  try {
    localStorage.setItem(KEY, picked);
  } catch {
    /* ignore quota */
  }
  return picked;
}

export function isAlexFemale(v: AlexVoiceId): boolean {
  return (FEMALE_VOICES as readonly string[]).includes(v);
}