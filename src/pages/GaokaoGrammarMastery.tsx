import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import BackLink from "@/components/BackLink";
import { ArrowLeft, Lock, Check, Sparkles, RotateCw, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  GrammarQuestionCard,
  type GrammarQuestion,
  type AnswerResult,
} from "@/components/grammar/GrammarQuestionCard";
import {
  recordGrammarAttempt,
  type GrammarErrorReason,
} from "@/lib/grammarFsrs";
import { recordSeniorGrammarMistake } from "@/lib/seniorGrammarMistake";
import { awardForCorrect, notifyWrong } from "@/lib/coins";
import { fireEmojiConfetti } from "@/lib/feedback";
import { T } from "@/i18n/T";
import {
  GAOKAO_GRAMMAR_LEVELS,
  type GaokaoGrammarLevelKey,
} from "@/lib/gaokaoGrammarLevels";
import {
  getGrammarPointBySlug,
  getGrammarQuestionsForPoint,
  grammarMetaTag,
  pepSourceLabel,
} from "@/lib/gaokaoContent";

type LevelKey = GaokaoGrammarLevelKey;
type LevelStatus = "locked" | "active" | "completed";
type LevelConfig = (typeof GAOKAO_GRAMMAR_LEVELS)[number];
type Difficulty = 1 | 2 | 3;

type LevelState = {
  asked: number[];
  correct: number;
  answered: number;
  retryQueue: number[];
  status: LevelStatus;
  targetDifficulty: Difficulty;
};

const LEVELS = GAOKAO_GRAMMAR_LEVELS.map((l) => ({
  ...l,
  skillFocus: l.skillFocusCn,
}));

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

function pickByTargetDifficulty(
  pool: GrammarQuestion[],
  asked: number[],
  targetDifficulty: Difficulty,
): number | null {
  const unaskedIdx = pool.map((_, i) => i).filter((i) => !asked.includes(i));
  if (unaskedIdx.length === 0) return null;
  const exact = unaskedIdx.filter((i) => (pool[i].difficulty ?? 2) === targetDifficulty);
  if (exact.length > 0) return exact[0];
  return unaskedIdx
    .map((i) => ({ i, d: Math.abs((pool[i].difficulty ?? 2) - targetDifficulty) }))
    .sort((a, b) => a.d - b.d)[0].i;
}

function isMastered(state: LevelState, cfg: LevelConfig): boolean {
  if (state.answered < cfg.minQ) return false;
  if (state.retryQueue.length > 0) return false;
  return state.correct / state.answered >= cfg.threshold;
}

function maxedOut(state: LevelState, cfg: LevelConfig): boolean {
  return state.answered >= cfg.maxQ && !isMastered(state, cfg);
}

