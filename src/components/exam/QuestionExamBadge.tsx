/**
 * 显示「年份+试卷来源｜考点」徽章。从 question_exam_tags 取数据。
 * 静态展示，不带交互；如未打标则不渲染。
 */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Target } from "lucide-react";
import { cn } from "@/lib/utils";

export type ExamTag = {
  exam_year: number | null;
  exam_source: string | null;
  knowledge_point_id: string | null;
  knowledge_point_label: string | null;
};

export function QuestionExamBadge({
  module,
  questionId,
  className,
  fallbackLabel,
}: {
  module: string;
  questionId: string;
  className?: string;
  fallbackLabel?: string | null;
}) {
  const [tag, setTag] = useState<ExamTag | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("question_exam_tags")
        .select("exam_year, exam_source, knowledge_point_id, knowledge_point_label")
        .eq("module", module)
        .eq("question_id", questionId)
        .maybeSingle();
      if (cancelled) return;
      setTag((data as ExamTag) ?? null);
      setLoaded(true);
    })();
    return () => { cancelled = true; };
  }, [module, questionId]);

  if (!loaded) return null;

  const yearText = tag?.exam_year ? `${tag.exam_year}` : null;
  const sourceText = tag?.exam_source ?? null;
  const kp = tag?.knowledge_point_label ?? fallbackLabel ?? null;

  if (!yearText && !sourceText && !kp) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5 text-[11px]", className)}>
      {(yearText || sourceText) && (
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-semibold text-amber-700">
          <Calendar className="size-3" />
          {yearText}{yearText && sourceText ? " " : ""}{sourceText}
        </span>
      )}
      {kp && (
        <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 font-semibold text-rose-700">
          <Target className="size-3" />
          {kp}
        </span>
      )}
    </div>
  );
}

/** 暴露给外部用来获取考点 id（供 PracticeBooster 用） */
export async function getQuestionExamTag(module: string, questionId: string) {
  const { data } = await supabase
    .from("question_exam_tags")
    .select("exam_year, exam_source, knowledge_point_id, knowledge_point_label")
    .eq("module", module)
    .eq("question_id", questionId)
    .maybeSingle();
  return (data as ExamTag) ?? null;
}