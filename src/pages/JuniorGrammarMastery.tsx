import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Lock, Check, Sparkles, RotateCw, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import {
  GrammarQuestionCard,
  type GrammarQuestion,
  type AnswerResult,
} from "@/components/grammar/GrammarQuestionCard";
import { recordJuniorGrammarAttempt, type JuniorGrammarErrorReason } from "@/lib/juniorGrammarFsrs";
import { awardForCorrect, notifyWrong } from "@/lib/coins";
import { fireEmojiConfetti } from "@/lib/feedback";
import { T } from "@/i18n/T";

/* ──────────────────────────────────────────────────────────────────────────
   Adaptive 5-Level Mastery Test (per grammar point)

   Each level tests ONE question type. Levels unlock progressively based on
   mastery thresholds. Wrong answers are spaced-retried later in the same
   level. Locks open in order; you can't skip ahead.

   ── Adaptive difficulty ──
   Each level tracks a `targetDifficulty` 1 (easy) → 2 (med) → 3 (hard).
     • Starts at 2.
     • Correct answer → target++ (capped at 3).
     • Wrong answer   → target-- (floored at 1), and the question is re-queued
       2 positions later for a spaced retry.
   Next-question pick prefers a question whose difficulty matches the current
   target; falls back to the nearest available difficulty in the same bucket.

   Question source: junior_grammar_questions, sort_order 9000-9199
     • 9000-9099 = original gold-standard 12 (per point)
     • 9100-9199 = adaptive expansion bank (varied difficulties)
   ────────────────────────────────────────────────────────────────────────── */

type LevelKey = "mcq" | "fill" | "correction" | "transform" | "translation";
type LevelStatus = "locked" | "active" | "completed";

type LevelConfig = {
  id: number;
  key: LevelKey;
  name: string;
  emoji: string;
  skillFocus: string;
  skillFocusCn: string;
  minQ: number;
  maxQ: number;
  /** Fraction 0..1; how many of `minQ` must be correct to unlock the next level. */
  threshold: number;
};

// Thresholds tuned to the current 12-question gold-standard bank
// (4 mcq / 3 fill / 2 correction / 2 transform / 1 translation per point).
// Once more questions are authored (target 21–33 per point), raise these
// to 80/80/75/75 per the spec.
const LEVELS: LevelConfig[] = [
  {
    id: 1, key: "mcq", name: "选择题", emoji: "🎯",
    skillFocus: "Recognition · Can you identify the correct form?",
    skillFocusCn: "识别能力 · 你能识别出正确的形式吗？",
    minQ: 4, maxQ: 8, threshold: 0.75,
  },
  {
    id: 2, key: "fill", name: "填空题", emoji: "✏️",
    skillFocus: "Recall · Can you produce the right form from memory?",
    skillFocusCn: "回忆能力 · 你能凭记忆写出正确形式吗？",
    minQ: 3, maxQ: 6, threshold: 0.67,
  },
  {
    id: 3, key: "correction", name: "改错题", emoji: "🔧",
    skillFocus: "Debugging · Can you spot and fix an error?",
    skillFocusCn: "纠错能力 · 你能发现并改正错误吗？",
    minQ: 2, maxQ: 4, threshold: 0.5,
  },
  {
    id: 4, key: "transform", name: "句型转换", emoji: "🔄",
    skillFocus: "Manipulation · Can you rewrite the sentence correctly?",
    skillFocusCn: "转换能力 · 你能正确地改写句子吗？",
    minQ: 2, maxQ: 4, threshold: 0.5,
  },
  {
    id: 5, key: "translation", name: "造句 / 写作", emoji: "✍️",
    skillFocus: "Production · Can you build the sentence from Chinese?",
    skillFocusCn: "产出能力 · 你能根据中文造出整句吗？",
    minQ: 1, maxQ: 3, threshold: 1.0,
  },
];

type Pt = {
  id: string;
  title: string;
  code: string | null;
  cefr: string | null;
  grade: number | null;
  hook_line: string | null;
  hook_line_cn: string | null;
  mnemonic: string | null;
};

type Difficulty = 1 | 2 | 3;

type LevelState = {
  asked: number[]; // indices of questions already shown
  correct: number;
  answered: number;
  retryQueue: number[]; // indices to re-ask (spaced retry)
  status: LevelStatus;
  targetDifficulty: Difficulty; // adaptive: starts at 2, ±1 on each result
};

