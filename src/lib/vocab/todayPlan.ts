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
import { currentUserId, listMistakes, type VocabWord } from "@/lib/vocab/data";
import { getStats } from "@/lib/vocab/stats";
import { byLearnOrder } from "@/lib/vocab/functionWords";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

/** 一天最多派多少复习词。超出按"最久未复习优先"截断,其余顺延到明天。 */
export const REVIEW_CAP = 50;

/** 未登录时派多少个新词试做(规格第五节)。 */
export const ANON_TRIAL = 20;

/** 取词详情时的列。与 data.ts 的 listBankWords 同一套,别在这里少列或多列。 */
const WORD_COLS = "id,headword,ipa,pos,def_zh,def_en,freq_rank,audio_url";

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
  due: { word: VocabWord; nextReviewAt: string | null; correctDays?: number; modes?: string[] }[],
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

  /* ⚠️ 复习词的题型**按该词自己的进度轮换**,不再一律 zh_choice。
     这是解开"掌握第三条"的那一步 —— 详见 pickMode 的注释。
     排序仍按词频,只有 mode 变了。 */
  const dueByWord = new Map(dueTaken.map(d => [d.word.id, d]));
  const reviewTasks: TodayTask[] = dueTaken
    .map(d => d.word).sort(byFreq)
    .map(w => {
      const d = dueByWord.get(w.id);
      return {
        word: w, kind: "review" as const, showCardFirst: false,
        mode: pickMode(d?.correctDays ?? 0, d?.modes ?? [], supportsOf(w)),
      };
    });

  /* 错题:用它当初错的那种题型练 —— 错在拼写就练拼写,换成选择题等于绕开了短板 */
  const mistakeTasks: TodayTask[] = [...mistakes]
    .sort((a, b) => byFreq(a.word, b.word))
    .map(m => ({ word: m.word, kind: "mistake" as const, mode: m.mode, showCardFirst: false }));

  /* 新词补足到每日目标。
     ⚠️ 分母是**今天已排的总量**,不是单独给新词一个配额 ——
        到期复习 40 个时目标 20 就不该再塞新词,否则"目标 20"变成"每天 60"。 */
  const used = reviewTasks.length + mistakeTasks.length;
  const room = Math.max(0, goal - used);
  /* ⚠️ 新词用 byLearnOrder 不是 byFreq:**虚词排到末尾**(Aaron 2026-08-10 定)。
     纯按词频的话,中考/高考库的头几张卡就是 the / of / a / to / it —— 词频确实最高,
     但没人需要一张 "the" 的学习卡。复习和错题**不降权**:那是用户已经学过的词,
     那里的顺序讲的是复习优先级,跟"该不该学这个词"是两回事。 */
  /* 新词走同一个 pickMode(correctDays=0 且一种都没答对过 → 必得 zh_choice)。
     写成同一条路是为了**不留第二处实现** —— 轮换表将来一改,新词这边不会掉队。 */
  const newTasks: TodayTask[] = [...fresh].sort(byLearnOrder).slice(0, room)
    .map(w => ({ word: w, kind: "new" as const, showCardFirst: true, mode: pickMode(0, [], supportsOf(w)) }));

  return { tasks: [...reviewTasks, ...mistakeTasks, ...newTasks], deferred };
}

