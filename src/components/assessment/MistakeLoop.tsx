/**
 * 错题闭环：解析 → AI 变式 3 题 → 过关
 */
import { useState } from "react";
import { Loader2, Sparkles, CheckCircle2, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { JuniorAssessmentQuestion } from "@/lib/juniorStageAssessment";

type PracticeQ = {
  question: string;
  options?: string[];
  correct_answer: string;
  explanation?: string;
};

export function MistakeLoop({
  wrong,
  moduleLabel,
  onMastered,
  onSkip,
}: {
  wrong: JuniorAssessmentQuestion;
  moduleLabel: string;
  onMastered?: () => void;
  onSkip?: () => void;
}) {
  const [phase, setPhase] = useState<"explain" | "practice" | "done">("explain");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<PracticeQ[]>([]);
  const [picks, setPicks] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [round, setRound] = useState(1);

  const correctOpt = wrong.options
    ? wrong.options[wrong.correct as keyof typeof wrong.options]
    : wrong.correct;

  async function startPractice() {
    setLoading(true);
    try {
      const stem = wrong.passage ? `${wrong.passage}\n\n${wrong.stem}` : wrong.stem;
      const { data, error } = await supabase.functions.invoke("generate-similar-questions", {
        body: {
          module: moduleLabel,
          source_label: wrong.knowledge_point_label,
          question: stem,
          correct_answer: correctOpt,
          explanation: wrong.explanation,
        },
      });
      if (error) throw error;
      const qs: PracticeQ[] = (data?.questions ?? []).slice(0, 3);
      if (qs.length === 0) throw new Error("未能生成巩固题");
      setItems(qs);
      setPicks({});
      setSubmitted(false);
      setPhase("practice");
    } catch (e: any) {
      toast.error(e?.message || "出题失败");
    } finally {
      setLoading(false);
    }
  }

  function submitPractice() {
    setSubmitted(true);
    let ok = 0;
    items.forEach((q, i) => {
      const pick = picks[i] ?? "";
      const ans = q.correct_answer ?? "";
      const norm = (s: string) => s.replace(/^[A-D]\.\s*/, "").trim();
      if (pick === ans || norm(pick) === norm(ans)) ok++;
    });
    if (ok >= Math.ceil(items.length * 0.67)) {
      setPhase("done");
      onMastered?.();
    } else if (round < 2) {
      setRound(round + 1);
      setTimeout(() => {
        setPhase("explain");
        setSubmitted(false);
        setItems([]);
        toast.info("再练一轮，加油！");
      }, 1200);
    } else {
      toast.info("先看懂解析，下次一定能对！");
      onSkip?.();
    }
  }

  if (phase === "done") {
    return (
      <div className="rounded-2xl border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 p-4">
        <CheckCircle2 className="size-8 text-emerald-600 mx-auto" />
        <p className="mt-2 text-center font-extrabold text-emerald-800 dark:text-emerald-300">
          这个知识点已掌握！
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/80 dark:bg-amber-950/20 p-4 space-y-3">
      <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
        <BookOpen className="size-4" />
        {wrong.knowledge_point_label || moduleLabel} · 错题特训
      </div>

      {phase === "explain" && (
        <>
          <p className="text-sm font-semibold">{wrong.stem}</p>
          {wrong.passage && (
            <p className="text-xs text-muted-foreground line-clamp-4">{wrong.passage}</p>
          )}
          <div className="rounded-xl border border-rose-200 bg-rose-100 dark:bg-rose-950/40 px-3 py-2 text-sm">
            <span className="font-bold text-rose-700">正确答案：</span> {correctOpt}
          </div>
          <p className="text-sm text-muted-foreground">{wrong.explanation}</p>
          <button
            type="button"
            onClick={startPractice}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-2.5 text-sm font-extrabold text-white"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            AI 出 3 道同类题巩固
          </button>
          {onSkip && (
            <button type="button" onClick={onSkip} className="w-full text-xs text-muted-foreground">
              稍后再练
            </button>
          )}
        </>
      )}

      {phase === "practice" && (
        <>
          <p className="text-xs text-muted-foreground">第 {round} 轮 · 答对 2/3 即可过关</p>
          {items.map((q, i) => (
            <div key={i} className="rounded-xl border bg-card p-3 space-y-2">
              <p className="text-sm font-semibold">{q.question}</p>
              {(q.options ?? []).map((opt) => {
                const picked = picks[i] === opt;
                const isRight = submitted && opt === q.correct_answer;
                const isWrong = submitted && picked && !isRight;
                return (
                  <button
                    key={opt}
                    type="button"
                    disabled={submitted}
                    onClick={() => setPicks((p) => ({ ...p, [i]: opt }))}
                    className={cn(
                      "w-full text-left rounded-lg border px-3 py-2 text-sm",
                      picked && !submitted && "border-violet-500 bg-violet-50",
                      isRight && "border-emerald-500 bg-emerald-50",
                      isWrong && "border-rose-500 bg-rose-50",
                    )}
                  >
                    {opt}
                  </button>
                );
              })}
              {submitted && q.explanation && (
                <p className="text-xs text-muted-foreground">{q.explanation}</p>
              )}
            </div>
          ))}
          {!submitted ? (
            <button
              type="button"
              onClick={() => {
                if (Object.keys(picks).length < items.length) {
                  toast.error("请答完所有巩固题");
                  return;
                }
                submitPractice();
              }}
              className="w-full rounded-xl bg-foreground py-2.5 text-sm font-extrabold text-background"
            >
              提交巩固题
            </button>
          ) : (
            <p className="text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="size-4 animate-spin" /> 判定中…
            </p>
          )}
        </>
      )}
    </div>
  );
}
