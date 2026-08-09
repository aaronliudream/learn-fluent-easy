/**
 * 词卡增区的数据层 —— 高频搭配 / 反义词。
 *
 * 这三段内容早就入库且已审,但前端一处都没显示。实测存量:
 *   · vocab_collocations        22,065 条(带 audio_url)
 *   ⚠️ vocab_confusion_groups(429 组)/ vocab_confusion_members(978 词)
 *      **已于 2026-08-09 下架,前端不再引用;库表保留不删。**
 *   · vocab_words.antonyms       1,764 词有反义词
 *
 * ⚠️ **只读**。本模块不写库、不改内容 —— 这批数据是审过的,前端只负责显示。
 * ⚠️ 两段各自独立取,**任何一段失败都不许拖垮另一段**:
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

export type WordExtras = {
  collocations: Collocation[];
  antonyms: string[];
};

export const EMPTY_EXTRAS: WordExtras = { collocations: [], antonyms: [] };

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
 * 一次取齐三段。
 * ⚠️ 用 allSettled 不用 all —— 任何一段失败只让**那一段**为空,
 *    其余照常显示。词卡的主体(释义/例句)本来就跟这三段无关,
 *    不能因为搭配查询超时就让整张卡塌掉。
 */
export async function getWordExtras(wordId: string): Promise<WordExtras> {
  const [c, a] = await Promise.allSettled([
    fetchCollocations(wordId),
    fetchAntonyms(wordId),
  ]);
  return {
    collocations: c.status === "fulfilled" ? c.value : [],
    antonyms: a.status === "fulfilled" ? a.value : [],
  };
}

/** 三段是不是全空 —— 全空就整个增区不渲染,不留一排空标题。 */
export function isEmptyExtras(x: WordExtras): boolean {
  return !x.collocations.length && !x.antonyms.length;
}
