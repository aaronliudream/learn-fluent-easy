import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import BackLink from "@/components/BackLink";
import { ArrowLeft, RotateCw, Trophy } from "lucide-react";
import {
  GrammarQuestionCard,
  type AnswerResult,
} from "@/components/grammar/GrammarQuestionCard";
import {
  recordJuniorGrammarAttempt,
  type JuniorGrammarErrorReason,
} from "@/lib/juniorGrammarFsrs";
import {
  resolveUnitPoints,
  loadUnitPool,
  pickQuestions,
  type UnitPoint,
  type UnitQuestion,
} from "@/lib/juniorUnitGrammar";
import { loadProgressForCodes } from "@/lib/juniorGrammarUnits";
import { readPublisherParam } from "@/lib/gaokaoHub/publisher";
import { findUnit } from "@/lib/juniorHub/courseData";
import { recordSkillAttemptsForQuestion } from "@/lib/recordSkillAttempts";
import { recordGrammarQuestionMastery } from "@/lib/juniorGrammarQuestionMastery";
import { recordSeniorGrammarMistake } from "@/lib/seniorGrammarMistake";
import { awardForCorrect, notifyWrong } from "@/lib/coins";
import { fireEmojiConfetti } from "@/lib/feedback";
import { T } from "@/i18n/T";
import UnitGrammarGroupWalk from "@/components/grammar/UnitGrammarGroupWalk";

/* ──────────────────────────────────────────────────────────────────────────
   高中专区·单元语法综合测试 —— JuniorUnitGrammarTest 的「高中壳」孪生(换壳不换芯)。
   逻辑与库 100% 复用 junior 那套(resolveUnitPoints/loadUnitPool/pickQuestions +
   recordGrammarQuestionMastery 题级 junior_user_mastery),掌握度与课本同步路径**同表同口径**,
   两条路径自动互通。唯一差异:backTo 用 ?returnTo(回 /gaokao/hub,全程不掉初中),
   而非 JuniorUnitGrammarTest 里硬编码的 /junior/hub。
   ⚠️ 之所以另起一份而非改 JuniorUnitGrammarTest:后者是禁碰文件(有未提交改动),
      且其 backTo 硬编码 /junior。见 docs/高中专区架构方案.md §①。
   ────────────────────────────────────────────────────────────────────────── */

type Result = {
  perPoint: { id: string; title: string; correct: number; total: number }[];
  mastered: number;
  total: number;
  done: number;
};

