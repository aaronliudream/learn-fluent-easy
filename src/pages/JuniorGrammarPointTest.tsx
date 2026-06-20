import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import BackLink from "@/components/BackLink";
import { ArrowLeft, RotateCw, Loader2, Trophy } from "lucide-react";
import { GrammarQuestionCard, type AnswerResult } from "@/components/grammar/GrammarQuestionCard";
import type { GrammarQuestion } from "@/components/grammar/GrammarQuestionCard";
import { loadPoint, loadPointQuestions, type GPointMeta } from "@/lib/juniorGrammarUnits";
import {
  recordGrammarQuestionMastery,
  loadGrammarQuestionMastery,
  computeGrammarProgress,
  gpct,
  type GrammarProgress,
} from "@/lib/juniorGrammarQuestionMastery";
import { recordJuniorGrammarAttempt, type JuniorGrammarErrorReason } from "@/lib/juniorGrammarFsrs";
import { recordSkillAttemptsForQuestion } from "@/lib/recordSkillAttempts";
import { awardForCorrect, notifyWrong } from "@/lib/coins";
import { fireEmojiConfetti } from "@/lib/feedback";
import { T } from "@/i18n/T";

function shuffle<T>(arr: T[]): T[] {
  const r = [...arr];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

/** 语法页 L3:单个语法点测试。做该点全部题;每题答对/错写 per-question 掌握度(累计 2 次=掌握)。 */
export default function JuniorGrammarPointTest() {
  const { pointId } = useParams<{ pointId: string }>();
  const [point, setPoint] = useState<GPointMeta | null>(null);
  const [questions, setQuestions] = useState<GrammarQuestion[] | null>(null);
  const [idx, setIdx] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [done, setDone] = useState(false);
  const [prog, setProg] = useState<GrammarProgress | null>(null);

  const load = useCallback(async () => {
    if (!pointId) return;
    const [p, qs] = await Promise.all([loadPoint(pointId), loadPointQuestions(pointId)]);
    setPoint(p);
    setQuestions(shuffle(qs));
    setIdx(0);
    setAnswered(false);
    setDone(false);
    setProg(null);
  }, [pointId]);

  useEffect(() => {
    void load();
  }, [load]);

  const activeQ = questions && idx < questions.length ? questions[idx] : null;

  const handleAnswered = (res: AnswerResult) => {
    if (answered || !activeQ) return;
    setAnswered(true);
    const isOk = res.kind === "correct" || res.kind === "acceptable";
    // 主口径:per-question 掌握度
    void recordGrammarQuestionMastery(activeQ.id, isOk);
    // 同步保留:per-point FSRS(供错题复习/第9关等)+ 技能映射(若该题挂了)
    if (pointId) {
      void recordJuniorGrammarAttempt({
        pointId,
        questionType: activeQ.question_type || "mcq",
        isCorrect: isOk,
        latencyMs: res.latencyMs,
        questionId: activeQ.id,
        errorReason: res.kind === "wrong" ? (res.errorReason as JuniorGrammarErrorReason | undefined) : undefined,
      });
    }
    void recordSkillAttemptsForQuestion(activeQ.id, isOk);
    if (isOk) awardForCorrect(0, "junior_grammar", activeQ.id, "junior_grammar", res.latencyMs);
    else notifyWrong();
  };

  const handleNext = async () => {
    if (!questions) return;
    const isLast = idx >= questions.length - 1;
    if (!isLast) {
      setIdx((i) => i + 1);
      setAnswered(false);
      return;
    }
    // 结算:重新读该点掌握度
    const ids = questions.map((q) => q.id);
    const m = await loadGrammarQuestionMastery(ids);
    const pr = computeGrammarProgress(ids, m);
    setProg(pr);
    setDone(true);
    if (pr.mastered === pr.total && pr.total > 0) fireEmojiConfetti({ vibrate: true, count: 60 });
  };

  if (questions === null) {
    return (
      <main className="mx-auto min-h-screen max-w-3xl px-5 py-8">
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="mr-2 size-5 animate-spin" /> <T>加载中…</T>
        </div>
      </main>
    );
  }

  const backTo = point ? `/junior/grammar/unit/${point.volume}/${point.unit}` : "/junior/grammar";

  if (questions.length === 0) {
    return (
      <main className="mx-auto min-h-screen max-w-3xl px-5 py-8">
        <BackLink to={backTo} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> <T>返回</T>
        </BackLink>
        <p className="text-sm text-muted-foreground"><T>本语法点暂无题目</T></p>
      </main>
    );
  }

  if (done && prog) {
    const allMastered = prog.total > 0 && prog.mastered === prog.total;
    return (
      <main className="mx-auto min-h-screen max-w-2xl px-5 py-10">
        <div className="rounded-3xl border bg-card p-8 text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-emerald-400 text-3xl">
            {allMastered ? "👑" : "💪"}
          </div>
          <h1 className="mt-3 text-xl font-extrabold">{point?.title}</h1>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-bold text-primary">
            <Trophy className="size-4" /> 完成度 {gpct(prog.done, prog.total)}% · 掌握度 {gpct(prog.mastered, prog.total)}%
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            掌握 {prog.mastered}/{prog.total} 题（每题累计答对 2 次即掌握）
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <BackLink to={backTo} className="rounded-full border border-border px-5 py-2 text-sm font-bold"><T>返回单元</T></BackLink>
            <button onClick={load} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground">
              <RotateCw className="size-4" /> <T>再做一遍</T>
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-6 space-y-4">
      <BackLink to={backTo} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> <T>返回单元</T>
      </BackLink>

      <header className="rounded-2xl border bg-card p-4">
        <h1 className="text-lg font-extrabold">{point?.title ?? "语法点"}</h1>
        <p className="mt-1 text-xs text-muted-foreground">第 {Math.min(idx + 1, questions.length)} / {questions.length} 题</p>
      </header>

      {activeQ && (
        <div className="space-y-3">
          <GrammarQuestionCard key={activeQ.id} question={activeQ} index={idx} onAnswered={handleAnswered} />
          {answered && (
            <div className="flex items-center justify-end pt-1">
              <button
                onClick={handleNext}
                className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 px-4 py-2 text-sm font-bold text-white"
              >
                {idx >= questions.length - 1 ? "查看结果 →" : "下一题 →"}
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
