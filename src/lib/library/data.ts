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

/** 书籍卡封面:优先用 image(桶内整幅封面图),否则退回 c1/c2 渐变兜底。 */
export type LibraryCover = { c1?: string; c2?: string; image?: string };

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
/** 章标题(存 library_books.chapters jsonb;方案 A,随书一起取)。 */
export type LibraryChapterTitle = { idx: number; title_en: string; title_zh: string; count?: number };

export type LibraryBook = LibraryBookListItem & {
  intro_en: string | null;
  intro_zh: string | null;
  guide_en: string | null; // 导读(读前):书名含义/双关/作者背景
  guide_zh: string | null;
  copyright_note: string | null;
  chapters: LibraryChapterTitle[];
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
const FULL_COLS = `${LIST_COLS},intro_en,intro_zh,guide_en,guide_zh,copyright_note,chapters`;

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
  const raw = data as LibraryBook;
  const chapters = Array.isArray(raw.chapters)
    ? [...raw.chapters].sort((a, b) => a.idx - b.idx)
    : [];
  return { ...raw, cover: coerceCover(raw.cover), chapters };
}

/** 章号 → 标题(取不到返回 null)。目录/阅读器渲染用。 */
export function chapterTitle(
  book: Pick<LibraryBook, "chapters"> | null,
  idx: number,
): LibraryChapterTitle | null {
  return book?.chapters?.find((c) => c.idx === idx) ?? null;
}

const SENTENCE_COLS = "id,book_id,chapter_idx,para_idx,seq,text_en,text_cn,audio_url";
// Supabase/PostgREST 单次返回硬顶 1000 行(本项目实测)。长书必须按章加载,
// 否则一次拉全书会被静默截断到前 1000 句(后面的章直接丢失)。

/** 某一章的句子(按 seq 升序)。按章加载:单章恒 <1000 句,一次请求拿得全。 */
export async function getChapterSentences(
  bookId: string,
  chapterIdx: number,
): Promise<LibrarySentence[]> {
  const { data } = await db
    .from("library_sentences")
    .select(SENTENCE_COLS)
    .eq("book_id", bookId)
    .eq("chapter_idx", chapterIdx)
    .order("seq", { ascending: true });
  return (data ?? []) as LibrarySentence[];
}

/** 目录项(轻量):只需章号;标题由 chapterTitle(book, idx) 从 chapters jsonb 取。 */
export type LibraryChapter = { idx: number };

/**
 * 章目录 —— 直接取自 library_books.chapters jsonb(getBookByKey 已一次带回),**0 额外查询**,
 * 打开成本与书长无关。按 idx 升序。
 *
 * 取代旧 getChapterList:后者为求每章首句 seq 而**翻页扫全书**(O(书长):Oz 3 趟/Tom 6 趟,
 * 万句书更多),是大部头"打开慢"的主因。目录只需章号+标题,jsonb 里都有,不必碰句表。
 */
export function chapterOutline(book: Pick<LibraryBook, "chapters"> | null): LibraryChapter[] {
  return [...(book?.chapters ?? [])]
    .map((c) => ({ idx: c.idx }))
    .sort((a, b) => a.idx - b.idx);
}

/**
 * 断点续读定位:某全书 seq 落在哪一章。单条索引查(取 seq≤给定值的最后一句所在章),
 * **O(1) 与书长无关**,取代旧"先拉全书每章 firstSeq 再线性找"。仅续读(last_seq>0)时才调。
 */
export async function getChapterOfSeq(bookId: string, seq: number): Promise<number> {
  const { data } = await db
    .from("library_sentences")
    .select("chapter_idx")
    .eq("book_id", bookId)
    .lte("seq", seq)
    .order("seq", { ascending: false })
    .limit(1);
  return (data?.[0] as { chapter_idx: number } | undefined)?.chapter_idx ?? 1;
}

/** 每章插图(v1 章首,position=0)。RLS 已只返回 is_published=true。 */
export type LibraryIllustration = {
  chapter_idx: number;
  position: number;
  image_path: string;
  caption: string | null;
  alt_text: string | null;
  credit: string | null;
  width: number | null;
  height: number | null;
};

