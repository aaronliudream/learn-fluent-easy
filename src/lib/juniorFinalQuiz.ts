import {
  resolveUnitPoints,
  loadUnitPool,
  computeUnitMastery,
  type UnitPoint,
  type UnitQuestion,
} from "./juniorUnitGrammar";
import { loadJuniorGrammarMasteryAll } from "./juniorGrammarFsrs";
import { loadKpMastery } from "./juniorKnowledgePoint";
import { shuffleArray } from "./juniorHub/context";
import type { UnitDef } from "./juniorHub/types";
import type { QuizQuestion } from "./juniorHub/types";

/**
 * 单元综合通关速测(路A):12 题纯单选 = 语法7 + 听力3 + 词汇2,半自适应。
 *
 * - 语法:复用 juniorUnitGrammar(grammarCode→point→junior_grammar_questions),
 *   按本单元掌握度选难度配额(高2/2/3·中3/3/1·低4/2/1,难度不足时降级借补),
 *   弱知识点(kp)倾斜多抽,避开最近错题(mastery_matrix.wrongQ),每 point 保底 1 道。
 * - 听力:内联 listeningQuestions(单句 TTS,4 选项)洗牌取 3。
 * - 词汇:unit.vocabulary 内联生成 英↔中 MCQ 取 2。
 * - 每题选项洗牌 + answer 重映射(消除"点A白嫖"),题序整体洗牌。
 * - ⚠️ 语法池为空(无 grammarCode / 无 DB 题)→ 返回 null,调用层回退内联 quizQuestions。
 *
 * 「精确排除已做题」未做(答对题不记 question_id);现靠大题池随机 + 避错题降重复。
 * 留作第二步:finalQuiz 写 question_id 进 ai_question_attempts + 抽题读它排除。
 */

export type FinalQuizKind = "grammar" | "listening" | "vocab";

/** 喂 FinalQuizStage 的统一题项:QuizQuestion + finalQuiz 专用可选字段。
 *  kind 设为可选,使内联 quizQuestions(QuizQuestion[])回退时仍可赋值给本类型。 */
export type FinalQuizItem = QuizQuestion & {
  kind?: FinalQuizKind;
  explanation?: string;
  questionId?: string; // 语法题:junior_grammar_questions.id(记录用)
  pointId?: string; // 语法题归属 point(记录用)
  kpId?: string | null; // 语法题归属 kp(记录用)
};

const GRAMMAR_N = 7;
const LISTENING_N = 3;
const VOCAB_N = 2;

/** 难度三档配额(语法 7 题):跟本单元掌握度走。 */
function difficultyQuota(pct: number): Record<1 | 2 | 3, number> {
  if (pct > 0.8) return { 1: 2, 2: 2, 3: 3 }; // 高:偏难
  if (pct >= 0.5) return { 1: 3, 2: 3, 3: 1 }; // 中:均衡
  return { 1: 4, 2: 2, 3: 1 }; // 低:偏易
}

/** 题难度(null/越界 → 当中档 2)。 */
function diffOf(q: UnitQuestion): 1 | 2 | 3 {
  return q.difficulty === 1 || q.difficulty === 3 ? q.difficulty : 2;
}

/**
 * 解析"前言 key":去掉结尾"(所以)答案是 **X**。"那句,剩余前言相同 → 视为同模板。
 * 用于抽题去重(同前言尽量只抽1道,防 finalQuiz 里解析雷同扎堆)。
 * - 无解析 → 用 id 当 key(不与他人去重)。
 * - 已重写成具体解析的题(结尾无加粗答案句)→ 整段当 key,各题不同,自然不互相去重。
 */
function preambleKey(q: UnitQuestion): string {
  const s = String(q.explanation || "").trim();
  if (!s) return "__" + q.id;
  const cut = s.replace(/(所以)?答案(是|为)\s*\*\*[^*]+\*\*\s*[。.]?\s*$/, "").trim();
  return cut || s;
}

