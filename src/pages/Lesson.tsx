import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Book,
  BookOpen,
  Check,
  CheckCircle2,
  FileText,
  Headphones,
  HelpCircle,
  MessageCircle,
  MessageCircleQuestion,
  Mic,
  Pencil,
  RefreshCw,
  Sparkles,
  Star,
  Target,
  Volume2,
  X,
} from "lucide-react";
import {
  LESSON_CONTENT,
  LESSON_STEPS,
  findLesson,
  findUnit,
  hasAuthoredContent,
  LEVELS,
  type LessonContent,
} from "@/data/course";
import PREGENERATED_LESSONS from "@/data/aiLessons.json";

const PREGEN_MAP = PREGENERATED_LESSONS as unknown as Record<string, LessonContent>;
import { PageHeader } from "@/components/PageHeader";
import { speak, speakSequence } from "@/lib/speak";
import { useGuestNudge } from "@/hooks/useGuestNudge";
import { T, useT } from "@/i18n/T";
import { useI18n } from "@/i18n/I18nProvider";
import { findNextLesson, isMastered, setLastVisited, setMastered } from "@/lib/mastery";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  clearCachedLesson,
  getCachedLesson,
  getLocalCachedLesson,
  setCachedLesson,
} from "@/lib/lessonCache";
import { getPriorLessonWords, isWordNew } from "@/lib/priorWords";
import {
  addStudyMinutes,
  getStreak,
  loadProgress,
  markLessonComplete,
  recordQuiz,
  touchActive,
} from "@/lib/guestProgress";
import { AITalkDialog } from "@/components/AITalkDialog";
import { Phone } from "lucide-react";
import { fireConfetti } from "@/lib/feedback";
import TutorChat from "@/components/tutor/TutorChat";
import { recordUnifiedAttempt, type Stage, type ModuleKey } from "@/lib/unifiedMastery";

/** Map main-course levelId (1..N) to stage/grade for unified_mastery. */
function lessonStageGrade(levelId: number): { stage: Stage; grade: number } {
  if (levelId <= 2) return { stage: "primary", grade: 3 };
  if (levelId <= 4) return { stage: "junior", grade: 8 };
  return { stage: "senior", grade: 11 };
}

const STEP_ICONS = {
  BookOpen,
  Target,
  Book,
  FileText,
  MessageCircle,
  Pencil,
  HelpCircle,
  Headphones,
  Mic,
} as const;

const NATIVE_HELPER_RE = /[\u3400-\u9fff\u3040-\u30ff\uac00-\ud7af]/;

const sanitizeUnsupportedNarratorNames = (content: LessonContent): LessonContent => {
  const readingText = (content.reading ?? []).map((r) => r.en).join(" ");
  if (/\bAnna\b/.test(readingText)) return content;

  const hasFirstPersonNarrator = /\b(I|me|my|mine|we|us|our|ours)\b/i.test(readingText);
  const replacement = hasFirstPersonNarrator ? "the author" : "the text";
  const sanitizeString = (value: string) => value.replace(/\bAnna\b/g, replacement);
  const sanitizeValue = (value: unknown): unknown => {
    if (typeof value === "string") return sanitizeString(value);
    if (Array.isArray(value)) return value.map(sanitizeValue);
    if (value && typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, sanitizeValue(item)]),
      );
    }
    return value;
  };

  return sanitizeValue(content) as LessonContent;
};

const SectionHeader = ({
  icon,
  color,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  color: string;
  title: string;
  subtitle: string;
}) => (
  <div className="mb-6 flex items-center gap-3">
    <div className={`grid size-12 place-items-center rounded-2xl ${color}`}>{icon}</div>
    <div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </div>
  </div>
);

