/**
 * 课堂同步掌握度 — 统计「教材配套」五模块 + 阶段测试，按 DB 年级 7/8/9 汇总。
 *
 * ## 掌握（计入分子）的定义
 * 每个可练条目算 1 个单位；满足下列条件之一即视为「已掌握」：
 *
 * | 模块 | 数据源 | 掌握条件 |
 * |------|--------|----------|
 * | 词汇 | junior_vocab + junior_word_mastery | mastery_level ≥ 3（熟练，FSRS 稳定回忆） |
 * | 语法 | junior_grammar_points + junior_user_mastery | grammar_point 且 mastery_level ≥ 3 |
 * | 阅读 | junior_reading + mastery_progress | stars ≥ 5，或 best_pct ≥ 80 |
 * | 听力 | junior_listening_exercises + attempts | 该题正确率 ≥ 80% |
 * | 写作 | junior_writing_prompts + attempts | 该题最高 overall_score ≥ 80 |
 * | 阶段测试 | stage_tests + stage_test_attempts | 至少一次 passed = true |
 *
 * ## 汇总方式
 * - 选「全部」：初一+初二+初三所有条目合并 → mastered / total（加权，非三档平均）
 * - 选具体年级：只统计该 grade 的条目
 */

import { supabase } from "@/integrations/supabase/client";
import type { JuniorGradeKey } from "@/components/junior/JuniorGradeFilter";
import { PASS_PCT } from "@/lib/masteryProgress";

/** FSRS 等级 ≥ 3 = 熟练（词汇 / 语法） */
export const CLASSROOM_MASTERED_LEVEL = 3;

const DB_GRADE_BY_KEY: Record<Exclude<JuniorGradeKey, "all">, number> = {
  g7: 7,
  g8: 8,
  g9: 9,
};

const STAGE_GRADE_BY_DB: Record<number, number> = { 7: 1, 8: 2, 9: 3 };

export type ClassroomSyncBreakdown = {
  vocab: { mastered: number; total: number };
  grammar: { mastered: number; total: number };
  reading: { mastered: number; total: number };
  listening: { mastered: number; total: number };
  writing: { mastered: number; total: number };
  stageTests: { mastered: number; total: number };
};

export type ClassroomSyncProgress = {
  mastered: number;
  total: number;
  percent: number;
  breakdown: ClassroomSyncBreakdown;
};

export function dbGradesForFilter(key: JuniorGradeKey): number[] {
  if (key === "all") return [7, 8, 9];
  return [DB_GRADE_BY_KEY[key]];
}

function sumBreakdown(b: ClassroomSyncBreakdown): { mastered: number; total: number } {
  const parts = [b.vocab, b.grammar, b.reading, b.listening, b.writing, b.stageTests];
  return {
    mastered: parts.reduce((a, p) => a + p.mastered, 0),
    total: parts.reduce((a, p) => a + p.total, 0),
  };
}

function pct(mastered: number, total: number): number {
  return total > 0 ? Math.round((mastered / total) * 100) : 0;
}

async function countRows(
  table: "junior_vocab" | "junior_grammar_points" | "junior_reading" | "junior_listening_exercises" | "junior_writing_prompts",
  dbGrades: number[],
): Promise<number> {
  const { count, error } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true })
    .in("grade", dbGrades);
  if (error) return 0;
  return count ?? 0;
}

async function countStageTests(dbGrades: number[]): Promise<number> {
  const stageGrades = dbGrades.map((g) => STAGE_GRADE_BY_DB[g]);
  const { count, error } = await supabase
    .from("stage_tests")
    .select("id", { count: "exact", head: true })
    .eq("segment", "junior")
    .in("grade", stageGrades);
  if (error) return 0;
  return count ?? 0;
}

async function countVocabMastered(userId: string, dbGrades: number[]): Promise<number> {
  const { count, error } = await supabase
    .from("junior_word_mastery")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .in("grade", dbGrades)
    .gte("mastery_level", CLASSROOM_MASTERED_LEVEL);
  if (error) return 0;
  return count ?? 0;
}

async function countGrammarMastered(userId: string, dbGrades: number[]): Promise<number> {
  const { data: points } = await supabase
    .from("junior_grammar_points")
    .select("id")
    .in("grade", dbGrades);
  const ids = (points ?? []).map((p) => p.id);
  if (!ids.length) return 0;

  const { count, error } = await supabase
    .from("junior_user_mastery")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("item_type", "grammar_point")
    .in("item_id", ids)
    .gte("mastery_level", CLASSROOM_MASTERED_LEVEL);
  if (error) return 0;
  return count ?? 0;
}

async function countReadingMastered(userId: string, dbGrades: number[]): Promise<number> {
  const { data: items } = await supabase.from("junior_reading").select("id").in("grade", dbGrades);
  const ids = (items ?? []).map((r) => r.id);
  if (!ids.length) return 0;

  const { data: rows } = await supabase
    .from("mastery_progress")
    .select("item_id,stars,best_pct")
    .eq("user_id", userId)
    .eq("module", "junior_reading")
    .in("item_id", ids);

  return (rows ?? []).filter(
    (r) => (r.stars ?? 0) >= 5 || (r.best_pct ?? 0) >= PASS_PCT,
  ).length;
}

