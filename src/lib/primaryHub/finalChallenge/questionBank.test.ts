import { describe, it, expect } from "vitest";
import {
  getAllQuestions,
  getQuestionById,
  getQuestionsByType,
  getQuestionTypeCounts,
} from "./questionBank";
import type { FinalChallengeQuestionType } from "./types";

/** Phase 1 实际使用的 6 个题型；第 7 个 reading_choose_answer 留给 Phase 3。 */
const PHASE1_TYPES: FinalChallengeQuestionType[] = [
  "picture_match_sentence",
  "picture_match_word",
  "listen_and_choose_word",
  "listen_and_judge_picture",
  "odd_one_out",
  "reading_judge_TF",
];

describe("finalChallenge questionBank", () => {
  const all = getAllQuestions();

  it("loads the seed and returns a non-empty list", () => {
    expect(all.length).toBeGreaterThanOrEqual(6);
  });

  it("every Phase 1 type has at least one question", () => {
    const counts = getQuestionTypeCounts();
    for (const t of PHASE1_TYPES) {
      expect(counts[t], `type ${t} count`).toBeGreaterThanOrEqual(1);
    }
  });

  it("every question carries non-empty vocab_domain and grammar_point", () => {
    for (const q of all) {
      expect(Array.isArray(q.vocab_domain), `${q.id} vocab_domain is array`).toBe(true);
      expect(q.vocab_domain.length, `${q.id} vocab_domain non-empty`).toBeGreaterThan(0);
      expect(Array.isArray(q.grammar_point), `${q.id} grammar_point is array`).toBe(true);
      expect(q.grammar_point.length, `${q.id} grammar_point non-empty`).toBeGreaterThan(0);
    }
  });

  it("ids are unique across the bank", () => {
    const ids = all.map((q) => q.id);
    expect(new Set(ids).size, "duplicate ids").toBe(ids.length);
  });

  it("reading_judge_TF questions have a passage and at least one subQuestion", () => {
    for (const q of all) {
      if (q.type === "reading_judge_TF") {
        expect(q.passage, `${q.id} passage`).toBeTruthy();
        expect(Array.isArray(q.subQuestions), `${q.id} subQuestions array`).toBe(true);
        expect(q.subQuestions.length, `${q.id} subQuestions non-empty`).toBeGreaterThan(0);
        for (const sub of q.subQuestions) {
          expect(sub.stem.trim().length, `${q.id} sub stem non-empty`).toBeGreaterThan(0);
          expect(sub.options.length, `${q.id} sub options len`).toBeGreaterThan(1);
          expect(sub.answer, `${q.id} sub answer >=0`).toBeGreaterThanOrEqual(0);
          expect(sub.answer, `${q.id} sub answer < options.length`).toBeLessThan(sub.options.length);
        }
      }
    }
  });

  it("non-reading questions have a valid answer index within options", () => {
    for (const q of all) {
      if (q.type === "reading_judge_TF" || q.type === "reading_choose_answer") continue;
      expect(q.options.length, `${q.id} options non-empty`).toBeGreaterThan(0);
      expect(q.answer, `${q.id} answer >=0`).toBeGreaterThanOrEqual(0);
      expect(q.answer, `${q.id} answer < options.length`).toBeLessThan(q.options.length);
    }
  });

  it("getQuestionsByType returns at most the requested count and only that type", () => {
    const five = getQuestionsByType("picture_match_sentence", 5);
    expect(five.length).toBeLessThanOrEqual(5);
    expect(five.length).toBeGreaterThanOrEqual(1);
    for (const q of five) expect(q.type).toBe("picture_match_sentence");
  });

  it("getQuestionsByType narrows the result type at compile time", () => {
    // Compile-time narrowing check: accessing branch-only fields should be valid.
    // Runtime: the seed currently has 1 question per type, so the array has 1 entry.
    const listen = getQuestionsByType("listen_and_choose_word", 1);
    if (listen.length > 0) {
      expect(typeof listen[0].audio).toBe("string");
      expect(listen[0].audio.length).toBeGreaterThan(0);
    }
    const reading = getQuestionsByType("reading_judge_TF", 1);
    if (reading.length > 0) {
      expect(typeof reading[0].passage).toBe("string");
      expect(reading[0].subQuestions.length).toBeGreaterThan(0);
    }
  });

  it("shuffles options across draws but answer always points at the correct option", () => {
    // 原始题库里每道选择题的正确选项文本(打散前)。
    const correctById = new Map<string, string>();
    for (const q of all) {
      if (q.type === "reading_judge_TF" || q.type === "reading_choose_answer") continue;
      correctById.set(q.id, q.options[q.answer]);
    }
    const firstOptionSeen = new Map<string, Set<string>>();
    for (let t = 0; t < 40; t++) {
      for (const q of getQuestionsByType("picture_match_sentence", 5)) {
        // 不变式:无论怎么打散,answer 指向的永远是原来的正确文本。
        expect(q.options[q.answer]).toBe(correctById.get(q.id));
        const set = firstOptionSeen.get(q.id) ?? new Set<string>();
        set.add(q.options[0]);
        firstOptionSeen.set(q.id, set);
      }
    }
    // 反"答案总在第一个":至少有一道题的首选项在多次抽取中出现过不止一种。
    expect([...firstOptionSeen.values()].some((s) => s.size > 1)).toBe(true);
  });

  it("never reorders fixed T/F options (listen_and_judge_picture)", () => {
    for (let t = 0; t < 20; t++) {
      for (const q of getQuestionsByType("listen_and_judge_picture", 5)) {
        expect(q.options[0]).toMatch(/^T/);
        expect(q.options[1]).toMatch(/^F/);
      }
    }
  });

  it("getQuestionById returns null for an unknown id", () => {
    expect(getQuestionById("does-not-exist")).toBeNull();
  });

  it("getQuestionById returns the matching question for a known id", () => {
    const first = all[0];
    expect(getQuestionById(first.id)?.id).toBe(first.id);
  });
});
