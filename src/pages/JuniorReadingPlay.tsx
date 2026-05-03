import { useEffect, useState } from "react";
import BackLink from "@/components/BackLink";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { awardForCorrect, notifyWrong, awardForBlock } from "@/lib/coins";
import { bumpPetSkill } from "@/lib/petSkills";

type Q = { q: string; options: string[]; answer: string; explanation?: string };
type R = { id: string; title: string; body: string; questions: Q[]; vocab_notes: { word: string; cn: string }[] };

export default function JuniorReadingPlay() {
  const { id } = useParams<{ id: string }>();
  const [r, setR] = useState<R | null>(null);
  const [picks, setPicks] = useState<Record<number, string>>({});
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (!id) return;
    supabase.from("junior_reading").select("id,title,body,questions,vocab_notes").eq("id", id).maybeSingle().then(({ data }) => setR(data as any));
  }, [id]);

  const pick = async (idx: number, letter: string) => {
    if (picks[idx]) return;
    setPicks(p => ({ ...p, [idx]: letter }));
    const ok = letter === r!.questions[idx].answer;
    const { data: u } = await supabase.auth.getUser();
    if (u?.user) {
      await supabase.from("junior_reading_attempts").insert({
        user_id: u.user.id, reading_id: id!, question_idx: idx,
        user_answer: letter, is_correct: ok,
      });
    }
    if (ok) {
      const next = streak + 1;
      setStreak(next);
      await awardForCorrect(next, "junior_reading");
      await bumpPetSkill("reading_owl", 1);
      const correctCount = Object.entries(picks).filter(([i, l]) => l === r!.questions[Number(i)].answer).length + 1;
      if (correctCount % 5 === 0) await awardForBlock("junior_reading");
    } else { setStreak(0); notifyWrong(); }
  };

  if (!r) return <main className="grid min-h-screen place-items-center text-sm text-muted-foreground">加载中…</main>;

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-6">
      <BackLink to="/junior/reading" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> 返回</BackLink>
      <h1 className="text-grad-title text-2xl font-extrabold">{r.title}</h1>
      <article className="mt-4 rounded-2xl border bg-card p-5 text-sm leading-relaxed whitespace-pre-wrap">{r.body}</article>
      {r.vocab_notes?.length > 0 && (
        <div className="mt-4 rounded-xl bg-muted/40 p-3">
          <div className="text-[11px] font-extrabold text-muted-foreground">📚 词汇</div>
          <div className="mt-1 flex flex-wrap gap-2 text-xs">
            {r.vocab_notes.map((v, i) => <span key={i} className="rounded-full bg-card px-2 py-0.5 border">{v.word} · {v.cn}</span>)}
          </div>
        </div>
      )}
      <h2 className="mt-6 mb-3 text-base font-extrabold">📝 阅读理解</h2>
      <div className="space-y-4">
        {r.questions.map((q, i) => {
          const picked = picks[i];
          return (
            <section key={i} className="rounded-2xl border bg-card p-4">
              <div className="text-sm font-bold">{i + 1}. {q.q}</div>
              <div className="mt-3 grid gap-2">
                {q.options.map((opt, oi) => {
                  const L = ["A","B","C","D"][oi];
                  const isAns = picked && L === q.answer;
                  const isWrong = picked === L && L !== q.answer;
                  return (
                    <button key={L} disabled={!!picked} onClick={() => pick(i, L)}
                      className={cn("rounded-xl border-2 px-3 py-2 text-left text-sm transition",
                        !picked && "border-border hover:border-emerald-400",
                        isAns && "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30",
                        isWrong && "border-rose-500 bg-rose-50 dark:bg-rose-950/30",
                        picked && !isAns && !isWrong && "opacity-60")}>
                      <span className="mr-2 font-extrabold">{L}.</span>{opt}
                    </button>
                  );
                })}
              </div>
              {picked && q.explanation && <div className="mt-3 rounded-lg bg-muted/50 p-3 text-xs">💡 {q.explanation}</div>}
            </section>
          );
        })}
      </div>
      <BottomReturn to="/junior/reading" label="返回阅读列表" extra={[{to:"/junior",label:"🏫 初中首页"},{to:"/pets",label:"🐾 宠物"}]} />
    </main>
  );
}

function BottomReturn({ to, label, extra }: { to: string; label: string; extra?: { to: string; label: string }[] }) {
  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-2 border-t pt-5">
      <Link to={to} className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-extrabold text-primary-foreground shadow"><ArrowLeft className="size-4" />{label}</Link>
      {extra?.map(e => (
        <Link key={e.to} to={e.to} className="inline-flex items-center gap-1 rounded-full border-2 px-4 py-2 text-sm font-bold hover:bg-muted">{e.label}</Link>
      ))}
    </div>
  );
}