export default function GaokaoGrammarMastery() {
  const { slug } = useParams<{ slug: string }>();
  const pt = slug ? getGrammarPointBySlug(slug) : null;
  const [byType, setByType] = useState<Record<LevelKey, GrammarQuestion[]>>({
    mcq: [],
    fill: [],
    correction: [],
    transform: [],
    translation: [],
  });
  const [loading, setLoading] = useState(true);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [state, setState] = useState<Record<number, LevelState>>(() => makeInitialState());
  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }
    const allQs = getGrammarQuestionsForPoint(slug);
    const buckets: Record<LevelKey, GrammarQuestion[]> = {
      mcq: [],
      fill: [],
      correction: [],
      transform: [],
      translation: [],
    };
    for (const q of allQs) {
      const t = (q.question_type || "mcq") as LevelKey;
      if (buckets[t]) buckets[t].push(q);
    }
    setByType(buckets);
    setLoading(false);
    setState(makeInitialState());
    setCurrentLevel(1);
    setActiveQuestionIdx(null);
    setAnswered(false);
    setShowCelebration(false);
  }, [slug]);

  useEffect(() => {
    if (loading || showCelebration) return;
    const cfg = LEVELS.find((l) => l.id === currentLevel);
    if (!cfg) return;
    const ls = state[currentLevel];
    const pool = byType[cfg.key];
    if (!pool || pool.length === 0) {
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
    if (activeQuestionIdx !== null) return;
    if (ls.retryQueue.length > 0) {
      setActiveQuestionIdx(ls.retryQueue[0]);
      return;
    }
    const next = pickByTargetDifficulty(pool, ls.asked, ls.targetDifficulty);
    if (next !== null) {
      setActiveQuestionIdx(next);
      return;
    }
    if (!isMastered(ls, cfg) && pool.length > 0) setActiveQuestionIdx(0);
  }, [loading, currentLevel, state, byType, activeQuestionIdx, showCelebration]);

  const cfg = useMemo(() => LEVELS.find((l) => l.id === currentLevel)!, [currentLevel]);
  const pool = byType[cfg.key];
  const activeQ = activeQuestionIdx !== null && pool ? pool[activeQuestionIdx] : null;
  const lvlState = state[currentLevel];

  const handleAnswered = (result: AnswerResult) => {
    if (answered || activeQuestionIdx === null || !activeQ || !pt) return;
    setAnswered(true);
    const isOk = result.kind === "correct" || result.kind === "acceptable";
    // 错题写入(错→存全选项快照;对→按 source_key 自动移出)。纯新增,失败只 warn,不阻断做题。
    void recordSeniorGrammarMistake({ question: activeQ, result, isCorrect: isOk, sourceLabel: pt.title });

    setState((s) => {
      const prev = s[currentLevel];
      const newAsked = prev.asked.includes(activeQuestionIdx)
        ? prev.asked
        : [...prev.asked, activeQuestionIdx];
      const newRetry = prev.retryQueue.filter((i) => i !== activeQuestionIdx);
      const updatedRetry = isOk
        ? newRetry
        : [...newRetry.slice(0, 2), activeQuestionIdx, ...newRetry.slice(2)];
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

    if (isOk) {
      awardForCorrect(0, "gaokao_grammar", activeQ.id, "gaokao_grammar", result.latencyMs);
    } else {
      notifyWrong();
    }
    recordGrammarAttempt({
      pointId: pt.id,
      questionType: activeQ.question_type || cfg.key,
      isCorrect: isOk,
      latencyMs: result.latencyMs,
      errorReason:
        result.kind === "wrong"
          ? (result.errorReason as GrammarErrorReason | undefined)
          : undefined,
    });
  };

  const handleNext = () => {
    if (!cfg) return;
    setAnswered(false);
    setActiveQuestionIdx(null);
    setTimeout(() => {
      setState((s) => {
        const ls = s[currentLevel];
        const mastered = isMastered(ls, cfg);
        const maxed = maxedOut(ls, cfg);
        if (mastered) {
          if (currentLevel >= LEVELS.length) {
            setShowCelebration(true);
            fireEmojiConfetti({ vibrate: true, count: 80 });
            return { ...s, [currentLevel]: { ...ls, status: "completed" } };
          }
          fireEmojiConfetti({ vibrate: false, count: 24 });
          setCurrentLevel(currentLevel + 1);
          return {
            ...s,
            [currentLevel]: { ...ls, status: "completed" },
            [currentLevel + 1]: { ...s[currentLevel + 1], status: "active" },
          };
        }
        if (maxed && ls.retryQueue.length === 0 && currentLevel < LEVELS.length) {
          setCurrentLevel(currentLevel + 1);
          return {
            ...s,
            [currentLevel]: { ...ls, status: "completed" },
            [currentLevel + 1]: { ...s[currentLevel + 1], status: "active" },
          };
        }
        return s;
      });
    }, 0);
  };

  const backTo = pt?.year_band
    ? `/gaokao/grammar?year_band=${pt.year_band}`
    : "/gaokao/grammar";

  if (loading) {
    return (
      <main className="playful-shell grid min-h-screen place-items-center">
        <div className="playful-card px-8 py-6 text-center">
          <RotateCw className="mx-auto size-8 animate-spin text-pink-400" />
          <p className="mt-3 text-sm font-bold text-muted-foreground"><T>加载中...</T></p>
        </div>
      </main>
    );
  }

  if (!pt) {
    return (
      <main className="playful-shell mx-auto grid min-h-screen max-w-3xl place-items-center px-5 py-10">
        <div className="playful-card w-full max-w-md px-6 py-8 text-center">
          <p className="text-lg font-extrabold"><T>考点不存在</T></p>
          <BackLink
            to="/gaokao/grammar"
            className="playful-btn playful-btn-cyan mt-6 inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-teal-400 px-6 py-2.5 text-sm text-white"
          >
            <ArrowLeft className="size-4" />
            <T>返回语法地图</T>
          </BackLink>
        </div>
      </main>
    );
  }

  if (showCelebration) {
    const totalAnswered = Object.values(state).reduce((a, s) => a + s.answered, 0);
    const totalCorrect = Object.values(state).reduce((a, s) => a + s.correct, 0);
    const pct = totalAnswered ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
    return (
      <main className="playful-shell mx-auto min-h-screen max-w-3xl px-5 py-10 space-y-6 text-center">
        <section className="relative overflow-hidden rounded-[2rem] border-2 border-pink-200/80 bg-gradient-to-br from-pink-100 via-white to-cyan-100 p-8 space-y-3 dark:border-pink-900/50 dark:from-pink-950/40 dark:via-background dark:to-cyan-950/40">
          <div className="relative mx-auto grid size-20 place-items-center rounded-full bg-gradient-to-br from-pink-400 to-cyan-400 text-white shadow-lg">
            <Trophy className="size-10" />
          </div>
          <h1 className="relative text-3xl font-extrabold bg-gradient-to-r from-pink-600 to-cyan-600 bg-clip-text text-transparent">
            <T>通关成功！</T>
          </h1>
          <p className="relative text-muted-foreground">
            <T>你已掌握</T> <span className="font-bold text-foreground">{pt.title}</span>
          </p>
          <div className="relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500/15 to-cyan-500/15 px-4 py-1.5 text-sm font-bold text-pink-700 dark:text-pink-300">
            <Trophy className="size-4" />
            <T>总正确率</T> {pct}% · {totalCorrect} / {totalAnswered}
          </div>
        </section>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              setState(makeInitialState());
              setCurrentLevel(1);
              setShowCelebration(false);
              setActiveQuestionIdx(null);
              setAnswered(false);
            }}
            className="playful-btn inline-flex items-center gap-1.5 bg-gradient-to-r from-pink-500 to-rose-400 px-5 py-2.5 text-sm text-white"
          >
            <RotateCw className="size-4" /> <T>再做一遍</T>
          </button>
          <BackLink
            to={backTo}
            className="playful-btn playful-btn-cyan inline-flex items-center gap-1.5 bg-gradient-to-r from-cyan-500 to-teal-400 px-5 py-2.5 text-sm text-white"
          >
            <T>返回语法地图</T>
          </BackLink>
        </div>
      </main>
    );
  }

  const metaTag = grammarMetaTag(pt);

  return (
    <main className="playful-shell mx-auto min-h-screen max-w-3xl px-5 py-6 space-y-4">
      <BackLink
        to={backTo}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> <T>返回语法地图</T>
      </BackLink>

      <header className="playful-card relative overflow-hidden p-5">
        <span className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-pink-200/40 blur-2xl" />
        <span className="pointer-events-none absolute -bottom-4 -left-4 size-20 rounded-full bg-cyan-200/40 blur-2xl" />
        <div className="relative inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-pink-100 to-cyan-100 px-2.5 py-0.5 text-xs font-bold text-pink-600 dark:from-pink-950/60 dark:to-cyan-950/60 dark:text-pink-300">
          <Sparkles className="size-3" /> {metaTag}
        </div>
        <h1 className="relative mt-2 text-2xl font-extrabold tracking-tight bg-gradient-to-r from-pink-600 to-cyan-600 bg-clip-text text-transparent">
          {pt.title}
        </h1>
        <p className="relative mt-1 text-xs text-muted-foreground">{pepSourceLabel(pt)}</p>
        <p className="relative mt-1 text-xs text-muted-foreground">
          <T>自适应学习 · 答对才能进阶！</T>
        </p>
      </header>

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
                "rounded-2xl border-2 p-3 flex flex-col items-center gap-1.5 transition",
                isActive &&
                  "border-pink-400 bg-gradient-to-br from-pink-50 to-cyan-50 dark:from-pink-950/40 dark:to-cyan-950/30 ring-2 ring-pink-300/40",
                isCompleted && "border-cyan-300 bg-cyan-50/60 dark:bg-cyan-950/20",
                isLocked && "border-muted bg-muted/30 opacity-60",
              )}
            >
              <div className="relative grid size-10 place-items-center rounded-xl bg-white dark:bg-background shadow-sm">
                {isLocked ? (
                  <Lock className="size-4 text-muted-foreground" />
                ) : (
                  <span className="text-xl">{l.emoji}</span>
                )}
                {isCompleted && (
                  <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-emerald-500 text-white text-[10px]">
                    <Check className="size-3" />
                  </span>
                )}
              </div>
              <div className="text-[10px] font-bold text-muted-foreground">Level {l.id}</div>
              <div className="text-[11px] font-bold leading-tight text-center">{l.name}</div>
              {isActive && (
                <div className="text-[9px] tabular-nums text-pink-600 dark:text-pink-300">
                  {s.correct} / {s.answered} ✓
                </div>
              )}
            </div>
          );
        })}
      </div>

      {activeQ ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs px-1">
            <span className="rounded-full bg-gradient-to-r from-pink-100 to-cyan-100 px-2.5 py-0.5 font-bold text-pink-600 dark:from-pink-950/50 dark:to-cyan-950/50 dark:text-pink-300">
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
            <div className="flex items-center justify-end pt-1">
              <button
                type="button"
                onClick={handleNext}
                className="playful-btn playful-btn-cyan shrink-0 inline-flex items-center gap-1 bg-gradient-to-r from-cyan-500 to-teal-400 px-4 py-2 text-sm text-white"
              >
                {isMastered(lvlState, cfg)
                  ? currentLevel >= LEVELS.length
                    ? "完成 🎉"
                    : `进入 Level ${currentLevel + 1} →`
                  : "下一题 →"}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="playful-card p-8 text-center">
          <p className="text-sm text-muted-foreground"><T>加载题目中...</T></p>
        </div>
      )}

      <div className="text-[11px] text-center text-muted-foreground space-y-0.5">
        <div>
          <T>过关条件</T>：<T>至少 {cfg.minQ} 题，正确率 ≥ {Math.round(cfg.threshold * 100)}%</T>
          {" · "}
          <T>错题稍后重做</T>
        </div>
        <div className="text-[10px] opacity-80">
          <T>答对升级（易→中→难），答错降级（难→中→易）</T>
        </div>
      </div>
    </main>
  );
}
