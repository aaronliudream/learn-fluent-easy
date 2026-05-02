/**
 * Multi-dimensional vocabulary mastery scoring (Nation's lexical-knowledge framework).
 *
 * A word is judged across THREE families of skill — Form, Meaning, Use —
 * mapped from the eight in-app question kinds. Each kind tracks a small
 * counter that saturates after a few correct answers; the overall mastery
 * score is a weighted blend.
 *
 * Mastery levels (0..4) align to UI labels:
 *   0 = 🌱 Untouched
 *   1 = 🌿 Encountered
 *   2 = 🌳 Familiar
 *   3 = 🌟 Proficient
 *   4 = 👑 Mastered  (requires 21-day retention check passed)
 */

export type QuizKind =
  | "en2cn"
  | "cn2en"
  | "listen"
  | "cloze"
  | "en2en"
  | "en2word"
  | "spell"
  | "syn"
  | "pos";

export type MasteryMatrix = Partial<Record<QuizKind, number>>;

export type MasteryLevel = 0 | 1 | 2 | 3 | 4;

/** Cap each kind's counter — after N correct it stops contributing. */
const KIND_CAP = 4;

/** Productive (output) kinds carry more weight than receptive (input). */
const KIND_WEIGHT: Record<QuizKind, number> = {
  // Receptive — recognising a known word is "easier"
  en2cn: 1.0,
  listen: 1.1,
  en2en: 1.0,
  // Productive — generating a word is "real" mastery
  cn2en: 1.4,
  spell: 1.3,
  en2word: 1.3,
  cloze: 1.2,
  // Discrimination
  syn: 1.2,
  pos: 1.0,
};

/** Which family a kind belongs to (Form / Meaning / Use). */
const KIND_FAMILY: Record<QuizKind, "form" | "meaning" | "use"> = {
  spell: "form",
  listen: "form",
  en2cn: "meaning",
  cn2en: "meaning",
  en2en: "meaning",
  en2word: "meaning",
  syn: "meaning",
  cloze: "use",
  pos: "use",
};

const FAMILY_WEIGHT = { form: 0.3, meaning: 0.4, use: 0.3 } as const;

/** Add a successful answer of `kind` to the matrix (capped). */
export function bumpMatrix(
  matrix: MasteryMatrix,
  kind: QuizKind,
  isCorrect: boolean,
): MasteryMatrix {
  if (!isCorrect) return matrix;
  const cur = matrix[kind] ?? 0;
  return { ...matrix, [kind]: Math.min(KIND_CAP, cur + 1) };
}

/** Compute a 0..1 mastery score from the matrix. */
export function computeMasteryScore(matrix: MasteryMatrix): number {
  const families: Record<"form" | "meaning" | "use", { sum: number; max: number }> = {
    form: { sum: 0, max: 0 },
    meaning: { sum: 0, max: 0 },
    use: { sum: 0, max: 0 },
  };

  // Walk all known kinds so unanswered kinds still contribute to "max".
  (Object.keys(KIND_FAMILY) as QuizKind[]).forEach((kind) => {
    const fam = KIND_FAMILY[kind];
    const weight = KIND_WEIGHT[kind];
    families[fam].max += KIND_CAP * weight;
    families[fam].sum += (matrix[kind] ?? 0) * weight;
  });

  // Each family contributes its own normalized score, blended.
  let score = 0;
  for (const fam of ["form", "meaning", "use"] as const) {
    const f = families[fam];
    const sub = f.max === 0 ? 0 : f.sum / f.max;
    score += sub * FAMILY_WEIGHT[fam];
  }
  // Bonus for breadth — having ≥3 kinds answered correctly at least once.
  const breadth = (Object.values(matrix) as number[]).filter((v) => v > 0).length;
  if (breadth >= 3) score = Math.min(1, score + 0.05);
  if (breadth >= 5) score = Math.min(1, score + 0.05);
  return Math.min(1, Math.max(0, score));
}

/**
 * Convert a score → level 0..4. Level 4 (Mastered) additionally requires
 * that the word has reached_master_at set (i.e. survived a 21-day retention
 * check), so callers should compute level 4 only with that extra signal.
 */
export function levelFromScore(
  score: number,
  hasReachedMasterAt: boolean,
): MasteryLevel {
  if (score === 0) return 0;
  if (score < 0.3) return 1;
  if (score < 0.6) return 2;
  if (score < 0.85) return 3;
  // ≥ 0.85 — Proficient unless retention check passed
  return hasReachedMasterAt ? 4 : 3;
}

export const MASTERY_LABELS: Record<MasteryLevel, { label: string; emoji: string; color: string }> = {
  0: { label: "未学", emoji: "🌱", color: "text-muted-foreground" },
  1: { label: "初识", emoji: "🌿", color: "text-blue-600 dark:text-blue-400" },
  2: { label: "熟悉", emoji: "🌳", color: "text-emerald-600 dark:text-emerald-400" },
  3: { label: "精通", emoji: "🌟", color: "text-amber-600 dark:text-amber-400" },
  4: { label: "大师", emoji: "👑", color: "text-fuchsia-600 dark:text-fuchsia-400" },
};

/** True when this answer just lifted the word into a higher level. */
export function didLevelUp(
  prevMatrix: MasteryMatrix,
  prevReachedMasterAt: boolean,
  newMatrix: MasteryMatrix,
  newReachedMasterAt: boolean,
): boolean {
  const a = levelFromScore(computeMasteryScore(prevMatrix), prevReachedMasterAt);
  const b = levelFromScore(computeMasteryScore(newMatrix), newReachedMasterAt);
  return b > a;
}