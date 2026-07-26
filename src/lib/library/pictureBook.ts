/**
 * 图书馆「绘本模式」· 白名单 + 分页装配(试点)。
 *
 * 开关方式:只有列在 PICTURE_BOOK_CHAPTERS 里的「书 slug#章号」才走绘本组件
 * (components/library/ReadingPictureBook.tsx);其余全部章、全部书一行不变,走原阅读器渲染。
 * 与 GAMIFIED_UNIT_IDS 同一套「新组件 + 白名单共存」模式。
 *
 * 分页口径(§2「一个 chunk = 绘本的一页」):
 *   ① library_sentences.page_index 有值 → 按它分页(同页多句共用一个页号);
 *   ② 全章都为空(SQL 未跑 / 未配页)→ 退回按 para_idx 分段,一段一页,**不报错**。
 * 页图:先取本页任一句的 image_url;没有则回退 library_illustrations
 * (position=页序号;第 1 页额外接受 position=0 的章首图)→ 都没有则无图占位,不崩。
 */
import type { LibrarySentence, LibraryIllustration } from "./data";

/** 绘本模式白名单:`${book_key}#${chapter_idx}`。 */
export const PICTURE_BOOK_CHAPTERS = new Set<string>([
  "aesop-easy-readers#1",
  "aesop-easy-readers#2",
  "aesop-easy-readers#3",
  "aesop-easy-readers#4",
  // ch5 起是新写的 85 则(每则只有 1 段)。绘本分页靠 library_sentences.page_index
  // 硬切(见 SQLAA/20260725_aesop_ch5_pages.sql),不改 para_idx —— buildPages 有
  // page_index 就按它,段落结构留给段落流渲染,两件事互不牵扯。
  "aesop-easy-readers#5",
]);

export function isPictureBookChapter(bookKey: string, chapterIdx: number): boolean {
  return PICTURE_BOOK_CHAPTERS.has(`${bookKey}#${chapterIdx}`);
}

/**
 * 页图兜底表(桶内路径,按页序 1..N)。图已传桶,但 `page_index/image_url` 两列的 SQL 要 Aaron 跑 ——
 * 在那之前靠这张表也能看到完整绘本,不空图。
 * 优先级:DB `image_url` > 本表 > `library_illustrations` > 骨架占位。SQL 跑完后 DB 值自动接管,本表可删。
 */
export const PICTURE_BOOK_PAGE_IMAGES: Record<string, string[]> = {
  "aesop-easy-readers#1": [
    "aesop-easy-readers/ch1/p1.jpg",
    "aesop-easy-readers/ch1/p2.jpg",
    "aesop-easy-readers/ch1/p3.jpg",
  ],
};

/** 一页 = 一组连续句子 + 一张配图。startIdx/endIdx 为**章内数组下标**(endIdx 不含),直接喂 playChapterFrom。 */
export type PictureBookPage = {
  page: number; // 显示页号(1-based,按出现顺序,与 page_index 存值无关)
  items: { s: LibrarySentence; i: number }[];
  image: string | null; // 桶内路径或绝对 URL(渲染前经 illustrationUrl 兜底解析)
  startIdx: number;
  endIdx: number; // 不含
};

/** 装配绘本页。sentences 须按 seq 升序(getChapterSentences 已保证)。
 *  chapterKey = `${book_key}#${chapter_idx}`,给页图兜底表用;不传则只走 DB / 插图两级。 */
export function buildPages(
  sentences: LibrarySentence[],
  illustrations: LibraryIllustration[] = [],
  chapterKey?: string,
): PictureBookPage[] {
  if (!sentences.length) return [];
  const byPageIndex = sentences.some((s) => s.page_index != null);

  // 分组:有 page_index 用它,否则用 para_idx;null 值并入上一组(不新起页,防空页)。
  const groups: { key: number | null; items: { s: LibrarySentence; i: number }[] }[] = [];
  sentences.forEach((s, i) => {
    const key = byPageIndex ? (s.page_index ?? null) : s.para_idx;
    const last = groups[groups.length - 1];
    if (last && (key === null || last.key === key)) last.items.push({ s, i });
    else groups.push({ key, items: [{ s, i }] });
  });

  // 插图回退:position → 图路径。
  const byPosition = new Map<number, string>();
  for (const im of illustrations) {
    if (im.position < 0) continue; // 退休图不渲染(见 DECISIONS.md「插图 position 语义」)
    if (!byPosition.has(im.position)) byPosition.set(im.position, im.image_path);
  }

  const seeded = (chapterKey && PICTURE_BOOK_PAGE_IMAGES[chapterKey]) || [];

  return groups.map((g, gi) => {
    const page = gi + 1;
    const own = g.items.find((x) => x.s.image_url)?.s.image_url ?? null;
    const fallback = byPosition.get(page) ?? (page === 1 ? byPosition.get(0) ?? null : null);
    return {
      page,
      items: g.items,
      image: own ?? seeded[gi] ?? fallback,
      startIdx: g.items[0].i,
      endIdx: g.items[g.items.length - 1].i + 1,
    };
  });
}
