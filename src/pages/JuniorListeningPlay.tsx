import { useEffect, useState } from "react";
import BackLink from "@/components/BackLink";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Volume2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { speak } from "@/lib/speak";
import { awardForCorrect, notifyWrong, awardForBlock } from "@/lib/coins";
import { bumpPetSkill } from "@/lib/petSkills";

type Q = { q: string; options: string[]; answer: string; explanation?: string };
type E = { id: string; title: string; transcript: string; translation_cn: string | null; questions: Q[]; key_vocab: { word: string; cn: string }[]; audio_url: string | null };

export default function JuniorListeningPlay() {
  const { id } = useParams<{ id: string }>();
  const [e, setE] = useState<E | null>(null);
  const [picks, setPicks] = useState<Record<number, string>>({});
  const [showScript, setShowScript] = useState(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (!id) return;
    (supabase as any).from("junior_listening_exercises")
      .select("id,title,transcript,translation_cn,questions,key_vocab,audio_url")
      .eq("id", id).maybeSingle().then(({ data }: any) => setE(data as any));
  }, [id]);

  const playAudio = () => {
    if (!e) return;
    if (e.audio_url) {
      const a = new Audio(e.audio_url); a.play().catch(() => speak(e.transcript));
    } else {
      speak(e.transcript);
    }
  };

  const pick = async (idx: number, letter: string) => {
    if (picks[idx]) return;
    setPicks(p => ({ ...p, [idx]: letter }));
    const ok = letter === e!.questions[idx].answer;
    const { data: u } = await supabase.auth.getUser();
    if (u?.user) {
      await (supabase as any).from("junior_listening_attempts").insert({
        user_id: u.user.id, exercise_id: id!, question_idx: idx,
        user_answer: letter, is_correct: ok,
      });
    }
    if (ok) {
      const next = streak + 1; setStreak(next);
      await awardForCorrect(next, "junior_listening");
      await bumpPetSkill("listener_ear", 1);
      const correctCount = Object.entries(picks).filter(([i, l]) => l === e!.questions[Number(i)].answer).length + 1;
      if (correctCount % 5 === 0) await awardForBlock("junior_listening");
    } else { setStreak(0); notifyWrong(); }
  };

  if (!e) return <main className="grid min-h-screen place-items-center text-sm text-muted-foreground">加载中…</main>;

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-6">
      <BackLink to="/junior/listening" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> 返回</BackLink>
      <h1 className="text-grad-title text-2xl font-extrabold">{e.title}</h1>

      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border bg-card p-4">
        <button onClick={playAudio} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 px-4 py-2 text-sm font-extrabold text-white shadow-tile">
          <Volume2 className="size-4" /> 播放
        </button>
        <button onClick={() => setShowScript(s => !s)} className="rounded-full border-2 border-border px-3 py-1.5 text-xs font-bold">
          {showScript ? "隐藏原文" : "查看原文"}
        </button>
        <span className="text-[11px] text-muted-foreground">建议先听 2 遍再答题</span>
      </div>
      {showScript && (
        <div className="mt-3 rounded-2xl bg-muted/40 p-4 text-sm leading-relaxed">
          <div className="whitespace-pre-wrap">{e.transcript}</div>
          {e.translation_cn && <div className="mt-2 text-xs text-muted-foreground whitespace-pre-wrap">{e.translation_cn}</div>}
        </div>
      )}
      {e.key_vocab?.length > 0 && (
        <div className="mt-4 rounded-xl bg-muted/40 p-3">
          <div className="text-[11px] font-extrabold text-muted-foreground">📚 核心词</div>
          <div className="mt-1 flex flex-wrap gap-2 text-xs">
            {e.key_vocab.map((v, i) => <span key={i} className="rounded-full bg-card px-2 py-0.5 border">{v.word} · {v.cn}</span>)}
          </div>
        </div>
      )}

      <h2 className="mt-6 mb-3 text-base font-extrabold">📝 听力理解</h2>
      <div className="space-y-4">
        {e.questions.map((q, i) => {
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
                        !picked && "border-border hover:border-sky-400",
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
      <div className="mt-8 flex flex-wrap items-center justify-center gap-2 border-t pt-5">
        <BackLink to="/junior/listening" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-extrabold text-primary-foreground shadow"><ArrowLeft className="size-4" /> 返回听力列表</BackLink>
        <Link to="/junior" className="inline-flex items-center gap-1 rounded-full border-2 px-4 py-2 text-sm font-bold hover:bg-muted">🏫 初中首页</Link>
        <Link to="/pets" className="inline-flex items-center gap-1 rounded-full border-2 px-4 py-2 text-sm font-bold hover:bg-muted">🐾 宠物</Link>
      </div>
    </main>
  );
}