export default function GaokaoUnitGrammarTest() {
  const { grade, unitId } = useParams<{ grade: string; unitId: string }>();
  const [sp] = useSearchParams();
  const returnTo = sp.get("returnTo");
  const pub = readPublisherParam(sp); // 高中:默认 pep,?publisher= 可覆盖
  const unit = unitId ? findUnit(unitId) : null;

  const [points, setPoints] = useState<UnitPoint[]>([]);
  const [pool, setPool] = useState<UnitQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  const [idx, setIdx] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    const codes = unit?.grammarCodes ?? [];
    if (!codes.length) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const pts = await resolveUnitPoints(codes, pub);
      const merged = await loadUnitPool(pts);
      const picked = pickQuestions(merged, pts, 8);
      if (cancelled) return;
      setPoints(pts);
      setPool(picked);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [unit?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeQ = idx < pool.length ? pool[idx] : null;

  const handleAnswered = (res: AnswerResult) => {
    if (answered || !activeQ) return;
    setAnswered(true);
    const isOk = res.kind === "correct" || res.kind === "acceptable";
    setAnswers((prev) => ({ ...prev, [idx]: isOk }));

    void recordSkillAttemptsForQuestion(activeQ.id, isOk);
    // 方案B:按题掌握度(累计答对2次=掌握),与课本同步路径/语法板块同表 junior_user_mastery
    void recordGrammarQuestionMastery(activeQ.id, isOk);
    // 错题写入(错→存全选项快照;对→按 source_key 自动移出)。纯新增,失败只 warn,不阻断做题。
    void recordSeniorGrammarMistake({ question: activeQ, result: res, isCorrect: isOk, sourceLabel: unit?.title });
    if (isOk) {
      awardForCorrect(0, "junior_grammar", activeQ.id, "junior_grammar", res.latencyMs);
    } else {
      notifyWrong();
    }
    recordJuniorGrammarAttempt({
      pointId: activeQ.pointId,
      kpId: activeQ.kp_id ?? undefined,
      questionType: activeQ.question_type || "mcq",
      isCorrect: isOk,
      latencyMs: res.latencyMs,
      questionId: activeQ.id,
      errorReason:
        res.kind === "wrong"
          ? (res.errorReason as JuniorGrammarErrorReason | undefined)
          : undefined,
    });
  };

  const handleNext = async () => {
    const isLast = idx >= pool.length - 1;
    if (!isLast) {
      setIdx((i) => i + 1);
      setAnswered(false);
      return;
    }
    const tally = new Map<string, { id: string; title: string; correct: number; total: number }>();
    for (const p of points) tally.set(p.id, { id: p.id, title: p.title, correct: 0, total: 0 });
    pool.forEach((q, i) => {
      const ok = answers[i];
      if (ok === undefined) return;
      const e = tally.get(q.pointId);
      if (e) {
        e.total++;
        if (ok) e.correct++;
      }
    });
    const prog = await loadProgressForCodes(unit?.grammarCodes ?? [], pub);
    setResult({
      perPoint: [...tally.values()],
      mastered: prog.mastered,
      total: prog.total,
      done: prog.done,
    });
    if (prog.total > 0 && prog.mastered === prog.total) {
      fireEmojiConfetti({ vibrate: true, count: 60 });
    }
  };

  const restart = () => {
    setIdx(0);
    setAnswered(false);
    setAnswers({});
    setResult(null);
    const codes = unit?.grammarCodes ?? [];
    if (codes.length) {
      setLoading(true);
      (async () => {
        const pts = await resolveUnitPoints(codes, pub);
        const merged = await loadUnitPool(pts);
        setPoints(pts);
        setPool(pickQuestions(merged, pts, 8));
        setLoading(false);
      })();
    }
  };

  // 高中壳:优先回 returnTo(/gaokao/hub 当前关),否则回高中年级 hub。绝不落 /junior。
  const backTo = returnTo || (grade ? `/gaokao/hub/${grade}` : "/gaokao");

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  const correctSoFar = useMemo(
    () => Object.values(answers).filter(Boolean).length,
    [answers],
  );

  if (!unit || !(unit.grammarCodes && unit.grammarCodes.length > 0)) {
    return (
      <main className="playful-shell mx-auto grid min-h-screen max-w-3xl place-items-center px-5 py-10">
        <div className="playful-card w-full max-w-md px-6 py-8 text-center">
          <p className="text-lg font-extrabold text-foreground"><T>本单元未配置综合测试</T></p>
          <BackLink
            to={backTo}
            className="playful-btn playful-btn-cyan mt-6 inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-sky-400 px-6 py-2.5 text-sm text-white"
          >
            <ArrowLeft className="size-4" /> <T>返回单元</T>
          </BackLink>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="playful-shell grid min-h-screen place-items-center">
        <div className="playful-card px-8 py-6 text-center">
          <RotateCw className="mx-auto size-8 animate-spin text-pink-400" />
          <p className="mt-3 text-sm font-bold text-muted-foreground"><T>正在合成题目...</T></p>
        </div>
      </main>
    );
  }

  const grouped = !loading && points.length > 0 && points.every((p) => /^g\d+[ab]?(su|u)\d+\./.test(p.code));
  if (grouped) {
    return (
      <UnitGrammarGroupWalk
        groups={points.map((p) => ({ pointId: p.id, title: p.title }))}
        backTo={backTo}
        unitLabel={`${unit?.title ?? ""} 语法`}
      />
    );
  }

  if (result) {
    return <CompletionScreen result={result} backTo={backTo} onRestart={restart} />;
  }

  return (
    <main className="playful-shell mx-auto min-h-screen max-w-3xl px-5 py-6 space-y-4">
      <BackLink
        to={backTo}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> <T>返回单元</T>
      </BackLink>

      <header className="playful-card relative overflow-hidden p-5">
        <span className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-pink-200/40 blur-2xl" />
        <h1 className="relative text-2xl font-extrabold tracking-tight bg-gradient-to-r from-pink-600 to-cyan-600 bg-clip-text text-transparent">
          {unit.title} · 语法综合测试
        </h1>
        <p className="relative mt-1.5 text-sm text-[#5C5751] dark:text-muted-foreground">
          <T>本单元 {points.length} 个语法点混合抽题,成绩计入你的掌握度。</T>
        </p>
      </header>

      <div className="flex items-center justify-between rounded-2xl border-2 border-pink-300 bg-gradient-to-r from-pink-50 to-cyan-50 px-4 py-3 dark:border-pink-900/50 dark:from-pink-950/30 dark:to-cyan-950/20">
        <span className="text-sm font-extrabold text-[#2C2C2A] dark:text-foreground">
          第 {Math.min(idx + 1, pool.length)} / {pool.length} 题
        </span>
        <div className="text-sm font-bold tabular-nums">
          <span className="text-[#5C5751] dark:text-muted-foreground">本次答对 </span>
          <span className="text-emerald-600 dark:text-emerald-400">{correctSoFar}/{answeredCount}</span>
        </div>
      </div>

      {activeQ && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs px-1">
            <span className="rounded-full bg-gradient-to-r from-pink-100 to-cyan-100 px-2.5 py-0.5 font-bold text-pink-600 dark:from-pink-950/50 dark:to-cyan-950/50 dark:text-pink-300">
              {activeQ.pointTitle}
            </span>
          </div>
          <GrammarQuestionCard
            key={activeQ.id}
            question={activeQ}
            index={idx}
            onAnswered={handleAnswered}
          />
          {answered && (
            <div className="flex items-center justify-end pt-1">
              <button
                onClick={handleNext}
                className="playful-btn playful-btn-cyan shrink-0 inline-flex items-center gap-1 bg-gradient-to-r from-cyan-500 to-teal-400 px-4 py-2 text-sm text-white"
              >
                {idx >= pool.length - 1 ? "查看结果 →" : "下一题 →"}
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}

/* ─────────────── 结算页:本次表现 + 长期掌握 X/Y 题 ─────────────── */
function CompletionScreen({
  result,
  backTo,
  onRestart,
}: {
  result: Result;
  backTo: string;
  onRestart: () => void;
}) {
  const allMastered = result.total > 0 && result.mastered === result.total;
  const sessionCorrect = result.perPoint.reduce((s, p) => s + p.correct, 0);
  const sessionTotal = result.perPoint.reduce((s, p) => s + p.total, 0);
  const remaining = Math.max(0, result.total - result.mastered);

  return (
    <main className="playful-shell mx-auto min-h-screen max-w-3xl px-5 py-10 space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] border-2 border-pink-200/80 bg-gradient-to-br from-pink-100 via-white to-cyan-100 p-8 text-center space-y-3 dark:border-pink-900/50 dark:from-pink-950/40 dark:via-background dark:to-cyan-950/40">
        <div className="relative mx-auto grid size-20 place-items-center rounded-full bg-gradient-to-br from-pink-400 to-cyan-400 text-4xl shadow-lg spark-bob">
          {allMastered ? "👑" : "💪"}
        </div>
        <h1 className="relative text-2xl font-extrabold leading-tight tracking-tight bg-gradient-to-r from-pink-600 to-cyan-600 bg-clip-text text-transparent sm:text-3xl">
          {allMastered ? "本单元语法全部掌握!" : "综合测试完成"}
        </h1>
        <div className="relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500/15 to-cyan-500/15 px-4 py-1.5 text-sm font-bold text-pink-700 dark:text-pink-300">
          <Trophy className="size-4" />
          本次答对 {sessionCorrect}/{sessionTotal} · 已掌握 {result.mastered}/{result.total} 题
        </div>
      </section>

      <section className="playful-card p-5 space-y-3">
        <h2 className="text-base font-extrabold text-[#2C2C2A] dark:text-foreground">本次各点表现</h2>
        <div className="space-y-2">
          {result.perPoint.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2 text-sm">
              <span className="font-bold text-[#2C2C2A] dark:text-foreground">{p.title}</span>
              <span className={p.total === 0 ? "text-muted-foreground" : p.correct === p.total ? "font-bold text-emerald-600" : "font-bold text-amber-600"}>
                {p.total === 0 ? "本次未抽到" : `答对 ${p.correct}/${p.total}`}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="playful-card p-5 space-y-2">
        <h2 className="text-base font-extrabold text-[#2C2C2A] dark:text-foreground">
          长期掌握 {result.mastered}/{result.total} 题
        </h2>
        <p className="text-sm text-[#5C5751] dark:text-muted-foreground">
          已完成 {result.done}/{result.total} 题
          {remaining > 0 ? ` · 还有 ${remaining} 题未掌握` : ""}
        </p>
        {remaining > 0 ? (
          <p className="text-xs text-muted-foreground">（每道题累计答对 2 次记为「掌握」,多刷几遍掌握数就会涨。）</p>
        ) : (
          <p className="text-sm text-emerald-600 dark:text-emerald-400">本单元语法题全部掌握,继续保持!</p>
        )}
      </section>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={onRestart}
          className="playful-btn inline-flex items-center gap-1.5 bg-gradient-to-r from-pink-500 to-rose-400 px-5 py-2.5 text-sm text-white"
        >
          <RotateCw className="size-4" /> <T>再做一套</T>
        </button>
        <BackLink
          to={backTo}
          className="playful-btn inline-flex items-center gap-1.5 border border-border bg-card px-5 py-2.5 text-sm text-foreground"
        >
          <T>返回单元</T>
        </BackLink>
      </div>
    </main>
  );
}