function makeInitialState(): Record<number, LevelState> {
  return Object.fromEntries(
    LEVELS.map((l) => [
      l.id,
      {
        asked: [],
        correct: 0,
        answered: 0,
        retryQueue: [],
        status: l.id === 1 ? "active" : "locked",
        targetDifficulty: 2 as Difficulty,
      } as LevelState,
    ]),
  );
}

/**
 * Pick the next question index from `pool`, preferring:
 *   1. Unasked questions matching `targetDifficulty`,
 *   2. Unasked questions at the nearest difficulty (|d - target| ascending),
 *   3. Any unasked question.
 * Returns null when every question in the pool has already been asked.
 */
function pickByTargetDifficulty(
  pool: GrammarQuestion[],
  asked: number[],
  targetDifficulty: Difficulty,
): number | null {
  const unaskedIdx = pool.map((_, i) => i).filter((i) => !asked.includes(i));
  if (unaskedIdx.length === 0) return null;
  const exact = unaskedIdx.filter((i) => (pool[i].difficulty ?? 2) === targetDifficulty);
  if (exact.length > 0) return exact[0];
  // nearest by absolute difficulty distance
  return unaskedIdx
    .map((i) => ({ i, d: Math.abs((pool[i].difficulty ?? 2) - targetDifficulty) }))
    .sort((a, b) => a.d - b.d)[0].i;
}

function isMastered(state: LevelState, cfg: LevelConfig): boolean {
  if (state.answered < cfg.minQ) return false;
  if (state.retryQueue.length > 0) return false; // can't master with pending retries
  return state.correct / state.answered >= cfg.threshold;
}

function maxedOut(state: LevelState, cfg: LevelConfig): boolean {
  return state.answered >= cfg.maxQ && !isMastered(state, cfg);
}

