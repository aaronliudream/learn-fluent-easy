/**
 * 「沉睡数据」三页的数据层:词块与习语 / 中文这样说 / 易混词辨析。
 *
 * 这批内容早已入库且已审,但前端一处都没显示。实测存量(2026-08-09):
 *   · vocab_chunks            150 条 = idiom 50 + phrasal_verb 35 + collocation_ext 30 + frame 20 + connector 15
 *   · vocab_cn_expressions     51 条 / vocab_cn_renditions 133 条(casual 48 / neutral 50 / formal 35)
 *   ⚠️ vocab_confusion_groups(429 组)/ vocab_confusion_members(978 词)
 *      **已于 2026-08-09 整条下架**,出题函数与页面已删,库表保留不动。
 *
 * ⚠️ **只读**:不写库、不改内容。这批是审过的,前端只负责显示和出题。
 * ⚠️ 规格里写的数字(428 组 / 100 词块 + 50 习语两张表 / 1766 词)与库里不符,
 *    一律**以实测为准**(Aaron 2026-08-09 确认规格里那几个数是凭记忆写的)。
 *    习语没有独立表,就在 vocab_chunks 里靠 type='idiom' 区分。
 */
import { supabase } from "@/integrations/supabase/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

/* ── 词块与习语 ─────────────────────────────────────────────── */

export type ChunkType = "idiom" | "phrasal_verb" | "frame" | "connector" | "collocation_ext";

export type Chunk = {
  id: string;
  chunk: string;
  translation_zh: string | null;
  example_en: string | null;
  example_zh: string | null;
  audio_url: string | null;
  example_audio_url: string | null;
  type: ChunkType | null;
  scene: string | null;
  /** 直译陷阱 —— 只有习语有,是这批内容的卖点 */
  literal_trap: string | null;
};

/** 非习语的四个分组,顺序即页面上的显示顺序。 */
export const CHUNK_GROUPS: { type: ChunkType; label: string; hint: string }[] = [
  { type: "phrasal_verb", label: "短语动词", hint: "动词 + 小品词,整体一个意思" },
  { type: "frame", label: "句式框架", hint: "套进自己的内容就能用" },
  { type: "connector", label: "逻辑连接", hint: "写作里承上启下的固定说法" },
  { type: "collocation_ext", label: "高频搭配延伸", hint: "地道的词与词组合" },
];

export async function listChunks(): Promise<Chunk[]> {
  const { data, error } = await db
    .from("vocab_chunks")
    .select("id,chunk,translation_zh,example_en,example_zh,audio_url,example_audio_url,type,scene,literal_trap")
    .order("freq_rank", { ascending: true, nullsFirst: false })
    .limit(500);
  if (error) throw error;
  return (data || []) as Chunk[];
}

/* ── 中文这样说 ─────────────────────────────────────────────── */

export type Register = "casual" | "neutral" | "formal";

export const REGISTER_LABEL: Record<Register, string> = {
  casual: "随意",
  neutral: "中性",
  formal: "正式",
};

export type Rendition = {
  id: string;
  expression_id: string;
  rendition: string;
  register: Register | null;
  scene_hint: string | null;
  example_en: string | null;
  example_zh: string | null;
  audio_url: string | null;
  example_audio_url: string | null;
  sort_order: number | null;
};

export type CnExpression = {
  id: string;
  cn_phrase: string;
  cn_note: string | null;
  category: string | null;
  renditions: Rendition[];
};

/** category 分两组。库里实测取值是 daily / proverb。 */
export const EXPR_GROUPS: { key: string; label: string }[] = [
  { key: "daily", label: "日常口语" },
  { key: "proverb", label: "汉语谚语" },
];

