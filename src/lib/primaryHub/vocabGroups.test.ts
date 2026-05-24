import { describe, expect, it } from "vitest";
import { findUnit } from "./courseData";
import { getVocabGroups } from "./vocabGroupsRegistry";

describe("vocabGroupsRegistry", () => {
  const u1 = findUnit("g4v2_u1");
  const u2 = findUnit("g4v2_u2");

  it("loads g4v2_u1 from course data", () => {
    expect(u1).not.toBeNull();
    expect(u1?.vocabGroups).toHaveLength(3);
  });

  it("returns 3 groups for g4v2_u1 with counts 8+5+6", () => {
    expect(u1).not.toBeNull();
    const groups = getVocabGroups(u1!);
    expect(groups).not.toBeNull();
    expect(groups).toHaveLength(3);
    expect(groups!.map((g) => g.items.length)).toEqual([8, 5, 6]);
  });

  it("preserves g4v2_u1 group labels and headers", () => {
    const groups = getVocabGroups(u1!);
    expect(groups![0].label).toBe("学校场所");
    expect(groups![0].header).toBe("学校场所 · 8 个词");
    expect(groups![1].label).toBe("日常用词");
    expect(groups![2].label).toBe("拼读词");
    expect(groups![2].showPhonicsRule).toBe(true);
  });

  it("preserves g4v2_u1 first and last words per group", () => {
    const groups = getVocabGroups(u1!);
    expect(groups![0].items[0].en).toBe("first floor");
    expect(groups![0].items[7].en).toBe("music room");
    expect(groups![1].items[0].en).toBe("next to");
    expect(groups![1].items[4].en).toBe("way");
    expect(groups![2].items[0].en).toBe("water");
    expect(groups![2].items[5].en).toBe("ruler");
  });

  it("preserves global offsets for progress tracking", () => {
    const groups = getVocabGroups(u1!);
    expect(groups!.map((g) => g.offset)).toEqual([0, 8, 13]);
  });

  it("returns null for g4v2_u2 without vocabGroups (single-group fallback)", () => {
    expect(u2).not.toBeNull();
    expect(u2?.vocabGroups).toBeUndefined();
    expect(getVocabGroups(u2!)).toBeNull();
  });
});
