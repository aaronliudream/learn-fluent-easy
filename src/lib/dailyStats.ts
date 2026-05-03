import { supabase } from "@/integrations/supabase/client";

/** 学生端「今日成长」聚合 — 与家长报告共用同一组数据源 */
export type DailyStats = {
  date: string;
  tasks: number;
  questions: number;
  correct: number;
  accuracy: number;
  newWords: number;
  reviewedWords: number;
  readingDone: number;
  minutes: number;
  streakDays: number;
  goalTasks: number;
  goalMinutes: number;
};

const DEFAULT_GOAL_TASKS = 3;
const DEFAULT_GOAL_MINUTES = 15;
const CACHE_KEY = "fluentpath.dailyStats.cache";
const REQUEST_TIMEOUT_MS = 1200;

function todayLocalISO(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

function emptyStats(): DailyStats {
  return {
    date: todayLocalISO(),
    tasks: 0,
    questions: 0,
    correct: 0,
    accuracy: 0,
    newWords: 0,
    reviewedWords: 0,
    readingDone: 0,
    minutes: 0,
    streakDays: 0,
    goalTasks: DEFAULT_GOAL_TASKS,
    goalMinutes: DEFAULT_GOAL_MINUTES,
  };
}

function readCached(uid: string): DailyStats | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { uid: string; ts: number; stats: DailyStats };
    if (parsed.uid !== uid) return null;
    if (Date.now() - parsed.ts > 5 * 60_000) return null;
    return parsed.stats;
  } catch {
    return null;
  }
}

function saveCached(uid: string, stats: DailyStats) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ uid, ts: Date.now(), stats }));
  } catch {
    /* ignore quota */
  }
}

export async function getDailyStats(): Promise<DailyStats | null> {
  const { data: u } = await supabase.auth.getUser();
  const uid = u?.user?.id;
  if (!uid) return null;

  const cached = readCached(uid);
  if (cached) return cached;

  const remote = await Promise.race([
    supabase.functions.invoke("daily-stats", { body: {} }),
    new Promise<{ data: null; error: Error }>((resolve) => {
      window.setTimeout(() => resolve({ data: null, error: new Error("daily stats timeout") }), REQUEST_TIMEOUT_MS);
    }),
  ]);

  if (!remote.error && remote.data?.stats) {
    saveCached(uid, remote.data.stats as DailyStats);
    return remote.data.stats as DailyStats;
  }

  // Never fall back to 10+ client-side database requests. On slow overseas
  // networks the UI should remain instant; the next visit will use cached data.
  return emptyStats();
}
