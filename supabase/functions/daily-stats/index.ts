import { createClient } from "npm:@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const DEFAULT_GOAL_TASKS = 3;
const DEFAULT_GOAL_MINUTES = 15;

type DailyStats = {
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

function todayLocalISO() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

function computeStreak(daySet: Set<string>) {
  let streak = 0;
  const d = new Date();
  for (let i = 0; i < 365; i++) {
    const cur = new Date(d);
    cur.setDate(d.getDate() - i);
    cur.setMinutes(cur.getMinutes() - cur.getTimezoneOffset());
    const key = cur.toISOString().slice(0, 10);
    if (daySet.has(key)) streak++;
    else if (i === 0) continue;
    else break;
  }
  return streak;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization") || "";
    const token = auth.replace("Bearer ", "");
    if (!token) {
      return new Response(JSON.stringify({ error: "auth required" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const sb = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: u } = await sb.auth.getUser(token);
    const uid = u?.user?.id;
    if (!uid) {
      return new Response(JSON.stringify({ error: "auth invalid" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const today = todayLocalISO();
    const startOfDay = new Date(today + "T00:00:00").toISOString();
    const since30 = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();

    const [
      scoresToday, masteryToday, readingToday, streakPScores, streakPReading,
      jScoresToday, jMasteryToday, jReadToday, jListenToday, jWriteToday,
      streakJScores, streakJRead, streakJListen, streakJWrite,
      gAttemptsToday, gMasteryToday, gReadDiagToday, gClozeToday,
      streakGAttempts, streakGReadDiag, streakGCloze,
    ] = await Promise.all([
      sb.from("primary_game_scores").select("created_at,accuracy,score,duration_ms,game_type").eq("user_id", uid).gte("created_at", startOfDay).limit(500),
      sb.from("primary_word_mastery").select("created_at,updated_at,mastery_level,quiz_correct,listen_correct,spell_correct,match_correct").eq("user_id", uid).gte("updated_at", startOfDay).limit(500),
      sb.from("primary_reading_progress").select("updated_at,completed_at,score").eq("user_id", uid).gte("updated_at", startOfDay).limit(500),
      sb.from("primary_game_scores").select("created_at").eq("user_id", uid).gte("created_at", since30).limit(500),
      sb.from("primary_reading_progress").select("updated_at,completed_at").eq("user_id", uid).gte("updated_at", since30).limit(500),

      sb.from("junior_game_scores").select("created_at,accuracy,score,duration_ms,game_type").eq("user_id", uid).gte("created_at", startOfDay).limit(500),
      sb.from("junior_word_mastery").select("created_at,updated_at,mastery_level").eq("user_id", uid).gte("updated_at", startOfDay).limit(500),
      sb.from("junior_reading_attempts").select("created_at,is_correct,duration_ms,reading_id").eq("user_id", uid).gte("created_at", startOfDay).limit(500),
      sb.from("junior_listening_attempts").select("created_at,is_correct,exercise_id").eq("user_id", uid).gte("created_at", startOfDay).limit(500),
      sb.from("junior_writing_attempts").select("created_at,overall_score").eq("user_id", uid).gte("created_at", startOfDay).limit(200),
      sb.from("junior_game_scores").select("created_at").eq("user_id", uid).gte("created_at", since30).limit(500),
      sb.from("junior_reading_attempts").select("created_at").eq("user_id", uid).gte("created_at", since30).limit(500),
      sb.from("junior_listening_attempts").select("created_at").eq("user_id", uid).gte("created_at", since30).limit(500),
      sb.from("junior_writing_attempts").select("created_at").eq("user_id", uid).gte("created_at", since30).limit(200),

      sb.from("gaokao_user_attempts").select("created_at,is_correct,question_type,time_spent_seconds").eq("user_id", uid).gte("created_at", startOfDay).limit(500),
      sb.from("gaokao_user_mastery").select("created_at,updated_at,mastery_level,item_type,reached_master_at").eq("user_id", uid).gte("updated_at", startOfDay).limit(500),
      sb.from("gaokao_reading_diagnostics").select("created_at,is_correct,article_id,time_spent_seconds").eq("user_id", uid).gte("created_at", startOfDay).limit(500),
      sb.from("gaokao_cloze_sessions").select("submitted_at,status,correct_count,total_blanks,duration_seconds").eq("user_id", uid).gte("created_at", startOfDay).limit(200),
      sb.from("gaokao_user_attempts").select("created_at").eq("user_id", uid).gte("created_at", since30).limit(500),
      sb.from("gaokao_reading_diagnostics").select("created_at").eq("user_id", uid).gte("created_at", since30).limit(500),
      sb.from("gaokao_cloze_sessions").select("submitted_at").eq("user_id", uid).gte("created_at", since30).limit(200),
    ]);

    const pTodayScores = scoresToday.data ?? [];
    const pTodayMastery = masteryToday.data ?? [];
    const pTodayReading = (readingToday.data ?? []).filter((r: any) => r.completed_at);
    const pCorrect = pTodayScores.reduce((a: number, b: any) => a + (b.score ?? 0), 0);
    const pAccSum = pTodayScores.reduce((a: number, b: any) => a + (b.accuracy ?? 0), 0);
    const pQuestionsEst = pTodayScores.length === 0 ? 0 : Math.round(pCorrect / Math.max(0.01, (pAccSum / pTodayScores.length) || 1));
    const pNewWords = pTodayMastery.filter((m: any) => (m.mastery_level ?? 0) >= 1 && String(m.created_at ?? "").slice(0, 10) === today).length;
    const pMinutes = pTodayScores.reduce((a: number, b: any) => a + (b.duration_ms ?? 0), 0) / 60000;

    const jTodayS = jScoresToday.data ?? [];
    const jTodayM = jMasteryToday.data ?? [];
    const jTodayR = jReadToday.data ?? [];
    const jTodayL = jListenToday.data ?? [];
    const jTodayW = jWriteToday.data ?? [];
    const jCorrect = jTodayS.reduce((a: number, b: any) => a + (b.score ?? 0), 0) + jTodayR.filter((r: any) => r.is_correct).length + jTodayL.filter((r: any) => r.is_correct).length;
    const jQuestions = jTodayS.length + jTodayR.length + jTodayL.length;
    const jNewWords = jTodayM.filter((m: any) => (m.mastery_level ?? 0) >= 1 && String(m.created_at ?? "").slice(0, 10) === today).length;
    const jMinutes = jTodayS.reduce((a: number, b: any) => a + (b.duration_ms ?? 0), 0) / 60000;
    const jReadDoneIds = new Set(jTodayR.map((r: any) => r.reading_id));

    const gTodayA = gAttemptsToday.data ?? [];
    const gTodayM = gMasteryToday.data ?? [];
    const gTodayRD = gReadDiagToday.data ?? [];
    const gTodayC = (gClozeToday.data ?? []).filter((s: any) => s.status === "submitted");
    const gCorrect = gTodayA.filter((a: any) => a.is_correct).length + gTodayRD.filter((a: any) => a.is_correct).length + gTodayC.reduce((a: number, b: any) => a + (b.correct_count ?? 0), 0);
    const gQuestions = gTodayA.length + gTodayRD.length + gTodayC.reduce((a: number, b: any) => a + (b.total_blanks ?? 0), 0);
    const gNewWords = gTodayM.filter((m: any) => m.item_type === "vocab" && (m.mastery_level ?? 0) >= 3 && String(m.reached_master_at ?? "").slice(0, 10) === today).length;
    const gReviewedWords = gTodayM.filter((m: any) => m.item_type === "vocab").length;
    const gMinutes = (gTodayA.reduce((a: number, b: any) => a + (b.time_spent_seconds ?? 0), 0) + gTodayRD.reduce((a: number, b: any) => a + (b.time_spent_seconds ?? 0), 0) + gTodayC.reduce((a: number, b: any) => a + (b.duration_seconds ?? 0), 0)) / 60;
    const gReadingArticles = new Set(gTodayRD.map((r: any) => r.article_id)).size;

    const tasks = pTodayScores.length + pTodayReading.length + jTodayS.length + jReadDoneIds.size + new Set(jTodayL.map((r: any) => r.exercise_id)).size + jTodayW.length + gTodayA.length + gReadingArticles + gTodayC.length;
    const correct = pCorrect + jCorrect + gCorrect;
    const questions = pQuestionsEst + jQuestions + gQuestions;

    const daySet = new Set<string>();
    const addDay = (ts?: string | null) => { if (ts) daySet.add(String(ts).slice(0, 10)); };
    [...(streakPScores.data ?? []), ...(streakJScores.data ?? []), ...(streakJRead.data ?? []), ...(streakJListen.data ?? []), ...(streakJWrite.data ?? []), ...(streakGAttempts.data ?? []), ...(streakGReadDiag.data ?? [])].forEach((r: any) => addDay(r.created_at));
    (streakPReading.data ?? []).forEach((r: any) => addDay(r.updated_at ?? r.completed_at));
    (streakGCloze.data ?? []).forEach((r: any) => addDay(r.submitted_at));

    const stats: DailyStats = {
      date: today,
      tasks,
      questions,
      correct,
      accuracy: questions > 0 ? Math.min(1, correct / questions) : 0,
      newWords: pNewWords + jNewWords + gNewWords,
      reviewedWords: pTodayMastery.length + jTodayM.length + gReviewedWords,
      readingDone: pTodayReading.length + jReadDoneIds.size + gReadingArticles,
      minutes: Math.round(pMinutes + jMinutes + gMinutes),
      streakDays: computeStreak(daySet),
      goalTasks: DEFAULT_GOAL_TASKS,
      goalMinutes: DEFAULT_GOAL_MINUTES,
    };

    return new Response(JSON.stringify({ stats }), { headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "private, max-age=20" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "unknown" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
