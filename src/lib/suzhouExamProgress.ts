import type { ExamMode } from "@/lib/suzhouExamUtils";

const STORAGE_KEY = "suzhou_exam_progress_v1";

type ModeProgress = {
  completedAt: string;
};

export type SuzhouExamProgress = {
  exam?: ModeProgress;
  practice?: ModeProgress;
};

type ProgressStore = Record<string, SuzhouExamProgress>;

function readStore(): ProgressStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as ProgressStore;
  } catch {
    return {};
  }
}

function writeStore(store: ProgressStore) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* ignore quota errors */
  }
}

export function getSuzhouExamProgress(examId: string): SuzhouExamProgress {
  return readStore()[examId] ?? {};
}

export function isExamModeComplete(examId: string, mode: Exclude<ExamMode, "review">): boolean {
  const progress = getSuzhouExamProgress(examId);
  return Boolean(progress[mode]?.completedAt);
}

/** 练习或考试任一模式提交后，即可解锁复习模式（含全部答案） */
export function isReviewUnlocked(examId: string): boolean {
  const progress = getSuzhouExamProgress(examId);
  return Boolean(progress.exam?.completedAt || progress.practice?.completedAt);
}

export function reviewLockedHint(examId: string): string {
  const progress = getSuzhouExamProgress(examId);
  if (progress.exam?.completedAt || progress.practice?.completedAt) return "";
  return "请先完成并提交练习模式或考试模式，再进入复习模式";
}

export function markSuzhouModeComplete(examId: string, mode: Exclude<ExamMode, "review">) {
  const store = readStore();
  const prev = store[examId] ?? {};
  if (prev[mode]?.completedAt) return;
  store[examId] = {
    ...prev,
    [mode]: { completedAt: new Date().toISOString() },
  };
  writeStore(store);
}
