import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
  Sparkles,
  Target,
  Volume2,
  XCircle,
  Zap,
  X,
  Loader2,
  Lightbulb,
  PenLine,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { IDIOMS, type Idiom } from "@/data/idioms";
import { speak } from "@/lib/speak";
import { toast } from "sonner";
import { T, useT } from "@/i18n/T";
import { supabase } from "@/integrations/supabase/client";
import {
  isMasteredSlang,
  loadSlangMastery,
  recordSlangResult,
  sortByMastery,
  pickQuizPool,
  bumpSlangRotation,
  pickDailyPlan,
  getSlangProgress,
  getSlangLevel,
} from "@/lib/slangMastery";
import { XPBurst } from "@/components/game/XPBurst";

type Mode = "browse" | "quiz";
// quiz direction: en2cn = show English idiom, choose Chinese meaning;
// cn2en = show Chinese meaning, choose English idiom;
// fill  = show example with blank, choose missing idiom.
// scenario = read a Chinese real-life scene, pick the right English slang.
// compose  = write a sentence using the slang in a given scenario (AI graded).
type QuizKind = "en2cn" | "cn2en" | "fill" | "scenario" | "compose";

export type ComposeGrade = {
  usedPhrase: boolean;
  correct: boolean;
  naturalness: number;
  tip: string;
  improved: string;
  verdict: "great" | "ok" | "needs_work";
};

type QuizQuestion = {
  id: number;
  kind: QuizKind;
  prompt: string;       // main question text
  context?: string;     // example sentence (CN translation when shown)
  options: string[];    // empty for "compose"
  answer: number;       // index into options; -1 for "compose"
  idiom: Idiom;         // the right idiom (for review card)
};

const PER_PAGE = 12;
const QUIZ_LEN = 10;
// A page counts as "browsed" once the user dwells on it for this long (ms).
const DWELL_MS = 60_000;
// After landing on a new page, wait this long before offering a quiz.
const PROMPT_DELAY_MS = 10_000;
// Need at least this many reviewed idioms before offering a quiz.
const MIN_REVIEWED = 4;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const STOP_WORDS = new Set([
  "a","an","the","to","of","in","on","at","is","it","be","and","or","my","your","you","i","we","he","she","they","up","out","off","for","with","this","that",
]);

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Replace the idiom phrase inside the example with "_____", even when the
 * sentence inserts pronouns/articles between the words (e.g. phrase
 * "caught in 4K" inside "caught him in 4K").
 * Falls back to blanking the meaningful keywords individually so the answer
 * never appears verbatim in the prompt.
 */
