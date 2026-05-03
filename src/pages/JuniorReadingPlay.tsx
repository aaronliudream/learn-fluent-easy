import { useEffect, useMemo, useRef, useState } from "react";
import BackLink from "@/components/BackLink";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Lock, Clock, ShieldCheck, RotateCcw, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { awardForCorrect, notifyWrong, awardForBlock } from "@/lib/coins";
import { bumpPetSkill } from "@/lib/petSkills";
import NoCopyGuard from "@/components/NoCopyGuard";
import StarRating from "@/components/StarRating";
import { recordMastery, loadMastery, MasteryRow, PASS_PCT } from "@/lib/masteryProgress";
import ReadingWatermark from "@/components/ReadingWatermark";
import SegmentedReader from "@/components/SegmentedReader";
import { toast } from "sonner";

type Q = { q: string; options: string[]; answer: string; explanation?: string };
type R = { id: string; title: string; body: string; word_count: number | null; grade: number; questions: Q[]; vocab_notes: { word: string; cn: string }[] };
type ListItem = { id: string; title: string };

export default function JuniorReadingPlay() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const [r, setR] = useState<R | null>(null);
  const [list, setList] = useState<ListItem[]>([]);
  const [mastery, setMastery] = useState<Record<string, MasteryRow>>({});
  const [picks, setPicks] = useState<Record<number, string>>({});
  const [streak, setStreak] = useState(0);
  const [email, setEmail] = useState<string>("user");
  const [userId, setUserId] = useState<string | null>(null);
  const [allRevealed, setAllRevealed] = useState(false);
  const startRef = useRef<number>(Date.now());
  const [now, setNow] = useState(Date.now());
  const [submitted, setSubmitted] = useState(false);
  const [attempt, setAttempt] = useState(1);

  // 推荐阅读时长（秒）：单词数 / 1.8 词每秒（约100词/分钟），最少 30 秒
  const minSec = useMemo(() => Math.max(30, Math.round((r?.word_count ?? 150) / 1.8)), [r?.word_count]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data } = await supabase.from("junior_reading").select("id,title,body,word_count,grade,questions,vocab_notes").eq("id", id).maybeSingle();
      setR(data as any);
      const { data: u } = await supabase.auth.getUser();
      if (u?.user) {
        setUserId(u.user.id);
        setEmail(u.user.email ?? u.user.id.slice(0, 8));
        const { data: comps } = await supabase
          .from("junior_reading_completions")
          .select("reading_id").eq("user_id", u.user.id).eq("perfect", true);
        setCompletedSet(new Set((comps ?? []).map((c: any) => c.reading_id)));
      }
      const grade = (data as any)?.grade;
      if (grade) {
        const { data: items } = await supabase.from("junior_reading")
          .select("id,title").eq("grade", grade).order("created_at", { ascending: true });
        setList((items ?? []) as ListItem[]);
      }
      startRef.current = Date.now();
      setNow(Date.now());
    })();
  }, [id]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const elapsed = Math.floor((now - startRef.current) / 1000);
  const timeOk = elapsed >= minSec;
  const allAnswered = r ? r.questions.every((_, i) => picks[i]) : false;
  const allCorrect = r ? r.questions.every((q, i) => picks[i] === q.answer) : false;
  const correctCount = r ? r.questions.filter((q, i) => picks[i] === q.answer).length : 0;

  const nextItem = useMemo(() => {
    if (!r || !list.length) return null;
    const idx = list.findIndex(x => x.id === r.id);
    return idx >= 0 && idx < list.length - 1 ? list[idx + 1] : null;
  }, [r, list]);

  const pick = async (qi: number, letter: string) => {
    if (!r || picks[qi]) return;
    setPicks(p => ({ ...p, [qi]: letter }));
    const ok = letter === r.questions[qi].answer;
    if (userId) {
      await supabase.from("junior_reading_attempts").insert({
        user_id: userId, reading_id: r.id, question_idx: qi,
        user_answer: letter, is_correct: ok,
      });
    }
    if (ok) {
      const next = streak + 1;
      setStreak(next);
      await awardForCorrect(next, "junior_reading");
      await bumpPetSkill("reading_owl", 1);
    } else {
      setStreak(0); notifyWrong();
    }
  };

  const handleSubmit = async () => {
    if (!r) return;
    if (!allAnswered) { toast.error("请先回答所有题目"); return; }
    setSubmitted(true);
    if (allCorrect && timeOk) {
      // 写入解锁
      if (userId) {
        await supabase.from("junior_reading_completions")
          .upsert({ user_id: userId, reading_id: r.id, perfect: true, time_spent_sec: elapsed }, { onConflict: "user_id,reading_id" });
        setCompletedSet(prev => new Set(prev).add(r.id));
      }
      await awardForBlock("junior_reading");
      toast.success("🎉 全对解锁！可以进入下一篇");
    } else if (!allCorrect) {
      toast.error(`还差 ${r.questions.length - correctCount} 题，请重做`);
    } else {
      toast.warning(`还需阅读 ${minSec - elapsed} 秒`);
    }
  };

  const retry = () => {
    setPicks({});
    setSubmitted(false);
    setStreak(0);
    setAttempt(a => a + 1);
    startRef.current = Date.now();
  };

  // 检查当前篇是否被允许进入
  useEffect(() => {
    if (!r || !list.length || !userId) return;
    const idx = list.findIndex(x => x.id === r.id);
    if (idx <= 0) return; // 第一篇始终允许
    const prev = list[idx - 1];
    if (!completedSet.has(prev.id)) {
      toast.error("请先完成上一篇并全对，才能阅读本篇");
      nav(`/junior/reading/${prev.id}`, { replace: true });
    }
  }, [r, list, userId, completedSet, nav]);

  if (!r) return <main className="grid min-h-screen place-items-center text-sm text-muted-foreground">加载中…</main>;

  const goNext = () => {
    if (!nextItem) return;
    if (!completedSet.has(r.id)) { toast.error("请先全对解锁本篇"); return; }
    nav(`/junior/reading/${nextItem.id}`);
  };

  const passage = (
    <div className="relative">
      <ReadingWatermark text={`${email} · ${new Date().toLocaleString()}`} />
      <article className="relative rounded-2xl border bg-card p-5">
        <SegmentedReader text={r.body} minSecPerSentence={3} onAllRevealed={() => setAllRevealed(true)} />
      </article>
      {r.vocab_notes?.length > 0 && (
        <div className="mt-4 rounded-xl bg-muted/40 p-3">
          <div className="text-[11px] font-extrabold text-muted-foreground">📚 词汇</div>
          <div className="mt-1 flex flex-wrap gap-2 text-xs">
            {r.vocab_notes.map((v, i) => <span key={i} className="rounded-full bg-card px-2 py-0.5 border">{v.word} · {v.cn}</span>)}
          </div>
        </div>
      )}
    </div>
  );

  const qBlock = (
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
            {picked && (
              <div className="mt-3 rounded-lg bg-muted/50 p-3 text-xs space-y-1">
                <div><b>正确答案：</b>{q.answer}</div>
                {q.explanation && <div>💡 {q.explanation}</div>}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );

  const unlocked = completedSet.has(r.id);

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-6">
      <NoCopyGuard />
      <BackLink to="/junior/reading" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> 返回</BackLink>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-grad-title text-2xl font-extrabold">{r.title}</h1>
        <div className="flex items-center gap-2 text-[11px]">
          <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-1 font-bold tabular-nums",
            timeOk ? "border-emerald-400 text-emerald-600" : "border-amber-400 text-amber-600")}>
            <Clock className="size-3" /> {Math.min(elapsed, minSec)}/{minSec}s
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border px-2 py-1 font-bold text-muted-foreground">
            <ShieldCheck className="size-3" /> 反盗版保护已开启
          </span>
          {attempt > 1 && <span className="rounded-full bg-orange-500/10 text-orange-600 px-2 py-1 font-bold">第 {attempt} 次尝试</span>}
        </div>
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-2 lg:gap-8 lg:items-start">
        <div className="lg:sticky lg:top-4 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-2">
          <div className="mb-2 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">Passage 阅读材料</div>
          {passage}
        </div>
        <div>
          <div className="mb-2 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">📝 Questions 阅读理解</div>
          {qBlock}

          {/* 提交 / 重做 / 下一篇 */}
          <div className="mt-5 rounded-2xl border-2 border-dashed p-4">
            {!submitted ? (
              <button onClick={handleSubmit} disabled={!allAnswered}
                className={cn("w-full rounded-xl px-5 py-3 text-sm font-extrabold transition",
                  allAnswered ? "bg-primary text-primary-foreground hover:opacity-90" : "bg-muted text-muted-foreground cursor-not-allowed")}>
                提交并判定解锁 ({correctCount}/{r.questions.length})
              </button>
            ) : (
              <div className="space-y-3">
                <div className="text-sm font-bold">
                  得分：{correctCount}/{r.questions.length} · 用时 {elapsed}s
                </div>
                {allCorrect && timeOk ? (
                  <div className="rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 p-3 text-sm font-bold">
                    ✅ 已解锁！可以进入下一篇
                  </div>
                ) : !allCorrect ? (
                  <div className="rounded-lg bg-rose-500/10 text-rose-600 p-3 text-sm">
                    ❌ 必须 {r.questions.length}/{r.questions.length} 全对才能解锁，请认真重读后重做
                  </div>
                ) : (
                  <div className="rounded-lg bg-amber-500/10 text-amber-700 p-3 text-sm">
                    ⏳ 阅读时长不足，请再认真读 {minSec - elapsed} 秒后再提交
                  </div>
                )}
                <div className="flex gap-2">
                  {!allCorrect && (
                    <button onClick={retry} className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl border-2 px-4 py-2.5 text-sm font-extrabold hover:bg-muted">
                      <RotateCcw className="size-4" /> 重做本篇
                    </button>
                  )}
                  {nextItem && (
                    <button onClick={goNext} disabled={!unlocked}
                      className={cn("flex-1 inline-flex items-center justify-center gap-1 rounded-xl px-4 py-2.5 text-sm font-extrabold",
                        unlocked ? "bg-primary text-primary-foreground hover:opacity-90" : "bg-muted text-muted-foreground cursor-not-allowed")}>
                      {unlocked ? <>下一篇 <ChevronRight className="size-4" /></> : <><Lock className="size-4" /> 解锁后进入下一篇</>}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-2 border-t pt-5">
        <Link to="/junior/reading" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-extrabold text-primary-foreground shadow"><ArrowLeft className="size-4" /> 返回阅读列表</Link>
        <Link to="/junior" className="inline-flex items-center gap-1 rounded-full border-2 px-4 py-2 text-sm font-bold hover:bg-muted">🏫 初中首页</Link>
        <Link to="/pets" className="inline-flex items-center gap-1 rounded-full border-2 px-4 py-2 text-sm font-bold hover:bg-muted">🐾 宠物</Link>
      </div>
    </main>
  );
}