/**
 * 《英语闯关》题库加载 / 筛选 / 查询
 *
 * - seed JSON 在加载时 cast 为 FCQuestion[]；结构由
 *   questionBank.test.ts 在 CI/CD 中以运行时断言把关。
 * - getQuestionsByType 用 generic + Extract 让消费者拿到精确分支
 *   类型（如 listen_and_choose_word 的结果会有 audio 字段，编译期校验）。
 */

import seed from "@/data/primaryHub/finalChallenge/grade4_v2_seed.json";
import type {
  FCQuestion,
  FinalChallengeQuestionType,
} from "./types";

const QUESTIONS: readonly FCQuestion[] = seed as unknown as readonly FCQuestion[];

/** 返回题库全部题目（只读引用）。 */
export function getAllQuestions(): readonly FCQuestion[] {
  return QUESTIONS;
}

/**
 * 按题型筛选并随机抽取 N 道。
 * 返回值通过 Extract 收窄到对应分支类型，调用方拿到的题目可以直接
 * 访问该题型的专属字段（如 `.audio` / `.passage`），无需再判别。
 */
export function getQuestionsByType<T extends FinalChallengeQuestionType>(
  type: T,
  count: number = 5,
): Extract<FCQuestion, { type: T }>[] {
  const pool = QUESTIONS.filter(
    (q): q is Extract<FCQuestion, { type: T }> => q.type === type,
  );
  return [...pool].sort(() => Math.random() - 0.5).slice(0, count);
}

/** 按 id 精确取题。未命中返回 null。 */
export function getQuestionById(id: string): FCQuestion | null {
  return QUESTIONS.find((q) => q.id === id) ?? null;
}

/** 诊断用：返回每个题型当前的题目数量。 */
export function getQuestionTypeCounts(): Record<FinalChallengeQuestionType, number> {
  const counts: Record<FinalChallengeQuestionType, number> = {
    picture_match_sentence: 0,
    picture_match_word: 0,
    listen_and_choose_word: 0,
    listen_and_judge_picture: 0,
    odd_one_out: 0,
    reading_judge_TF: 0,
    reading_choose_answer: 0,
  };
  for (const q of QUESTIONS) counts[q.type] += 1;
  return counts;
}
