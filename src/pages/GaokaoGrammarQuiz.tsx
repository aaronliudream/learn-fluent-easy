import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import BackLink from "@/components/BackLink";

interface Question {
  id: string;
  stem: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string;
  source?: "original" | "ai_cache" | "ai_realtime";
}

interface QuizBundle {
  kpId: string;
  kpTitle: string;
  questions: Question[];
}

export default function GaokaoGrammarQuiz() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const { data: bundle, isLoading, error, refetch } = useQuery<QuizBundle>({
    queryKey: ["grammar-quiz", slug],
    enabled: !!slug,
    queryFn: async () => {
      if (!slug) throw new Error("NO_SLUG");

      const { data: kpData, error: kpErr } = await supabase
        .from("gaokao_grammar_points")
        .select("id, title")
        .eq("slug", slug)
        .maybeSingle();

      if (kpErr || !kpData) {
        throw new Error("KP_NOT_FOUND");
      }

      const kpId = kpData.id;
      const kpTitle = kpData.title;

      const { data: originalRaw } = await supabase
        .from("gaokao_grammar_questions")
        .select("id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation")
        .eq("point_id", kpId);

      const original: Question[] = (originalRaw || []).map((q) => ({
        id: q.id,
        stem: q.stem,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        source: "original" as const,
      }));

      const { data: cachedRaw } = await supabase
        .from("ai_generated_questions")
        .select("id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, used_count")
        .eq("kp_id", kpId)
        .lt("used_count", 5)
        .limit(5);

      const cached: Question[] = (cachedRaw || []).map((q) => ({
        id: q.id,
        stem: q.stem,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        source: "ai_cache" as const,
      }));

      const combined = [...original, ...cached];

      if (combined.length >= 1) {
        if (combined.length < 5) {
          supabase.functions
            .invoke("generate-question-for-kp", {
              body: { kp_id: kpId, count: 5 - combined.length },
            })
            .catch((e) => console.error("generate-question-for-kp prewarm failed:", e));
        }

        return { kpId, kpTitle, questions: combined };
      }

      const { data: gen, error: genErr } = await supabase.functions.invoke("generate-question-for-kp", {
        body: { kp_id: kpId, count: 3 },
      });

      if (genErr) throw new Error("AI_GENERATE_FAILED: " + genErr.message);

      const generated: Question[] = (gen?.questions || (gen?.question ? [gen.question] : [])).map((q: any) => ({
        id: q.id,
        stem: q.stem,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        source: "ai_realtime" as const,
      }));

      if (generated.length === 0) throw new Error("AI_RETURNED_EMPTY");

      return { kpId, kpTitle, questions: generated };
    },
    retry: false,
    staleTime: 60 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-4 px-5 py-8 text-center">
        <div className="text-5xl animate-pulse">🤖</div>
        <div>
          <h1 className="text-xl font-bold text-foreground">AI 正在为你出题…</h1>
          <p className="mt-2 text-sm text-muted-foreground">通常 5-10 秒</p>
        </div>
        <Progress value={62} className="h-2 max-w-xs" />
      </main>
    );
  }

  if (error) {
    const msg = (error as Error).message;
    let userFacing = "AI 出题失败，请重试";
    if (msg.includes("KP_NOT_FOUND")) userFacing = "考点不存在";
    if (msg.includes("AI_RETURNED_EMPTY")) userFacing = "AI 暂时无法为这个考点出题";

    return (
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-5 py-8">
        <Card className="p-6 text-center">
          <h1 className="text-xl font-bold text-foreground">{userFacing}</h1>
          <p className="mt-2 break-words text-sm text-muted-foreground">{msg}</p>
          <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
            <Button onClick={() => refetch()}>重试</Button>
            <Button variant="outline" onClick={() => navigate("/gaokao/grammar")}>返回语法地图</Button>
          </div>
        </Card>
      </main>
    );
  }

  if (!bundle || !bundle.questions || bundle.questions.length === 0) {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-5 py-8">
        <Card className="p-6 text-center">
          <h1 className="text-xl font-bold text-foreground">无可用题目</h1>
          <Button className="mt-6" onClick={() => navigate("/gaokao/grammar")}>返回语法地图</Button>
        </Card>
      </main>
    );
  }

  const q = bundle.questions[currentIdx];
  const isCorrect = selectedAnswer === q.correct_answer;
  const aiBadge = q.source === "ai_realtime" || q.source === "ai_cache";

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 py-5 pb-24 sm:px-5 sm:py-8">
      <BackLink to="/gaokao/grammar" className="mb-4 inline-flex text-sm text-muted-foreground hover:text-foreground">
        返回语法地图
      </BackLink>

      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold text-foreground">{bundle.kpTitle}</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            第 {currentIdx + 1} / {bundle.questions.length} 题
          </p>
        </div>
        {aiBadge && (
          <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            🤖 AI 实时生成
          </span>
        )}
      </div>

      <Progress value={((currentIdx + 1) / bundle.questions.length) * 100} className="mb-5 h-2" />

      <Card className="p-5 sm:p-6">
        <p className="mb-5 whitespace-pre-wrap text-base font-medium leading-relaxed text-foreground sm:text-lg">{q.stem}</p>

        <div className="space-y-3">
          {(["a", "b", "c", "d"] as const).map((letter) => {
            const upper = letter.toUpperCase();
            const text = q[`option_${letter}` as keyof Question] as string;
            const isSelected = selectedAnswer === upper;
            const isRevealed = showExplanation;
            const isThisCorrect = q.correct_answer === upper;

            let className = "w-full rounded-lg border p-3 text-left text-sm transition-colors sm:text-base ";
            if (isRevealed) {
              if (isThisCorrect) className += "border-green-500 bg-green-50 text-green-950";
              else if (isSelected) className += "border-red-500 bg-red-50 text-red-950";
              else className += "border-border text-foreground opacity-70";
            } else {
              className += isSelected ? "border-primary bg-primary/5 text-foreground" : "border-border text-foreground hover:bg-muted/50";
            }

            return (
              <button
                key={upper}
                className={className}
                onClick={() => !showExplanation && setSelectedAnswer(upper)}
                disabled={showExplanation}
              >
                <span className="mr-2 font-bold">{upper}.</span>
                {text}
              </button>
            );
          })}
        </div>

        {showExplanation && (
          <div className="mt-5 rounded-lg border border-border bg-muted/40 p-4">
            <div className={`mb-2 font-bold ${isCorrect ? "text-green-600" : "text-red-600"}`}>
              {isCorrect ? "✓ 答对了" : `✗ 正确答案是 ${q.correct_answer}`}
            </div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{q.explanation}</p>
          </div>
        )}
      </Card>

      <div className="mt-5 flex items-center justify-end gap-2">
        {!showExplanation ? (
          <Button
            disabled={!selectedAnswer}
            onClick={() => {
              setShowExplanation(true);
              if (!isCorrect && q.id) {
                supabase.functions
                  .invoke("classify-mistake-cause", {
                    body: {
                      attempt_id: q.id,
                      question_text: q.stem,
                      correct_answer: q.correct_answer,
                      user_answer: selectedAnswer,
                      time_spent_seconds: 0,
                      kp_id: bundle.kpId,
                      skill_area: "grammar",
                    },
                  })
                  .catch((e) => console.error("classify-mistake-cause failed:", e));
              }
            }}
          >
            提交答案
          </Button>
        ) : currentIdx < bundle.questions.length - 1 ? (
          <Button
            onClick={() => {
              setCurrentIdx(currentIdx + 1);
              setSelectedAnswer(null);
              setShowExplanation(false);
            }}
          >
            下一题 →
          </Button>
        ) : (
          <Button onClick={() => navigate("/gaokao/grammar")}>返回考点地图</Button>
        )}
      </div>
    </main>
  );
}