/**
 * 题型轮换表 —— 「掌握」的第三条(modes_correct ≥ 2)全靠它。
 *
 * ── 为什么必须有 ────────────────────────────────────────────────
 * 原来复习/新词的 mode 全硬编码 `zh_choice`,于是一个词无论学多少天,
 * `modes_correct` 里永远只有一个值,第三条**永远为假**。
 * 库内实证(2026-08-17):1,108 条模式记录里 1,001 条是 zh_choice;
 * 某用户 710 个词里只有 22 个凑齐 2 种题型。
 * 唯一能产出第二种题型的是错题本(用它错过的那种题型)——
 * 等于"必须先答错才有机会掌握",把奖励接在惩罚上。
 *
 * ── ⚠️ 这张表里只能放「今日学习**真的出得了**的题型」 ──────────────
 * `VocabToday` 此前只区分 spell / 非 spell,非 spell 一律出中文义项选项。
 * 如果这里排进一个页面渲染不了的题型,界面出的还是英汉选择、写库却记成别的 ——
 * **等于替用户记上他没做过的题型**,正是规格里点名禁止的那条。
 * 所以 `en_choice` 和 `listen` 是连同 VocabToday 的渲染分支一起加的;
 * `match` 不在表里 —— 它是多词翻牌,不是单题,今日学习出不了。
 * 往这张表里加题型之前,先确认 VocabToday 有对应的渲染分支和判分逻辑。
 *
 * 顺序是 Aaron 的建议档位:0→认词义最轻,1→听音(音频已全库覆盖),
 * 2→反向检索,3+→拼写(最强的掌握证明)。**待 Aaron 最终确认,改这一行即可。**
 */
export const MODE_ROTATION: VocabMode[] = ["zh_choice", "listen", "en_choice", "spell"];

/** 这个词出得了哪些题型。listen 要音频、en_choice 要英文释义。 */
export function supportsOf(w: VocabWord): { audio: boolean; defEn: boolean } {
  return { audio: !!w.audio_url, defEn: !!(w.def_en || "").trim() };
}

/**
 * 这个词今天该考哪种题型。
 *
 * ⚠️ 判据是「**这个词还没答对过的**题型」,不是「按天数取第 N 档」。
 *    只按天数取的话,答错过、掉过档的词会反复吃到同一档,轮换等于没轮。
 * ⚠️ 还要看这个词**支持**哪些题型:listen 要 audio_url、en_choice 要 def_en。
 *    库里现在音频 100%,但 def_en 不保证每条都有;拿不到就跳过这一档,
 *    绝不能出一道选项全空的题。
 */
export function pickMode(
  correctDays: number,
  doneModes: Iterable<string>,
  supports: { audio: boolean; defEn: boolean },
): VocabMode {
  const done = new Set([...doneModes].filter(Boolean));
  const usable = (m: VocabMode) =>
    (m !== "listen" || supports.audio) && (m !== "en_choice" || supports.defEn);

  /* ① 先按天数取对应档位;没答对过且这个词支持,就用它 */
  const preferred = MODE_ROTATION[Math.min(Math.max(0, correctDays), MODE_ROTATION.length - 1)];
  if (!done.has(preferred) && usable(preferred)) return preferred;

  /* ② 否则从表里挑第一个「还没答对过 + 支持」的 —— 这才是真正解开第三条的那一步 */
  const fresh = MODE_ROTATION.find(m => !done.has(m) && usable(m));
  if (fresh) return fresh;

  /* ③ 全都答对过了(或都不支持):回到最轻的英汉选择。
     此时 modes.size 早已 ≥2,第三条不再是瓶颈,出什么都不影响掌握判定。 */
  return "zh_choice";
}

/** 错题本里记的模式 → 本模块的 VocabMode。认不出就退回最快的英汉选择。 */
export function normalizeMode(raw: string | null | undefined): VocabMode {
  const ok: VocabMode[] = ["zh_choice", "en_choice", "match", "listen", "spell"];
  return ok.includes(raw as VocabMode) ? (raw as VocabMode) : "zh_choice";
}

/**
 * 组今天的计划。
 * ⚠️ 未登录**给试做词而不是空计划** —— 空计划会被入口按钮读成"今天已完成"。
 *    真机 preview 上撞到过:未登录首页显示「今天已完成 · 再来 10 个新词」。
 */
