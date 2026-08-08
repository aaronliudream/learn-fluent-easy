/**
 * 48 音标数据的结构闸。
 *
 * 这些不是"为了有测试而写的测试" —— 每一条都对应一个**我已经犯过或极易犯**的错:
 *   · focus 写成 "a_e" 这种分裂双字母记号,根本不是词里的子串 → 卡片上标不出色(已踩)
 *   · 20/28 数不对 → 顶部横滑导航少一个音标,用户不会发现,但内容就是缺的
 *   · id 重复 → 学习进度串号
 */
import { describe, expect, it } from "vitest";
import { PHONICS_48, VOWELS, CONSONANTS } from "./phonics48";
import { PHONICS_RULES as RULES } from "./phonicsRules";

describe("48 音标数据", () => {
  it("恰好 48 张:20 元音 + 28 辅音", () => {
    expect(PHONICS_48).toHaveLength(48);
    expect(VOWELS).toHaveLength(20);
    expect(CONSONANTS).toHaveLength(28);
  });

  it("id 唯一(重复会让学习进度串号)", () => {
    const ids = PHONICS_48.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("音标唯一", () => {
    const ipas = PHONICS_48.map(c => c.ipa);
    expect(new Set(ipas).size).toBe(ipas.length);
  });

  it.each(PHONICS_48.map(c => [c.ipa, c] as const))(
    "%s:示例词 3-5 个,focus 与之等长",
    (_ipa, c) => {
      expect(c.words.length).toBeGreaterThanOrEqual(3);
      expect(c.words.length).toBeLessThanOrEqual(5);
      expect(c.focus).toHaveLength(c.words.length);
    },
  );

  it.each(PHONICS_48.map(c => [c.ipa, c] as const))(
    "%s:每个 focus 都是对应示例词里的真实子串(否则标不出色)",
    (_ipa, c) => {
      c.words.forEach((w, i) => {
        const f = c.focus[i];
        expect(f.length).toBeGreaterThan(0);
        expect(w.toLowerCase()).toContain(f.toLowerCase());
      });
    },
  );

  it.each(PHONICS_48.map(c => [c.ipa, c] as const))(
    "%s:要领与典型错误都非空",
    (_ipa, c) => {
      expect(c.tip.trim().length).toBeGreaterThan(4);
      expect(c.cnError.trim().length).toBeGreaterThan(4);
    },
  );

  it("最小对立对(有的话)恰好两个词且不相同", () => {
    for (const c of PHONICS_48) {
      if (!c.minimalPair) continue;
      expect(c.minimalPair).toHaveLength(2);
      expect(c.minimalPair[0].toLowerCase()).not.toBe(c.minimalPair[1].toLowerCase());
    }
  });

  it("元音分组只有长/短/双元音三类", () => {
    expect(new Set(VOWELS.map(c => c.group))).toEqual(new Set(["长元音", "短元音", "双元音"]));
  });
});

/* ── 自然拼读 42 规则(PR-13,与音标共用骨架)── */
describe("自然拼读 42 规则数据", () => {
  it("恰好 42 条", () => {
    expect(RULES).toHaveLength(42);
  });

  it("id 与 symbol 都唯一", () => {
    expect(new Set(RULES.map(r => r.id)).size).toBe(RULES.length);
    expect(new Set(RULES.map(r => r.symbol)).size).toBe(RULES.length);
  });

  it.each(RULES.map(r => [r.symbol, r] as const))(
    "%s:示例词 4-6 个,focus 等长且是真实子串",
    (_s, r) => {
      expect(r.words.length).toBeGreaterThanOrEqual(4);
      expect(r.words.length).toBeLessThanOrEqual(6);
      expect(r.focus).toHaveLength(r.words.length);
      r.words.forEach((w, i) => expect(w.toLowerCase()).toContain(r.focus[i].toLowerCase()));
    },
  );

  it.each(RULES.map(r => [r.symbol, r] as const))(
    "%s:说明与例外提示都非空",
    (_s, r) => {
      expect(r.tip.trim().length).toBeGreaterThan(4);
      expect(r.cnError.trim().length).toBeGreaterThan(4);
    },
  );
});
