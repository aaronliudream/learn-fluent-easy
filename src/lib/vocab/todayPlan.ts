/**
 * 「今日学习」任务编排。
 *
 * 一句话:用户点一下就知道今天学什么,不用自己选模式、不用自己决定学多少。
 *
 * ── 与规格的两处出入(以实测为准,2026-08-09 查库)──
 * ⚠️ 规格写的 `interval` / `srs_step` **不存在**。库里是 `review_interval_idx`(存**下标**不是天数),
 *    间隔表 `REVIEW_INTERVALS = [1,2,4,7,15,30]` 已在 vocabMastery.ts。
 * ⚠️ `last_wrong_mode` 在 **`vocab_mistake_book`**,不在 user_vocab_mastery。
 * ⚠️ 规格第三节「遗忘曲线复习」**已经实现了**,本模块不动它:
 *    答对推进下一档、答错回第 0 档并进错题本、掌握的词封顶在 30 天档(不是永久消失)——
 *    `vocabMastery.recordAnswer` 里逐条对得上。本模块只负责**挑今天该练哪些词、按什么顺序**。
 */
import { REVIEW_INTERVALS, type VocabMode } from "@/lib/vocab/vocabMastery";
import { supabase } from "@/integrations/supabase/client";
import { currentUserId, listBankWords, listMistakes, type VocabWord } from "@/lib/vocab/data";
import { getStats } from "@/lib/vocab/stats";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

/** 一天最多派多少复习词。超出按"最久未复习优先"截断,其余顺延到明天。 */
export const REVIEW_CAP = 50;

export type TaskKind = "review" | "mistake" | "new";

export type TodayTask = {
  word: VocabWord;
  kind: TaskKind;
  /** 用哪种题型考。错题用它错过的那种;复习用最快的英汉选择;新词先看卡再考。 */
  mode: VocabMode;
  /** 新词才为 true:先出一张词卡看一遍,再出题 */
  showCardFirst: boolean;
};

export type TodayPlan = {
  tasks: TodayTask[];
  counts: { review: number; mistake: number; new: number; total: number };
  /** 到期量超过 REVIEW_CAP 时被顺延的条数 —— 要在 UI 上说出来,不能静默丢 */
  deferred: number;
  goal: number;
};

export const EMPTY_PLAN: TodayPlan = {
  tasks: [], counts: { review: 0, mistake: 0, new: 0, total: 0 }, deferred: 0, goal: 20,
};

type MasteryLite = {
  word_id: string;
  next_review_at: string | null;
  review_interval_idx: number | null;
  tested_count: number | null;
};

/**
 * 排序与截断 —— **纯函数,单独测**。
 *
 * 规则(Aaron 2026-08-09):
 *   ① 先复习、再错题、最后新词 —— 复习是保本,新学是增量,顺序不能反;
 *   ② 同一批内按 freq_rank 高频→低频;
 *   ③ 复习超过 REVIEW_CAP 时按**最久未复习优先**截断(next_review_at 越早越优先),
 *      其余顺延 —— 不是随机丢,也不是丢最早的。
 *
 * ⚠️ 错题优先于新词但**后于**复习:错题是"已经学过又错了",性质更接近复习;
 *    但到期复习词是有时限的(过了今天就积压),错题没有时限,所以复习排前面。
 */
export function orderTasks(
  due: { word: VocabWord; nextReviewAt: string | null }[],
  mistakes: { word: VocabWord; mode: VocabMode }[],
  fresh: VocabWord[],
  goal: number,
): { tasks: TodayTask[]; deferred: number } {
  const byFreq = (a: VocabWord, b: VocabWord) =>
    (a.freq_rank ?? Number.MAX_SAFE_INTEGER) - (b.freq_rank ?? Number.MAX_SAFE_INTEGER);

  /* 复习:先按"最久未复习"排(next_review_at 升序 = 到期最早 = 拖得最久),
     截到 CAP 之后,派出去的那批再按词频排,读起来顺。 */
  const dueSorted = [...due].sort((a, b) => (a.nextReviewAt ?? "").localeCompare(b.nextReviewAt ?? ""));
  const dueTaken = dueSorted.slice(0, REVIEW_CAP);
  const deferred = Math.max(0, dueSorted.length - REVIEW_CAP);

  const reviewTasks: TodayTask[] = dueTaken
    .map(d => d.word).sort(byFreq)
    .map(w => ({ word: w, kind: "review" as const, mode: "zh_choice" as const, showCardFirst: false }));

  /* 错题:用它当初错的那种题型练 —— 错在拼写就练拼写,换成选择题等于绕开了短板 */
  const mistakeTasks: TodayTask[] = [...mistakes]
    .sort((a, b) => byFreq(a.word, b.word))
    .map(m => ({ word: m.word, kind: "mistake" as const, mode: m.mode, showCardFirst: false }));

  /* 新词补足到每日目标。
     ⚠️ 分母是**今天已排的总量**,不是单独给新词一个配额 ——
        到期复习 40 个时目标 20 就不该再塞新词,否则"目标 20"变成"每天 60"。 */
  const used = reviewTasks.length + mistakeTasks.length;
  const room = Math.max(0, goal - used);
  const newTasks: TodayTask[] = [...fresh].sort(byFreq).slice(0, room)
    .map(w => ({ word: w, kind: "new" as const, mode: "zh_choice" as const, showCardFirst: true }));

  return { tasks: [...reviewTasks, ...mistakeTasks, ...newTasks], deferred };
}

