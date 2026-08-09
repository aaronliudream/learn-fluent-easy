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
 *    查询一律 select=*,所以那条 SQL **跑没跑都不会白屏、也不会报错**:
 *    没跑时这三个字段读到 undefined → 筛选钮整行不渲染、好处/弊端卡整段不出,
 *    正文照常。前端 PR 和 SQL 谁先上线都行。理由见下方 select=* 的长注释。
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

/* ── 为什么两个查询都用 select=* ────────────────────────────────
 * category / benefits / drawbacks 三列是 PR-12 才补的
 * (SQLAA/vocab_scene_meta.sql,由 Aaron 执行)。
 *
 * 一开始写的是"先按新列查,PostgREST 报 42703 再退回老列集重查"。
 * 功能上能降级,但**每次加载都会先打一发 400**:代码 try/catch 得住,
 * 浏览器控制台拦不住 —— 冒烟门当场判红(实测 /vocab/scenes 两条 400)。
 *
 * select=* 一发就够:列在就返回,列不在就当没有,永远不会 400。
 * 代价是列表页顺带把两档短文的中英四列都拉下来(30 条约 120KB,gzip 后 ~35KB)。
 * 这是**二级页**不是首屏,换掉"每次一发 400 + 两条往返 + 一堆降级分支"值。
 */

/** UUID 形状。不是 uuid 的 id 直接当"不存在",别拿去查 —— PostgREST 会回 400 而不是空行。 */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
  type RawPack = { id: string; title_zh: string; theme_en: string; category?: string | null; sort_order: number; essay_full_en: string };
  const { data, error } = await db
    .from("vocab_scene_packs")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  const packs = (data || []) as RawPack[];
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
  /* 手打错的 / 旧收藏里的坏链接会带来非 uuid 的 id。
   * 直接拿去查,PostgREST 报的是 400「invalid input syntax for type uuid」——
   * 页面会落到"加载失败"而不是"场景不存在",控制台还多一条红字。
   * 形状不对就当没有,连请求都不发。 */
  if (!UUID_RE.test(String(id || ""))) return null;
  const { data, error } = await db
    .from("vocab_scene_packs")
    .select("*")
    .eq("id", id)
    .eq("is_published", true)
    .maybeSingle();
  if (error) throw error;
  const row = data as Record<string, unknown> | null;
  if (!row) return null;
  return {
    ...(row as unknown as ScenePack),
    category: (row.category as SceneCategory) ?? null,
    benefits: (row.benefits as string[]) ?? null,
    drawbacks: (row.drawbacks as string[]) ?? null,
  };
}

/**
 * 下一个**还没学完**的场景(详情页底部「下一场景」)。
 *
 * ⚠️ 不是 sort_order + 1 —— 那样会把用户送回一个他已经学完的场景,
 *    "下一个"三个字就成了假的。这里从当前位置往后找第一个未学完的,
 *    找不到再从头绕一圈(顺序仍是 sort_order,不打乱)。
 * next = null 表示全部都学完了,调用方据此换文案。
 * ⚠️ 同时返回 total —— 「你已学完全部 30 个场景」里的 30 必须来自库,
 *    不能在文案里写死(写死的数字迟早和库对不上)。
 *
 * 一次轻查询:只取 id/title/sort_order 三列,不碰短文正文。
 */
