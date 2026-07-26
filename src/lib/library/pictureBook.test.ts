import { describe, expect, it } from "vitest";
import { buildPages, isPictureBookChapter } from "./pictureBook";
import type { LibraryIllustration, LibrarySentence } from "./data";

/** 伊索 ch1 实测形态:11 句 / 3 段(para_idx 1,2,3 → 4,3,4 句)。 */
function ch1(overrides: Partial<LibrarySentence>[] = []): LibrarySentence[] {
  const paras = [1, 1, 1, 1, 2, 2, 2, 3, 3, 3, 3];
  return paras.map((p, i) => ({
    id: `s${i + 1}`,
    book_id: "b1",
    chapter_idx: 1,
    para_idx: p,
    seq: i + 1,
    text_en: `sentence ${i + 1}`,
    text_cn: `第 ${i + 1} 句`,
    audio_url: null,
    ...(overrides[i] ?? {}),
  }));
}

const illus = (rows: Partial<LibraryIllustration>[]): LibraryIllustration[] =>
  rows.map((r) => ({
    chapter_idx: 1,
    position: 0,
    image_path: "x.jpg",
    caption: null,
    alt_text: null,
    credit: null,
    width: 1000,
    height: 559,
    ...r,
  }));

describe("白名单", () => {
  it("只放行伊索第 1-6 章", () => {
    for (const ch of [1, 2, 3, 4, 5, 6]) {
      expect(isPictureBookChapter("aesop-easy-readers", ch)).toBe(true);
    }
    // 未配页图的章不得放行(ch7 起仍走原段落流渲染)
    expect(isPictureBookChapter("aesop-easy-readers", 7)).toBe(false);
    expect(isPictureBookChapter("wizard-of-oz", 1)).toBe(false);
  });
});

describe("buildPages", () => {
  it("page_index 全空 → 按段落回退分页,不报错", () => {
    const pages = buildPages(ch1(), []);
    expect(pages.map((p) => p.page)).toEqual([1, 2, 3]);
    expect(pages.map((p) => p.items.length)).toEqual([4, 3, 4]);
    expect(pages.map((p) => [p.startIdx, p.endIdx])).toEqual([
      [0, 4],
      [4, 7],
      [7, 11],
    ]);
    expect(pages.every((p) => p.image === null)).toBe(true);
  });

  it("page_index 有值 → 按它分页,图取本页 image_url", () => {
    const pageIdx = [1, 1, 1, 1, 2, 2, 2, 3, 3, 3, 3];
    const pages = buildPages(
      ch1(pageIdx.map((n) => ({ page_index: n, image_url: `aesop-easy-readers/ch1/p${n}.png` }))),
      [],
    );
    expect(pages.map((p) => p.items.length)).toEqual([4, 3, 4]);
    expect(pages.map((p) => p.image)).toEqual([
      "aesop-easy-readers/ch1/p1.png",
      "aesop-easy-readers/ch1/p2.png",
      "aesop-easy-readers/ch1/p3.png",
    ]);
  });

  it("同页只有一句带图 → 整页用它;某句 page_index 为空 → 并入上一页,不产生空页", () => {
    const partial: Partial<LibrarySentence>[] = [
      { page_index: 1, image_url: "a/p1.png" },
      { page_index: 1 },
      { page_index: null }, // 漏配 → 并入第 1 页
      { page_index: 1 },
      { page_index: 2 },
      { page_index: 2 },
      { page_index: 2 },
      { page_index: 3 },
      { page_index: 3 },
      { page_index: 3 },
      { page_index: 3 },
    ];
    const pages = buildPages(ch1(partial), []);
    expect(pages).toHaveLength(3);
    expect(pages.map((p) => p.items.length)).toEqual([4, 3, 4]);
    expect(pages[0].image).toBe("a/p1.png");
  });

  it("没有 image_url → 回退插图:position=页号;第 1 页额外收 position=0 的章首图", () => {
    const pages = buildPages(
      ch1(),
      illus([
        { position: 0, image_path: "aesop-easy-readers/ch1-hare-tortoise.jpg" },
        { position: 2, image_path: "aesop-easy-readers/ch1-p2.jpg" },
        { position: -1, image_path: "aesop-easy-readers/retired.jpg" }, // 退休图不参与
      ]),
    );
    expect(pages[0].image).toBe("aesop-easy-readers/ch1-hare-tortoise.jpg");
    expect(pages[1].image).toBe("aesop-easy-readers/ch1-p2.jpg");
    expect(pages[2].image).toBeNull();
  });

  it("SQL 未跑(无 image_url)→ 用页图兜底表,三页都有图", () => {
    const pages = buildPages(ch1(), [], "aesop-easy-readers#1");
    expect(pages.map((p) => p.image)).toEqual([
      "aesop-easy-readers/ch1/p1.jpg",
      "aesop-easy-readers/ch1/p2.jpg",
      "aesop-easy-readers/ch1/p3.jpg",
    ]);
  });

  it("DB 的 image_url 优先于兜底表(SQL 跑完后 DB 接管)", () => {
    const pages = buildPages(
      ch1([{ page_index: 1, image_url: "db/one.png" }, ...Array(10).fill({ page_index: 1 })]),
      [],
      "aesop-easy-readers#1",
    );
    expect(pages).toHaveLength(1);
    expect(pages[0].image).toBe("db/one.png");
  });

  it("兜底表只对白名单键生效,别的章不受影响", () => {
    expect(buildPages(ch1(), [], "aesop-easy-readers#2").every((p) => p.image === null)).toBe(true);
  });

  it("空章 → 空数组,不抛错", () => {
    expect(buildPages([], [])).toEqual([]);
  });
});
