/**
 * 词汇板块 · 数据访问层 —— 直连 vocab_* 表(照 src/lib/library/data.ts 先例)。
 *
 * vocab_* 是新表,还没进 supabase 生成类型(types.ts),所以对 client 做 `as any`,
 * 结果 cast 成本文件手写的接口 —— tsc 干净,运行期照常。类型在此单一事实来源。
 *
 * ⚠️ 只走 anon key + RLS。内容表(banks/words/examples)是公开可读;
 *    user_vocab_mastery / vocab_mistake_book 的 RLS 绑 auth.uid(),未登录读到空数组,
 *    这是**预期行为**,页面必须能正常渲染 0 态,不能当异常处理。
 *
 * ⚠️ PostgREST 单次最多 1000 行 —— 词表一律翻页取。
 *    现在托福库 198 词看不出问题,放量到 4471 词时裸查会**静默截断**,查都难查。
 */
import { supabase } from "@/integrations/supabase/client";
import { fallback } from "@/lib/vocab/report";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

const PAGE = 1000;

export type VocabBank = {
  id: string;
  code: string;
  name_zh: string;
  name_en: string | null;
  total_words: number;
  is_free: boolean;
  is_active: boolean;
  sort_order: number;
};

export type VocabWord = {
  id: string;
  headword: string;
  ipa: string | null;
  pos: string | null;
  def_zh: string | null;
  def_en: string | null;
  freq_rank: number | null;
  audio_url: string | null;
};

export type VocabExample = {
  id: string;
  word_id: string;
  sort_order: number;
  collocation: string | null;
  sentence: string;
  translation_zh: string;
  scene: string | null;
  audio_url: string | null;
};

/** 用户在某词库的掌握度汇总(spec 第 6 节的三个口径)。 */
export type BankProgress = {
  mastered: number;   // 已掌握
  learning: number;   // 学习中
  untouched: number;  // 未开始
  total: number;
};

/** 掌握度原始行(成长图/仪表盘共用)。 */
export type MasteryRow = {
  word_id: string;
  mastery_level: number;
  correct_days: number;
  last_correct_date: string | null;
  modes_correct: string[] | null;
  tested_count: number;
  /** 第一次答对那天 —— 成长图「新学」系列的唯一数据源 */
  first_learned_date?: string | null;
};

/**
 * 掌握判定 —— spec 第 7.4 节三条**同时**成立。
 * ⚠️ 全板块只此一处实现,仪表盘/成长图/PR-2 的写入侧都引它。
 *    各写一套必然出现"仪表盘说掌握了、复习队列还在推"这种鬼故事。
 */
export function isMasteredRow(r: Pick<MasteryRow, "mastery_level" | "correct_days" | "modes_correct">): boolean {
  const modes = new Set((r.modes_correct || []).filter(Boolean));
  return (r.mastery_level ?? 0) >= 4 && (r.correct_days ?? 0) >= 4 && modes.size >= 2;
}

/** 当前用户的掌握度行。wordIds 传了就只取那些词(词库页用),不传取全部(中心页用)。 */
export async function listMasteryRows(wordIds?: string[]): Promise<MasteryRow[]> {
  const uid = await currentUserId();
  if (!uid) return [];
  /* ⚠️ first_learned_date 必须取 —— 成长图的「新学」系列全靠它。
   *    之前没 select,于是那条系列恒为 0,新用户的图永远全空。 */
  const cols = "word_id,mastery_level,correct_days,last_correct_date,modes_correct,tested_count,first_learned_date";
  const out: MasteryRow[] = [];
  if (wordIds && wordIds.length) {
    for (let i = 0; i < wordIds.length; i += 200) {
      const { data, error } = await db.from("user_vocab_mastery").select(cols)
        .eq("user_id", uid).in("word_id", wordIds.slice(i, i + 200));
      if (error) throw error;
      out.push(...((data || []) as MasteryRow[]));
    }
    return out;
  }
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await db.from("user_vocab_mastery").select(cols)
      .eq("user_id", uid).range(from, from + PAGE - 1);
    if (error) throw error;
    const rows = (data || []) as MasteryRow[];
    out.push(...rows);
    if (rows.length < PAGE) return out;
  }
}