export async function getNextUnlearnedScene(
  currentId: string,
): Promise<{ next: { id: string; title_zh: string } | null; total: number }> {
  const { data, error } = await db
    .from("vocab_scene_packs")
    .select("id,title_zh,sort_order")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  const all = (data || []) as { id: string; title_zh: string; sort_order: number }[];
  if (!all.length) return { next: null, total: 0 };

  const at = all.findIndex(p => p.id === currentId);
  // 从当前之后开始绕一圈(at<0 时就是从头开始),跳过自己和所有已学完的
  const start = at >= 0 ? at + 1 : 0;
  for (let k = 0; k < all.length; k++) {
    const p = all[(start + k) % all.length];
    if (p.id === currentId) continue;
    if (readSceneProgress(p.id).status !== "done") return { next: p, total: all.length };
  }
  return { next: null, total: all.length };
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

/* ── 场景进度(localStorage)─────────────────────────────────────
 *
 * 「学完」的口径(轻量,不强制测验):
 *   词链**全部节点展开过** 且 **完整版短文展开过**
 * 两条都满足才算 done。只看完链没读完整版短文 = 学习中。
 *
 * 存法(Aaron 定):每个场景两个键
 *   scene_done_<pack_id>   = "1"          学完
 *   scene_nodes_<pack_id>  = "<n>"        看到第几环(复访恢复到这里)
 *
 * ⚠️ 现在只落 localStorage。要跨设备同步得建 user_scene_progress 表,
 *    那是 PR-14 单词本立项时再决定的事 —— 这里的函数签名按"将来能换存储"写,
 *    页面只认这几个函数,不直接摸 localStorage。
 * ⚠️ 隐私模式下 localStorage 会抛,全部 try/catch —— 存不下就当没学过,不能冒到渲染层。
 */
const DONE_PREFIX = "scene_done_";
const NODES_PREFIX = "scene_nodes_";
/** PR-12 首版用的整数组键。只为老数据迁移保留,不再写入。 */
const LEGACY_SEEN_KEY = "vocab_scenes_seen";

export type SceneStatus = "new" | "learning" | "done";
export type SceneProgress = { status: SceneStatus; nodesSeen: number };

/**
 * 老数据迁移:首版把"看完过"记在一个 JSON 数组里。
 * 迁成 done 键(那一版的判据是"整条链亮完",与新口径的第一条一致),迁完删老键。
 * ⚠️ 幂等:老键删掉后就不会再跑第二遍。
 */
function migrateLegacy(): void {
  try {
    const raw = localStorage.getItem(LEGACY_SEEN_KEY);
    if (!raw) return;
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) {
      for (const id of arr) {
        if (typeof id === "string" && id) localStorage.setItem(DONE_PREFIX + id, "1");
      }
    }
    localStorage.removeItem(LEGACY_SEEN_KEY);
  } catch { /* 迁不动就算了,大不了那几个场景回到"未学" */ }
}

export function readSceneProgress(packId: string): SceneProgress {
  try {
    migrateLegacy();
    if (localStorage.getItem(DONE_PREFIX + packId) === "1") {
      return { status: "done", nodesSeen: Number(localStorage.getItem(NODES_PREFIX + packId)) || 0 };
    }
    const n = Number(localStorage.getItem(NODES_PREFIX + packId)) || 0;
    return { status: n > 0 ? "learning" : "new", nodesSeen: n };
  } catch {
    /* 隐私模式 localStorage 抛 —— 故意忽略。场景进度本来就只存在本地,
       读不到就当没学过,不影响进场景学习。 */
    return { status: "new", nodesSeen: 0 };
  }
}

/** 一批场景的进度(列表页分三段用)。 */
export function readSceneProgressFor(packIds: string[]): Record<string, SceneProgress> {
  const out: Record<string, SceneProgress> = {};
  for (const id of packIds) out[id] = readSceneProgress(id);
  return out;
}

/**
 * 记"看到第几环"。**只记单调增的最大值** —— 复访恢复到上次位置,不该被这次的
 * 起始值 1 冲掉。
 * ⚠️ 只有真的往前点过(n ≥ 2)才落库:光打开一个场景不算"学习中",
 *    否则用户随手翻两页,列表里立刻多出一堆"已看 1/8 环",
 *    而分段排序的全部意义就是"最上面是下一个该学的"。
 */
export function markSceneNodes(packId: string, n: number): void {
  if (n < 2) return;
  try {
    const cur = Number(localStorage.getItem(NODES_PREFIX + packId)) || 0;
    if (n > cur) localStorage.setItem(NODES_PREFIX + packId, String(n));
  } catch { /* 存不了就算了,下次从头点 */ }
}

/** 标记学完(两条都满足时由详情页调用)。 */
export function markSceneDone(packId: string): void {
  try { localStorage.setItem(DONE_PREFIX + packId, "1"); } catch { /* 同上 */ }
}

/**
 * 已学完的场景数 —— /vocab 入口横幅的分子。
 * 直接数 localStorage 里的 done 键,不需要先把 30 个场景拉下来,
 * 与列表页顶部那行「已学 N / 30」**同一个口径**。
 */
export function countScenesDone(): number {
  try {
    migrateLegacy();
    let n = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(DONE_PREFIX) && localStorage.getItem(k) === "1") n++;
    }
    return n;
  } catch {
    return 0;   // 同上:隐私模式读不到 → 已学 0,故意忽略
  }
}
