import { useEffect, useMemo, useRef, useState } from "react";
import BackLink from "@/components/BackLink";
import { GuestBanner } from "@/components/GuestBanner";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, RotateCw, Trophy } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { awardForCorrect, notifyWrong, awardForBlock } from "@/lib/coins";
import TutorChat from "@/components/tutor/TutorChat";
import PaywallDialog from "@/components/PaywallDialog";
import { consumeQuestionQuota } from "@/lib/quota";
import { fireEmojiConfetti } from "@/lib/feedback";
import { recordJuniorGrammarAttempt, JUNIOR_LEVEL_META, type JuniorGrammarErrorReason } from "@/lib/juniorGrammarFsrs";
import { recordGrammarAttempt as recordPanoramaAttempt } from "@/lib/grammarMastery";
import { recordUnifiedAttempt } from "@/hooks/useRecordAttempt";
import { TeacherLessonPlayer, type LessonSegment } from "@/components/grammar/TeacherLessonPlayer";
import { ImmersionCards, type ImmersionCard } from "@/components/grammar/ImmersionCards";
import { GrammarQuestionCard, type GrammarQuestion, type AnswerResult } from "@/components/grammar/GrammarQuestionCard";

/**
 * Junior grammar point — multi-stage data-driven learning flow.
 *
 * Stages (auto-skip if data not populated):
 *   1. 讲解 (teacher_script)         — paced TTS + blackboard
 *   2. 沉浸 (immersion_cards)        — situation cards
 *   3. 练习 (questions)              — universal question card with auto-mode
 *   4. 复盘 (always)                 — celebration + mastery update + next steps
 *
 * Backwards compatible: if all rich fields are empty, falls back to the legacy
 * markdown + question-list view (same as the previous JuniorGrammarPoint.tsx).
 */

type Pt = {
  id: string;
  code: string | null;
  title: string;
  cefr: string;
  grade: number | null;
  explanation_md: string;
  // New rich content fields (may be missing/empty for legacy points)
  teacher_script: LessonSegment[] | null;
  immersion_cards: ImmersionCard[] | null;
  mnemonic: string | null;
  content_depth: number | null;
};

type Stage = "lesson" | "immersion" | "practice" | "reflect";