/** 错题本里记的模式 → 本模块的 VocabMode。认不出就退回最快的英汉选择。 */
export function normalizeMode(raw: string | null | undefined): VocabMode {
  const ok: VocabMode[] = ["zh_choice", "en_choice", "match", "listen", "spell"];
  return ok.includes(raw as VocabMode) ? (raw as VocabMode) : "zh_choice";
}

/**
 * 组今天的计划。
 * ⚠️ 未登录返回空计划但**不抛错** —— 按钮仍要在,点了才提示登录(规格第五节)。
 */
export async function buildTodayPlan(bankId: string): Promise<TodayPlan> {
  const uid = await currentUserId();
  const pool = await listBankWords(bankId);
  const byId = new Map(pool.map(w => [w.id, w]));
  if (!uid) return { ...EMPTY_PLAN, tasks: [], counts: { review: 0, mistake: 0, new: 0, total: 0 } };

  const [stats, mastRes, mistakes] = await Promise.all([
    getStats().catch(() => null),
    db.from("user_vocab_mastery")
      .select("word_id,next_review_at,review_interval_idx,tested_count")
      .eq("user_id", uid).limit(5000),
    listMistakes().catch(() => []),
  ]);
  const goal = stats?.daily_goal ?? EMPTY_PLAN.goal;
  const mast = ((mastRes?.data || []) as MasteryLite[]).filter(m => byId.has(m.word_id));
  const touched = new Set(mast.map(m => m.word_id));

  const nowIso = new Date().toISOString();
  const due = mast
    .filter(m => m.next_review_at && m.next_review_at <= nowIso)
    .map(m => ({ word: byId.get(m.word_id)!, nextReviewAt: m.next_review_at }));

  /* 错题:只取本词库里的;它们可能同时也到期复习 —— 去重时**错题优先**,
     因为错题要用它错过的那种题型练,信息量更大。 */
  const dueIds = new Set(due.map(d => d.word.id));
  const mistakeList = (mistakes as { word_id: string; last_wrong_mode: string | null }[])
    .filter(m => byId.has(m.word_id))
    .map(m => ({ word: byId.get(m.word_id)!, mode: normalizeMode(m.last_wrong_mode) }));
  const mistakeIds = new Set(mistakeList.map(m => m.word.id));
  const dueOnly = due.filter(d => !mistakeIds.has(d.word.id));

  const fresh = pool.filter(w => !touched.has(w.id) && !mistakeIds.has(w.id) && !dueIds.has(w.id));

  const { tasks, deferred } = orderTasks(dueOnly, mistakeList, fresh, goal);
  return {
    tasks,
    counts: {
      review: tasks.filter(t => t.kind === "review").length,
      mistake: tasks.filter(t => t.kind === "mistake").length,
      new: tasks.filter(t => t.kind === "new").length,
      total: tasks.length,
    },
    deferred,
    goal,
  };
}

/** 明天会有多少词到期 —— 结算页要显示,让用户知道明天还得来。 */
export async function countDueTomorrow(bankId: string): Promise<number> {
  const uid = await currentUserId();
  if (!uid) return 0;
  const pool = await listBankWords(bankId);
  const ids = new Set(pool.map(w => w.id));
  const end = new Date(); end.setDate(end.getDate() + 1); end.setHours(23, 59, 59, 999);
  const { data } = await db.from("user_vocab_mastery")
    .select("word_id,next_review_at").eq("user_id", uid).lte("next_review_at", end.toISOString());
  const now = new Date().toISOString();
  return ((data || []) as MasteryLite[])
    .filter(m => ids.has(m.word_id) && m.next_review_at && m.next_review_at > now).length;
}

/** 间隔表对外暴露一份,结算页说"下次 N 天后再见"时用,别在 UI 里另写一份。 */
export { REVIEW_INTERVALS };