export async function listExpressions(): Promise<CnExpression[]> {
  const [{ data: exprs, error: e1 }, { data: rends, error: e2 }] = await Promise.all([
    db.from("vocab_cn_expressions").select("id,cn_phrase,cn_note,category,sort_order")
      .order("sort_order", { ascending: true }).limit(200),
    db.from("vocab_cn_renditions")
      .select("id,expression_id,rendition,register,scene_hint,example_en,example_zh,audio_url,example_audio_url,sort_order")
      .order("sort_order", { ascending: true }).limit(500),
  ]);
  if (e1) throw e1;
  if (e2) throw e2;
  const byExpr = new Map<string, Rendition[]>();
  for (const r of ((rends || []) as Rendition[])) {
    (byExpr.get(r.expression_id) ?? byExpr.set(r.expression_id, []).get(r.expression_id)!).push(r);
  }
  return ((exprs || []) as Omit<CnExpression, "renditions">[])
    .map(e => ({ ...e, renditions: byExpr.get(e.id) ?? [] }))
    /* 一个说法都没有的条目不显示 —— 展开是空的比不显示更让人困惑 */
    .filter(e => e.renditions.length > 0);
}

/* ── 易混词辨析 ─────────────────────────────────────────────── */

/* ── ☆ 收藏 ────────────────────────────────────────────────────
 *
 * 写 user_vocab_wordbook,与场景串记同一张表、同一套口径。
 * source_kind:词块/习语 = 'chunk',中文表达的说法 = 'expression'。
 * ⚠️ 这两个值是 2026-08-09 由 SQLAA/wordbook_source_kind_extend.sql 扩进 CHECK 的
 *    (跑之前只有 word/scene_node…),Aaron 已跑并回报约束现含六值。
 *    在那之前**故意没上收藏按钮** —— 会 400 的按钮比没有按钮更糟。
 * ⚠️ 唯一约束是 (user_id, text_en),所以同一句话在不同来源收藏是同一条;
 *    取消收藏按 text_en 删,不用带 source_ref。
 * ⚠️ 一律 upsert 不用裸 insert:同一个说法可能已从别处收藏过,
 *    裸 insert 会撞唯一约束,用户看到的是"收藏失败"。
 */

export type FavKind = "chunk" | "expression";

/** 这批文本里哪些已收藏(返回 text_en 集合)。未登录 → 空集,这是预期不是异常。 */
export async function listFavorites(texts: string[]): Promise<Set<string>> {
  const out = new Set<string>();
  if (!texts.length) return out;
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth?.user?.id;
  if (!uid) return out;
  for (let i = 0; i < texts.length; i += 200) {
    const { data, error } = await db
      .from("user_vocab_wordbook").select("text_en")
      .eq("user_id", uid).in("text_en", texts.slice(i, i + 200));
    if (error) throw error;
    for (const r of (data || []) as { text_en: string }[]) out.add(r.text_en);
  }
  return out;
}

/**
 * 收藏 / 取消收藏。返回操作后的状态(true = 已收藏)。
 * 未登录抛 NOT_SIGNED_IN,由调用方提示登录 —— 静默失败会让用户以为收藏成功了。
 */
export async function toggleFavorite(
  kind: FavKind,
  textEn: string,
  textZh: string | null,
  sourceRef: string,
  currentlyFavorited: boolean,
): Promise<boolean> {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth?.user?.id;
  if (!uid) throw new Error("NOT_SIGNED_IN");

  if (currentlyFavorited) {
    const { error } = await db
      .from("user_vocab_wordbook").delete().eq("user_id", uid).eq("text_en", textEn);
    if (error) throw error;
    return false;
  }
  const { error } = await db
    .from("user_vocab_wordbook")
    .upsert({
      user_id: uid,
      /* word_id 为 null:词块和中文表达**不是** vocab_words 里的词,
         硬塞一个 word_id 会让单词本以为它是个词条。 */
      word_id: null,
      text_en: textEn,
      text_zh: textZh,
      source_kind: kind,
      source_ref: sourceRef,
    }, { onConflict: "user_id,text_en" });
  if (error) throw error;
  return true;
}