export default function JuniorGrammarPoint() {
  const { id } = useParams<{ id: string }>();
  const [pt, setPt] = useState<Pt | null>(null);
  const [qs, setQs] = useState<GrammarQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  // Per-question result tracking
  const [results, setResults] = useState<Record<string, AnswerResult>>({});
  const [streak, setStreak] = useState(0);
  const [tutorFor, setTutorFor] = useState<GrammarQuestion | null>(null);
  const [paywall, setPaywall] = useState<{ open: boolean; used: number; limit: number }>({
    open: false,
    used: 5,
    limit: 5,
  });

  // Stage navigation
  const [stage, setStage] = useState<Stage>("lesson");
  const [stagesUnlocked, setStagesUnlocked] = useState<Set<Stage>>(new Set(["lesson"]));

  const celebratedRef = useRef(false);

  // Fetch grammar point + questions
  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const [a, b] = await Promise.all([
        supabase
          .from("junior_grammar_points")
          .select("id,code,title,cefr,grade,explanation_md,teacher_script,immersion_cards,mnemonic,content_depth")
          .eq("id", id)
          .maybeSingle(),
        supabase
          .from("junior_grammar_questions")
          .select("id,stem,option_a,option_b,option_c,option_d,correct_answer,accepted_answers,explanation,question_type,distractors,natural_note,grammar_topic,use_ai_grading")
          .eq("point_id", id)
          .order("sort_order"),
      ]);
      setPt(a.data as Pt);
      // 单次抽题上限 = 10（黄金注意力窗口 ≤10 分钟）。
      // 题目按 sort_order 取前 10 道；后续可"再来一组"刷新。
      const allQs = (b.data ?? []) as GrammarQuestion[];
      setQs(allQs.slice(0, 10));
      setLoading(false);
    })();
  }, [id]);

  // Determine which stages have data → auto-skip empty ones
  const availableStages = useMemo<Stage[]>(() => {
    if (!pt) return ["practice", "reflect"];
    const stages: Stage[] = [];
    if (Array.isArray(pt.teacher_script) && pt.teacher_script.length > 0) stages.push("lesson");
    if (Array.isArray(pt.immersion_cards) && pt.immersion_cards.length > 0) stages.push("immersion");
    if (qs.length > 0) stages.push("practice");
    stages.push("reflect");
    return stages;
  }, [pt, qs]);

  // Set initial stage to first available
  useEffect(() => {
    if (availableStages.length > 0 && !availableStages.includes(stage)) {
      setStage(availableStages[0]);
      setStagesUnlocked(new Set([availableStages[0]]));
    }
  }, [availableStages]); // eslint-disable-line react-hooks/exhaustive-deps

  const correctCount = Object.values(results).filter((r) => r.kind === "correct" || r.kind === "acceptable").length;
  const answeredCount = Object.keys(results).length;
  const allDone = qs.length > 0 && answeredCount === qs.length;
  const pct = qs.length ? Math.round((correctCount / qs.length) * 100) : 0;

  // Celebrate once when all done
  useEffect(() => {
    if (allDone && !celebratedRef.current && stage === "practice") {
      celebratedRef.current = true;
      if (pct >= 70) {
        fireEmojiConfetti({ vibrate: pct === 100, count: pct === 100 ? 60 : 36 });
      }
    }
  }, [allDone, pct, stage]);

  // ─── Recording an answer (FSRS + coins) ───
  const onAnswered = async (q: GrammarQuestion, result: AnswerResult) => {
    if (results[q.id]) return; // already recorded

    // Quota check (legacy behavior)
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

    // FSRS — record one attempt against the GRAMMAR POINT (not the question)
    await recordJuniorGrammarAttempt({
      pointId: pt!.id,
      questionType: q.question_type || "mcq",
      isCorrect: isPositive,
      latencyMs: result.latencyMs,
      errorReason: result.kind === "wrong" ? (result.errorReason as JuniorGrammarErrorReason | undefined) : undefined,
    });
    // Feed the cross-stage 语法掌握全景图
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

  // Reset everything (再做一遍)
  const resetAll = () => {
    setResults({});
    setStreak(0);
    celebratedRef.current = false;
    if (availableStages.length > 0) {
      setStage(availableStages[0]);
      setStagesUnlocked(new Set([availableStages[0]]));
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToStage = (s: Stage) => {
    setStage(s);
    setStagesUnlocked((prev) => {
      const next = new Set(prev);
      next.add(s);
      return next;
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return <main className="grid min-h-screen place-items-center text-sm text-muted-foreground">加载中…</main>;
  }

  if (!pt) {
    return (
      <main className="mx-auto min-h-screen max-w-2xl px-5 py-8">
        <BackLink to="/junior/grammar" className="mb-3 inline-flex items-center gap-1 text-sm">
          <ArrowLeft className="size-4" /> 返回考点列表
        </BackLink>
        <p className="text-sm text-muted-foreground">考点未找到</p>
      </main>
    );
  }

  // ═══ Stage indicator (shown on top, only when multi-stage) ═══
  const STAGE_META: Record<Stage, { label: string; emoji: string; color: string }> = {
    lesson: { label: "讲解", emoji: "🎓", color: "text-emerald-600" },
    immersion: { label: "沉浸", emoji: "📚", color: "text-sky-600" },
    practice: { label: "练习", emoji: "✏️", color: "text-amber-600" },
    reflect: { label: "复盘", emoji: "🌟", color: "text-rose-600" },
  };

  const showStageNav = availableStages.length > 1;

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-6">
      <BackLink to="/junior/grammar" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> 返回考点列表
      </BackLink>

      <GuestBanner />

      <h1 className="text-grad-title text-2xl font-extrabold">{pt.title}</h1>
      <p className="mt-1 text-xs text-muted-foreground">CEFR {pt.cefr}</p>

      {/* Stage breadcrumb */}
      {showStageNav && (
        <div className="mt-4 flex items-center gap-1 overflow-x-auto pb-2">
          {availableStages.map((s, i) => {
            const meta = STAGE_META[s];
            const isActive = stage === s;
            const isUnlocked = stagesUnlocked.has(s);
            return (
              <div key={s} className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => isUnlocked && goToStage(s)}
                  disabled={!isUnlocked}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1",
                    isActive && "bg-primary text-primary-foreground shadow-sm",
                    !isActive && isUnlocked && "bg-muted hover:bg-muted/80 text-foreground",
                    !isUnlocked && "bg-muted/40 text-muted-foreground cursor-not-allowed",
                  )}
                >
                  <span>{meta.emoji}</span>
                  <span>{meta.label}</span>
                </button>
                {i < availableStages.length - 1 && (
                  <span className="text-muted-foreground/40 text-xs">→</span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ═══ Stage content ═══ */}
      <div className="mt-5">
        {/* Stage 1: Teacher lesson */}
        {stage === "lesson" && pt.teacher_script && pt.teacher_script.length > 0 && (
          <TeacherLessonPlayer
            segments={pt.teacher_script}
            pointTitle={pt.title}
            onContinue={() => {
              const idx = availableStages.indexOf("lesson");
              const next = availableStages[idx + 1];
              if (next) goToStage(next);
            }}
            onSkip={() => {
              const idx = availableStages.indexOf("lesson");
              const next = availableStages[idx + 1];
              if (next) goToStage(next);
            }}
          />
        )}

        {/* Stage 2: Immersion cards */}
        {stage === "immersion" && pt.immersion_cards && pt.immersion_cards.length > 0 && (
          <ImmersionCards
            cards={pt.immersion_cards}
            onContinue={() => {
              const idx = availableStages.indexOf("immersion");
              const next = availableStages[idx + 1];
              if (next) goToStage(next);
            }}
          />
        )}

        {/* Stage 3: Practice */}
        {stage === "practice" && (
          <>
            {/* Mnemonic banner (if any) */}
            {pt.mnemonic && (
              <div className="mb-4 rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-rose-50 dark:from-amber-950/30 dark:to-rose-950/20 p-4 text-center">
                <div className="text-[10px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-300 mb-1">
                  🔑 一句话记住
                </div>
                <div className="text-sm font-bold text-amber-800 dark:text-amber-200">{pt.mnemonic}</div>
              </div>
            )}

            {/* Brief explanation_md (if no teacher_script — keeps legacy points usable) */}
            {(!pt.teacher_script || pt.teacher_script.length === 0) && pt.explanation_md && (
              <article className="prose prose-sm mb-4 max-w-none rounded-2xl border bg-card p-5 dark:prose-invert">
                <ReactMarkdown>{pt.explanation_md}</ReactMarkdown>
              </article>
            )}

            {qs.length === 0 ? (
              <div className="rounded-2xl border bg-card p-8 text-center text-sm text-muted-foreground">
                这个考点暂无练习题
              </div>
            ) : (
              <>
                <h2 className="mb-3 text-base font-extrabold flex items-center justify-between">
                  <span>📝 练一练</span>
                  <span className="text-xs font-normal tabular-nums text-muted-foreground">
                    {answeredCount}/{qs.length} 题 · {correctCount} 对
                  </span>
                </h2>
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
                </div>
              </>
            )}

            {/* When all done, link to reflect stage */}
            {allDone && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => goToStage("reflect")}
                  className="rounded-full bg-gradient-to-r from-amber-500 to-rose-500 px-6 py-3 text-sm font-extrabold text-white shadow-md hover:shadow-lg transition"
                >
                  ✨ 看看本次表现 →
                </button>
              </div>
            )}
          </>
        )}

        {/* Stage 4: Reflect (always) */}
        {stage === "reflect" && (
          <section className="rounded-3xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-rose-50 p-6 sm:p-8 text-center shadow-sm dark:from-amber-950/30 dark:to-rose-950/30">
            <Trophy className="mx-auto size-12 text-amber-500" />
            <h3 className="mt-2 text-xl font-extrabold">
              {pct === 100 ? "🌟 满分通关！" : pct >= 90 ? "🌟 太厉害啦！" : pct >= 70 ? "👍 不错哦！" : "💪 再来一次会更好！"}
            </h3>
            {qs.length > 0 ? (
              <p className="mt-1 text-sm text-muted-foreground">
                答对 {correctCount} / {qs.length} · 正确率{" "}
                <span className="font-extrabold text-amber-600">{pct}%</span>
              </p>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">已完成本考点的学习</p>
            )}

            {/* Per-question quick review */}
            {answeredCount > 0 && (
              <div className="mt-4 mx-auto max-w-md rounded-2xl bg-card/80 p-3 text-left">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">本次答题概览</div>
                <div className="flex flex-wrap gap-1.5">
                  {qs.map((q, i) => {
                    const r = results[q.id];
                    const ok = r && (r.kind === "correct" || r.kind === "acceptable");
                    return (
                      <span
                        key={q.id}
                        className={cn(
                          "inline-flex items-center justify-center w-7 h-7 rounded-md text-[11px] font-bold",
                          ok && "bg-emerald-500 text-white",
                          r && !ok && "bg-rose-500 text-white",
                          !r && "bg-muted text-muted-foreground",
                        )}
                        title={`第 ${i + 1} 题`}
                      >
                        {i + 1}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={resetAll}
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 px-5 py-2 text-sm font-extrabold text-white shadow"
              >
                <RotateCw className="size-4" /> 再做一遍
              </button>
              <Link
                to="/junior/grammar"
                className="inline-flex items-center gap-1.5 rounded-full border-2 border-indigo-300 bg-card px-5 py-2 text-sm font-extrabold text-indigo-600 shadow-sm hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
              >
                📚 下一个考点
              </Link>
              <Link
                to="/junior"
                className="inline-flex items-center gap-1.5 rounded-full border-2 border-amber-300 bg-card px-5 py-2 text-sm font-extrabold text-amber-700 shadow-sm hover:bg-amber-50 dark:hover:bg-amber-950/30"
              >
                🏠 初中首页
              </Link>
            </div>
          </section>
        )}
      </div>

      {/* Tutor chat */}
      {tutorFor && (
        <TutorChat
          context="junior_grammar"
          questionRef={tutorFor.id}
          questionSnapshot={{
            point: pt.title,
            cefr: pt.cefr,
            stem: tutorFor.stem,
            question_type: tutorFor.question_type,
            options: tutorFor.question_type === "mcq"
              ? { A: tutorFor.option_a, B: tutorFor.option_b, C: tutorFor.option_c, D: tutorFor.option_d }
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

      {/* Paywall */}
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
