import { T } from "@/i18n/T";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, Loader2, Sparkles, Trophy, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { celebrateScore } from "@/lib/feedback";
import { useRegisterAssistant } from "@/contexts/AIAssistantContext";
import { recordUnifiedAttempt } from "@/lib/unifiedMastery";
import {
  generateJuniorAssessment,
  loadStageTestMeta,
  stageGradeToDb,
  type JuniorAssessmentQuestion,
  type JuniorModule,
} from "@/lib/juniorStageAssessment";
import { MistakeLoop } from "@/components/assessment/MistakeLoop";
import { cn } from "@/lib/utils";

const MODULE_LABEL: Record<string, string> = {
  grammar: "语法",
  reading: "阅读",
  listening: "听力",
  writing: "写作",
};

export default function JuniorStageAssessmentPlay() {
  const { grade = "1", testId = "" } = useParams();
  const nav = useNavigate();
  const gNum = Number(grade);

  const [meta, setMeta] = useState<{
    title: string;
    total: number;
    threshold: number;
    module: JuniorModule;
    scope: string;
  } | null>(null);
  const [questions, setQuestions] = useState<JuniorAssessmentQuestion[]>([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [results, setResults] = useState<{ id: string; correct: boolean }[]>([]);
  const [wrongQueue, setWrongQueue] = useState<JuniorAssessmentQuestion[]>([]);
  const [remediationIdx, setRemediationIdx] = useState(0);
  const [phase, setPhase] = useState<"test" | "remediate" | "done">("test");
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{
    passed: boolean;
    coins_awarded: number;
    exp_awarded: number;
  } | null>(null);
  const [finalCorrect, setFinalCorrect] = useState(0);
  const [loading, setLoading] = useState(true);
  const [genError, setGenError] = useState<string | null>(null);

  useRegisterAssistant(
    meta && testId
      ? {
          context: "stage_test",
          ref: testId,
          topic: `阶段测验 · ${meta.title}`,
          mode: "full-test",
          unlocked: submitted,
          lockedHint: "请先把整套测验做完并提交，我再来帮你分析 ✨",
          pageTitle: "💬 小月 · 测验复盘",
        }
      : null,
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const t = await loadStageTestMeta(testId);
        if (!t) {
          toast.error("测试不存在");
          nav(-1);
          return;
        }
        const mod = (t.module ?? "grammar") as JuniorModule;
        if (!cancelled) {
          setMeta({
            title: t.title,
            total: t.total_questions,
            threshold: t.pass_threshold,
            module: mod,
            scope: t.scope ?? "module",
          });
        }
        const qs = await generateJuniorAssessment({
          grade: gNum,
          module: mod,
          questionCount: t.total_questions,
          scope: t.scope ?? "module",
        });
        if (!cancelled) {
          setQuestions(qs);
          setLoading(false);
        }
      } catch (e: unknown) {
        if (!cancelled) {
          setGenError(e instanceof Error ? e.message : "出题失败");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [testId, gNum, nav]);

  const q = questions[idx];
  const moduleLabel = meta ? (MODULE_LABEL[meta.module] ?? meta.module) : "";
  const progress =
    phase === "test" && questions.length
      ? ((idx + (picked ? 1 : 0)) / questions.length) * 100
      : 0;

  const wrongs = useMemo(
    () =>
      results
        .filter((r) => !r.correct)
        .map((r) => questions.find((qq) => qq.id === r.id))
        .filter(Boolean) as JuniorAssessmentQuestion[],
    [results, questions],
  );

  function pick(letter: string) {
    if (!q || picked) return;
    setPicked(letter);
    const isRight = letter === q.correct;
    const newCorrect = correctCount + (isRight ? 1 : 0);
    if (isRight) setCorrectCount(newCorrect);
    const nextResults = [...results, { id: q.id, correct: isRight }];
    setResults(nextResults);
    setTimeout(() => {
      if (idx + 1 < questions.length) {
        setIdx(idx + 1);
        setPicked(null);
      } else {
        finishTest(newCorrect, nextResults);
      }
    }, 900);
  }

  function finishTest(finalC: number, allResults: { id: string; correct: boolean }[]) {
    const wrongItems = allResults
      .filter((r) => !r.correct)
      .map((r) => questions.find((qq) => qq.id === r.id))
      .filter(Boolean) as JuniorAssessmentQuestion[];
    if (wrongItems.length > 0) {
      setWrongQueue(wrongItems);
      setRemediationIdx(0);
      setPhase("remediate");
      return;
    }
    void submitFinal(finalC, allResults);
  }

  async function submitFinal(finalC: number, allResults: { id: string; correct: boolean }[]) {
    setSubmitted(true);
    setFinalCorrect(finalC);
    setPhase("done");
    syncProgress(allResults).catch(() => {});
    const { data, error } = await supabase.rpc("submit_stage_test", {
      _test_id: testId,
      _correct: finalC,
      _total: questions.length,
      _new_question_count: questions.length,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    const row = Array.isArray(data) ? data[0] : data;
    setResult(row);
    const pct = questions.length > 0 ? Math.round((finalC / questions.length) * 100) : 0;
    celebrateScore(pct);
  }

  async function syncProgress(allResults: { id: string; correct: boolean }[]) {
    const dbGrade = stageGradeToDb(gNum);
    await Promise.all(
      allResults.map((r) =>
        recordUnifiedAttempt({
          stage: "junior",
          grade: dbGrade,
          module: meta?.module ?? "grammar",
          item_type: "assessment_q",
          item_id: r.id,
          is_correct: r.correct,
          context: { source: "junior_stage_assessment", test_id: testId },
        }).catch(() => {}),
      ),
    );
  }

  function onRemediationMastered() {
    const next = remediationIdx + 1;
    if (next < wrongQueue.length) {
      setRemediationIdx(next);
    } else {
      void submitFinal(correctCount, results);
    }
  }

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center gap-3 text-sm text-muted-foreground">
        <Loader2 className="size-8 animate-spin text-violet-500" />
        <Sparkles className="size-5 text-amber-500" />
        <T>AI 正在根据你的学习记录出题…</T>
      </main>
    );
  }

  if (genError || !meta || questions.length === 0) {
    return (
      <main className="mx-auto max-w-xl px-5 py-10 text-center">
        <p className="text-sm text-muted-foreground">{genError || "暂无题目"}</p>
        <button type="button" onClick={() => nav(-1)} className="mt-4 text-sm font-bold text-primary">
          <T>返回</T>
        </button>
      </main>
    );
  }

  if (phase === "remediate" && wrongQueue[remediationIdx]) {
    return (
      <main className="mx-auto min-h-screen max-w-xl px-5 py-6">
        <button
          type="button"
          onClick={() => nav(-1)}
          className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground"
        >
          <ArrowLeft className="size-4" /> <T>退出</T>
        </button>
        <h1 className="text-lg font-extrabold mb-1">
          <T>错题特训</T> ({remediationIdx + 1}/{wrongQueue.length})
        </h1>
        <p className="text-xs text-muted-foreground mb-4">
          <T>先弄懂错题，再提交成绩 · 中考风格巩固</T>
        </p>
        <MistakeLoop
          wrong={wrongQueue[remediationIdx]}
          moduleLabel={moduleLabel}
          onMastered={onRemediationMastered}
          onSkip={onRemediationMastered}
        />
      </main>
    );
  }

  if (submitted && result) {
    const pct = Math.round((finalCorrect / questions.length) * 100);
    const gradCls = result.passed
      ? "from-emerald-400 to-teal-500"
      : "from-slate-400 to-slate-500";
    return (
      <main className="mx-auto min-h-screen max-w-xl px-5 py-10">
        {/* eslint-disable-next-line react/forbid-dom-props */}
        <section className={`rounded-3xl bg-gradient-to-br p-8 text-center text-white shadow-tile ${gradCls}`}>
          {result.passed ? <Trophy className="mx-auto size-16" /> : <Sparkles className="mx-auto size-16" />}
          <p className="mt-3 text-3xl font-extrabold">{result.passed ? "通关！" : "再接再厉"}</p>
          <p className="mt-2 text-5xl font-black">{pct}%</p>
          <p className="mt-1 text-sm opacity-90">
            {finalCorrect} / {questions.length} <T>正确</T>
          </p>
          {wrongs.length > 0 && (
            <p className="mt-3 text-xs opacity-90">
              <T>已完成</T> {wrongQueue.length} <T>个错题特训</T>
            </p>
          )}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/20 p-3">
              <p className="text-[10px] uppercase opacity-80"><T>金币</T></p>
              <p className="text-2xl font-extrabold">+{result.coins_awarded}</p>
            </div>
            <div className="rounded-2xl bg-white/20 p-3">
              <p className="text-[10px] uppercase opacity-80"><T>宠物经验</T></p>
              <p className="text-2xl font-extrabold">+{result.exp_awarded}</p>
            </div>
          </div>
        </section>
        <button
          type="button"
          onClick={() => nav(`/stage-tests/junior/${grade}`)}
          className="mt-5 w-full rounded-2xl bg-foreground py-3 font-extrabold text-background"
        >
          <T>返回测试列表</T>
        </button>
      </main>
    );
  }

  if (!q) return null;

  const opts = q.options
    ? (["A", "B", "C", "D"] as const).map((k) => ({ k, text: q.options![k] }))
    : [];

  return (
    <main className="mx-auto min-h-screen max-w-xl px-5 py-6">
      <button
        type="button"
        onClick={() => nav(-1)}
        className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground"
      >
        <ArrowLeft className="size-4" /> <T>退出</T>
      </button>
      <header className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Sparkles className="size-3 text-violet-500" />
          {meta.title}
        </span>
        <span>
          {idx + 1} / {questions.length}
        </span>
      </header>
      <div className="mb-6 h-2 overflow-hidden rounded-full bg-muted" role="progressbar">
        <div
          className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      {q.passage && (
        <article className="mb-4 rounded-2xl border bg-muted/40 p-4 text-sm leading-relaxed max-h-48 overflow-y-auto">
          {q.passage}
        </article>
      )}

      <section className="rounded-3xl bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-violet-950/40 dark:to-fuchsia-950/40 p-6 shadow-tile">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {moduleLabel} · <T>中考风格</T>
        </p>
        <p className="mt-2 text-base font-extrabold leading-snug">{q.stem}</p>
      </section>

      <ul className="mt-6 space-y-3 list-none p-0">
        {opts.map(({ k, text }) => {
          const isAnswer = k === q.correct;
          const isPicked = picked === k;
          return (
            <li key={k}>
              <button
                type="button"
                onClick={() => pick(k)}
                disabled={!!picked}
                className={cn(
                  "flex w-full items-center justify-between rounded-2xl border-2 p-4 text-left text-sm font-semibold transition",
                  !picked && "border-border bg-card hover:border-violet-400",
                  picked && isAnswer && "border-emerald-500 bg-emerald-50",
                  picked && isPicked && !isAnswer && "border-rose-500 bg-rose-50",
                  picked && !isPicked && !isAnswer && "opacity-50",
                )}
              >
                <span>
                  <span className="font-black text-violet-600 mr-2">{k}.</span>
                  {text}
                </span>
                {picked && isAnswer && <Check className="size-5 text-emerald-600" />}
                {picked && isPicked && !isAnswer && <X className="size-5 text-rose-600" />}
              </button>
            </li>
          );
        })}
      </ul>

      {picked && q.explanation && (
        <p className="mt-4 text-sm text-muted-foreground rounded-xl bg-muted/50 p-3">{q.explanation}</p>
      )}
    </main>
  );
}
