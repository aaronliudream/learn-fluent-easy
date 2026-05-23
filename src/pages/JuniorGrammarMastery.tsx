import { T } from "@/i18n/T";
import { useEffect, useMemo, useRef, useState } from "react";
import BackLink from "@/components/BackLink";
import { GuestBanner } from "@/components/GuestBanner";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Sparkles, Zap } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { awardForCorrect, notifyWrong, awardForBlock } from "@/lib/coins";
import TutorChat from "@/components/tutor/TutorChat";
import PaywallDialog from "@/components/PaywallDialog";
import { consumeQuestionQuota } from "@/lib/quota";
import { fireEmojiConfetti } from "@/lib/feedback";
import {
  recordJuniorGrammarAttempt,
  type JuniorGrammarErrorReason,
} from "@/lib/juniorGrammarFsrs";
import { recordGrammarAttempt as recordPanoramaAttempt } from "@/lib/grammarMastery";
import { recordUnifiedAttempt } from "@/hooks/useRecordAttempt";
import {
  GrammarQuestionCard,
  type GrammarQuestion,
  type AnswerResult,
} from "@/components/grammar/GrammarQuestionCard";
import { GrammarTestComplete } from "@/components/grammar/GrammarTestComplete";
import {
  CHALLENGE_QUESTIONS_JUNIOR,
  recordGroupCompletion,
  type Streak,
} from "@/lib/challengeMode";

type Pt = {
  id: string;
  code: string | null;
  title: string;
  cefr: string;
  grade: number | null;
  explanation_md: string;
  mnemonic: string | null;
};

