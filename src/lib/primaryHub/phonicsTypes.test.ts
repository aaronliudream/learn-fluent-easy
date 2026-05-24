import { describe, expect, it } from "vitest";
import { defaultPhonicsAudioBase, isPhonicsConfig } from "./phonicsTypes";

describe("phonicsTypes", () => {
  it("defaultPhonicsAudioBase builds unit-scoped path", () => {
    expect(defaultPhonicsAudioBase("g4v2_u1")).toBe("/audio/primary/phonics/g4v2_u1");
  });

  it("accepts a minimal valid PhonicsConfig shape", () => {
    expect(
      isPhonicsConfig({
        unitId: "g4v2_u2",
        semesterId: "grade4_volume2",
        title: "自然拼读 · ir",
        phonics_rule: "ir",
        phonics_sound: "/ɜː(r)/",
        rule_explanation: "test",
        audioBase: "/audio/primary/phonics/g4v2_u2",
        stage_1_listen: [],
        stage_2_find: [],
        stage_3_challenge: [],
      }),
    ).toBe(true);
  });

  it("rejects missing required fields", () => {
    expect(isPhonicsConfig(null)).toBe(false);
    expect(isPhonicsConfig({ unitId: "g4v2_u1" })).toBe(false);
    expect(
      isPhonicsConfig({
        unitId: "g4v2_u1",
        semesterId: "grade4_volume2",
        title: "x",
        phonics_rule: "er",
        phonics_sound: "/ə/",
        rule_explanation: "x",
        audioBase: "/audio/x",
        stage_1_listen: [],
        stage_2_find: "not-array",
        stage_3_challenge: [],
      }),
    ).toBe(false);
  });
});
