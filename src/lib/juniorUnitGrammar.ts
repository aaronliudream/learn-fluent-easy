import { supabase } from "@/integrations/supabase/client";
import type { GrammarQuestion } from "@/components/grammar/GrammarQuestionCard";
import type { JuniorGrammarMastery } from "@/lib/juniorGrammarFsrs";

/**
 * Junior「单元语法综合测试」支撑库。
 *
 * 把一个单元的多个语法点(grammarCodes)的 MCQ 题合成一个池子,随机抽题做混合测,
 * 做完按「每题归属的 point」回算 Unit 掌握度。
 *
 * 复用 junior_grammar_points / junior_grammar_questions / junior_user_mastery —— 与
 * 单点 mastery 页(JuniorGrammarMastery.tsx)完全同源,故答题写库自动和语法专区/错题复习同步。
 */

export type UnitPoint = { id: string; code: string; title: string };

/** 合并池里的题:在 GrammarQuestion 基础上带上它真正归属的 point 标签。 */
export type UnitQuestion = GrammarQuestion & { pointId: string; pointTitle: string };

const Q_SELECT =
  "id,stem,option_a,option_b,option_c,option_d,correct_answer,accepted_answers,explanation,question_type,distractors,natural_note,grammar_topic,use_ai_grading,difficulty,sort_order";

/** Fisher–Yates 洗牌(不改原数组)。 */
function shuffle<T>(arr: T[]): T[] {
  const r = [...arr];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

/** code[] → point[](id/code/title)。保留传入顺序,DB 里查不到的 code 自动丢弃。 */
export async function resolveUnitPoints(codes: string[]): Promise<UnitPoint[]> {
  if (!codes.length) return [];
  const { data } = await supabase
    .from("junior_grammar_points")
    .select("id,code,title")
    .in("code", codes);
  const byCode = new Map(((data ?? []) as UnitPoint[]).map((p) => [p.code, p]));
  return codes.map((c) => byCode.get(c)).filter((p): p is UnitPoint => !!p);
}

/** 取单个 point 的 MCQ 题(先精选区 9000-9199,空则回退完整题库),并打上 point 标签。 */
async function loadPointMcq(point: UnitPoint): Promise<UnitQuestion[]> {
  const tag = (rows: unknown[]) =>
    (rows as GrammarQuestion[])
      .filter((q) => (q.question_type || "mcq") === "mcq")
      .map((q) => ({ ...q, pointId: point.id, pointTitle: point.title }));

  const curated = await supabase
    .from("junior_grammar_questions")
    .select(Q_SELECT)
    .eq("point_id", point.id)
    .gte("sort_order", 9000)
    .lte("sort_order", 9199);
  let rows = (curated.data ?? []) as unknown[];
  if (rows.length === 0) {
    const full = await supabase
      .from("junior_grammar_questions")
      .select(Q_SELECT)
      .eq("point_id", point.id);
    rows = (full.data ?? []) as unknown[];
  }
  return tag(rows);
}

/** 合并所有 point 的 MCQ 池(并行取)。 */
export async function loadUnitPool(points: UnitPoint[]): Promise<UnitQuestion[]> {
  const pools = await Promise.all(points.map((p) => loadPointMcq(p)));
  return pools.flat();
}

/**
 * 从合并池抽题:每个 point 保底 1 道(保证全覆盖),再从剩余池随机补到 n 道,最后整体洗牌。
 * 池子不足 n 时返回实际数量,不重复出题。
 */
export function pickQuestions(pool: UnitQuestion[], points: UnitPoint[], n = 8): UnitQuestion[] {
  const byPoint = new Map<string, UnitQuestion[]>();
  for (const q of pool) {
    const list = byPoint.get(q.pointId);
    if (list) list.push(q);
    else byPoint.set(q.pointId, [q]);
  }
  const picked: UnitQuestion[] = [];
  const usedIds = new Set<string>();
  // ① 每点保底 1 道(按 points 顺序)
  for (const p of points) {
    const qs = shuffle(byPoint.get(p.id) ?? []);
    if (qs.length) {
      picked.push(qs[0]);
      usedIds.add(qs[0].id);
    }
  }
  // ② 剩余名额从全池随机补足
  const rest = shuffle(pool.filter((q) => !usedIds.has(q.id)));
  for (const q of rest) {
    if (picked.length >= n) break;
    picked.push(q);
    usedIds.add(q.id);
  }
  return shuffle(picked).slice(0, n);
}

/**
 * Unit 长期掌握度:读这些 point 的 junior_user_mastery.mastery_level,
 * level >= threshold 记为「已掌握」。默认阈值 3(熟练)。
 */
export function computeUnitMastery(
  points: UnitPoint[],
  rows: JuniorGrammarMastery[],
  threshold = 3,
): { mastered: number; total: number; unmasteredTitles: string[] } {
  const levelById = new Map(rows.map((r) => [r.item_id, r.mastery_level ?? 0]));
  let mastered = 0;
  const unmasteredTitles: string[] = [];
  for (const p of points) {
    const lvl = levelById.get(p.id) ?? 0;
    if (lvl >= threshold) mastered++;
    else unmasteredTitles.push(p.title);
  }
  return { mastered, total: points.length, unmasteredTitles };
}