/* ⚠️ uid 做短 TTL 记忆化。
 * `supabase.auth.getUser()` 是**网络请求**(服务端验 JWT),不是读本地缓存。
 * 而 data.ts 里几乎每个函数都独立调它一次:dueCount / mistakeCount /
 * totalMastered / listMasteryRows / 每个词库的 progress …
 * 中心页一次冷启动能凭空多出 5 次 auth 往返 —— 这是"请求数从 28 降到 5
 * 但体感没变"的剩余瓶颈。
 * TTL 30 秒:够覆盖一次页面加载的所有调用,又不会让登出后仍拿到旧 uid。 */
let uidCache: { id: string | null; at: number } | null = null;
const UID_TTL_MS = 30_000;
export function clearUserIdCache() { uidCache = null; }
export async function currentUserId(): Promise<string | null> {
  if (uidCache && Date.now() - uidCache.at < UID_TTL_MS) return uidCache.id;
  const { data } = await supabase.auth.getUser();
  const id = data?.user?.id ?? null;
  uidCache = { id, at: Date.now() };
  return id;
}

/** 全部词库,按 sort_order。含 is_active=false 的(前端分区展示"敬请期待")。 */
export async function listBanks(): Promise<VocabBank[]> {
  const { data, error } = await db
    .from("vocab_banks")
    .select("id,code,name_zh,name_en,total_words,is_free,is_active,sort_order")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data || []) as VocabBank[];
}

export async function getBankByCode(code: string): Promise<VocabBank | null> {
  const { data, error } = await db
    .from("vocab_banks")
    .select("id,code,name_zh,name_en,total_words,is_free,is_active,sort_order")
    .eq("code", code)
    .maybeSingle();
  if (error) throw error;
  return (data as VocabBank) ?? null;
}

/** 某词库下的全部 word_id(翻页)。 */
async function bankWordIds(bankId: string): Promise<string[]> {
  const out: string[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await db
      .from("vocab_word_banks")
      .select("word_id")
      .eq("bank_id", bankId)
      .range(from, from + PAGE - 1);
    if (error) throw error;
    const rows = (data || []) as { word_id: string }[];
    out.push(...rows.map(r => r.word_id));
    if (rows.length < PAGE) return out;
  }
}

/**
 * 词库词表,按 freq_rank 升序(最高频在前)。
 * 只取有内容的词(def_zh 非空)—— 词表已灌但内容没跟上的批次不该出现在浏览列表里,
 * 否则用户点开是一张空卡。
 */
/* 会话内词表缓存:同一个词库的全量词在一次会话里不会变,
 * 但每轮"再来一轮"都要重新拉一遍(翻页 5 次 + 分批 23 次 = 28 次往返),
 * 实测轮间"出题中"约 3 秒,这是大头。
 * ⚠️ 只缓存**内容**(词形/释义/音频),不缓存任何用户状态 ——
 *    掌握度每答一题都在变,缓存它会让状态过滤用上旧数据。 */
const bankWordsCache = new Map<string, VocabWord[]>();
export function clearBankWordsCache() { bankWordsCache.clear(); }

export async function listBankWords(bankId: string): Promise<VocabWord[]> {
  const hit = bankWordsCache.get(bankId);
  if (hit) return hit;
  const ids = await bankWordIds(bankId);
  if (!ids.length) return [];
  const out: VocabWord[] = [];
  // in.(...) 分片,避免 URL 过长
  for (let i = 0; i < ids.length; i += 200) {
    const slice = ids.slice(i, i + 200);
    const { data, error } = await db
      .from("vocab_words")
      .select("id,headword,ipa,pos,def_zh,def_en,freq_rank,audio_url")
      .in("id", slice)
      .not("def_zh", "is", null);
    if (error) throw error;
    out.push(...((data || []) as VocabWord[]));
  }
  out.sort((a, b) => (a.freq_rank ?? 1e9) - (b.freq_rank ?? 1e9) || a.headword.localeCompare(b.headword));
  bankWordsCache.set(bankId, out);
  return out;
}

