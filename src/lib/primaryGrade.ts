/** Shared grade selection for Primary (G1–G6). Written by Primary.tsx pickGrade / adventure URL. */
export const PRIMARY_LAST_GRADE_KEY = "primary:lastGrade";

/** Default G3 — 人教 PEP 三年级起点 */
export const PRIMARY_DEFAULT_GRADE = 3;

export function readPrimaryGradeFromStorage(): number {
  if (typeof window === "undefined") return PRIMARY_DEFAULT_GRADE;
  const raw = window.localStorage.getItem(PRIMARY_LAST_GRADE_KEY);
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) && n >= 1 && n <= 6 ? n : PRIMARY_DEFAULT_GRADE;
}

export function writePrimaryGradeToStorage(grade: number): void {
  if (typeof window === "undefined") return;
  const g = Math.min(6, Math.max(1, Math.round(grade)));
  try {
    window.localStorage.setItem(PRIMARY_LAST_GRADE_KEY, String(g));
  } catch {
    /* ignore quota */
  }
}

/** URL ?grade= or /:grade wins; otherwise localStorage; default 1. */
export function resolvePrimaryGrade(urlGrade?: string | null): number {
  if (urlGrade != null && urlGrade !== "") {
    const n = Number(urlGrade);
    if (Number.isFinite(n) && n >= 1 && n <= 6) return n;
  }
  return readPrimaryGradeFromStorage();
}

function clampPrimaryGrade(grade: number): number {
  const n = Math.round(grade);
  if (!Number.isFinite(n)) return readPrimaryGradeFromStorage();
  return Math.min(6, Math.max(1, n));
}

export function primaryAdventurePath(grade: number): string {
  return `/primary/adventure/${clampPrimaryGrade(grade)}`;
}

/** Supabase 趣味阅读列表（G1–G6 各 10 篇闯关） */
export function primaryReadingListPath(grade: number): string {
  return `/primary/reading/grade/${clampPrimaryGrade(grade)}`;
}

/** G1/G2 拼读启蒙绘本书架（Spark 书架 UI） */
export function primaryStorybookShelfPath(grade: number): string {
  const g = clampPrimaryGrade(grade);
  if (g === 2) return "/primary/storybooks?grade=2";
  if (g === 1) return "/primary/storybooks";
  return `/primary/storybooks?grade=${g}`;
}

/**
 * 主入口「读绘本」：一二年级 → 书架；三年级及以上 → 趣味阅读列表。
 */
export function primaryReadingEntryPath(grade: number): string {
  const g = clampPrimaryGrade(grade);
  if (g <= 2) return primaryStorybookShelfPath(g);
  return primaryReadingListPath(g);
}

export function primaryGradeMapPath(grade: number): string {
  return `/primary/grade/${clampPrimaryGrade(grade)}`;
}
