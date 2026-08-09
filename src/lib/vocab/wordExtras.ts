/**
 * 词卡增区的数据层 —— 高频搭配 / 易混词 / 反义词。
 *
 * 这三段内容早就入库且已审,但前端一处都没显示。实测存量:
 *   · vocab_collocations        22,065 条(带 audio_url)
 *   · vocab_confusion_groups       429 组 / vocab_confusion_members 978 词
 *   · vocab_words.antonyms       1,764 词有反义词
 *
 * ⚠️ **只读**。本模块不写库、不改内容 —— 这批数据是审过的,前端只负责显示。
 * ⚠️ 三段各自独立取,**任何一段失败都不许拖垮其它两段**:
 *    词卡是答题反馈的黄金三秒,为了一个可有可无的增区把整张卡弄没了是本末倒置。
 */
import { supabase } from "@/integrations/supabase/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export type Collocation = {
  id: string;
  collocation: string;
  translation_zh: string | null;
  freq_rank: number | null;
  audio_url: string | null;
};

export type ConfusionPeer = {
  word_id: string;
  headword: string;
  def_zh: string | null;
  /** 这个词"感觉上"是什么 —— 组内区分的一句话 */
  feel_zh: string | null;
  /** 与组内其它词的对比要点 */
  contrast_hint: string | null;
};

export type ConfusionInfo = {
  groupTitle: string;
  /** 同组的**其它**词(不含当前词) */
  peers: ConfusionPeer[];
};

export type WordExtras = {
  collocations: Collocation[];
  confusion: ConfusionInfo | null;
  antonyms: string[];
};

export const EMPTY_EXTRAS: WordExtras = { collocations: [], confusion: null, antonyms: [] };

/** 搭配区默认显示几条;超出的走「查看全部 N 条」。 */
export const COLLOCATION_PREVIEW = 6;

async function fetchCollocations(wordId: string): Promise<Collocation[]> {
  const { data, error } = await db
    .from("vocab_collocations")
    .select("id,collocation,translation_zh,freq_rank,audio_url")
    .eq("word_id", wordId)
    /* freq_rank 小 = 更高频,排前面。nullsLast:没标频次的沉到最后,
       而不是因为 null 排序在前把最没用的顶上来。 */
    .order("freq_rank", { ascending: true, nullsFirst: false })
    .limit(60);
  if (error) throw error;
  return (data || []) as Collocation[];
}

async function fetchAntonyms(wordId: string): Promise<string[]> {
  const { data, error } = await db
    .from("vocab_words").select("antonyms").eq("id", wordId).maybeSingle();
  if (error) throw error;
  const raw = (data?.antonyms ?? []) as unknown;
  return Array.isArray(raw) ? raw.filter((x): x is string => typeof x === "string" && !!x.trim()) : [];
}

/**
 * 该词所属的辨析组及同组其它词。
 * ⚠️ 三步查:成员行 → 组内全部成员 → 这些成员的词形。
 *    看着绕,但辨析组是"多对多经由中间表",没有更短的路;
 *    而且每步都限定在一个 group 内(平均 2.3 个词),量极小。
 */
async function fetchConfusion(wordId: string): Promise<ConfusionInfo | null> {
  const { data: mine, error: e1 } = await db
    .from("vocab_confusion_members").select("group_id").eq("word_id", wordId).maybeSingle();
  if (e1) throw e1;
  const groupId = mine?.group_id as string | undefined;
  if (!groupId) return null;

  const [{ data: grp, error: e2 }, { data: members, error: e3 }] = await Promise.all([
    db.from("vocab_confusion_groups").select("title_zh").eq("id", groupId).maybeSingle(),
    db.from("vocab_confusion_members")
      .select("word_id,feel_zh,contrast_hint,sort_order").eq("group_id", groupId)
      .order("sort_order", { ascending: true }),
  ]);
  if (e2) throw e2;
  if (e3) throw e3;

  const rows = (members || []) as { word_id: string; feel_zh: string | null; contrast_hint: string | null }[];
  const peerIds = rows.map(r => r.word_id).filter(id => id !== wordId);
  if (!peerIds.length) return null;      // 组里只有自己 → 没有"易混"可言,不显示空区

  const { data: words, error: e4 } = await db
    .from("vocab_words").select("id,headword,def_zh").in("id", peerIds);
  if (e4) throw e4;
  const byId = new Map(((words || []) as { id: string; headword: string; def_zh: string | null }[]).map(w => [w.id, w]));

  const peers: ConfusionPeer[] = rows
    .filter(r => r.word_id !== wordId)
    .map(r => {
      const w = byId.get(r.word_id);
      return w ? { word_id: r.word_id, headword: w.headword, def_zh: w.def_zh, feel_zh: r.feel_zh, contrast_hint: r.contrast_hint } : null;
    })
    .filter((x): x is ConfusionPeer => !!x);

  if (!peers.length) return null;
  return { groupTitle: (grp?.title_zh as string) ?? "易混词", peers };
}

/**
 * 一次取齐三段。
 * ⚠️ 用 allSettled 不用 all —— 任何一段失败只让**那一段**为空,
 *    其余照常显示。词卡的主体(释义/例句)本来就跟这三段无关,
 *    不能因为搭配查询超时就让整张卡塌掉。
 */
export async function getWordExtras(wordId: string): Promise<WordExtras> {
  const [c, f, a] = await Promise.allSettled([
    fetchCollocations(wordId),
    fetchConfusion(wordId),
    fetchAntonyms(wordId),
  ]);
  return {
    collocations: c.status === "fulfilled" ? c.value : [],
    confusion: f.status === "fulfilled" ? f.value : null,
    antonyms: a.status === "fulfilled" ? a.value : [],
  };
}

/** 三段是不是全空 —— 全空就整个增区不渲染,不留一排空标题。 */
export function isEmptyExtras(x: WordExtras): boolean {
  return !x.collocations.length && !x.confusion && !x.antonyms.length;
}
