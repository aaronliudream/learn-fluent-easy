/**
 * 场景串记 · 数据访问层 —— 直连 vocab_scene_packs / vocab_scene_items(照 data.ts 先例)。
 *
 * 产品形态:一个生活场景把 8-15 个词/搭配/词块按**事情发生的顺序**串起来,
 * 末尾用一篇短文把链上的词全部串回去 —— 学完一条链 = 会说一个完整场景。
 *
 * ⚠️ 只取 is_published = true。库里 30 个场景全部已开灯,但这个过滤必须留着:
 *    以后加新场景时是「先灌库、审完再翻 is_published」,少了它草稿会直接漏给用户。
 * ⚠️ 内容表 RLS 是公开只读;user_vocab_wordbook 的 RLS 绑 auth.uid(),
 *    未登录读到空数组,这是**预期行为**,页面必须能渲染 0 态,不能当异常处理。
 *
 * ⚠️ category / benefits / drawbacks 三列是 PR-12 才补的(SQLAA/vocab_scene_meta.sql)。
 *    这里对「列还没建」做了降级:PostgREST 报 42703(undefined column)时
 *    自动退回老列集重查,页面照常出,只是筛选钮全灰、好处/弊端卡不渲染。
 *    这样前端 PR 和那条 SQL **谁先上线都不会白屏**。
 */
import { supabase } from "@/integrations/supabase/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

/** 五个分类 —— 与 vocab_scene_packs_category_chk 约束同一套,库里不该出现第六个值。 */
export const SCENE_CATEGORIES = ["日常生活", "校园学习", "工作职场", "出行旅游", "社会科技"] as const;
export type SceneCategory = (typeof SCENE_CATEGORIES)[number];

/** 节点四型。contrast = 同义辨析(「免费送货 vs. 加急送货」),渲染上要与其它三型区分开。 */
export type SceneItemKind = "word" | "collocation" | "chunk" | "contrast";

export type SceneItem = {
  id: string;
  pack_id: string;
  kind: SceneItemKind;
  text_en: string;
  text_zh: string;
  word_id: string | null;
  audio_url: string | null;
  sort_order: number;
};

export type ScenePack = {
  id: string;
  title_zh: string;
  theme_en: string;
  category: SceneCategory | null;
  benefits: string[] | null;
  drawbacks: string[] | null;
  essay_short_en: string;
  essay_short_zh: string;
  essay_full_en: string;
  essay_full_zh: string;
  essay_short_audio_url: string | null;
  essay_full_audio_url: string | null;
  sort_order: number;
};

/** 列表页用的轻量行 —— 不带完整短文正文,只带算词数用的那一篇。 */
export type ScenePackListRow = {
  id: string;
  title_zh: string;
  theme_en: string;
  category: SceneCategory | null;
  sort_order: number;
  nodeCount: number;
  essayWords: number;
};

/* ── 列集:新列在前,降级列在后 ─────────────────────────────────── */
const PACK_COLS_NEW = "id,title_zh,theme_en,category,benefits,drawbacks,essay_short_en,essay_short_zh,essay_full_en,essay_full_zh,essay_short_audio_url,essay_full_audio_url,sort_order";
const PACK_COLS_OLD = "id,title_zh,theme_en,essay_short_en,essay_short_zh,essay_full_en,essay_full_zh,essay_short_audio_url,essay_full_audio_url,sort_order";
const LIST_COLS_NEW = "id,title_zh,theme_en,category,sort_order,essay_full_en";
const LIST_COLS_OLD = "id,title_zh,theme_en,sort_order,essay_full_en";

/** PostgREST 对不存在的列报 42703。只有这一种错才降级,其余照抛(别把真故障吞成空页)。 */
function isUndefinedColumn(err: unknown): boolean {
  const e = err as { code?: string; message?: string } | null;
  return e?.code === "42703" || /column .* does not exist/i.test(e?.message || "");
}

/** 英文词数 —— 列表卡「短文 N 词」用。按空白切,够准且不依赖库里再存一列。 */
export function countWords(text: string | null | undefined): number {
  const t = String(text || "").trim();
  return t ? t.split(/\s+/).length : 0;
}

