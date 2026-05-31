import { describe, it, expect } from "vitest";
import { getLevelConfigs, findLevelConfig } from "./levels";

describe("finalChallenge level configs (grade + volume aware)", () => {
  it("grade <6 keeps the base 10-level layout (level 7 = 敬请期待 placeholder)", () => {
    for (const g of [3, 4, 5]) {
      const cfgs = getLevelConfigs(g, "v2");
      expect(cfgs.find((c) => c.id === 2)?.type).toBe("picture_match_word");
      expect(cfgs.find((c) => c.id === 7)?.type).toBeNull();
    }
  });

  it("grade 6 v1 keeps 看图选词 at level 2 and 情景答语 at level 7", () => {
    const cfgs = getLevelConfigs(6, "v1");
    expect(cfgs.find((c) => c.id === 2)?.type).toBe("picture_match_word");
    expect(cfgs.find((c) => c.id === 2)?.vocabFilter).toBeUndefined();
    expect(cfgs.find((c) => c.id === 3)?.type).toBe("listen_and_choose_word");
    expect(cfgs.find((c) => c.id === 7)?.type).toBe("dialogue_response");
  });

  it("grade 6 v2 splits listening into 比较级(关2)/过去式(关3), keeps 7 levels playable", () => {
    const cfgs = getLevelConfigs(6, "v2");
    const l2 = cfgs.find((c) => c.id === 2);
    const l3 = cfgs.find((c) => c.id === 3);
    expect(l2?.type).toBe("listen_and_choose_word");
    expect(l2?.vocabFilter).toBe("comparative");
    expect(l3?.type).toBe("listen_and_choose_word");
    expect(l3?.vocabFilter).toBe("past");
    // 第 2 关不再是看图选词(v2 没有该题型数据)。
    expect(cfgs.some((c) => c.type === "picture_match_word")).toBe(false);
    // 7 个可玩关(type !== null)。
    expect(cfgs.filter((c) => c.type !== null).length).toBe(7);
  });

  it("findLevelConfig resolves the volume-specific config", () => {
    expect(findLevelConfig(2, 6, "v2")?.vocabFilter).toBe("comparative");
    expect(findLevelConfig(2, 6, "v1")?.type).toBe("picture_match_word");
  });
});
