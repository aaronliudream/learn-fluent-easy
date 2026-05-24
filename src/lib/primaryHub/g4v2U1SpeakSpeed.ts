/** Shared TTS speed for g4v2_u1 sentence / listening stages (localStorage). */
export const G4V2_U1_SPEAK_SPEED_KEY = "primary_hub_g4v2_u1_tts_speed";

export const G4V2_U1_SPEAK_SPEED_LEVELS = [
  { value: 0.7, label: "慢速" },
  { value: 0.85, label: "正常" },
  { value: 1.0, label: "快速" },
] as const;

export type G4v2U1SpeakSpeed = (typeof G4V2_U1_SPEAK_SPEED_LEVELS)[number]["value"];

const DEFAULT_SPEED: G4v2U1SpeakSpeed = 0.85;

export function loadG4v2U1SpeakSpeed(): G4v2U1SpeakSpeed {
  if (typeof window === "undefined") return DEFAULT_SPEED;
  try {
    const raw = localStorage.getItem(G4V2_U1_SPEAK_SPEED_KEY);
    if (!raw) return DEFAULT_SPEED;
    const n = Number(raw);
    if (G4V2_U1_SPEAK_SPEED_LEVELS.some((l) => l.value === n)) return n as G4v2U1SpeakSpeed;
  } catch {
    /* ignore */
  }
  return DEFAULT_SPEED;
}

export function saveG4v2U1SpeakSpeed(speed: G4v2U1SpeakSpeed): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(G4V2_U1_SPEAK_SPEED_KEY, String(speed));
  } catch {
    /* quota */
  }
}

export function isG4v2U1Unit(unitId: string): boolean {
  return unitId === "g4v2_u1";
}