export default function JuniorGrammarMastery() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const [pt, setPt] = useState<Pt | null>(null);
  const [byType, setByType] = useState<Record<LevelKey, GrammarQuestion[]>>({
    mcq: [], fill: [], correction: [], transform: [], translation: [],
  });
  const [loading, setLoading] = useState(true);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [state, setState] = useState<Record<number, LevelState>>(() => makeInitialState());
  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // ─── Fetch grammar point + gold-standard questions ───
  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const [pRes, qRes] = await Promise.all([
        supabase
          .from("junior_grammar_points")
          .select("id,title,code,cefr,grade,hook_line,hook_line_cn,mnemonic")
          .eq("id", id)
          .maybeSingle(),
        supabase
          .from("junior_grammar_questions")
          .select(
            "id,stem,option_a,option_b,option_c,option_d,correct_answer,accepted_answers,explanation,question_type,distractors,natural_note,grammar_topic,use_ai_grading,difficulty,sort_order",
          )
          .eq("point_id", id)
          .gte("sort_order", 9000)
          .lte("sort_order", 9199)
          .order("difficulty", { ascending: true })
          .order("sort_order"),
      ]);
      setPt(pRes.data as Pt);
      const allQs = (qRes.data ?? []) as GrammarQuestion[];
      const buckets: Record<LevelKey, GrammarQuestion[]> = {
        mcq: [], fill: [], correction: [], transform: [], translation: [],
      };
      for (const q of allQs) {
        const t = (q.question_type || "mcq") as LevelKey;
        if (buckets[t]) buckets[t].push(q);
      }
      setByType(buckets);
      setLoading(false);
    })();
  }, [id]);

  // ─── Pick the next question for the current level ───
  useEffect(() => {
    if (loading || showCelebration) return;
    const cfg = LEVELS.find((l) => l.id === currentLevel);
    if (!cfg) return;
    const ls = state[currentLevel];
    const pool = byType[cfg.key];
    if (!pool || pool.length === 0) {
      // No questions in this bucket — auto-complete this level so the user can move on.
      if (ls.status !== "completed") {
        setState((s) => ({
          ...s,
          [currentLevel]: { ...s[currentLevel], status: "completed" },
          ...(currentLevel < LEVELS.length
            ? { [currentLevel + 1]: { ...s[currentLevel + 1], status: "active" } }
            : {}),
        }));
      }
      return;
    }
    // Already have a queued question? leave it.
    if (activeQuestionIdx !== null) return;
    // Prefer retry queue (spaced retry of wrong answers)
    if (ls.retryQueue.length > 0) {
      setActiveQuestionIdx(ls.retryQueue[0]);
      return;
    }
    // Adaptive pick: prefer a question at the current target difficulty.
    const next = pickByTargetDifficulty(pool, ls.asked, ls.targetDifficulty);
    if (next !== null) {
      setActiveQuestionIdx(next);
      return;
    }
    // Exhausted pool — if not mastered yet, loop back to the first question
    if (!isMastered(ls, cfg) && pool.length > 0) {
      setActiveQuestionIdx(0); // replay from start
    }
  }, [loading, currentLevel, state, byType, activeQuestionIdx, showCelebration]);

  // ─── Handle an answer ───
  const cfg = useMemo(() => LEVELS.find((l) => l.id === currentLevel)!, [currentLevel]);
  const pool = byType[cfg.key];
  const activeQ = activeQuestionIdx !== null && pool ? pool[activeQuestionIdx] : null;
  const lvlState = state[currentLevel];

  const handleAnswered = (result: AnswerResult) => {
    if (answered || activeQuestionIdx === null || !activeQ) return;
    setAnswered(true);
    const isOk = result.kind === "correct" || result.kind === "acceptable";

    setState((s) => {
      const prev = s[currentLevel];
      const newAsked = prev.asked.includes(activeQuestionIdx)
        ? prev.asked
        : [...prev.asked, activeQuestionIdx];
      // Pull this idx out of the retry queue if it was there
      const newRetry = prev.retryQueue.filter((i) => i !== activeQuestionIdx);
      // Wrong → re-queue this question for a later spaced retry (after 2 others)
      const updatedRetry = isOk
        ? newRetry
        : [...newRetry.slice(0, 2), activeQuestionIdx, ...newRetry.slice(2)];
      // Adaptive difficulty: correct → harder; wrong → easier (clamped 1..3)
      const nextTarget = (
        isOk
          ? Math.min(3, prev.targetDifficulty + 1)
          : Math.max(1, prev.targetDifficulty - 1)
      ) as Difficulty;
      return {
        ...s,
        [currentLevel]: {
          ...prev,
          asked: newAsked,
          correct: prev.correct + (isOk ? 1 : 0),
          answered: prev.answered + 1,
          retryQueue: updatedRetry,
          targetDifficulty: nextTarget,
        },
      };
    });

    // Coins + FSRS + feedback
    if (isOk) {
      awardForCorrect(0, "junior_grammar", activeQ.id, "junior_grammar", result.latencyMs);
    } else {
      notifyWrong();
    }
    if (pt?.id) {
      recordJuniorGrammarAttempt({
        pointId: pt.id,
        questionType: activeQ.question_type || cfg.key,
        isCorrect: isOk,
        latencyMs: result.latencyMs,
        errorReason:
          result.kind === "wrong"
            ? (result.errorReason as JuniorGrammarErrorReason | undefined)
            : undefined,
      });
    }
  };

  const handleNext = () => {
    if (!cfg) return;
    setAnswered(false);
    setActiveQuestionIdx(null);

    // Check mastery after the answer is in state — use a microtask to read fresh state.
    setTimeout(() => {
      setState((s) => {
        const ls = s[currentLevel];
        const mastered = isMastered(ls, cfg);
        const maxed = maxedOut(ls, cfg);
        if (mastered) {
          // Unlock next level (or finish)
          if (currentLevel >= LEVELS.length) {
            setShowCelebration(true);
            fireEmojiConfetti({ vibrate: true, count: 80 });
            return {
              ...s,
              [currentLevel]: { ...ls, status: "completed" },
            };
          }
          fireEmojiConfetti({ vibrate: false, count: 24 });
          setCurrentLevel(currentLevel + 1);
          return {
            ...s,
            [currentLevel]: { ...ls, status: "completed" },
            [currentLevel + 1]: { ...s[currentLevel + 1], status: "active" },
          };
        }
        if (maxed && ls.retryQueue.length === 0) {
          // Hit max but didn't master and nothing to retry — gentle progression
          // (let them move on; UI shows incomplete badge)
          if (currentLevel < LEVELS.length) {
            setCurrentLevel(currentLevel + 1);
            return {
              ...s,
              [currentLevel]: { ...ls, status: "completed" },
              [currentLevel + 1]: { ...s[currentLevel + 1], status: "active" },
            };
          }
        }
        return s;
      });
    }, 0);
  };

  if (loading) {
    return (
      <main className="mx-auto min-h-screen max-w-3xl px-5 py-10 bg-gradient-to-br from-pink-50 via-white to-cyan-50 dark:from-pink-950/20 dark:via-background dark:to-cyan-950/20">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <RotateCw className="size-4 animate-spin text-pink-500" />
          <T>加载中...</T>
        </div>
      </main>
    );
  }

  if (!pt) {
    return (
      <main className="mx-auto min-h-screen max-w-3xl px-5 py-10 text-center bg-gradient-to-br from-pink-50 via-white to-cyan-50 dark:from-pink-950/20 dark:via-background dark:to-cyan-950/20">
        <p className="text-sm text-muted-foreground"><T>语法点不存在</T></p>
      </main>
    );
  }

  if (showCelebration) {
    return <CompletionScreen pt={pt} state={state} onRestart={() => {
      setState(makeInitialState());
      setCurrentLevel(1);
      setShowCelebration(false);
      setActiveQuestionIdx(null);
      setAnswered(false);
    }} />;
  }

  const backTo = pt.grade ? `/junior/grammar?grade=${pt.grade}` : "/junior/grammar";

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-6 space-y-5 bg-gradient-to-br from-pink-50 via-white to-cyan-50 dark:from-pink-950/20 dark:via-background dark:to-cyan-950/20">
      <Link
        to={backTo}
        className="inline-flex items-center gap-1.5 text-sm text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 transition-colors font-medium"
      >
        <ArrowLeft className="size-4" /> <T>返回考点列表</T>
      </Link>

      {/* ─── Header card — Playful style ─── */}
      <div className="rounded-3xl border-2 border-pink-200/60 dark:border-pink-800/40 bg-gradient-to-br from-pink-100/80 via-white to-cyan-100/80 dark:from-pink-950/50 dark:via-background dark:to-cyan-950/50 p-6 shadow-lg shadow-pink-200/30 dark:shadow-pink-900/20">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-pink-500 to-cyan-500 text-white px-3 py-1 text-xs font-bold shadow-sm">
          <Sparkles className="size-3" /> {pt.code ?? "G8"} · {pt.cefr ?? "B1"}
        </div>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight bg-gradient-to-r from-pink-600 via-purple-500 to-cyan-500 bg-clip-text text-transparent">{pt.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          ✨ <T>自适应学习 · 答对才能进阶！</T>
        </p>
      </div>

      {/* ─── Level rail — Playful cards ─── */}
      <div className="grid grid-cols-5 gap-3">
        {LEVELS.map((l) => {
          const s = state[l.id];
          const isActive = l.id === currentLevel && s.status === "active";
          const isCompleted = s.status === "completed";
          const isLocked = s.status === "locked";
          return (
            <div
              key={l.id}
              className={cn(
                "rounded-2xl border-2 p-3 flex flex-col items-center gap-1.5 transition-all duration-300 transform hover:scale-[1.02]",
                isActive && "border-pink-400 bg-gradient-to-br from-pink-100 to-cyan-100 dark:from-pink-950/60 dark:to-cyan-950/60 ring-2 ring-pink-400/50 shadow-lg shadow-pink-200/40",
                isCompleted && "border-cyan-300 bg-gradient-to-br from-cyan-50 to-pink-50 dark:from-cyan-950/30 dark:to-pink-950/30",
                isLocked && "border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 opacity-50",
              )}
            >
              <div className={cn(
                "relative grid size-11 place-items-center rounded-2xl shadow-md transition-transform",
                isActive && "bg-gradient-to-br from-pink-400 to-cyan-400 animate-pulse",
                isCompleted && "bg-gradient-to-br from-cyan-400 to-pink-400",
                isLocked && "bg-gray-100 dark:bg-gray-800",
                !isLocked && !isActive && !isCompleted && "bg-white dark:bg-background"
              )}>
                {isLocked ? <Lock className="size-4 text-gray-400" /> : <span className="text-xl">{l.emoji}</span>}
                {isCompleted && (
                  <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-gradient-to-br from-pink-500 to-cyan-500 text-white text-[10px] shadow-sm">
                    <Check className="size-3" />
                  </span>
                )}
              </div>
              <div className={cn(
                "text-[10px] font-bold",
                isActive ? "text-pink-600 dark:text-pink-400" : "text-muted-foreground"
              )}>Level {l.id}</div>
              <div className="text-[11px] font-bold leading-tight text-center">{l.name}</div>
              {isActive && (
                <div className="text-[9px] tabular-nums font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-900/40 rounded-full px-2 py-0.5">
                  {s.correct} / {s.answered} ✓
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ─── Active question card — Playful style ─── */}
      {activeQ ? (
        <div className="rounded-3xl border-2 border-pink-200/60 dark:border-pink-800/40 bg-white/90 dark:bg-card/90 backdrop-blur-sm p-6 space-y-4 shadow-xl shadow-pink-200/20 dark:shadow-pink-900/10">
          <div className="flex items-center justify-between text-xs">
            <span className="rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white px-3 py-1 font-bold shadow-sm">
              <T>Level</T> {cfg.id} · {cfg.name}
            </span>
            <div className="flex items-center gap-2">
              {(() => {
                const d = (activeQ.difficulty ?? 2) as Difficulty;
                const meta = d === 1
                  ? { label: "易", cn: "易", cls: "bg-gradient-to-r from-cyan-400 to-blue-400 text-white" }
                  : d === 3
                  ? { label: "难", cn: "难", cls: "bg-gradient-to-r from-pink-500 to-rose-500 text-white" }
                  : { label: "中", cn: "中", cls: "bg-gradient-to-r from-amber-400 to-orange-400 text-white" };
                return (
                  <span
                    title="adaptive difficulty — 答对会升级，答错会下调"
                    className={cn("rounded-full px-2.5 py-1 font-bold text-[11px] shadow-sm", meta.cls)}
                  >
                    {meta.cn}
                  </span>
                );
              })()}
              <span className="text-muted-foreground tabular-nums bg-gray-100 dark:bg-gray-800 rounded-full px-2.5 py-1">
                {lvlState.answered + 1} / {cfg.minQ}–{cfg.maxQ}
              </span>
            </div>
          </div>
          <GrammarQuestionCard
            key={activeQ.id}
            question={activeQ}
            index={lvlState.answered}
            onAnswered={handleAnswered}
          />
          {answered && (
            <div className="flex items-center justify-between gap-4 pt-2 border-t border-pink-100 dark:border-pink-900/30">
              <div className="text-xs text-muted-foreground">
                <span className="font-bold text-pink-600 dark:text-pink-400">{cfg.skillFocusCn}</span>
                <br />
                <span className="text-[11px]">{cfg.skillFocus}</span>
              </div>
              <button
                onClick={handleNext}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 hover:from-pink-600 hover:via-purple-600 hover:to-cyan-600 text-white px-5 py-2.5 text-sm font-bold shadow-lg shadow-pink-300/40 dark:shadow-pink-900/30 transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                {(() => {
                  const ls = lvlState;
                  if (isMastered(ls, cfg)) {
                    return currentLevel >= LEVELS.length ? "🎉 完成！" : "进入 Level " + (currentLevel + 1) + " →";
                  }
                  return "下一题 →";
                })()}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-3xl border-2 border-pink-200/60 dark:border-pink-800/40 bg-white/90 dark:bg-card/90 p-8 text-center space-y-2">
          <div className="inline-flex items-center gap-2">
            <RotateCw className="size-4 animate-spin text-pink-500" />
            <p className="text-sm text-muted-foreground"><T>加载题目中...</T></p>
          </div>
        </div>
      )}

      {/* ─── Mastery hint — Playful style ─── */}
      <div className="rounded-2xl bg-gradient-to-r from-pink-50 to-cyan-50 dark:from-pink-950/30 dark:to-cyan-950/30 border border-pink-200/50 dark:border-pink-800/30 p-4 text-center space-y-1">
        <div className="text-xs text-pink-700 dark:text-pink-300 font-medium">
          🎯 <T>当前关卡通关条件</T>：<T>至少答 {cfg.minQ} 题，正确率 ≥ {Math.round(cfg.threshold * 100)}%</T>
          {" · "}
          <T>答错的题会稍后重做</T>
        </div>
        <div className="text-[11px] text-cyan-600 dark:text-cyan-400">
          ⚡ <T>智能调节：答对升级（易 → 中 → 难），答错降级（难 → 中 → 易）</T>
        </div>
      </div>
    </main>
  );
}

/* ─────────────── Completion Screen — Playful Cards ─────────────── */
function CompletionScreen({
  pt,
  state,
  onRestart,
}: {
  pt: Pt;
  state: Record<number, LevelState>;
  onRestart: () => void;
}) {
  const totalAnswered = Object.values(state).reduce((a, s) => a + s.answered, 0);
  const totalCorrect = Object.values(state).reduce((a, s) => a + s.correct, 0);
  const pct = totalAnswered ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
  const backTo = pt.grade ? `/junior/grammar?grade=${pt.grade}` : "/junior/grammar";

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-10 space-y-6 text-center bg-gradient-to-br from-pink-50 via-white to-cyan-50 dark:from-pink-950/20 dark:via-background dark:to-cyan-950/20">
      {/* Hero celebration card */}
      <div className="rounded-3xl border-2 border-pink-300/60 dark:border-pink-800/40 bg-gradient-to-br from-pink-100 via-white to-cyan-100 dark:from-pink-950/50 dark:via-background dark:to-cyan-950/50 p-8 space-y-4 shadow-2xl shadow-pink-200/30 dark:shadow-pink-900/20 animate-hero-fade-up">
        <div className="text-6xl animate-pop-bounce">🎉</div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-pink-600 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
          <T>通关成功！</T>
        </h1>
        <p className="text-base text-muted-foreground">
          <T>你已经掌握了</T> <span className="font-bold bg-gradient-to-r from-pink-600 to-cyan-600 bg-clip-text text-transparent">{pt.title}</span>
        </p>
        <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-cyan-500 text-white px-5 py-2 text-sm font-bold shadow-lg shadow-pink-300/40">
          <Trophy className="size-5" />
          <T>总正确率</T> {pct}% · {totalCorrect} / {totalAnswered}
        </div>
      </div>

      {/* Level results — Playful cards */}
      <div className="grid grid-cols-5 gap-3">
        {LEVELS.map((l) => {
          const s = state[l.id];
          const isPerfect = s.answered > 0 && s.correct === s.answered;
          return (
            <div 
              key={l.id} 
              className={cn(
                "rounded-2xl border-2 p-4 space-y-2 transition-all duration-300 transform hover:scale-105",
                isPerfect 
                  ? "border-cyan-400 bg-gradient-to-br from-cyan-100 to-pink-100 dark:from-cyan-950/40 dark:to-pink-950/40 shadow-lg shadow-cyan-200/40" 
                  : "border-pink-200/60 dark:border-pink-800/40 bg-white/80 dark:bg-card/80"
              )}
            >
              <div className={cn(
                "text-2xl rounded-xl p-2",
                isPerfect && "animate-pop-bounce"
              )}>{l.emoji}</div>
              <div className="text-[11px] font-bold text-pink-600 dark:text-pink-400">{l.name}</div>
              <div className={cn(
                "text-xs tabular-nums font-bold rounded-full px-2 py-0.5",
                isPerfect 
                  ? "bg-gradient-to-r from-cyan-500 to-pink-500 text-white" 
                  : "bg-gray-100 dark:bg-gray-800 text-muted-foreground"
              )}>
                {s.correct} / {s.answered}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action buttons — Playful style */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          onClick={onRestart}
          className="inline-flex items-center gap-2 rounded-2xl border-2 border-pink-300 dark:border-pink-700 bg-white dark:bg-card hover:bg-pink-50 dark:hover:bg-pink-950/30 px-5 py-2.5 text-sm font-bold text-pink-600 dark:text-pink-400 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md"
        >
          <RotateCw className="size-4" /> <T>再做一遍</T>
        </button>
        <Link
          to={backTo}
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 hover:from-pink-600 hover:via-purple-600 hover:to-cyan-600 text-white px-6 py-2.5 text-sm font-bold shadow-lg shadow-pink-300/40 dark:shadow-pink-900/30 transition-all duration-300 transform hover:scale-105 active:scale-95"
        >
          <T>返回考点列表</T> →
        </Link>
      </div>
    </main>
  );
}
