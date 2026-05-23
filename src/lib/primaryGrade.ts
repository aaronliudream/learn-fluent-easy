/** Shared grade selection for Primary (G3–G6). Written by Primary.tsx pickGrade / hub URL. */
export const PRIMARY_LAST_GRADE_KEY = "primary:lastGrade";

/** 小学英语从三年级开始(新课标)。一/二年级已下线，遗留值会被归一到 G3。 */
const MIN_GRADE = 3;
const MAX_GRADE = 6;

export function readPrimaryGradeFromStorage(): number {
  if (typeof window === "undefined") return MIN_GRADE;
  const raw = window.localStorage.getItem(PRIMARY_LAST_GRADE_KEY);
  const n = raw ? Number(raw) : NaN;
  if (!Number.isFinite(n)) return MIN_GRADE;
  return Math.min(MAX_GRADE, Math.max(MIN_GRADE, n));
}

export function writePrimaryGradeToStorage(grade: number): void {
  if (typeof window === "undefined") return;
  const g = Math.min(MAX_GRADE, Math.max(MIN_GRADE, Math.round(grade)));
  try {
    window.localStorage.setItem(PRIMARY_LAST_GRADE_KEY, String(g));
  } catch {
    /* ignore quota */
  }
}

/** URL ?grade= or /:grade wins; otherwise localStorage; default G3. */
export function resolvePrimaryGrade(urlGrade?: string | null): number {
  if (urlGrade != null && urlGrade !== "") {
    const n = Number(urlGrade);
    if (Number.isFinite(n)) {
      return Math.min(MAX_GRADE, Math.max(MIN_GRADE, n));
    }
  }
  return readPrimaryGradeFromStorage();
}

function clampPrimaryGrade(grade: number): number {
  const n = Math.round(grade);
  if (!Number.isFinite(n)) return readPrimaryGradeFromStorage();
  return Math.min(MAX_GRADE, Math.max(MIN_GRADE, n));
}

/** Primary hub home for the given grade. */
export function primaryHubPath(grade: number): string {
  return `/primary/hub/${clampPrimaryGrade(grade)}`;
}

/** @deprecated Use primaryHubPath — legacy adventure URLs redirect to hub. */
export function primaryAdventurePath(grade: number): string {
  return primaryHubPath(grade);
}

/** @deprecated Primary hub no longer has a separate reading route. */
export function primaryReadingListPath(grade: number): string {
  return primaryHubPath(grade);
}

/** @deprecated */
export function primaryStorybookShelfPath(grade: number): string {
  return primaryHubPath(grade);
}

/** @deprecated */
export function primaryReadingEntryPath(grade: number): string {
  return primaryHubPath(grade);
}

/** @deprecated */
export function primaryGradeMapPath(grade: number): string {
  return primaryHubPath(grade);
}
