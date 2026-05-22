import { supabase } from "@/integrations/supabase/client";

export type JuniorAssessmentQuestion = {
  id: string;
  type: "mcq" | "fill" | "true_false";
  stem: string;
  passage?: string;
  options?: { A: string; B: string; C: string; D: string };
  correct: string;
  explanation: string;
  knowledge_point_id?: string;
  knowledge_point_label?: string;
};

export type JuniorModule = "grammar" | "reading" | "listening" | "writing";

export function stageGradeToDb(grade: number): number {
  return grade >= 1 && grade <= 3 ? grade + 6 : grade;
}

export async function generateJuniorAssessment(opts: {
  grade: number;
  module: JuniorModule;
  questionCount: number;
  scope?: string;
  checkpointPointId?: string;
}): Promise<JuniorAssessmentQuestion[]> {
  const { data, error } = await supabase.functions.invoke("generate-junior-stage-assessment", {
    body: {
      grade: opts.grade,
      module: opts.module,
      question_count: opts.questionCount,
      scope: opts.scope ?? "module",
      checkpoint_point_id: opts.checkpointPointId,
    },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return (data?.questions ?? []) as JuniorAssessmentQuestion[];
}

export async function loadStageTestMeta(testId: string) {
  const { data } = await supabase
    .from("stage_tests")
    .select("title, total_questions, pass_threshold, module, question_source, scope")
    .eq("id", testId)
    .maybeSingle();
  return data as {
    title: string;
    total_questions: number;
    pass_threshold: number;
    module: JuniorModule | null;
    question_source: string | null;
    scope: string | null;
  } | null;
}
