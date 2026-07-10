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
import { supabase } from "@/integrations/supabase/client";
import type { UnitDef } from "./juniorHub/types";
import type { QuizQuestion } from "./juniorHub/types";

/**
 * 单元综合通关速测(路A):12 题纯单选 = 语法5 + 听力3 + 阅读1 + 词汇3,半自适应。
 * 语法不超半数 → 真"综合检测"而非语法刷屏。
 *
 * - 语法:复用 juniorUnitGrammar(grammarCode→point→junior_grammar_questions),
 *   ⚠️ 只收应用型题(isApplicationGrammar:读真句判结构 / 英文用法选项),排除术语定义题
 *   ("X 中的 Y 表示什么""…叫什么""…由什么充当");
 *   按本单元掌握度选难度配额,弱kp倾斜,避错题,每 point 保底 1 道。
 * - 听力:内联 listeningQuestions(单句 TTS,4 选项)洗牌取 3。
 * - 阅读:junior_reading 本单元最短一篇,短文嵌题干 + 首题(无则用词汇补足题量)。
 * - 词汇:unit.vocabulary 内联生成 英↔中 MCQ 取 3(阅读缺位时补到 4)。
 * - 每题选项洗牌 + answer 重映射(消除"点A白嫖"),题序整体洗牌。
 * - ⚠️ 语法池为空(无 grammarCode / 无 DB 题)→ 返回 null,调用层回退内联 quizQuestions。
 *
 * 「精确排除已做题」未做(答对题不记 question_id);现靠大题池随机 + 避错题降重复。
 * 留作第二步:finalQuiz 写 question_id 进 ai_question_attempts + 抽题读它排除。
 */

export type FinalQuizKind = "grammar" | "listening" | "vocab" | "reading";

/** 喂 FinalQuizStage 的统一题项:QuizQuestion + finalQuiz 专用可选字段。
 *  kind 设为可选,使内联 quizQuestions(QuizQuestion[])回退时仍可赋值给本类型。 */
export type FinalQuizItem = QuizQuestion & {
  kind?: FinalQuizKind;
  explanation?: string;
  audioUrl?: string | null; // 听力题:junior_listening_items.audio_url(真 MP3,做题/专区实际播放的来源)

  questionId?: string; // 语法题:junior_grammar_questions.id(记录用)
  pointId?: string; // 语法题归属 point(记录用)
  kpId?: string | null; // 语法题归属 kp(记录用)
  exampleEn?: string; // 词汇题:答对后展示的例句(英)
  exampleCn?: string; // 词汇题:例句(中)
  meaningFull?: string; // 词汇题:完整多义(展示用,做题选项仍用单义)
};

/** 词汇展示元数据:word(小写) → 完整多义 + 例句(供单元通关答题后"学到一个词")。 */
type VocabMeta = { meaningFull?: string; exampleEn?: string; exampleCn?: string };
async function loadUnitVocabMeta(
  unit: UnitDef,
  grade: number,
  publisher?: string | null,
): Promise<Map<string, VocabMeta>> {
  const map = new Map<string, VocabMeta>();
  let vq = supabase
    .from("junior_vocab")
    .select("word,meaning_cn,example_en,example_cn")
    .eq("grade", grade)
    .eq("volume", unit.book)
    .eq("unit", unit.unitKey);
  if (publisher) vq = vq.eq("publisher", publisher);
  const { data } = await vq;
  for (const r of (data ?? []) as Array<Record<string, string | null>>) {
    if (!r.word) continue;
    map.set(String(r.word).trim().toLowerCase(), {
      meaningFull: r.meaning_cn?.trim() || undefined, // DB meaning_cn 即完整多义("外向的;爱交际的")
      exampleEn: r.example_en?.trim() || undefined,
      exampleCn: r.example_cn?.trim() || undefined,
    });
  }
  return map;
}

// 单元通关 12 题综合配比:语法 5(应用型,排除术语定义题)+ 听力 3 + 阅读 1 + 词汇 3。
// 语法不超过一半(≤6),其余题型占多数 → 真"综合检测"而非语法刷屏。
const GRAMMAR_N = 5;
const LISTENING_N = 3;
const READING_N = 2; // 单元通关阅读=finalReading 短文配2题(覆盖不同位置)
const VOCAB_N = 2;

