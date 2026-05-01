import { supabase } from "@/integrations/supabase/client";

export type ItemType = "grammar_question" | "grammar_point" | "reading_question" | "vocab";

export async function recordAttempt(opts: {
  questionType: "grammar" | "reading" | "vocab";
  questionId: string;
  userAnswer?: string;
  isCorrect: boolean;
  timeSpent?: number;
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