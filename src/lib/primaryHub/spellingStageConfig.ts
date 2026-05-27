// Grade-agnostic config for the spelling stage engine (SpellingStage.tsx).
// The engine reads from here so the same component serves g3–g6 + middle/high
// without grade-specific branching. Only g4 is exercised today; the other rows
// are placeholders proving the engine scales (numbers are first-pass estimates).

export type GradeKey = "g3" | "g4" | "g5" | "g6" | "middle" | "high";

export type RexStage = { label: string; emoji: string; minXp: number };

export type GradeConfig = {
  /** XP thresholds for Rex evolution (4 stages). null = Rex disabled for this grade. */
  rexStages: [number, number, number, number] | null;
  /** Words this many letters or longer become 👑 BOSS words. */
  bossThreshold: number;
  /** TTS playback rate. */
  speechRate: number;
  useRex: boolean;
  useLetterSlots: boolean;
};

export const GRADE_CONFIG: Record<GradeKey, GradeConfig> = {
  g3: { rexStages: [0, 60, 200, 500], bossThreshold: 6, speechRate: 0.75, useRex: true, useLetterSlots: true },
  g4: { rexStages: [0, 100, 400, 1000], bossThreshold: 8, speechRate: 0.85, useRex: true, useLetterSlots: true },
  g5: { rexStages: [0, 150, 600, 1500], bossThreshold: 9, speechRate: 0.9, useRex: true, useLetterSlots: true },
  g6: { rexStages: [0, 200, 800, 2000], bossThreshold: 10, speechRate: 0.95, useRex: true, useLetterSlots: true },
  middle: { rexStages: null, bossThreshold: 12, speechRate: 0.95, useRex: false, useLetterSlots: true },
  high: { rexStages: null, bossThreshold: 14, speechRate: 1.0, useRex: false, useLetterSlots: false },
};

/** Rex evolution stages — labels shared across grades; thresholds come from GRADE_CONFIG. */
export const REX_STAGE_META: { label: string; emoji: string }[] = [
  { label: "蛋", emoji: "🥚" },
  { label: "宝宝", emoji: "🦕" },
  { label: "少年", emoji: "🦖" },
  { label: "神龙", emoji: "🐉" },
];

export function getGradeConfig(gradeKey: GradeKey): GradeConfig {
  return GRADE_CONFIG[gradeKey] ?? GRADE_CONFIG.g4;
}

/** A vocab word is a BOSS when its letter count (spaces excluded) ≥ threshold. */
export function isBossWord(en: string, gradeKey: GradeKey): boolean {
  const letters = en.replace(/[^a-zA-Z]/g, "").length;
  return letters >= getGradeConfig(gradeKey).bossThreshold;
}

/** Resolve the current Rex evolution stage index (0–3) from cumulative XP. */
export function rexStageFromXp(xp: number, gradeKey: GradeKey): number {
  const stages = getGradeConfig(gradeKey).rexStages;
  if (!stages) return 0;
  let idx = 0;
  for (let i = 0; i < stages.length; i++) {
    if (xp >= stages[i]) idx = i;
  }
  return idx;
}

/** XP progress (0–1) within the current stage toward the next; 1 at the top stage. */
export function rexStageProgress(xp: number, gradeKey: GradeKey): number {
  const stages = getGradeConfig(gradeKey).rexStages;
  if (!stages) return 0;
  const idx = rexStageFromXp(xp, gradeKey);
  if (idx >= stages.length - 1) return 1;
  const cur = stages[idx];
  const next = stages[idx + 1];
  if (next <= cur) return 1;
  return Math.max(0, Math.min(1, (xp - cur) / (next - cur)));
}

// ---- Storage scope: per signed-in user; guests get a stable per-device anon id ----
// Keeps Rex XP / wrong pools private to the account, not shared across users on one device.
export function getStorageScope(userId: string | null | undefined): string {
  if (userId) return userId;
  try {
    let anon = localStorage.getItem("spelling_anon_id");
    if (!anon) {
      anon = `anon_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
      localStorage.setItem("spelling_anon_id", anon);
    }
    return anon;
  } catch {
    return "anon";
  }
}

// ---- Rex XP persistence (one Rex per grade, per user; survives across units/sessions) ----
export const rexXpKey = (scope: string, gradeKey: GradeKey) => `spelling_rex_xp_${scope}_${gradeKey}`;

export function loadRexXp(scope: string, gradeKey: GradeKey): number {
  try {
    const raw = localStorage.getItem(rexXpKey(scope, gradeKey));
    const n = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}

export function saveRexXp(scope: string, gradeKey: GradeKey, xp: number): void {
  try {
    localStorage.setItem(rexXpKey(scope, gradeKey), String(Math.max(0, Math.round(xp))));
  } catch {
    // ignore storage errors
  }
}

// ---- Wrong-word pool (per unit; spaced-repetition review) ----
export type WrongEntry = {
  wrongCount: number;
  lastWrongAt: number;
  nextReviewAt: number;
  masteredCount: number;
  /** How it last entered the pool — distinguishes a wrong attempt from a (taught) skip. */
  lastOutcome?: "wrong" | "skipped";
};
export type WrongPool = Record<string, WrongEntry>;

export const wrongPoolKey = (scope: string, unitId: string) => `spelling_wrongs_${scope}_${unitId}`;

export function loadWrongPool(scope: string, unitId: string): WrongPool {
  try {
    const raw = localStorage.getItem(wrongPoolKey(scope, unitId));
    return raw ? (JSON.parse(raw) as WrongPool) : {};
  } catch {
    return {};
  }
}

export function saveWrongPool(scope: string, unitId: string, pool: WrongPool): void {
  try {
    localStorage.setItem(wrongPoolKey(scope, unitId), JSON.stringify(pool));
  } catch {
    // ignore storage errors
  }
}

/** Review interval shrinks as a word is missed more: 5min → 2min → 1min. */
export function nextReviewDelayMs(wrongCount: number): number {
  if (wrongCount <= 1) return 5 * 60 * 1000;
  if (wrongCount === 2) return 2 * 60 * 1000;
  return 60 * 1000;
}