/** 难度三档配额(语法 5 题):跟本单元掌握度走。 */
function difficultyQuota(pct: number): Record<1 | 2 | 3, number> {
  if (pct > 0.8) return { 1: 1, 2: 2, 3: 2 }; // 高:偏难
  if (pct >= 0.5) return { 1: 2, 2: 2, 3: 1 }; // 中:均衡
  return { 1: 3, 2: 1, 3: 1 }; // 低:偏易
}

/**
 * 应用型语法题判定(单元通关只收应用型,排除"术语定义题")。
 * 保留:① 选项是英文用法项(初中填空 / "下列哪一句…"选英文句);
 *       ② 判断整句结构(stem 含引号英文整句 + 结构标签选项 + "判断/哪一句")。
 * 排除:纯中文概念题("X 中的 Y 表示什么""…由什么充当""…叫什么""…常构成哪种结构"),
 *       及"句子'…'中,us 是?"这类成分标注题(答案是术语,非读句用句)。
 */
function isApplicationGrammar(q: UnitQuestion): boolean {
  const stem = String(q.stem || "");
  const opts = [q.option_a, q.option_b, q.option_c, q.option_d]
    .filter((o): o is string => !!o)
    .map(String);
  const STRUCT = /主谓|主系表|There be|SVO|SVA|SVOC/;
  const structLabel = opts.filter((o) => STRUCT.test(o)).length;
  const engOpts = opts.filter((o) => /[A-Za-z]{2,}/.test(o)).length;
  // ① 多数选项是英文用法项(非结构标签)→ 应用型(读/用英文)。
  if (engOpts >= 3 && structLabel < 2) return true;
  // ② 判断整句结构:结构标签选项 + "判断句子结构/下列哪一句"框架(读真实句子选结构)。
  //    用框架词而非引号正则(撇号 There's/don't 会断引号匹配,误杀合法判断题)。
  if (structLabel >= 2 && /判断句子结构|下列哪一?句|哪一?句(是|不是)/.test(stem)) return true;
  return false;
}

