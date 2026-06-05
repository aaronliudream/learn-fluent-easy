import { supabase } from "@/integrations/supabase/client";

export async function recordSkillAttemptsForQuestion(questionId: string, isCorrect: boolean) {
  try {
    const { data, error } = await supabase
      .from("question_skill_map")
      .select("junior_skills(slug)")
      .eq("question_id", questionId);
    if (error || !data?.length) return;
    const slugs = data
      .flatMap((r: any) => {
        const js = r.junior_skills;
        if (!js) return [];
        return Array.isArray(js) ? js.map((x) => x?.slug) : [js.slug];
      })
      .filter(Boolean) as string[];
    await Promise.all(
      slugs.map((slug) =>
        supabase.rpc("record_skill_attempt", { p_skill_slug: slug, p_correct: isCorrect })
      )
    );
  } catch (e) {
    console.warn("[skillAttempt] skipped:", e);
  }
}