/** 单词的三条例句(按 sort_order:1 = 最高频搭配)。列表行展开时按需取。 */
export async function listExamples(wordId: string): Promise<VocabExample[]> {
  const { data, error } = await db
    .from("vocab_examples")
    .select("id,word_id,sort_order,collocation,sentence,translation_zh,scene,audio_url")
    .eq("word_id", wordId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data || []) as VocabExample[];
}

/** 批量取例句(词卡连播/预取用)。 */
export async function listExamplesFor(wordIds: string[]): Promise<Record<string, VocabExample[]>> {
  const map: Record<string, VocabExample[]> = {};
  for (let i = 0; i < wordIds.length; i += 200) {
    const slice = wordIds.slice(i, i + 200);
    const { data, error } = await db
      .from("vocab_examples")
      .select("id,word_id,sort_order,collocation,sentence,translation_zh,scene,audio_url")
      .in("word_id", slice)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    for (const e of (data || []) as VocabExample[]) (map[e.word_id] ||= []).push(e);
  }
  return map;
}

/**
 * 用户在某词库的掌握度汇总。
 * 掌握判定严格按 spec 第 7.4 节三条**同时**成立:
 *   mastery_level >= 4 且 correct_days >= 4 且 modes_correct 去重 >= 2
 * 学习中 = 有作答记录(tested_count>0)且 level 0-3。
 *
 * ⚠️ 判定口径在这里只读不写;写入侧(PR-2 的 vocabMastery.ts)必须算出同一结果。
 *    两边不一致会出现"仪表盘说掌握了、复习队列还在推"这种鬼故事。
 */
export async function getBankProgress(bankId: string, fallbackTotal: number): Promise<BankProgress> {
  const uid = await currentUserId();
  const ids = await bankWordIds(bankId);
  /* ⚠️ 分母用**实际挂在这个库下的词数**,不用 vocab_banks.total_words。
   * total_words 是规划值(托福填的 4473),而库里实际可学只有 198 ——
   * 拿 4473 当分母,用户把全部内容学完也只显示 4%,成就感直接归零。
   * 放量后这个 count 自然长到 4473,total_words 只留作展示参考。 */
  const total = ids.length || fallbackTotal;
  if (!uid) return { mastered: 0, learning: 0, untouched: total, total };
  if (!ids.length) return { mastered: 0, learning: 0, untouched: total, total };

  type Row = { word_id: string; mastery_level: number; correct_days: number; modes_correct: string[] | null; tested_count: number };
  const rows: Row[] = [];
  for (let i = 0; i < ids.length; i += 200) {
    const { data, error } = await db
      .from("user_vocab_mastery")
      .select("word_id,mastery_level,correct_days,modes_correct,tested_count")
      .eq("user_id", uid)
      .in("word_id", ids.slice(i, i + 200));
    if (error) throw error;
    rows.push(...((data || []) as Row[]));
  }

  let mastered = 0, learning = 0;
  for (const r of rows) {
    // 掌握判定复用 isMasteredRow,不在这里另写一套(两处漂移会出鬼故事)
    if (isMasteredRow(r)) mastered++;
    else if ((r.tested_count ?? 0) > 0) learning++;
  }
  return { mastered, learning, untouched: Math.max(0, total - mastered - learning), total };
}

/** 词表分组用的学习状态。 */
export type WordStatus = "new" | "learning" | "mastered";

/**
 * 取一批词的学习状态,用于词表按「待学习 / 学习中 / 已掌握」分组。
 * 未登录 → 全部 new(零数据时所有词都在"待学习"组,这是预期形态不是异常)。
 * ⚠️ 掌握判定复用 isMasteredRow,不在这里另写一套。
 */
