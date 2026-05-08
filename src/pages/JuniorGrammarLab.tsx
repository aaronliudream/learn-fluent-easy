import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, Lock, RotateCw, Sparkles, Star, Target, Trophy, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { awardForCorrect, notifyWrong, awardForBlock } from "@/lib/coins";
import { fireEmojiConfetti } from "@/lib/feedback";
import {
  recordJuniorGrammarAttempt,
  type JuniorGrammarErrorReason,
} from "@/lib/juniorGrammarFsrs";
import {
  GrammarQuestionCard,
  type GrammarQuestion,
  type AnswerResult,
} from "@/components/grammar/GrammarQuestionCard";
import TutorChat from "@/components/tutor/TutorChat";
import PaywallDialog from "@/components/PaywallDialog";
import { consumeQuestionQuota } from "@/lib/quota";
import { TeacherLessonPlayer, type LessonSegment } from "@/components/grammar/TeacherLessonPlayer";
import { ImmersionCards, type ImmersionCard } from "@/components/grammar/ImmersionCards";
import ReactMarkdown from "react-markdown";

/**
 * Junior Grammar 全攻克 Lab — gamified, level-based learning experience
 * inspired by /grammar-lab/subjunctive but data-driven from the same DB
 * tables every other junior grammar point uses.
 *
 *   • 3 levels per point (新手 / 熟练 / 大师), bucketed by question difficulty
 *   • Stars per level (60% / 80% / 100%)
 *   • XP, streak, level-clear bonus, achievement unlocks
 *   • Per-point progress persisted to localStorage + FSRS recorded normally
 *   • Reuses GrammarQuestionCard for actual question UI
 */

type Pt = {
  id: string;
  title: string;
  cefr: string;
  mnemonic: string | null;
  explanation_md: string | null;
  teacher_script: LessonSegment[] | null;
  immersion_cards: ImmersionCard[] | null;
};

type Level = {
  id: 1 | 2 | 3;
  name: string;
  emoji: string;
  desc: string;
  color: string;
  questions: GrammarQuestion[];
};

type LevelProgress = {
  bestStars: number;
  bestPct: number;
  attempts: number;
  lastPlayedAt: string;
};

type LabState = {
  xp: number;
  levels: Record<number, LevelProgress>;
  achievements: string[];
};

const QUESTIONS_PER_LEVEL = 5;

const LEVEL_META: Record<1 | 2 | 3, Omit<Level, "id" | "questions">> = {
  1: {
    name: "新手训练",
    emoji: "🌱",
    desc: "基础题目，建立信心",
    color: "from-emerald-400 to-teal-500",
  },
  2: {
    name: "熟练运用",
    emoji: "⚡",
    desc: "进阶题目，灵活应用",
    color: "from-sky-400 to-indigo-500",
  },
  3: {
    name: "大师挑战",
    emoji: "👑",
    desc: "高难题目，挑战满分",
    color: "from-amber-400 to-rose-500",
  },
};

const ACHIEVEMENTS: { id: string; emoji: string; name: string; desc: string }[] = [
  { id: "first_clear", emoji: "🎓", name: "初出茅庐", desc: "首次通关任意一关" },
  { id: "all_three", emoji: "📚", name: "全关通过", desc: "通关所有 3 个关卡" },
  { id: "perfect_lv1", emoji: "🌟", name: "新手满分", desc: "新手关满星" },
  { id: "perfect_lv2", emoji: "✨", name: "熟练满分", desc: "熟练关满星" },
  { id: "perfect_lv3", emoji: "👑", name: "大师满分", desc: "大师关满星" },
  { id: "all_perfect", emoji: "🏆", name: "全攻克", desc: "三关全部满星" },
  { id: "streak10", emoji: "🔥", name: "十连击", desc: "单关连对 10 题" },
];

