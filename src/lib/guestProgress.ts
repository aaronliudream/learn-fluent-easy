// Lightweight guest learning tracker (no auth required).
// Stored in localStorage so we can show "sunk cost" in nudges.
import { supabase } from "@/integrations/supabase/client";

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

/** Best-effort server log when user is signed in. Silent on failure. */
async function logEvent(payload: Record<string, unknown>) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    await supabase.from("learning_events").insert({ user_id: session.user.id, ...payload } as never);
  } catch {
    /* offline / network failure: ignore */
  }
}

export function markLessonComplete(levelId: number, unitId: number, lessonId: number) {
  const p = loadProgress();
  const key = `${levelId}-${unitId}-${lessonId}`;
  if (!p.completedLessons.includes(key)) {
    p.completedLessons.push(key);
    save(p);
    void logEvent({ event_type: "lesson_complete", lesson_key: key });
  }
}

export function recordQuiz(correct: number, total: number) {
  const p = loadProgress();
  p.quizCorrect += correct;
  p.quizTotal += total;
  save(p);
  if (total > 0) void logEvent({ event_type: "quiz", quiz_correct: correct, quiz_total: total });
}

export function addStudyMinutes(mins: number) {
  if (mins <= 0) return;
  const p = loadProgress();
  p.studyMinutes += mins;
  save(p);
  void logEvent({ event_type: "study_minutes", study_minutes: Math.round(mins) });
}

export function recordVocabLearned(count: number) {
  if (count <= 0) return;
  void logEvent({ event_type: "vocab_learned", vocab_count: count });
}

/** Record an AI conversation session (after it ends). */
export function recordAITalk(durationSec: number) {
  const mins = Math.max(1, Math.round(durationSec / 60));
  const p = loadProgress();
  p.studyMinutes += mins;
  save(p);
  void logEvent({ event_type: "ai_talk", study_minutes: mins });
}

/** Generic touch event so passive activities (slang/scenes/workplace pages) count toward streak. */
export function recordVisit(area: string) {
  void logEvent({ event_type: "visit", lesson_key: area });
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