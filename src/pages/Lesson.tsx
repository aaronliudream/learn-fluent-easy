import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Book,
  BookOpen,
  Check,
  CheckCircle2,
  FileText,
  Headphones,
  HelpCircle,
  MessageCircle,
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
import { speak } from "@/lib/speak";
import { useGuestNudge } from "@/hooks/useGuestNudge";
import { findNextLesson, isMastered, setLastVisited, setMastered } from "@/lib/mastery";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  clearCachedLesson,
  getCachedLesson,
  getLocalCachedLesson,
  setCachedLesson,
} from "@/lib/lessonCache";
import {
  addStudyMinutes,
  getStreak,
  loadProgress,
  markLessonComplete,
  recordQuiz,
  touchActive,
} from "@/lib/guestProgress";

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

  useEffect(() => {
    setMasteredState(isMastered(Number(levelId), Number(unitId), Number(lessonId)));
    setLastVisited(Number(levelId), Number(unitId), Number(lessonId));
  }, [levelId, unitId, lessonId]);

  const toggleMastered = () => {
    const next = !mastered;
    setMastered(Number(levelId), Number(unitId), Number(lessonId), next);
    setMasteredState(next);
    if (next) {
      markLessonComplete(Number(levelId), Number(unitId), Number(lessonId));
      const nextLesson = findNextLesson(Number(levelId), Number(unitId), Number(lessonId));
      toast.success("🎓 已标记为掌握", {
        description: nextLesson
          ? `下次打开 App 时会提醒你继续：${nextLesson.title}`
          : "你已完成全部课程，太棒啦！",
      });
    } else {
      toast("已取消「掌握」标记");
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
        ? `🔥 已连续学习 ${streak} 天，登录后保住你的连胜，并解锁学习数据面板。`
        : `已完成 ${p.completedLessons.length} 节课${p.studyMinutes > 0 ? `、累计学习 ${p.studyMinutes} 分钟` : ""}，登录后这些进度永久保留。`;
      nudge("lesson-finish", "🎉 完成一节课！", desc);
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

  const checkWriting = async () => {
    if (!output.trim()) {
      toast("请先在上方写下你的英文回答");
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
        },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setFeedback(data as Feedback);
      toast.success("✅ 已完成本课写作 · 查看下方点评");
      // Mark lesson as completed in progress
      markLessonComplete(Number(levelId), Number(unitId), Number(lessonId));
    } catch (e: any) {
      toast.error("检查失败", { description: e?.message ?? "请稍后再试" });
    } finally {
      setChecking(false);
    }
  };

  const content = useMemo(() => {
    if (!lesson) return null;
    const authored = LESSON_CONTENT[lesson.title] ?? null;
    // Topic-specific content from AI (live) or the pre-generated bundle.
    const topical = aiContent ?? PREGEN_MAP[lesson.title] ?? null;
    if (hasAuthoredContent(lesson.title)) {
      // Authored lessons have hand-crafted vocab + reading. The remaining
      // sections (grammar / expressions / fillBlanks / quiz / listening /
      // output) in LESSON_CONTENT are a generic template that is the same
      // for every lesson — so prefer topical AI content for those when
      // available, while keeping the authored vocab + reading.
      //
      // IMPORTANT: quiz / fillBlanks / listening reference the *reading*
      // passage. If we mix authored reading with topical quiz, the quiz
      // will ask about a story the user never saw. So when we use the
      // topical quiz/fill/listening, we MUST also use the topical reading.
      if (topical && authored) {
        return {
          ...topical,
          vocab: authored.vocab,
          // reading stays from `topical` so that quiz questions match
          // the passage shown in step 4.
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
        const tv = (topical as LessonContent)[k];
        if (!isEmpty(tv)) (merged as Record<string, unknown>)[k] = tv as unknown;
      });
      return merged;
    }
    return topical ?? authored;
  }, [lesson, aiContent]);

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
      const { data, error } = await supabase.functions.invoke("generate-lesson", {
        body: { title: lesson.title, levelName, unitTitle },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setAiContent(data as LessonContent);
      void setCachedLesson(lv, un, ls, data as LessonContent);
      if (force) toast.success("✨ 已重新生成本课内容");
    } catch (e: any) {
      toast.error("生成失败", { description: e?.message ?? "请稍后再试" });
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
    if (PREGEN_MAP[lesson.title]) {
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
      if (cached) {
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
          `🎯 本次答对 ${correct}/${total}`,
          `累计正确率 ${acc}%（共答 ${p.quizTotal} 题），登录后查看完整学习数据面板。`,
        );
      }
    }
  }, [quizPicks, content, nudge]);

  if (!lesson) return <div className="p-10">课程不存在</div>;

  if (!content) {
    return (
      <main className="mx-auto min-h-screen max-w-3xl px-5 py-10 md:px-8 md:py-14">
        <PageHeader
          title={`Lesson ${lesson.id} · ${lesson.title}`}
          subtitle="正在为你生成本课内容…"
          back={`/level/${levelId}/unit/${unitId}`}
        />
        <div className="grid place-items-center rounded-3xl bg-card p-10 shadow-card">
          <Sparkles className="mb-3 size-8 animate-pulse text-primary" />
          <p className="text-base font-semibold">AI 正在为你定制本课…</p>
          <p className="mt-1 text-sm text-muted-foreground">通常需要 5–15 秒</p>
        </div>
      </main>
    );
  }

  // build vocab quiz: word -> meaning matching
  const vocabQuizItems = content.vocab.slice(0, 4).map((v, idx) => {
    const distractors = content.vocab.filter((x) => x.word !== v.word).slice(0, 3);
    const opts = [...distractors.map((d) => d.meaning), v.meaning].sort();
    return {
      idx,
      word: v.word,
      pron: v.pron,
      options: opts,
      answer: opts.indexOf(v.meaning),
    };
  });

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-10 md:px-8 md:py-14">
      <PageHeader
        title={`Lesson ${lesson.id} · ${lesson.title}`}
        subtitle="跟随步骤完成本课学习"
        back={`/level/${levelId}/unit/${unitId}`}
      />

      {isAiLesson && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
          <div className="flex items-center gap-2 text-foreground/80">
            <Sparkles className="size-4 text-primary" />
            <span>本课内容由 AI 为你定制</span>
          </div>
          <button
            onClick={() => generateLesson(true)}
            disabled={generating}
            className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-card px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/10 disabled:opacity-60"
          >
            <RefreshCw className={`size-3.5 ${generating ? "animate-spin" : ""}`} />
            {generating ? "生成中…" : "重新生成"}
          </button>
        </div>
      )}

      {/* Steps */}
      <section className="mb-8 rounded-3xl bg-card p-5 shadow-card md:p-7">
        <div className="mb-5 flex items-baseline gap-2">
          <h2 className="text-lg font-bold">学习步骤</h2>
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
                      {s.cn}
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
            title="词汇学习 Vocabulary"
            subtitle="学习本课的核心词汇"
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
                  <div className="font-semibold">{v.meaning}</div>
                  <p className="mt-2 italic text-foreground/80">"{v.example}"</p>
                  <p className="mt-1 text-sm text-muted-foreground">{v.example_cn}</p>
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
            title="词汇测试 Vocab Quiz"
            subtitle="选出每个单词正确的含义"
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
                          <span>{opt}</span>
                          {reveal && isCorrect && <Check className="size-4" />}
                          {reveal && isPicked && !isCorrect && <X className="size-4" />}
                        </button>
                      );
                    })}
                  </div>
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
            title="课文阅读 Reading"
            subtitle="点击右侧喇叭收听任意一句"
          />
          <div className="space-y-5">
            {content.reading.map((p, i) => (
              <div
                key={i}
                className="grid grid-cols-[28px_1fr] gap-x-4 rounded-2xl border border-border bg-secondary/30 p-5 md:grid-cols-[36px_1fr_1fr] md:gap-x-6"
              >
                <div className="pt-1 text-sm font-medium text-muted-foreground">{i + 1}</div>
                <div className="flex items-start gap-2">
                  <p className="flex-1 text-base leading-relaxed">{p.en}</p>
                  <button
                    onClick={() => speak(p.en)}
                    className="grid size-8 shrink-0 place-items-center rounded-full text-primary hover:bg-primary/10 md:hidden"
                    aria-label="朗读"
                  >
                    <Volume2 className="size-4" />
                  </button>
                </div>
                <div className="col-start-2 mt-2 md:col-start-3 md:mt-0">
                  <div className="flex items-start gap-2">
                    <p className="flex-1 text-base leading-relaxed text-foreground/90">{p.cn}</p>
                    <button
                      onClick={() => speak(p.en)}
                      className="hidden size-8 shrink-0 place-items-center rounded-full text-primary hover:bg-primary/10 md:grid"
                      aria-label="朗读"
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
            ))}
            <button
              onClick={() => speak(content.reading.map((r) => r.en).join(" "))}
              className="w-full rounded-2xl bg-grad-title py-3 font-semibold text-white shadow-tile"
            >
              ▶ 播放整篇朗读
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
            title="语法重点 Grammar"
            subtitle="掌握本课关键句型"
          />
          <div className="space-y-5">
            {content.grammar.map((g, i) => (
              <div key={i} className="rounded-2xl border border-border bg-secondary/30 p-5">
                <h4 className="text-lg font-bold">{g.title}</h4>
                <p className="mt-2 text-sm text-foreground/80">{g.explain}</p>
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
                      <div className="mt-1 text-xs text-muted-foreground">{ex.cn}</div>
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
            title="实用表达 Expressions"
            subtitle="日常场景常用句型"
          />
          <div className="grid gap-3 md:grid-cols-2">
            {content.expressions.map((e, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border bg-secondary/30 p-5"
              >
                <div className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {e.scene}
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
                <p className="mt-1 text-sm text-muted-foreground">{e.cn}</p>
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
            title="选词填空 Fill-in"
            subtitle="选择最合适的单词填入空格"
          />
          <div className="space-y-5">
            {content.fillBlanks.map((f, i) => {
              const picked = fills[i];
              const correct = picked === f.answer;
              return (
                <div key={i} className="rounded-2xl border border-border bg-secondary/30 p-5">
                  <p className="text-base">
                    {f.sentence.split("___")[0]}
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
                    {f.sentence.split("___")[1]}
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
                        <span>{o}</span>
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
                            <strong>正确！</strong> {f.cn}
                          </span>
                        </>
                      ) : (
                        <>
                          <X className="mt-0.5 size-4 shrink-0" />
                          <span>
                            <strong>不对，正确答案是 “{f.answer}”。</strong> {f.cn}
                          </span>
                        </>
                      )}
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
            title="阅读测验 Quiz"
            subtitle="检验对课文的理解"
          />
          <div className="space-y-5">
            {content.quiz.map((q, i) => {
              const picked = quizPicks[i];
              const reveal = picked !== undefined;
              return (
                <div key={i} className="rounded-2xl border border-border bg-secondary/30 p-5">
                  <div className="font-semibold">
                    {i + 1}. {q.q}
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
                          <span>{o}</span>
                          {reveal && isCorrect && <Check className="size-4" />}
                          {reveal && isPicked && !isCorrect && <X className="size-4" />}
                        </button>
                      );
                    })}
                  </div>
                  {reveal && q.explain && (
                    <p className="mt-3 rounded-lg bg-primary/5 p-3 text-xs text-primary">
                      💡 {q.explain}
                    </p>
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
            title="听力填空 Listening"
            subtitle="点击播放音频，根据听到的内容填空"
          />
          <button
            onClick={() => speak(content.listening.audio)}
            className="mb-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-grad-title py-4 font-semibold text-white shadow-tile"
          >
            <Volume2 className="size-5" /> 播放音频
          </button>
          <div className="space-y-3">
            {content.listening.blanks.map((b, i) => {
              const v = listenInputs[i] ?? "";
              const correct = v.trim().toLowerCase() === b.answer.toLowerCase();
              return (
                <div
                  key={i}
                  className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-secondary/30 p-4 text-base"
                >
                  <span>{b.before}</span>
                  <input
                    value={v}
                    onChange={(e) => setListenInputs({ ...listenInputs, [i]: e.target.value })}
                    className={`min-w-28 rounded-md border-b-2 bg-transparent px-2 py-1 text-center font-bold outline-none ${
                      v
                        ? correct
                          ? "border-emerald-400 text-emerald-600"
                          : "border-rose-400 text-rose-600"
                        : "border-muted-foreground/40"
                    }`}
                    placeholder="输入"
                  />
                  <span>{b.after}</span>
                  {v && correct && <Check className="size-4 text-emerald-500" />}
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
            title="实战产出 Output"
            subtitle="把所学应用到真实表达"
          />
          <div className="rounded-2xl border border-border bg-secondary/30 p-5">
            <p className="font-semibold">{content.output.prompt}</p>
            <p className="mt-1 text-sm text-muted-foreground">{content.output.cn}</p>
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
              <Sparkles className="mr-1 inline size-4" /> 查看范文
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-foreground/85">
              {content.output.sample}
            </p>
          </details>
          <button
            onClick={() => speak(content.output.sample)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-grad-title py-3 font-semibold text-white shadow-tile"
          >
            <Volume2 className="size-5" /> 朗读范文
          </button>

          {/* Finish & AI check */}
          <button
            onClick={checkWriting}
            disabled={checking}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-emerald-500 bg-emerald-500/10 py-3 font-semibold text-emerald-700 transition hover:bg-emerald-500/20 disabled:opacity-60"
          >
            {checking ? (
              <>
                <Sparkles className="size-5 animate-pulse" /> AI 正在批改…
              </>
            ) : (
              <>
                <CheckCircle2 className="size-5" /> 完成 · AI 检查并讲解
              </>
            )}
          </button>

          {feedback && (
            <div className="mt-5 space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-bold text-emerald-700">📝 AI 写作点评</h4>
                <span className="rounded-full bg-emerald-600 px-3 py-1 text-sm font-bold text-white">
                  {feedback.score} 分
                </span>
              </div>
              <p className="text-sm leading-relaxed text-foreground/85">{feedback.overall}</p>

              {feedback.mistakes.length > 0 ? (
                <div>
                  <div className="mb-2 text-sm font-semibold text-rose-600">🔍 需要修改的地方</div>
                  <ul className="space-y-3">
                    {feedback.mistakes.map((m, i) => (
                      <li key={i} className="rounded-xl border border-rose-200 bg-white p-3 text-sm">
                        <div className="text-rose-600 line-through">{m.original}</div>
                        <div className="mt-1 font-semibold text-emerald-600">✓ {m.corrected}</div>
                        <div className="mt-2 text-foreground/75">{m.explanation}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="rounded-xl bg-white p-3 text-sm text-emerald-700">
                  🎉 没有发现明显错误，写得很棒！
                </div>
              )}

              {feedback.suggestions.length > 0 && (
                <div>
                  <div className="mb-2 text-sm font-semibold text-primary">💡 改进建议</div>
                  <ul className="list-disc space-y-1 pl-5 text-sm text-foreground/80">
                    {feedback.suggestions.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {feedback.improved && (
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-sm font-semibold text-primary">✨ 润色后版本</div>
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
          ← 上一步
        </button>
        <span className="text-sm text-muted-foreground">
          {activeStep} / {LESSON_STEPS.length}
        </span>
        <button
          onClick={() => goToStep(Math.min(LESSON_STEPS.length, activeStep + 1))}
          disabled={activeStep === LESSON_STEPS.length}
          className="rounded-full bg-grad-title px-5 py-2 text-sm font-semibold text-white shadow-tile disabled:opacity-40"
        >
          下一步 →
        </button>
      </div>

      {/* Mastery toggle */}
      <div className="mt-6 rounded-3xl border border-border bg-card p-5 shadow-card md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-base font-bold">
              <CheckCircle2 className={`size-5 ${mastered ? "text-emerald-500" : "text-muted-foreground"}`} />
              {mastered ? "你已掌握本课" : "感觉已经掌握了？"}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {mastered
                ? "下次打开 App，我们会建议你继续学习下一课。"
                : "标记为「已掌握」后，下次打开 App 会提醒你继续下一课。"}
            </p>
          </div>
          <button
            onClick={toggleMastered}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
              mastered
                ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/15"
                : "bg-grad-title text-white shadow-tile hover:opacity-95"
            }`}
          >
            {mastered ? "✓ 已掌握 · 点击取消" : "🎯 标记为已掌握"}
          </button>
        </div>
      </div>
    </main>
  );
};

export default Lesson;