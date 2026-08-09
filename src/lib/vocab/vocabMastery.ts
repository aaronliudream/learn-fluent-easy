/**
 * 掌握度内核 —— **全板块唯一的掌握逻辑实现**。
 *
 * PR-2/3/4 的所有测试模式(英汉选择/词汇配对/听音辨义/听写挑战/错题闯关)
 * 一律调 `recordAnswer()`,**禁止各写一套**。各写一套的后果不是"代码重复"那么轻,
 * 是同一个词在不同模式下算出不同的掌握状态,用户看到的是"仪表盘说掌握了、
 * 复习队列还在推"这种鬼故事,而且事后无法追查是哪条路径写坏的。
 *
 * 规则严格照 docs/vocab-bank/VOCAB_DESIGN_SPEC.md 第 7 节,逐条对应见下面注释。
 *
 * ⚠️ 只有"作答"入表。浏览词卡、点朗读、听音频都不入表、不改任何计数(spec 7.1)——
 *    这条决定统计的可信度:翻一遍词卡不能算学过。
 */
import { supabase } from "@/integrations/supabase/client";
import { logFail } from "@/lib/vocab/report";
import { bumpAnswer } from "@/lib/vocab/stats";
import { bjToday } from "@/lib/charts/growthBuckets";
import { currentUserId, isMasteredRow } from "@/lib/vocab/data";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

/** 作答模式。写进 modes_correct 去重数组,掌握判定要求 ≥2 种。 */
export type VocabMode = "zh_choice" | "en_choice" | "match" | "listen" | "spell";

/** 复习间隔(天),下标即 review_interval_idx(spec 7.6)。 */
export const REVIEW_INTERVALS = [1, 2, 4, 7, 15, 30];

/** 免费额度:与 user_vocab_mastery 的 INSERT RLS 策略 uvm_own_insert_quota 同值。 */
export const FREE_MASTERY_QUOTA = 200;

export type RecordResult = {
  /** 是否真的写进去了 */
  saved: boolean;
  /** 免费额度用完(且无 vocab_all 权益)—— UI 弹占位提示,不是报错 */
  quotaBlocked?: boolean;
  /** 未登录 —— 走 guest 本地记录(PR-5),这里不写库 */
  anonymous?: boolean;
  /** 本次之后该词是否达成掌握(用于上浮打勾/里程碑判定) */
  masteredNow?: boolean;
  /** 本次是否把该词移出了错题本 */
  clearedMistake?: boolean;
  /** 写库失败的原始信息(仅用于日志,不直接给用户看) */
  error?: string;
};

type MasteryRow = {
  user_id: string;
  word_id: string;
  mastery_level: number;
  correct_days: number;
  last_correct_date: string | null;
  modes_correct: string[] | null;
  tested_count: number;
  review_interval_idx: number;
  next_review_at: string | null;
  first_learned_date: string | null;
};

/** 今天 + n 天的 ISO 时间戳(北京日历算,存 timestamptz)。 */
function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

/** 是否持有未过期的 vocab_all 权益(持有则不受 200 条配额限制)。 */
async function hasUnlimited(uid: string): Promise<boolean> {
  const { data, error } = await db
    .from("user_entitlements")
    .select("sku")
    .eq("user_id", uid)
    .eq("sku", "vocab_all")
    .gt("active_until", new Date().toISOString())
    .limit(1);
  if (error) return false;   // 查不到就当没有,让配额兜底(宁可提示解锁,不要放过)
  return (data || []).length > 0;
}

/** 当前用户已有多少条掌握记录(配额预检用)。 */
async function masteryRowCount(uid: string): Promise<number> {
  const { count, error } = await db
    .from("user_vocab_mastery")
    .select("word_id", { count: "exact", head: true })
    .eq("user_id", uid);
  if (error) return 0;
  return count ?? 0;
}

/**
 * 记录一次作答 —— 掌握度、复习档、错题本、成长图三条序列,一次全部落地。
 *
 * @param wordId  作答的词
 * @param correct 对错
 * @param mode    题型(掌握判定要求跨 ≥2 种题型答对过)
 */