function loadState(pointId: string): LabState {
  try {
    const raw = localStorage.getItem(`junior-lab:${pointId}`);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return { xp: 0, levels: {}, achievements: [] };
}
function saveState(pointId: string, state: LabState) {
  try {
    localStorage.setItem(`junior-lab:${pointId}`, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

function starsFromPct(pct: number): number {
  if (pct >= 100) return 3;
  if (pct >= 80) return 2;
  if (pct >= 60) return 1;
  return 0;
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Bucket questions into 3 levels by difficulty; backfill empty buckets from neighbours. */
function bucketLevels(qs: (GrammarQuestion & { difficulty?: number | null })[]): Level[] {
  const by = { 1: [] as GrammarQuestion[], 2: [] as GrammarQuestion[], 3: [] as GrammarQuestion[] };
  for (const q of qs) {
    const d = (q as any).difficulty ?? 2;
    const k = (Math.min(3, Math.max(1, d)) as 1 | 2 | 3);
    by[k].push(q);
  }
  // Backfill: if a bucket is empty, steal from the nearest non-empty
  ([1, 2, 3] as const).forEach((k) => {
    if (by[k].length === 0) {
      const others = ([1, 2, 3] as const).filter((x) => x !== k && by[x].length > 1);
      if (others.length) {
        const donor = others[0];
        const moved = by[donor].shift();
        if (moved) by[k].push(moved);
      }
    }
  });
  return ([1, 2, 3] as const).map((id) => ({
    id,
    ...LEVEL_META[id],
    questions: by[id],
  }));
}

export default function JuniorGrammarLab() {
  const { id } = useParams<{ id: string }>();
  const [pt, setPt] = useState<Pt | null>(null);
  const [allQs, setAllQs] = useState<(GrammarQuestion & { difficulty?: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<LabState>({ xp: 0, levels: {}, achievements: [] });

  // Active session
  const [active, setActive] = useState<Level | null>(null);
  const [sessionQs, setSessionQs] = useState<GrammarQuestion[]>([]);
  const [results, setResults] = useState<Record<string, AnswerResult>>({});
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [tutorFor, setTutorFor] = useState<GrammarQuestion | null>(null);
  const [paywall, setPaywall] = useState({ open: false, used: 5, limit: 5 });
  const [unlockedAch, setUnlockedAch] = useState<string | null>(null);

  // Pre-level briefing & overview screens
  const [briefingFor, setBriefingFor] = useState<Level | null>(null);
  const [overview, setOverview] = useState<"lesson" | "immersion" | null>(null);

  const finishedRef = useRef(false);

  useEffect(() => {
    if (!id) return;
    setState(loadState(id));
    (async () => {
      setLoading(true);
      const [a, b] = await Promise.all([
        supabase
          .from("junior_grammar_points")
          .select("id,title,cefr,mnemonic,explanation_md,teacher_script,immersion_cards")
          .eq("id", id)
          .maybeSingle(),
        supabase
          .from("junior_grammar_questions")
          .select(
            "id,stem,option_a,option_b,option_c,option_d,correct_answer,accepted_answers,explanation,question_type,distractors,natural_note,grammar_topic,use_ai_grading,difficulty",
          )
          .eq("point_id", id)
          .order("sort_order"),
      ]);
      setPt(a.data as Pt);
      setAllQs((b.data ?? []) as any);
      setLoading(false);
    })();
  }, [id]);

  const levels = useMemo(() => bucketLevels(allQs), [allQs]);

  // ─── Achievement helper ───
  const grantAch = (state: LabState, achId: string): LabState => {
    if (state.achievements.includes(achId)) return state;
    const next = { ...state, achievements: [...state.achievements, achId] };
    setUnlockedAch(achId);
    setTimeout(() => setUnlockedAch((x) => (x === achId ? null : x)), 4000);
    return next;
  };

  // ─── Open level briefing first ───
  const openLevel = (lv: Level) => {
    if (lv.questions.length === 0) return;
    setBriefingFor(lv);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  // ─── Actually start a level (after briefing) ───
  const startLevel = (lv: Level) => {
    if (lv.questions.length === 0) return;
    finishedRef.current = false;
    setResults({});
    setStreak(0);
    setBestStreak(0);
    setSessionQs(shuffle(lv.questions).slice(0, QUESTIONS_PER_LEVEL));
    setActive(lv);
    setBriefingFor(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const exitLevel = () => {
    setActive(null);
    setResults({});
    setStreak(0);
    setBestStreak(0);
    finishedRef.current = false;
  };

  // ─── Per-question result ───
  const onAnswered = async (q: GrammarQuestion, result: AnswerResult) => {
    if (results[q.id]) return;
    const quota = await consumeQuestionQuota();
    if (!quota.allowed) {
      setPaywall({ open: true, used: quota.used, limit: quota.limit });
      return;
    }
    setResults((prev) => ({ ...prev, [q.id]: result }));
    const ok = result.kind === "correct" || result.kind === "acceptable";
    if (ok) {
      const next = streak + 1;
      setStreak(next);
      setBestStreak((b) => Math.max(b, next));
      await awardForCorrect(next, "junior_grammar_lab", q.id, "junior_grammar", result.latencyMs);
      const correctSoFar = Object.values({ ...results, [q.id]: result }).filter(
        (r) => r.kind === "correct" || r.kind === "acceptable",
      ).length;
      if (correctSoFar % 5 === 0) await awardForBlock("junior_grammar");
    } else {
      setStreak(0);
      notifyWrong();
    }
    if (pt) {
      await recordJuniorGrammarAttempt({
        pointId: pt.id,
        questionType: q.question_type || "mcq",
        isCorrect: ok,
        latencyMs: result.latencyMs,
        errorReason:
          result.kind === "wrong"
            ? (result.errorReason as JuniorGrammarErrorReason | undefined)
            : undefined,
      });
    }
  };

  // ─── Compute session score ───
  const correctCount = Object.values(results).filter(
    (r) => r.kind === "correct" || r.kind === "acceptable",
  ).length;
  const total = sessionQs.length;
  const allDone = active && total > 0 && Object.keys(results).length === total;
  const pct = total ? Math.round((correctCount / total) * 100) : 0;
  const stars = starsFromPct(pct);

  // ─── On finish → record progress ───
  useEffect(() => {
    if (!allDone || !active || !pt || finishedRef.current) return;
    finishedRef.current = true;

    let next = { ...state };
    const prev = next.levels[active.id];
    const prevStars = prev?.bestStars ?? 0;
    const prevPct = prev?.bestPct ?? 0;
    const newStars = Math.max(prevStars, stars);
    const newPct = Math.max(prevPct, pct);
    next.levels = {
      ...next.levels,
      [active.id]: {
        bestStars: newStars,
        bestPct: newPct,
        attempts: (prev?.attempts ?? 0) + 1,
        lastPlayedAt: new Date().toISOString(),
      },
    };
    // XP: 10 per star + 30 clear bonus if ≥1 star
    next.xp += stars * 10 + (stars >= 1 ? 30 : 0);

    // Achievements
    if (stars >= 1) next = grantAch(next, "first_clear");
    if (stars === 3) next = grantAch(next, `perfect_lv${active.id}`);
    if (bestStreak >= 10) next = grantAch(next, "streak10");
    const lvCleared = Object.values(next.levels).filter((l) => l.bestStars >= 1).length;
    if (lvCleared >= 3) next = grantAch(next, "all_three");
    const lvPerfect = Object.values(next.levels).filter((l) => l.bestStars === 3).length;
    if (lvPerfect >= 3) next = grantAch(next, "all_perfect");

    setState(next);
    saveState(pt.id, next);

    if (pct >= 70) {
      fireEmojiConfetti({ vibrate: pct === 100, count: pct === 100 ? 60 : 36 });
    }
  }, [allDone, active, pt, stars, pct, bestStreak, state]);

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center text-sm text-muted-foreground">
        加载中…
      </main>
    );
  }
  if (!pt) {
    return (
      <main className="mx-auto min-h-screen max-w-2xl px-5 py-8">
        <Link to="/junior/grammar" className="mb-3 inline-flex items-center gap-1 text-sm">
          <ArrowLeft className="size-4" /> 返回考点列表
        </Link>
        <p className="text-sm text-muted-foreground">考点未找到</p>
      </main>
    );
  }

  // ════════════ COURSE OVERVIEW (lesson / immersion) ════════════
  if (overview === "lesson" && pt.teacher_script && pt.teacher_script.length > 0) {
    return (
      <CosmicShell>
        <main className="mx-auto min-h-screen max-w-2xl px-5 py-6">
          <button
            onClick={() => setOverview(null)}
            className="mb-3 inline-flex items-center gap-1 text-sm text-white/80 hover:text-white"
          >
            <ArrowLeft className="size-4" /> 返回 Lab
          </button>
          <TeacherLessonPlayer
            segments={pt.teacher_script}
            pointTitle={pt.title}
            onContinue={() => setOverview("immersion")}
            onSkip={() => setOverview(null)}
          />
        </main>
      </CosmicShell>
    );
  }
  if (overview === "immersion" && pt.immersion_cards && pt.immersion_cards.length > 0) {
    return (
      <CosmicShell>
        <main className="mx-auto min-h-screen max-w-2xl px-5 py-6">
          <button
            onClick={() => setOverview(null)}
            className="mb-3 inline-flex items-center gap-1 text-sm text-white/80 hover:text-white"
          >
            <ArrowLeft className="size-4" /> 返回 Lab
          </button>
          <ImmersionCards cards={pt.immersion_cards} onContinue={() => setOverview(null)} />
        </main>
      </CosmicShell>
    );
  }

  // ════════════ LEVEL BRIEFING (pre-game) ════════════
  if (briefingFor) {
    const lv = briefingFor;
    const sampleQ = lv.questions[0];
    return (
      <CosmicShell>
        <main className="mx-auto min-h-screen max-w-2xl px-5 py-6">
          <button
            onClick={() => setBriefingFor(null)}
            className="mb-3 inline-flex items-center gap-1 text-sm text-white/80 hover:text-white"
          >
            <ArrowLeft className="size-4" /> 返回关卡地图
          </button>

          <div
            className={cn(
              "rounded-3xl bg-gradient-to-br p-6 sm:p-8 text-white shadow-xl",
              lv.color,
            )}
          >
            <div className="text-[11px] font-bold uppercase tracking-widest opacity-90">
              Level {lv.id} · 课前简报
            </div>
            <h1 className="mt-1 text-3xl font-extrabold">
              {lv.emoji} {lv.name}
            </h1>
            <p className="mt-1 text-sm opacity-90">{lv.desc}</p>

            {/* Hook */}
            <div className="mt-5 rounded-2xl bg-white/15 backdrop-blur p-4">
              <div className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">
                🎯 本关任务
              </div>
              <div className="text-sm font-bold">
                完成 {Math.min(lv.questions.length, QUESTIONS_PER_LEVEL)} 题{lv.id === 3 ? "高难度" : lv.id === 2 ? "进阶" : "基础"}训练，争取 60% 通关 / 80% 双星 / 100% 满星。
              </div>
            </div>

            {/* Mnemonic —核心公式 */}
            {pt.mnemonic && (
              <div className="mt-3 rounded-2xl bg-white/15 backdrop-blur p-4">
                <div className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">
                  🔑 核心记忆
                </div>
                <div className="text-base font-extrabold">{pt.mnemonic}</div>
              </div>
            )}

            {/* 例句 from sample question */}
            {sampleQ && (
              <div className="mt-3 rounded-2xl bg-white/15 backdrop-blur p-4">
                <div className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">
                  📖 题型预览
                </div>
                <div className="text-sm font-bold opacity-95">{sampleQ.stem}</div>
              </div>
            )}
          </div>

          <button
            onClick={() => startLevel(lv)}
            className="mt-6 w-full rounded-full bg-gradient-to-r from-amber-400 to-rose-500 px-6 py-4 text-base font-extrabold text-white shadow-xl hover:shadow-2xl transition active:scale-[0.99]"
          >
            🚀 开始挑战 Level {lv.id}
          </button>

          <button
            onClick={() => setBriefingFor(null)}
            className="mt-3 w-full rounded-full bg-white/10 backdrop-blur px-6 py-2 text-sm font-bold text-white/80 hover:text-white border border-white/20"
          >
            返回地图
          </button>
        </main>
      </CosmicShell>
    );
  }

  // ════════════ ACTIVE LEVEL VIEW ════════════
  if (active) {
    return (
      <CosmicShell>
      <main className="mx-auto min-h-screen max-w-2xl px-5 py-6 relative">
        <button
          onClick={exitLevel}
          className="mb-3 inline-flex items-center gap-1 text-sm text-white/80 hover:text-white"
        >
          <ArrowLeft className="size-4" /> 返回关卡地图
        </button>

        {/* Level header */}
        <div
          className={cn(
            "rounded-3xl bg-gradient-to-br p-5 text-white shadow-md",
            active.color,
          )}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest opacity-90">
                Level {active.id}
              </div>
              <h1 className="mt-0.5 text-2xl font-extrabold">
                {active.emoji} {active.name}
              </h1>
              <p className="text-xs opacity-90 mt-0.5">{active.desc}</p>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold uppercase tracking-widest opacity-90">连击</div>
              <div className="text-3xl font-extrabold tabular-nums">
                {streak}
                {streak >= 3 && <span className="text-base"> 🔥</span>}
              </div>
            </div>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/30">
            <div
              className="h-full bg-white transition-all"
              style={{ width: `${total ? (Object.keys(results).length / total) * 100 : 0}%` }}
            />
          </div>
          <div className="mt-1 text-right text-[11px] font-bold opacity-90 tabular-nums">
            {Object.keys(results).length} / {total}
          </div>
        </div>

        {/* Mnemonic */}
        {pt.mnemonic && (
          <div className="mt-4 rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-rose-50 dark:from-amber-950/30 dark:to-rose-950/20 p-3 text-center">
            <div className="text-[10px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-300">
              🔑 一句话记住
            </div>
            <div className="mt-0.5 text-sm font-bold text-amber-800 dark:text-amber-200">
              {pt.mnemonic}
            </div>
          </div>
        )}

        {/* Questions */}
        <div className="mt-5 space-y-4">
          {sessionQs.map((q, i) => (
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

        {/* Result panel */}
        {allDone && (
          <section className="mt-6 rounded-3xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-rose-50 dark:from-amber-950/30 dark:to-rose-950/30 p-6 text-center shadow-sm">
            <Trophy className="mx-auto size-12 text-amber-500" />
            <h2 className="mt-2 text-xl font-extrabold">
              {pct === 100
                ? "🌟 满分通关！"
                : pct >= 80
                  ? "✨ 出色完成！"
                  : pct >= 60
                    ? "👍 顺利通关！"
                    : "💪 再来一次会更好！"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              答对 {correctCount} / {total} · 正确率{" "}
              <span className="font-extrabold text-amber-600">{pct}%</span>
            </p>
            <div className="mt-3 flex items-center justify-center gap-1.5">
              {[1, 2, 3].map((s) => (
                <Star
                  key={s}
                  className={cn(
                    "size-8 transition",
                    s <= stars
                      ? "fill-amber-400 text-amber-500 drop-shadow"
                      : "text-muted-foreground/30",
                  )}
                />
              ))}
            </div>
            {stars >= 1 && (
              <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-300">
                <Zap className="size-3" /> +{stars * 10 + 30} XP
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => startLevel(active)}
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 px-5 py-2 text-sm font-extrabold text-white shadow"
              >
                <RotateCw className="size-4" /> 再挑战
              </button>
              <button
                onClick={exitLevel}
                className="inline-flex items-center gap-1.5 rounded-full border-2 border-indigo-300 bg-card px-5 py-2 text-sm font-extrabold text-indigo-600 shadow-sm hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
              >
                🗺️ 返回地图
              </button>
            </div>
          </section>
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

        {unlockedAch && <AchievementToast id={unlockedAch} />}
      </main>
      </CosmicShell>
    );
  }

  // ════════════ MAP / OVERVIEW VIEW ════════════
  const totalStars = Object.values(state.levels).reduce((s, l) => s + l.bestStars, 0);
  const allCleared = levels.every((l) => (state.levels[l.id]?.bestStars ?? 0) >= 1);
  const hasLesson = !!(pt.teacher_script && pt.teacher_script.length > 0);
  const hasImmersion = !!(pt.immersion_cards && pt.immersion_cards.length > 0);

  return (
    <CosmicShell>
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-6 relative">
      <Link
        to="/junior/grammar"
        className="mb-3 inline-flex items-center gap-1 text-sm text-white/80 hover:text-white"
      >
        <ArrowLeft className="size-4" /> 返回考点列表
      </Link>

      {/* Hero */}
      <div className="rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6 text-white shadow-md">
        <div className="text-[11px] font-bold uppercase tracking-widest opacity-90">
          🚀 全攻克 Lab · CEFR {pt.cefr}
        </div>
        <h1 className="mt-1 text-2xl font-extrabold">{pt.title}</h1>
        <p className="mt-1 text-xs opacity-90">3 关 · 每关 {QUESTIONS_PER_LEVEL} 题 · 满星挑战</p>

        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center gap-1">
            {Array.from({ length: 9 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "size-4",
                  i < totalStars
                    ? "fill-amber-300 text-amber-300"
                    : "text-white/40",
                )}
              />
            ))}
          </div>
          <div className="ml-auto inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-bold">
            <Zap className="size-3" /> {state.xp} XP
          </div>
        </div>
      </div>

      {/* Mnemonic */}
      {pt.mnemonic && (
        <div className="mt-4 rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-rose-50 dark:from-amber-950/30 dark:to-rose-950/20 p-4 text-center">
          <div className="text-[10px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-300 mb-1">
            🔑 一句话记住
          </div>
          <div className="text-sm font-bold text-amber-800 dark:text-amber-200">{pt.mnemonic}</div>
        </div>
      )}

      {/* Level map */}
      <h2 className="mt-6 mb-3 text-base font-extrabold flex items-center gap-1.5">
        🗺️ 关卡地图
      </h2>
      <div className="space-y-3">
        {levels.map((lv, idx) => {
          const prev = idx > 0 ? levels[idx - 1] : null;
          const prevCleared = !prev || (state.levels[prev.id]?.bestStars ?? 0) >= 1;
          const locked = !prevCleared;
          const prog = state.levels[lv.id];
          const noQs = lv.questions.length === 0;
          return (
            <button
              key={lv.id}
              disabled={locked || noQs}
              onClick={() => openLevel(lv)}
              className={cn(
                "w-full text-left rounded-3xl p-5 shadow-sm transition relative overflow-hidden",
                "bg-gradient-to-br text-white",
                lv.color,
                (locked || noQs) && "opacity-50 cursor-not-allowed grayscale",
                !locked && !noQs && "hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]",
              )}
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl flex-shrink-0">{lv.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-widest opacity-90">
                    Level {lv.id}
                  </div>
                  <div className="text-lg font-extrabold">{lv.name}</div>
                  <div className="text-xs opacity-90">{lv.desc}</div>
                  <div className="mt-1.5 flex items-center gap-2 text-[11px] font-bold opacity-95">
                    <span>{Math.min(lv.questions.length, QUESTIONS_PER_LEVEL)} 题</span>
                    {prog && <span>· 最佳 {prog.bestPct}%</span>}
                    {prog && prog.attempts > 0 && <span>· 尝试 {prog.attempts} 次</span>}
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  {locked ? (
                    <Lock className="size-6 opacity-90" />
                  ) : noQs ? (
                    <span className="text-xs opacity-90">暂无题目</span>
                  ) : (
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3].map((s) => (
                        <Star
                          key={s}
                          className={cn(
                            "size-5",
                            s <= (prog?.bestStars ?? 0)
                              ? "fill-amber-300 text-amber-300"
                              : "text-white/40",
                          )}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Achievements */}
      <h2 className="mt-8 mb-3 text-base font-extrabold flex items-center gap-1.5">
        <Sparkles className="size-4" /> 成就 ({state.achievements.length}/{ACHIEVEMENTS.length})
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {ACHIEVEMENTS.map((a) => {
          const owned = state.achievements.includes(a.id);
          return (
            <div
              key={a.id}
              className={cn(
                "rounded-2xl border-2 p-3 text-center transition",
                owned
                  ? "border-amber-300 bg-gradient-to-br from-amber-50 to-rose-50 dark:from-amber-950/30 dark:to-rose-950/30"
                  : "border-dashed border-muted bg-muted/20 opacity-60 grayscale",
              )}
            >
              <div className="text-2xl">{a.emoji}</div>
              <div className="mt-1 text-[11px] font-extrabold">{a.name}</div>
              <div className="text-[10px] text-muted-foreground">{a.desc}</div>
            </div>
          );
        })}
      </div>

      {allCleared && (
        <div className="mt-6 rounded-3xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-rose-50 dark:from-amber-950/30 dark:to-rose-950/30 p-5 text-center">
          <Trophy className="mx-auto size-10 text-amber-500" />
          <div className="mt-2 text-lg font-extrabold">🎉 三关全部通过！</div>
          <p className="mt-1 text-xs text-muted-foreground">
            继续刷高星数挑战满星，或选下一个考点
          </p>
          <Link
            to="/junior/grammar"
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-2 text-sm font-extrabold text-white shadow"
          >
            📚 下一个考点
          </Link>
        </div>
      )}

      {unlockedAch && <AchievementToast id={unlockedAch} />}
    </main>
    </CosmicShell>
  );
}

/**
 * Cosmic backdrop — deep gradient + animated stars, mimicking the
 * subjunctive lab's signature look.
 */
function CosmicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#0b0a1f] via-[#1a0f3a] to-[#2a1454]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(2px 2px at 20% 30%, rgba(255,255,255,0.7), transparent 50%), radial-gradient(1px 1px at 70% 20%, rgba(255,255,255,0.6), transparent 50%), radial-gradient(1.5px 1.5px at 40% 80%, rgba(255,255,255,0.5), transparent 50%), radial-gradient(1px 1px at 85% 65%, rgba(255,255,255,0.6), transparent 50%), radial-gradient(2px 2px at 10% 70%, rgba(255,255,255,0.5), transparent 50%), radial-gradient(1px 1px at 55% 45%, rgba(255,255,255,0.5), transparent 50%), radial-gradient(1.5px 1.5px at 90% 90%, rgba(255,255,255,0.5), transparent 50%), radial-gradient(1px 1px at 30% 10%, rgba(255,255,255,0.6), transparent 50%)",
          backgroundSize: "100% 100%",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-40 size-[600px] rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(circle, #ff79c6 0%, transparent 70%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -right-40 size-[600px] rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(circle, #50fa7b 0%, transparent 70%)" }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function AchievementToast({ id }: { id: string }) {
  const ach = ACHIEVEMENTS.find((a) => a.id === id);
  if (!ach) return null;
  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-in slide-in-from-bottom-4 duration-300">
      <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-r from-amber-100 to-rose-100 px-5 py-3 shadow-xl flex items-center gap-3">
        <div className="text-3xl">{ach.emoji}</div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-amber-700">
            🏆 解锁成就
          </div>
          <div className="text-sm font-extrabold text-amber-900">{ach.name}</div>
          <div className="text-[11px] text-amber-800">{ach.desc}</div>
        </div>
      </div>
    </div>
  );
}