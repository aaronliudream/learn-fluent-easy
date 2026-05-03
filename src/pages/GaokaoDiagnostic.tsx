import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { recordAttempt } from "@/lib/gaokaoMastery";
import { awardForCorrect, notifyWrong, awardForBlock } from "@/lib/coins";

type Q = {
  id: string;
  point_id: string;
  point_title?: string;
  stem: string;
  option_a: string; option_b: string; option_c: string; option_d: string;
  correct_answer: string;
  explanation: string;
};

export default function GaokaoDiagnostic() {
  const [questions, setQuestions] = useState<Q[]>([]);
  const [idx, setIdx] = useState(0);
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("gaokao_grammar_questions")
        .select("id, point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, gaokao_grammar_points(title)")
        .limit(10);
      const arr = (data ?? []).map((r: any) => ({
        ...r, point_title: r.gaokao_grammar_points?.title,
      })) as Q[];
      // shuffle
      arr.sort(() => Math.random() - 0.5);
      setQuestions(arr);
      setLoading(false);
    })();
  }, []);

  const q = questions[idx];

  const pick = async (letter: string) => {
    if (!q || picks[q.id]) return;
    setPicks((p) => ({ ...p, [q.id]: letter }));
    const ok = letter === q.correct_answer;
    if (ok) {
      const correctSoFar = Object.entries(picks).filter(([qid, l]) => {
        const qq = questions.find(x => x.id === qid);
        return qq && l === qq.correct_answer;
      }).length + 1;
      await awardForCorrect(correctSoFar, "gaokao_diagnostic");
      if (correctSoFar % 5 === 0) await awardForBlock("gaokao_diagnostic");
    } else {
      notifyWrong();
    }
    await recordAttempt({
      questionType: "grammar",
      questionId: q.id,
      userAnswer: letter,
      isCorrect: ok,
    });
    setTimeout(() => {
      if (idx + 1 >= questions.length) setDone(true);
      else setIdx(idx + 1);
    }, 800);
  };

  if (loading) return <p className="p-8 text-sm text-muted-foreground">加载中...</p>;

  if (done) {
    const correctByPoint: Record<string, { correct: number; total: number; title: string }> = {};
    for (const q of questions) {
      const key = q.point_id;
      if (!correctByPoint[key]) correctByPoint[key] = { correct: 0, total: 0, title: q.point_title || "未知" };
      correctByPoint[key].total += 1;
      if (picks[q.id] === q.correct_answer) correctByPoint[key].correct += 1;
    }
    const correctTotal = Object.values(correctByPoint).reduce((a, b) => a + b.correct, 0);
    const weakest = Object.values(correctByPoint).sort((a, b) => a.correct / a.total - b.correct / b.total).slice(0, 3);

    return (
      <main className="mx-auto min-h-screen max-w-2xl px-5 py-8">
        <PageHeader title="诊断报告" hideReviewBanner />
        <section className="mb-6 rounded-2xl border bg-card p-6 text-center">
          <Activity className="mx-auto size-10 text-emerald-500" />
          <div className="mt-3 text-3xl font-extrabold">{correctTotal} / {questions.length}</div>
          <div className="mt-1 text-sm text-muted-foreground">本次诊断正确率</div>
        </section>

        <section className="mb-6 rounded-2xl border bg-card p-5">
          <h2 className="mb-3 font-bold">薄弱考点（建议优先复习）</h2>
          <ul className="space-y-2">
            {weakest.map((w) => (
              <li key={w.title} className="flex items-center justify-between rounded-lg bg-muted/50 p-3 text-sm">
                <span>{w.title}</span>
                <span className="text-xs text-muted-foreground">{w.correct} / {w.total}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="flex gap-3">
          <Button asChild className="flex-1"><Link to="/gaokao/grammar">去攻克薄弱点</Link></Button>
          <Button asChild variant="outline" className="flex-1"><Link to="/gaokao">返回</Link></Button>
        </div>
      </main>
    );
  }

  if (!q) return <p className="p-8 text-sm text-muted-foreground">暂无诊断题目。</p>;

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-8">
      <Link to="/gaokao" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> 返回
      </Link>
      <PageHeader hideReviewBanner title="水平诊断" subtitle={`第 ${idx + 1} / ${questions.length} 题`} />

      <section className="rounded-2xl border bg-card p-5">
        <p className="mb-4 font-medium">{q.stem}</p>
        <div className="space-y-2">
          {(["A", "B", "C", "D"] as const).map((letter) => {
            const text = (q as any)[`option_${letter.toLowerCase()}`];
            const picked = picks[q.id];
            const isAnswer = q.correct_answer === letter;
            const isPicked = picked === letter;
            let cls = "border-border hover:border-primary/40";
            if (picked) {
              if (isAnswer) cls = "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30";
              else if (isPicked) cls = "border-rose-500 bg-rose-50 dark:bg-rose-950/30";
              else cls = "opacity-60";
            }
            return (
              <button
                key={letter}
                onClick={() => pick(letter)}
                disabled={!!picks[q.id]}
                className={`flex w-full items-start gap-3 rounded-xl border-2 p-3 text-left text-sm transition ${cls}`}
              >
                <span className="font-bold">{letter}.</span>
                <span className="flex-1">{text}</span>
              </button>
            );
          })}
        </div>
      </section>
    </main>
  );
}