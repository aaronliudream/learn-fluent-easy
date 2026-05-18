/**
 * Per-user junior vocab mastery — writes to junior_word_mastery (Hub / SRS read this table).
 * Gaokao cohort / unified pipelines are unchanged; call this in parallel from JuniorVocab paths.
 */
import { supabase } from "@/integrations/supabase/client";
import { nextSrsState } from "@/lib/masteryFsrs";
import { toast } from "sonner";

export type JuniorMasteryKind = "quiz" | "listen" | "spell" | "match" | "cloze";

const KIND_FIELDS: Record<
  JuniorMasteryKind,
  { correct: "quiz_correct" | "listen_correct" | "spell_correct" | "match_correct" | "cloze_correct"; wrong: "quiz_wrong" | "listen_wrong" | "spell_wrong" | "match_wrong" | "cloze_wrong" }
> = {
  quiz: { correct: "quiz_correct", wrong: "quiz_wrong" },
  listen: { correct: "listen_correct", wrong: "listen_wrong" },
  spell: { correct: "spell_correct", wrong: "spell_wrong" },
  match: { correct: "match_correct", wrong: "match_wrong" },
  cloze: { correct: "cloze_correct", wrong: "cloze_wrong" },
};

export function reportJuniorMasteryError(context: string, err: unknown, zh = true): void {
  console.error(`[junior_word_mastery] ${context}`, err);
  toast.error(
    zh ? "掌握度保存失败，请检查网络后重试" : "Could not save mastery — check your connection and try again.",
  );
}

/** QuizKind from guided / cohort flows → junior_word_mastery counter column family. */
export function juniorKindFromQuizKind(kind: string): JuniorMasteryKind {
  if (kind === "spell" || kind === "listen") return kind;
  if (kind === "cloze") return "cloze";
  if (kind === "match") return "match";
  return "quiz";
}

export async function recordJuniorWordMastery(opts: {
  wordId: string;
  grade: number;
  kind: JuniorMasteryKind;
  isCorrect: boolean;
}): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: existing, error: readErr } = await supabase
    .from("junior_word_mastery")
    .select(
      "id,quiz_correct,quiz_wrong,listen_correct,listen_wrong,spell_correct,spell_wrong,match_correct,match_wrong,cloze_correct,cloze_wrong,mastery_level,ease,interval_days,due_at",
    )
    .eq("user_id", user.id)
    .eq("word_id", opts.wordId)
    .maybeSingle();

  if (readErr) {
    reportJuniorMasteryError("read", readErr);
    return false;
  }

  const fields = KIND_FIELDS[opts.kind];
  const c = opts.isCorrect ? 1 : 0;
  const w = opts.isCorrect ? 0 : 1;
  const srs = nextSrsState(
    existing
      ? { ease: existing.ease, interval_days: existing.interval_days, due_at: existing.due_at ?? undefined }
      : null,
    opts.isCorrect,
  );

  const payload: Record<string, unknown> = {
    user_id: user.id,
    word_id: opts.wordId,
    grade: opts.grade,
    quiz_correct: existing?.quiz_correct ?? 0,
    quiz_wrong: existing?.quiz_wrong ?? 0,
    listen_correct: existing?.listen_correct ?? 0,
    listen_wrong: existing?.listen_wrong ?? 0,
    spell_correct: existing?.spell_correct ?? 0,
    spell_wrong: existing?.spell_wrong ?? 0,
    match_correct: existing?.match_correct ?? 0,
    match_wrong: existing?.match_wrong ?? 0,
    cloze_correct: existing?.cloze_correct ?? 0,
    cloze_wrong: existing?.cloze_wrong ?? 0,
    [fields.correct]: ((existing as Record<string, number> | null)?.[fields.correct] ?? 0) + c,
    [fields.wrong]: ((existing as Record<string, number> | null)?.[fields.wrong] ?? 0) + w,
    mastery_level: Math.min(
      4,
      Math.max(0, (existing?.mastery_level ?? 0) + (opts.isCorrect ? 1 : -1)),
    ),
    ease: srs.ease,
    interval_days: srs.interval_days,
    due_at: srs.due_at,
    last_seen_at: new Date().toISOString(),
  };

  const { error: writeErr } = existing
    ? await supabase.from("junior_word_mastery").update(payload).eq("id", existing.id)
    : await supabase.from("junior_word_mastery").insert(payload);

  if (writeErr) {
    reportJuniorMasteryError("write", writeErr);
    return false;
  }
  return true;
}

/** Word ids due for SRS review (reads junior_word_mastery, not gaokao_user_mastery). */
export async function fetchJuniorDueWordIds(vocabIds: string[]): Promise<string[]> {
  if (vocabIds.length === 0) return [];
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const nowIso = new Date().toISOString();
  const out: string[] = [];
  const CHUNK = 200;
  for (let i = 0; i < vocabIds.length; i += CHUNK) {
    const slice = vocabIds.slice(i, i + CHUNK);
    const { data, error } = await supabase
      .from("junior_word_mastery")
      .select("word_id")
      .eq("user_id", user.id)
      .in("word_id", slice)
      .lte("due_at", nowIso);
    if (error) {
      console.error("[junior_word_mastery] fetch due", error);
      break;
    }
    (data ?? []).forEach((r) => out.push(r.word_id));
  }
  return out;
}
