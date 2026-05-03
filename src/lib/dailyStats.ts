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

  const [
    scores30, mastery30, reading30,
    jScores30, jMastery30, jRead30, jListen30, jWrite30,
    gAttempts30, gMastery30, gReadDiag30, gCloze30,
  ] = await Promise.all([
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
    // Junior
    supabase.from("junior_game_scores")
      .select("created_at,accuracy,score,duration_ms,game_type")
      .eq("user_id", uid).gte("created_at", since30),
    supabase.from("junior_word_mastery")
      .select("created_at,updated_at,mastery_level")
      .eq("user_id", uid).gte("updated_at", since30),
    supabase.from("junior_reading_attempts")
      .select("created_at,is_correct,duration_ms,reading_id")
      .eq("user_id", uid).gte("created_at", since30),
    supabase.from("junior_listening_attempts")
      .select("created_at,is_correct,exercise_id")
      .eq("user_id", uid).gte("created_at", since30),
    supabase.from("junior_writing_attempts")
      .select("created_at,overall_score")
      .eq("user_id", uid).gte("created_at", since30),
    // Senior / Gaokao
    supabase.from("gaokao_user_attempts")
      .select("created_at,is_correct,question_type,time_spent_seconds")
      .eq("user_id", uid).gte("created_at", since30),
    supabase.from("gaokao_user_mastery")
      .select("created_at,updated_at,mastery_level,item_type,reached_master_at")
      .eq("user_id", uid).gte("updated_at", since30),
    supabase.from("gaokao_reading_diagnostics")
      .select("created_at,is_correct,article_id,time_spent_seconds")
      .eq("user_id", uid).gte("created_at", since30),
    supabase.from("gaokao_cloze_sessions")
      .select("submitted_at,status,correct_count,total_blanks,duration_seconds")
      .eq("user_id", uid).gte("created_at", since30),
  ]);

  const isToday = (ts?: string | null) => !!ts && (ts as string).slice(0, 10) === today;

  // ---- 小学 ----
  const pScores = scores30.data ?? [];
  const pMastery = mastery30.data ?? [];
  const pReading = reading30.data ?? [];
  const pTodayScores = pScores.filter(s => isToday(s.created_at as string));
  const pTodayMastery = pMastery.filter(m => isToday(m.updated_at as string));
  const pTodayReading = pReading.filter(r => isToday(r.completed_at as string));
  const pCorrect = pTodayScores.reduce((a, b) => a + (b.score ?? 0), 0);
  const pAccSum = pTodayScores.reduce((a, b) => a + (b.accuracy ?? 0), 0);
  const pQuestionsEst = pTodayScores.length === 0 ? 0
    : Math.round(pCorrect / Math.max(0.01, (pAccSum / pTodayScores.length) || 1));
  const pNewWords = pTodayMastery.filter(m => (m.mastery_level ?? 0) >= 1 && isToday(m.created_at as string)).length;
  const pMinutes = pTodayScores.reduce((a, b) => a + (b.duration_ms ?? 0), 0) / 60000;

  // ---- 初中 ----
  const jS = jScores30.data ?? [];
  const jM = jMastery30.data ?? [];
  const jR = jRead30.data ?? [];
  const jL = jListen30.data ?? [];
  const jW = jWrite30.data ?? [];
  const jTodayS = jS.filter(s => isToday(s.created_at as string));
  const jTodayM = jM.filter(m => isToday(m.updated_at as string));
  const jTodayR = jR.filter(r => isToday(r.created_at as string));
  const jTodayL = jL.filter(r => isToday(r.created_at as string));
  const jTodayW = jW.filter(r => isToday(r.created_at as string));
  const jCorrect =
    jTodayS.reduce((a, b) => a + (b.score ?? 0), 0) +
    jTodayR.filter(r => r.is_correct).length +
    jTodayL.filter(r => r.is_correct).length;
  const jQuestions = jTodayS.length + jTodayR.length + jTodayL.length;
  const jNewWords = jTodayM.filter(m => (m.mastery_level ?? 0) >= 1 && isToday(m.created_at as string)).length;
  const jMinutes = jTodayS.reduce((a, b) => a + (b.duration_ms ?? 0), 0) / 60000;
  const jReadDoneIds = new Set(jTodayR.map(r => r.reading_id as string));

  // ---- 高中 ----
  const gA = gAttempts30.data ?? [];
  const gM = gMastery30.data ?? [];
  const gRD = gReadDiag30.data ?? [];
  const gC = gCloze30.data ?? [];
  const gTodayA = gA.filter(r => isToday(r.created_at as string));
  const gTodayM = gM.filter(m => isToday(m.updated_at as string));
  const gTodayRD = gRD.filter(r => isToday(r.created_at as string));
  const gTodayC = gC.filter(s => isToday(s.submitted_at as string) && s.status === "submitted");
  const gCorrect =
    gTodayA.filter(a => a.is_correct).length +
    gTodayRD.filter(a => a.is_correct).length +
    gTodayC.reduce((a, b) => a + (b.correct_count ?? 0), 0);
  const gQuestions =
    gTodayA.length + gTodayRD.length +
    gTodayC.reduce((a, b) => a + (b.total_blanks ?? 0), 0);
  const gNewWords = gTodayM.filter(m =>
    m.item_type === "vocab" && (m.mastery_level ?? 0) >= 3 &&
    isToday(m.reached_master_at as string)
  ).length;
  const gReviewedWords = gTodayM.filter(m => m.item_type === "vocab").length;
  const gMinutes = (
    gTodayA.reduce((a, b) => a + (b.time_spent_seconds ?? 0), 0) +
    gTodayRD.reduce((a, b) => a + (b.time_spent_seconds ?? 0), 0) +
    gTodayC.reduce((a, b) => a + (b.duration_seconds ?? 0), 0)
  ) / 60;
  const gReadingArticles = new Set(gTodayRD.map(r => r.article_id as string)).size;

  // ---- 汇总 ----
  const tasks =
    pTodayScores.length + pTodayReading.length +
    jTodayS.length + jReadDoneIds.size + new Set(jTodayL.map(r => r.exercise_id)).size + jTodayW.length +
    gTodayA.length + gReadingArticles + gTodayC.length;
  const correct = pCorrect + jCorrect + gCorrect;
  const questions = pQuestionsEst + jQuestions + gQuestions;
  const accuracy = questions > 0 ? Math.min(1, correct / questions) : 0;
  const newWords = pNewWords + jNewWords + gNewWords;
  const reviewedWords = pTodayMastery.length + jTodayM.length + gReviewedWords;
  const readingDone = pTodayReading.length + jReadDoneIds.size + gReadingArticles;
  const minutes = Math.round(pMinutes + jMinutes + gMinutes);

  // streak: 任一学段有活跃即算
  const daySet = new Set<string>();
  const addDay = (ts?: string | null) => { if (ts) daySet.add((ts as string).slice(0, 10)); };
  pScores.forEach(s => addDay(s.created_at as string));
  pReading.forEach(r => addDay((r.updated_at ?? r.completed_at) as string));
  jS.forEach(s => addDay(s.created_at as string));
  jR.forEach(r => addDay(r.created_at as string));
  jL.forEach(r => addDay(r.created_at as string));
  jW.forEach(r => addDay(r.created_at as string));
  gA.forEach(r => addDay(r.created_at as string));
  gRD.forEach(r => addDay(r.created_at as string));
  gC.forEach(s => addDay(s.submitted_at as string));

  return {
    date: today,
    tasks,
    questions,
    correct,
    accuracy,
    newWords,
    reviewedWords,
    readingDone,
    minutes,
    streakDays: computeStreak(daySet),
    goalTasks: DEFAULT_GOAL_TASKS,
    goalMinutes: DEFAULT_GOAL_MINUTES,
  };
}
