import { supabase } from "@/integrations/supabase/client";
import { fsrsSchedule, gradeFromAttempt, type FsrsState } from "./fsrs";
import { recordUnifiedAttempt } from "./unifiedMastery";

/**
 * Junior grammar mastery scheduling — FSRS-backed.
 * Mirrors src/lib/grammarFsrs.ts (the Gaokao version) but writes to the
 * `junior_user_mastery` table instead of `gaokao_user_mastery`.
 *
 * Levels 0..4: Untouched / Learning / Familiar / Proficient / Mastered.
 * Mastered requires: ≥12 correct across ≥2 question types, ≥85% recent acc,
 * stability ≥21d, and a successful retention check (≥7d gap then correct).
 *
 * Why a separate file (instead of generalizing the Gaokao one)?
 * Keeps the Gaokao code untouched. Lovable can later refactor the two into
 * one parameterized module if desired.
 */

export type JuniorGrammarErrorReason =
  | "rule_unknown"
  | "confusion"
  | "careless"
  | "vocab"
  | "speed";

export type JuniorGrammarMatrix = {
  types?: Record<string, { c: number; w: number }>;
  recent?: number[];
  errors?: Record<string, number>;
};

export type JuniorGrammarMastery = {
  id?: string;
  user_id?: string;
  item_id: string;
  correct_count: number;
  wrong_count: number;
  mastery_level: number;
  stability: number;
  difficulty: number;
  last_seen_at: string | null;
  due_at: string | null;
  reached_master_at: string | null;
  last_result: string | null;
  lapses: number;
  mastery_matrix: JuniorGrammarMatrix;
};

function recentAcc(recent: number[] = []): number {
  if (!recent.length) return 0;
  return recent.reduce((a, b) => a + b, 0) / recent.length;
}

function distinctTypes(types: Record<string, { c: number; w: number }> = {}): number {
  return Object.values(types).filter((t) => t.c >= 2).length;
}

export function deriveLevel(m: {
  correct_count: number;
  wrong_count: number;
  stability: number;
  reached_master_at: string | null;
  mastery_matrix: JuniorGrammarMatrix;
}): number {
  const acc = recentAcc(m.mastery_matrix?.recent);
  const c = m.correct_count;
  const s = m.stability;
  const types = distinctTypes(m.mastery_matrix?.types);
  if (c >= 12 && types >= 2 && acc >= 0.85 && s >= 21 && !!m.reached_master_at) return 4;
  if (c >= 8 && acc >= 0.8 && s >= 7) return 3;
  if (c >= 4 && acc >= 0.6) return 2;
  if (c + m.wrong_count >= 1) return 1;
  return 0;
}

function checkRetention(prev: JuniorGrammarMastery | null, isCorrect: boolean): boolean {
  if (!isCorrect || !prev?.last_seen_at) return false;
  const gap = Date.now() - new Date(prev.last_seen_at).getTime();
  return gap >= 7 * 24 * 3600 * 1000;
}

export async function loadJuniorGrammarMastery(
  pointId: string,
): Promise<JuniorGrammarMastery | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("junior_user_mastery")
    .select("*")
    .eq("user_id", user.id)
    .eq("item_type", "grammar_point")
    .eq("item_id", pointId)
    .maybeSingle();
  return (data as unknown as JuniorGrammarMastery) ?? null;
}

export async function loadJuniorGrammarMasteryAll(): Promise<JuniorGrammarMastery[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("junior_user_mastery")
    .select("*")
    .eq("user_id", user.id)
    .eq("item_type", "grammar_point");
  return (data ?? []) as unknown as JuniorGrammarMastery[];
}

