import { supabase } from "@/integrations/supabase/client";

/** 学生端「今日成长」聚合 — 与家长报告共用同一组数据源 */
export type DailyStats = {
  date: string;          // YYYY-MM-DD (local)
  tasks: number;         // 今日完成的练习/阅读次数
  questions: number;     // 今日做过的题目总数（估算）
  correct: number;       // 今日答对题数
  accuracy: number;      // 0-1
  newWords: number;      // 今日首次掌握的新词（mastery_level 升到 ≥1）
  reviewedWords: number; // 今日复习过的词（mastery 行被更新）
  readingDone: number;   // 今日完成的阅读篇数
  minutes: number;       // 今日学习分钟（练习时长之和）
  streakDays: number;    // 连续学习天数
  goalTasks: number;     // 每日目标任务数
  goalMinutes: number;   // 每日目标分钟数
};

const DEFAULT_GOAL_TASKS = 3;
const DEFAULT_GOAL_MINUTES = 15;

function todayLocalISO(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

/** 计算连续学习天数（基于 primary_game_scores + primary_reading_progress 任一表当日有记录） */
function computeStreak(daySet: Set<string>): number {
  let streak = 0;
  const d = new Date();
  // Allow today missing — start counting from yesterday if today empty so user sees streak
  for (let i = 0; i < 365; i++) {
    const cur = new Date(d);
    cur.setDate(d.getDate() - i);
    cur.setMinutes(cur.getMinutes() - cur.getTimezoneOffset());
    const key = cur.toISOString().slice(0, 10);
    if (daySet.has(key)) streak++;
    else if (i === 0) continue; // today optional
    else break;
  }
  return streak;
}

export async function getDailyStats(): Promise<DailyStats | null> {
  const { data: u } = await supabase.auth.getUser();
  const uid = u?.user?.id;
  if (!uid) return null;

  const today = todayLocalISO();
  const startOfDay = new Date(today + "T00:00:00").toISOString();
  const since30 = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();

  const [scores30, mastery30, reading30] = await Promise.all([
    supabase.from("primary_game_scores")
      .select("created_at,accuracy,score,duration_ms,game_type")
      .eq("user_id", uid)
      .gte("created_at", since30)
      .order("created_at", { ascending: false }),
    supabase.from("primary_word_mastery")
      .select("created_at,updated_at,mastery_level,quiz_correct,listen_correct,spell_correct,match_correct")
      .eq("user_id", uid)
      .gte("updated_at", since30),
    supabase.from("primary_reading_progress")
      .select("updated_at,completed_at,score")
      .eq("user_id", uid)
      .gte("updated_at", since30),
  ]);

  const scores = scores30.data ?? [];
  const mastery = mastery30.data ?? [];
  const reading = reading30.data ?? [];

  const todayScores = scores.filter(s => (s.created_at as string).slice(0, 10) === today);
  const todayMastery = mastery.filter(m => (m.updated_at as string).slice(0, 10) === today);
  const todayReading = reading.filter(r => r.completed_at && (r.completed_at as string).slice(0, 10) === today);

  // accuracy: average across today sessions
  const acc = todayScores.length
    ? todayScores.reduce((a, b) => a + (b.accuracy ?? 0), 0) / todayScores.length
    : 0;

  // questions / correct estimate: score column = correct count in our games
  const correct = todayScores.reduce((a, b) => a + (b.score ?? 0), 0);
  const questions = todayScores.length === 0 ? 0
    : Math.round(correct / Math.max(0.01, acc || 1));

  // new words: today rows where mastery_level >= 1 and created today
  const newWords = todayMastery.filter(m =>
    (m.mastery_level ?? 0) >= 1 &&
    (m.created_at as string).slice(0, 10) === today
  ).length;

  const reviewedWords = todayMastery.length;
  const minutes = Math.round(todayScores.reduce((a, b) => a + (b.duration_ms ?? 0), 0) / 60000);

  // streak: any activity day (scores OR reading)
  const daySet = new Set<string>();
  scores.forEach(s => daySet.add((s.created_at as string).slice(0, 10)));
  reading.forEach(r => { if (r.updated_at) daySet.add((r.updated_at as string).slice(0, 10)); });

  return {
    date: today,
    tasks: todayScores.length + todayReading.length,
    questions,
    correct,
    accuracy: acc,
    newWords,
    reviewedWords,
    readingDone: todayReading.length,
    minutes,
    streakDays: computeStreak(daySet),
    goalTasks: DEFAULT_GOAL_TASKS,
    goalMinutes: DEFAULT_GOAL_MINUTES,
  };
}
