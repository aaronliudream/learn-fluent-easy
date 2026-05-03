import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { awardForCorrect, notifyWrong, awardForBlock } from "@/lib/coins";

type Pt = { id: string; title: string; cefr: string; explanation_md: string };
type Q = { id: string; stem: string; option_a: string; option_b: string; option_c: string; option_d: string; correct_answer: string; explanation: string };

export default function JuniorGrammarPoint() {
  const { id } = useParams<{ id: string }>();
  const [pt, setPt] = useState<Pt | null>(null);
  const [qs, setQs] = useState<Q[]>([]);
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [streak, setStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const [a, b] = await Promise.all([
        supabase.from("junior_grammar_points").select("id,title,cefr,explanation_md").eq("id", id).maybeSingle(),
        supabase.from("junior_grammar_questions").select("*").eq("point_id", id).order("sort_order"),
      ]);
      setPt(a.data as Pt);
      setQs((b.data ?? []) as Q[]);
    })();
  }, [id]);

  const pick = async (q: Q, letter: string) => {
    if (picks[q.id]) return;
    setPicks(p => ({ ...p, [q.id]: letter }));
    const ok = letter === q.correct_answer;
    if (ok) {
      const next = streak + 1;
      setStreak(next);
      await awardForCorrect(next, "junior_grammar");
      const cc = correctCount + 1;
      setCorrectCount(cc);
      if (cc % 5 === 0) await awardForBlock("junior_grammar");
    } else { setStreak(0); notifyWrong(); }
  };

  if (!pt) return <main className="grid min-h-screen place-items-center text-sm text-muted-foreground">加载中…</main>;

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-6">
      <Link to="/junior/grammar" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> 返回考点列表
      </Link>
      <h1 className="text-grad-title text-2xl font-extrabold">{pt.title}</h1>
      <p className="mt-1 text-xs text-muted-foreground">CEFR {pt.cefr}</p>
      <article className="prose prose-sm mt-4 max-w-none rounded-2xl border bg-card p-5 dark:prose-invert">
        <ReactMarkdown>{pt.explanation_md}</ReactMarkdown>
      </article>
      <h2 className="mt-6 mb-3 text-base font-extrabold">📝 练一练 ({correctCount}/{qs.length})</h2>
      <div className="space-y-4">
        {qs.map((q, i) => {
          const picked = picks[q.id];
          return (
            <section key={q.id} className="rounded-2xl border bg-card p-4">
              <div className="text-sm font-bold">{i + 1}. {q.stem}</div>
              <div className="mt-3 grid gap-2">
                {(["A","B","C","D"] as const).map(L => {
                  const txt = (q as any)["option_" + L.toLowerCase()];
                  const isPicked = picked === L;
                  const isAns = picked && L === q.correct_answer;
                  const isWrong = picked && isPicked && L !== q.correct_answer;
                  return (
                    <button key={L} disabled={!!picked} onClick={() => pick(q, L)}
                      className={cn("rounded-xl border-2 px-3 py-2 text-left text-sm transition",
                        !picked && "border-border hover:border-indigo-400",
                        isAns && "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30",
                        isWrong && "border-rose-500 bg-rose-50 dark:bg-rose-950/30",
                        picked && !isAns && !isWrong && "opacity-60",
                      )}>
                      <span className="mr-2 font-extrabold">{L}.</span>{txt}
                    </button>
                  );
                })}
              </div>
              {picked && q.explanation && (
                <div className="mt-3 rounded-lg bg-muted/50 p-3 text-xs">💡 {q.explanation}</div>
              )}
            </section>
          );
        })}
      </div>
    </main>
  );
}