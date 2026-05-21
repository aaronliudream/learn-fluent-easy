import { supabase } from "@/integrations/supabase/client";
import type { ExamQuestion } from "@/data/exams";

export type ExamFavorite = {
  id: string;
  user_id: string;
  exam_id: string;
  question_id: string;
  section: string | null;
  note: string | null;
  snapshot: Record<string, unknown>;
  source_path: string | null;
  created_at: string;
};

export function questionSnapshot(q: ExamQuestion, examTitle?: string): Record<string, unknown> {
  return {
    exam_title: examTitle,
    stem: q.stem,
    section: q.section,
    type: q.type,
    options: q.options,
    answer: q.answer,
    explanation: q.explanation,
    knowledge_point: q.knowledge_point,
  };
}

export async function addExamFavorite(args: {
  examId: string;
  questionId: string;
  section?: string;
  snapshot?: Record<string, unknown>;
  sourcePath?: string;
}): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) throw new Error("not_signed_in");

  const { error } = await supabase.from("exam_favorites").upsert(
    {
      user_id: user.id,
      exam_id: args.examId,
      question_id: args.questionId,
      section: args.section ?? null,
      snapshot: args.snapshot ?? {},
      source_path: args.sourcePath ?? null,
    },
    { onConflict: "user_id,exam_id,question_id" },
  );
  if (error) throw error;
}

export async function removeExamFavorite(examId: string, questionId: string): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) throw new Error("not_signed_in");
  const { error } = await supabase
    .from("exam_favorites")
    .delete()
    .eq("user_id", user.id)
    .eq("exam_id", examId)
    .eq("question_id", questionId);
  if (error) throw error;
}

export async function listExamFavorites(examId?: string): Promise<ExamFavorite[]> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return [];

  let q = supabase
    .from("exam_favorites")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (examId) q = q.eq("exam_id", examId);

  const { data, error } = await q;
  if (error) {
    console.warn("[exam_favorites] list error", error);
    return [];
  }
  return (data ?? []) as ExamFavorite[];
}

export async function isExamFavorite(examId: string, questionId: string): Promise<boolean> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return false;
  const { data, error } = await supabase
    .from("exam_favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("exam_id", examId)
    .eq("question_id", questionId)
    .maybeSingle();
  if (error) return false;
  return !!data;
}

export async function countExamFavorites(): Promise<number> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return 0;
  const { count, error } = await supabase
    .from("exam_favorites")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);
  if (error) return 0;
  return count ?? 0;
}
