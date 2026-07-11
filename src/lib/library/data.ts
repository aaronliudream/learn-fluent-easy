/**
 * 图书馆(/library)· 数据访问层 —— 直连 library_* 内容表(方案 A,照 american/data.ts 先例)。
 * 与 P0 reading_library / src/lib/reading/* 完全隔离,一行不碰。
 *
 * library_* 表尚未进 supabase 生成类型(types.ts,新表),这里对 client 做 `as any`,
 * 并把结果 cast 成本文件定义的接口 —— tsc 干净,运行期照常。类型在此手写,单一事实来源。
 */
import { supabase } from "@/integrations/supabase/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export type LibraryAgeBand = "少儿" | "儿童" | "青少年" | "成人";

/** 书籍卡渐变封面(两色);缺省 → 用中性兜底色。 */
export type LibraryCover = { c1?: string; c2?: string };

/** 列表行(轻量,书架页用)。 */
export type LibraryBookListItem = {
  id: string;
  book_key: string;
  title: string;
  zh_title: string | null;
  author: string | null;
  age_band: LibraryAgeBand;
  age_range: string | null;
  cover: LibraryCover;
  sentence_count: number;
};

/** 完整书目(详情页用,多简介字段)。 */
export type LibraryBook = LibraryBookListItem & {
  intro_en: string | null;
  intro_zh: string | null;
  copyright_note: string | null;
};

/** 逐句原子(阅读器用)。 */
export type LibrarySentence = {
  id: string;
  book_id: string;
  chapter_idx: number;
  para_idx: number;
  seq: number;
  text_en: string;
  text_cn: string | null;
  audio_url: string | null;
};

const LIST_COLS =
  "id,book_key,title,zh_title,author,age_band,age_range,cover,sentence_count";
const FULL_COLS = `${LIST_COLS},intro_en,intro_zh,copyright_note`;

function coerceCover(raw: unknown): LibraryCover {
  return raw && typeof raw === "object" ? (raw as LibraryCover) : {};
}

/** 已发布书目列表(RLS 已只返回 is_published=true;可按年龄段筛)。 */
export async function listBooks(band?: LibraryAgeBand): Promise<LibraryBookListItem[]> {
  let q = db
    .from("library_books")
    .select(LIST_COLS)
    .order("age_band", { ascending: true })
    .order("created_at", { ascending: true });
  if (band) q = q.eq("age_band", band);
  const { data } = await q;
  return ((data ?? []) as LibraryBookListItem[]).map((b) => ({ ...b, cover: coerceCover(b.cover) }));
}

/** 按稳定 slug 取单本书目(路由用 book_key)。 */
export async function getBookByKey(bookKey: string): Promise<LibraryBook | null> {
  const { data } = await db
    .from("library_books")
    .select(FULL_COLS)
    .eq("book_key", bookKey)
    .maybeSingle();
  if (!data) return null;
  return { ...(data as LibraryBook), cover: coerceCover((data as LibraryBook).cover) };
}

/** 一本书的全部句子(按 seq 升序;沉浸阅读器一次取全)。 */
export async function getSentences(bookId: string): Promise<LibrarySentence[]> {
  const { data } = await db
    .from("library_sentences")
    .select("id,book_id,chapter_idx,para_idx,seq,text_en,text_cn,audio_url")
    .eq("book_id", bookId)
    .order("seq", { ascending: true });
  return (data ?? []) as LibrarySentence[];
}

/** 当前登录用户 id(未登录 → null)。 */
export async function currentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}
