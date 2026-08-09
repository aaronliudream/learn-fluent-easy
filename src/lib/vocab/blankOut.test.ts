/**
 * 挖空的测试。
 *
 * 这个函数决定辨析专项能出多少题:漏匹配是**静默**的(只会看到题库莫名其妙小),
 * 过度匹配则会挖错位置(art 把 start 挖了)。两头都得钉死。
 */
import { describe, expect, it } from "vitest";
import { blankOut, BLANK } from "./blankOut";

describe("blankOut · 原形", () => {
  it("整词命中", () => {
    expect(blankOut("Citizens show allegiance to the flag.", "allegiance"))
      .toBe(`Citizens show ${BLANK} to the flag.`);
  });
  it("大小写不敏感", () => {
    expect(blankOut("Allegiance matters.", "allegiance")).toBe(`${BLANK} matters.`);
  });
  it("只挖第一处", () => {
    expect(blankOut("A cake and a cake.", "cake")).toBe(`A ${BLANK} and a cake.`);
  });
});

describe("blankOut · 屈折(漏匹配是静默失败,必须覆盖)", () => {
  it.each([
    ["The fire broke out and involved many people.", "involve"],
    ["A tapering column stood there.", "taper"],
    ["She studies hard every night.", "study"],
    ["He is running fast.", "run"],
    ["The process was simplified.", "simplify"],
    ["Their achievements were noted.", "achievement"],
    ["He spoke confidently.", "confident"],
    ["Two boxes arrived.", "box"],
  ])("%s ← %s", (sentence, head) => {
    const out = blankOut(sentence, head);
    expect(out, `「${head}」没能在「${sentence}」里挖出空`).not.toBeNull();
    expect(out).toContain(BLANK);
  });
});

describe("blankOut · 不许过度匹配", () => {
  it("art 不该挖掉 start 里的 art", () => {
    expect(blankOut("Let us start now.", "art")).toBeNull();
  });
  it("be 这种超短词不做模糊匹配,避免乱挖", () => {
    expect(blankOut("The best cake.", "be")).toBeNull();
  });
  it("完全不含该词 → null,不硬造", () => {
    expect(blankOut("Nothing relevant here.", "allegiance")).toBeNull();
  });
});

describe("blankOut · 多词词条", () => {
  it("整体匹配 look after", () => {
    expect(blankOut("She will look after the kids.", "look after"))
      .toBe(`She will ${BLANK} the kids.`);
  });
  it("词间连字符也认", () => {
    expect(blankOut("A well-known face.", "well known")).toBe(`A ${BLANK} face.`);
  });
  it("多词词条缺一个词 → null", () => {
    expect(blankOut("She will look at the kids.", "look after")).toBeNull();
  });
});

describe("blankOut · 边界输入", () => {
  it.each([["", "cake"], ["A cake.", ""], ["", ""]])("空输入不炸", (s, h) => {
    expect(blankOut(s, h)).toBeNull();
  });
});