/**
 * 全部已发布场景,按 sort_order。
 * 节点数单独一次查:262 行全量拉回来在内存里数,比给每个包发一次 count 省得多,
 * 也比 PostgREST 嵌套聚合好排查(嵌套 count 的返回形状随版本变过)。
 */
export async function listScenePacks(): Promise<ScenePackListRow[]> {
  const fetchPacks = async (cols: string) => {
    const { data, error } = await db
      .from("vocab_scene_packs")
      .select(cols)
      .eq("is_published", true)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return data || [];
  };

  type RawPack = { id: string; title_zh: string; theme_en: string; category?: string | null; sort_order: number; essay_full_en: string };
  let packs: RawPack[];
  try {
    packs = (await fetchPacks(LIST_COLS_NEW)) as RawPack[];
  } catch (e) {
    if (!isUndefinedColumn(e)) throw e;
    packs = (await fetchPacks(LIST_COLS_OLD)) as RawPack[];
  }
  if (!packs.length) return [];

  const counts = await sceneNodeCounts(packs.map(p => p.id));
  return packs.map(p => ({
    id: p.id,
    title_zh: p.title_zh,
    theme_en: p.theme_en,
    category: (p.category as SceneCategory) ?? null,
    sort_order: p.sort_order,
    nodeCount: counts[p.id] ?? 0,
    essayWords: countWords(p.essay_full_en),
  }));
}

/**
 * 已发布场景总数 —— /vocab 入口横幅的分母专用。
 * ⚠️ head 查询,不拉数据。横幅只要一个数字,不该为它把 30 篇短文正文拖下来
 *    (listScenePacks 会拉 essay_full_en 算词数,那是列表页才需要的)。
 */
export async function countScenePacks(): Promise<number> {
  const { count, error } = await db
    .from("vocab_scene_packs")
    .select("id", { count: "exact", head: true })
    .eq("is_published", true);
  if (error) throw error;
  return count ?? 0;
}

/** 各包节点数。一次拉全部 pack_id 在内存里数(全库 262 行,远在 1000 行上限内)。 */
async function sceneNodeCounts(packIds: string[]): Promise<Record<string, number>> {
  const out: Record<string, number> = {};
  if (!packIds.length) return out;
  for (let i = 0; i < packIds.length; i += 200) {
    const { data, error } = await db
      .from("vocab_scene_items")
      .select("pack_id")
      .in("pack_id", packIds.slice(i, i + 200));
    if (error) throw error;
    for (const r of (data || []) as { pack_id: string }[]) out[r.pack_id] = (out[r.pack_id] ?? 0) + 1;
  }
  return out;
}

/** 单个场景。未发布/不存在都返回 null(详情页据此出「场景不存在」,不白屏)。 */
export async function getScenePack(id: string): Promise<ScenePack | null> {
  const fetchOne = async (cols: string) => {
    const { data, error } = await db
      .from("vocab_scene_packs")
      .select(cols)
      .eq("id", id)
      .eq("is_published", true)
      .maybeSingle();
    if (error) throw error;
    return data;
  };
  let row: Record<string, unknown> | null;
  try {
    row = (await fetchOne(PACK_COLS_NEW)) as Record<string, unknown> | null;
  } catch (e) {
    if (!isUndefinedColumn(e)) throw e;
    row = (await fetchOne(PACK_COLS_OLD)) as Record<string, unknown> | null;
  }
  if (!row) return null;
  return {
    ...(row as unknown as ScenePack),
    category: (row.category as SceneCategory) ?? null,
    benefits: (row.benefits as string[]) ?? null,
    drawbacks: (row.drawbacks as string[]) ?? null,
  };
}

/**
 * 下一个场景(详情页底部「下一场景」)。按 sort_order 取紧邻的下一个;
 * 已经是最后一个时**回卷到第一个**,让 30 个场景连成一个可以一直走下去的环 ——
 * 走到末尾给个死胡同,用户就只能退回列表页重新找。
 */
