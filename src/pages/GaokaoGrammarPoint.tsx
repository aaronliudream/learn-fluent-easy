import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { recordAttempt, bumpMastery } from "@/lib/gaokaoMastery";

type Point = { id: string; title: string; explanation: string };
type Question = {
  id: string;
  stem: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string;
};

export default function GaokaoGrammarPoint() {
  const { slug } = useParams<{ slug: string }>();
  const [point, setPoint] = useState<Point | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [showExp, setShowExp] = useState(false);
  const [stats, setStats] = useState({ correct: 0, wrong: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const { data: pt } = await supabase
        .from("gaokao_grammar_points")
        .select("id, title, explanation")
        .eq("slug", slug)
        .maybeSingle();
      if (!pt) { setLoading(false); return; }
      setPoint(pt);
      const { data: qs } = await supabase
        .from("gaokao_grammar_questions")
        .select("*")
        .eq("point_id", pt.id);
      setQuestions((qs ?? []) as Question[]);
      setLoading(false);
    })();
  }, [slug]);

  const q = questions[idx];
  const options = useMemo(() => q ? [
    ["A", q.option_a], ["B", q.option_b], ["C", q.option_c], ["D", q.option_d],
  ] as const : [], [q]);

  const onPick = async (letter: string) => {
    if (picked) return;
    setPicked(letter);
    setShowExp(true);
    const isCorrect = letter === q.correct_answer;
    setStats((s) => ({
      correct: s.correct + (isCorrect ? 1 : 0),
      wrong: s.wrong + (isCorrect ? 0 : 1),
    }));
    await recordAttempt({ questionType: "grammar", questionId: q.id, userAnswer: letter, isCorrect });
    if (point) await bumpMastery({ itemType: "grammar_point", itemId: point.id, isCorrect });
  };

  const next = () => {
    setPicked(null);
    setShowExp(false);
    setIdx((i) => i + 1);
  };

  const reset = () => {
    setIdx(0); setPicked(null); setShowExp(false); setStats({ correct: 0, wrong: 0 });
  };

  if (loading) return <p className="p-8 text-sm text-muted-foreground">加载中...</p>;
  if (!point) return <p className="p-8">考点不存在。<Link to="/gaokao/grammar" className="text-primary underline">返回</Link></p>;

  const finished = idx >= questions.length;

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-8">
      <Link to="/gaokao/grammar" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> 返回语法列表
      </Link>
      <PageHeader title={point.title} hideReviewBanner />

      <section className="mb-6 rounded-2xl border bg-card p-5">
        <div className="mb-2 text-xs font-bold uppercase tracking-wider text-primary">知识点讲解</div>
        <article className="prose prose-sm max-w-none dark:prose-invert">
          <ReactMarkdown>{point.explanation}</ReactMarkdown>
        </article>
      </section>

      <section className="rounded-2xl border bg-card p-5">
        <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>题目 {Math.min(idx + 1, questions.length)} / {questions.length}</span>
          <span>✓ {stats.correct} · ✗ {stats.wrong}</span>
        </div>

        {finished ? (
          <div className="py-8 text-center">
            <div className="text-lg font-bold">本考点已完成 🎉</div>
            <div className="mt-2 text-sm text-muted-foreground">
              正确率 {questions.length ? Math.round((stats.correct / questions.length) * 100) : 0}%
            </div>
            <div className="mt-4 flex justify-center gap-3">
              <Button variant="outline" onClick={reset}><RotateCcw className="mr-1 size-4" /> 再练一遍</Button>
              <Button asChild><Link to="/gaokao/grammar">下一个考点</Link></Button>
            </div>
          </div>
        ) : q ? (
          <>
            <p className="mb-4 text-base font-medium leading-relaxed">{q.stem}</p>
            <div className="space-y-2">
              {options.map(([letter, text]) => {
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
                    onClick={() => onPick(letter)}
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

            {showExp && (
              <div className="mt-4 rounded-xl bg-muted/50 p-4 text-sm">
                <div className="mb-1 font-bold">
                  {picked === q.correct_answer ? "✓ 正确" : `✗ 正确答案: ${q.correct_answer}`}
                </div>
                <p className="text-muted-foreground">{q.explanation}</p>
                <Button onClick={next} className="mt-3 w-full">
                  {idx === questions.length - 1 ? "完成" : "下一题"}
                </Button>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">该考点暂无题目。</p>
        )}
      </section>
    </main>
  );
}