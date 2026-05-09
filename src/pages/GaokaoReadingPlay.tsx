import { useEffect, useRef, useState } from "react";
import BackLink from "@/components/BackLink";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { recordAttempt } from "@/lib/gaokaoMastery";
import { awardForCorrect, notifyWrong, awardForBlock } from "@/lib/coins";
import { bumpPetSkill } from "@/lib/petSkills";
import { celebrateScore } from "@/lib/feedback";
import { useRegisterAssistant } from "@/contexts/AIAssistantContext";

type Passage = { id: string; title: string; body: string; structure_analysis: string | null };
type Question = {
  id: string;
  stem: string;
  option_a: string; option_b: string; option_c: string; option_d: string;
  correct_answer: string;
  explanation_a: string | null; explanation_b: string | null; explanation_c: string | null; explanation_d: string | null;
  question_type: string;
};

const TYPE_LABEL: Record<string, string> = {
  main_idea: "主旨题", detail: "细节题", inference: "推断题", vocabulary: "词义题",
};

export default function GaokaoReadingPlay() {
  const { id } = useParams<{ id: string }>();
  const [passage, setPassage] = useState<Passage | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  // Full-test lock: AI may only discuss the reading once every question is answered.
  const allAnswered = questions.length > 0 && questions.every((q) => picks[q.id]);
  useRegisterAssistant(
    passage
      ? {
          context: "gaokao_reading",
          ref: passage.id,
          topic: `高考阅读 · ${passage.title}`,
          mode: "full-test",
          unlocked: allAnswered,
          lockedHint: "请先做完本篇所有阅读题再来找我哦，避免提前看到答案 ✨",
          pageTitle: "💬 小月 · 阅读复盘",
          snapshot: allAnswered
            ? {
                title: passage.title,
                passage_excerpt: passage.body.slice(0, 1200),
                questions: questions.map((q) => ({
                  id: q.id,
                  type: q.question_type,
                  stem: q.stem,
                  options: { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d },
                  correct_answer: q.correct_answer,
                  user_answer: picks[q.id],
                  is_correct: picks[q.id] === q.correct_answer,
                })),
              }
            : undefined,
        }
      : null,
  );

  useEffect(() => {
    if (!id) return;
    (async () => {
      const [{ data: p }, { data: qs }] = await Promise.all([
        supabase.from("gaokao_reading_passages").select("id, title, body, structure_analysis").eq("id", id).maybeSingle(),
        supabase.from("gaokao_reading_questions").select("*").eq("passage_id", id).order("sort_order"),
      ]);
      setPassage(p);
      setQuestions((qs ?? []) as Question[]);
      setLoading(false);
    })();
  }, [id]);

  const qStartRef = useRef<Record<string, number>>({});
  const celebratedRef = useRef(false);
  useEffect(() => {
    if (celebratedRef.current) return;
    if (questions.length === 0) return;
    const answered = questions.filter((q) => picks[q.id]).length;
    if (answered < questions.length) return;
    celebratedRef.current = true;
    const correct = questions.filter((q) => picks[q.id] === q.correct_answer).length;
    celebrateScore(Math.round((correct / questions.length) * 100));
  }, [picks, questions]);
  const onPick = async (q: Question, letter: string) => {
    if (picks[q.id]) return;
    const ms = Date.now() - (qStartRef.current[q.id] ?? Date.now());
    qStartRef.current[q.id] = Date.now();
    setPicks((prev) => ({ ...prev, [q.id]: letter }));
    const ok = letter === q.correct_answer;
    if (ok) {
      const next = streak + 1;
      setStreak(next);
      await awardForCorrect(next, "gaokao_reading", q.id, "gaokao_reading", ms);
      await bumpPetSkill("reading_owl", 1);
      const cc = correctCount + 1;
      setCorrectCount(cc);
      if (cc % 5 === 0) await awardForBlock("gaokao_reading");
    } else {
      setStreak(0);
      notifyWrong();
    }
    await recordAttempt({
      questionType: "reading",
      questionId: q.id,
      userAnswer: letter,
      isCorrect: ok,
    });
  };

  if (loading) return <p className="p-8 text-sm text-muted-foreground">加载中...</p>;
  if (!passage) return <p className="p-8">文章不存在。<BackLink to="/gaokao/reading" className="text-primary underline">返回</BackLink></p>;

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-8">
      <BackLink to="/gaokao/reading" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> 返回阅读列表
      </BackLink>
      <PageHeader title={passage.title} hideReviewBanner />

      <article className="mb-6 rounded-2xl border bg-card p-5 text-sm leading-relaxed">
        {passage.body.split("\n\n").map((para, i) => (
          <p key={i} className="mb-3 last:mb-0">{para}</p>
        ))}
      </article>

      {passage.structure_analysis && (
        <details className="mb-6 rounded-2xl border bg-muted/30 p-4" onToggle={(e) => setShowAnalysis((e.target as HTMLDetailsElement).open)}>
          <summary className="cursor-pointer text-sm font-bold text-primary">
            {showAnalysis ? "收起" : "展开"}文章结构分析
          </summary>
          <div className="prose prose-sm mt-3 max-w-none dark:prose-invert">
            <ReactMarkdown>{passage.structure_analysis}</ReactMarkdown>
          </div>
        </details>
      )}

      <div className="space-y-5">
        {questions.map((q, i) => {
          const picked = picks[q.id];
          const explanations: Record<string, string | null> = {
            A: q.explanation_a, B: q.explanation_b, C: q.explanation_c, D: q.explanation_d,
          };
          return (
            <section key={q.id} className="rounded-2xl border bg-card p-5">
              <div className="mb-2 flex items-center gap-2 text-xs">
                <span className="rounded-full bg-violet-500/10 px-2 py-0.5 font-semibold text-violet-600">
                  {TYPE_LABEL[q.question_type] ?? q.question_type}
                </span>
                <span className="text-muted-foreground">第 {i + 1} 题</span>
              </div>
              <p className="mb-3 font-medium">{q.stem}</p>
              <div className="space-y-2">
                {(["A", "B", "C", "D"] as const).map((letter) => {
                  const text = (q as any)[`option_${letter.toLowerCase()}`];
                  const isPicked = picked === letter;
                  const isAnswer = q.correct_answer === letter;
                  let cls = "border-border hover:border-primary/40";
                  if (picked) {
                    if (isAnswer) cls = "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30";
                    else if (isPicked) cls = "border-rose-500 bg-rose-50 dark:bg-rose-950/30";
                    else cls = "border-border opacity-60";
                  }
                  return (
                    <button
                      key={letter}
                      onClick={() => onPick(q, letter)}
                      disabled={!!picked}
                      className={`flex w-full items-start gap-3 rounded-xl border-2 p-3 text-left text-sm transition ${cls}`}
                    >
                      <span className="font-bold">{letter}.</span>
                      <span className="flex-1">{text}</span>
                      {picked && isAnswer && <CheckCircle2 className="size-5 text-emerald-600" />}
                      {picked && isPicked && !isAnswer && <XCircle className="size-5 text-rose-600" />}
                    </button>
                  );
                })}
              </div>

              {picked && (
                <div className="mt-3 space-y-2 rounded-xl bg-muted/50 p-4 text-xs">
                  <div className="font-bold">每个选项的讲解：</div>
                  {(["A", "B", "C", "D"] as const).map((l) => (
                    explanations[l] && (
                      <div key={l}><span className="font-semibold">{l}.</span> {explanations[l]}</div>
                    )
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-2 border-t pt-5">
        <Button asChild><BackLink to="/gaokao/reading">← 返回阅读列表</BackLink></Button>
        <Button asChild variant="outline"><Link to="/gaokao">🎓 高考首页</Link></Button>
        <Button asChild variant="outline"><Link to="/pets">🐾 宠物</Link></Button>
      </div>
    </main>
  );
}