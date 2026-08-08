/**
 * 词库下拉的初始选中逻辑。
 *
 * 为什么单测这一小段:现在库里**只有托福一个 is_active**,
 * 下拉里另外 10 个都是灰的「敬请期待」—— 也就是说"切库"和"回落"
 * 这两条路径在真机上**根本走不到**,等第二个库上线时才会第一次被执行。
 * 那时候如果回落写错了,表现是"打开词汇页一片空白",而且没人会想到是这里。
 */
import { beforeEach, describe, expect, it } from "vitest";
import { pickInitialBank } from "./VocabCenter";
import { writeSelectedBank } from "@/lib/vocab/theme";
import type { VocabBank } from "@/lib/vocab/data";

const bank = (code: string, is_active = true): VocabBank => ({
  id: `id-${code}`, code, name_zh: code, name_en: code,
  total_words: 100, is_free: true, is_active, sort_order: 1,
});

describe("pickInitialBank", () => {
  beforeEach(() => localStorage.clear());

  it("没有任何可用词库时返回 null(调用方据此渲染空态,不能崩)", () => {
    expect(pickInitialBank([])).toBeNull();
    expect(pickInitialBank([bank("toefl", false)])).toBeNull();
  });

  it("没记过偏好时默认托福", () => {
    const picked = pickInitialBank([bank("cet4"), bank("toefl"), bank("ielts")]);
    expect(picked?.code).toBe("toefl");
  });

  it("记过偏好就用记的那个", () => {
    writeSelectedBank("ielts");
    expect(pickInitialBank([bank("toefl"), bank("ielts")])?.code).toBe("ielts");
  });

  it("记的那个库已下线 → 回落到托福,而不是卡在一个空库上", () => {
    writeSelectedBank("ielts");
    const picked = pickInitialBank([bank("toefl"), bank("ielts", false)]);
    expect(picked?.code).toBe("toefl");
  });

  it("记的下线、托福也不在 → 回落到第一个可用库", () => {
    writeSelectedBank("ielts");
    const picked = pickInitialBank([bank("ielts", false), bank("cet4"), bank("cet6")]);
    expect(picked?.code).toBe("cet4");
  });

  it("永远不会选中 is_active=false 的库", () => {
    writeSelectedBank("gre");
    const banks = [bank("gre", false), bank("gmat", false), bank("cet6")];
    expect(pickInitialBank(banks)?.is_active).toBe(true);
  });
});
