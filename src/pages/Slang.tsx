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
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { IDIOMS, type Idiom } from "@/data/idioms";
import { speak } from "@/lib/speak";
import { toast } from "sonner";
import {
  isMasteredSlang,
  recordSlangResult,
  sortByMastery,
} from "@/lib/slangMastery";

type Mode = "browse" | "quiz";
// quiz direction: en2cn = show English idiom, choose Chinese meaning;
// cn2en = show Chinese meaning, choose English idiom;
// fill  = show example with blank, choose missing idiom.
type QuizKind = "en2cn" | "cn2en" | "fill";

type QuizQuestion = {
  id: number;
  kind: QuizKind;
  prompt: string;       // main question text
  context?: string;     // example sentence (CN translation when shown)
  options: string[];
  answer: number;       // index into options
  idiom: Idiom;         // the right idiom (for review card)
};

const PER_PAGE = 12;
const QUIZ_LEN = 10;
// After the user has browsed this many pages, prompt them to test what they reviewed.
const PAGES_BEFORE_QUIZ = 2;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildQuiz(pool: Idiom[] = IDIOMS, len = QUIZ_LEN): QuizQuestion[] {
  const sourceForDistractors = IDIOMS;
  const picked = shuffle(pool).slice(0, Math.min(len, pool.length));
  const kinds: QuizKind[] = ["en2cn", "cn2en", "fill"];
  return picked.map((idiom, i) => {
    const kind = kinds[i % kinds.length];
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
    // fill
    const blanked = idiom.example.replace(
      new RegExp(idiom.phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
      "_____",
    );
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
  });
}

const Slang = () => {
  const [mode, setMode] = useState<Mode>("browse");
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  // Bumped whenever mastery changes so the browse list re-sorts.
  const [masteryVersion, setMasteryVersion] = useState(0);
  // Idioms the user has seen since the last quiz prompt.
  const reviewedIdsRef = useRef<Set<number>>(new Set());
  const [pagesBrowsed, setPagesBrowsed] = useState(0);
  const promptedRef = useRef(false);

  const filtered = useMemo(() => {
    const base = sortByMastery(IDIOMS);
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
  }, [search, masteryVersion]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages - 1);
  const pageItems = filtered.slice(safePage * PER_PAGE, safePage * PER_PAGE + PER_PAGE);

  // Track reviewed idioms + offer a quiz once the user has browsed enough pages.
  useEffect(() => {
    if (mode !== "browse") return;
    pageItems.forEach((it) => reviewedIdsRef.current.add(it.id));
    setPagesBrowsed((n) => n + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safePage, mode]);

  useEffect(() => {
    if (mode !== "browse") return;
    if (promptedRef.current) return;
    if (pagesBrowsed < PAGES_BEFORE_QUIZ) return;
    if (reviewedIdsRef.current.size < 4) return; // need enough material
    promptedRef.current = true;
    toast("📝 想测一下刚才学过的俚语吗？", {
      description: `已浏览 ${reviewedIdsRef.current.size} 条 — 立刻小测，答对的会"沉底"，未掌握的优先复习。`,
      duration: 12000,
      action: {
        label: "开始小测",
        onClick: () => startReviewQuiz(),
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagesBrowsed, mode]);

  // Quiz state
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [qIdx, setQIdx] = useState(0);
  const [picks, setPicks] = useState<Record<number, number>>({});
  const [revealed, setRevealed] = useState(false);
  // Tracks which question ids we've already counted toward mastery to avoid double-counting.
  const recordedRef = useRef<Set<number>>(new Set());

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
    setQuestions(buildQuiz());
    setQIdx(0);
    setPicks({});
    setRevealed(false);
    recordedRef.current = new Set();
    setMode("quiz");
    window.scrollTo({ top: 0 });
  };

  const restartQuiz = () => {
    setQuestions(buildQuiz());
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
    window.scrollTo({ top: 0 });
  };

  // When an answer is revealed, record mastery once per question.
  useEffect(() => {
    if (!revealed) return;
    const q = questions[qIdx];
    if (!q) return;
    if (recordedRef.current.has(q.id)) return;
    recordedRef.current.add(q.id);
    const correct = picks[q.id] === q.answer;
    recordSlangResult(q.idiom.id, correct);
    setMasteryVersion((v) => v + 1);
  }, [revealed, qIdx, questions, picks]);

  // When returning to browse mode after a quiz, reset the review counter so the
  // user gets another prompt after browsing two more fresh pages.
  useEffect(() => {
    if (mode === "browse") {
      // Don't reset reviewed set on every browse mount — only when leaving quiz.
      return;
    }
    // entering quiz: clear reviewed so next browse session is fresh
    reviewedIdsRef.current = new Set();
    setPagesBrowsed(0);
    promptedRef.current = false;
  }, [mode]);

  const correctCount = questions.filter((q) => picks[q.id] === q.answer).length;

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-10 md:px-8 md:py-14">
      <PageHeader
        title="美国流行俚语"
        subtitle="346 条地道 idioms · 中英文混合测试"
        back="/"
      />

      {/* Mode toggle */}
      <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl bg-secondary p-1.5">
        <button
          onClick={() => setMode("browse")}
          className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
            mode === "browse" ? "bg-card shadow-card text-foreground" : "text-muted-foreground"
          }`}
        >
          <BookOpen className="size-4" /> 学习浏览
        </button>
        <button
          onClick={() => (mode === "quiz" ? restartQuiz() : startQuiz())}
          className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
            mode === "quiz" ? "bg-card shadow-card text-foreground" : "text-muted-foreground"
          }`}
        >
          <Target className="size-4" /> 开始测试
        </button>
      </div>

      {/* ───────────── BROWSE MODE ───────────── */}
      {mode === "browse" && (
        <>
          <div className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl bg-card p-4 shadow-card">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-cyan-500/15 text-cyan-500">
              <Sparkles className="size-5" />
            </div>
            <div className="flex-1 min-w-[180px]">
              <div className="font-bold">{IDIOMS.length} 条美式俚语</div>
              <div className="text-xs text-muted-foreground">
                来自社交媒体、Z世代、变装文化、TikTok 等真实语料
              </div>
            </div>
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              placeholder="搜索 idiom 或中文..."
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-3">
            {pageItems.map((it) => (
              <article
                key={it.id}
                className="rounded-2xl bg-card p-5 shadow-card transition hover:-translate-y-0.5"
              >
                <div className="flex items-start gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-grad-title text-white">
                    <Zap className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-extrabold">{it.phrase}</h3>
                      <button
                        onClick={() => speak(it.phrase)}
                        className="grid size-7 place-items-center rounded-full bg-secondary text-muted-foreground transition hover:text-primary"
                        aria-label="朗读"
                      >
                        <Volume2 className="size-3.5" />
                      </button>
                    </div>
                    <div className="mt-0.5 text-sm font-semibold text-primary">
                      {it.meaning_cn}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">{it.meaning_en}</div>

                    <div className="mt-3 rounded-xl border border-border bg-secondary/30 p-3 text-sm">
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 text-[10px] font-bold text-muted-foreground">EN</span>
                        <span className="flex-1">{it.example}</span>
                        <button
                          onClick={() => speak(it.example)}
                          className="grid size-6 shrink-0 place-items-center rounded-full text-muted-foreground transition hover:text-primary"
                          aria-label="朗读例句"
                        >
                          <Volume2 className="size-3" />
                        </button>
                      </div>
                      <div className="mt-1.5 flex items-start gap-2">
                        <span className="mt-0.5 text-[10px] font-bold text-muted-foreground">CN</span>
                        <span className="flex-1 text-muted-foreground">{it.example_cn}</span>
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
              ← 上一页
            </Button>
            <span className="text-sm text-muted-foreground">
              第 {safePage + 1} / {totalPages} 页 · 共 {filtered.length} 条
            </span>
            <Button
              disabled={safePage >= totalPages - 1}
              onClick={() => setPage(safePage + 1)}
            >
              下一页 →
            </Button>
          </div>

          <div className="mt-6 rounded-2xl border border-primary/30 bg-primary/5 p-5 text-center">
            <div className="text-sm font-semibold">想检验记住了多少？</div>
            <Button className="mt-3" onClick={startQuiz}>
              <Target className="mr-2 size-4" /> 开始测试 (10 题)
            </Button>
          </div>
        </>
      )}

      {/* ───────────── QUIZ MODE ───────────── */}
      {mode === "quiz" && questions.length > 0 && qIdx < questions.length && (() => {
        const q = questions[qIdx];
        const picked = picks[q.id];
        const isCorrect = picked === q.answer;
        const KIND_LABEL: Record<QuizKind, string> = {
          en2cn: "英 → 中：选出正确含义",
          cn2en: "中 → 英：选出对应俚语",
          fill: "填空：选出适合的俚语",
        };
        return (
          <>
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground">
                第 {qIdx + 1} / {questions.length} 题
              </div>
              <div className="text-xs font-semibold text-muted-foreground">{KIND_LABEL[q.kind]}</div>
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
                    <h3 className="text-2xl font-extrabold">{q.prompt}</h3>
                    <button
                      onClick={() => speak(q.prompt)}
                      className="grid size-8 place-items-center rounded-full bg-secondary text-muted-foreground transition hover:text-primary"
                    >
                      <Volume2 className="size-4" />
                    </button>
                  </div>
                )}
                {q.kind === "cn2en" && (
                  <h3 className="text-2xl font-extrabold">{q.prompt}</h3>
                )}
                {q.kind === "fill" && (
                  <div>
                    <p className="text-base font-semibold leading-relaxed">{q.prompt}</p>
                    {q.context && (
                      <p className="mt-1.5 text-xs text-muted-foreground">{q.context}</p>
                    )}
                  </div>
                )}

                {q.kind === "en2cn" && q.context && (
                  <p className="mt-2 text-sm italic text-muted-foreground">"{q.context}"</p>
                )}
                {q.kind === "cn2en" && q.context && (
                  <p className="mt-2 text-sm text-muted-foreground">{q.context}</p>
                )}
              </div>

              <div className="grid gap-2 md:grid-cols-2">
                {q.options.map((opt, oi) => {
                  const active = picked === oi;
                  const correctOpt = revealed && oi === q.answer;
                  const wrongOpt = revealed && active && oi !== q.answer;
                  return (
                    <button
                      key={oi}
                      disabled={revealed}
                      onClick={() => setPicks({ ...picks, [q.id]: oi })}
                      className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition ${
                        correctOpt
                          ? "border-emerald-500 bg-emerald-500/10 text-foreground"
                          : wrongOpt
                            ? "border-rose-500 bg-rose-500/10 text-foreground"
                            : active
                              ? "border-primary bg-primary/10 text-foreground"
                              : "border-border bg-card hover:border-primary/40"
                      }`}
                    >
                      <span>{opt}</span>
                      {correctOpt && <CheckCircle2 className="size-4 text-emerald-500" />}
                      {wrongOpt && <XCircle className="size-4 text-rose-500" />}
                      {!revealed && active && <CheckCircle2 className="size-4 text-primary" />}
                    </button>
                  );
                })}
              </div>

              {/* Reveal explanation */}
              {revealed && (
                <div className={`mt-5 rounded-2xl p-4 text-sm ${isCorrect ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-rose-500/10 text-rose-700 dark:text-rose-300"}`}>
                  <div className="font-bold">
                    {isCorrect ? "✅ 答对了！" : "❌ 答错了"}
                  </div>
                  <div className="mt-2 space-y-1 text-foreground/90">
                    <div>
                      <strong>{q.idiom.phrase}</strong> — {q.idiom.meaning_cn}
                    </div>
                    <div className="text-xs italic">"{q.idiom.example}"</div>
                    <div className="text-xs text-muted-foreground">{q.idiom.example_cn}</div>
                  </div>
                </div>
              )}
            </section>

            <div className="mt-6 flex items-center justify-between gap-3">
              <Button variant="outline" onClick={() => setMode("browse")}>
                返回浏览
              </Button>
              {!revealed ? (
                <Button
                  disabled={picked === undefined}
                  onClick={() => setRevealed(true)}
                >
                  确认答案
                </Button>
              ) : qIdx < questions.length - 1 ? (
                <Button onClick={() => { setQIdx(qIdx + 1); setRevealed(false); }}>
                  下一题 <ChevronRight className="ml-1 size-4" />
                </Button>
              ) : (
                <Button onClick={() => setQIdx(qIdx + 1)} className="bg-emerald-600 hover:bg-emerald-600/90">
                  查看成绩
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
          <div className="text-sm text-muted-foreground">本轮测试完成</div>
          <div className="mt-1 text-5xl font-black">
            {correctCount} <span className="text-2xl text-muted-foreground">/ {questions.length}</span>
          </div>
          <div className="mt-2 text-base font-semibold">
            正确率 {Math.round((correctCount / questions.length) * 100)}%
          </div>

          <div className="mt-6 grid gap-2">
            {questions.map((q) => {
              const ok = picks[q.id] === q.answer;
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
                  <span className="truncate text-xs text-muted-foreground">{q.idiom.meaning_cn}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setMode("browse")}>
              返回浏览
            </Button>
            <Button className="flex-1" onClick={restartQuiz}>
              <RefreshCw className="mr-2 size-4" /> 再来一轮
            </Button>
          </div>
        </section>
      )}
    </main>
  );
};

export default Slang;
