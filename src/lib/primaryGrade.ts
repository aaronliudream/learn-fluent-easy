/** Shared grade selection for Primary (G1–G6). Written by Primary.tsx pickGrade / adventure URL. */
export const PRIMARY_LAST_GRADE_KEY = "primary:lastGrade";

export function readPrimaryGradeFromStorage(): number {
  if (typeof window === "undefined") return 1;
  const raw = window.localStorage.getItem(PRIMARY_LAST_GRADE_KEY);
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) && n >= 1 && n <= 6 ? n : 1;
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

export function primaryReadingListPath(grade: number): string {
  return `/primary/reading/grade/${clampPrimaryGrade(grade)}`;
}

export function primaryGradeMapPath(grade: number): string {
  return `/primary/grade/${clampPrimaryGrade(grade)}`;
}
