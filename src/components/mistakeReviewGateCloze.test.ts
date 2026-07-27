import { describe, expect, it } from "vitest";
import { parseClozeStem, splitByBlanks } from "./MistakeReviewGate";

/**
 * 完形错题卡「第 N 空」定位的单测。
 *
 * 强制复习门要登录 + 有到期错题才会弹,浏览器里没法稳定复现,
 * 所以把定位逻辑抽成纯函数并在这里证明 —— 尤其是**解析不到时必须安全降级**那条。
 *
 * 真实数据形态取自 SQLAA/20260726_cloze_mistake_recon.sql ③ 段的实测结果:
 * senior_cloze 共 26 行,题干 = `【第 N 空】\n` + 整段带 ___N___ 占位的对话原文;
 * 其中 24 行含空号前缀、2 行不含(2026-07-10 加前缀之前写入的老记录)。
 */

// 与线上一致的题干样例(am2_l01 关7,4 个空)
const REAL_STEM =
  "【第 2 空】\nLast Friday I went to the ___1___ downtown. A young couple was sitting ___2___ me, " +
  "and they were talking ___3___. I turned around and looked at ___4___, but they didn't pay any attention.";

describe("parseClozeStem", () => {
  it("解析出空号并把前缀从正文里剥掉", () => {
    const r = parseClozeStem(REAL_STEM);
    expect(r.blankNo).toBe(2);
    expect(r.body.startsWith("Last Friday")).toBe(true);
    expect(r.body).not.toContain("【第");
  });

  it("容忍前缀里的空格", () => {
    expect(parseClozeStem("【第 10 空】\nfoo").blankNo).toBe(10);
    expect(parseClozeStem("【第10空】\nfoo").blankNo).toBe(10);
  });

  it("没有前缀的老记录 → blankNo=null,正文原样返回(降级不报错)", () => {
    const q = "Last Friday I went to the ___1___ downtown.";
    const r = parseClozeStem(q);
    expect(r.blankNo).toBeNull();
    expect(r.body).toBe(q);
  });

  it("空题干不炸", () => {
    expect(parseClozeStem("")).toEqual({ blankNo: null, body: "" });
  });

  it("前缀不在开头时不误判(只认首行)", () => {
    expect(parseClozeStem("foo 【第 3 空】 bar").blankNo).toBeNull();
  });
});

describe("splitByBlanks", () => {
  it("把每个 ___N___ 切成独立片段并带上空号", () => {
    const segs = splitByBlanks(parseClozeStem(REAL_STEM).body);
    const blanks = segs.filter((s) => s.blankNo != null).map((s) => s.blankNo);
    expect(blanks).toEqual([1, 2, 3, 4]);
  });

  it("拼回去必须与原文逐字相同(不截断、不丢字)", () => {
    const body = parseClozeStem(REAL_STEM).body;
    expect(splitByBlanks(body).map((s) => s.text).join("")).toBe(body);
  });

  it("目标空之外的空仍然保留占位文本(灰显但可读)", () => {
    const segs = splitByBlanks(parseClozeStem(REAL_STEM).body);
    const other = segs.find((s) => s.blankNo === 4);
    expect(other?.text).toBe("___4___");
  });

  it("裸 ___(无编号)不当作可定位的空 → 不高亮,文本保留", () => {
    const segs = splitByBlanks("He was ___ angry.");
    expect(segs.every((s) => s.blankNo == null)).toBe(true);
    expect(segs.map((s) => s.text).join("")).toBe("He was ___ angry.");
  });

  it("多位数空号解析正确", () => {
    const segs = splitByBlanks("a ___12___ b");
    expect(segs.find((s) => s.blankNo != null)?.blankNo).toBe(12);
  });

  it("无空的普通题干原样单段返回", () => {
    expect(splitByBlanks("plain stem")).toEqual([{ text: "plain stem", blankNo: null }]);
  });
});