const ILLUSTRATION_BUCKET = "library-illustrations";

/** 桶内路径 → 公开 CDN URL。 */
export function illustrationUrl(imagePath: string): string {
  const base = import.meta.env.VITE_SUPABASE_URL as string;
  return `${base}/storage/v1/object/public/${ILLUSTRATION_BUCKET}/${imagePath}`;
}

/** 封面整幅图(桶内路径,复用插图桶)→ 公开 URL;无图返回 null(回退渐变卡)。 */
export function coverImageUrl(cover: LibraryCover): string | null {
  return cover.image ? illustrationUrl(cover.image) : null;
}

/** 每书正文总词数(预计算落 library_books.word_count)。列未建/失败 → 空 Map(优雅降级)。 */
export async function getBookWordCounts(): Promise<Map<string, number>> {
  try {
    const { data, error } = await db.from("library_books").select("id,word_count");
    if (error || !data) return new Map();
    const m = new Map<string, number>();
    for (const b of data as { id: string; word_count: number | null }[]) {
      if (b.word_count != null) m.set(b.id, b.word_count);
    }
    return m;
  } catch {
    return new Map();
  }
}

/** 每书 read-v1 核心词/块数(按书掌握率的固定分母)。列未建/查询失败 → 空 Map(功能优雅降级,不崩)。 */
export type BookCore = { word: number; chunk: number };
export async function getBookCoreCounts(): Promise<Map<string, BookCore>> {
  try {
    const { data, error } = await db.from("library_books").select("id,core_word_count,core_chunk_count");
    if (error || !data) return new Map();
    const m = new Map<string, BookCore>();
    for (const b of data as { id: string; core_word_count: number | null; core_chunk_count: number | null }[]) {
      if (b.core_word_count != null || b.core_chunk_count != null) {
        m.set(b.id, { word: b.core_word_count ?? 0, chunk: b.core_chunk_count ?? 0 });
      }
    }
    return m;
  } catch {
    return new Map();
  }
}

/** 文化笔记(② 读中词卡 / ③ 章末合集)。term 归一化小写(点读命中键);内容须人工审。 */
export type LibraryCultureNote = {
  term: string;
  chapter_idx: number;
  title: string;
  body_zh: string;
  body_en: string | null;
};

/**
 * 某书全部已发布文化笔记 → Map(归一化 term → 笔记)。稀疏(全书几十条),一次性预取传进 TappableLine。
 * 表未建/查询失败 → 空 Map(优雅降级,详情/阅读页照常)。
 */
export async function getBookCultureNotes(bookId: string): Promise<Map<string, LibraryCultureNote>> {
  try {
    const { data, error } = await db
      .from("library_culture_notes")
      .select("term,chapter_idx,title,body_zh,body_en")
      .eq("book_id", bookId);
    if (error || !data) return new Map();
    const m = new Map<string, LibraryCultureNote>();
    for (const n of data as LibraryCultureNote[]) {
      const key = String(n.term).toLowerCase().trim();
      if (key) m.set(key, n);
    }
    return m;
  } catch {
    return new Map();
  }
}

/**
 * 每书 visibility('public' / 'private')→ Map。仅用于卡片 🔒 私享角标(纯展示)。
 * 访问控制由 DB RLS 强制,不靠这里;列未建/查询失败 → 空 Map(优雅降级,不崩)。
 */
export async function getBookVisibility(): Promise<Map<string, string>> {
  try {
    const { data, error } = await db.from("library_books").select("id,visibility");
    if (error || !data) return new Map();
    const m = new Map<string, string>();
    for (const b of data as { id: string; visibility: string | null }[]) {
      if (b.visibility) m.set(b.id, b.visibility);
    }
    return m;
  } catch {
    return new Map();
  }
}

/**
 * 古今异义"按书义项覆盖"(false-friend)。18 世纪词书中义 ≠ 现代义时,该书这个词用书中义。
 * gloss_cn/gloss_en = 书中义(测试取);modern_cn/modern_en = 现代义(卡片补充显示)。
 */
