import { supabase } from "@/integrations/supabase/client";
import { recordUnifiedAttempt } from "./unifiedMastery";

/** Calls the SECURITY DEFINER RPC to record one grammar attempt. */
export async function recordGrammarAttempt(slug: string, isCorrect: boolean) {
  try {
    const { error } = await supabase.rpc("record_grammar_attempt", {
      p_slug: slug,
      p_correct: isCorrect,
    });
    if (error) console.warn("[grammarMastery] rpc error", error.message);
  } catch (e) {
    console.warn("[grammarMastery] rpc threw", e);
  }

  // 🆕 v7：写 unified_mastery（slug 形如 "junior:past_simple" / "gaokao:subjunctive"）
  const [stagePrefix, code] = slug.split(":");
  const stage = stagePrefix === "junior" ? "junior" : "senior";
  const grade = stage === "junior" ? 8 : 10;
  recordUnifiedAttempt({
    stage,
    grade,
    module: "grammar",
    item_type: "grammar_point",
    item_id: code ?? slug,
    item_label: code,
    is_correct: isCorrect,
  }).catch(() => {});
}

export type MasteryBand = "expert" | "mastered" | "ok" | "weak" | "untouched";

export function bandOf(score: number, attempts: number): MasteryBand {
  if (attempts === 0) return "untouched";
  if (score >= 90) return "expert";
  if (score >= 75) return "mastered";
  if (score >= 55) return "ok";
  if (score >= 35) return "weak";
  return "weak";
}

export const BAND_META: Record<MasteryBand, { label: string; tone: string; bar: string }> = {
  expert:    { label: "精通 ≥90",   tone: "text-emerald-600 dark:text-emerald-400", bar: "bg-emerald-500" },
  mastered:  { label: "掌握 75-89", tone: "text-blue-600 dark:text-blue-400",       bar: "bg-blue-500" },
  ok:        { label: "基本 55-74", tone: "text-amber-600 dark:text-amber-400",     bar: "bg-amber-500" },
  weak:      { label: "薄弱 <55",   tone: "text-rose-600 dark:text-rose-400",       bar: "bg-rose-500" },
  untouched: { label: "未学",       tone: "text-muted-foreground",                  bar: "bg-muted-foreground/40" },
};