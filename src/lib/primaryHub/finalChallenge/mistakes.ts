/**
 * 《英语闯关》错题入库 — Phase 2 AI 出题的数据地基
 *
 * 用户隔离: 复用 getStorageScope (同 #71c progress / PR #64 spelling-resume)。
 * 存储: localStorage key `fc_mistakes_<scope>_g<grade>`,value 是错题数组。
 *
 * 每条错题必须携带 vocab_domain + grammar_point 标签 (从题目继承),
 * Phase 2 Claude API 会按这两个维度聚合,生成针对性强化题。
 *
 * 容量上限 500 条,超出从最旧的开始砍。一般情况一个孩子玩一个 Phase 1
 * 完整流程 ~30 题, 1/3 答错也才 10 条,500 条足够长期记录。
 */

import { getStorageScope } from "@/lib/primaryHub/spellingStageConfig";
import type { FinalChallengeQuestionType } from "./types";

export interface FinalChallengeMistake {
  /** 题目 id。reading 题的子题用 `${parentId}_sub${idx}` 区分。 */
  questionId: string;
  questionType: FinalChallengeQuestionType;
  levelId: number;
  /**
   * 题干文本 (回顾用)。
   * - 非阅读题: 用 q.prompt
   * - 阅读题: 用 sub.stem (子题更具体)
   */
  stem: string;
  /** 用户选的选项文本。 */
  userText: string;
  /** 正确答案的选项文本。 */
  correctText: string;
  /**
   * Phase 2 AI 出题的关键标签 (从父题继承,非空)。
   */
  vocab_domain: string[];
  grammar_point: string[];
  attemptedAt: number;
}

const MAX_MISTAKES = 500;

const mistakesKey = (scope: string, grade: number) =>
  `fc_mistakes_${scope}_g${grade}`;

function load(
  userId: string | null | undefined,
  grade: number,
): FinalChallengeMistake[] {
  try {
    const raw = localStorage.getItem(mistakesKey(getStorageScope(userId), grade));
    if (!raw) return [];
    const data = JSON.parse(raw) as unknown;
    return Array.isArray(data) ? (data as FinalChallengeMistake[]) : [];
  } catch {
    return [];
  }
}

function save(
  userId: string | null | undefined,
  grade: number,
  list: FinalChallengeMistake[],
): void {
  try {
    localStorage.setItem(
      mistakesKey(getStorageScope(userId), grade),
      JSON.stringify(list),
    );
  } catch {
    // localStorage quota / disabled — silently ignore
  }
}

/** 追加一条错题。容量超 500 从最旧的开始砍。 */
export function recordMistake(
  userId: string | null | undefined,
  grade: number,
  mistake: FinalChallengeMistake,
): void {
  const list = load(userId, grade);
  list.push(mistake);
  if (list.length > MAX_MISTAKES) {
    list.splice(0, list.length - MAX_MISTAKES);
  }
  save(userId, grade, list);
}

/** 读出当前用户当前年级的全部错题 (Phase 2 入口)。 */
export function getMistakes(
  userId: string | null | undefined,
  grade: number,
): FinalChallengeMistake[] {
  return load(userId, grade);
}

/** 清空 (本地测试 / 设置页"重置闯关数据"用)。 */
export function clearMistakes(
  userId: string | null | undefined,
  grade: number,
): void {
  try {
    localStorage.removeItem(mistakesKey(getStorageScope(userId), grade));
  } catch {
    /* ignore */
  }
}

/* ----- Phase 2 辅助:按标签聚合 ----- */

/** 按 vocab_domain 维度聚合 (一道题多 domain 会算多次)。 */
export function groupByVocabDomain(
  mistakes: FinalChallengeMistake[],
): Record<string, FinalChallengeMistake[]> {
  const out: Record<string, FinalChallengeMistake[]> = {};
  for (const m of mistakes) {
    for (const d of m.vocab_domain) {
      if (!out[d]) out[d] = [];
      out[d].push(m);
    }
  }
  return out;
}

/** 按 grammar_point 维度聚合 (一道题多 point 会算多次)。 */
export function groupByGrammarPoint(
  mistakes: FinalChallengeMistake[],
): Record<string, FinalChallengeMistake[]> {
  const out: Record<string, FinalChallengeMistake[]> = {};
  for (const m of mistakes) {
    for (const g of m.grammar_point) {
      if (!out[g]) out[g] = [];
      out[g].push(m);
    }
  }
  return out;
}