export type LibraryWordSense = {
  normalized: string;
  word: string;
  ipa: string | null;
  pos: string | null;
  sense_key: string | null;
  gloss_cn: string;
  gloss_en: string;
  archaic: boolean;
  modern_cn: string | null;
  modern_en: string | null;
  example_en: string | null;
  example_cn: string | null;
  proper: boolean; // 专名事实卡按书覆盖(撞名专名如 Tom/America 按 book_key 隔离)→ 前端隐藏收藏
};

/** 归一化(= 覆盖表 normalized 落库同式):小写、弯撇号折 ASCII、去非 [a-z0-9' ]、压空白。 */
export function senseNormalize(s: string): string {
  return String(s).toLowerCase().replace(/[’‘]/g, "'").replace(/[^a-z0-9' ]+/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * 某书全部古今异义覆盖 → Map(normalized → 覆盖)。点词/复习先查这个,命中用书中义,否则回退全局卡。
 * 稀疏(每书几十条),开书时一次性预取。表 RLS 公开读;表未建/查询失败 → 空 Map(优雅降级,回退全局卡)。
 */
export async function getBookWordSenses(bookKey: string): Promise<Map<string, LibraryWordSense>> {
  try {
    const { data, error } = await db
      .from("library_word_senses")
      .select("normalized,word,ipa,pos,sense_key,gloss_cn,gloss_en,archaic,modern_cn,modern_en,example_en,example_cn,proper")
      .eq("book_key", bookKey);
    if (error || !data) return new Map();
    const m = new Map<string, LibraryWordSense>();
    for (const r of data as LibraryWordSense[]) m.set(r.normalized, r);
    return m;
  } catch {
    return new Map();
  }
}

/** 取某章的插图(按 position 升序;每章就几张,和句子同批取)。 */
export async function getChapterIllustrations(
  bookId: string,
  chapterIdx: number,
): Promise<LibraryIllustration[]> {
  const { data } = await db
    .from("library_illustrations")
    .select("chapter_idx,position,image_path,caption,alt_text,credit,width,height")
    .eq("book_id", bookId)
    .eq("chapter_idx", chapterIdx)
    .order("position", { ascending: true });
  return (data ?? []) as LibraryIllustration[];
}

/** 难句难点(句级挂载;marker 点开列难点清单)。points=[{term,gloss,kind}]。 */
export type LibraryHardPoint = { term: string; gloss: string; kind: "word" | "phrase" };
export type LibraryHardSentence = { seq: number; points: LibraryHardPoint[] };

/**
 * 某章的难句卡 → Map(seq → 难点清单)。稀疏(每章十几句),和句子同批按章取;
 * 阅读器逐句 block 按 seq 命中显示 marker。表未建/查询失败 → 空 Map(优雅降级,阅读照常)。
 */
export async function getChapterHardSentences(
  bookId: string,
  chapterIdx: number,
): Promise<Map<number, LibraryHardPoint[]>> {
  try {
    const { data, error } = await db
      .from("library_hard_sentences")
      .select("seq,points")
      .eq("book_id", bookId)
      .eq("chapter_idx", chapterIdx);
    if (error || !data) return new Map();
    const m = new Map<number, LibraryHardPoint[]>();
    for (const r of data as LibraryHardSentence[]) {
      if (Array.isArray(r.points) && r.points.length) m.set(r.seq, r.points);
    }
    return m;
  } catch {
    return new Map();
  }
}

/** 某章的语块表面形式列表(正文虚线用;RLS 已只返回 is_published=true)。去重。 */
export async function getChapterChunkTerms(bookId: string, chapterIdx: number): Promise<string[]> {
  const { data } = await db
    .from("library_chunks")
    .select("term")
    .eq("book_id", bookId)
    .eq("chapter_idx", chapterIdx);
  const set = new Set(((data ?? []) as { term: string }[]).map((r) => r.term));
  return [...set];
}

/** 当前登录用户 id(未登录 → null)。 */
export async function currentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}
