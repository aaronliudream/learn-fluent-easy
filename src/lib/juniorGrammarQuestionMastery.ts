import { supabase } from "@/integrations/supabase/client";

/**
 * 语法「按题」掌握度 —— 方案B。
 * 复用 junior_user_mastery 表,新增一种行:item_type='grammar_question'、item_id=question_id。
 * 口径(与 Aaron 拍板一致):同一道题**累计**答对 2 次 → 该题已掌握(非连对)。
 * 完成度 = 做过的题(correct+wrong≥1)/ 总题;掌握度 = 掌握的题(correct≥2)/ 总题。
 * 第4关综合测试 与 语法页 L3 都调 recordGrammarQuestionMastery → 同表同口径,自动同步。
 */

const ITEM_TYPE = "grammar_question";
export const Q_MASTER_AT = 2; // 累计答对 2 次算掌握该题

export type QMasteryRow = { item_id: string; correct_count: number; wrong_count: number };

/** 批量读当前用户在这些题上的累计对错(未登录/空 → 空 Map)。 */
export async function loadGrammarQuestionMastery(
  questionIds: string[],
): Promise<Map<string, QMasteryRow>> {
  const out = new Map<string, QMasteryRow>();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !questionIds.length) return out;
  for (let i = 0; i < questionIds.length; i += 200) {
    const slice = questionIds.slice(i, i + 200);
    const { data } = await supabase
      .from("junior_user_mastery")
      .select("item_id,correct_count,wrong_count")
      .eq("user_id", user.id)
      .eq("item_type", ITEM_TYPE)
      .in("item_id", slice);
    for (const r of (data ?? []) as QMasteryRow[]) out.set(r.item_id, r);
  }
  return out;
}

/** 记一次作答:累计 correct/wrong;correct≥2 → mastery_level=4(掌握),否则做过=1。 */
export async function recordGrammarQuestionMastery(
  questionId: string,
  isCorrect: boolean,
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const { data: prev } = await supabase
    .from("junior_user_mastery")
    .select("id,correct_count,wrong_count")
    .eq("user_id", user.id)
    .eq("item_type", ITEM_TYPE)
    .eq("item_id", questionId)
    .maybeSingle();
  const correct = ((prev?.correct_count as number) ?? 0) + (isCorrect ? 1 : 0);
  const wrong = ((prev?.wrong_count as number) ?? 0) + (isCorrect ? 0 : 1);
  const level = correct >= Q_MASTER_AT ? 4 : correct + wrong > 0 ? 1 : 0;
  const payload = {
    correct_count: correct,
    wrong_count: wrong,
    mastery_level: level,
    last_seen_at: new Date().toISOString(),
    last_result: isCorrect ? "correct" : "wrong",
  };
  if (prev?.id) {
    await supabase.from("junior_user_mastery").update(payload).eq("id", prev.id as string);
  } else {
    await supabase
      .from("junior_user_mastery")
      .insert({ user_id: user.id, item_type: ITEM_TYPE, item_id: questionId, ...payload });
  }
}

export type GrammarProgress = { done: number; mastered: number; total: number };

/** 在给定题集上算完成/掌握。 */
export function computeGrammarProgress(
  questionIds: string[],
  map: Map<string, QMasteryRow>,
): GrammarProgress {
  let done = 0;
  let mastered = 0;
  for (const id of questionIds) {
    const r = map.get(id);
    if (!r) continue;
    if (r.correct_count + r.wrong_count > 0) done++;
    if (r.correct_count >= Q_MASTER_AT) mastered++;
  }
  return { done, mastered, total: questionIds.length };
}

export const gpct = (n: number, d: number) => (d > 0 ? Math.round((n / d) * 100) : 0);
