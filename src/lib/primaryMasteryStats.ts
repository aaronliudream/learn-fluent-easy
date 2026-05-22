/** Shared primary vocab mastery rules — keep in sync with useMasteryOverview + parent SkillMasteryPanel. */

export type PrimaryWordMasteryRow = {
  mastery_level?: number | null;
  due_at?: string | null;
};

export function isPrimaryWordMastered(level: number | null | undefined): boolean {
  return (level ?? 0) >= 3;
}

export function isPrimaryWordLearned(level: number | null | undefined): boolean {
  const lvl = level ?? 0;
  return lvl >= 1 && lvl < 3;
}

/** Due for SRS review — same rule as useMasteryOverview primary branch. */
export function isPrimaryWordDue(m: PrimaryWordMasteryRow, now = Date.now()): boolean {
  if (isPrimaryWordMastered(m.mastery_level)) return false;
  if (!m.due_at) return false;
  return new Date(m.due_at).getTime() <= now;
}

export function countPrimaryDue(rows: PrimaryWordMasteryRow[]): number {
  return rows.filter((r) => isPrimaryWordDue(r)).length;
}
