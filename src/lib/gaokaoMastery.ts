import { supabase } from "@/integrations/supabase/client";
import { fsrsSchedule, gradeFromAttempt, type FsrsState } from "./fsrs";
import {
  bumpMatrix,
  computeMasteryScore,
  levelFromScore,
  type MasteryMatrix,
  type QuizKind,
  type MasteryLevel,
} from "./masteryScore";
import { recordUnifiedAttempt, type Stage, type ModuleKey } from "./unifiedMastery";

export type ItemType = "grammar_question" | "grammar_point" | "reading_question" | "vocab";

export async function recordAttempt(opts: {
  questionType: "grammar" | "reading" | "vocab";
  questionId: string;
  userAnswer?: string;
  isCorrect: boolean;
  timeSpent?: number;
  // 🆕 v7：统一掌握度路由所需上下文（不传则默认按高考定位）
  stage?: Stage;
  grade?: number;
  module?: ModuleKey;
  itemLabel?: string;
  correctAnswer?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("gaokao_user_attempts").insert({
    user_id: user.id,
    question_type: opts.questionType,
    question_id: opts.questionId,
    user_answer: opts.userAnswer ?? null,
    is_correct: opts.isCorrect,
    time_spent_seconds: opts.timeSpent ?? null,
  });

  // 🆕 v7：写 unified_mastery（FSRS-lite + 错题本 + 诊断失效由 edge function 统一处理）
  const inferredModule: ModuleKey =
    opts.module ??
    (opts.questionType === "reading" ? "reading"
      : opts.questionType === "grammar" ? "grammar"
      : "vocab");
  recordUnifiedAttempt({
    stage: opts.stage ?? "senior",
    grade: opts.grade ?? 10,
    module: inferredModule,
    item_type: opts.questionType,
    item_id: opts.questionId,
    item_label: opts.itemLabel,
    is_correct: opts.isCorrect,
    user_answer: opts.userAnswer,
    correct_answer: opts.correctAnswer,
  }).catch(() => {});
}

export async function bumpMastery(opts: {
  itemType: ItemType;
  itemId: string;
  isCorrect: boolean;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { data: existing } = await supabase
    .from("gaokao_user_mastery")
    .select("*")
    .eq("user_id", user.id)
    .eq("item_type", opts.itemType)
    .eq("item_id", opts.itemId)
    .maybeSingle();

  const now = new Date();
  const correctCount = (existing?.correct_count ?? 0) + (opts.isCorrect ? 1 : 0);
  const wrongCount = (existing?.wrong_count ?? 0) + (opts.isCorrect ? 0 : 1);
  const intervalDays = opts.isCorrect ? Math.min(30, 2 ** correctCount) : 1;
  const next = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);

  if (existing) {
    await supabase.from("gaokao_user_mastery").update({
      correct_count: correctCount,
      wrong_count: wrongCount,
      last_result: opts.isCorrect ? "correct" : "wrong",
      last_seen_at: now.toISOString(),
      next_review_at: next.toISOString(),
    }).eq("id", existing.id);
  } else {
    await supabase.from("gaokao_user_mastery").insert({
      user_id: user.id,
      item_type: opts.itemType,
      item_id: opts.itemId,
      correct_count: correctCount,
      wrong_count: wrongCount,
      last_result: opts.isCorrect ? "correct" : "wrong",
      last_seen_at: now.toISOString(),
      next_review_at: next.toISOString(),
    });
  }
}

/* ====================================================================== */
/* ============ Vocabulary mastery — multi-dim matrix + FSRS ============= */
/* ====================================================================== */

export interface VocabMasteryUpdate {
  /** previous mastery level (0..4) */
  prevLevel: MasteryLevel;
  /** new mastery level (0..4) */
  newLevel: MasteryLevel;
  /** new normalised score 0..1 */
  score: number;
  /** Days until next review */
  intervalDays: number;
  /** Whether the word is now in the Mastered state */
  reachedMaster: boolean;
}

/**
 * Record a vocab attempt, updating:
 *  - the multi-dimensional Nation matrix
 *  - the FSRS difficulty/stability state
 *  - the next due_at and next_review_at (kept in sync for legacy queries)
 *  - the mastery_level (0..4)
 *
 * Mastery level 4 is only granted when the word reaches a high score AND
 * has stayed correct across at least one ≥21-day retention check.
 */
export async function bumpVocabMastery(opts: {
  vocabId: string;
  kind: QuizKind;
  isCorrect: boolean;
  /** ms from question shown → answer */
  latencyMs?: number;
  /** target latency for this kind (defaults vary, see fsrs.gradeFromAttempt) */
  targetMs?: number;
}): Promise<VocabMasteryUpdate | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: existing } = await supabase
    .from("gaokao_user_mastery")
    .select("*")
    .eq("user_id", user.id)
    .eq("item_type", "vocab")
    .eq("item_id", opts.vocabId)
    .maybeSingle();

  const now = new Date();
  const prevMatrix: MasteryMatrix =
    (existing?.mastery_matrix as MasteryMatrix | null) ?? {};
  const prevReached = !!existing?.reached_master_at;
  const prevLevel: MasteryLevel = (existing?.mastery_level ?? 0) as MasteryLevel;

  // 1) Update the multi-dim matrix
  const newMatrix = bumpMatrix(prevMatrix, opts.kind, opts.isCorrect);

  // 2) FSRS scheduling
  const grade = gradeFromAttempt({
    isCorrect: opts.isCorrect,
    latencyMs: opts.latencyMs,
    targetMs: opts.targetMs,
  });
  const prevState: FsrsState | null = existing
    ? {
        difficulty: existing.difficulty ?? 5.0,
        stability: existing.stability ?? 0,
        lastReviewIso: existing.last_seen_at ?? null,
      }
    : null;
  const fsrs = fsrsSchedule(prevState, grade, now);

  // 3) Compute new score & level (with retention-check gate for level 4)
  const score = computeMasteryScore(newMatrix);
  // Detect a successful retention check: the word was at score ≥0.85 for
  // ≥21 days and the user just answered correctly.
  let reachedMasterAt: string | null = existing?.reached_master_at ?? null;
  if (
    !reachedMasterAt &&
    opts.isCorrect &&
    score >= 0.85 &&
    existing?.last_seen_at &&
    now.getTime() - new Date(existing.last_seen_at).getTime() >= 21 * 24 * 3600 * 1000
  ) {
    reachedMasterAt = now.toISOString();
  }
  const newLevel = levelFromScore(score, !!reachedMasterAt);

  // 4) Counters & lapses
  const correctCount = (existing?.correct_count ?? 0) + (opts.isCorrect ? 1 : 0);
  const wrongCount = (existing?.wrong_count ?? 0) + (opts.isCorrect ? 0 : 1);
  const lapses = (existing?.lapses ?? 0) + (opts.isCorrect ? 0 : 1);

  const payload = {
    mastery_matrix: newMatrix,
    mastery_level: newLevel,
    last_latency_ms: opts.latencyMs ?? null,
    lapses,
    difficulty: fsrs.difficulty,
    stability: fsrs.stability,
    last_grade: grade,
    due_at: fsrs.dueAt.toISOString(),
    next_review_at: fsrs.dueAt.toISOString(),
    correct_count: correctCount,
    wrong_count: wrongCount,
    last_result: opts.isCorrect ? "correct" : "wrong",
    last_seen_at: now.toISOString(),
    reached_master_at: reachedMasterAt,
  };

  if (existing) {
    await supabase.from("gaokao_user_mastery").update(payload).eq("id", existing.id);
  } else {
    await supabase.from("gaokao_user_mastery").insert({
      user_id: user.id,
      item_type: "vocab",
      item_id: opts.vocabId,
      ...payload,
    });
  }

  return {
    prevLevel,
    newLevel,
    score,
    intervalDays: fsrs.intervalDays,
    reachedMaster: !!reachedMasterAt,
  };
}