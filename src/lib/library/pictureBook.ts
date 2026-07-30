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
  "aesop-easy-readers#6",
  "aesop-easy-readers#7",
  // ⚠️ 画风分界:ch1-ch7 为水彩,ch8 起改为卡通彩色(2026-07-26 拍板,旧章不回头修)。
  "aesop-easy-readers#8",
  "aesop-easy-readers#9",
  // ch10-ch19:2026-07-26 一次性接入(30 页 / 30 张图)。同为单段章,
  // 分页见 SQLAA/20260726_aesop_ch10_ch19_pages.sql。
  "aesop-easy-readers#10",
  "aesop-easy-readers#11",
  "aesop-easy-readers#12",
  "aesop-easy-readers#13",
  "aesop-easy-readers#14",
  "aesop-easy-readers#15",
  "aesop-easy-readers#16",
  "aesop-easy-readers#17",
  "aesop-easy-readers#18",
  "aesop-easy-readers#19",
  // ch20-ch22:2026-07-26。分页见 SQLAA/20260726_aesop_ch20_ch22_pages.sql。
  "aesop-easy-readers#20",
  "aesop-easy-readers#21",
  "aesop-easy-readers#22",
  "aesop-easy-readers#23",
  "aesop-easy-readers#24",
  "aesop-easy-readers#25",
  "aesop-easy-readers#26",
  "aesop-easy-readers#27",
  "aesop-easy-readers#28",
  "aesop-easy-readers#29",
  "aesop-easy-readers#30",
  "aesop-easy-readers#31",
  // ch32 只有 2 句,是全书第一个 2 页章(buildPages 按分组数出页,不强制 3 页)。
  "aesop-easy-readers#32",
  "aesop-easy-readers#33",
  "aesop-easy-readers#34",
  "aesop-easy-readers#35",
  // ch36 同 ch32,只有 2 句 → 2 页章。
  "aesop-easy-readers#36",
  "aesop-easy-readers#37",
  "aesop-easy-readers#38",
  "aesop-easy-readers#39",
  "aesop-easy-readers#40",
  "aesop-easy-readers#41",
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
