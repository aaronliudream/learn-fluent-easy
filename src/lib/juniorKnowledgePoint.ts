import { supabase } from "@/integrations/supabase/client";
import {
  KP_LEARNED_STREAK,
  type JuniorGrammarMastery,
} from "@/lib/juniorGrammarFsrs";
import type { GrammarQuestion } from "@/components/grammar/GrammarQuestionCard";

/**
 * 知识点(knowledge point)层掌握度 —— 单一数据源:
 *   - 目录:junior_knowledge_points(挂在考点 point 之下)
 *   - 状态:junior_user_mastery 的 item_type='grammar_kp' 行(mastery_level + mastery_matrix.streak)
 * 4 层(知识点/考点/Unit/详情页)全部从这两处算,口径一致,禁止各页各算。
 */

export type KpCatalogItem = {
  id: string;
  point_id: string;
  code: string;
  title: string;
  sort_order: number;
  target_count: number;
};

export type KpState = "未学" | "Learned" | "Mastered";

export type PerKp = { kp: KpCatalogItem; state: KpState; streak: number };

export { KP_LEARNED_STREAK };

/** 某考点下的知识点目录(按 sort_order)。 */
export async function loadKpCatalog(pointId: string): Promise<KpCatalogItem[]> {
  const { data } = await supabase
    .from("junior_knowledge_points")
    .select("id,point_id,code,title,sort_order,target_count")
    .eq("point_id", pointId)
    .order("sort_order");
  return (data ?? []) as KpCatalogItem[];
}

/** 多个考点下的知识点目录(Unit 聚合用)。 */
export async function loadKpCatalogForPoints(pointIds: string[]): Promise<KpCatalogItem[]> {
  if (!pointIds.length) return [];
  const { data } = await supabase
    .from("junior_knowledge_points")
    .select("id,point_id,code,title,sort_order,target_count")
    .in("point_id", pointIds)
    .order("sort_order");
  return (data ?? []) as KpCatalogItem[];
}

/** 当前用户的知识点掌握行(item_type='grammar_kp')。 */
export async function loadKpMastery(): Promise<JuniorGrammarMastery[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("junior_user_mastery")
    .select("*")
    .eq("user_id", user.id)
    .eq("item_type", "grammar_kp");
  return (data ?? []) as unknown as JuniorGrammarMastery[];
}

export function kpState(row?: JuniorGrammarMastery | null): KpState {
  const lvl = row?.mastery_level ?? 0;
  if (lvl >= 2) return "Mastered";
  if (lvl >= 1) return "Learned";
  return "未学";
}

export function kpStreak(row?: JuniorGrammarMastery | null): number {
  return row?.mastery_matrix?.streak ?? 0;
}

function aggregate(catalog: KpCatalogItem[], rows: JuniorGrammarMastery[]) {
  const byId = new Map(rows.map((r) => [r.item_id, r]));
  const perKp: PerKp[] = catalog.map((kp) => {
    const row = byId.get(kp.id) ?? null;
    return { kp, state: kpState(row), streak: kpStreak(row) };
  });
  const total = catalog.length;
  const mastered = perKp.filter((p) => p.state === "Mastered").length;
  const pct = total > 0 ? Math.round((mastered / total) * 100) : 0;
  return { mastered, total, pct, perKp };
}

/** 考点层掌握度:已 Mastered 知识点 / 该考点知识点总数。 */
export async function computePointKpMastery(
  pointId: string,
): Promise<{ mastered: number; total: number; pct: number; perKp: PerKp[] }> {
  const [catalog, rows] = await Promise.all([loadKpCatalog(pointId), loadKpMastery()]);
  return aggregate(catalog, rows);
}

/** Unit 层掌握度:该 Unit 所有考点的知识点聚合(本轮暂不接入 UI,口径备用)。 */
export async function computeUnitKpMastery(
  pointIds: string[],
): Promise<{ mastered: number; total: number; pct: number }> {
  const [catalog, rows] = await Promise.all([
    loadKpCatalogForPoints(pointIds),
    loadKpMastery(),
  ]);
  const { mastered, total, pct } = aggregate(catalog, rows);
  return { mastered, total, pct };
}

/** 单个知识点元信息(知识点练习页用)。 */
export async function loadKp(kpId: string): Promise<KpCatalogItem | null> {
  const { data } = await supabase
    .from("junior_knowledge_points")
    .select("id,point_id,code,title,sort_order,target_count")
    .eq("id", kpId)
    .maybeSingle();
  return (data as KpCatalogItem) ?? null;
}

const KP_Q_SELECT =
  "id,stem,option_a,option_b,option_c,option_d,correct_answer,accepted_answers,explanation,question_type,distractors,natural_note,grammar_topic,use_ai_grading,difficulty,sort_order";

/** 该知识点的 MCQ 题池(只取 question_type='mcq')。 */
export async function loadKpMcqPool(kpId: string): Promise<GrammarQuestion[]> {
  const { data } = await supabase
    .from("junior_grammar_questions")
    .select(KP_Q_SELECT)
    .eq("kp_id", kpId)
    .eq("question_type", "mcq")
    .order("sort_order");
  return (data ?? []) as unknown as GrammarQuestion[];
}

/** 当前用户某知识点的连对数(初始化练习页本地计数用)。 */
export function streakFromRows(kpId: string, rows: JuniorGrammarMastery[]): number {
  const row = rows.find((r) => r.item_id === kpId);
  return kpStreak(row);
}