export default function JuniorGrammarMastery() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isChallenge = searchParams.get("challenge") === "1";
  const sessionSize = isChallenge ? CHALLENGE_QUESTIONS_JUNIOR : 10;

  const [pt, setPt] = useState<Pt | null>(null);
  const [qs, setQs] = useState<GrammarQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<Record<string, AnswerResult>>({});
  const [streak, setStreak] = useState(0);
  const [tutorFor, setTutorFor] = useState<GrammarQuestion | null>(null);
  const [showComplete, setShowComplete] = useState(false);
  const [paywall, setPaywall] = useState<{ open: boolean; used: number; limit: number }>({
    open: false,
    used: 5,
    limit: 5,
  });

  const celebratedRef = useRef(false);
  const groupRecordedRef = useRef(false);
  const [groupStreak, setGroupStreak] = useState<Streak>({
    consecutive_count: 0,
    challenge_unlocked: false,
  });

  const grammarBackTo = pt?.grade ? `/junior/grammar?grade=${pt.grade}` : "/junior/grammar";

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const [a, b] = await Promise.all([
        supabase
          .from("junior_grammar_points")
          .select("id,code,title,cefr,grade,explanation_md,mnemonic")
          .eq("id", id)
          .maybeSingle(),
        supabase
          .from("junior_grammar_questions")
          .select(
            "id,stem,option_a,option_b,option_c,option_d,correct_answer,accepted_answers,explanation,question_type,distractors,natural_note,grammar_topic,use_ai_grading",
          )
          .eq("point_id", id)
          .order("sort_order"),
      ]);
      setPt(a.data as Pt);
      setQs(((b.data ?? []) as GrammarQuestion[]).slice(0, sessionSize));
      setLoading(false);
    })();
  }, [id, sessionSize]);

  const correctCount = Object.values(results).filter(
    (r) => r.kind === "correct" || r.kind === "acceptable",
  ).length;
  const answeredCount = Object.keys(results).length;
  const allDone = qs.length > 0 && answeredCount === qs.length;
  const pct = qs.length ? Math.round((correctCount / qs.length) * 100) : 0;
  const progressPct = qs.length ? Math.round((answeredCount / qs.length) * 100) : 0;

  useEffect(() => {
    if (allDone && !celebratedRef.current) {
      celebratedRef.current = true;
      if (pct >= 70) {
        fireEmojiConfetti({ vibrate: pct === 100, count: pct === 100 ? 60 : 36 });
      }
      setShowComplete(true);
    }
    if (allDone && !groupRecordedRef.current && pt?.id) {
      groupRecordedRef.current = true;
      recordGroupCompletion(`junior_grammar:${pt.id}`, pct).then(setGroupStreak).catch(() => {});
    }
  }, [allDone, pct, pt?.id]);

  const onAnswered = async (q: GrammarQuestion, result: AnswerResult) => {
    if (results[q.id]) return;

    const quota = await consumeQuestionQuota();
    if (!quota.allowed) {
      setPaywall({ open: true, used: quota.used, limit: quota.limit });
      return;
    }

    setResults((prev) => ({ ...prev, [q.id]: result }));

    const isPositive = result.kind === "correct" || result.kind === "acceptable";
    if (isPositive) {
      const next = streak + 1;
      setStreak(next);
      await awardForCorrect(next, "junior_grammar", q.id, "junior_grammar", result.latencyMs);
      const cc = correctCount + 1;
      if (cc % 5 === 0) await awardForBlock("junior_grammar");
    } else {
      setStreak(0);
      notifyWrong();
    }

    await recordJuniorGrammarAttempt({
      pointId: pt!.id,
      questionType: q.question_type || "mcq",
      isCorrect: isPositive,
      latencyMs: result.latencyMs,
      errorReason:
        result.kind === "wrong"
          ? (result.errorReason as JuniorGrammarErrorReason | undefined)
          : undefined,
    });
    if (pt?.code) recordPanoramaAttempt(`junior:${pt.code}`, isPositive);
    if (pt) {
      const rawG = pt.grade ?? 1;
      const absGrade = rawG >= 1 && rawG <= 3 ? rawG + 6 : rawG;
      recordUnifiedAttempt({
        stage: "junior",
        grade: absGrade,
        module: "grammar",
        item_type: q.question_type || "mcq",
        item_id: pt.id,
        item_label: pt.title,
        is_correct: isPositive,
        context: { code: pt.code, cefr: pt.cefr, qid: q.id },
      }).catch(() => {});
    }
  };

  const resetAll = () => {
    setResults({});
    setStreak(0);
    setShowComplete(false);
    celebratedRef.current = false;
    groupRecordedRef.current = false;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const streakLabel = useMemo(() => {
    if (streak >= 5) return { text: "超神连击！", color: "from-rose-500 to-pink-500" };
    if (streak >= 3) return { text: "连对中！", color: "from-pink-500 to-fuchsia-500" };
    return null;
  }, [streak]);

  if (loading) {
    return (
      <main className="playful-shell grid min-h-screen place-items-center">
        <div className="playful-card px-8 py-6 text-center">
          <Sparkles className="mx-auto size-8 animate-pulse text-pink-400" />
          <p className="mt-3 text-sm font-bold text-muted-foreground">
            <T>加载题目中…</T>
          </p>
        </div>
      </main>
    );
  }

  if (!pt) {
    return (
      <main className="playful-shell mx-auto min-h-screen max-w-2xl px-5 py-8">
        <BackLink to="/junior/grammar" className="mb-3 inline-flex items-center gap-1 text-sm">
          <ArrowLeft className="size-4" /> <T>返回考点列表</T>
        </BackLink>
        <p className="text-sm text-muted-foreground">
          <T>考点未找到</T>
        </p>
      </main>
    );
  }

  return (
    <main className="playful-shell mx-auto min-h-screen max-w-2xl px-5 py-6">
      <BackLink
        to={grammarBackTo}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> <T>返回考点列表</T>
      </BackLink>

      <GuestBanner />

      {/* Header card */}
      <header className="playful-card relative overflow-hidden p-5 mb-5">
        <span className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-pink-200/40 blur-2xl" />
        <span className="pointer-events-none absolute -bottom-4 -left-4 size-20 rounded-full bg-cyan-200/40 blur-2xl" />
        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-pink-100 to-cyan-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-pink-600 dark:from-pink-950/60 dark:to-cyan-950/60 dark:text-pink-300">
              <Sparkles className="size-3" />
              <T>语法掌握测试</T>
            </div>
            <h1 className="mt-2 text-xl font-extrabold leading-snug bg-gradient-to-r from-pink-600 to-cyan-600 bg-clip-text text-transparent">
              {pt.title}
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">CEFR {pt.cefr}</p>
          </div>
          {streakLabel && (
            <div
              className={cn(
                "shrink-0 rounded-2xl bg-gradient-to-br px-3 py-2 text-center text-white shadow-md spark-pulse",
                streakLabel.color,
              )}
            >
              <Zap className="mx-auto size-4" />
              <div className="mt-0.5 text-[10px] font-extrabold">{streak}</div>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="relative mt-4">
          <div className="mb-1.5 flex items-center justify-between text-[11px] font-bold">
            <span className="text-pink-600">
              <T>进度</T> {answeredCount}/{qs.length}
            </span>
            <span className="text-cyan-600">
              <T>正确</T> {correctCount}
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-pink-100 dark:bg-pink-950/40">
            <div
              className="playful-progress h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </header>

      {showComplete && allDone ? (
        <GrammarTestComplete
          pointId={id!}
          pointTitle={pt.title}
          grade={pt.grade ?? 7}
          qs={qs}
          results={results}
          correctCount={correctCount}
          pct={pct}
          grammarBackTo={grammarBackTo}
          isChallenge={isChallenge}
          groupStreak={groupStreak}
          onReset={resetAll}
          onEnterChallenge={() => {
            const next = new URLSearchParams(searchParams);
            next.set("challenge", "1");
            setSearchParams(next);
            resetAll();
          }}
          onExitChallenge={() => {
            const next = new URLSearchParams(searchParams);
            next.delete("challenge");
            setSearchParams(next);
            resetAll();
          }}
        />
      ) : (
        <>
          {pt.mnemonic && (
            <div className="mb-4 rounded-2xl border-2 border-pink-200/70 bg-gradient-to-br from-pink-50 to-cyan-50 p-4 text-center dark:border-pink-900/40 dark:from-pink-950/30 dark:to-cyan-950/20">
              <div className="text-[10px] font-bold uppercase tracking-widest text-pink-500 mb-1">
                <T>🔑 一句话记住</T>
              </div>
              <div className="text-sm font-bold text-pink-800 dark:text-pink-200">{pt.mnemonic}</div>
            </div>
          )}

          {pt.explanation_md && (
            <article className="prose prose-sm mb-4 max-w-none rounded-2xl border-2 border-cyan-100 bg-white/80 p-4 dark:prose-invert dark:border-cyan-900/40 dark:bg-card/80">
              <ReactMarkdown>{pt.explanation_md}</ReactMarkdown>
            </article>
          )}

          {qs.length === 0 ? (
            <div className="playful-card p-8 text-center text-sm text-muted-foreground">
              <T>这个考点暂无练习题</T>
              <button
                type="button"
                onClick={() => nav(grammarBackTo)}
                className="playful-btn playful-btn-cyan mt-4 bg-gradient-to-r from-cyan-500 to-teal-400 px-5 py-2 text-xs text-white"
              >
                <T>返回列表</T>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {qs.map((q, i) => (
                <GrammarQuestionCard
                  key={q.id}
                  question={q}
                  index={i}
                  onAnswered={(r) => onAnswered(q, r)}
                  onAskTutor={() => setTutorFor(q)}
                  enableTtsForStem={false}
                />
              ))}

              {allDone && (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setShowComplete(true)}
                    className="playful-btn bg-gradient-to-r from-pink-500 via-rose-400 to-cyan-400 px-8 py-3 text-sm text-white"
                  >
                    <T>✨ 查看本次成绩</T>
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {tutorFor && (
        <TutorChat
          context="junior_grammar"
          questionRef={tutorFor.id}
          questionSnapshot={{
            point: pt.title,
            cefr: pt.cefr,
            stem: tutorFor.stem,
            question_type: tutorFor.question_type,
            options:
              tutorFor.question_type === "mcq"
                ? {
                    A: tutorFor.option_a,
                    B: tutorFor.option_b,
                    C: tutorFor.option_c,
                    D: tutorFor.option_d,
                  }
                : undefined,
            correct_answer: tutorFor.correct_answer,
            accepted_answers: tutorFor.accepted_answers,
            user_result: results[tutorFor.id]?.kind,
            explanation: tutorFor.explanation,
          }}
          open={!!tutorFor}
          onClose={() => setTutorFor(null)}
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
