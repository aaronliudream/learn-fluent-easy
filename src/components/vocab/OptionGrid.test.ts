/**
 * 2×2 判据 —— **按实际文本算,不写死**。
 *
 * 这组测试守的是一条很容易被"优化"掉的规则:只要有**一个**选项偏长,
 * 整组就得退回单列。真按两列排长选项,要么换行成三行高低不齐,
 * 要么被截断吃掉半句话 —— 两种都比"多占一屏"糟。
 */
import { describe, expect, it } from "vitest";
import { canUseTwoColumns, COMPACT_MAX_WIDTH } from "./OptionGrid";

const four = (...a: string[]) => a;

describe("canUseTwoColumns", () => {
  it("四个都是短中文 → 2×2", () => {
    expect(canUseTwoColumns(four("防御", "途径", "整体", "钱包"))).toBe(true);
  });

  it("刚好 8 个汉字 → 仍然 2×2(阈值是闭区间)", () => {
    const eight = "一二三四五六七八";
    expect([...eight].length).toBe(COMPACT_MAX_WIDTH);
    expect(canUseTwoColumns(four(eight, "防御", "途径", "整体"))).toBe(true);
  });

  it("只要**一个**超过 8 字,整组退回单列", () => {
    expect(canUseTwoColumns(four("提供生长和健康所需的营养", "防御", "途径", "整体"))).toBe(false);
  });

  it("英文选项按半宽算 —— 不能拿汉字个数去判英文", () => {
    /* VocabQuiz 的 defMode="en" 时选项是英文释义。
       按"字符数 ≤ 8"判的话,任何一句英文都超标、永远退回单列;
       而英文字符窄得多,一行放得下。 */
    expect(canUseTwoColumns(four("a way in", "whole", "wallet", "defense"))).toBe(true);
    expect(canUseTwoColumns(four(
      "a period of one thousand years.", "whole", "wallet", "defense"))).toBe(false);
  });

  it("不是四个选项一律单列(别的题型不受影响)", () => {
    expect(canUseTwoColumns(["甲", "乙", "丙"])).toBe(false);
    expect(canUseTwoColumns(["甲", "乙", "丙", "丁", "戊"])).toBe(false);
  });

  it("空串不会把判据算崩", () => {
    expect(canUseTwoColumns(four("", "防御", "途径", "整体"))).toBe(true);
  });

  it("中英混排一起算(「AI 助手」这类)", () => {
    expect(canUseTwoColumns(four("AI 助手", "防御", "途径", "整体"))).toBe(true);
  });
});
