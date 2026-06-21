import { supabase } from "@/integrations/supabase/client";
import type { GrammarQuestion } from "@/components/grammar/GrammarQuestionCard";
import {
  loadGrammarQuestionMastery,
  computeGrammarProgress,
  type GrammarProgress,
} from "@/lib/juniorGrammarQuestionMastery";

/**
 * 语法「按单元」组织 —— 方案B。
 * 单元归属存在 junior_grammar_points.volume / unit(只有新单元题有值,旧 4746 题 unit=NULL → 单元视图自动隐藏)。
 * 供语法页三层(单元列表 → 单元内语法点 → 点测试)使用。
 */

export type GPoint = {
  id: string;
  code: string;
  title: string;
  volume: string;
  unit: string;
  sort_order: number;
  questionIds: string[];
};
export type GUnit = {
  volume: string;
  unit: string;
  label: string;
  points: GPoint[];
  questionIds: string[];
};

const UNIT_ORDER = ["SU1", "SU2", "SU3", "U1", "U2", "U3", "U4", "U5", "U6", "U7", "U8", "U9", "U10", "U11", "U12"];
const VOL_ORDER = ["7A", "7B", "8A", "8B", "9A", "9B"];

/** 取所有带 unit 归属的语法点(按课本序),并附每个点的题 id 列表。 */
export async function loadUnitGrammar(): Promise<GUnit[]> {
  const { data: pData } = await supabase
    .from("junior_grammar_points")
    .select("id,code,title,volume,unit,sort_order")
    .not("unit", "is", null)
    .order("sort_order");
  const points = (pData ?? []) as Omit<GPoint, "questionIds">[];
  if (!points.length) return [];

  const ids = points.map((p) => p.id);
  const qByPoint = new Map<string, string[]>();
  for (let i = 0; i < ids.length; i += 100) {
    const slice = ids.slice(i, i + 100);
    const { data: qData } = await supabase
      .from("junior_grammar_questions")
      .select("id,point_id")
      .in("point_id", slice);
    for (const q of (qData ?? []) as { id: string; point_id: string }[]) {
      const arr = qByPoint.get(q.point_id) ?? [];
      arr.push(q.id);
      qByPoint.set(q.point_id, arr);
    }
  }

  const uMap = new Map<string, GUnit>();
  for (const p of points) {
    const key = `${p.volume}|${p.unit}`;
    let u = uMap.get(key);
    if (!u) {
      u = { volume: p.volume, unit: p.unit, label: `${p.volume} ${p.unit}`, points: [], questionIds: [] };
      uMap.set(key, u);
    }
    const qids = qByPoint.get(p.id) ?? [];
    u.points.push({ ...p, questionIds: qids });
    u.questionIds.push(...qids);
  }
  const units = [...uMap.values()];
  units.sort(
    (a, b) =>
      VOL_ORDER.indexOf(a.volume) - VOL_ORDER.indexOf(b.volume) ||
      UNIT_ORDER.indexOf(a.unit) - UNIT_ORDER.indexOf(b.unit),
  );
  for (const u of units) u.points.sort((a, b) => a.sort_order - b.sort_order);
  return units;
}

export type GPointMeta = { id: string; code: string; title: string; volume: string; unit: string };

export async function loadPoint(pointId: string): Promise<GPointMeta | null> {
  const { data } = await supabase
    .from("junior_grammar_points")
    .select("id,code,title,volume,unit")
    .eq("id", pointId)
    .maybeSingle();
  return (data as GPointMeta) ?? null;
}

/**
 * 按 grammarCodes(单元挂的语法点 code)算完成/掌握度 —— 与语法页 L2 同一套口径
 * (取这些点的全部题 id → loadGrammarQuestionMastery → computeGrammarProgress),
 * 保证 hub 第4关 与 语法专项页 同一单元数字一致。
 */
export async function loadProgressForCodes(codes: string[]): Promise<GrammarProgress> {
  if (!codes || !codes.length) return { done: 0, mastered: 0, total: 0 };
  const { data: pts } = await supabase.from("junior_grammar_points").select("id").in("code", codes);
  const pointIds = ((pts ?? []) as { id: string }[]).map((p) => p.id);
  if (!pointIds.length) return { done: 0, mastered: 0, total: 0 };
  const qids: string[] = [];
  for (let i = 0; i < pointIds.length; i += 100) {
    const slice = pointIds.slice(i, i + 100);
    const { data } = await supabase.from("junior_grammar_questions").select("id").in("point_id", slice);
    for (const q of (data ?? []) as { id: string }[]) qids.push(q.id);
  }
  const mastery = await loadGrammarQuestionMastery(qids);
  return computeGrammarProgress(qids, mastery);
}

const Q_SELECT =
  "id,stem,option_a,option_b,option_c,option_d,correct_answer,accepted_answers,explanation,question_type,distractors,natural_note,grammar_topic,use_ai_grading,difficulty,sort_order,kp_id";

/** 取某语法点的全部干净 mcq 题(按 sort_order)。 */
export async function loadPointQuestions(pointId: string): Promise<GrammarQuestion[]> {
  const { data } = await supabase
    .from("junior_grammar_questions")
    .select(Q_SELECT)
    .eq("point_id", pointId)
    .order("sort_order");
  const optClean = (o: unknown) =>
    o != null && String(o).trim() !== "" && String(o).trim().toLowerCase() !== "nan";
  return ((data ?? []) as unknown[])
    .filter((row) => {
      const q = row as Record<string, unknown>;
      return (
        ((q.question_type as string) || "mcq") === "mcq" &&
        [q.option_a, q.option_b, q.option_c, q.option_d].every(optClean)
      );
    })
    .map((row) => row as GrammarQuestion);
}
