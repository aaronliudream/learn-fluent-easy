import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  countFillChoiceBlanks,
  FILL_CHOICE_BLANK,
  splitFillChoiceSentence,
  warnFillChoiceQuestion,
} from "./fillChoiceSentence";
import { validateFillChoiceSentence } from "./readWriteValidation";
import * as registryDiscovery from "./registryDiscovery";

describe("splitFillChoiceSentence", () => {
  it("splits g4v1_u2 Q6 sentence with three underscores", () => {
    const sentence = "The staff finds the bag. She says: ___ it is!";
    const { before, after, token, missingBlank } = splitFillChoiceSentence(sentence);
    expect(missingBlank).toBe(false);
    expect(before).toBe("The staff finds the bag. She says: ");
    expect(after).toBe(" it is!");
    expect(token).toBe("___");
    expect(countFillChoiceBlanks(sentence)).toBe(1);
  });

  it("splits g4v2_u2 time sentence with four underscores", () => {
    const sentence = "🌅 It's 7 o'clock. It's time to ____.";
    const { before, after, token, missingBlank } = splitFillChoiceSentence(sentence);
    expect(missingBlank).toBe(false);
    expect(before).toBe("🌅 It's 7 o'clock. It's time to ");
    expect(after).toBe(".");
    expect(token).toBe("____");
  });

  it("treats 5+ underscores as a single blank (greedy)", () => {
    const sentence = "Go _____ now.";
    const { token, before, after } = splitFillChoiceSentence(sentence);
    expect(token).toBe("_____");
    expect(before).toBe("Go ");
    expect(after).toBe(" now.");
    expect(countFillChoiceBlanks(sentence)).toBe(1);
  });

  it("falls back when no placeholder", () => {
    const sentence = "No blank here.";
    const result = splitFillChoiceSentence(sentence);
    expect(result.missingBlank).toBe(true);
    expect(result.before).toBe(sentence);
    expect(result.after).toBe("");
    expect(result.token).toBe(FILL_CHOICE_BLANK);
    expect(countFillChoiceBlanks(sentence)).toBe(0);
  });

  it("uses only the first blank when multiple placeholders", () => {
    const sentence = "___ one ___ two";
    const { before, after, token } = splitFillChoiceSentence(sentence);
    expect(before).toBe("");
    expect(token).toBe("___");
    expect(after).toBe(" one ___ two");
    expect(countFillChoiceBlanks(sentence)).toBe(2);
  });
});

describe("warnFillChoiceQuestion", () => {
  beforeEach(() => {
    vi.stubEnv("DEV", true);
    vi.spyOn(registryDiscovery, "warnRegistryDev").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("warns when no placeholder", () => {
    warnFillChoiceQuestion("No blank.", "test.json q1");
    expect(registryDiscovery.warnRegistryDev).toHaveBeenCalledWith(
      expect.stringContaining("no blank placeholder"),
    );
  });

  it("warns when multiple placeholders", () => {
    warnFillChoiceQuestion("___ a ___ b", "test.json q2");
    expect(registryDiscovery.warnRegistryDev).toHaveBeenCalledWith(
      expect.stringContaining("2 blank placeholders"),
    );
  });

  it("does not warn for a single blank", () => {
    warnFillChoiceQuestion("She says: ___ it is!", "test.json q6");
    expect(registryDiscovery.warnRegistryDev).not.toHaveBeenCalled();
  });
});

describe("validateFillChoiceSentence", () => {
  it("accepts g4v1_u2 Q6 and g4v2_u2 time sentence", () => {
    expect(validateFillChoiceSentence("The staff finds the bag. She says: ___ it is!")).toEqual({
      ok: true,
      blankCount: 1,
    });
    expect(validateFillChoiceSentence("🌅 It's 7 o'clock. It's time to ____.")).toEqual({
      ok: true,
      blankCount: 1,
    });
  });

  it("rejects missing and multiple blanks", () => {
    expect(validateFillChoiceSentence("No blank.")).toMatchObject({
      ok: false,
      reason: "missing_blank",
    });
    expect(validateFillChoiceSentence("___ one ___ two")).toMatchObject({
      ok: false,
      reason: "multiple_blanks",
    });
  });
});