/**
 * 语法抽题:避错题 → 每 point 保底 1 道(弱kp优先) → 按难度配额补足 → 难→中→易降级兜底。
 * 叠加"前言去重":同一前言模板尽量只抽 1 道(软约束);若去重后凑不满 n,放宽允许同前言补足。
 */
function pickGrammar(
  pool: UnitQuestion[],
  points: UnitPoint[],
  quota: Record<1 | 2 | 3, number>,
  weakKp: Set<string>,
  wrongQ: Set<string>,
  n: number,
): UnitQuestion[] {
  // 避错题:排除最近错题 id;排除后不足 n 则放回全池。
  let avail = pool.filter((q) => !wrongQ.has(q.id));
  if (avail.length < n) avail = pool.slice();

  // 弱kp 优先排序(弱kp 的题排前,先洗牌再稳定排序)。
  const weakFirst = (arr: UnitQuestion[]) =>
    shuffleArray(arr).sort((a, b) => {
      const wa = a.kp_id && weakKp.has(a.kp_id) ? 0 : 1;
      const wb = b.kp_id && weakKp.has(b.kp_id) ? 0 : 1;
      return wa - wb;
    });

  const buckets: Record<1 | 2 | 3, UnitQuestion[]> = { 1: [], 2: [], 3: [] };
  for (const q of avail) buckets[diffOf(q)].push(q);
  ([1, 2, 3] as const).forEach((d) => (buckets[d] = weakFirst(buckets[d])));

  const picked: UnitQuestion[] = [];
  const used = new Set<string>();
  const usedPre = new Set<string>(); // 已用前言 key
  const take = (q: UnitQuestion) => {
    picked.push(q);
    used.add(q.id);
    usedPre.add(preambleKey(q));
  };
  // dedup=true:跳过"前言已用"的题(软去重);dedup=false:放宽,只看是否已选。
  const free = (q: UnitQuestion, dedup: boolean) =>
    !used.has(q.id) && (!dedup || !usedPre.has(preambleKey(q)));

  // ① 每 point 保底 1 道(弱kp优先);先软去重,取不到再放宽。
  for (const p of points) {
    if (picked.length >= n) break;
    let cand = weakFirst(avail.filter((q) => q.pointId === p.id && free(q, true)));
    if (!cand.length) cand = weakFirst(avail.filter((q) => q.pointId === p.id && free(q, false)));
    if (cand.length) take(cand[0]);
  }

  // ② 按难度配额补足(先扣掉保底已占用的难度);软去重。
  const want: Record<1 | 2 | 3, number> = { ...quota };
  for (const q of picked) want[diffOf(q)] = Math.max(0, want[diffOf(q)] - 1);
  for (const d of [1, 2, 3] as const) {
    for (const q of buckets[d]) {
      if (want[d] <= 0 || picked.length >= n) break;
      if (!free(q, true)) continue;
      take(q);
      want[d]--;
    }
  }

  // ③ 降级兜底凑满 n:先难→中→易+软去重补;仍不足再整体放宽(允许同前言),保证够 n。
  for (const dedup of [true, false] as const) {
    if (picked.length >= n) break;
    for (const d of [3, 2, 1] as const) {
      for (const q of buckets[d]) {
        if (picked.length >= n) break;
        if (!free(q, dedup)) continue;
        take(q);
      }
    }
  }

  return shuffleArray(picked).slice(0, n);
}

/** 语法 UnitQuestion → FinalQuizItem(选项 a-d、answer 字母→下标)。 */
function grammarItem(q: UnitQuestion): FinalQuizItem {
  const opts = [q.option_a, q.option_b, q.option_c, q.option_d].filter(
    (o): o is string => !!o,
  );
  const ans = ["A", "B", "C", "D"].indexOf((q.correct_answer || "A").trim().toUpperCase());
  return {
    kind: "grammar",
    q: q.stem,
    opts,
    answer: ans < 0 || ans >= opts.length ? 0 : ans,
    explanation: q.explanation || undefined,
    point: q.pointTitle,
    dim: "grammar",
    questionId: q.id,
    pointId: q.pointId,
    kpId: q.kp_id ?? null,
  };
}

