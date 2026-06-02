/**
 * 初中《期中/期末闯关》题库加载 / 筛选 / 查询 —— Fork 自
 * `lib/primaryHub/finalChallenge/questionBank.ts`,逻辑一致,仅:
 *   - 题库换成 junior seed(按 "年级:册别" 索引,如 "7:v1" = 七上期中)
 *   - 默认年级 7、默认册别 v1
 *   - 类型契约共享 primary 的 types.ts(FCQuestion 不分学段)
 */

import seedG7V1 from "@/data/juniorHub/finalChallenge/grade7_v1_seed.json";
import seedG7V2 from "@/data/juniorHub/finalChallenge/grade7_v2_seed.json";
import type {
  FCQuestion,
  FinalChallengeQuestionType,
} from "@/lib/primaryHub/finalChallenge/types";

/** 教材册别:v1=上册(期中)、v2=下册(期末)。 */
export type FCVolume = "v1" | "v2";

/** 题库按 "年级:册别" 索引。新增册/年级在这里加一行 import + 一个键即可。 */
const BANKS: Record<string, readonly FCQuestion[]> = {
  "7:v1": seedG7V1 as unknown as readonly FCQuestion[],
  "7:v2": seedG7V2 as unknown as readonly FCQuestion[],
};

const DEFAULT_VOLUME: FCVolume = "v1";
const DEFAULT_GRADE = 7;

/** 每关抽题数(可调)。reading 关固定 1 篇 passage(含多子题),不走此值。 */
export function getDrawCount(_grade: number): number {
  return 8;
}

/** 取某年级某册题库;缺失时回退七上(v1)。 */
function bankFor(grade: number, volume: FCVolume): readonly FCQuestion[] {
  return (
    BANKS[`${grade}:${volume}`] ??
    BANKS[`${DEFAULT_GRADE}:${DEFAULT_VOLUME}`]
  );
}

/** 固定 T/F 选项对(听句判图 / 阅读判断)顺序是约定,不可打乱。 */
function isFixedTFOptions(options: readonly string[]): boolean {
  return (
    options.length === 2 &&
    options[0].startsWith("T") &&
    options[1].startsWith("F")
  );
}

/** 渲染前打散一道选择题的 options,并把 answer 同步重映射到新下标。 */
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

/** 是否参与"答案位置配额":三选一(options 长度=3)且不是固定 T/F。 */
function participatesInQuota(q: FCQuestion): boolean {
  return (
    "options" in q &&
    Array.isArray(q.options) &&
    q.options.length === 3 &&
    !isFixedTFOptions(q.options)
  );
}

/** 为 M 道参与配额的题生成"正确答案位置序列"(不扎堆、相邻不重复)。 */
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

/** 协调式打散:三选一题统一分配答案位置,其余题逐题打散(对 T/F / 阅读是 no-op)。 */
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

/** 返回题库全部题目(只读引用)。 */
export function getAllQuestions(
  volume: FCVolume = DEFAULT_VOLUME,
  grade: number = DEFAULT_GRADE,
): readonly FCQuestion[] {
  return bankFor(grade, volume);
}

/** 按题型筛选并随机抽取 N 道。 */
export function getQuestionsByType<T extends FinalChallengeQuestionType>(
  type: T,
  count: number = 5,
  volume: FCVolume = DEFAULT_VOLUME,
  grade: number = DEFAULT_GRADE,
  vocabFilter?: string,
): Extract<FCQuestion, { type: T }>[] {
  let pool = bankFor(grade, volume).filter(
    (q): q is Extract<FCQuestion, { type: T }> => q.type === type,
  );
  if (vocabFilter) {
    pool = pool.filter((q) => q.vocab_domain.includes(vocabFilter));
  }
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

/** 诊断用:返回每个题型当前的题目数量。 */
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
    sentence_ordering: 0,
  };
  for (const q of bankFor(grade, volume)) counts[q.type] += 1;
  return counts;
}
