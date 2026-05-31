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

  it("answer-position quota: ≤⌊N/2⌋ per slot, no adjacent repeat, answer stays correct (1000 draws)", () => {
    // 原始正确文本(用于校验 answer 仍指向正确项)。
    const correctById = new Map<string, string>();
    for (const q of getAllQuestions("v1", 6)) {
      // 跳过无 options 的题(阅读 / 连词成句),它们不参与选项配额。
      if (!("options" in q) || !Array.isArray(q.options)) continue;
      correctById.set(q.id, q.options[q.answer]);
    }
    for (const N of [7, 5]) {
      const cap = Math.floor(N / 2); // 7→3, 5→2
      for (let t = 0; t < 1000; t++) {
        const drawn = getQuestionsByType("picture_match_sentence", N, "v1", 6);
        expect(drawn.length).toBe(N);
        const pos = drawn.map((q) => q.answer);
        // 配额:每个位置出现次数 ≤ cap
        const counts = [0, 0, 0];
        for (const p of pos) counts[p]++;
        for (let p = 0; p < 3; p++) {
          expect(counts[p], `N=${N} slot ${p} count ${counts[p]} > cap ${cap}`).toBeLessThanOrEqual(cap);
        }
        // 相邻不重复
        for (let i = 1; i < pos.length; i++) {
          expect(pos[i], `N=${N} adjacent repeat at ${i}`).not.toBe(pos[i - 1]);
        }
        // answer 仍指向原正确选项文本
        for (const q of drawn) {
          expect(q.options[q.answer]).toBe(correctById.get(q.id));
        }
      }
    }
  });

  it("never reorders fixed T/F options (listen_and_judge_picture)", () => {
    for (let t = 0; t < 20; t++) {
      for (const q of getQuestionsByType("listen_and_judge_picture", 5)) {
        expect(q.options[0]).toMatch(/^T/);
        expect(q.options[1]).toMatch(/^F/);
      }
    }
  });

  it("vocabFilter narrows getQuestionsByType, and v2 comparative/past lcw pools are disjoint", () => {
    const comp = getQuestionsByType("listen_and_choose_word", 99, "v2", 6, "comparative");
    const past = getQuestionsByType("listen_and_choose_word", 99, "v2", 6, "past");
    expect(comp.length).toBeGreaterThanOrEqual(7); // 第2关抽 7,池子要够
    expect(past.length).toBeGreaterThanOrEqual(7); // 第3关抽 7
    for (const q of comp) expect(q.vocab_domain).toContain("comparative");
    for (const q of past) expect(q.vocab_domain).toContain("past");
    // 六下「听词·比较级」与「听词·过去式」两关 id 不重叠 → 真机不会雷同。
    const compIds = new Set(comp.map((q) => q.id));
    expect(past.some((q) => compIds.has(q.id))).toBe(false);
  });

  it("grade 6 fill_in_choose draws have a blanked prompt and a full audio sentence", () => {
    for (const vol of ["v1", "v2"] as const) {
      const drawn = getQuestionsByType("fill_in_choose", 7, vol, 6);
      expect(drawn.length).toBe(7);
      for (const q of drawn) {
        expect(q.prompt).toContain("___"); // 屏显挖空句
        expect(typeof q.audio).toBe("string");
        expect(q.audio).not.toContain("___"); // audio 是填好的完整句
        expect(q.answer).toBeGreaterThanOrEqual(0);
        expect(q.answer).toBeLessThan(q.options.length);
      }
    }
  });

  it("grade 6 sentence_ordering draws keep tokens/answer(string[])/display intact (quota no-op)", () => {
    for (const vol of ["v1", "v2"] as const) {
      const byId = new Map(
        getAllQuestions(vol, 6)
          .filter((q) => q.type === "sentence_ordering")
          .map((q) => [q.id, q]),
      );
      for (let t = 0; t < 50; t++) {
        const drawn = getQuestionsByType("sentence_ordering", 7, vol, 6);
        expect(drawn.length).toBe(7);
        for (const q of drawn) {
          // answer 是 string[](不是 number),没有 options,不被选项配额/打散改动。
          expect(Array.isArray(q.answer)).toBe(true);
          expect("options" in q).toBe(false);
          expect(Array.isArray(q.tokens)).toBe(true);
          expect(typeof q.display).toBe("string");
          // tokens/answer 与种子完全一致(逐位),且 answer 是 tokens 的一个排列。
          const orig = byId.get(q.id)!;
          expect(q.tokens).toEqual(orig.tokens);
          expect(q.answer).toEqual(orig.answer);
          expect([...q.tokens].sort()).toEqual([...q.answer].sort());
        }
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
