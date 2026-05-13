/**
 * cohortProgress — atomic dual-write for a 5-step cohort answer.
 *
 * For ANY answer on a word that is part of the user's currently active cohort,
 * call `recordCohortAttempt` instead of the bare `bumpVocabMastery`. It:
 *
 *  1. Computes the same FSRS / matrix / level payload that `bumpVocabMastery`
 *     would have written (shared scoring code — TypeScript stays the source
 *     of truth for FSRS math).
 *  2. Sends ONE RPC `record_cohort_attempt` that, in a single transaction,
 *     upserts `gaokao_user_mastery` AND inserts a `gaokao_cohort_events` row
 *     AND bumps `cohort.last_active_at`. No half-success state possible.
 *
 * If the word is NOT in the active cohort (or there is no active cohort),
 * this function transparently falls back to the existing `bumpVocabMastery`
 * so callers can use it unconditionally.
 */
import { supabase } from "@/integrations/supabase/client";
import { fsrsSchedule, gradeFromAttempt, type FsrsState } from "./fsrs";
import {
  bumpMatrix,
  computeMasteryScore,
  levelFromScore,
  type MasteryMatrix,
  type MasteryLevel,
  type QuizKind,
} from "./masteryScore";
import { bumpVocabMastery, type VocabMasteryUpdate } from "./gaokaoMastery";

export interface CohortAttemptOpts {
  vocabId: string;
  kind: QuizKind;
  isCorrect: boolean;
  latencyMs?: number;
  targetMs?: number;
  /** Active cohort id (caller usually reads from useActiveCohort). */
  cohortId?: string | null;
  /** Word ids in the active cohort — used to decide cohort vs fallback. */
  cohortWordIds?: string[] | null;
}

export interface CohortAttemptResult extends VocabMasteryUpdate {
  /** Whether the write went through the cohort RPC (vs fallback). */
  viaCohort: boolean;
}

export async function recordCohortAttempt(
  opts: CohortAttemptOpts,
): Promise<CohortAttemptResult | null> {
  const inCohort =
    !!opts.cohortId &&
    !!opts.cohortWordIds &&
    opts.cohortWordIds.includes(opts.vocabId);

  if (!inCohort) {
    const r = await bumpVocabMastery(opts);
    return r ? { ...r, viaCohort: false } : null;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Read current row to compute the FSRS / matrix payload.
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
  const prevLevel: MasteryLevel = (existing?.mastery_level ?? 0) as MasteryLevel;

  const newMatrix = bumpMatrix(prevMatrix, opts.kind, opts.isCorrect);

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

  const score = computeMasteryScore(newMatrix);
  let reachedMasterAt: string | null = existing?.reached_master_at ?? null;
  if (
    !reachedMasterAt &&
    opts.isCorrect &&
    score >= 0.85 &&
    existing?.last_seen_at &&
    now.getTime() - new Date(existing.last_seen_at).getTime() >=
      21 * 24 * 3600 * 1000
  ) {
    reachedMasterAt = now.toISOString();
  }
  const newLevel = levelFromScore(score, !!reachedMasterAt);

  const correctCount = (existing?.correct_count ?? 0) + (opts.isCorrect ? 1 : 0);
  const wrongCount = (existing?.wrong_count ?? 0) + (opts.isCorrect ? 0 : 1);
  const lapses = (existing?.lapses ?? 0) + (opts.isCorrect ? 0 : 1);

  const masteryPayload = {
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

  const { error } = await supabase.rpc("record_cohort_attempt", {
    p_cohort_id: opts.cohortId!,
    p_vocab_id: opts.vocabId,
    p_kind: opts.kind,
    p_correct: opts.isCorrect,
    p_mastery: masteryPayload as any,
  });

  if (error) {
    // Fall back to the legacy single-table write so the user's answer is
    // never silently lost. The cohort progress row will be missing for this
    // attempt, which is the strictly safer failure mode.
    console.warn("[cohortProgress] RPC failed, falling back:", error.message);
    const r = await bumpVocabMastery(opts);
    return r ? { ...r, viaCohort: false } : null;
  }

  return {
    prevLevel,
    newLevel,
    score,
    intervalDays: fsrs.intervalDays,
    reachedMaster: !!reachedMasterAt,
    viaCohort: true,
  };
}

/* ----------------- progress queries (cohort-only counters) ----------------- */

export interface CohortStepProgress {
  /** vocab_id → set of kinds answered correctly during this cohort. */
  byWord: Map<string, Set<string>>;
  /** total events recorded for this cohort. */
  totalEvents: number;
}

/**
 * Read cohort-internal progress from `gaokao_cohort_events`. This is the
 * truth source for the 5-step progress bar so external Bento/Quest writes
 * to mastery do NOT pollute the cohort progress UI.
 */
export async function fetchCohortProgress(
  cohortId: string,
): Promise<CohortStepProgress> {
  const out: CohortStepProgress = { byWord: new Map(), totalEvents: 0 };
  const { data, error } = await supabase
    .from("gaokao_cohort_events")
    .select("vocab_id, kind, correct")
    .eq("cohort_id", cohortId);
  if (error) {
    console.warn("[cohortProgress] fetch failed:", error.message);
    return out;
  }
  for (const row of data ?? []) {
    out.totalEvents++;
    if (!row.correct) continue;
    let s = out.byWord.get(row.vocab_id);
    if (!s) {
      s = new Set();
      out.byWord.set(row.vocab_id, s);
    }
    s.add(row.kind);
  }
  return out;
}