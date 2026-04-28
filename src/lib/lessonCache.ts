import type { LessonContent } from "@/data/course";

const KEY_PREFIX = "lesson_ai_v1:";

const k = (level: number, unit: number, lesson: number) =>
  `${KEY_PREFIX}${level}-${unit}-${lesson}`;

export const getCachedLesson = (
  level: number,
  unit: number,
  lesson: number,
): LessonContent | null => {
  try {
    const raw = localStorage.getItem(k(level, unit, lesson));
    if (!raw) return null;
    return JSON.parse(raw) as LessonContent;
  } catch {
    return null;
  }
};

export const setCachedLesson = (
  level: number,
  unit: number,
  lesson: number,
  content: LessonContent,
) => {
  try {
    localStorage.setItem(k(level, unit, lesson), JSON.stringify(content));
  } catch {
    // localStorage might be full; ignore.
  }
};

export const clearCachedLesson = (level: number, unit: number, lesson: number) => {
  try {
    localStorage.removeItem(k(level, unit, lesson));
  } catch {
    /* noop */
  }
};