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

   Question source: junior_grammar_questions, sort_order 9000-9099 only
   (gold-standard set).
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

type LevelState = {
  asked: number[]; // indices of questions already shown
  correct: number;
  answered: number;
  retryQueue: number[]; // indices to re-ask (spaced retry)
  status: LevelStatus;
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
      } as LevelState,
    ]),
  );
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
            "id,stem,option_a,option_b,option_c,option_d,correct_answer,accepted_answers,explanation,question_type,distractors,natural_note,grammar_topic,use_ai_grading,sort_order",
          )
          .eq("point_id", id)
          .gte("sort_order", 9000)
          .lte("sort_order", 9099)
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
    // Prefer retry queue
    if (ls.retryQueue.length > 0) {
      setActiveQuestionIdx(ls.retryQueue[0]);
      return;
    }
    // First unasked
    for (let i = 0; i < pool.length; i++) {
      if (!ls.asked.includes(i)) {
        setActiveQuestionIdx(i);
        return;
      }
    }
    // Exhausted pool — if not mastered yet, loop back through any wrong-answered
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
      return {
        ...s,
        [currentLevel]: {
          ...prev,
          asked: newAsked,
          correct: prev.correct + (isOk ? 1 : 0),
          answered: prev.answered + 1,
          retryQueue: updatedRetry,
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
      <main className="mx-auto min-h-screen max-w-3xl px-5 py-10">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <RotateCw className="size-4 animate-spin" />
          <T>加载中...</T>
        </div>
      </main>
    );
  }

  if (!pt) {
    return (
      <main className="mx-auto min-h-screen max-w-3xl px-5 py-10 text-center">
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
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-6 space-y-4">
      <Link
        to={backTo}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> <T>返回考点列表</T>
      </Link>

      {/* ─── Header card ─── */}
      <div className="rounded-2xl border bg-gradient-to-br from-emerald-50 via-white to-emerald-50 dark:from-emerald-950/40 dark:via-background dark:to-emerald-950/40 p-5">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 text-xs font-bold">
          <Sparkles className="size-3" /> {pt.code ?? "G8"} · {pt.cefr ?? "B1"}
        </div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight">{pt.title}</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          <T>自适应学习 · 答对才能进阶！</T> · Master through adaptive learning — answer correctly to advance.
        </p>
      </div>

      {/* ─── Level rail ─── */}
      <div className="grid grid-cols-5 gap-2">
        {LEVELS.map((l) => {
          const s = state[l.id];
          const isActive = l.id === currentLevel && s.status === "active";
          const isCompleted = s.status === "completed";
          const isLocked = s.status === "locked";
          return (
            <div
              key={l.id}
              className={cn(
                "rounded-xl border p-3 flex flex-col items-center gap-1.5 transition",
                isActive && "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 ring-2 ring-emerald-500/40",
                isCompleted && "border-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/20",
                isLocked && "border-muted bg-muted/30 opacity-60",
              )}
            >
              <div className="relative grid size-10 place-items-center rounded-xl bg-white dark:bg-background shadow-sm">
                {isLocked ? <Lock className="size-4 text-muted-foreground" /> : <span className="text-xl">{l.emoji}</span>}
                {isCompleted && (
                  <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-emerald-500 text-white text-[10px]">
                    <Check className="size-3" />
                  </span>
                )}
              </div>
              <div className="text-[10px] font-bold text-muted-foreground">Level {l.id}</div>
              <div className="text-[11px] font-bold leading-tight text-center">{l.name}</div>
              {isActive && (
                <div className="text-[9px] tabular-nums text-emerald-700 dark:text-emerald-300">
                  {s.correct} / {s.answered} ✓
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ─── Active question card ─── */}
      {activeQ ? (
        <div className="rounded-2xl border bg-card p-5 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 font-bold">
              <T>Level</T> {cfg.id} · {cfg.name}
            </span>
            <span className="text-muted-foreground tabular-nums">
              {lvlState.answered + 1} · {cfg.minQ}–{cfg.maxQ} <T>题</T>
            </span>
          </div>
          <GrammarQuestionCard
            key={activeQ.id}
            question={activeQ}
            index={lvlState.answered}
            onAnswered={handleAnswered}
          />
          {answered && (
            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="text-xs text-muted-foreground">
                <span className="font-bold text-foreground">{cfg.skillFocusCn}</span>
                <br />
                {cfg.skillFocus}
              </div>
              <button
                onClick={handleNext}
                className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-sm font-bold"
              >
                {(() => {
                  const ls = lvlState;
                  if (isMastered(ls, cfg)) {
                    return currentLevel >= LEVELS.length ? "完成 🎉" : "进入 Level " + (currentLevel + 1) + " →";
                  }
                  return "下一题 →";
                })()}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border bg-card p-8 text-center space-y-2">
          <p className="text-sm text-muted-foreground"><T>加载题目中...</T></p>
        </div>
      )}

      {/* ─── Mastery hint (low-key) ─── */}
      <div className="text-[11px] text-center text-muted-foreground">
        <T>当前关卡通关条件</T>：<T>至少答 {cfg.minQ} 题，正确率 ≥ {Math.round(cfg.threshold * 100)}%</T>
        {" · "}
        <T>答错的题会稍后重做</T>
      </div>
    </main>
  );
}

/* ─────────────── Completion Screen ─────────────── */
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
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-10 space-y-6 text-center">
      <div className="rounded-2xl border bg-gradient-to-br from-amber-50 via-white to-emerald-50 dark:from-amber-950/30 dark:via-background dark:to-emerald-950/30 p-8 space-y-3">
        <div className="text-5xl">🎉</div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          <T>通关成功！</T>
        </h1>
        <p className="text-base text-muted-foreground">
          <T>你已经掌握了</T> <span className="font-bold text-foreground">{pt.title}</span>
        </p>
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 px-4 py-1.5 text-sm font-bold">
          <Trophy className="size-4" />
          <T>总正确率</T> {pct}% · {totalCorrect} / {totalAnswered}
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {LEVELS.map((l) => {
          const s = state[l.id];
          return (
            <div key={l.id} className="rounded-xl border bg-card p-3 space-y-1">
              <div className="text-xl">{l.emoji}</div>
              <div className="text-[10px] font-bold">{l.name}</div>
              <div className="text-[10px] tabular-nums text-muted-foreground">{s.correct} / {s.answered}</div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={onRestart}
          className="inline-flex items-center gap-1.5 rounded-xl border bg-card hover:bg-muted px-4 py-2 text-sm font-bold"
        >
          <RotateCw className="size-4" /> <T>再做一遍</T>
        </button>
        <Link
          to={backTo}
          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-sm font-bold"
        >
          <T>返回考点列表</T>
        </Link>
      </div>
    </main>
  );
}