export async function recordAnswer(wordId: string, correct: boolean, mode: VocabMode): Promise<RecordResult> {
  const uid = await currentUserId();
  // 未登录:RLS 本来就拒写(策略绑 auth.uid()),这里提前返回,
  // 由 PR-5 的 guest 逻辑在本地记账,不要让它走到写库再吃一个 403。
  if (!uid) return { saved: false, anonymous: true };

  const today = bjToday();

  try {
    const { data: existing, error: readErr } = await db
      .from("user_vocab_mastery")
      .select("user_id,word_id,mastery_level,correct_days,last_correct_date,modes_correct,tested_count,review_interval_idx,next_review_at,first_learned_date")
      .eq("user_id", uid)
      .eq("word_id", wordId)
      .maybeSingle();
    if (readErr) throw readErr;

    const prev = (existing as MasteryRow | null) ?? null;
    const isNewWord = !prev;

    // ── 配额预检(方案 A)──
    // 只有**新增一行**才受配额约束;已有记录的词继续答不受影响。
    // 预检是为了给用户一句人话;真正的边界是 RLS,下面 catch 里还兜一次。
    if (isNewWord) {
      const unlimited = await hasUnlimited(uid);
      if (!unlimited && (await masteryRowCount(uid)) >= FREE_MASTERY_QUOTA) {
        return { saved: false, quotaBlocked: true };
      }
    }

    const level = prev?.mastery_level ?? 0;
    const correctDays = prev?.correct_days ?? 0;
    const modes = new Set((prev?.modes_correct ?? []).filter(Boolean));
    const tested = prev?.tested_count ?? 0;
    const idx = prev?.review_interval_idx ?? 0;
    const firstDayDone = prev?.last_correct_date !== today;   // 当天首次答对?

    let next: Partial<MasteryRow>;
    if (correct) {
      // spec 7.2:当天第二次答对**不再**加 level / correct_days,
      // 否则刷同一个词十遍就"掌握"了;但 modes_correct 仍要并入 —— 换题型答对是有信息量的。
      const nextIdx = Math.min(idx + 1, REVIEW_INTERVALS.length - 1);
      modes.add(mode);
      next = {
        mastery_level: firstDayDone ? Math.min(level + 1, 5) : level,
        correct_days: firstDayDone ? correctDays + 1 : correctDays,
        last_correct_date: today,
        modes_correct: [...modes],
        tested_count: tested + 1,
        review_interval_idx: nextIdx,
        next_review_at: daysFromNow(REVIEW_INTERVALS[nextIdx]),
      };
    } else {
      // spec 7.3:-2 是刻意的 —— 惩罚必须大于奖励(+1),
      // 否则蒙对蒙错各半的词会缓慢爬到"掌握"。
      next = {
        mastery_level: Math.max(level - 2, 0),
        correct_days: correctDays,
        last_correct_date: prev?.last_correct_date ?? null,
        modes_correct: [...modes],
        tested_count: tested + 1,
        review_interval_idx: 0,                    // 答错回第一档
        next_review_at: daysFromNow(REVIEW_INTERVALS[0]),
      };
    }

    const row = {
      user_id: uid,
      word_id: wordId,
      ...next,
      // 首学日:只在这行第一次出现时写,之后永不改动(成长图的「新增」序列靠它)
      first_learned_date: prev?.first_learned_date ?? today,
      updated_at: new Date().toISOString(),
    };

    const { error: upErr } = await db
      .from("user_vocab_mastery")
      .upsert(row, { onConflict: "user_id,word_id" });
    if (upErr) throw upErr;

    // ── 成长图「复习」序列 ──
    // 只有**已经学过的词再次作答**才算复习;第一次学那次记「新增」(first_learned_date)。
    // 这样三条柱互不重复计数。
    if (!isNewWord) await bumpReviewDaily(uid, today);

    const masteredNow = isMasteredRow({
      mastery_level: next.mastery_level ?? 0,
      correct_days: next.correct_days ?? 0,
      modes_correct: (next.modes_correct as string[]) ?? [],
    });

    const clearedMistake = correct
      ? await onCorrectStreak(uid, wordId, today)
      : (await addMistake(uid, wordId, mode), false);

    /* 积分与逐日计数走 stats.ts 的单一入口 —— 页面不许另外调,
     * 否则一次作答会被记两遍。答对 +1,同一次达成彻底掌握再 +2。
     * ⚠️ await 但不让它的失败影响本函数返回:激励数据是附加价值,
     *    掉了下次补得回来,不该拖垮做题主流程。 */
    await bumpAnswer(correct, masteredNow);

    return { saved: true, masteredNow, clearedMistake };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    // RLS 把配额拒了(预检与实际写入之间有竞态,或权益刚过期)——
    // 翻译成"额度用完",绝不把 42501/new row violates row-level security 这种话丢给用户。
    if (/row-level security|violates|42501|permission denied/i.test(msg)) {
      return { saved: false, quotaBlocked: true, error: msg };
    }
    return { saved: false, error: msg };
  }
}