export async function getNextScenePack(
  sortOrder: number,
  currentId: string,
): Promise<{ id: string; title_zh: string } | null> {
  const pick = async (after: number | null) => {
    let q = db.from("vocab_scene_packs").select("id,title_zh,sort_order").eq("is_published", true);
    if (after !== null) q = q.gt("sort_order", after);
    const { data, error } = await q.order("sort_order", { ascending: true }).limit(1);
    if (error) throw error;
    return ((data || [])[0] as { id: string; title_zh: string } | undefined) ?? null;
  };
  const next = await pick(sortOrder);
  if (next) return next;
  const first = await pick(null);
  // 全库只有这一个场景时,别把「下一场景」指回自己
  return first && first.id !== currentId ? first : null;
}

/** 某场景的链上节点,按 sort_order(**叙事顺序**,不是重要性顺序)。 */
export async function listSceneItems(packId: string): Promise<SceneItem[]> {
  const { data, error } = await db
    .from("vocab_scene_items")
    .select("id,pack_id,kind,text_en,text_zh,word_id,audio_url,sort_order")
    .eq("pack_id", packId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data || []) as SceneItem[];
}

/* ── 收藏:写 user_vocab_wordbook ────────────────────────────────
 * source_kind = 'scene_node'(库里的 CHECK 已包含这个值),source_ref = pack_id。
 * 唯一约束是 (user_id, text_en) —— 所以同一个说法在不同场景里收藏是同一条,
 * 取消收藏按 text_en 删即可,不用带 pack_id。
 */

/** 当前用户在本场景收藏了哪些说法(返回 text_en 集合)。未登录 → 空集。 */
export async function listSceneFavorites(items: SceneItem[]): Promise<Set<string>> {
  const out = new Set<string>();
  if (!items.length) return out;
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth?.user?.id;
  if (!uid) return out;

  const texts = items.map(i => i.text_en);
  for (let i = 0; i < texts.length; i += 200) {
    const { data, error } = await db
      .from("user_vocab_wordbook")
      .select("text_en")
      .eq("user_id", uid)
      .in("text_en", texts.slice(i, i + 200));
    if (error) throw error;
    for (const r of (data || []) as { text_en: string }[]) out.add(r.text_en);
  }
  return out;
}

/**
 * 收藏/取消收藏一个节点。返回收藏后的状态(true = 已收藏)。
 * 未登录抛 NOT_SIGNED_IN,由调用方提示登录 —— 静默失败会让用户以为收藏成功了。
 */
export async function toggleSceneFavorite(
  item: SceneItem,
  packId: string,
  currentlyFavorited: boolean,
): Promise<boolean> {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth?.user?.id;
  if (!uid) throw new Error("NOT_SIGNED_IN");

  if (currentlyFavorited) {
    const { error } = await db
      .from("user_vocab_wordbook")
      .delete()
      .eq("user_id", uid)
      .eq("text_en", item.text_en);
    if (error) throw error;
    return false;
  }

  /* upsert 而不是 insert —— 同一个说法可能已从别处(词卡/点词)收藏过,
   * 裸 insert 会撞 (user_id, text_en) 唯一约束报错,用户看到的是"收藏失败"。 */
  const { error } = await db
    .from("user_vocab_wordbook")
    .upsert({
      user_id: uid,
      word_id: item.word_id,
      text_en: item.text_en,
      text_zh: item.text_zh,
      source_kind: "scene_node",
      source_ref: packId,
    }, { onConflict: "user_id,text_en" });
  if (error) throw error;
  return true;
}

/* ── 已学标记 / 首访逐步展开(localStorage)────────────────────────
 * 场景没有做题,也就没有掌握度可言 —— 「已学」的唯一可信信号就是
 * **用户把整条链看完过**。存本地即可,不值得为它建一张用户表。
 * ⚠️ 隐私模式下 localStorage 会抛,全部 try/catch —— 存不下就当没读过,不能冒到渲染层。
 */
const SEEN_KEY = "vocab_scenes_seen";

export function readSeenScenes(): Set<string> {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(arr) ? arr.filter(x => typeof x === "string") : []);
  } catch {
    return new Set();
  }
}

export function markSceneSeen(packId: string): void {
  try {
    const seen = readSeenScenes();
    if (seen.has(packId)) return;
    seen.add(packId);
    localStorage.setItem(SEEN_KEY, JSON.stringify([...seen]));
  } catch { /* 存不了就算了,下次仍按首访走,不影响使用 */ }
}