/** 听力 3 题:内联单句题,题干提示 + audio 供 TTS 播放。 */
function listeningItems(unit: UnitDef): FinalQuizItem[] {
  return shuffleArray([...unit.listeningQuestions])
    .slice(0, LISTENING_N)
    .map((lq) => ({
      kind: "listening" as const,
      q: "🔊 听句子，选出与它相符的一项",
      opts: [...lq.opts],
      answer: lq.answer,
      audio: lq.audio,
      point: "听力",
      dim: "listening" as const,
    }));
}

/** 词汇 2 题:从本单元词表生成 英↔中 MCQ(交替方向),3 个同单元干扰项。 */
function vocabItems(unit: UnitDef): FinalQuizItem[] {
  const words = shuffleArray([...unit.vocabulary]).slice(0, VOCAB_N);
  return words.map((target, i) => {
    const distractors = shuffleArray(unit.vocabulary.filter((v) => v.en !== target.en)).slice(0, 3);
    const opts4 = shuffleArray([target, ...distractors]);
    const en2cn = i % 2 === 0;
    return {
      kind: "vocab" as const,
      q: en2cn ? `单词 “${target.en}” 的中文意思是？` : `“${target.cn}” 对应的英文单词是？`,
      opts: opts4.map((o) => (en2cn ? o.cn : o.en)),
      answer: opts4.findIndex((o) => o.en === target.en),
      point: "词汇",
      dim: "vocab" as const,
    };
  });
}

/** 选项洗牌 + answer 重映射(每题独立)。 */
function shuffleOpts(item: FinalQuizItem): FinalQuizItem {
  const order = shuffleArray(item.opts.map((_, i) => i));
  return {
    ...item,
    opts: order.map((i) => item.opts[i]),
    answer: order.indexOf(item.answer),
  };
}

/**
 * 组装本单元 finalQuiz(12 题)。语法池为空 → 返回 null(调用层回退内联)。
 */
export async function buildFinalQuiz(unit: UnitDef): Promise<FinalQuizItem[] | null> {
  const codes = [unit.grammarCode, ...(unit.grammarCodes ?? [])].filter(
    (c): c is string => !!c,
  );
  const points = await resolveUnitPoints(codes);
  if (!points.length) return null;
  const pool = await loadUnitPool(points);
  if (!pool.length) return null;

  // 本单元掌握度 → 难度档位。
  const allMastery = await loadJuniorGrammarMasteryAll();
  const pointIds = new Set(points.map((p) => p.id));
  const unitRows = allMastery.filter((r) => pointIds.has(r.item_id));
  const { mastered, total } = computeUnitMastery(points, unitRows);
  const quota = difficultyQuota(total ? mastered / total : 0);

  // 避错题:汇总本单元各 point 的 wrongQ。
  const wrongQ = new Set<string>();
  for (const r of unitRows) for (const qid of r.mastery_matrix?.wrongQ ?? []) wrongQ.add(qid);

  // 弱kp:池中出现的 kp 里、尚未达熟练(level≥3)的(含从未练过)。
  const kpRows = await loadKpMastery();
  const strongKp = new Set(
    kpRows.filter((r) => (r.mastery_level ?? 0) >= 3).map((r) => r.item_id),
  );
  const weakKp = new Set<string>();
  for (const q of pool) if (q.kp_id && !strongKp.has(q.kp_id)) weakKp.add(q.kp_id);

  const grammar = pickGrammar(pool, points, quota, weakKp, wrongQ, GRAMMAR_N).map(grammarItem);
  if (!grammar.length) return null;

  const items = [...grammar, ...listeningItems(unit), ...vocabItems(unit)].map(shuffleOpts);
  return shuffleArray(items);
}
