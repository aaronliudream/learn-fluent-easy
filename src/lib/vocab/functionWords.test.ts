import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { FUNCTION_POS, isFunctionWord, byLearnOrder } from "./functionWords";

describe("isFunctionWord", () => {
  it("每个词性段都是虚词类才算虚词", () => {
    expect(isFunctionWord("art.")).toBe(true);        // a / the
    expect(isFunctionWord("prep./adv.")).toBe(true);  // to
    expect(isFunctionWord("pron.")).toBe(true);       // it
    expect(isFunctionWord("conj.")).toBe(true);       // and
  });

  it("只要有一个实词性就不算 —— 宁可漏判也不能把实词踩到末尾", () => {
    expect(isFunctionWord("adj./conj./pron./adv.")).toBe(false);  // that
    expect(isFunctionWord("n./v./adj./adv./int.")).toBe(false);   // well
    expect(isFunctionWord("v.")).toBe(false);                      // be / have / do
    expect(isFunctionWord("n.")).toBe(false);
  });

  it("pos 缺失不算虚词(信息不足时不降权)", () => {
    expect(isFunctionWord("")).toBe(false);
    expect(isFunctionWord(null)).toBe(false);
    expect(isFunctionWord(undefined)).toBe(false);
  });
});

describe("byLearnOrder", () => {
  const w = (headword: string, pos: string, freq_rank: number | null) => ({ headword, pos, freq_rank });

  it("虚词整体沉到实词之后,哪怕它词频高得多", () => {
    const list = [w("the", "art.", 1), w("defense", "n.", 900), w("of", "prep.", 4)];
    expect(list.sort(byLearnOrder).map(x => x.headword)).toEqual(["defense", "the", "of"]);
  });

  it("同类内部仍按 freq_rank 升序", () => {
    const list = [w("beta", "n.", 50), w("alpha", "n.", 10)];
    expect(list.sort(byLearnOrder).map(x => x.headword)).toEqual(["alpha", "beta"]);
  });

  it("freq_rank 为空排在同类最后,不能被当成 0 顶到最前", () => {
    const list = [w("nofreq", "n.", null), w("common", "n.", 100)];
    expect(list.sort(byLearnOrder).map(x => x.headword)).toEqual(["common", "nofreq"]);
  });
});

/* ⚠️ 判据在两处各有一份实现:前端这份 TS,和生成流水线的
 * scripts/vocab/prompt-rules.mjs(.mjs 跨不到 src 的构建边界,没法直接共用)。
 * 两份漂移了不会有任何报错,只会让"生成时当虚词处理"和"学习时降权"对不上。
 * 所以这里直接读那个文件比对词性表 —— 改一边漏改另一边,这条测试会红。 */
describe("与生成流水线的词性表保持一致", () => {
  it("FUNCTION_POS 与 scripts/vocab/prompt-rules.mjs 完全相同", () => {
    const src = readFileSync(
      path.join(process.cwd(), "scripts", "vocab", "prompt-rules.mjs"), "utf8");
    const m = /const FUNCTION_POS = new Set\(\[([^\]]*)\]\)/.exec(src);
    expect(m, "没在 prompt-rules.mjs 里找到 FUNCTION_POS —— 那边改了写法,这条校验要跟着改").toBeTruthy();
    const theirs = [...m![1].matchAll(/'([^']+)'|"([^"]+)"/g)].map(x => x[1] ?? x[2]);
    expect([...theirs].sort()).toEqual([...FUNCTION_POS].sort());
  });
});