export async function recordJuniorGrammarAttempt(opts: {
  pointId: string;
  questionType: string;
  isCorrect: boolean;
  latencyMs?: number;
  errorReason?: JuniorGrammarErrorReason;
  // 🆕 v7：统一掌握度路由所需上下文
  grade?: number;
  pointLabel?: string;
}): Promise<{ newLevel: number; intervalDays: number; justMastered: boolean } | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const prev = await loadJuniorGrammarMastery(opts.pointId);
  const now = new Date();

  const grade = gradeFromAttempt({
    isCorrect: opts.isCorrect,
    latencyMs: opts.latencyMs,
    targetMs: 8000,
  });
  const prevState: FsrsState | null = prev
    ? {
        difficulty: prev.difficulty ?? 5.0,
        stability: prev.stability ?? 0,
        lastReviewIso: prev.last_seen_at,
      }
    : null;
  const fsrs = fsrsSchedule(prevState, grade, now);

  const matrix: JuniorGrammarMatrix = prev?.mastery_matrix
    ? JSON.parse(JSON.stringify(prev.mastery_matrix))
    : { types: {}, recent: [], errors: {} };
  matrix.types = matrix.types || {};
  matrix.recent = matrix.recent || [];
  matrix.errors = matrix.errors || {};

  const t = matrix.types[opts.questionType] || { c: 0, w: 0 };
  if (opts.isCorrect) t.c += 1; else t.w += 1;
  matrix.types[opts.questionType] = t;

  matrix.recent.push(opts.isCorrect ? 1 : 0);
  if (matrix.recent.length > 10) matrix.recent.shift();

  if (!opts.isCorrect && opts.errorReason) {
    matrix.errors[opts.errorReason] = (matrix.errors[opts.errorReason] || 0) + 1;
  }

  const correctCount = (prev?.correct_count ?? 0) + (opts.isCorrect ? 1 : 0);
  const wrongCount = (prev?.wrong_count ?? 0) + (opts.isCorrect ? 0 : 1);
  const lapses = (prev?.lapses ?? 0) + (opts.isCorrect ? 0 : 1);

  const retentionPassed = checkRetention(prev, opts.isCorrect);
  const reachedMasterAt =
    prev?.reached_master_at ||
    (retentionPassed && correctCount >= 12 && fsrs.stability >= 21
      ? now.toISOString()
      : null);

  const newLevel = deriveLevel({
    correct_count: correctCount,
    wrong_count: wrongCount,
    stability: fsrs.stability,
    reached_master_at: reachedMasterAt,
    mastery_matrix: matrix,
  });

  const payload = {
    correct_count: correctCount,
    wrong_count: wrongCount,
    mastery_level: newLevel,
    stability: fsrs.stability,
    difficulty: fsrs.difficulty,
    last_seen_at: now.toISOString(),
    last_grade: grade,
    last_latency_ms: opts.latencyMs ?? null,
    due_at: fsrs.dueAt.toISOString(),
    next_review_at: fsrs.dueAt.toISOString(),
    reached_master_at: reachedMasterAt,
    last_result: opts.isCorrect ? "correct" : "wrong",
    lapses,
    mastery_matrix: matrix,
  };

  if (prev?.id) {
    await supabase.from("junior_user_mastery").update(payload).eq("id", prev.id);
  } else {
    await supabase.from("junior_user_mastery").insert({
      user_id: user.id,
      item_type: "grammar_point",
      item_id: opts.pointId,
      ...payload,
    });
  }

  // 🆕 v7：写 unified_mastery（统一答题路由）
  recordUnifiedAttempt({
    stage: "junior",
    grade: opts.grade ?? 8,
    module: "grammar",
    item_type: "grammar_point",
    item_id: opts.pointId,
    item_label: opts.pointLabel,
    is_correct: opts.isCorrect,
    context: { error_reason: opts.errorReason, latency_ms: opts.latencyMs },
  }).catch(() => {});

  return {
    newLevel,
    intervalDays: fsrs.intervalDays,
    justMastered: !!reachedMasterAt && !prev?.reached_master_at,
  };
}

export function aggregateJuniorGrammarErrors(
  rows: JuniorGrammarMastery[],
): Record<JuniorGrammarErrorReason, number> {
  const sum: Record<string, number> = {
    rule_unknown: 0, confusion: 0, careless: 0, vocab: 0, speed: 0,
  };
  for (const r of rows) {
    const errs = r.mastery_matrix?.errors || {};
    for (const [k, v] of Object.entries(errs)) {
      if (k in sum) sum[k] += v as number;
    }
  }
  return sum as Record<JuniorGrammarErrorReason, number>;
}

export const JUNIOR_ERROR_REASON_LABELS: Record<JuniorGrammarErrorReason, string> = {
  rule_unknown: "规则不懂",
  confusion: "相似混淆",
  careless: "粗心",
  vocab: "词汇不认识",
  speed: "时间不够",
};

export const JUNIOR_LEVEL_META: Record<
  number,
  { label: string; emoji: string; color: string; ring: string }
> = {
  0: { label: "未开始", emoji: "🌱", color: "text-muted-foreground", ring: "stroke-muted" },
  1: { label: "初学",  emoji: "🌿", color: "text-sky-600",        ring: "stroke-sky-500" },
  2: { label: "熟悉",  emoji: "🌳", color: "text-emerald-600",     ring: "stroke-emerald-500" },
  3: { label: "熟练",  emoji: "⭐", color: "text-amber-600",       ring: "stroke-amber-500" },
  4: { label: "掌握",  emoji: "👑", color: "text-yellow-600",      ring: "stroke-yellow-500" },
};