const Lesson = () => {
  const tt = useT();
  const { lang } = useI18n();
  const nativeText = (text: string) => NATIVE_HELPER_RE.test(text) ? tt(text) : text;
  const { levelId, unitId, lessonId } = useParams();
  const lesson = findLesson(Number(levelId), Number(unitId), Number(lessonId));
  const [activeStep, setActiveStep] = useState(1);
  const contentRef = useRef<HTMLDivElement>(null);
  const nudge = useGuestNudge();
  const enteredAtRef = useRef<number>(Date.now());
  const recordedQuizRef = useRef(false);
  const [mastered, setMasteredState] = useState(false);
  const [aiContent, setAiContent] = useState<LessonContent | null>(null);
  const [generating, setGenerating] = useState(false);
  const [talkOpen, setTalkOpen] = useState(false);
  const [authedUser, setAuthedUser] = useState<boolean>(false);
  const [authedUserId, setAuthedUserId] = useState<string | null>(null);
  const [tutorReq, setTutorReq] = useState<{
    refId: string;
    snapshot: Record<string, unknown>;
  } | null>(null);
  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (active) { setAuthedUser(!!session?.user); setAuthedUserId(session?.user?.id ?? null); }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      if (active) { setAuthedUser(!!s?.user); setAuthedUserId(s?.user?.id ?? null); }
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    setMasteredState(isMastered(Number(levelId), Number(unitId), Number(lessonId)));
    setLastVisited(Number(levelId), Number(unitId), Number(lessonId));
    // When navigating to a new lesson, always start from step 1 (词汇学习)
    // and scroll back to the top of the page.
    setActiveStep(1);
    // Reset all per-lesson interactive state so answers from a previous
    // lesson don't leak into the next one.
    setVocabQuiz({});
    setFills({});
    setQuizPicks({});
    setListenInputs({});
    recordedAttemptsRef.current = new Set();
    setOutput("");
    setFeedback(null);
    recordedQuizRef.current = false;
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [levelId, unitId, lessonId]);

  const toggleMastered = () => {
    const next = !mastered;
    setMastered(Number(levelId), Number(unitId), Number(lessonId), next);
    setMasteredState(next);
    if (next) {
      markLessonComplete(Number(levelId), Number(unitId), Number(lessonId));
      const nextLesson = findNextLesson(Number(levelId), Number(unitId), Number(lessonId));
      toast.success(tt("🎓 已标记为掌握"), {
        description: nextLesson
          ? `${tt("下次打开 App 时会提醒你继续：")}${nextLesson.title}`
          : tt("你已完成全部课程，太棒啦！"),
      });
    } else {
      toast(tt("已取消「掌握」标记"));
    }
  };

  // Track active day + accumulate study minutes when leaving the page.
  useEffect(() => {
    touchActive();
    enteredAtRef.current = Date.now();
    return () => {
      const mins = Math.round((Date.now() - enteredAtRef.current) / 60000);
      addStudyMinutes(mins);
    };
  }, []);

  const goToStep = (id: number) => {
    setActiveStep(id);
    if (id === LESSON_STEPS.length) {
      // Mark lesson complete and show progress-aware nudge
      markLessonComplete(Number(levelId), Number(unitId), Number(lessonId));
      const p = loadProgress();
      const streak = getStreak(p);
      const desc = streak >= 2
        ? `🔥 ${tt("已连续学习")} ${streak} ${tt("天，登录后保住你的连胜，并解锁学习数据面板。")}`
        : `${tt("已完成")} ${p.completedLessons.length} ${tt("节课")}${p.studyMinutes > 0 ? `${tt("、累计学习")} ${p.studyMinutes} ${tt("分钟")}` : ""}${tt("，登录后这些进度永久保留。")}`;
      nudge("lesson-finish", tt("🎉 完成一节课！"), desc);
    }
    // Wait for the new section to render, then smooth-scroll it into view.
    requestAnimationFrame(() => {
      const el = contentRef.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY - 16;
      window.scrollTo({ top, behavior: "smooth" });
    });
  };

  // per-step interactive state
  const [vocabQuiz, setVocabQuiz] = useState<Record<number, number>>({});
  const [fills, setFills] = useState<Record<number, string>>({});
  const [quizPicks, setQuizPicks] = useState<Record<number, number>>({});
  const [listenInputs, setListenInputs] = useState<Record<number, string>>({});
  // Track which (module, idx) have already been reported to unified_mastery,
  // so resetting state or re-rendering does not double-count attempts.
  const recordedAttemptsRef = useRef<Set<string>>(new Set());
  const lessonSG = lessonStageGrade(Number(levelId) || 1);
  const lessonItemBase = `lesson:L${levelId}-U${unitId}-${lessonId}`;
  const recordLessonAttempt = (
    module: ModuleKey,
    idx: number,
    isCorrect: boolean,
    label: string,
    extra?: { user_answer?: string; correct_answer?: string },
  ) => {
    const key = `${module}:${idx}`;
    if (recordedAttemptsRef.current.has(key)) return;
    recordedAttemptsRef.current.add(key);
    recordUnifiedAttempt({
      stage: lessonSG.stage,
      grade: lessonSG.grade,
      module,
      item_type: `lesson_${module}`,
      item_id: `${lessonItemBase}:${module}:${idx}`,
      item_label: label,
      is_correct: isCorrect,
      ...extra,
    }).catch(() => { /* non-blocking */ });
  };
  const [output, setOutput] = useState("");
  const [checking, setChecking] = useState(false);
  type Feedback = {
    score: number;
    overall: string;
    mistakes: { original: string; corrected: string; explanation: string }[];
    suggestions: string[];
    improved: string;
  };
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [activeReadingIdx, setActiveReadingIdx] = useState<number>(-1);

  const playReadingAll = () => {
    if (!content) return;
    speakSequence(content.reading.map((r) => r.en), {
      gapMs: 80,
      onIndex: (i) => setActiveReadingIdx(i),
    });
  };

  const checkWriting = async () => {
    if (!output.trim()) {
      toast(tt("请先在上方写下你的英文回答"));
      return;
    }
    if (!content || !lesson) return;
    setChecking(true);
    setFeedback(null);
    try {
      const { data, error } = await supabase.functions.invoke("check-writing", {
        body: {
          prompt: content.output.prompt,
          promptCn: content.output.cn,
          sample: content.output.sample,
          text: output,
          lessonTitle: lesson.title,
          targetLanguage: lang,
        },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setFeedback(data as Feedback);
      toast.success(tt("✅ 已完成本课写作 · 查看下方点评"));
      // Mark lesson as completed in progress
      markLessonComplete(Number(levelId), Number(unitId), Number(lessonId));
    } catch (e: any) {
      toast.error(tt("检查失败"), { description: e?.message ?? tt("请稍后再试") });
    } finally {
      setChecking(false);
    }
  };

  const rawContent = useMemo(() => {
    if (!lesson) return null;
    const authored = LESSON_CONTENT[lesson.title] ?? null;
    // Topic-specific content from AI (live) or the pre-generated bundle.
      const topicalRaw = aiContent ?? PREGEN_MAP[lesson.title] ?? null;
      const topical = topicalRaw ? sanitizeUnsupportedNarratorNames(topicalRaw) : null;
    if (hasAuthoredContent(lesson.title)) {
      // Authored lessons have hand-crafted vocab + reading sourced from the
      // HTML curriculum. The 课文阅读 (reading) MUST always come from the
      // authored source — never from AI. Other sections (grammar /
      // expressions / fillBlanks / quiz / listening / output) can be merged
      // in from topical AI content when available.
      if (topical && authored) {
        return {
          ...topical,
          reading: authored.reading,
          vocab: authored.vocab,
        };
      }
      return authored;
    }
    // AI-only lesson: prefer freshly loaded → pre-gen bundle → fallback template.
    // Merge: keep non-empty topical fields, fall back to template for empty ones
    // (e.g. lessons whose reading/vocab came from the source HTML but listening/
    // output haven't been generated yet).
    if (topical && authored) {
      const isEmpty = (v: unknown) =>
        v == null ||
        (Array.isArray(v) && v.length === 0) ||
        (typeof v === "object" && v !== null && "audio" in (v as Record<string, unknown>) &&
          !(v as { audio?: string }).audio) ||
        (typeof v === "object" && v !== null && "prompt" in (v as Record<string, unknown>) &&
          !(v as { prompt?: string }).prompt);
      const merged = { ...authored } as LessonContent;
      (Object.keys(topical) as (keyof LessonContent)[]).forEach((k) => {
        // Reading + vocab are sourced from the HTML curriculum and must
        // never be overwritten by AI-generated content.
        if (k === "reading" || k === "vocab") return;
        const tv = (topical as LessonContent)[k];
        if (!isEmpty(tv)) (merged as Record<string, unknown>)[k] = tv as unknown;
      });
      return merged;
    }
    return topical ?? authored;
  }, [lesson, aiContent]);

  // Vocabulary section rule: only show words that have NOT appeared in any
  // earlier lesson's vocab or reading. This keeps each lesson focused on
  // genuinely new vocabulary for the learner.
  const content = useMemo(() => {
    if (!rawContent || !lesson) return rawContent;
    const seen = getPriorLessonWords(
      Number(levelId),
      Number(unitId),
      Number(lessonId),
    );
    const filtered = (rawContent.vocab ?? []).filter((v) => isWordNew(v.word, seen));
    // Fall back to the original list if filtering wiped everything out — better
    // to show repeated words than an empty vocabulary section.
    const vocab = filtered.length > 0 ? filtered : rawContent.vocab;

    // Grammar examples should DEMONSTRATE the grammar point. Use the
    // AI-authored examples as-is — never substitute unrelated reading
    // sentences (the reading rarely contains enough instances of the
    // target pattern to teach from, and substituting article sentences
    // produced examples that had nothing to do with the grammar topic).
    const grammar = (rawContent.grammar ?? []).map((g) => ({
      ...g,
      examples: g.examples ?? [],
    }));

    return { ...rawContent, vocab, grammar };
  }, [rawContent, lesson, levelId, unitId, lessonId]);

  // Every lesson benefits from AI generation now — even hand-authored lessons
  // need topic-aligned grammar / expressions / quiz / listening / output
  // (the LESSON_CONTENT entries for those sections are a generic shared
  // template). The auto-load effect short-circuits to PREGEN_MAP when the
  // lesson is already in the pre-generated bundle.
  const isAiLesson = !!lesson;

  const generateLesson = async (force = false) => {
    if (!lesson) return;
    const lv = Number(levelId);
    const un = Number(unitId);
    const ls = Number(lessonId);
    if (!force) {
      const cached = await getCachedLesson(lv, un, ls);
      if (cached) {
        setAiContent(cached);
        return;
      }
    } else {
      await clearCachedLesson(lv, un, ls);
      setAiContent(null);
    }
    setGenerating(true);
    try {
      const levelName = LEVELS.find((l) => l.id === lv)?.name;
      const unitTitle = findUnit(lv, un)?.title;
      // Pass the words already covered by earlier lessons so the AI
      // can pick genuinely new vocabulary for this lesson.
      const priorWords = Array.from(getPriorLessonWords(lv, un, ls));
      // If this lesson has hand-authored reading + vocab from the curriculum,
      // pass them so all quiz / fillBlanks / listening / expressions / output
      // are generated AGAINST the actual text the learner reads — not against
      // an AI-invented passage that the user never sees.
      const authored = LESSON_CONTENT[lesson.title] ?? null;
      const useAuthored = hasAuthoredContent(lesson.title) && authored;
      const { data, error } = await supabase.functions.invoke("generate-lesson", {
        body: {
          title: lesson.title,
          levelName,
          unitTitle,
          priorWords,
          ...(useAuthored
            ? {
                authoredReading: authored.reading,
                authoredVocab: authored.vocab,
              }
            : {}),
        },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setAiContent(data as LessonContent);
      void setCachedLesson(lv, un, ls, data as LessonContent);
      if (force) toast.success(tt("✨ 已重新生成本课内容"));
    } catch (e: any) {
      toast.error(tt("生成失败"), { description: e?.message ?? tt("请稍后再试") });
    } finally {
      setGenerating(false);
    }
  };

  // Auto-load or generate AI content when entering an AI lesson
  useEffect(() => {
    if (!lesson) return;
    if (!isAiLesson) {
      setAiContent(null);
      return;
    }
    // If we already shipped a pre-generated version, use it instantly and skip AI calls.
    // EXCEPTION: for hand-authored lessons (reading + vocab come from the
    // curriculum), the pregen bundle's quiz / fillBlanks / listening were
    // generated against AI-invented reading and won't match the real lesson.
    // Skip the pregen shortcut so we regenerate against the authored text.
    if (PREGEN_MAP[lesson.title] && !hasAuthoredContent(lesson.title)) {
      setAiContent(PREGEN_MAP[lesson.title]);
      return;
    }
    const lv = Number(levelId);
    const un = Number(unitId);
    const ls = Number(lessonId);
    // Show local copy instantly (if any), then sync from cloud in background.
    const local = getLocalCachedLesson(lv, un, ls);
    if (local) setAiContent(local);
    let cancelled = false;
    (async () => {
      const cached = await getCachedLesson(lv, un, ls);
      if (cancelled) return;
      // For authored lessons, only honor the cache if its reading matches the
      // authored reading. Otherwise (stale cache from before quizzes were
      // bound to authored text), regenerate so quiz / fill / listening line up.
      const authored = LESSON_CONTENT[lesson.title];
      const matchesAuthored = (() => {
        if (!hasAuthoredContent(lesson.title) || !authored || !cached) return true;
        const a = (authored.reading ?? []).map((r) => r.en).join("|");
        const c = (cached.reading ?? []).map((r) => r.en).join("|");
        return a === c;
      })();
      if (cached && matchesAuthored) {
        setAiContent(cached);
      } else {
        generateLesson(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelId, unitId, lessonId, isAiLesson]);

  // Trigger nudge when the user completes all quiz questions
  useEffect(() => {
    if (!content) return;
    const total = content.quiz.length;
    const answered = Object.keys(quizPicks).length;
    if (total > 0 && answered === total) {
      if (!recordedQuizRef.current) {
        recordedQuizRef.current = true;
        const correct = content.quiz.reduce(
          (acc, q, i) => acc + (quizPicks[i] === q.answer ? 1 : 0),
          0,
        );
        recordQuiz(correct, total);
        const p = loadProgress();
        const acc = p.quizTotal > 0 ? Math.round((p.quizCorrect / p.quizTotal) * 100) : 0;
        nudge(
          "quiz-done",
          `🎯 ${tt("本次答对")} ${correct}/${total}`,
          `${tt("累计正确率")} ${acc}%（${tt("共答")} ${p.quizTotal} ${tt("题），登录后查看完整学习数据面板。")}`,
        );
      }
    }
  }, [quizPicks, content, nudge]);

  if (!lesson) return <div className="p-10">{tt("课程不存在")}</div>;

  if (!content) {
    return (
      <main className="mx-auto min-h-screen max-w-3xl px-5 py-10 md:px-8 md:py-14">
        <PageHeader
          title={`Lesson ${lesson.id} · ${lesson.title}`}
          subtitle={""}
          back={`/level/${levelId}/unit/${unitId}`}
        />
        <div className="grid place-items-center rounded-3xl bg-card p-10 shadow-card">
          <Sparkles className="mb-3 size-8 animate-pulse text-primary" />
          <p className="text-base font-semibold"><T>AI 正在为你定制本课…</T></p>
          <p className="mt-1 text-sm text-muted-foreground"><T>通常需要 5–15 秒</T></p>
        </div>
      </main>
    );
  }

  // Build vocab quiz: word -> meaning matching for EVERY vocab item.
  // Distractors are picked from the other vocab in this lesson (rotated by
  // index so each question gets a different set), with a stable order.
  const vocabQuizItems = content.vocab.map((v, idx) => {
    const others = content.vocab.filter((x) => x.word !== v.word);
    // rotate so each question has a different distractor mix
    const rotated = others.length > 0
      ? [...others.slice(idx % others.length), ...others.slice(0, idx % others.length)]
      : [];
    const distractors = rotated.slice(0, 3);
    const opts = [...distractors.map((d) => d.meaning), v.meaning].sort();
    return {
      idx,
      word: v.word,
      pron: v.pron,
      options: opts,
      answer: opts.indexOf(v.meaning),
    };
  });

  // ─── Mastery scoring ────────────────────────────────────────────────
  // The lesson is auto-marked as 已掌握 only when the learner has
  // answered every test question correctly across all four quizzes:
  // reading quiz · vocab quiz · fill-in-the-blanks · listening blanks.
  const quizScore = {
    correct: content.quiz.reduce(
      (acc, q, i) => acc + (quizPicks[i] === q.answer ? 1 : 0),
      0,
    ),
    total: content.quiz.length,
  };
  const vocabScore = {
    correct: vocabQuizItems.reduce(
      (acc, q) => acc + (vocabQuiz[q.idx] === q.answer ? 1 : 0),
      0,
    ),
    total: vocabQuizItems.length,
  };
  const fillScore = {
    correct: content.fillBlanks.reduce(
      (acc, b, i) => acc + ((fills[i] ?? "").trim().toLowerCase() === b.answer.toLowerCase() ? 1 : 0),
      0,
    ),
    total: content.fillBlanks.length,
  };
  const listenScore = {
    correct: content.listening.blanks.reduce(
      (acc, b, i) => acc + ((listenInputs[i] ?? "").trim().toLowerCase() === b.answer.toLowerCase() ? 1 : 0),
      0,
    ),
    total: content.listening.blanks.length,
  };
  const totalCorrect = quizScore.correct + vocabScore.correct + fillScore.correct + listenScore.correct;
  const totalQuestions = quizScore.total + vocabScore.total + fillScore.total + listenScore.total;
  const allPerfect = totalQuestions > 0 && totalCorrect === totalQuestions;

  // Auto-mark as mastered the first time the learner hits 100% on every quiz.
  useEffect(() => {
    if (!lesson) return;
    if (allPerfect && !mastered) {
      setMastered(Number(levelId), Number(unitId), Number(lessonId), true);
      setMasteredState(true);
      markLessonComplete(Number(levelId), Number(unitId), Number(lessonId));
      // Milestone — first time the learner aces every quiz in the lesson.
      fireConfetti("celebrate");
      toast.success(tt("🏆 全部答对 · 已自动标记为掌握"), {
        description: tt("下次打开 App 会建议你继续学习下一课。"),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allPerfect]);

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-10 md:px-8 md:py-14">
      <PageHeader
        title={`Lesson ${lesson.id} · ${lesson.title}`}
        subtitle=""
        back={`/level/${levelId}/unit/${unitId}`}
      />

      {/* Quick action: listen to the entire article */}
      <div className="mb-4 flex justify-start">
        <button
          type="button"
          onClick={playReadingAll}
          className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/20"
        >
          <Volume2 className="size-4" />
          <T>播放整篇朗读</T> · Listen to article
        </button>
      </div>

      {/* Mastery status — visible across every step */}
      <div
        className={`mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4 ${
          mastered
            ? "border-emerald-500/30 bg-emerald-500/10"
            : totalCorrect > 0
              ? "border-amber-500/30 bg-amber-500/10"
              : "border-border bg-secondary/40"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`grid size-9 place-items-center rounded-full text-base ${
              mastered
                ? "bg-emerald-500 text-white"
                : totalCorrect > 0
                  ? "bg-amber-500 text-white"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            {mastered ? "🏆" : totalCorrect > 0 ? "⚡" : "○"}
          </div>
          <div>
            <div className="text-sm font-bold">
              {mastered ? (
                <><T>已掌握</T> · Mastered</>
              ) : totalCorrect > 0 ? (
                <><T>学习中</T> · In progress</>
              ) : (
                <><T>未掌握</T> · Not started</>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              <T>测试得分</T> {totalCorrect} / {totalQuestions} · <T>全部答对自动标记为掌握</T>
            </div>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          <T>阅读</T> {quizScore.correct}/{quizScore.total} · <T>词汇</T> {vocabScore.correct}/{vocabScore.total} · <T>选词</T> {fillScore.correct}/{fillScore.total} · <T>听力</T> {listenScore.correct}/{listenScore.total}
        </div>
      </div>

      {/* Steps */}
      <section className="mb-8 rounded-3xl bg-card p-5 shadow-card md:p-7">
        <div className="mb-5 flex items-baseline gap-2">
          <h2 className="text-lg font-bold"><T>学习步骤</T></h2>
          <span className="text-sm text-muted-foreground">· STEPS</span>
          <div className="ml-2 h-0.5 w-10 rounded bg-grad-title" />
        </div>
        <ul className="grid grid-cols-1 gap-2 md:grid-cols-3">
          {LESSON_STEPS.map((s) => {
            const Icon = STEP_ICONS[s.icon as keyof typeof STEP_ICONS];
            const active = activeStep === s.id;
            return (
              <li key={s.id}>
                <button
                  onClick={() => goToStep(s.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
                    active
                      ? "bg-grad-title text-white shadow-tile"
                      : "bg-secondary/40 text-foreground hover:bg-secondary"
                  }`}
                >
                  <div
                    className={`grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold ${
                      active ? "bg-white/25 text-white" : "bg-card text-muted-foreground"
                    }`}
                  >
                    {s.id}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`truncate font-bold ${active ? "text-white" : ""} text-sm`}>
                      <T>{s.cn}</T>
                    </div>
                    <div className={`truncate text-[11px] ${active ? "text-white/85" : "text-muted-foreground"}`}>
                      {s.en}
                    </div>
                  </div>
                  <Icon className={`size-4 ${active ? "text-white/90" : "text-muted-foreground"}`} />
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <div ref={contentRef}>
      {/* Step 1 — Vocabulary */}
      {activeStep === 1 && (
        <section className="rounded-3xl bg-card p-6 shadow-card md:p-8">
          <SectionHeader
            icon={<Star className="size-6" fill="currentColor" />}
            color="bg-pink-500/15 text-pink-500"
            title="Vocabulary"
            subtitle=""
          />
          <div className="space-y-4">
            {content.vocab.map((v, i) => (
              <article
                key={v.word}
                className="relative rounded-2xl border border-border bg-secondary/30 p-5 md:p-6"
              >
                <span className="absolute right-4 top-3 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                  #{i + 1}
                </span>
                <div className="flex items-center gap-3">
                  <h4 className="text-2xl font-extrabold tracking-tight">{v.word}</h4>
                  <button
                    onClick={() => speak(v.word)}
                    className="grid size-8 place-items-center rounded-full text-primary transition hover:bg-primary/10"
                    aria-label="Play"
                  >
                    <Volume2 className="size-5" />
                  </button>
                </div>
                <div className="mt-1 font-mono text-sm text-muted-foreground">{v.pron}</div>
                <div className="mt-4 rounded-xl bg-card p-4">
                  <div className="font-semibold">{nativeText(v.meaning)}</div>
                  <p className="mt-2 italic text-foreground/80">"{v.example}"</p>
                  <p className="mt-1 text-sm text-muted-foreground"><T>{v.example_cn}</T></p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Step 2 — Vocab Quiz */}
      {activeStep === 2 && (
        <section className="rounded-3xl bg-card p-6 shadow-card md:p-8">
          <SectionHeader
            icon={<Target className="size-6" />}
            color="bg-orange-500/15 text-orange-500"
            title="Vocab Quiz"
            subtitle=""
          />
          <div className="space-y-5">
            {vocabQuizItems.map((q) => {
              const picked = vocabQuiz[q.idx];
              return (
                <div key={q.idx} className="rounded-2xl border border-border bg-secondary/30 p-5">
                  <div className="flex items-center gap-3">
                    <h4 className="text-xl font-extrabold">{q.word}</h4>
                    <span className="font-mono text-xs text-muted-foreground">{q.pron}</span>
                    <button
                      onClick={() => speak(q.word)}
                      className="ml-auto grid size-8 place-items-center rounded-full text-primary hover:bg-primary/10"
                    >
                      <Volume2 className="size-4" />
                    </button>
                  </div>
                  <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                    {q.options.map((opt, oi) => {
                      const isPicked = picked === oi;
                      const isCorrect = oi === q.answer;
                      const reveal = picked !== undefined;
                      return (
                        <button
                          key={oi}
                          onClick={() => setVocabQuiz({ ...vocabQuiz, [q.idx]: oi })}
                          disabled={reveal}
                          className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition ${
                            reveal && isCorrect
                              ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                              : reveal && isPicked
                                ? "border-rose-400 bg-rose-50 text-rose-700"
                                : "border-border bg-card hover:border-primary/40"
                          }`}
                        >
                          <span>{nativeText(opt)}</span>
                          {reveal && isCorrect && <Check className="size-4" />}
                          {reveal && isPicked && !isCorrect && <X className="size-4" />}
                        </button>
                      );
                    })}
                  </div>
                  {picked !== undefined && (
                    <div className="mt-3">
                      <button
                        onClick={() => setTutorReq({
                          refId: `lesson-${levelId}-${unitId}-${lessonId}-vocab-${q.idx}`,
                          snapshot: {
                            type: "vocab_quiz",
                            word: q.word,
                            options: q.options,
                            correct_index: q.answer,
                            user_index: picked,
                            is_correct: picked === q.answer,
                          },
                        })}
                        className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10"
                      >
                        <MessageCircleQuestion className="size-3.5" /> <T>问小月</T>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Step 3 — Reading */}
      {activeStep === 3 && (
        <section className="rounded-3xl bg-card p-6 shadow-card md:p-8">
          <SectionHeader
            icon={<Book className="size-6" />}
            color="bg-violet-500/15 text-violet-500"
            title="Reading"
            subtitle=""
          />
          <div className="space-y-5">
            {content.reading.map((p, i) => {
              const isActive = activeReadingIdx === i;
              return (
              <div
                key={i}
                className={`grid grid-cols-[28px_1fr] gap-x-4 rounded-2xl border p-5 transition md:grid-cols-[36px_1fr_1fr] md:gap-x-6 ${
                  isActive
                    ? "border-primary/50 bg-primary/10 shadow-sm"
                    : "border-border bg-secondary/30"
                }`}
              >
                <div className={`pt-1 text-sm font-medium ${isActive ? "text-primary font-bold" : "text-muted-foreground"}`}>{i + 1}</div>
                <div className="flex items-start gap-2">
                  <p className={`flex-1 text-base leading-relaxed transition ${isActive ? "font-bold text-primary" : ""}`}>{p.en}</p>
                  <button
                    onClick={() => speak(p.en)}
                    className="grid size-8 shrink-0 place-items-center rounded-full text-primary hover:bg-primary/10 md:hidden"
                    aria-label={tt("朗读")}
                  >
                    <Volume2 className="size-4" />
                  </button>
                </div>
                <div className="col-start-2 mt-2 md:col-start-3 md:mt-0">
                  <div className="flex items-start gap-2">
                    <p className={`flex-1 text-base leading-relaxed transition ${isActive ? "font-bold text-primary" : "text-foreground/90"}`}><T>{p.cn}</T></p>
                    <button
                      onClick={() => speak(p.en)}
                      className="hidden size-8 shrink-0 place-items-center rounded-full text-primary hover:bg-primary/10 md:grid"
                      aria-label={tt("朗读")}
                    >
                      <Volume2 className="size-4" />
                    </button>
                  </div>
                  {p.note && (
                    <div className="mt-2 rounded-lg border-l-2 border-amber-400 bg-amber-50 px-3 py-1.5 text-xs italic text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
                      💡 {p.note}
                    </div>
                  )}
                </div>
              </div>
              );
            })}
            <button
              onClick={playReadingAll}
              className="w-full rounded-2xl bg-grad-title py-3 font-semibold text-white shadow-tile"
            >
              ▶ <T>播放整篇朗读</T>
            </button>
          </div>
        </section>
      )}

      {/* Step 4 — Grammar */}
      {activeStep === 4 && (
        <section className="rounded-3xl bg-card p-6 shadow-card md:p-8">
          <SectionHeader
            icon={<FileText className="size-6" />}
            color="bg-sky-500/15 text-sky-500"
            title="Grammar"
            subtitle=""
          />
          <div className="space-y-5">
            {content.grammar.map((g, i) => (
              <div key={i} className="rounded-2xl border border-border bg-secondary/30 p-5">
                <h4 className="text-lg font-bold">{nativeText(g.title)}</h4>
                <p className="mt-2 text-sm text-foreground/80">{nativeText(g.explain)}</p>
                <ul className="mt-3 space-y-2">
                  {g.examples.map((ex, j) => (
                    <li key={j} className="rounded-xl bg-card p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold">{ex.en}</span>
                        <button
                          onClick={() => speak(ex.en)}
                          className="text-primary hover:opacity-70"
                        >
                          <Volume2 className="size-4" />
                        </button>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground"><T>{ex.cn}</T></div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Step 5 — Expressions */}
      {activeStep === 5 && (
        <section className="rounded-3xl bg-card p-6 shadow-card md:p-8">
          <SectionHeader
            icon={<MessageCircle className="size-6" />}
            color="bg-teal-500/15 text-teal-500"
            title="Expressions"
            subtitle=""
          />
          <div className="grid gap-3 md:grid-cols-2">
            {content.expressions.map((e, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border bg-secondary/30 p-5"
              >
                <div className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {nativeText(e.scene)}
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <p className="text-base font-semibold">{e.en}</p>
                  <button
                    onClick={() => speak(e.en)}
                    className="text-primary hover:opacity-70"
                  >
                    <Volume2 className="size-4" />
                  </button>
                </div>
                <p className="mt-1 text-sm text-muted-foreground"><T>{e.cn}</T></p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Step 6 — Fill in */}
      {activeStep === 6 && (
        <section className="rounded-3xl bg-card p-6 shadow-card md:p-8">
          <SectionHeader
            icon={<Pencil className="size-6" />}
            color="bg-amber-500/15 text-amber-500"
            title="Fill-in"
            subtitle=""
          />
          <div className="space-y-5">
            {content.fillBlanks.map((f, i) => {
              const picked = fills[i];
              const correct = picked === f.answer;
              return (
                <div key={i} className="rounded-2xl border border-border bg-secondary/30 p-5">
                  <p className="text-base">
                    {nativeText(f.sentence.split("___")[0])}
                    <span
                      className={`mx-1 inline-block min-w-20 rounded-md border-b-2 px-2 text-center font-bold ${
                        picked
                          ? correct
                            ? "border-emerald-400 text-emerald-600"
                            : "border-rose-400 text-rose-600"
                          : "border-muted-foreground/40 text-muted-foreground"
                      }`}
                    >
                      {picked || "____"}
                    </span>
                    {nativeText(f.sentence.split("___")[1] ?? "")}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {f.options.map((o) => (
                      <button
                        key={o}
                        onClick={() => setFills({ ...fills, [i]: o })}
                        disabled={!!picked}
                        className={`flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                          picked === o
                            ? correct
                              ? "border-emerald-500 bg-emerald-500 text-white shadow-sm"
                              : "border-rose-500 bg-rose-500 text-white shadow-sm"
                            : picked && o === f.answer
                              ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                              : picked
                                ? "border-border bg-card text-muted-foreground opacity-60"
                                : "border-border bg-card hover:border-primary/40"
                        }`}
                      >
                        <span>{nativeText(o)}</span>
                        {picked === o && correct && <Check className="size-3.5" />}
                        {picked === o && !correct && <X className="size-3.5" />}
                        {picked && picked !== o && o === f.answer && (
                          <Check className="size-3.5 text-emerald-600" />
                        )}
                      </button>
                    ))}
                  </div>
                  {picked && (
                    <div
                      className={`mt-3 flex items-start gap-2 rounded-lg p-3 text-sm ${
                        correct
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {correct ? (
                        <>
                          <Check className="mt-0.5 size-4 shrink-0" />
                          <span>
                            <strong><T>正确！</T></strong> <T>{f.cn}</T>
                          </span>
                        </>
                      ) : (
                        <>
                          <X className="mt-0.5 size-4 shrink-0" />
                          <span>
                            <strong><T>不对，正确答案是</T> "{f.answer}"。</strong> <T>{f.cn}</T>
                          </span>
                        </>
                      )}
                    </div>
                  )}
                  {picked && (
                    <div className="mt-2">
                      <button
                        onClick={() => setTutorReq({
                          refId: `lesson-${levelId}-${unitId}-${lessonId}-fill-${i}`,
                          snapshot: {
                            type: "fill_blank",
                            sentence: f.sentence,
                            options: f.options,
                            correct_answer: f.answer,
                            user_answer: picked,
                            is_correct: correct,
                            translation: f.cn,
                          },
                        })}
                        className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10"
                      >
                        <MessageCircleQuestion className="size-3.5" /> <T>问小月</T>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Step 7 — Quiz */}
      {activeStep === 7 && (
        <section className="rounded-3xl bg-card p-6 shadow-card md:p-8">
          <SectionHeader
            icon={<HelpCircle className="size-6" />}
            color="bg-fuchsia-500/15 text-fuchsia-500"
            title="Quiz"
            subtitle=""
          />
          <div className="space-y-5">
            {content.quiz.map((q, i) => {
              const picked = quizPicks[i];
              const reveal = picked !== undefined;
              return (
                <div key={i} className="rounded-2xl border border-border bg-secondary/30 p-5">
                  <div className="font-semibold">
                    {i + 1}. {nativeText(q.q)}
                  </div>
                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                    {q.options.map((o, oi) => {
                      const isPicked = picked === oi;
                      const isCorrect = oi === q.answer;
                      return (
                        <button
                          key={oi}
                          disabled={reveal}
                          onClick={() => setQuizPicks({ ...quizPicks, [i]: oi })}
                          className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition ${
                            reveal && isCorrect
                              ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                              : reveal && isPicked
                                ? "border-rose-400 bg-rose-50 text-rose-700"
                                : "border-border bg-card hover:border-primary/40"
                          }`}
                        >
                          <span>{nativeText(o)}</span>
                          {reveal && isCorrect && <Check className="size-4" />}
                          {reveal && isPicked && !isCorrect && <X className="size-4" />}
                        </button>
                      );
                    })}
                  </div>
                  {reveal && q.explain && (
                    <p className="mt-3 rounded-lg bg-primary/5 p-3 text-xs text-primary">
                      💡 {nativeText(q.explain)}
                    </p>
                  )}
                  {reveal && (
                    <div className="mt-3">
                      <button
                        onClick={() => setTutorReq({
                          refId: `lesson-${levelId}-${unitId}-${lessonId}-quiz-${i}`,
                          snapshot: {
                            type: "quiz",
                            question: q.q,
                            options: q.options,
                            correct_index: q.answer,
                            user_index: picked,
                            is_correct: picked === q.answer,
                            explain: q.explain,
                          },
                        })}
                        className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10"
                      >
                        <MessageCircleQuestion className="size-3.5" /> <T>问小月</T>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Step 8 — Listening */}
      {activeStep === 8 && (
        <section className="rounded-3xl bg-card p-6 shadow-card md:p-8">
          <SectionHeader
            icon={<Headphones className="size-6" />}
            color="bg-indigo-500/15 text-indigo-500"
            title="Listening"
            subtitle=""
          />
          <div className="space-y-3">
            {content.listening.blanks.map((b, i) => {
              const v = listenInputs[i] ?? "";
              const correct = v.trim().toLowerCase() === b.answer.toLowerCase();
              const finished = v.trim().length >= b.answer.trim().length;
              const showFeedback = correct || finished;
              const sentence = `${b.before} ${b.answer} ${b.after}`.replace(/\s+/g, " ").trim();
              return (
                <div
                  key={i}
                  className="rounded-2xl border border-border bg-secondary/30 p-4 text-base"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <span className="grid size-7 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {i + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => speak(sentence)}
                      className="flex items-center gap-2 rounded-full bg-grad-title px-4 py-2 text-sm font-semibold text-white shadow-tile"
                    >
                      <Volume2 className="size-4" /> <T>播放第</T> {i + 1} <T>题</T>
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span>{nativeText(b.before)}</span>
                    <input
                      value={v}
                      onChange={(e) => setListenInputs({ ...listenInputs, [i]: e.target.value })}
                      className={`min-w-28 rounded-md border-b-2 bg-transparent px-2 py-1 text-center font-bold outline-none ${
                        v && showFeedback
                          ? correct
                            ? "border-emerald-400 text-emerald-600"
                            : "border-rose-400 text-rose-600"
                          : "border-muted-foreground/40"
                      }`}
                      placeholder={tt("输入")}
                    />
                    <span>{nativeText(b.after)}</span>
                    {v && correct && <Check className="size-4 text-emerald-500" />}
                  </div>
                  {v && showFeedback && (
                    correct ? (
                      <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-600">
                        <Check className="size-4" /> <T>回答正确</T>
                      </div>
                    ) : (
                      <div className="mt-3 flex items-center gap-2 rounded-xl bg-rose-500/10 px-3 py-2 text-sm text-rose-600">
                        <X className="size-4 shrink-0" />
                        <span>
                          <span className="font-semibold"><T>回答错误</T></span>
                          <span className="mx-1">·</span>
                          <T>正确答案：</T>
                          <span className="font-bold">{b.answer}</span>
                        </span>
                      </div>
                    )
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Step 9 — Output */}
      {activeStep === 9 && (
        <section className="rounded-3xl bg-card p-6 shadow-card md:p-8">
          <SectionHeader
            icon={<Mic className="size-6" />}
            color="bg-rose-500/15 text-rose-500"
            title="Output"
            subtitle=""
          />
          <div className="rounded-2xl border border-border bg-secondary/30 p-5">
            <p className="font-semibold">{content.output.prompt}</p>
            <p className="mt-1 text-sm text-muted-foreground"><T>{content.output.cn}</T></p>
          </div>
          <textarea
            value={output}
            onChange={(e) => setOutput(e.target.value)}
            placeholder="Type your introduction here..."
            rows={6}
            className="mt-4 w-full rounded-2xl border border-border bg-card p-4 text-sm outline-none focus:border-primary"
          />
          <details className="mt-4 rounded-2xl border border-border bg-secondary/30 p-5">
            <summary className="cursor-pointer font-semibold text-primary">
              <Sparkles className="mr-1 inline size-4" /> <T>查看范文</T>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-foreground/85">
              {content.output.sample}
            </p>
          </details>
          <button
            onClick={() => speak(content.output.sample)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-grad-title py-3 font-semibold text-white shadow-tile"
          >
            <Volume2 className="size-5" /> <T>朗读范文</T>
          </button>

          {/* Finish & AI check */}
          <button
            onClick={checkWriting}
            disabled={checking}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-emerald-500 bg-emerald-500/10 py-3 font-semibold text-emerald-700 transition hover:bg-emerald-500/20 disabled:opacity-60"
          >
            {checking ? (
              <>
                <Sparkles className="size-5 animate-pulse" /> <T>AI 正在批改…</T>
              </>
            ) : (
              <>
                <CheckCircle2 className="size-5" /> <T>完成 · AI 检查并讲解</T>
              </>
            )}
          </button>

          {feedback && (
            <div className="mt-5 space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-bold text-emerald-700">📝 <T>AI 写作点评</T></h4>
                <span className="rounded-full bg-emerald-600 px-3 py-1 text-sm font-bold text-white">
                  {feedback.score} <T>分</T>
                </span>
              </div>
              <p className="text-sm leading-relaxed text-foreground/85"><T>{feedback.overall}</T></p>

              {feedback.mistakes.length > 0 ? (
                <div>
                  <div className="mb-2 text-sm font-semibold text-rose-600">🔍 <T>需要修改的地方</T></div>
                  <ul className="space-y-3">
                    {feedback.mistakes.map((m, i) => (
                      <li key={i} className="rounded-xl border border-rose-200 bg-white p-3 text-sm">
                        <div className="text-rose-600 line-through">{m.original}</div>
                        <div className="mt-1 font-semibold text-emerald-600">✓ {m.corrected}</div>
                        <div className="mt-2 text-foreground/75"><T>{m.explanation}</T></div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="rounded-xl bg-white p-3 text-sm text-emerald-700">
                  🎉 <T>没有发现明显错误，写得很棒！</T>
                </div>
              )}

              {feedback.suggestions.length > 0 && (
                <div>
                  <div className="mb-2 text-sm font-semibold text-primary">💡 <T>改进建议</T></div>
                  <ul className="list-disc space-y-1 pl-5 text-sm text-foreground/80">
                    {feedback.suggestions.map((s, i) => (
                      <li key={i}><T>{s}</T></li>
                    ))}
                  </ul>
                </div>
              )}

              {feedback.improved && (
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-sm font-semibold text-primary">✨ <T>润色后版本</T></div>
                    <button
                      onClick={() => speak(feedback.improved)}
                      className="text-primary hover:opacity-70"
                      aria-label="Play improved version"
                    >
                      <Volume2 className="size-4" />
                    </button>
                  </div>
                  <p className="rounded-xl bg-white p-3 text-sm leading-relaxed text-foreground/85">
                    {feedback.improved}
                  </p>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* Step nav */}
      </div>
      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={() => goToStep(Math.max(1, activeStep - 1))}
          disabled={activeStep === 1}
          className="rounded-full border border-border bg-card px-5 py-2 text-sm font-semibold disabled:opacity-40"
        >
          ← <T>上一步</T>
        </button>
        <span className="text-sm text-muted-foreground">
          {activeStep} / {LESSON_STEPS.length}
        </span>
        <button
          onClick={() => goToStep(Math.min(LESSON_STEPS.length, activeStep + 1))}
          disabled={activeStep === LESSON_STEPS.length}
          className="rounded-full bg-grad-title px-5 py-2 text-sm font-semibold text-white shadow-tile disabled:opacity-40"
        >
          <T>下一步</T> →
        </button>
      </div>

      {/* AI voice chat (uses this lesson as the topic) */}
      <div className="mt-6 overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-5 shadow-card md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-base font-bold">
              <Phone className="size-5 text-primary" />
              <T>用本课和 Alex 聊 10 分钟</T>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              <T>地道美式英语真人对话 · 结束自动给出双语讲解和词汇测试</T>
            </p>
          </div>
          <button
            onClick={() => {
              setTalkOpen(true);
            }}
            className="rounded-full bg-grad-title px-5 py-2.5 text-sm font-semibold text-white shadow-tile transition hover:opacity-95"
          >
            🎙️ {authedUser ? <T>开始对话</T> : <T>免费试一下 3 分钟</T>}
          </button>
        </div>
      </div>

      {/* Mastery toggle */}
      <div className="mt-6 rounded-3xl border border-border bg-card p-5 shadow-card md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-base font-bold">
              <CheckCircle2 className={`size-5 ${mastered ? "text-emerald-500" : "text-muted-foreground"}`} />
              {mastered ? <T>你已掌握本课</T> : <T>感觉已经掌握了？</T>}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {mastered ? (
                <T>下次打开 App，我们会建议你继续学习下一课。</T>
              ) : (
                <T>标记为「已掌握」后，下次打开 App 会提醒你继续下一课。</T>
              )}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={toggleMastered}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                mastered
                  ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/15"
                  : "bg-grad-title text-white shadow-tile hover:opacity-95"
              }`}
            >
              {mastered ? <>✓ <T>已掌握 · 点击取消</T></> : <>🎯 <T>标记为已掌握</T></>}
            </button>
            {(() => {
              const next = findNextLesson(Number(levelId), Number(unitId), Number(lessonId));
              if (!next) {
                return (
                  <span className="rounded-full border border-border bg-secondary px-5 py-2.5 text-sm font-semibold text-muted-foreground">
                    🎉 <T>全部课程已完成</T>
                  </span>
                );
              }
              return (
                <Link
                  to={`/level/${next.levelId}/unit/${next.unitId}/lesson/${next.lessonId}`}
                  className="rounded-full bg-grad-title px-5 py-2.5 text-sm font-semibold text-white shadow-tile transition hover:opacity-95"
                >
                  <T>下一课</T> →
                </Link>
              );
            })()}
          </div>
        </div>
      </div>

      <AITalkDialog
        open={talkOpen}
        onClose={() => setTalkOpen(false)}
        lessonTitle={lesson?.title}
        unitTitle={findUnit(Number(levelId), Number(unitId))?.title}
        levelName={LEVELS.find((l) => l.id === Number(levelId))?.name}
        level={["A1","A2","B1","B2","C1","C2"][Number(levelId) - 1] || undefined}
        isGuest={!authedUser}
        userId={authedUserId}
      />

      {tutorReq && (
        <TutorChat
          context="lesson"
          questionRef={tutorReq.refId}
          questionSnapshot={{ ...tutorReq.snapshot, lesson_title: lesson?.title }}
          open={!!tutorReq}
          onClose={() => setTutorReq(null)}
        />
      )}
    </main>
  );
};

export default Lesson;