import { useEffect, useMemo, useState } from "react";
import BackLink from "@/components/BackLink";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle, ChevronRight, RotateCcw, BookOpen, MessageCircleQuestion } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { recordAttempt } from "@/lib/gaokaoMastery";
import { celebrateScore } from "@/lib/feedback";
import { awardCoins } from "@/lib/coins";
import { recordGrammarAttempt, loadGrammarMastery, LEVEL_META, type GrammarMastery } from "@/lib/grammarFsrs";
import { toast } from "sonner";
import TutorChat from "@/components/tutor/TutorChat";
import PaywallDialog from "@/components/PaywallDialog";
import { consumeQuestionQuota } from "@/lib/quota";

type Point = { id: string; title: string; slug: string };
type Question = {
  id: string;
  stem: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string;
  irt_difficulty: number | null;
  question_type: string;
};

export default function GaokaoGrammarQuiz() {
  const { slug, index } = useParams<{ slug: string; index: string }>();
  const navigate = useNavigate();
  const idx = Math.max(0, parseInt(index || "0", 10) || 0);

  const [point, setPoint] = useState<Point | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [mastery, setMastery] = useState<GrammarMastery | null>(null);
  const [loading, setLoading] = useState(true);
  const [picked, setPicked] = useState<string | null>(null);
  const [startTs, setStartTs] = useState<number>(Date.now());
  const [stats, setStats] = useState({ correct: 0, wrong: 0 });
  const [tutorOpen, setTutorOpen] = useState(false);
  const [paywall, setPaywall] = useState<{ open: boolean; used: number; limit: number }>({ open: false, used: 5, limit: 5 });

  useEffect(() => {
    if (!slug) return;
    (async () => {
      setLoading(true);
      const { data: pt } = await supabase
        .from("gaokao_grammar_points")
        .select("id, title, slug")
        .eq("slug", slug)
        .maybeSingle();
      if (!pt) { setLoading(false); return; }
      setPoint(pt as Point);
      const { data: qs } = await supabase
        .from("gaokao_grammar_questions")
        .select("id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, irt_difficulty, question_type")
        .eq("point_id", pt.id);
      const sorted = ((qs ?? []) as Question[]).sort(
        (a, b) => (a.irt_difficulty ?? 0) - (b.irt_difficulty ?? 0),
      );
      setQuestions(sorted);
      const ms = await loadGrammarMastery(pt.id);
      setMastery(ms);
      setLoading(false);
    })();
  }, [slug]);

  // Reset per-question state when index changes
  useEffect(() => {
    setPicked(null);
    setStartTs(Date.now());
    setTutorOpen(false);
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [idx]);

  const q = questions[idx];
  const total = questions.length;

  if (loading) {
    return <main className="mx-auto min-h-screen max-w-2xl px-5 py-8"><p className="text-sm text-muted-foreground">加载中...</p></main>;
  }
  if (!point) {
    return <main className="mx-auto min-h-screen max-w-2xl px-5 py-8"><p>考点不存在。<BackLink to="/gaokao/grammar" className="text-primary underline">返回</BackLink></p></main>;
  }
  if (!total) {
    return (
      <main className="mx-auto min-h-screen max-w-2xl px-5 py-8">
        <BackLink to="/gaokao/grammar" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> 返回语法地图
        </BackLink>
        <p className="text-muted-foreground">本考点暂无题目。</p>
      </main>
    );
  }

  // Finished
  if (idx >= total) {
    const acc = stats.correct + stats.wrong > 0 ? stats.correct / (stats.correct + stats.wrong) : 0;
    // Fire celebration once per finish
    if (typeof window !== "undefined") {
      const key = `gk-grammar-quiz-${slug}-${stats.correct}-${stats.wrong}`;
      if ((window as any).__celebrated !== key) {
        (window as any).__celebrated = key;
        celebrateScore(Math.round(acc * 100));
      }
    }
    return (
      <main className="mx-auto min-h-screen max-w-2xl px-5 py-8">
        <BackLink to="/gaokao/grammar" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> 返回语法地图
        </BackLink>
        <div className="rounded-2xl border bg-card p-8 text-center">
          <div className="text-5xl mb-3">🎉</div>
          <h2 className="text-xl font-bold mb-2">本考点已刷完！</h2>
          <p className="text-sm text-muted-foreground mb-6">
            本轮 {stats.correct + stats.wrong} 题，✓ {stats.correct} · ✗ {stats.wrong}
            {stats.correct + stats.wrong > 0 && <> · 正确率 {Math.round(acc * 100)}%</>}
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button onClick={() => { setStats({ correct: 0, wrong: 0 }); navigate(`/gaokao/grammar/${slug}/quiz/0`); }}>
              <RotateCcw className="size-4 mr-1" /> 再刷一轮
            </Button>
            <Button variant="outline" asChild>
              <Link to={`/gaokao/grammar/${slug}`}><BookOpen className="size-4 mr-1" /> 看讲解</Link>
            </Button>
            <Button variant="ghost" asChild>
              <BackLink to="/gaokao/grammar">返回地图</BackLink>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const onPick = async (letter: string) => {
    if (picked) return;
    // Daily quota gate (free 用户每天 5 题)
    const quota = await consumeQuestionQuota();
    if (!quota.allowed) {
      setPaywall({ open: true, used: quota.used, limit: quota.limit });
      return;
    }
    setPicked(letter);
    const isCorrect = letter === q.correct_answer;
    setStats((s) => ({ correct: s.correct + (isCorrect ? 1 : 0), wrong: s.wrong + (isCorrect ? 0 : 1) }));
    if (isCorrect) awardCoins(3, "gaokao_grammar_correct").catch(() => {});
    else { import("@/lib/coins").then(m => m.notifyWrong()); }
    const latencyMs = Date.now() - startTs;
    await recordAttempt({ questionType: "grammar", questionId: q.id, userAnswer: letter, isCorrect });
    const res = await recordGrammarAttempt({
      pointId: point.id,
      questionType: q.question_type || "multiple_choice",
      isCorrect,
      latencyMs,
    });
    if (res?.justMastered) {
      toast.success("🏆 恭喜！本考点已掌握 (Master)", { duration: 4000 });
    } else if (res && isCorrect) {
      const m = LEVEL_META[res.newLevel];
      toast(`${m.emoji} ${m.label} · ${res.intervalDays} 天后复习`, { duration: 1800 });
    }
    setMastery((prev) =>
      prev
        ? { ...prev, correct_count: prev.correct_count + (isCorrect ? 1 : 0), wrong_count: prev.wrong_count + (isCorrect ? 0 : 1), mastery_level: res?.newLevel ?? prev.mastery_level }
        : prev,
    );
  };

  const goNext = () => navigate(`/gaokao/grammar/${slug}/quiz/${idx + 1}`);
  const goPrev = () => { if (idx > 0) navigate(`/gaokao/grammar/${slug}/quiz/${idx - 1}`); };

  const meta = LEVEL_META[mastery?.mastery_level ?? 0];

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 py-5 pb-24 sm:px-5 sm:py-8">
      {/* 顶部返回 + 进度 */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <BackLink to="/gaokao/grammar" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> 返回
        </BackLink>
        <div className="text-xs text-muted-foreground tabular-nums">
          {idx + 1} / {total} · ✓{stats.correct} ✗{stats.wrong}
        </div>
      </div>
      <div className="mb-1 text-base font-bold truncate">{point.title}</div>
      <div className="mb-4 flex items-center gap-2 text-[11px] text-muted-foreground">
        <span>{meta.emoji} {meta.label}</span>
        <span>·</span>
        <span>累计 ✓{mastery?.correct_count ?? 0} ✗{mastery?.wrong_count ?? 0}</span>
      </div>
      {/* 进度条 */}
      <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-primary transition-all" style={{ width: `${((idx) / total) * 100}%` }} />
      </div>

      {/* 题干 */}
      <section className="rounded-2xl border bg-card p-5 sm:p-6">
        <p className="mb-5 text-base font-medium leading-relaxed sm:text-lg">{q.stem}</p>
        <div className="space-y-2.5">
          {(["A", "B", "C", "D"] as const).map((letter) => {
            const text = (q as any)[`option_${letter.toLowerCase()}`];
            const isPicked = picked === letter;
            const isAnswer = q.correct_answer === letter;
            let cls = "border-border hover:border-primary/40 hover:bg-muted/30";
            if (picked) {
              if (isAnswer) cls = "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/40";
              else if (isPicked) cls = "border-rose-500 bg-rose-50 dark:bg-rose-950/30";
              else cls = "border-border opacity-60";
            }
            return (
              <button
                key={letter}
                onClick={() => onPick(letter)}
                disabled={!!picked}
                className={`flex w-full items-start gap-3 rounded-xl border-2 p-3.5 text-left text-sm transition sm:text-base ${cls}`}
              >
                <span className="font-bold shrink-0">{letter}.</span>
                <span className="flex-1">{text}</span>
                {picked && isAnswer && <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />}
                {picked && isPicked && !isAnswer && <XCircle className="size-5 text-rose-600 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* 解析 */}
        {picked && (
          <div className="mt-5 rounded-xl border-l-4 border-primary bg-muted/40 p-4">
            <div className="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              {picked === q.correct_answer ? "✅ 答对了" : "❌ 答错了"} · 解析
            </div>
            <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
              <span className="font-bold">正确答案：{q.correct_answer}</span>
              {"\n"}
              {q.explanation}
            </p>
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTutorOpen(true)}
                className="rounded-full border-primary/40 text-primary hover:bg-primary/10"
              >
                <MessageCircleQuestion className="size-4 mr-1.5" />
                问小月 / Ask Luna
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* 底部导航 */}
      <div className="mt-5 flex items-center gap-2">
        <Button variant="outline" onClick={goPrev} disabled={idx === 0}>
          <ArrowLeft className="size-4 mr-1" /> 上一题
        </Button>
        <div className="flex-1" />
        {picked ? (
          <Button onClick={goNext} size="lg" className="min-w-[140px]">
            {idx + 1 >= total ? "查看结果" : "下一题"} <ChevronRight className="size-4 ml-1" />
          </Button>
        ) : (
          <Button variant="ghost" onClick={goNext} className="text-muted-foreground">
            跳过 <ChevronRight className="size-4 ml-0.5" />
          </Button>
        )}
      </div>

      {picked && (
        <TutorChat
          context="gaokao_grammar"
          questionRef={q.id}
          questionSnapshot={{
            point: point.title,
            stem: q.stem,
            options: { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d },
            correct_answer: q.correct_answer,
            user_answer: picked,
            is_correct: picked === q.correct_answer,
            explanation: q.explanation,
          }}
          open={tutorOpen}
          onClose={() => setTutorOpen(false)}
        />
      )}

      <PaywallDialog
        open={paywall.open}
        onClose={() => setPaywall((p) => ({ ...p, open: false }))}
        trigger="daily_quota_exhausted"
        used={paywall.used}
        limit={paywall.limit}
      />
    </main>
  );
}
