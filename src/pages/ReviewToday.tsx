import { T } from "@/i18n/T";import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Check, X, Trophy, ArrowRight, Volume2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { speak as speakTTS, stopSpeaking } from "@/lib/speak";
import { getAlexVoice } from "@/lib/alexVoice";
import { bumpMistakeCorrect } from "@/lib/mistakeStreak";
import { toast } from "sonner";

type Mistake = {
  id: string;
  module: string;
  source_key: string;
  source_label: string | null;
  question: string;
  user_answer: string | null;
  correct_answer: string | null;
  explanation: string | null;
  snapshot: any;
  wrong_count: number;
  next_review_at: string;
};

// Simple FSRS-lite: correct → push out (3 / 7 / 14 / 30 days based on streak by wrong_count).
// Wrong → reset to tomorrow + bump wrong_count.
function nextReviewOnCorrect(wrong_count: number): string {
  const days = wrong_count >= 4 ? 3 : wrong_count >= 2 ? 7 : 14;
  return new Date(Date.now() + days * 86_400_000).toISOString();
}
function nextReviewOnWrong(): string {
  return new Date(Date.now() + 1 * 86_400_000).toISOString();
}

export default function ReviewToday() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [queue, setQueue] = useState<Mistake[]>([]);
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!user) {nav("/auth");return;}
      const nowIso = new Date().toISOString();
      const { data, error } = await supabase.
      from("user_mistakes").
      select("*").
      eq("is_resolved", false).
      lte("next_review_at", nowIso).
      order("next_review_at", { ascending: true }).
      limit(50);
      if (cancelled) return;
      if (error) toast.error(error.message);
      setQueue(data as Mistake[] || []);
      setLoading(false);
    })();
    return () => {cancelled = true;stopSpeaking();};
  }, [nav]);

  const cur = queue[idx];
  const total = queue.length;
  const done = idx >= total;

  const playable = useMemo(() => {
    if (!cur) return "";
    return cur.snapshot?.alex_used_sentence || cur.snapshot?.example_en || cur.snapshot?.source_sentence || cur.correct_answer || "";
  }, [cur]);

  const onPlay = async () => {
    if (!playable) return;
    try {await speakTTS(playable, { voiceId: getAlexVoice() });} catch {/* noop */}
  };

  const grade = async (isCorrect: boolean) => {
    if (!cur) return;
    if (isCorrect) {
      setCorrect((n) => n + 1);
      // 只推后复习时间;是否移出由跨3天连对规则决定(唯一移出途径)。
      await supabase.
      from("user_mistakes").
      update({
        next_review_at: nextReviewOnCorrect(cur.wrong_count)
      }).
      eq("id", cur.id);
      await bumpMistakeCorrect(cur.module, cur.source_key);
      try {
        const c = await import("@/lib/coins");
        await c.awardCoins(2, "mistake_review_correct");
      } catch {/* noop */}
    } else {
      setWrong((n) => n + 1);
      await supabase.
      from("user_mistakes").
      update({
        wrong_count: (cur.wrong_count || 1) + 1,
        last_wrong_at: new Date().toISOString(),
        correct_streak: 0,        // 做错 → 连对清零
        last_correct_date: null,
        next_review_at: nextReviewOnWrong()
      }).
      eq("id", cur.id);
    }
    setRevealed(false);
    setIdx((i) => i + 1);
  };

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 py-8 md:px-8 md:py-12">
      <PageHeader title="⏰ 今日复习" subtitle="按记忆曲线刷掉到期错题" back="/mistakes" />

      {loading &&
      <div className="mt-12 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> <T>加载中…</T>
        </div>
      }

      {!loading && total === 0 &&
      <div className="mt-10 rounded-3xl border border-dashed border-border bg-card/50 p-10 text-center">
          <div className="mx-auto mb-3 grid size-14 place-items-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300">
            <Trophy className="size-7" />
          </div>
          <p className="text-base font-semibold"><T>今天没有要复习的，干得好！</T></p>
          <Link to="/mistakes" className="mt-5 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground"><T>回到错题本</T></Link>
        </div>
      }

      {!loading && total > 0 && !done && cur &&
      <>
          <div className="mb-3 flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>{idx + 1} / {total}</span>
            <span>✓ {correct} · ✕ {wrong}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-gradient-to-r from-primary to-emerald-500 transition-all" style={{ width: `${Math.round(idx / total * 100)}%` }} />
          </div>

          <div className="mt-5 rounded-3xl border border-border bg-card p-5 shadow-sm">
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              {cur.module}{cur.source_label ? ` · ${cur.source_label}` : ""}
            </div>
            <div className="mt-2 text-xl font-extrabold leading-snug">{cur.question}</div>
            {playable &&
          <button onClick={onPlay} className="mt-3 inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground/80">
                <Volume2 className="size-3.5" /> <T>朗读</T>
              </button>
          }

            {!revealed ?
          <button
            onClick={() => setRevealed(true)}
            className="mt-5 w-full rounded-xl border border-dashed border-primary/40 bg-primary/5 py-3 text-sm font-semibold text-primary hover:bg-primary/10">
                <T>👆 先想一想，点这里看答案</T>
              
          </button> :

          <div className="mt-5 space-y-2">
                {cur.correct_answer &&
            <div className="rounded-xl border-l-4 border-emerald-500 bg-emerald-50 p-3 text-sm text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-300">
                    <div className="text-[10px] font-bold uppercase opacity-70"><T>✓ 正确答案</T></div>
                    <div className="mt-1 font-semibold">{cur.correct_answer}</div>
                  </div>
            }
                {cur.explanation &&
            <div className="rounded-xl bg-secondary/60 p-3 text-sm leading-relaxed text-foreground/80">💡 {cur.explanation}</div>
            }
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                onClick={() => grade(false)}
                className="inline-flex items-center justify-center gap-1 rounded-full bg-rose-500 px-4 py-3 text-sm font-bold text-white shadow hover:opacity-95">
                
                    <X className="size-4" /> <T>还不会</T>
                  </button>
                  <button
                onClick={() => grade(true)}
                className="inline-flex items-center justify-center gap-1 rounded-full bg-emerald-500 px-4 py-3 text-sm font-bold text-white shadow hover:opacity-95">
                
                    <Check className="size-4" /> <T>我会了</T>
                  </button>
                </div>
              </div>
          }
          </div>
        </>
      }

      {!loading && done && total > 0 &&
      <div className="mt-10 rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto mb-3 grid size-14 place-items-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300">
            <Trophy className="size-7" />
          </div>
          <div className="text-2xl font-extrabold"><T>复习完成 🎉</T></div>
          <div className="mt-1 text-sm text-muted-foreground"><T>答对</T> {correct} <T>题 · 答错</T> {wrong} <T>题</T></div>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/mistakes" className="rounded-full bg-secondary px-5 py-2.5 text-sm font-bold"><T>回错题本</T></Link>
            <Link to="/dashboard" className="inline-flex items-center gap-1 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground">
              <T>学习中心</T> <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      }
    </main>);

}