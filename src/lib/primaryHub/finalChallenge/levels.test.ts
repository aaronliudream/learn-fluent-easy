import { describe, it, expect } from "vitest";
import { getLevelConfigs, findLevelConfig, iconForLevel } from "./levels";

describe("finalChallenge level configs (grade + volume aware)", () => {
  it("grade <6 keeps the base layout (levels 7+ = 敬请期待 placeholder, no fill_in_choose)", () => {
    for (const g of [3, 4, 5]) {
      const cfgs = getLevelConfigs(g, "v2");
      expect(cfgs.find((c) => c.id === 2)?.type).toBe("picture_match_word");
      expect(cfgs.find((c) => c.id === 7)?.type).toBeNull();
      expect(cfgs.find((c) => c.id === 8)?.type).toBeNull();
    }
  });

  it("grade 6 v1 keeps 看图选词 at level 2, 情景答语 at 7, 选词填空 at 8", () => {
    const cfgs = getLevelConfigs(6, "v1");
    expect(cfgs.find((c) => c.id === 2)?.type).toBe("picture_match_word");
    expect(cfgs.find((c) => c.id === 2)?.vocabFilter).toBeUndefined();
    expect(cfgs.find((c) => c.id === 3)?.type).toBe("listen_and_choose_word");
    expect(cfgs.find((c) => c.id === 7)?.type).toBe("dialogue_response");
    expect(cfgs.find((c) => c.id === 8)?.type).toBe("fill_in_choose");
    expect(cfgs.find((c) => c.id === 9)?.type).toBe("sentence_transform");
    expect(cfgs.find((c) => c.id === 10)?.type).toBe("sentence_ordering");
  });

  it("grade 6 v2 splits listening into 比较级(关2)/过去式(关3), 10 levels playable incl 句型转换/连词成句", () => {
    const cfgs = getLevelConfigs(6, "v2");
    const l2 = cfgs.find((c) => c.id === 2);
    const l3 = cfgs.find((c) => c.id === 3);
    expect(l2?.type).toBe("listen_and_choose_word");
    expect(l2?.vocabFilter).toBe("comparative");
    expect(l3?.type).toBe("listen_and_choose_word");
    expect(l3?.vocabFilter).toBe("past");
    expect(cfgs.find((c) => c.id === 8)?.type).toBe("fill_in_choose");
    expect(cfgs.find((c) => c.id === 9)?.type).toBe("sentence_transform");
    expect(cfgs.find((c) => c.id === 10)?.type).toBe("sentence_ordering");
    // 第 2 关不再是看图选词(v2 没有该题型数据)。
    expect(cfgs.some((c) => c.type === "picture_match_word")).toBe(false);
    // 10 个可玩关(type !== null)：1-10。
    expect(cfgs.filter((c) => c.type !== null).length).toBe(10);
  });

  it("findLevelConfig resolves the volume-specific config", () => {
    expect(findLevelConfig(2, 6, "v2")?.vocabFilter).toBe("comparative");
    expect(findLevelConfig(2, 6, "v1")?.type).toBe("picture_match_word");
    expect(findLevelConfig(8, 6, "v1")?.type).toBe("fill_in_choose");
  });

  it("iconForLevel maps each type to its emoji", () => {
    expect(iconForLevel({ id: 8, name: "选词填空", type: "fill_in_choose" })).toBe("✏️");
    expect(iconForLevel({ id: 7, name: "情景答语", type: "dialogue_response" })).toBe("🗨️");
    expect(iconForLevel({ id: 3, name: "听音辨词", type: "listen_and_choose_word" })).toBe("🎧");
    expect(iconForLevel({ id: 9, name: "句型转换", type: "sentence_transform" })).toBe("🔄");
    expect(iconForLevel({ id: 10, name: "连词成句", type: "sentence_ordering" })).toBe("🧩");
    expect(iconForLevel({ id: 11, name: "敬请期待", type: null })).toBe("🎯");
  });
});
