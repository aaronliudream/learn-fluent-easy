/**
 * PR-6 学习激励系统的**数据层单一入口**。
 *
 * 时长 / 每日目标 / 打卡连续天数 / 积分,四件事的读写只许走这里 ——
 * 和 vocabMastery、反馈层同一个道理:四个 UI(四宫格 / 月历 / 周报 / 分享卡)
 * 各写一套计算的话,同一个"连续 7 天"会在四个地方算出四个数。
 *
 * 两张表(DDL 已上线,不新建):
 *   vocab_user_stats   每人一行的累计量
 *   vocab_study_days   逐日明细,连续天数与"今日/累计"都从它算
 *
 * ⚠️ 日期一律用**北京时间的日历日**,不用 UTC。
 *    用 UTC 的话,北京时间晚上 8 点之后学习会被算进"明天",
 *    连续天数会莫名其妙断掉 —— 而断签对用户是很重的负面信号。
 */
import { supabase } from "@/integrations/supabase/client";
import { currentUserId } from "@/lib/vocab/data";

const db = supabase as any;   // 两表尚未进生成的 types.ts,沿用全站既有写法

export type UserStats = {
  total_points: number;
  total_correct: number;
  total_time_ms: number;
  daily_goal: number;
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
};

export type StudyDay = { day: string; seconds: number; answers: number };

export const GOAL_OPTIONS = [10, 20, 30, 50] as const;
export const DEFAULT_GOAL = 20;

/** 北京时间的今天(YYYY-MM-DD)。 */
export function bjToday(): string {
  const now = new Date();
  const bj = new Date(now.getTime() + (now.getTimezoneOffset() + 480) * 60_000);
  return `${bj.getFullYear()}-${String(bj.getMonth() + 1).padStart(2, "0")}-${String(bj.getDate()).padStart(2, "0")}`;
}

