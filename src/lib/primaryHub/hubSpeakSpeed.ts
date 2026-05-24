/** Shared TTS speed for Primary Hub sentence / sentence-listening stages (localStorage). */
export const HUB_SPEAK_SPEED_KEY = "primary_hub_speak_speed";

/** Legacy localStorage key; migrated once then removed. */
export const LEGACY_G4V2_U1_SPEAK_SPEED_KEY = "primary_hub_g4v2_u1_tts_speed";

export const HUB_SPEAK_SPEED_LEVELS = [
  { value: 0.7, label: "慢速" },
  { value: 0.85, label: "正常" },
  { value: 1.0, label: "快速" },
] as const;

export type HubSpeakSpeed = (typeof HUB_SPEAK_SPEED_LEVELS)[number]["value"];

const DEFAULT_SPEED: HubSpeakSpeed = 0.85;

function isValidSpeed(raw: string): boolean {
  const n = Number(raw);
  return HUB_SPEAK_SPEED_LEVELS.some((l) => l.value === n);
}

function parseSpeed(raw: string): HubSpeakSpeed | null {
  const n = Number(raw);
  if (HUB_SPEAK_SPEED_LEVELS.some((l) => l.value === n)) return n as HubSpeakSpeed;
  return null;
}

export function loadHubSpeakSpeed(): HubSpeakSpeed {
  if (typeof window === "undefined") return DEFAULT_SPEED;
  try {
    const newRaw = localStorage.getItem(HUB_SPEAK_SPEED_KEY);
    if (newRaw) {
      const parsed = parseSpeed(newRaw);
      if (parsed !== null) return parsed;
    }

    const oldRaw = localStorage.getItem(LEGACY_G4V2_U1_SPEAK_SPEED_KEY);
    if (oldRaw && isValidSpeed(oldRaw)) {
      localStorage.setItem(HUB_SPEAK_SPEED_KEY, oldRaw);
      localStorage.removeItem(LEGACY_G4V2_U1_SPEAK_SPEED_KEY);
      return parseSpeed(oldRaw)!;
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_SPEED;
}

export function saveHubSpeakSpeed(speed: HubSpeakSpeed): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(HUB_SPEAK_SPEED_KEY, String(speed));
  } catch {
    /* quota */
  }
}
