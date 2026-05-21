import { useCallback, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { T } from "@/i18n/T";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export type WritingFeedbackResult = {
  score: number;
  overall: string;
  mistakes: { original: string; corrected: string; explanation: string }[];
  suggestions: string[];
  improved: string;
};

type Props = {
  text: string;
  promptEn: string;
  promptCn?: string;
  lessonTitle: string;
  canGrade: boolean;
  className?: string;
};

export function EssayAiFeedback({
  text,
  promptEn,
  promptCn,
  lessonTitle,
  canGrade,
  className,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WritingFeedbackResult | null>(null);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  const runCheck = useCallback(async () => {
    if (!canGrade) {
      toast.error("请先完成并提交本题组，或提交整张试卷后再批改");
      return;
    }
    if (wordCount < 15) {
      toast.error("请先写至少 15 个英文单词再批改");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("check-writing", {
        body: {
          prompt: promptEn,
          promptCn: promptCn ?? "",
          sample: "",
          text: text.trim(),
          lessonTitle,
          targetLanguage: "Chinese",
        },
      });
      if (error) throw error;
      setResult(data as WritingFeedbackResult);
      toast.success(`AI 批改完成 · 得分 ${Math.round((data as WritingFeedbackResult).score)}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "批改失败，请稍后再试";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [canGrade, wordCount, promptEn, promptCn, lessonTitle, text]);

  if (!canGrade && !result) {
    return (
      <p className={cn("text-xs exam-mute rounded-lg border border-dashed exam-divider px-3 py-2", className)}>
        <T>写完作文后，请滚动到页面顶部点击「提交试卷」按钮。提交后可使用 AI 批改、查看错误分析与参考范文。</T>
      </p>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {!result ? (
        <button
          type="button"
          disabled={loading || wordCount < 15}
          onClick={runCheck}
          className="exam-btn exam-btn-primary h-9 px-4 text-sm disabled:opacity-50">
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
          <T>AI 批改 · 生成范文</T>
        </button>
      ) : (
        <div className="space-y-4 rounded-xl border border-indigo-200/80 bg-indigo-50/40 dark:bg-indigo-950/20 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-indigo-800 dark:text-indigo-200">
              <T>AI 评分</T> {Math.round(result.score)}/100
            </span>
            <button
              type="button"
              disabled={loading}
              onClick={runCheck}
              className="ml-auto text-xs font-semibold text-indigo-600 hover:underline">
              <T>重新批改</T>
            </button>
          </div>
          <p className="text-sm leading-relaxed exam-soft">{result.overall}</p>

          {result.mistakes.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-bold exam-display"><T>错误分析</T></p>
              <ul className="space-y-2 text-xs">
                {result.mistakes.map((m, i) => (
                  <li key={i} className="overflow-hidden rounded-lg border exam-divider">
                    <div className="bg-rose-50/80 px-3 py-1.5 text-rose-800 dark:bg-rose-950/30">
                      <span className="font-bold"><T>原句：</T></span> {m.original}
                    </div>
                    <div className="bg-emerald-50/80 px-3 py-1.5 text-emerald-800 dark:bg-emerald-950/30">
                      <span className="font-bold"><T>修改：</T></span> {m.corrected}
                    </div>
                    <div className="px-3 py-1.5 exam-mute">{m.explanation}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.suggestions.length > 0 && (
            <ul className="list-disc list-inside space-y-1 text-xs exam-soft">
              {result.suggestions.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          )}

          {result.improved && (
            <div className="rounded-lg border border-amber-300/60 bg-amber-50/80 dark:bg-amber-950/30 p-3">
              <p className="mb-2 text-xs font-bold text-amber-900 dark:text-amber-200"><T>参考范文（AI 改写）</T></p>
              <div className="whitespace-pre-line font-serif text-sm leading-relaxed text-amber-950 dark:text-amber-100">
                {result.improved}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** 从 writing_prompt 构建 check-writing 所需 prompt */
export function buildWritingAiPrompt(
  writingPrompt: unknown,
  examTitle: string,
): { promptEn: string; promptCn: string } {
  if (!writingPrompt || typeof writingPrompt !== "object") {
    return { promptEn: examTitle, promptCn: examTitle };
  }
  const wp = writingPrompt as Record<string, unknown>;

  if (wp.format === "email_reply") {
    const scenario = String(wp.scenario ?? "");
    const email = (wp.email ?? {}) as Record<string, unknown>;
    const bullets = (email.bullets as string[] | undefined) ?? [];
    const bulletsText = bullets.map((b) => `• ${b}`).join("\n");
    const template = (wp.template ?? {}) as Record<string, unknown>;
    const opening = (template.opening as string[] | undefined) ?? [];
    const closing = (template.closing as string[] | undefined) ?? [];
    const promptEn = [
      scenario,
      "",
      "Write a reply email in English. The opening and closing are already provided; write the body only.",
      "Must address:",
      bulletsText,
      "",
      `Opening (given): ${opening.join(" ")}`,
      `Closing (given): ${closing.join(" ")}`,
      "About 90 words for the body.",
    ].join("\n");
    return { promptEn, promptCn: scenario };
  }

  if (typeof wp.title === "string" || Array.isArray(wp.requirements)) {
    const reqs = (wp.requirements as string[] | undefined) ?? [];
    const promptEn = [
      String(wp.title ?? examTitle),
      ...reqs.map((r, i) => `${i + 1}. ${r}`),
      String(wp.notes ?? ""),
      String(wp.opening ?? ""),
    ].filter(Boolean).join("\n");
    return { promptEn, promptCn: String(wp.title ?? examTitle) };
  }

  if (typeof wp.body === "string") {
    return { promptEn: wp.body.slice(0, 800), promptCn: examTitle };
  }

  return { promptEn: examTitle, promptCn: examTitle };
}