/** 把 YYYY-MM-DD 往前/后挪 n 天(纯字符串日历运算,不碰时区)。 */
export function shiftDay(day: string, n: number): string {
  const [y, m, d] = day.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, "0")}-${String(t.getUTCDate()).padStart(2, "0")}`;
}

const EMPTY: UserStats = {
  total_points: 0, total_correct: 0, total_time_ms: 0,
  daily_goal: DEFAULT_GOAL, current_streak: 0, longest_streak: 0, last_active_date: null,
};

export async function getStats(): Promise<UserStats | null> {
  const uid = await currentUserId();
  if (!uid) return null;
  const { data, error } = await db
    .from("vocab_user_stats")
    .select("total_points,total_correct,total_time_ms,daily_goal,current_streak,longest_streak,last_active_date")
    .eq("user_id", uid).maybeSingle();
  if (error) throw error;
  return (data as UserStats | null) ?? EMPTY;
}

export async function setDailyGoal(goal: number): Promise<void> {
  const uid = await currentUserId();
  if (!uid) return;
  if (!GOAL_OPTIONS.includes(goal as typeof GOAL_OPTIONS[number])) return;   // DB 也有 CHECK,这里先挡一道
  await db.from("vocab_user_stats").upsert({ user_id: uid, daily_goal: goal, updated_at: new Date().toISOString() },
    { onConflict: "user_id" });
}

/** 取一段日期内的逐日记录(月历 / 周报 / 四宫格共用)。 */
export async function listStudyDays(from: string, to: string): Promise<StudyDay[]> {
  const uid = await currentUserId();
  if (!uid) return [];
  const { data, error } = await db
    .from("vocab_study_days")
    .select("day,seconds,answers")
    .eq("user_id", uid).gte("day", from).lte("day", to)
    .order("day", { ascending: true });
  if (error) throw error;
  return (data || []) as StudyDay[];
}

/**
 * 连续达标天数。
 *
 * ⚠️ 判据是**达标**(当天 answers ≥ daily_goal),不是"有没有打开过 App" ——
 *    打开一下就算连续的话,这个数字对用户没有意义,他自己也不会信。
 * ⚠️ 今天没达标**不算断签**(一天还没过完)。从今天往前找:
 *    今天达标就从今天连,今天没达标就从昨天连。
 */
export function computeStreak(days: StudyDay[], goal: number, today = bjToday()): number {
  const met = new Set(days.filter(d => (d.answers ?? 0) >= goal).map(d => d.day));
  let cursor = met.has(today) ? today : shiftDay(today, -1);
  let n = 0;
  while (met.has(cursor)) { n++; cursor = shiftDay(cursor, -1); }
  return n;
}

/**
 * 记一次作答。**答对 +1 分;同一次里达成彻底掌握再 +2**。
 *
 * ⚠️ 积分只增不减 —— 掌握回退(答错降级)**不扣分**。
 *    扣分会让用户觉得"努力还会被没收",而积分的作用是记录投入不是评判水平。
 * ⚠️ 由 recordAnswer 调用,不要在页面里另外调 —— 否则一次作答会被记两遍。
 */
export async function bumpAnswer(correct: boolean, justMastered: boolean): Promise<void> {
  const uid = await currentUserId();
  if (!uid) return;
  const day = bjToday();
  const gained = (correct ? 1 : 0) + (justMastered ? 2 : 0);

  try {
    // 逐日:answers 累加(唯一索引让它幂等地变成"读改写")
    const { data: prevDay } = await db.from("vocab_study_days")
      .select("answers,seconds").eq("user_id", uid).eq("day", day).maybeSingle();
    await db.from("vocab_study_days").upsert({
      user_id: uid, day,
      answers: ((prevDay as StudyDay | null)?.answers ?? 0) + 1,
      seconds: (prevDay as StudyDay | null)?.seconds ?? 0,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id,day" });

    const { data: prev } = await db.from("vocab_user_stats")
      .select("total_points,total_correct,daily_goal,current_streak,longest_streak")
      .eq("user_id", uid).maybeSingle();
    const p = (prev as Partial<UserStats> | null) ?? {};
    const goal = p.daily_goal ?? DEFAULT_GOAL;

    // 连续天数要拿最近 400 天重算 —— 增量维护会在跨天/补签时算错
    const days = await listStudyDays(shiftDay(day, -400), day);
    const streak = computeStreak(days, goal, day);

    await db.from("vocab_user_stats").upsert({
      user_id: uid,
      total_points: (p.total_points ?? 0) + gained,
      total_correct: (p.total_correct ?? 0) + (correct ? 1 : 0),
      daily_goal: goal,
      current_streak: streak,
      longest_streak: Math.max(p.longest_streak ?? 0, streak),
      last_active_date: day,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });
  } catch { /* 激励数据写失败不该拦住做题主流程 */ }
}

/**
 * 累计学习时长。由时长追踪器每 30 秒 / 退出时调用。
 * ⚠️ 只加**活跃时长**(切后台已在追踪器里暂停),不是页面停留时间 ——
 *    挂着页面去吃饭不算学习,那种数字骗的是用户自己。
 */
export async function flushTime(ms: number): Promise<void> {
  if (ms <= 0) return;
  const uid = await currentUserId();
  if (!uid) return;
  const day = bjToday();
  try {
    const { data: prevDay } = await db.from("vocab_study_days")
      .select("answers,seconds").eq("user_id", uid).eq("day", day).maybeSingle();
    await db.from("vocab_study_days").upsert({
      user_id: uid, day,
      seconds: ((prevDay as StudyDay | null)?.seconds ?? 0) + Math.round(ms / 1000),
      answers: (prevDay as StudyDay | null)?.answers ?? 0,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id,day" });

    const { data: prev } = await db.from("vocab_user_stats")
      .select("total_time_ms").eq("user_id", uid).maybeSingle();
    await db.from("vocab_user_stats").upsert({
      user_id: uid,
      total_time_ms: ((prev as { total_time_ms: number } | null)?.total_time_ms ?? 0) + ms,
      last_active_date: day,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });
  } catch { /* 同上,不拦主流程 */ }
}

/** 分钟展示:超 6000 分钟(100 小时)切"小时",避免出现"12345 分钟"这种读不动的数。 */
export function fmtDuration(totalMs: number): string {
  const min = Math.round(totalMs / 60_000);
  if (min < 6000) return `${min} 分钟`;
  return `${(min / 60).toFixed(1)} 小时`;
}

/** 断签鼓励文案三套轮换 —— 不指责、不施压。按天轮换,同一天进来看到的是同一句。 */
const COMEBACK = [
  "连续纪录还在等你刷新,今天回来刚刚好。",
  "断了一次不算什么,今天开始又是新的一串。",
  "回来了就好。学过的词还在,只是需要见见面。",
];
export function comebackLine(day = bjToday()): string {
  const n = Number(day.replace(/-/g, "")) % COMEBACK.length;
  return COMEBACK[n];
}
