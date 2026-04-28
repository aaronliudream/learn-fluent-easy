import { LEVELS } from "@/data/course";

const KEY = "mastered_lessons_v1";
const LAST_KEY = "last_mastered_v1";
const NUDGE_KEY = "next-lesson-nudge-shown";

export type LessonRef = { levelId: number; unitId: number; lessonId: number; title: string };

function load(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function save(list: string[]) {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* noop */ }
}

export function lessonKey(levelId: number, unitId: number, lessonId: number) {
  return `${levelId}-${unitId}-${lessonId}`;
}

export function isMastered(levelId: number, unitId: number, lessonId: number) {
  return load().includes(lessonKey(levelId, unitId, lessonId));
}

export function setMastered(levelId: number, unitId: number, lessonId: number, mastered: boolean) {
  const k = lessonKey(levelId, unitId, lessonId);
  const list = load().filter((x) => x !== k);
  if (mastered) {
    list.push(k);
    try {
      localStorage.setItem(LAST_KEY, JSON.stringify({ levelId, unitId, lessonId, at: Date.now() }));
      // allow the next-lesson nudge to fire again on the next app open
      sessionStorage.removeItem(NUDGE_KEY);
    } catch { /* noop */ }
  }
  save(list);
}

/** Flat ordered list of all lessons across levels/units. */
function flatLessons(): LessonRef[] {
  const out: LessonRef[] = [];
  for (const lv of LEVELS) {
    for (const u of lv.units) {
      for (const ls of u.lessons) {
        out.push({ levelId: lv.id, unitId: u.id, lessonId: ls.id, title: ls.title });
      }
    }
  }
  return out;
}

/** Find next lesson after the given one, skipping any already mastered. */
export function findNextLesson(levelId: number, unitId: number, lessonId: number): LessonRef | null {
  const all = flatLessons();
  const idx = all.findIndex(
    (l) => l.levelId === levelId && l.unitId === unitId && l.lessonId === lessonId,
  );
  if (idx < 0) return null;
  const mastered = new Set(load());
  for (let i = idx + 1; i < all.length; i++) {
    const k = lessonKey(all[i].levelId, all[i].unitId, all[i].lessonId);
    if (!mastered.has(k)) return all[i];
  }
  return null;
}

/** Get the most recently mastered lesson (for app-open suggestion). */
export function getLastMastered(): LessonRef | null {
  try {
    const raw = localStorage.getItem(LAST_KEY);
    if (!raw) return null;
    const { levelId, unitId, lessonId } = JSON.parse(raw);
    const all = flatLessons();
    return all.find((l) => l.levelId === levelId && l.unitId === unitId && l.lessonId === lessonId) ?? null;
  } catch {
    return null;
  }
}

export const NEXT_NUDGE_KEY = NUDGE_KEY;