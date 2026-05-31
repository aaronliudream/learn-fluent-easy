/**
 * 《英语闯关》题库加载 / 筛选 / 查询
 *
 * - seed JSON 在加载时 cast 为 FCQuestion[]；结构由
 *   questionBank.test.ts 在 CI/CD 中以运行时断言把关。
 * - getQuestionsByType 用 generic + Extract 让消费者拿到精确分支
 *   类型（如 listen_and_choose_word 的结果会有 audio 字段，编译期校验）。
 */

import seedV1 from "@/data/primaryHub/finalChallenge/grade4_v1_seed.json";
import seedV2 from "@/data/primaryHub/finalChallenge/grade4_v2_seed.json";
import seedG3V1 from "@/data/primaryHub/finalChallenge/grade3_v1_seed.json";
import seedG3V2 from "@/data/primaryHub/finalChallenge/grade3_v2_seed.json";
import type {
  FCQuestion,
  FinalChallengeQuestionType,
} from "./types";

/** 教材册别：v1=上册、v2=下册。 */
export type FCVolume = "v1" | "v2";

/** 题库按 "年级:册别" 索引。新增年级在这里加一行 import + 一个键即可。 */
const BANKS: Record<string, readonly FCQuestion[]> = {
  "4:v1": seedV1 as unknown as readonly FCQuestion[],
  "4:v2": seedV2 as unknown as readonly FCQuestion[],
  "3:v1": seedG3V1 as unknown as readonly FCQuestion[],
  "3:v2": seedG3V2 as unknown as readonly FCQuestion[],
};

/** 默认 v2 —— 保证所有现有调用方（下册）行为完全不变。 */
const DEFAULT_VOLUME: FCVolume = "v2";
const DEFAULT_GRADE = 4;

/** 取某年级某册的题库；缺失时回退到四年级同册、再回退四年级下册。 */
function bankFor(grade: number, volume: FCVolume): readonly FCQuestion[] {
  return (
    BANKS[`${grade}:${volume}`] ??
    BANKS[`${DEFAULT_GRADE}:${volume}`] ??
    BANKS[`${DEFAULT_GRADE}:${DEFAULT_VOLUME}`]
  );
}

/** 返回题库全部题目（只读引用）。 */
export function getAllQuestions(
  volume: FCVolume = DEFAULT_VOLUME,
  grade: number = DEFAULT_GRADE,
): readonly FCQuestion[] {
  return bankFor(grade, volume);
}

/**
 * 按题型筛选并随机抽取 N 道。
 * 返回值通过 Extract 收窄到对应分支类型，调用方拿到的题目可以直接
 * 访问该题型的专属字段（如 `.audio` / `.passage`），无需再判别。
 */
export function getQuestionsByType<T extends FinalChallengeQuestionType>(
  type: T,
  count: number = 5,
  volume: FCVolume = DEFAULT_VOLUME,
  grade: number = DEFAULT_GRADE,
): Extract<FCQuestion, { type: T }>[] {
  const pool = bankFor(grade, volume).filter(
    (q): q is Extract<FCQuestion, { type: T }> => q.type === type,
  );
  return [...pool].sort(() => Math.random() - 0.5).slice(0, count);
}

/** 按 id 精确取题。未命中返回 null。 */
export function getQuestionById(
  id: string,
  volume: FCVolume = DEFAULT_VOLUME,
  grade: number = DEFAULT_GRADE,
): FCQuestion | null {
  return bankFor(grade, volume).find((q) => q.id === id) ?? null;
}

/** 诊断用：返回每个题型当前的题目数量。 */
export function getQuestionTypeCounts(
  volume: FCVolume = DEFAULT_VOLUME,
  grade: number = DEFAULT_GRADE,
): Record<FinalChallengeQuestionType, number> {
  const counts: Record<FinalChallengeQuestionType, number> = {
    picture_match_sentence: 0,
    picture_match_word: 0,
    listen_and_choose_word: 0,
    listen_and_choose_answer: 0,
    listen_and_judge_picture: 0,
    odd_one_out: 0,
    reading_judge_TF: 0,
    reading_choose_answer: 0,
  };
  for (const q of bankFor(grade, volume)) counts[q.type] += 1;
  return counts;
}
