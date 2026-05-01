import { supabase } from "@/integrations/supabase/client";

/**
 * Lightweight spaced repetition for "key expressions" the learner has
 * encountered in lessons. Algorithm is a simplified SM-2:
 *   - First time + correct → 1 day
 *   - Each subsequent correct → interval × ease
 *   - Wrong → reset to 10 minutes, ease drops a notch
 * Tap-only review surface — no typing.
 */

export type ReviewSeed = {
  phrase: string;
  phrase_cn?: string;
  source_key?: string;
  source_line_en?: string;
  source_line_cn?: string;
};

export type ReviewCard = {
  id: string;
  phrase: string;
  phrase_cn: string | null;
  source_key: string | null;
  source_line_en: string | null;
  source_line_cn: string | null;
  ease: number;
  interval_days: number;
  due_at: string;
  streak: number;
  lapses: number;
  last_reviewed_at: string | null;
};

/** Normalize so "Sure Thing!" and "sure thing" become the same card. */
export function normalizeReviewPhrase(p: string): string {
  return p.toLowerCase().replace(/[^a-z0-9' ]+/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Seed the review queue with one or more expressions encountered in a
 * lesson. Idempotent — existing rows are left alone (we don't want to reset
 * progress if the learner re-opens the lesson).
 */
export async function seedReviews(seeds: ReviewSeed[]): Promise<void> {
  if (seeds.length === 0) return;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Deduplicate within the batch.
  const seen = new Set<string>();
  const rows = seeds
    .map((s) => ({ ...s, phrase: normalizeReviewPhrase(s.phrase) }))
    .filter((s) => {
      if (!s.phrase || seen.has(s.phrase)) return false;
      seen.add(s.phrase);
      return true;
    })
    .map((s) => ({
      user_id: user.id,
      phrase: s.phrase,
      phrase_cn: s.phrase_cn ?? null,
      source_key: s.source_key ?? null,
      source_line_en: s.source_line_en ?? null,
      source_line_cn: s.source_line_cn ?? null,
      // First review: due now so it can show up in today's session.
      due_at: new Date().toISOString(),
    }));

  if (rows.length === 0) return;
  // ignoreDuplicates so we don't clobber existing progress.
  const { error } = await supabase
    .from("expression_reviews")
    .upsert(rows, { onConflict: "user_id,phrase", ignoreDuplicates: true });
  if (error) console.warn("[srs] seedReviews error", error);
}

/** Fetch up to `limit` cards that are due now (or earlier). */
export async function fetchDueReviews(limit = 20): Promise<ReviewCard[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("expression_reviews")
    .select(
      "id, phrase, phrase_cn, source_key, source_line_en, source_line_cn, ease, interval_days, due_at, streak, lapses, last_reviewed_at",
    )
    .eq("user_id", user.id)
    .lte("due_at", new Date().toISOString())
    .order("due_at", { ascending: true })
    .limit(limit);
  if (error) {
    console.warn("[srs] fetchDueReviews error", error);
    return [];
  }
  return (data || []) as ReviewCard[];
}

/** Total count of cards due right now (for badge / nudge). */
export async function countDueReviews(): Promise<number> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;
  const { count, error } = await supabase
    .from("expression_reviews")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .lte("due_at", new Date().toISOString());
  if (error) {
    console.warn("[srs] countDueReviews error", error);
    return 0;
  }
  return count ?? 0;
}

/**
 * Apply the user's grade for a card and write the next review date.
 *  - "again" → reset interval to ~10 min, ease -= 0.2 (floor 1.3), lapse +1
 *  - "good"  → if first time: 1 day; else interval × ease
 *  - "easy"  → as good × 1.5, ease += 0.15
 */
export type Grade = "again" | "good" | "easy";

export async function gradeReview(
  card: ReviewCard,
  grade: Grade,
): Promise<void> {
  let { ease, interval_days, streak, lapses } = card;
  let nextDueMs: number;

  if (grade === "again") {
    ease = Math.max(1.3, ease - 0.2);
    interval_days = 0;
    streak = 0;
    lapses += 1;
    nextDueMs = Date.now() + 10 * 60 * 1000; // 10 minutes
  } else if (grade === "good") {
    streak += 1;
    interval_days = interval_days < 1 ? 1 : interval_days * ease;
    nextDueMs = Date.now() + interval_days * 86_400_000;
  } else {
    // easy
    streak += 1;
    ease = Math.min(3.0, ease + 0.15);
    interval_days = (interval_days < 1 ? 1 : interval_days * ease) * 1.5;
    nextDueMs = Date.now() + interval_days * 86_400_000;
  }

  const { error } = await supabase
    .from("expression_reviews")
    .update({
      ease,
      interval_days,
      streak,
      lapses,
      due_at: new Date(nextDueMs).toISOString(),
      last_reviewed_at: new Date().toISOString(),
    })
    .eq("id", card.id);
  if (error) console.warn("[srs] gradeReview error", error);
}

/**
 * Bump (or reset) progress for a phrase the learner just answered in a
 * lesson quiz. If the row doesn't exist yet, it'll be created with the
 * given seed.
 */
export async function recordQuizAnswer(opts: {
  seed: ReviewSeed;
  correct: boolean;
}): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const phrase = normalizeReviewPhrase(opts.seed.phrase);
  if (!phrase) return;

  // Make sure a row exists.
  await supabase.from("expression_reviews").upsert(
    {
      user_id: user.id,
      phrase,
      phrase_cn: opts.seed.phrase_cn ?? null,
      source_key: opts.seed.source_key ?? null,
      source_line_en: opts.seed.source_line_en ?? null,
      source_line_cn: opts.seed.source_line_cn ?? null,
      due_at: new Date().toISOString(),
    },
    { onConflict: "user_id,phrase", ignoreDuplicates: true },
  );

  // Read it back, then grade.
  const { data } = await supabase
    .from("expression_reviews")
    .select(
      "id, phrase, phrase_cn, source_key, source_line_en, source_line_cn, ease, interval_days, due_at, streak, lapses, last_reviewed_at",
    )
    .eq("user_id", user.id)
    .eq("phrase", phrase)
    .maybeSingle();
  if (!data) return;
  await gradeReview(data as ReviewCard, opts.correct ? "good" : "again");
}