export async function getWordStatusMap(wordIds: string[]): Promise<Record<string, WordStatus>> {
  const map: Record<string, WordStatus> = {};
  if (!wordIds.length) return map;
  /* ⚠️ 不要按 wordIds 分批查 —— 那是 4470 个 id / 200 一批 = 23 次往返,
   *    而用户的掌握记录最多 200 条(RLS 配额)。一次拿完再在内存里筛,1 次往返。
   *    没记录的词天然是 "new",不需要为它们跑查询。
   *    和 getBankProgressFast 是同一个方向错误:该从"用户的少量记录"出发,
   *    不该从"词库的全量词"出发。上次只修了那一处,没回头扫同类,这次补上。 */
  const want = new Set(wordIds);
  /* ⚠️ 取不到就当"全是新词"是**正确降级**(页面照常能用),但绝不能悄悄降级:
   *    掌握度整个取不到时,词表会把已掌握的词全画成"待学习",
   *    用户看到的是"我的进度没了",而控制台一个字都没有。记一行才查得动。 */
  const all = await listMasteryRows().catch(fallback("data/getWordStatusMap:listMasteryRows", [] as MasteryRow[]));
  const rows = all.filter(r => want.has(r.word_id));
  for (const r of rows) {
    map[r.word_id] = isMasteredRow(r) ? "mastered" : ((r.tested_count ?? 0) > 0 ? "learning" : "new");
  }
  return map;
}

/** 到期待复习词数(next_review_at <= now)。未登录返回 0。 */
export async function dueCount(): Promise<number> {
  const uid = await currentUserId();
  if (!uid) return 0;
  const { count, error } = await db
    .from("user_vocab_mastery")
    .select("word_id", { count: "exact", head: true })
    .eq("user_id", uid)
    .lte("next_review_at", new Date().toISOString());
  if (error) throw error;
  return count ?? 0;
}

/** 错题本待清词数(status='active')。未登录返回 0。 */
export async function mistakeCount(): Promise<number> {
  const uid = await currentUserId();
  if (!uid) return 0;
  const { count, error } = await db
    .from("vocab_mistake_book")
    .select("word_id", { count: "exact", head: true })
    .eq("user_id", uid)
    .eq("status", "active");
  if (error) throw error;
  return count ?? 0;
}

/** 全站已掌握总数(跨词库,里程碑徽章用)。 */
export async function totalMastered(): Promise<number> {
  const uid = await currentUserId();
  if (!uid) return 0;
  const { data, error } = await db
    .from("user_vocab_mastery")
    .select("mastery_level,correct_days,modes_correct")
    .eq("user_id", uid)
    .gte("mastery_level", 4)
    .gte("correct_days", 4);
  if (error) throw error;
  type R = { modes_correct: string[] | null };
  return ((data || []) as R[]).filter(r => new Set((r.modes_correct || []).filter(Boolean)).size >= 2).length;
}

/**
 * 词库进度(快速版)—— 词汇中心页专用。
 *
 * ⚠️ 替代 getBankProgress 的原因是**请求数**,不是索引。
 *    老版:先翻页拉全部 4470 个 word_id(5 次请求),再按 200 一批
 *    去查 user_vocab_mastery(23 次请求)—— 单库 ~28 次往返,冷启动实测 ~3 秒。
 *    方向反了:用户最多只有 200 条掌握记录(RLS 配额),
 *    应该"从用户那 ≤200 条出发",而不是"从库里 4470 个词出发"。
 *
 * 新做法 3 次请求:
 *   ① 分母:count(vocab_word_banks where bank_id) —— head 查询,不拉数据
 *   ② 用户全部掌握行(≤200,一次拿完)
 *   ③ 这些 word_id 里哪些属于本库(≤200 个 id 的 in 查询,一次)
 *
 * ⚠️ uid 由调用方传入,不在这里再查一次 —— 中心页已经拿过了,
 *    每个词库再查一遍 auth 是白白多几次往返。
 * ⚠️ 掌握判定仍复用 isMasteredRow,不另写一套(两处漂移会出鬼故事)。
 */
