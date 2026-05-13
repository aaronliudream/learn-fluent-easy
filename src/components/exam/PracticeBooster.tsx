/**
 * PracticeBooster — 「我还是不懂 → AI 出 3 题 → 全对收尾 / 还错再来一轮」
 * 最多 3 轮（共 9 题），3 轮仍未通过 → 写错题本 + 知识点 mastery 降级。
 */
import { useEffect, useMemo, useState } from "react";
import { Loader2, Sparkles, CheckCircle2, XCircle, RefreshCw, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { recordKnowledgePointResult } from "@/lib/knowledgePointMastery";
import { getQuestionExamTag } from "./QuestionExamBadge";

export type PracticeItem = {
  passage: string;
  stem: string;
  options: { A: string; B: string; C: string; D: string };
  correct: "A" | "B" | "C" | "D";
  explanation: string;
  trap?: string;
};

const MAX_ROUNDS = 3;

export function PracticeBooster({
  module = "gaokao_reading_article",
  sourceQuestionId,
  sourceQuestionStem,
  fallbackKnowledgePointLabel,
  userWrongOption,
  onMastered,
  onFailedFinal,
}: {
  module?: string;
  sourceQuestionId: string;
  sourceQuestionStem: string;
  fallbackKnowledgePointLabel?: string;
  userWrongOption?: string;
  onMastered?: () => void;
  onFailedFinal?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [round, setRound] = useState(1);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<PracticeItem[]>([]);
  const [picks, setPicks] = useState<Record<number, "A" | "B" | "C" | "D">>({});
  const [submitted, setSubmitted] = useState(false);
  const [previousWrong, setPreviousWrong] = useState<string[]>([]);
  const [kpId, setKpId] = useState<string | null>(null);
  const [kpLabel, setKpLabel] = useState<string>(fallbackKnowledgePointLabel ?? "阅读理解");
  const [kpStrategy, setKpStrategy] = useState<string>("");
  const [kpPitfall, setKpPitfall] = useState<string>("");
  const [phase, setPhase] = useState<"idle" | "answering" | "passed" | "failed-continue" | "failed-final">("idle");

  // Pre-fetch knowledge point context once
  useEffect(() => {
    (async () => {
      const tag = await getQuestionExamTag(module, sourceQuestionId);
      if (tag?.knowledge_point_id) {
        setKpId(tag.knowledge_point_id);
        const { data: kp } = await supabase
          .from("gaokao_reading_knowledge_points")
          .select("level3, category_name, strategy, pitfall")
          .eq("id", tag.knowledge_point_id)
          .maybeSingle();
        if (kp) {
          setKpLabel(`${kp.category_name} · ${kp.level3}`);
          setKpStrategy(kp.strategy ?? "");
          setKpPitfall(kp.pitfall ?? "");
        }
      } else if (tag?.knowledge_point_label) {
        setKpLabel(tag.knowledge_point_label);
      }
    })();
  }, [module, sourceQuestionId]);

  async function fetchRound(currentRound: number) {
    setLoading(true);
    setItems([]);
    setPicks({});
    setSubmitted(false);
    try {
      const { data, error } = await supabase.functions.invoke("generate-practice-questions", {
        body: {
          knowledge_point_label: kpLabel,
          knowledge_point_strategy: kpStrategy,
          knowledge_point_pitfall: kpPitfall,
          source_question: sourceQuestionStem,
          user_wrong_option: userWrongOption ?? "",
          round: currentRound,
          previous_wrong: previousWrong,
        },
      });
      if (error) throw error;
      const list: PracticeItem[] = Array.isArray(data?.items) ? data.items : [];
      if (list.length === 0) throw new Error("AI 未生成题目，请稍后重试");
      setItems(list);
      setRound(currentRound);
      setPhase("answering");
    } catch (e: any) {
      toast.error(e?.message || "出题失败");
    } finally {
      setLoading(false);
    }
  }

  function handleStart() {
    setOpen(true);
    setPreviousWrong([]);
    fetchRound(1);
  }

  async function handleSubmit() {
    if (Object.keys(picks).length !== items.length) {
      toast.error("请把 3 道题都作答完");
      return;
    }
    setSubmitted(true);
    const wrongSnippets: string[] = [];
    let correctNum = 0;
    items.forEach((it, i) => {
      if (picks[i] === it.correct) correctNum++;
      else wrongSnippets.push(`${it.stem.slice(0, 60)} → 学生选了 ${picks[i]} (${it.options[picks[i]] || ""})`);
    });
    const passed = correctNum === items.length;
    const isFinal = round >= MAX_ROUNDS;

    // 记录到 mastery + 错题本
    if (kpId) {
      await recordKnowledgePointResult({
        knowledgePointId: kpId,
        knowledgePointLabel: kpLabel,
        passed,
        finalRound: round,
        isFinalRound: isFinal,
        sourceQuestionId,
        sourceQuestionStem,
        module,
      });
    }

    // Save practice set log
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("ai_practice_sets").insert({
        user_id: user.id,
        module,
        source_question_id: sourceQuestionId,
        knowledge_point_id: kpId,
        knowledge_point_label: kpLabel,
        round,
        questions: items as any,
        result: { picks, correctNum, total: items.length } as any,
        passed,
      });
    }

    if (passed) {
      setPhase("passed");
      toast.success(`🎉 ${round === 1 ? "首轮" : `第 ${round} 轮`}全对！考点已掌握`);
      onMastered?.();
    } else if (isFinal) {
      setPhase("failed-final");
      toast.message("已练满 3 轮 — 已加入错题本，明天复习", { description: "别担心，明天再来一次会更扎实" });
      onFailedFinal?.();
    } else {
      setPhase("failed-continue");
      setPreviousWrong((prev) => [...prev, ...wrongSnippets].slice(-12));
    }
  }

  function handleNextRound() {
    fetchRound(round + 1);
  }

  if (!open) {
    return (
      <button
        onClick={handleStart}
        className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/5 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-500/10 transition-colors"
      >
        <Sparkles className="size-3.5" />
        我还是不懂，给我练 3 题
      </button>
    );
  }

  return (
    <div className="mt-3 rounded-2xl border-2 border-rose-500/30 bg-gradient-to-b from-rose-500/5 to-transparent p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-bold text-rose-700">
          <Sparkles className="size-4" />
          AI 强化训练 · 第 {round} / {MAX_ROUNDS} 轮
        </div>
        <span className="text-[11px] text-muted-foreground">考点：{kpLabel}</span>
      </div>

      {loading && (
        <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> 小月正在为你出 3 道针对性练习题…
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="space-y-4">
          {items.map((it, i) => {
            const picked = picks[i];
            const isRight = submitted && picked === it.correct;
            const isWrong = submitted && picked && picked !== it.correct;
            return (
              <div key={i} className="rounded-xl border bg-card p-3">
                <div className="mb-2 text-[11px] font-mono text-muted-foreground">小题 {i + 1}</div>
                {it.passage && (
                  <div className="mb-2 rounded-md bg-muted/40 p-2 text-xs leading-relaxed">{it.passage}</div>
                )}
                <div className="mb-2 text-sm font-semibold">{it.stem}</div>
                <div className="grid gap-1.5">
                  {(["A", "B", "C", "D"] as const).map((k) => {
                    const isCorrect = submitted && k === it.correct;
                    const isPickedWrong = submitted && k === picked && k !== it.correct;
                    return (
                      <button
                        key={k}
                        disabled={submitted}
                        onClick={() => setPicks((p) => ({ ...p, [i]: k }))}
                        className={cn(
                          "rounded-lg border px-3 py-1.5 text-left text-xs transition-colors",
                          picked === k && !submitted && "border-primary bg-primary/10",
                          picked !== k && !submitted && "hover:bg-accent",
                          isCorrect && "border-emerald-500 bg-emerald-500/10 text-emerald-700",
                          isPickedWrong && "border-rose-500 bg-rose-500/10 text-rose-700",
                        )}
                      >
                        <span className="mr-1.5 font-bold">{k}.</span>
                        {it.options[k]}
                      </button>
                    );
                  })}
                </div>
                {submitted && (
                  <div className={cn("mt-2 rounded-md p-2 text-xs", isRight ? "bg-emerald-500/10 text-emerald-800" : "bg-rose-500/10 text-rose-800")}>
                    <div className="flex items-center gap-1 font-bold">
                      {isRight ? <CheckCircle2 className="size-3.5" /> : <XCircle className="size-3.5" />}
                      {isRight ? "正确" : `正确答案：${it.correct}`}
                    </div>
                    <div className="mt-1 leading-relaxed">{it.explanation}</div>
                    {it.trap && <div className="mt-1 text-[11px] text-muted-foreground">⚠️ 陷阱：{it.trap}</div>}
                  </div>
                )}
              </div>
            );
          })}

          {!submitted && (
            <button
              onClick={handleSubmit}
              className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90"
            >
              交卷
            </button>
          )}

          {phase === "passed" && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-center text-sm font-bold text-emerald-700">
              🎉 全对！这个考点已掌握
            </div>
          )}

          {phase === "failed-continue" && (
            <div className="flex flex-col gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
              <div className="text-sm font-bold text-amber-800">还有错的 — 要不要再练 3 道？</div>
              <div className="text-xs text-amber-700/80">第 {round + 1} 轮会针对你刚才的错项调整难度。</div>
              <div className="flex gap-2 mt-1">
                <button
                  onClick={handleNextRound}
                  className="flex-1 rounded-lg bg-amber-500 px-3 py-2 text-xs font-bold text-white hover:bg-amber-600"
                >
                  <RefreshCw className="mr-1 inline size-3.5" /> 再练 3 道
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-lg border px-3 py-2 text-xs font-semibold"
                >
                  下次再说
                </button>
              </div>
            </div>
          )}

          {phase === "failed-final" && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm">
              <div className="font-bold text-rose-800">已练满 {MAX_ROUNDS} 轮</div>
              <div className="mt-1 text-rose-700/80 text-xs leading-relaxed">
                这个考点已加入<b>错题本</b>，明天会出现在你的"待巩固"列表里。今天先休息一下，大脑需要时间消化。
              </div>
              <a href="/mistakes" className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-rose-700 underline">
                <BookOpen className="size-3.5" /> 去错题本看看
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}