function blankOutPhrase(example: string, phrase: string): string {
  // 1) Try exact match first.
  const exact = new RegExp(escapeRe(phrase), "i");
  if (exact.test(example)) return example.replace(exact, "_____");

  // 2) Try a flexible match: allow up to 3 words between each phrase word.
  const words = phrase.split(/\s+/).filter(Boolean).map(escapeRe);
  if (words.length > 1) {
    const flexible = new RegExp(words.join("(?:\\s+\\S+){0,3}\\s+"), "i");
    if (flexible.test(example)) return example.replace(flexible, "_____");
  }

  // 3) Fallback: blank each meaningful keyword from the phrase individually.
  let result = example;
  const keywords = phrase
    .split(/\s+/)
    .map((w) => w.replace(/[^\w'-]/g, ""))
    .filter((w) => w && !STOP_WORDS.has(w.toLowerCase()));
  for (const kw of keywords) {
    const re = new RegExp(`\\b${escapeRe(kw)}\\b`, "ig");
    result = result.replace(re, "_____");
  }
  return result;
}

function buildQuiz(pool: Idiom[] = IDIOMS, len = QUIZ_LEN): QuizQuestion[] {
  const sourceForDistractors = IDIOMS;
  // Spaced-repetition pick: prioritise struggling > unseen > due-review,
  // and skip mastered items still in cooldown.
  const picked = pickQuizPool(pool, Math.min(len, pool.length));
  return picked.map((idiom, i) => {
    // Pick a drill kind matched to the user's current level for THIS phrase.
    //   L1 → en2cn (recognise meaning)
    //   L2 → cn2en or fill (recall + listening)
    //   L3 → scenario (situational matching)
    //   L4+ → compose (active production, AI-graded)
    const lvl = getSlangLevel(idiom.id);
    let kind: QuizKind;
    if (lvl <= 1) kind = "en2cn";
    else if (lvl === 2) kind = i % 2 === 0 ? "cn2en" : "fill";
    else if (lvl === 3) kind = "scenario";
    else kind = "compose";

    const distractorPool = sourceForDistractors.filter((x) => x.id !== idiom.id);
    const distractors = shuffle(distractorPool).slice(0, 3);

    if (kind === "en2cn") {
      const opts = shuffle([idiom, ...distractors]).map((x) => x.meaning_cn);
      return {
        id: idiom.id,
        kind,
        prompt: idiom.phrase,
        context: idiom.example,
        options: opts,
        answer: opts.indexOf(idiom.meaning_cn),
        idiom,
      };
    }
    if (kind === "cn2en") {
      const opts = shuffle([idiom, ...distractors]).map((x) => x.phrase);
      return {
        id: idiom.id,
        kind,
        prompt: idiom.meaning_cn,
        context: idiom.example_cn,
        options: opts,
        answer: opts.indexOf(idiom.phrase),
        idiom,
      };
    }
    if (kind === "fill") {
      const blanked = blankOutPhrase(idiom.example, idiom.phrase);
      const opts = shuffle([idiom, ...distractors]).map((x) => x.phrase);
      return {
        id: idiom.id,
        kind,
        prompt: blanked,
        context: idiom.example_cn,
        options: opts,
        answer: opts.indexOf(idiom.phrase),
        idiom,
      };
    }
    if (kind === "scenario") {
      // Prompt is filled in lazily by the slang-scenario edge fn; show the
      // canonical Chinese example as a fallback so something is visible.
      const opts = shuffle([idiom, ...distractors]).map((x) => x.phrase);
      return {
        id: idiom.id,
        kind,
        prompt: "",
        context: idiom.example_cn,
        options: opts,
        answer: opts.indexOf(idiom.phrase),
        idiom,
      };
    }
    // compose — no MC options
    return {
      id: idiom.id,
      kind,
      prompt: idiom.example_cn,
      context: idiom.meaning_cn,
      options: [],
      answer: -1,
      idiom,
    };
  });
}

const Slang = () => {
  const tt = useT();
  const [mode, setMode] = useState<Mode>("browse");
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  // Daily AI-fetched trending slang prepended to the list.
  const [dailySlang, setDailySlang] = useState<Idiom[]>([]);
  // Bumped whenever mastery changes so the browse list re-sorts.
  const [masteryVersion, setMasteryVersion] = useState(0);
  // Idioms the user has *dwelled long enough* on since the last quiz.
  const reviewedIdsRef = useRef<Set<number>>(new Set());
  // Re-render trigger for the floating "test N items" badge.
  const [reviewedTick, setReviewedTick] = useState(0);
  const [showInvite, setShowInvite] = useState(false);
  // After the user dismisses the invite once, switch to the docked button.
  const [dockedInvite, setDockedInvite] = useState(false);

  // Load mastery from cloud once.
  useEffect(() => {
    // Once per browser session, rotate the unseen-order so users don't always
    // see "rizz, drip, …" at the top.
    try {
      if (!sessionStorage.getItem("slang_rotated_this_session")) {
        bumpSlangRotation();
        sessionStorage.setItem("slang_rotated_this_session", "1");
      }
    } catch { /* noop */ }
    loadSlangMastery().then(() => setMasteryVersion((v) => v + 1));
    // Streak event
    import("@/lib/guestProgress").then(m => m.recordVisit("slang"));
  }, []);

  // Load daily AI slang (newest first) and map to Idiom shape with stable negative IDs.
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("daily_slang")
        .select("id, phrase, meaning_cn, meaning_en, example, example_cn, fetch_date, created_at")
        .order("fetch_date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(500);
      if (error || !data) return;
      // Use a deterministic negative numeric id derived from uuid hash so it doesn't collide with IDIOMS ids.
      const mapped: Idiom[] = data.map((r: any, idx: number) => ({
        id: -(idx + 1) - 1000,
        phrase: r.phrase,
        meaning_cn: r.meaning_cn,
        meaning_en: r.meaning_en,
        example: r.example,
        example_cn: r.example_cn,
      }));
      setDailySlang(mapped);
    })();
  }, []);

  const filtered = useMemo(() => {
    // Merge daily slang at the top, dedupe by phrase (case-insensitive).
    const seen = new Set<string>();
    const merged: Idiom[] = [];
    for (const it of dailySlang) {
      const k = it.phrase.toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      merged.push(it);
    }
    const sortedRest = sortByMastery(IDIOMS).filter((it) => {
      const k = it.phrase.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
    const base = [...merged, ...sortedRest];
    if (!search.trim()) return base;
    const k = search.trim().toLowerCase();
    return base.filter(
      (x) =>
        x.phrase.toLowerCase().includes(k) ||
        x.meaning_cn.includes(search) ||
        x.meaning_en.toLowerCase().includes(k),
    );
    // re-evaluate when masteryVersion changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, masteryVersion, dailySlang]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages - 1);
  const pageItems = filtered.slice(safePage * PER_PAGE, safePage * PER_PAGE + PER_PAGE);

  // Per-page dwell + invite logic.
  // After DWELL_MS on a page, mark its idioms as "reviewed".
  // After PAGES change, wait PROMPT_DELAY_MS then show the invite (if not docked
  // and there are enough reviewed items to test).
  useEffect(() => {
    if (mode !== "browse") return;
    const itemsOnPage = pageItems.map((it) => it.id);

    // Mark this page as reviewed after dwell.
    const dwellTimer = window.setTimeout(() => {
      let added = false;
      itemsOnPage.forEach((id) => {
        if (!reviewedIdsRef.current.has(id)) {
          reviewedIdsRef.current.add(id);
          added = true;
        }
      });
      if (added) setReviewedTick((n) => n + 1);
    }, DWELL_MS);

    // Offer to quiz the reviewed material 10s after arriving on this page.
    const inviteTimer = window.setTimeout(() => {
      if (dockedInvite) return;
      if (reviewedIdsRef.current.size < MIN_REVIEWED) return;
      setShowInvite(true);
    }, PROMPT_DELAY_MS);

    return () => {
      window.clearTimeout(dwellTimer);
      window.clearTimeout(inviteTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safePage, mode, dockedInvite]);

  // Quiz state
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [qIdx, setQIdx] = useState(0);
  const [picks, setPicks] = useState<Record<number, number>>({});
  const [revealed, setRevealed] = useState(false);
  // Compose (L4) state — keyed by question id so navigating back/forward
  // doesn't lose the learner's typed sentence.
  const [composeText, setComposeText] = useState<Record<number, string>>({});
  const [composeGrade, setComposeGrade] = useState<Record<number, ComposeGrade>>({});
  const [composeBusy, setComposeBusy] = useState(false);
  // +XP floating burst on correct answers
  const [xpTrigger, setXpTrigger] = useState(0);
  // Scenario (L3) text — generated on demand by `slang-scenario` edge fn,
  // cached per phrase id in this session.
  const scenarioCacheRef = useRef<Record<number, string>>({});
  const [scenarioText, setScenarioText] = useState<Record<number, string>>({});
  const [scenarioBusy, setScenarioBusy] = useState<Record<number, boolean>>({});
  // Tracks which question ids we've already counted toward mastery to avoid double-counting.
  const recordedRef = useRef<Set<number>>(new Set());
  // Ref to the action bar so we can scroll it into view after the user picks
  // an answer — saves them having to scroll down to hit "下一题".
  const actionBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mode === "quiz" && questions.length === 0) {
      setQuestions(buildQuiz());
      setQIdx(0);
      setPicks({});
      setRevealed(false);
      recordedRef.current = new Set();
    }
  }, [mode, questions.length]);

  const startQuiz = () => {
    const qs = buildQuiz();
    if (qs.length === 0) {
      toast.success(tt("🎉 太棒了！现有俚语都已掌握，先去浏览新词吧。"));
      return;
    }
    if (qs.length < QUIZ_LEN) {
      toast(`${tt("本轮只测")} ${qs.length} ${tt("题：其余俚语正在复习冷却期 ✨")}`);
    }
    setQuestions(qs);
    setQIdx(0);
    setPicks({});
    setRevealed(false);
    recordedRef.current = new Set();
    setMode("quiz");
    window.scrollTo({ top: 0 });
  };

  const restartQuiz = () => {
    const qs = buildQuiz();
    if (qs.length === 0) {
      toast.success(tt("🎉 已经全部掌握，无需再测！"));
      setMode("browse");
      return;
    }
    setQuestions(qs);
    setQIdx(0);
    setPicks({});
    setRevealed(false);
    recordedRef.current = new Set();
  };

  // Quiz that focuses on idioms the user just reviewed in browse mode.
  const startReviewQuiz = () => {
    const reviewed = IDIOMS.filter((x) => reviewedIdsRef.current.has(x.id));
    // Prioritise the not-yet-mastered ones; if too few, top up with mastered.
    const unmastered = reviewed.filter((x) => !isMasteredSlang(x.id));
    const pool = unmastered.length >= 6 ? unmastered : reviewed;
    const len = Math.min(QUIZ_LEN, pool.length);
    setQuestions(buildQuiz(pool, len));
    setQIdx(0);
    setPicks({});
    setRevealed(false);
    recordedRef.current = new Set();
    setMode("quiz");
    setShowInvite(false);
    setDockedInvite(false);
    window.scrollTo({ top: 0 });
  };

  // When an answer is revealed, record mastery once per question.
  useEffect(() => {
    if (!revealed) return;
    const q = questions[qIdx];
    if (!q) return;
    if (recordedRef.current.has(q.id)) return;
    recordedRef.current.add(q.id);
    const correct =
      q.kind === "compose"
        ? composeGrade[q.id]?.verdict !== "needs_work"
        : picks[q.id] === q.answer;
    recordSlangResult(q.idiom.id, correct);
    setMasteryVersion((v) => v + 1);
  }, [revealed, qIdx, questions, picks, composeGrade]);

  // NOTE: read-aloud on reveal happens SYNCHRONOUSLY in the option onClick
  // below (inside the user-gesture window), so iOS Safari unlocks audio and
  // playback starts instantly without the 1-frame React effect delay.

  // Once the answer is revealed, smooth-scroll the action bar (Next button +
  // explanation) into view so the user doesn't have to scroll manually.
  useEffect(() => {
    if (!revealed) return;
    const t = window.setTimeout(() => {
      const el = actionBarRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      // 如果 Next 按钮已经在视口内，就不动；否则把页面"往上滑一点"，
      // 让按钮出现在视口下方约 1/4 处（而不是顶到屏幕最底部）。
      const targetY = vh * 0.75;
      const delta = rect.bottom - targetY;
      if (Math.abs(delta) > 8) {
        window.scrollBy({ top: delta, behavior: "smooth" });
      }
    }, 120);
    return () => window.clearTimeout(t);
  }, [revealed]);

  // Reset the review counter when entering quiz so a fresh browse session starts after.
  useEffect(() => {
    if (mode === "browse") {
      return;
    }
    reviewedIdsRef.current = new Set();
    setReviewedTick((n) => n + 1);
    setShowInvite(false);
    setDockedInvite(false);
  }, [mode]);

  const correctCount = questions.filter((q) =>
    q.kind === "compose"
      ? composeGrade[q.id]?.verdict !== undefined && composeGrade[q.id].verdict !== "needs_work"
      : picks[q.id] === q.answer,
  ).length;

  // For mixed quiz results, "correct" means: either the user picked the
  // right MC option, or (for compose questions) the AI graded their
  // sentence as "great" / "ok".
  const isQuestionCorrect = (q: QuizQuestion): boolean => {
    if (q.kind === "compose") {
      const g = composeGrade[q.id];
      return !!g && g.verdict !== "needs_work";
    }
    return picks[q.id] === q.answer;
  };
  const totalCorrect = questions.filter(isQuestionCorrect).length;

  // ─────────── L3 scenario fetcher (lazy, cached per session) ───────────
  const ensureScenario = async (q: QuizQuestion) => {
    if (q.kind !== "scenario") return;
    if (scenarioText[q.id] || scenarioCacheRef.current[q.id]) return;
    setScenarioBusy((s) => ({ ...s, [q.id]: true }));
    try {
      const { data, error } = await supabase.functions.invoke("slang-scenario", {
        body: {
          phrase: q.idiom.phrase,
          meaningCn: q.idiom.meaning_cn,
          meaningEn: q.idiom.meaning_en,
          exampleEn: q.idiom.example,
        },
      });
      if (error) throw error;
      const s: string = data?.scenario;
      if (s) {
        scenarioCacheRef.current[q.id] = s;
        setScenarioText((prev) => ({ ...prev, [q.id]: s }));
      }
    } catch (e) {
      console.error("scenario fetch failed", e);
    } finally {
      setScenarioBusy((s) => ({ ...s, [q.id]: false }));
    }
  };

  useEffect(() => {
    if (mode !== "quiz") return;
    const q = questions[qIdx];
    if (!q) return;
    if (q.kind === "scenario") void ensureScenario(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, qIdx, questions]);

  // ─────────── L4 compose grader ───────────
  const submitCompose = async (q: QuizQuestion) => {
    const text = (composeText[q.id] || "").trim();
    if (!text) {
      toast(tt("写一句话再提交吧 ✍️"));
      return;
    }
    setComposeBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("grade-slang-sentence", {
        body: {
          phrase: q.idiom.phrase,
          meaningCn: q.idiom.meaning_cn,
          meaningEn: q.idiom.meaning_en,
          exampleEn: q.idiom.example,
          scenarioCn: q.idiom.example_cn,
          userText: text,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const grade = data.grade as ComposeGrade;
      setComposeGrade((prev) => ({ ...prev, [q.id]: grade }));
      setRevealed(true);
      // Speak the improved version so the learner internalises a native
      // model right after producing their own.
      if (grade?.improved) speak(grade.improved);
    } catch (e: any) {
      console.error("compose grade failed", e);
      toast.error(e?.message || tt("评分失败，请稍后再试"));
    } finally {
      setComposeBusy(false);
    }
  };

  // ─────────── Daily 5-min plan (top of browse view) ───────────
  const dailyPlan = useMemo(() => {
    const all = [...IDIOMS, ...dailySlang];
    return pickDailyPlan(all);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dailySlang, masteryVersion]);

  const dailyTotal = dailyPlan.fresh.length + dailyPlan.review.length + dailyPlan.climbing.length;

  const startDailyPlanQuiz = () => {
    const pool = [...dailyPlan.fresh, ...dailyPlan.review, ...dailyPlan.climbing];
    if (pool.length === 0) {
      toast.success(tt("🎉 今日练习已完成，明天见！"));
      return;
    }
    setQuestions(buildQuiz(pool, pool.length));
    setQIdx(0);
    setPicks({});
    setRevealed(false);
    setComposeText({});
    setComposeGrade({});
    recordedRef.current = new Set();
    setMode("quiz");
    window.scrollTo({ top: 0 });
  };

  const overallProgress = useMemo(
    () => getSlangProgress([...IDIOMS, ...dailySlang]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dailySlang, masteryVersion],
  );

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-10 md:px-8 md:py-14">
      <XPBurst trigger={xpTrigger} amount={1} intensity="subtle" />
      <PageHeader
        title="American Slang"
        subtitle={`${(() => {
          const seen = new Set(IDIOMS.map((i) => i.phrase.toLowerCase()));
          const extra = dailySlang.filter((d) => !seen.has(d.phrase.toLowerCase())).length;
          return IDIOMS.length + extra;
        })()} idioms`}
        back="/"
      />

      {/* Mode toggle */}
      <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl bg-secondary p-1.5">
        <button
          onClick={() => (mode === "quiz" ? restartQuiz() : startQuiz())}
          className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
            mode === "quiz" ? "bg-card shadow-card text-foreground" : "text-muted-foreground"
          }`}
        >
          <Target className="size-4" /> <T>开始测试</T>
        </button>
        <button
          onClick={() => setMode("browse")}
          className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
            mode === "browse" ? "bg-card shadow-card text-foreground" : "text-muted-foreground"
          }`}
        >
          <BookOpen className="size-4" /> <T>学习浏览</T>
        </button>
      </div>

      {/* ───────────── BROWSE MODE ───────────── */}
      {mode === "browse" && (
        <>
          {/* ───── Today's 5-min practice ───── */}
          {dailyTotal > 0 && (
            <section className="mb-5 overflow-hidden rounded-2xl border border-primary/30 bg-grad-title p-5 text-white shadow-card">
              <div className="flex items-start gap-3">
                <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/15 backdrop-blur">
                  <Sparkles className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold uppercase tracking-wide opacity-80">
                    <T>今日 5 分钟练习</T>
                  </div>
                  <div className="mt-0.5 text-lg font-extrabold leading-tight">
                    {dailyPlan.fresh.length > 0 && <><T>新词</T> {dailyPlan.fresh.length} · </>}
                    {dailyPlan.review.length > 0 && <><T>复习</T> {dailyPlan.review.length} · </>}
                    {dailyPlan.climbing.length > 0 && <><T>进阶</T> {dailyPlan.climbing.length}</>}
                  </div>
                  <div className="mt-1 text-xs opacity-90">
                    <T>每天一小步：从认识 → 听懂 → 场景 → 自己造句 → 真正会用</T>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-[11px] opacity-90">
                    <span><T>累计已掌握</T> {overallProgress.mastered}/{overallProgress.total}</span>
                  </div>
                  <div className="mt-3">
                    <Button
                      onClick={startDailyPlanQuiz}
                      className="bg-white text-primary hover:bg-white/90"
                      size="sm"
                    >
                      <Target className="mr-2 size-4" /> <T>开始今日练习</T>
                    </Button>
                  </div>
                </div>
              </div>
            </section>
          )}

          <div key={`reorder-${masteryVersion}`} className="space-y-3">
            {pageItems.map((it, i) => (
              <article
                key={it.id}
                style={{ animationDelay: `${Math.min(i * 35, 350)}ms`, animationFillMode: "both" }}
                className="rounded-2xl bg-card p-5 shadow-card transition animate-in fade-in slide-in-from-top-2 duration-500 hover:-translate-y-0.5"
              >
                <div className="flex items-start gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-grad-title text-white">
                    <Zap className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-extrabold md:text-xl">{it.phrase}</h3>
                      <button
                        onClick={() => speak(it.phrase)}
                        className="grid size-7 place-items-center rounded-full bg-secondary text-muted-foreground transition hover:text-primary"
                        aria-label={tt("朗读")}
                      >
                        <Volume2 className="size-3.5" />
                      </button>
                      {it.id < 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/15 px-2 py-0.5 text-[10px] font-bold text-orange-600">
                          🔥 <T>新</T>
                        </span>
                      )}
                      {isMasteredSlang(it.id) && (
                        <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                          <CheckCircle2 className="size-3" /> <T>已掌握</T>
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-lg font-semibold text-primary md:text-base">
                      <T>{it.meaning_cn}</T>
                    </div>
                    <div className="mt-1 text-base text-muted-foreground md:text-sm">{it.meaning_en}</div>

                    <div className="mt-3 rounded-xl border border-border bg-secondary/30 p-3 text-lg md:text-base">
                      <div className="flex items-start gap-2">
                        <span className="mt-1 text-xs font-bold text-muted-foreground">EN</span>
                        <span className="flex-1">{it.example}</span>
                        <button
                          onClick={() => speak(it.example)}
                          className="grid size-6 shrink-0 place-items-center rounded-full text-muted-foreground transition hover:text-primary"
                          aria-label={tt("朗读例句")}
                        >
                          <Volume2 className="size-3" />
                        </button>
                      </div>
                      <div className="mt-1.5 flex items-start gap-2">
                        <span className="mt-1 text-xs font-bold text-muted-foreground"><T>释义</T></span>
                        <span className="flex-1 text-muted-foreground"><T>{it.example_cn}</T></span>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between gap-3">
            <Button
              variant="outline"
              disabled={safePage === 0}
              onClick={() => setPage(safePage - 1)}
            >
              ← <T>上一页</T>
            </Button>
            <span className="text-sm text-muted-foreground">
              {safePage + 1} / {totalPages} · {filtered.length}
            </span>
            <Button
              disabled={safePage >= totalPages - 1}
              onClick={() => setPage(safePage + 1)}
            >
              <T>下一页</T> →
            </Button>
          </div>

          <div className="mt-6 rounded-2xl border border-primary/30 bg-primary/5 p-5 text-center">
            <div className="text-sm font-semibold"><T>想检验记住了多少？</T></div>
            <Button className="mt-3" onClick={startQuiz}>
              <Target className="mr-2 size-4" /> <T>开始测试 (10 题)</T>
            </Button>
          </div>

          {/* ───── Floating invite (centered card) ───── */}
          {showInvite && !dockedInvite && (
            <div className="fixed inset-x-0 bottom-6 z-40 flex justify-center px-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex w-full max-w-md items-start gap-3 rounded-2xl border border-primary/30 bg-card p-4 shadow-[0_20px_50px_-15px_hsl(250_40%_30%/0.45)]">
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-grad-title text-white">
                  <Target className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold"><T>测一下刚才浏览的俚语？</T></div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    <T>已浏览</T> <span className="font-semibold text-foreground">{reviewedIdsRef.current.size}</span> · <T>答对的会沉到列表底部</T>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" onClick={startReviewQuiz}>
                      <T>开始小测</T>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setShowInvite(false);
                        setDockedInvite(true);
                      }}
                    >
                      <T>稍后再说</T>
                    </Button>
                  </div>
                </div>
                <button
                  aria-label={tt("关闭")}
                  onClick={() => {
                    setShowInvite(false);
                    setDockedInvite(true);
                  }}
                  className="grid size-7 shrink-0 place-items-center rounded-full text-muted-foreground transition hover:bg-secondary"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>
          )}

          {/* ───── Docked left-side button after dismissal ───── */}
          {dockedInvite && reviewedIdsRef.current.size >= MIN_REVIEWED && (
            <button
              onClick={startReviewQuiz}
              className="fixed left-0 top-1/2 z-40 flex -translate-y-1/2 items-center gap-2 rounded-r-2xl bg-grad-title px-3 py-3 text-white shadow-[0_10px_30px_-8px_hsl(250_40%_30%/0.5)] transition-all duration-300 ease-out hover:pl-4 animate-in fade-in slide-in-from-left-12 duration-700"
              aria-label={`${tt("测试")} ${reviewedIdsRef.current.size} ${tt("条已浏览俚语")}`}
            >
              <Target className="size-5" />
              <span className="flex flex-col items-start leading-tight">
                <span className="text-[10px] font-medium opacity-90"><T>待测</T></span>
                <span className="text-base font-extrabold">{reviewedIdsRef.current.size}</span>
              </span>
              {/* hidden tick to ensure re-render when reviewedTick changes */}
              <span className="sr-only">{reviewedTick}</span>
            </button>
          )}
        </>
      )}

      {/* ───────────── QUIZ MODE ───────────── */}
      {mode === "quiz" && questions.length > 0 && qIdx < questions.length && (() => {
        const q = questions[qIdx];
        const picked = picks[q.id];
        const isCorrect = isQuestionCorrect(q);
        const KIND_LABEL: Record<QuizKind, string> = {
          en2cn: tt("英 → 中：选出正确含义"),
          cn2en: tt("中 → 英：选出对应俚语"),
          fill: tt("填空：选出适合的俚语"),
          scenario: tt("情境匹配：哪个俚语最合适？"),
          compose: tt("自己造句：用上这个俚语"),
        };
        return (
          <>
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-full bg-secondary px-3 py-1 text-sm font-semibold text-muted-foreground">
                {qIdx + 1} / {questions.length}
              </div>
              <div className="text-sm font-semibold text-muted-foreground">{KIND_LABEL[q.kind]}</div>
            </div>

            <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full bg-grad-title transition-all"
                style={{ width: `${((qIdx + 1) / questions.length) * 100}%` }}
              />
            </div>

            <section className="rounded-3xl bg-card p-6 shadow-card md:p-8">
              <div className="mb-5">
                {q.kind === "en2cn" && (
                  <div className="flex items-center gap-2">
                    <h3 className="text-3xl font-extrabold">{q.prompt}</h3>
                    <button
                      onClick={() => speak(q.prompt)}
                      className="grid size-8 place-items-center rounded-full bg-secondary text-muted-foreground transition hover:text-primary"
                    >
                      <Volume2 className="size-4" />
                    </button>
                  </div>
                )}
                {q.kind === "cn2en" && (
                  <h3 className="text-3xl font-extrabold"><T>{q.prompt}</T></h3>
                )}
                {q.kind === "fill" && (
                  <div>
                    <p className="text-xl font-semibold leading-relaxed">{q.prompt}</p>
                    {q.context && (
                      <p className="mt-1.5 text-sm text-muted-foreground"><T>{q.context}</T></p>
                    )}
                  </div>
                )}
                {q.kind === "scenario" && (
                  <div>
                    <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-1 text-[11px] font-bold text-amber-700 dark:text-amber-400">
                      <Lightbulb className="size-3" /> <T>真实场景</T>
                    </div>
                    {scenarioBusy[q.id] && !scenarioText[q.id] ? (
                      <p className="flex items-center gap-2 text-base text-muted-foreground">
                        <Loader2 className="size-4 animate-spin" /> <T>AI 正在生成场景…</T>
                      </p>
                    ) : (
                      <p className="text-xl font-semibold leading-relaxed">
                        <T>{scenarioText[q.id] || q.context || ""}</T>
                      </p>
                    )}
                    <p className="mt-2 text-sm text-muted-foreground">
                      <T>下面哪个俚语最适合用在这个场景里？</T>
                    </p>
                  </div>
                )}
                {q.kind === "compose" && (
                  <div>
                    <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-violet-500/15 px-2.5 py-1 text-[11px] font-bold text-violet-700 dark:text-violet-400">
                      <PenLine className="size-3" /> <T>用一下：自己造句</T>
                    </div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-extrabold">{q.idiom.phrase}</h3>
                      <button
                        onClick={() => speak(q.idiom.phrase)}
                        className="grid size-7 place-items-center rounded-full bg-secondary text-muted-foreground transition hover:text-primary"
                      >
                        <Volume2 className="size-3.5" />
                      </button>
                      <span className="text-sm text-muted-foreground"><T>{q.idiom.meaning_cn}</T></span>
                    </div>
                    <p className="mt-3 text-base">
                      <span className="font-semibold"><T>场景：</T></span>
                      <span className="text-muted-foreground"><T>{q.prompt}</T></span>
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      <T>试着用一句英文用上这个俚语，AI 会给你反馈。</T>
                    </p>
                  </div>
                )}

                {q.kind === "en2cn" && q.context && (
                  <p className="mt-2 text-base italic text-muted-foreground">"{q.context}"</p>
                )}
                {q.kind === "cn2en" && q.context && (
                  <p className="mt-2 text-base text-muted-foreground"><T>{q.context}</T></p>
                )}
              </div>

              {q.kind !== "compose" && (
              <div className="grid gap-2 md:grid-cols-2">
                {q.options.map((opt, oi) => {
                  const active = picked === oi;
                  const correctOpt = revealed && oi === q.answer;
                  const wrongOpt = revealed && active && oi !== q.answer;
                  return (
                    <button
                      key={oi}
                      disabled={revealed}
                      onClick={() => {
                        setPicks({ ...picks, [q.id]: oi });
                        setRevealed(true);
                        if (oi === q.answer) {
                          setXpTrigger((n) => n + 1);
                          try { (navigator as any).vibrate?.(20); } catch { /* noop */ }
                        }
                        // Speak the canonical example IMMEDIATELY inside the
                        // click handler — no useEffect delay, no audio unlock
                        // gap on mobile.
                        speak(q.idiom.example);
                      }}
                      className={`flex items-center justify-between rounded-xl border px-4 py-3.5 text-left text-base transition ${
                        correctOpt
                          ? "border-emerald-500 bg-emerald-500/10 text-foreground"
                          : wrongOpt
                            ? "border-rose-500 bg-rose-500/10 text-foreground"
                            : active
                              ? "border-primary bg-primary/10 text-foreground"
                              : "border-border bg-card hover:border-primary/40"
                      }`}
                    >
                      <span>{q.kind === "en2cn" ? <T>{opt}</T> : opt}</span>
                      {correctOpt && <CheckCircle2 className="size-4 text-emerald-500" />}
                      {wrongOpt && <XCircle className="size-4 text-rose-500" />}
                      {!revealed && active && <CheckCircle2 className="size-4 text-primary" />}
                    </button>
                  );
                })}
              </div>
              )}

              {q.kind === "compose" && (
                <div>
                  <textarea
                    value={composeText[q.id] ?? ""}
                    onChange={(e) => setComposeText({ ...composeText, [q.id]: e.target.value })}
                    disabled={revealed || composeBusy}
                    placeholder={tt(`例如：用上 "${q.idiom.phrase}" 写一句话…`)}
                    rows={3}
                    className="w-full resize-none rounded-xl border border-border bg-secondary/30 p-3 text-base outline-none transition focus:border-primary"
                  />
                  {!revealed && (
                    <div className="mt-3 flex justify-end">
                      <Button onClick={() => submitCompose(q)} disabled={composeBusy}>
                        {composeBusy ? (
                          <><Loader2 className="mr-2 size-4 animate-spin" /> <T>评分中…</T></>
                        ) : (
                          <><Sparkles className="mr-2 size-4" /> <T>让 AI 评一下</T></>
                        )}
                      </Button>
                    </div>
                  )}
                  {revealed && composeGrade[q.id] && (() => {
                    const g = composeGrade[q.id];
                    const tone = g.verdict === "great"
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                      : g.verdict === "ok"
                        ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                        : "bg-rose-500/10 text-rose-700 dark:text-rose-300";
                    const label = g.verdict === "great" ? tt("地道！") : g.verdict === "ok" ? tt("可以再润色一下") : tt("再改改");
                    return (
                      <div className={`mt-4 rounded-2xl p-4 text-base ${tone}`}>
                        <div className="flex items-center gap-2 font-bold">
                          <span>{"⭐".repeat(Math.max(1, Math.min(5, g.naturalness)))}</span>
                          <span>· {label}</span>
                        </div>
                        <div className="mt-2 text-sm text-foreground/90"><T>{g.tip}</T></div>
                        {g.improved && (
                          <div className="mt-3 rounded-xl bg-card p-3">
                            <div className="text-xs font-bold text-muted-foreground"><T>更地道的版本</T></div>
                            <div className="mt-1 flex items-start gap-2">
                              <span className="flex-1 italic">"{g.improved}"</span>
                              <button
                                onClick={() => speak(g.improved)}
                                className="grid size-7 place-items-center rounded-full bg-secondary text-muted-foreground transition hover:text-primary"
                                aria-label={tt("朗读")}
                              >
                                <Volume2 className="size-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Reveal explanation */}
              {revealed && q.kind !== "compose" && (
                <div className={`mt-5 rounded-2xl p-4 text-base ${isCorrect ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-rose-500/10 text-rose-700 dark:text-rose-300"}`}>
                  <div className="font-bold">
                    {isCorrect ? <>✅ <T>答对了！</T></> : <>❌ <T>答错了</T></>}
                  </div>
                  <div className="mt-2 space-y-1 text-foreground/90">
                    <div>
                      <strong>{q.idiom.phrase}</strong> — <T>{q.idiom.meaning_cn}</T>
                    </div>
                    <div className="text-sm italic">"{q.idiom.example}"</div>
                    <div className="text-sm text-muted-foreground"><T>{q.idiom.example_cn}</T></div>
                  </div>
                </div>
              )}
            </section>

            <div ref={actionBarRef} className="mt-6 flex items-center justify-between gap-3">
              <Button variant="outline" onClick={() => setMode("browse")}>
                <T>返回浏览</T>
              </Button>
              {!revealed ? null : qIdx < questions.length - 1 ? (
                <Button onClick={() => { setQIdx(qIdx + 1); setRevealed(false); }}>
                  <T>下一题</T> <ChevronRight className="ml-1 size-4" />
                </Button>
              ) : (
                <Button onClick={() => setQIdx(qIdx + 1)} className="bg-emerald-600 hover:bg-emerald-600/90">
                  <T>查看成绩</T>
                </Button>
              )}
            </div>
          </>
        );
      })()}

      {/* ───────────── QUIZ RESULT ───────────── */}
      {mode === "quiz" && questions.length > 0 && qIdx >= questions.length && (
        <section className="rounded-3xl bg-card p-7 text-center shadow-card md:p-10">
          <div className="mx-auto mb-3 grid size-16 place-items-center rounded-2xl bg-grad-title text-white">
            <Target className="size-8" />
          </div>
          <div className="text-sm text-muted-foreground"><T>本轮测试完成</T></div>
          <div className="mt-1 text-5xl font-black">
            {correctCount} <span className="text-2xl text-muted-foreground">/ {questions.length}</span>
          </div>
          <div className="mt-2 text-base font-semibold">
            <T>正确率</T> {Math.round((correctCount / questions.length) * 100)}%
          </div>

          <div className="mt-6 grid gap-2">
            {questions.map((q) => {
              const ok = isQuestionCorrect(q);
              return (
                <div
                  key={q.id}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 text-left text-sm ${ok ? "border-emerald-500/40 bg-emerald-500/5" : "border-rose-500/40 bg-rose-500/5"}`}
                >
                  {ok ? (
                    <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                  ) : (
                    <XCircle className="size-4 shrink-0 text-rose-500" />
                  )}
                  <span className="flex-1 truncate font-semibold">{q.idiom.phrase}</span>
                  <span className="truncate text-xs text-muted-foreground"><T>{q.idiom.meaning_cn}</T></span>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setMode("browse")}>
              <T>返回浏览</T>
            </Button>
            <Button className="flex-1" onClick={restartQuiz}>
              <RefreshCw className="mr-2 size-4" /> <T>再来一轮</T>
            </Button>
          </div>
        </section>
      )}
    </main>
  );
};

export default Slang;