export async function getBankProgressFast(
  bankId: string,
  fallbackTotal: number,
  uid: string | null,
): Promise<BankProgress> {
  const { count, error: cErr } = await db
    .from("vocab_word_banks")
    .select("word_id", { count: "exact", head: true })
    .eq("bank_id", bankId);
  if (cErr) throw cErr;
  const total = count ?? fallbackTotal;
  if (!uid || !total) return { mastered: 0, learning: 0, untouched: total, total };

  const rows = await listMasteryRows();
  if (!rows.length) return { mastered: 0, learning: 0, untouched: total, total };

  const { data: link, error: lErr } = await db
    .from("vocab_word_banks")
    .select("word_id")
    .eq("bank_id", bankId)
    .in("word_id", rows.map(r => r.word_id));
  if (lErr) throw lErr;
  const inBank = new Set((link || []).map(r => (r as { word_id: string }).word_id));

  let mastered = 0, learning = 0;
  for (const r of rows) {
    if (!inBank.has(r.word_id)) continue;
    if (isMasteredRow(r)) mastered++;
    else if ((r.tested_count ?? 0) > 0) learning++;
  }
  return { mastered, learning, untouched: Math.max(0, total - mastered - learning), total };
}

/* ── 统计两层口径 ────────────────────────────────────────────────
 * 中心页要同时显示**两组数字**,两组的分母世界不一样,混了用户就看不懂:
 *
 *   ① 全局累计(跨所有词库,永远只涨)—— 用户的"总资产",不随下拉切库而变
 *   ② 当前词库(随下拉切换)—— 该库进度 / 圆环 / 错题 / 到期 / 里程碑
 *
 * ⚠️ 全局那层**直接聚合 user_vocab_mastery 就是对的**,不要另建表:
 *    那张表本来就按 word_id 存、天生跨库,而且 (user_id, word_id) 唯一 ——
 *    所以"同一个词同时属于托福和四级只算一次"是**表结构自带的**,
 *    不需要在代码里再去重。各库进度那层才需要 join vocab_word_banks 过滤。
 */

/** 全局累计(跨库去重)。学过 = 作答过;掌握 = isMasteredRow 三条同时成立。 */
export type GlobalTotals = { learned: number; mastered: number };

export async function getGlobalTotals(): Promise<GlobalTotals> {
  const rows = await listMasteryRows();
  let learned = 0, mastered = 0;
  for (const r of rows) {
    if (isMasteredRow(r)) { mastered++; learned++; }
    else if ((r.tested_count ?? 0) > 0) learned++;
  }
  return { learned, mastered };
}

/**
 * 这批 word_id 里哪些属于该词库。
 * ⚠️ 入参永远是**用户那几百条记录**的 id,不是词库全量词 ——
 *    方向反了就是 getBankProgressFast 注释里那个 28 次往返的老错误。
 */
async function idsInBank(bankId: string, wordIds: string[]): Promise<Set<string>> {
  const out = new Set<string>();
  if (!wordIds.length) return out;
  for (let i = 0; i < wordIds.length; i += 200) {
    const { data, error } = await db
      .from("vocab_word_banks")
      .select("word_id")
      .eq("bank_id", bankId)
      .in("word_id", wordIds.slice(i, i + 200));
    if (error) throw error;
    for (const r of (data || []) as { word_id: string }[]) out.add(r.word_id);
  }
  return out;
}

/** 某词库的到期待复习词数。未登录返回 0。 */
export async function dueCountForBank(bankId: string): Promise<number> {
  const uid = await currentUserId();
  if (!uid) return 0;
  const now = new Date().toISOString();
  const { data, error } = await db
    .from("user_vocab_mastery")
    .select("word_id")
    .eq("user_id", uid)
    .lte("next_review_at", now);
  if (error) throw error;
  const ids = ((data || []) as { word_id: string }[]).map(r => r.word_id);
  if (!ids.length) return 0;
  return (await idsInBank(bankId, ids)).size;
}

/** 某词库的待清错题数。未登录返回 0。 */
export async function mistakeCountForBank(bankId: string): Promise<number> {
  const uid = await currentUserId();
  if (!uid) return 0;
  const { data, error } = await db
    .from("vocab_mistake_book")
    .select("word_id")
    .eq("user_id", uid)
    .eq("status", "active");
  if (error) throw error;
  const ids = ((data || []) as { word_id: string }[]).map(r => r.word_id);
  if (!ids.length) return 0;
  return (await idsInBank(bankId, ids)).size;
}