/** 成长图「复习」序列:当天计数 +1。失败不影响主流程(统计次要于学习记录)。 */
async function bumpReviewDaily(uid: string, day: string): Promise<void> {
  try {
    const { data } = await db
      .from("vocab_review_daily")
      .select("reviewed")
      .eq("user_id", uid)
      .eq("day", day)
      .maybeSingle();
    const reviewed = ((data as { reviewed: number } | null)?.reviewed ?? 0) + 1;
    await db.from("vocab_review_daily")
      .upsert({ user_id: uid, day, reviewed, updated_at: new Date().toISOString() }, { onConflict: "user_id,day" });
  } catch (e) { logFail("vocabMastery/bumpReviewDaily", e); /* 统计写失败不该拦住用户做题 */ }
}

/**
 * 答错 → 入错题本(spec 7.7)。
 * ⚠️ streak_days 必须清零:错一次,之前攒的连对进度作废。
 *    已移出的词再错要重新入册(status 拉回 active、cleared_at 清空)。
 */
async function addMistake(uid: string, wordId: string, mode: VocabMode): Promise<void> {
  try {
    const { data: headword } = await db.from("vocab_words").select("headword").eq("id", wordId).maybeSingle();
    const { data: prev } = await db
      .from("vocab_mistake_book")
      .select("wrong_total")
      .eq("user_id", uid).eq("word_id", wordId).maybeSingle();
    await db.from("vocab_mistake_book").upsert({
      user_id: uid,
      word_id: wordId,
      headword_snapshot: (headword as { headword: string } | null)?.headword ?? null,
      wrong_total: ((prev as { wrong_total: number } | null)?.wrong_total ?? 0) + 1,
      last_wrong_mode: mode,
      status: "active",
      streak_days: 0,
      last_streak_date: null,
      cleared_at: null,
    }, { onConflict: "user_id,word_id" });
  } catch { /* 错题本写失败不该拦住主流程,下次答错会补上 */ }
}

/**
 * 答对 → 推进错题本连对(spec 7.7)。返回本次是否把词移出了错题本。
 *
 * streak_days 的三条定义缺一不可:
 *   ① 不同自然日:同一天连对 3 次只算 1 天(靠 last_streak_date <> 今天 判断)
 *   ② 中间无错:答错时 addMistake 会把 streak_days 清零
 *   ③ **全站任何答对都算** —— 不限于在错题关里答对,正常学习中答对同样累加。
 *      所以这个函数挂在 recordAnswer 上,而不是挂在错题关组件里。
 */
async function onCorrectStreak(uid: string, wordId: string, today: string): Promise<boolean> {
  try {
    const { data } = await db
      .from("vocab_mistake_book")
      .select("streak_days,last_streak_date,status")
      .eq("user_id", uid).eq("word_id", wordId).maybeSingle();
    const row = data as { streak_days: number; last_streak_date: string | null; status: string } | null;
    if (!row || row.status !== "active") return false;      // 不在错题本里,无事可做
    if (row.last_streak_date === today) return false;       // 今天已经计过一次

    const streak = (row.streak_days ?? 0) + 1;
    const cleared = streak >= 3;
    await db.from("vocab_mistake_book").update({
      streak_days: streak,
      last_streak_date: today,
      ...(cleared ? { status: "cleared", cleared_at: new Date().toISOString() } : {}),
    }).eq("user_id", uid).eq("word_id", wordId);
    return cleared;
  } catch {
    return false;
  }
}

/** 到期复习队列:next_review_at <= now,按到期时间升序。 */
export async function dueQueue(limit = 20): Promise<string[]> {
  const uid = await currentUserId();
  if (!uid) return [];
  const { data, error } = await db
    .from("user_vocab_mastery")
    .select("word_id,next_review_at")
    .eq("user_id", uid)
    .lte("next_review_at", new Date().toISOString())
    .order("next_review_at", { ascending: true })
    .limit(limit);
  if (error) return [];
  return ((data || []) as { word_id: string }[]).map(r => r.word_id);
}
