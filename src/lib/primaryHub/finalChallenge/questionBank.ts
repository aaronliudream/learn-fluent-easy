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
import seedG5V1 from "@/data/primaryHub/finalChallenge/grade5_v1_seed.json";
import seedG5V2 from "@/data/primaryHub/finalChallenge/grade5_v2_seed.json";
import seedG6V1 from "@/data/primaryHub/finalChallenge/grade6_v1_seed.json";
import seedG6V2 from "@/data/primaryHub/finalChallenge/grade6_v2_seed.json";
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
  "5:v1": seedG5V1 as unknown as readonly FCQuestion[],
  "5:v2": seedG5V2 as unknown as readonly FCQuestion[],
  "6:v1": seedG6V1 as unknown as readonly FCQuestion[],
  "6:v2": seedG6V2 as unknown as readonly FCQuestion[],
};

/** 每关抽题数：六年级每关 7 道（题量更足），其余年级 5 道。
 *  阅读关固定 1 篇 passage（含多道子题），不走此值。 */
export function getDrawCount(grade: number): number {
  return grade === 6 ? 7 : 5;
}

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

/** 固定 T/F 选项对（听句判图 / 阅读判断）顺序是约定，不可打乱。 */
function isFixedTFOptions(options: readonly string[]): boolean {
  return (
    options.length === 2 &&
    options[0].startsWith("T") &&
    options[1].startsWith("F")
  );
}

/**
 * 渲染前把一道选择题的 options 随机打散（Fisher–Yates），并把 answer 同步
 * 重映射到打散后的新下标 —— 根治"正确答案总在第一个"。返回新对象，不改原种子。
 * 例外（原样返回，保持现状）：
 *   - 无顶层 options 的阅读题（reading_judge_TF / reading_choose_answer）；
 *   - 固定 T/F 选项的题（listen_and_judge_picture）。
 */
function shuffleQuestionOptions<T extends FCQuestion>(q: T): T {
  if (!("options" in q) || !Array.isArray(q.options)) return q;
  if (isFixedTFOptions(q.options)) return q;
  const order = q.options.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const options = order.map((i) => q.options[i]);
  const answer = order.indexOf(q.answer);
  return { ...q, options, answer };
}

/**
 * 一道题是否参与"答案位置配额"：三选一(options 长度=3) 且不是固定 T/F。
 * (T/F 听句判图、无 options 的阅读题都不参与,保持现状。)
 */
function participatesInQuota(q: FCQuestion): boolean {
  return (
    "options" in q &&
    Array.isArray(q.options) &&
    q.options.length === 3 &&
    !isFixedTFOptions(q.options)
  );
}

/**
 * 为 M 道参与配额的题(按显示顺序)生成"正确答案位置序列",满足:
 *   - 每个位置(0/1/2)出现次数 ≤ ⌊M/2⌋ (扎堆约束)
 *   - 相邻两题位置不相同 (连续约束)
 * 随机贪心 + 重试;极少数无解时兜底(放宽相邻、仅保配额),避免死循环。
 */
function assignAnswerPositions(M: number, P = 3, attempts = 200): number[] {
  const cap = Math.floor(M / 2);
  for (let t = 0; t < attempts; t++) {
    const seq: number[] = [];
    const counts = new Array(P).fill(0);
    let ok = true;
    for (let i = 0; i < M; i++) {
      const cands: number[] = [];
      for (let p = 0; p < P; p++) {
        if (counts[p] < cap && (i === 0 || p !== seq[i - 1])) cands.push(p);
      }
      if (cands.length === 0) {
        ok = false;
        break;
      }
      const p = cands[Math.floor(Math.random() * cands.length)];
      seq.push(p);
      counts[p]++;
    }
    if (ok) return seq;
  }
  // 兜底:放宽相邻约束、仅保配额。
  const seq: number[] = [];
  const counts = new Array(P).fill(0);
  const cap2 = Math.floor(M / 2);
  for (let i = 0; i < M; i++) {
    let best = 0;
    let bestc = Infinity;
    for (let p = 0; p < P; p++) {
      if (counts[p] < cap2 && counts[p] < bestc) {
        best = p;
        bestc = counts[p];
      }
    }
    seq.push(best);
    counts[best]++;
  }
  return seq;
}

/** 把正确选项放到指定位置 pos,另两个干扰项随机填到剩余两格;answer = pos。 */
function placeAnswerAt<T extends FCQuestion>(q: T, pos: number): T {
  if (!("options" in q) || !Array.isArray(q.options)) return q;
  const correct = q.answer;
  const distractors = q.options
    .map((_, i) => i)
    .filter((i) => i !== correct);
  for (let i = distractors.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [distractors[i], distractors[j]] = [distractors[j], distractors[i]];
  }
  const order = new Array<number>(q.options.length);
  order[pos] = correct;
  let d = 0;
  for (let p = 0; p < order.length; p++) {
    if (p === pos) continue;
    order[p] = distractors[d++];
  }
  const options = order.map((i) => q.options[i]);
  return { ...q, options, answer: pos };
}

/**
 * 对抽出的一组题做"协调式"打散:参与配额的三选一题(按显示顺序)统一分配
 * 答案位置(不扎堆、相邻不重复),其余题(T/F / 阅读)走原有的逐题打散(对它们是 no-op)。
 */
function applyAnswerQuota<T extends FCQuestion>(questions: T[]): T[] {
  const partIdx = questions
    .map((_, i) => i)
    .filter((i) => participatesInQuota(questions[i]));
  const seq = partIdx.length > 0 ? assignAnswerPositions(partIdx.length) : [];
  const posByIndex = new Map<number, number>();
  partIdx.forEach((qi, k) => posByIndex.set(qi, seq[k]));
  return questions.map((q, i) =>
    posByIndex.has(i) ? placeAnswerAt(q, posByIndex.get(i)!) : shuffleQuestionOptions(q),
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
  /** 可选：题目的 vocab_domain 须包含此值才入选（如六下听词关按比较级/过去式拆分）。 */
  vocabFilter?: string,
): Extract<FCQuestion, { type: T }>[] {
  let pool = bankFor(grade, volume).filter(
    (q): q is Extract<FCQuestion, { type: T }> => q.type === type,
  );
  if (vocabFilter) {
    pool = pool.filter((q) => q.vocab_domain.includes(vocabFilter));
  }
  // 抽 N 道后，渲染前对选项做打散。三选一题型走"协调式配额"分配答案位置
  // (不扎堆某字母、相邻不重复),T/F / 阅读题原样不动。
  // 调用方在 useMemo 里只算一次，停留期间选项稳定，不会跳动。
  const drawn = [...pool].sort(() => Math.random() - 0.5).slice(0, count);
  return applyAnswerQuota(drawn);
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
    dialogue_response: 0,
    fill_in_choose: 0,
    sentence_transform: 0,
  };
  for (const q of bankFor(grade, volume)) counts[q.type] += 1;
  return counts;
}