/** 答案归一化为下标:兼容字母(A-D)/数字下标/答案文本。 */
function answerToIndex(raw: unknown, opts: string[]): number {
  if (typeof raw === "number") return raw >= 0 && raw < opts.length ? raw : 0;
  const s = String(raw ?? "").trim();
  const letter = "ABCD".indexOf(s.toUpperCase());
  if (letter >= 0 && letter < opts.length) return letter;
  const byText = opts.findIndex((o) => String(o).trim() === s);
  return byText >= 0 ? byText : 0;
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

/** 听力 3 题(内联回退):单句题,题干提示 + audio 供 TTS 播放。 */
function inlineListening(unit: UnitDef): FinalQuizItem[] {
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

const LETTER_TO_IDX: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };

type ListeningRow = {
  difficulty: number;
  kind: string;
  audio_text: string;
  audio_url: string | null;
  question: string;
  options: unknown;
  answer: string;
  explanation: string | null;
};

/** DB 行 → FinalQuizItem(answer 字母→下标;options jsonb→数组)。 */
function dbListeningItem(r: ListeningRow): FinalQuizItem {
  const opts = Array.isArray(r.options) ? (r.options as string[]) : [];
  const idx = LETTER_TO_IDX[String(r.answer).trim().toUpperCase()] ?? 0;
  return {
    kind: "listening",
    q: r.question,
    opts,
    answer: idx >= 0 && idx < opts.length ? idx : 0,
    audio: r.audio_text,
    audioUrl: r.audio_url, // 真 MP3 一并带上(专区/做题播放用它;错题本据此放原声)
    explanation: r.explanation || undefined,
    point: "听力",
    dim: "listening",
  };
}

/**
 * 从 junior_listening_items 抽 3 题:难度 1/2/3 各 1(易中难搭配);某档缺则从其余补。
 * 返回少于 LISTENING_N 时(题库不足)由调用层回退内联。
 */
async function loadListeningItems(grade: number, volume: string, unit: string): Promise<FinalQuizItem[]> {
  const { data } = await supabase
    .from("junior_listening_items")
    .select("difficulty,kind,audio_text,audio_url,question,options,answer,explanation")
    .eq("grade", grade)
    .eq("volume", volume)
    .eq("unit", unit);
  const rows = (data ?? []) as ListeningRow[];
  if (!rows.length) return [];
  const byD: Record<number, ListeningRow[]> = { 1: [], 2: [], 3: [] };
  for (const r of rows) (byD[r.difficulty] ?? (byD[r.difficulty] = [])).push(r);
  const picked: ListeningRow[] = [];
  const used = new Set<ListeningRow>();
  // ① 易中难各取 1
  for (const d of [1, 2, 3]) {
    const arr = shuffleArray(byD[d] ?? []);
    if (arr.length) {
      picked.push(arr[0]);
      used.add(arr[0]);
    }
  }
  // ② 不足 3 → 从剩余补足
  if (picked.length < LISTENING_N) {
    for (const r of shuffleArray(rows)) {
      if (picked.length >= LISTENING_N) break;
      if (!used.has(r)) {
        picked.push(r);
        used.add(r);
      }
    }
  }
  return shuffleArray(picked).slice(0, LISTENING_N).map(dbListeningItem);
}

/**
 * 听力 3 题来源:7B + 八年级(8A/8B)从 junior_listening_items 抽(难度 1/2/3 各 1·自适应);
 * 题库未覆盖/不足 3 题的单元(如 8 年级尚未灌库的 15 单元)回退内联 6 条,保证够 3 题、不报错不白屏。
 */
async function listeningItemsForUnit(unit: UnitDef): Promise<FinalQuizItem[]> {
  if (["7B", "8A", "8B"].includes(unit.book)) {
    const grade = parseInt(unit.book, 10) || 7; // '7B'→7,'8A'/'8B'→8
    const fromDb = await loadListeningItems(grade, unit.book, unit.unitKey);
    if (fromDb.length >= LISTENING_N) return fromDb;
  }
  return inlineListening(unit);
}

/** 词汇题:从本单元词表生成 英↔中 MCQ(交替方向),3 个同单元干扰项。count 默认 VOCAB_N。 */
function vocabItems(
  unit: UnitDef,
  count: number = VOCAB_N,
  meta?: Map<string, VocabMeta>,
): FinalQuizItem[] {
  // 运行时护栏:剔除空 en/cn 的词条(否则会生成"空选项/无正确答案"的畸形题,如 teenager cn 为空)。
  const pool = unit.vocabulary.filter((v) => v.en?.trim() && v.cn?.trim());
  const words = shuffleArray([...pool]).slice(0, count);
  return words.map((target, i) => {
    const distractors = shuffleArray(pool.filter((v) => v.en !== target.en)).slice(0, 3);
    const opts4 = shuffleArray([target, ...distractors]);
    const en2cn = i % 2 === 0;
    const m = meta?.get(target.en.trim().toLowerCase());
    return {
      kind: "vocab" as const,
      q: en2cn ? `单词 “${target.en}” 的中文意思是？` : `“${target.cn}” 对应的英文单词是？`,
      opts: opts4.map((o) => (en2cn ? o.cn : o.en)),
      answer: opts4.findIndex((o) => o.en === target.en),
      point: "词汇",
      dim: "vocab" as const,
      // 答对/答错后展示:完整多义(优先 DB,缺则用单义)+ 例句 → "学到一个词的用法"。
      meaningFull: m?.meaningFull || target.cn,
      exampleEn: m?.exampleEn,
      exampleCn: m?.exampleCn,
    };
  });
}

type ReadingRow = {
  title: string | null;
  body: string | null;
  questions: unknown;
  word_count: number | null;
};

/**
 * 阅读 n 题:从 junior_reading 取本单元最短的一篇,短文嵌进题干(stage 用 whitespace-pre-line 渲染),
 * 取该篇首题作单选。全年级通用(grade+volume+unit);无行/无题 → 返回空(调用层用词汇补足题量)。
 */
function readingItemFrom(passage: string, q: Record<string, unknown>): FinalQuizItem | null {
  const opts = Array.isArray(q.options) ? (q.options as unknown[]).map(String) : [];
  const stem = String(q.q ?? "").trim();
  if (opts.length < 2 || !stem) return null;
  return {
    kind: "reading",
    q: `阅读短文，回答问题：\n\n${passage}\n\n${stem}`,
    opts,
    answer: answerToIndex(q.answer, opts),
    explanation: (q.explanation as string) || undefined,
    point: "阅读",
    dim: "reading",
  };
}

async function readingItemsForUnit(
  unit: UnitDef,
  grade: number,
  n: number,
  publisher?: string | null,
): Promise<FinalQuizItem[]> {
  if (n <= 0) return [];
  // 优先:内联 finalReading(短文2-3句 + 转述题,不撞阅读关 → 推荐方案)。
  const fr = unit.finalReading;
  if (fr?.passage && Array.isArray(fr.questions) && fr.questions.length) {
    const passage = String(fr.passage).trim();
    return fr.questions
      .slice(0, n)
      .map((q) => readingItemFrom(passage, q as unknown as Record<string, unknown>))
      .filter((it): it is FinalQuizItem => !!it);
  }
  // 回退(无 finalReading 的旧单元):junior_reading 最短一篇,取前 n 题。
  let rq = supabase
    .from("junior_reading")
    .select("title,body,questions,word_count")
    .eq("grade", grade)
    .eq("volume", unit.book)
    .eq("unit", unit.unitKey);
  if (publisher) rq = rq.eq("publisher", publisher);
  const { data } = await rq.order("word_count", { ascending: true });
  const rows = (data ?? []) as ReadingRow[];
  for (const row of rows) {
    const passage = String(row.body || "").trim();
    const qs = Array.isArray(row.questions) ? (row.questions as Array<Record<string, unknown>>) : [];
    if (!passage || !qs.length) continue;
    const out = qs.slice(0, n).map((q) => readingItemFrom(passage, q)).filter((it): it is FinalQuizItem => !!it);
    if (out.length) return out; // 用同一篇的前 n 题(覆盖多于只 q0)
  }
  return [];
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
 * 组装本单元 finalQuiz(12 题综合):语法 5(应用型,排除术语定义题)+ 听力 3 + 阅读 1 + 词汇 3。
 * 语法不超半数;阅读取自 junior_reading(无则用词汇补足题量)。语法池为空 → 返回 null(调用层回退内联)。
 */
export async function buildFinalQuiz(unit: UnitDef, grade: number, publisher?: string | null): Promise<FinalQuizItem[] | null> {
  const codes = [unit.grammarCode, ...(unit.grammarCodes ?? [])].filter(
    (c): c is string => !!c,
  );
  const points = await resolveUnitPoints(codes, publisher ?? undefined);
  if (!points.length) return null;
  const pool = await loadUnitPool(points);
  if (!pool.length) return null;
  // 单元通关只收应用型语法题(排除术语定义题);过滤后不足 GRAMMAR_N 才放回全池兜底。
  const appPool = pool.filter(isApplicationGrammar);
  const grammarPool = appPool.length >= GRAMMAR_N ? appPool : pool;

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

  const grammar = pickGrammar(grammarPool, points, quota, weakKp, wrongQ, GRAMMAR_N).map(grammarItem);
  if (!grammar.length) return null;

  const listening = await listeningItemsForUnit(unit); // listening_items 全初中,不分流(维持现状)
  const reading = await readingItemsForUnit(unit, grade, READING_N, publisher);
  const vocabMeta = await loadUnitVocabMeta(unit, grade, publisher); // 词汇例句/多义(答对后展示)
  // 阅读缺几道,用词汇补几道,保持 12 题总量。
  const vocab = vocabItems(unit, VOCAB_N + (READING_N - reading.length), vocabMeta);
  const items = [...grammar, ...listening, ...reading, ...vocab].map(shuffleOpts);
  // 运行时兜底护栏(补静态QC看不到的动态盲区):丢弃任何畸形题——空选项/选项<2/答案越界。
  const valid = items.filter(
    (it) =>
      Array.isArray(it.opts) &&
      it.opts.length >= 2 &&
      it.opts.every((o) => o != null && String(o).trim() !== "") &&
      it.answer >= 0 &&
      it.answer < it.opts.length,
  );
  if (valid.length < items.length) console.warn(`[finalQuiz] 丢弃 ${items.length - valid.length} 道畸形题(空选项/答案越界)`);
  return shuffleArray(valid);
}