async function countListeningMastered(userId: string, dbGrades: number[]): Promise<number> {
  const { data: items } = await supabase
    .from("junior_listening_exercises")
    .select("id")
    .in("grade", dbGrades);
  const ids = new Set((items ?? []).map((r) => r.id));
  if (!ids.size) return 0;

  const { data: attempts } = await supabase
    .from("junior_listening_attempts")
    .select("exercise_id,is_correct")
    .eq("user_id", userId);

  const stats = new Map<string, { ok: number; tot: number }>();
  for (const a of attempts ?? []) {
    if (!ids.has(a.exercise_id)) continue;
    const cur = stats.get(a.exercise_id) ?? { ok: 0, tot: 0 };
    cur.tot += 1;
    if (a.is_correct) cur.ok += 1;
    stats.set(a.exercise_id, cur);
  }
  let mastered = 0;
  for (const v of stats.values()) {
    if (v.tot >= 1 && v.ok / v.tot >= PASS_PCT / 100) mastered += 1;
  }
  return mastered;
}

async function countWritingMastered(userId: string, dbGrades: number[]): Promise<number> {
  const { data: items } = await supabase
    .from("junior_writing_prompts")
    .select("id")
    .in("grade", dbGrades);
  const ids = new Set((items ?? []).map((r) => r.id));
  if (!ids.size) return 0;

  const { data: attempts } = await supabase
    .from("junior_writing_attempts")
    .select("prompt_id,overall_score")
    .eq("user_id", userId);

  const best = new Map<string, number>();
  for (const a of attempts ?? []) {
    if (!ids.has(a.prompt_id)) continue;
    best.set(a.prompt_id, Math.max(best.get(a.prompt_id) ?? 0, a.overall_score ?? 0));
  }
  let mastered = 0;
  for (const v of best.values()) {
    if (v >= PASS_PCT) mastered += 1;
  }
  return mastered;
}

async function countStageTestsMastered(userId: string, dbGrades: number[]): Promise<number> {
  const stageGrades = dbGrades.map((g) => STAGE_GRADE_BY_DB[g]);
  const { data: tests } = await supabase
    .from("stage_tests")
    .select("id")
    .eq("segment", "junior")
    .in("grade", stageGrades);
  const ids = (tests ?? []).map((t) => t.id);
  if (!ids.length) return 0;

  const { data: passed } = await supabase
    .from("stage_test_attempts")
    .select("test_id")
    .eq("user_id", userId)
    .eq("passed", true)
    .in("test_id", ids);

  return new Set((passed ?? []).map((p) => p.test_id)).size;
}

export async function fetchJuniorClassroomSyncProgress(
  gradeKey: JuniorGradeKey,
): Promise<ClassroomSyncProgress> {
  const dbGrades = dbGradesForFilter(gradeKey);

  const [vocabTotal, grammarTotal, readingTotal, listeningTotal, writingTotal, stageTotal] =
    await Promise.all([
      countRows("junior_vocab", dbGrades),
      countRows("junior_grammar_points", dbGrades),
      countRows("junior_reading", dbGrades),
      countRows("junior_listening_exercises", dbGrades),
      countRows("junior_writing_prompts", dbGrades),
      countStageTests(dbGrades),
    ]);

  const empty: ClassroomSyncBreakdown = {
    vocab: { mastered: 0, total: vocabTotal },
    grammar: { mastered: 0, total: grammarTotal },
    reading: { mastered: 0, total: readingTotal },
    listening: { mastered: 0, total: listeningTotal },
    writing: { mastered: 0, total: writingTotal },
    stageTests: { mastered: 0, total: stageTotal },
  };

  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) {
    const { mastered, total } = sumBreakdown(empty);
    return { mastered, total, percent: 0, breakdown: empty };
  }

  const [vM, gM, rM, lM, wM, sM] = await Promise.all([
    countVocabMastered(userId, dbGrades),
    countGrammarMastered(userId, dbGrades),
    countReadingMastered(userId, dbGrades),
    countListeningMastered(userId, dbGrades),
    countWritingMastered(userId, dbGrades),
    countStageTestsMastered(userId, dbGrades),
  ]);

  const breakdown: ClassroomSyncBreakdown = {
    vocab: { mastered: Math.min(vM, vocabTotal), total: vocabTotal },
    grammar: { mastered: Math.min(gM, grammarTotal), total: grammarTotal },
    reading: { mastered: Math.min(rM, readingTotal), total: readingTotal },
    listening: { mastered: Math.min(lM, listeningTotal), total: listeningTotal },
    writing: { mastered: Math.min(wM, writingTotal), total: writingTotal },
    stageTests: { mastered: Math.min(sM, stageTotal), total: stageTotal },
  };

  const { mastered, total } = sumBreakdown(breakdown);
  return { mastered, total, percent: pct(mastered, total), breakdown };
}
