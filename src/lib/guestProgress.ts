// Lightweight guest learning tracker (no auth required).
// Stored in localStorage so we can show "sunk cost" in nudges.

const KEY = "guest_progress_v1";

export type GuestProgress = {
  completedLessons: string[]; // "levelId-unitId-lessonId"
  quizCorrect: number;
  quizTotal: number;
  studyMinutes: number;
  firstSeenAt: number;
  lastSeenAt: number;
  daysActive: string[]; // YYYY-MM-DD list
};

const empty = (): GuestProgress => ({
  completedLessons: [],
  quizCorrect: 0,
  quizTotal: 0,
  studyMinutes: 0,
  firstSeenAt: Date.now(),
  lastSeenAt: Date.now(),
  daysActive: [],
});

export function loadProgress(): GuestProgress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    return { ...empty(), ...JSON.parse(raw) };
  } catch {
    return empty();
  }
}

function save(p: GuestProgress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    // ignore quota errors
  }
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function touchActive() {
  const p = loadProgress();
  const t = todayKey();
  if (!p.daysActive.includes(t)) p.daysActive.push(t);
  p.lastSeenAt = Date.now();
  save(p);
}

export function markLessonComplete(levelId: number, unitId: number, lessonId: number) {
  const p = loadProgress();
  const key = `${levelId}-${unitId}-${lessonId}`;
  if (!p.completedLessons.includes(key)) {
    p.completedLessons.push(key);
    save(p);
  }
}

export function recordQuiz(correct: number, total: number) {
  const p = loadProgress();
  p.quizCorrect += correct;
  p.quizTotal += total;
  save(p);
}

export function addStudyMinutes(mins: number) {
  if (mins <= 0) return;
  const p = loadProgress();
  p.studyMinutes += mins;
  save(p);
}

/** Consecutive trailing day streak from today. */
export function getStreak(p = loadProgress()): number {
  if (!p.daysActive.length) return 0;
  const set = new Set(p.daysActive);
  let streak = 0;
  const d = new Date();
  for (;;) {
    const k = d.toISOString().slice(0, 10);
    if (set.has(k)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else break;
  }
  return streak;
}

export function clearProgress() {
  try { localStorage.removeItem(KEY); } catch { /* noop */ }
}