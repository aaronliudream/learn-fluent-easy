import { describe, it, expect, beforeEach } from "vitest";
import {
  recordMistake,
  getMistakes,
  clearMistakes,
  groupByVocabDomain,
  groupByGrammarPoint,
  type FinalChallengeMistake,
} from "./mistakes";

const mk = (
  id: string,
  opts: Partial<FinalChallengeMistake> = {},
): FinalChallengeMistake => ({
  questionId: id,
  questionType: "picture_match_sentence",
  levelId: 1,
  stem: "stem-" + id,
  userText: "wrong",
  correctText: "right",
  vocab_domain: ["clothing"],
  grammar_point: ["present_simple_be"],
  attemptedAt: Date.now(),
  ...opts,
});

describe("finalChallenge mistakes", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("record then get round-trips one mistake", () => {
    recordMistake("user-a", 4, mk("q1"));
    const got = getMistakes("user-a", 4);
    expect(got.length).toBe(1);
    expect(got[0].questionId).toBe("q1");
  });

  it("appends multiple mistakes in order", () => {
    for (let i = 0; i < 5; i++) recordMistake("user-a", 4, mk("q" + i));
    const got = getMistakes("user-a", 4);
    expect(got.map((m) => m.questionId)).toEqual(["q0", "q1", "q2", "q3", "q4"]);
  });

  it("preserves vocab_domain and grammar_point arrays (Phase 2 命脉)", () => {
    recordMistake(
      "user-a",
      4,
      mk("q1", {
        vocab_domain: ["weather", "clothing"],
        grammar_point: ["it_is_weather", "present_simple_be"],
      }),
    );
    const got = getMistakes("user-a", 4);
    expect(got[0].vocab_domain).toEqual(["weather", "clothing"]);
    expect(got[0].grammar_point).toEqual(["it_is_weather", "present_simple_be"]);
  });

  it("isolates mistakes between different users", () => {
    recordMistake("user-a", 4, mk("q-a"));
    recordMistake("user-b", 4, mk("q-b"));
    expect(getMistakes("user-a", 4).map((m) => m.questionId)).toEqual(["q-a"]);
    expect(getMistakes("user-b", 4).map((m) => m.questionId)).toEqual(["q-b"]);
  });

  it("isolates mistakes between grades for the same user", () => {
    recordMistake("user-a", 4, mk("q-g4"));
    recordMistake("user-a", 5, mk("q-g5"));
    expect(getMistakes("user-a", 4).map((m) => m.questionId)).toEqual(["q-g4"]);
    expect(getMistakes("user-a", 5).map((m) => m.questionId)).toEqual(["q-g5"]);
  });

  it("guest (null userId) keeps a stable scope across calls", () => {
    recordMistake(null, 4, mk("q-guest"));
    expect(getMistakes(null, 4).length).toBe(1);
    recordMistake(null, 4, mk("q-guest-2"));
    expect(getMistakes(null, 4).map((m) => m.questionId)).toEqual([
      "q-guest",
      "q-guest-2",
    ]);
  });

  it("caps storage at 500 entries (oldest dropped first)", () => {
    for (let i = 0; i < 510; i++) recordMistake("user-a", 4, mk("q" + i));
    const got = getMistakes("user-a", 4);
    expect(got.length).toBe(500);
    // The first 10 (q0..q9) should be dropped; q10 should now be first.
    expect(got[0].questionId).toBe("q10");
    expect(got[got.length - 1].questionId).toBe("q509");
  });

  it("clearMistakes wipes the user/grade slot", () => {
    recordMistake("user-a", 4, mk("q1"));
    recordMistake("user-a", 4, mk("q2"));
    clearMistakes("user-a", 4);
    expect(getMistakes("user-a", 4)).toEqual([]);
  });

  it("groupByVocabDomain buckets mistakes by tag (a question with multiple tags appears in multiple buckets)", () => {
    recordMistake("u", 4, mk("q1", { vocab_domain: ["weather"] }));
    recordMistake("u", 4, mk("q2", { vocab_domain: ["clothing", "weather"] }));
    recordMistake("u", 4, mk("q3", { vocab_domain: ["family"] }));
    const groups = groupByVocabDomain(getMistakes("u", 4));
    expect(Object.keys(groups).sort()).toEqual(["clothing", "family", "weather"]);
    expect(groups.weather.length).toBe(2);
    expect(groups.clothing.length).toBe(1);
    expect(groups.family.length).toBe(1);
  });

  it("groupByGrammarPoint buckets by grammar_point similarly", () => {
    recordMistake("u", 4, mk("q1", { grammar_point: ["present_simple_be"] }));
    recordMistake(
      "u",
      4,
      mk("q2", { grammar_point: ["it_is_weather", "present_simple_be"] }),
    );
    const groups = groupByGrammarPoint(getMistakes("u", 4));
    expect(Object.keys(groups).sort()).toEqual([
      "it_is_weather",
      "present_simple_be",
    ]);
    expect(groups.present_simple_be.length).toBe(2);
    expect(groups.it_is_weather.length).toBe(1);
  });

  it("getMistakes returns [] for users with no mistakes", () => {
    expect(getMistakes("brand-new-user", 4)).toEqual([]);
  });
});
