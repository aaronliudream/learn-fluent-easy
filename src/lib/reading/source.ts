import { supabase } from "@/integrations/supabase/client";

// reading_library 尚未进 types.ts(新表);照 american/data.ts 先例用 as any 访问。
// 落库靠 SQLAA 里的 DDL(Aaron 执行);类型在此处手写,单一事实来源。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

/** 题目形状 —— 与 junior_reading 完全同构:{ q, options[], answer:"A".., explanation? }。
 *  判断题(T/F)不加 type 字段,建模为 options:["True","False"] + answer:"A"/"B"。 */
export type ReadingQuestion = {
  q: string;
  options: string[];
  answer: string;
  explanation?: string;
};

/** 词汇注释 —— 同构 junior_reading 的瘦形状:{ word, cn }。 */
export type ReadingVocab = { word: string; cn: string };

export type ReadingContentType = "graded_reader" | "book_chapter" | "exam_passage";
export type ReadingGradeBand = "primary" | "junior" | "senior" | "general";

/** 列表行(轻量,列表页用)。 */
export type ReadingListItem = {
  id: string;
  title: string;
  content_type: ReadingContentType;
  grade_band: ReadingGradeBand;
  level: string | null;
  topic: string | null;
  word_count: number | null;
  difficulty: number;
};

/** 完整篇(播放页用)。 */
export type ReadingPassage = ReadingListItem & {
  body: string;
  questions: ReadingQuestion[];
  vocab_notes: ReadingVocab[];
};

const LIST_COLS =
  "id,title,content_type,grade_band,level,topic,word_count,difficulty";

/** 拉取已发布的阅读篇目列表,可按学段筛。 */
export async function listReadings(
  band?: ReadingGradeBand,
): Promise<ReadingListItem[]> {
  let q = db
    .from("reading_library")
    .select(LIST_COLS)
    .eq("is_published", true)
    .order("grade_band", { ascending: true })
    .order("difficulty", { ascending: true })
    .order("created_at", { ascending: true });
  if (band) q = q.eq("grade_band", band);
  const { data } = await q;
  return (data ?? []) as ReadingListItem[];
}

/** 拉取单篇完整内容(含原文/题目/词汇)。 */
export async function getReading(id: string): Promise<ReadingPassage | null> {
  const { data } = await db
    .from("reading_library")
    .select(`${LIST_COLS},body,questions,vocab_notes`)
    .eq("id", id)
    .maybeSingle();
  return (data as ReadingPassage | null) ?? null;
}
