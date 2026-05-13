/**
 * 知识点掌握度管理 — 复用项目通用 SRS（src/lib/masteryFsrs.ts）
 * 写 gaokao_user_mastery (item_type='knowledge_point') + 必要时写错题本
 */
import { supabase } from "@/integrations/supabase/client";
import { nextSrsState } from "@/lib/masteryFsrs";

const ITEM_TYPE = "knowledge_point";

export type KpMasteryRow = {
  id?: string;
  user_id: string;
  item_type: string;
  item_id: string;
  correct_count: number;
  wrong_count: number;
  last_result?: string | null;
  last_seen_at?: string | null;
  next_review_at?: string | null;
  due_at?: string | null;
  mastery_level: number;
  lapses: number;
  difficulty: number;
  stability: number;
};

/** 提交一轮强化练习的结果，更新知识点掌握度并按需写错题本 */
export async function recordKnowledgePointResult(opts: {
  knowledgePointId: string;
  knowledgePointLabel: string;
  passed: boolean;          // 本轮 3 题是否全对
  finalRound: number;       // 当前是第几轮（1-3）
  isFinalRound: boolean;    // 是否已是最后一轮
  sourceQuestionId: string;
  sourceQuestionStem?: string;
  module?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: "no-auth" as const };
  const userId = user.id;
  const module = opts.module || "gaokao_reading_article";

  // 1) Read existing mastery row
  const { data: existing } = await supabase
    .from("gaokao_user_mastery")
    .select("*")
    .eq("user_id", userId)
    .eq("item_type", ITEM_TYPE)
    .eq("item_id", opts.knowledgePointId)
    .maybeSingle();

  // FSRS-lite (project-shared) — pass current ease/interval, get next state
  const ease0 = (existing?.difficulty as number | undefined) ?? 2.5;
  const intv0 = (existing?.stability as number | undefined) ?? 0;
  const next = nextSrsState({ ease: ease0, interval_days: intv0, due_at: "" }, opts.passed);

  const newCorrect = (existing?.correct_count ?? 0) + (opts.passed ? 1 : 0);
  const newWrong = (existing?.wrong_count ?? 0) + (opts.passed ? 0 : 1);
  const newLapses = (existing?.lapses ?? 0) + (opts.passed ? 0 : 1);
  // mastery_level: 全对一轮 +1（封顶 5），未通过且是最后一轮 -1（最低 0）
  const prevLevel = existing?.mastery_level ?? 0;
  let nextLevel = prevLevel;
  if (opts.passed) nextLevel = Math.min(5, prevLevel + 1);
  else if (opts.isFinalRound) nextLevel = Math.max(0, prevLevel - 1);

  const payload = {
    user_id: userId,
    item_type: ITEM_TYPE,
    item_id: opts.knowledgePointId,
    correct_count: newCorrect,
    wrong_count: newWrong,
    last_result: opts.passed ? "good" : "again",
    last_seen_at: new Date().toISOString(),
    next_review_at: next.due_at,
    due_at: next.due_at,
    mastery_level: nextLevel,
    lapses: newLapses,
    difficulty: next.ease,
    stability: next.interval_days,
    last_grade: opts.passed ? 3 : 1,
    updated_at: new Date().toISOString(),
  };

  if (existing?.id) {
    await supabase.from("gaokao_user_mastery").update(payload).eq("id", existing.id);
  } else {
    await supabase.from("gaokao_user_mastery").insert(payload);
  }

  // 2) 如果到最后一轮仍未掌握 → 错题本登记 + 把"知识点标签"也存进 snapshot
  if (!opts.passed && opts.isFinalRound) {
    await supabase.from("gaokao_user_mistakes").upsert(
      {
        user_id: userId,
        module,
        item_id: opts.sourceQuestionId,
        parent_label: opts.knowledgePointLabel,
        snapshot: {
          knowledge_point_id: opts.knowledgePointId,
          knowledge_point_label: opts.knowledgePointLabel,
          source_question_stem: opts.sourceQuestionStem ?? "",
          rounds_failed: opts.finalRound,
        },
        wrong_count: 1,
        last_wrong_at: new Date().toISOString(),
        next_review_at: next.due_at,
      } as any,
      { onConflict: "user_id,module,item_id" },
    );
  }

  return { ok: true as const, masteryLevel: nextLevel, dueAt: next.due_at };
}

/** 给学生中心用：拉取用户当前未彻底掌握的知识点（按 lapses+due 排序） */
export async function fetchWeakKnowledgePoints(userId: string, limit = 10) {
  const { data, error } = await supabase
    .from("gaokao_user_mastery")
    .select("id, item_id, mastery_level, lapses, due_at, last_seen_at, wrong_count, correct_count")
    .eq("user_id", userId)
    .eq("item_type", ITEM_TYPE)
    .lt("mastery_level", 4)
    .order("lapses", { ascending: false })
    .limit(limit);
  if (error || !data || data.length === 0) return [];
  const ids = data.map((r) => r.item_id);
  const { data: kps } = await supabase
    .from("gaokao_reading_knowledge_points")
    .select("id, level3, category_name, strategy")
    .in("id", ids);
  const byId = new Map((kps ?? []).map((k: any) => [k.id, k]));
  return data.map((row: any) => ({
    ...row,
    knowledge_point: byId.get(row.item_id) ?? null,
  }));
}