export async function buildTodayPlan(bankId: string): Promise<TodayPlan> {
  const uid = await currentUserId();

  /* ⚠️ **不要 listBankWords(bankId)**。
   *    它把整库 4470 词全拉下来:23 次 200 一片的**串行**查询,实测 5.7 秒
   *    (并发化能到 2.5 秒、直接翻页 2.0 秒,但那只是把不该做的事做快一点)。
   *    今日学习真正需要的只有三小撮:**到期的 + 错题的 + 补新词用的高频若干**,
   *    实测 586ms —— 快约 10 倍。
   *    ⚠️ 这是 /vocab/today 首屏卡在「正在排今天的任务…」十几秒的根因(2026-08-09 体检查实)。 */

  if (!uid) {
    /* 未登录:只取高频前 ANON_TRIAL 个,不碰全库。
       ⚠️ 不能返回空计划 —— 空计划会被入口按钮读成"今天已完成",
          一个什么都没做的新用户被告知"已完成"是明确的错误信息。 */
    /* 同样要按库过滤 + 虚词降权:游客看到的试用词就是这个库的门面,
       第一张卡是 "the" 的话,他对这个库的第一印象就是"没什么可学的"。
       多取一些再降权截断 —— 虚词全挤在最高频段,直接取 ANON_TRIAL 个会全是虚词。 */
    const { data } = await db.from("vocab_words")
      .select(`${WORD_COLS},vocab_word_banks!inner(bank_id)`)
      .eq("vocab_word_banks.bank_id", bankId)
      .not("def_zh", "is", null).order("freq_rank", { ascending: true, nullsFirst: false })
      .limit(Math.max(200, ANON_TRIAL));
    const trial = ((data || []) as VocabWord[]).sort(byLearnOrder).slice(0, ANON_TRIAL).map(w => ({
      word: w, kind: "new" as const, mode: "zh_choice" as const, showCardFirst: true,
    }));
    return {
      tasks: trial,
      counts: { review: 0, mistake: 0, new: trial.length, total: trial.length },
      deferred: 0, goal: EMPTY_PLAN.goal,
    };
  }

  const nowIso = new Date().toISOString();
  const [stats, dueRes, mistakes] = await Promise.all([
    getStats().catch(e => { console.log("[今日学习] ✗ 取 stats 失败,回落默认目标", e); return null; }),
    /* 只要**到期的**,不要全部掌握度行 */
    /* ⚠️ 必须连 correct_days / modes_correct 一起取 —— 题型轮换要知道
       "这个词已经答对过哪几种题型"。只取 next_review_at 的话 pickMode 拿不到
       任何依据,会对每个词都返回 zh_choice,**轮换在代码里存在、在运行时等于没开**。 */
    db.from("user_vocab_mastery")
      .select("word_id,next_review_at,correct_days,modes_correct")
      .eq("user_id", uid).lte("next_review_at", nowIso).limit(2000),
    listMistakes().catch(e => { console.log("[今日学习] ✗ 取错题失败,本轮不含错题", e); return []; }),
  ]);
  const goal = stats?.daily_goal ?? EMPTY_PLAN.goal;

  const dueRows = ((dueRes?.data || []) as {
    word_id: string; next_review_at: string | null;
    correct_days: number | null; modes_correct: string[] | null;
  }[]);
  const mistakeRows = (mistakes as { word_id: string; last_wrong_mode: string | null }[]);
  const mistakeIds = new Set(mistakeRows.map(m => m.word_id));

  /* 一次取齐"到期 + 错题"这两小撮的词详情(实测约 11 条 / 377ms) */
  const needIds = [...new Set([...dueRows.map(d => d.word_id), ...mistakeIds])];
  const byId = new Map<string, VocabWord>();
  if (needIds.length) {
    for (let i = 0; i < needIds.length; i += 200) {
      const { data } = await db.from("vocab_words").select(WORD_COLS).in("id", needIds.slice(i, i + 200));
      for (const w of ((data || []) as VocabWord[])) byId.set(w.id, w);
    }
  }

  /* 补新词:只取高频前若干。
     ⚠️ 取 goal + 已排量 + 余量 是为了**扣掉已学过的**之后仍够用 ——
        直接取 goal 个会在用户学过前几十个高频词后越取越不够。
     ⚠️ 下限 200:虚词要沉到末尾(见 byLearnOrder),而虚词**恰恰全挤在最高频那一段**
        (实测中考前 100 名里 42 个是虚词)。窗口太窄的话,降权之后就没剩几个实词可派了。
        200 个里最少也有 145 个实词,够任何日目标用。 */
  const freshNeed = Math.max(0, goal) + needIds.length + 60;
  const { data: freshRaw } = await db.from("vocab_words")
    /* ⚠️ **必须按词库过滤**。这一句原来是全表查 —— `bankId` 收了却从没用过,
     *    于是无论用户选哪个库,今日学习都从**全表**最高频的词里取。
     *    2026-08-10 灌进中考词库(含 the/be/and/of/a)之后当场暴露:
     *    实测托福用户的今日学习也变成 the / be / and / of / a 开头。
     *    (查证方式:同一条 REST 查询,加 bank 内连接 → defense/attorney/participant…;
     *     不加 → the/be/and/of/a,和全局第一页一模一样。)
     *    内连接过滤只需**一次**请求,不破坏这里"别拉全库"的性能前提。 */
    .select(`${WORD_COLS},vocab_word_banks!inner(bank_id)`)
    .eq("vocab_word_banks.bank_id", bankId)
    .not("def_zh", "is", null).order("freq_rank", { ascending: true, nullsFirst: false })
    .limit(Math.min(500, Math.max(200, freshNeed)));
  /* 已作答过的词不能当新词。只查这一小批的掌握度,不拉全表。 */
  const freshIds = ((freshRaw || []) as VocabWord[]).map(w => w.id);
  const touched = new Set<string>();
  if (freshIds.length) {
    const { data } = await db.from("user_vocab_mastery").select("word_id")
      .eq("user_id", uid).in("word_id", freshIds);
    for (const r of ((data || []) as { word_id: string }[])) touched.add(r.word_id);
  }
  const fresh = ((freshRaw || []) as VocabWord[])
    .filter(w => !touched.has(w.id) && !byId.has(w.id));

  /* 同一个词既到期又在错题本 → 只出一次,算错题(用它当初错的题型练,信息量更大) */
  const dueOnly = dueRows
    .filter(d => !mistakeIds.has(d.word_id) && byId.has(d.word_id))
    .map(d => ({
      word: byId.get(d.word_id)!, nextReviewAt: d.next_review_at,
      correctDays: d.correct_days ?? 0, modes: d.modes_correct ?? [],
    }));
  const mistakeList = mistakeRows
    .filter(m => byId.has(m.word_id))
    .map(m => ({ word: byId.get(m.word_id)!, mode: normalizeMode(m.last_wrong_mode) }));

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

/**
 * 明天会有多少词到期 —— 结算页显示,让用户知道明天还得来。
 * ⚠️ 同样**不拉全库**:只数掌握度表里落在"现在 → 明天 23:59"区间的行。
 *    原实现先 listBankWords(4470 词)再取交集,为了一个计数付 5 秒,不值。
 *    代价:不再按词库过滤。当前只有托福一个库有词,结果一致;
 *    第二个库上线后这个数会变成"跨库到期总数" —— 到那时再按 bank 收窄。
 */
export async function countDueTomorrow(_bankId: string): Promise<number> {
  const uid = await currentUserId();
  if (!uid) return 0;
  const end = new Date(); end.setDate(end.getDate() + 1); end.setHours(23, 59, 59, 999);
  const { data, error } = await db.from("user_vocab_mastery")
    .select("word_id", { count: "exact" })
    .eq("user_id", uid)
    .gt("next_review_at", new Date().toISOString())
    .lte("next_review_at", end.toISOString());
  if (error) { console.log("[今日学习] ✗ 数明日到期失败", error); return 0; }
  return (data || []).length;
}

/** 间隔表对外暴露一份,结算页说"下次 N 天后再见"时用,别在 UI 里另写一份。 */
export { REVIEW_INTERVALS };