/**
 * 各词库**实际挂着的词数**(词库选择面板右侧那个数)。
 *
 * ⚠️ 用真实 count,不用 vocab_banks.total_words —— 后者是规划值(托福填 4473),
 *    而库里实际可学 4470。面板显示 4473、卡片显示 4470,用户会以为哪边坏了。
 * ⚠️ head 查询不拉数据;只给**已上线**的库调用(未上线的显示「敬请期待」,不需要数)。
 */
export async function bankWordCounts(bankIds: string[]): Promise<Record<string, number>> {
  const entries = await Promise.all(bankIds.map(async id => {
    const { count, error } = await db
      .from("vocab_word_banks")
      .select("word_id", { count: "exact", head: true })
      .eq("bank_id", id);
    if (error) return [id, 0] as const;    // 单个库数不出来不该拖垮整个面板
    return [id, count ?? 0] as const;
  }));
  return Object.fromEntries(entries);
}

/** 某词库下的全部 word_id —— 成长图按库过滤要用。对外暴露的是这一个。 */
export async function listBankWordIds(bankId: string): Promise<string[]> {
  return bankWordIds(bankId);
}

/** 错题本一行(待清列表 + 闯关选词都用它)。 */
export type MistakeRow = {
  word_id: string;
  headword_snapshot: string | null;
  wrong_total: number;
  last_wrong_mode: string | null;
  streak_days: number;
  last_streak_date: string | null;
  /** ⚠️ 是 `entered_at` 不是 `updated_at` —— 这张表**没有** updated_at 列。
   *    写错列名会让整条查询 400(42703),而 catch 一吞就变成「加载失败」。 */
  entered_at: string | null;
};

/**
 * 待清错题(status='active'),按"最该先清的"排序。
 *
 * 排序口径:**最久未清 优先于 错次多** ——
 * 错次多说明难,但久不复习的词是真的在流失;难词多练一轮还在,忘掉的词就没了。
 * ⚠️ 一次拉完(有 vmb_active_idx 索引,且待清词本来就不该多),
 *    不做分批 —— 从"用户的少量记录"出发,别再犯反方向的错。
 *
 * ⚠️ **踩过(2026-08-09,线上一直坏着)**:这里原本 select/order 用的是 `updated_at`,
 *    而 vocab_mistake_book **没有这一列** → 每次都 400(42703
 *    "column vocab_mistake_book.updated_at does not exist")。
 *    实际列是 `entered_at`(进错题本的时间),"最久未清在前"正好就是它升序。
 *    为什么没人早发现:错题为 0 的用户同样 400,但调用方 catch 之后 list 为空、
 *    渲染空态,**看起来是好的**;只有真有错题的用户才会看到「加载失败」。
 */
export async function listMistakes(): Promise<MistakeRow[]> {
  const uid = await currentUserId();
  if (!uid) return [];
  const { data, error } = await db
    .from("vocab_mistake_book")
    .select("word_id,headword_snapshot,wrong_total,last_wrong_mode,streak_days,last_streak_date,entered_at")
    .eq("user_id", uid)
    .eq("status", "active")
    .order("entered_at", { ascending: true })
    .limit(500);
  if (error) throw error;
  return ((data || []) as MistakeRow[]).sort((a, b) => {
    const da = a.entered_at ?? "", dbb = b.entered_at ?? "";
    if (da !== dbb) return da < dbb ? -1 : 1;          // 久未清在前
    return (b.wrong_total ?? 0) - (a.wrong_total ?? 0); // 同期则错次多在前
  });
}

/** 按 word_id 取词详情(闯关出题要完整词卡)。≤200 个一次查得完。 */
export async function getWordsByIds(ids: string[]): Promise<VocabWord[]> {
  if (!ids.length) return [];
  const out: VocabWord[] = [];
  for (let i = 0; i < ids.length; i += 200) {
    const { data, error } = await db
      .from("vocab_words")
      .select("id,headword,ipa,pos,def_zh,def_en,freq_rank,audio_url")
      .in("id", ids.slice(i, i + 200));
    if (error) throw error;
    out.push(...((data || []) as VocabWord[]));
  }
  return out;
}
