import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
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
import { findUnit } from "@/lib/juniorHub/courseData";
import { recordSeniorGrammarMistake } from "@/lib/seniorGrammarMistake";
import { recordSkillAttemptsForQuestion } from "@/lib/recordSkillAttempts";
import { recordGrammarQuestionMastery } from "@/lib/juniorGrammarQuestionMastery";
import { awardForCorrect, notifyWrong } from "@/lib/coins";
import { fireEmojiConfetti } from "@/lib/feedback";
import { T } from "@/i18n/T";
import UnitGrammarGroupWalk from "@/components/grammar/UnitGrammarGroupWalk";

/* ──────────────────────────────────────────────────────────────────────────
   单元语法综合测试 —— 多语法点合并抽题(每点保底1道)+ 随机抽 8 道。
   - 每答一题 recordGrammarQuestionMastery(题级,累计答对2次=掌握) → 与单元页小圆圈/
     板块总览/语法专项页同表同口径(item_type='grammar_question')。
   - 结果页:① 本次各点对错(即时) ② 长期掌握 X/Y 题(题级,与单元页小圆圈完全一致)。
   - 注:新单元(g7su/g7u/g8u 等新 code)走 UnitGrammarGroupWalk;此处结算只用于旧 legacy 单元。
   ────────────────────────────────────────────────────────────────────────── */

type Result = {
  perPoint: { id: string; title: string; correct: number; total: number }[];
  mastered: number; // 已掌握题数(correct_count≥2)
  total: number; // 本单元语法总题数
  done: number; // 做过的题数(correct+wrong≥1)
};

export default function JuniorUnitGrammarTest() {
  const { grade, unitId } = useParams<{ grade: string; unitId: string }>();
  const unit = unitId ? findUnit(unitId) : null;

  const [points, setPoints] = useState<UnitPoint[]>([]);
  const [pool, setPool] = useState<UnitQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  const [idx, setIdx] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [answers, setAnswers] = useState<Record<number, boolean>>({}); // 每题(单次)对错
  const [result, setResult] = useState<Result | null>(null);

  // ─── 解析语法点 + 合并池 + 抽 8 道 ───
  useEffect(() => {
    const codes = unit?.grammarCodes ?? [];
    if (!codes.length) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const pts = await resolveUnitPoints(codes);
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
    // 块②:补写统一错题本(此前只有专项页写,单元综合测漏了)。做对自动移出。
    void recordSeniorGrammarMistake({ question: activeQ, result: res, isCorrect: isOk, sourceLabel: unit?.title });
    // 方案B:按题掌握度(累计答对2次=掌握),与语法页 L3 / 单元页小圆圈同表同步
    void recordGrammarQuestionMastery(activeQ.id, isOk);
    if (isOk) {
      awardForCorrect(0, "junior_grammar", activeQ.id, "junior_grammar", res.latencyMs);
    } else {
      notifyWrong();
    }
    // 每题归到它真正的 point 写库 → 自动和专区掌握度/错题复习同步
    // 题带 kp_id 时一并回写知识点层(grammar_kp 行),与专区 kp 练习同源;无 kp_id 则只写 point 层(向后兼容)。
    // 注:grammar_point / grammar_kp 是错题复习/FSRS 的独立维度,不参与板块掌握度统计(那个统一走题级)。
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
    // ── 最后一题 → 结算 ──
    // ① 本次各点对错(用最新 answers,含当前题)
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
    // ② 长期掌握 X/Y 题(题级,口径与单元页小圆圈/板块总览完全一致)
    const prog = await loadProgressForCodes(unit?.grammarCodes ?? []);
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
    // 重新抽一套
    const codes = unit?.grammarCodes ?? [];
    if (codes.length) {
      setLoading(true);
      (async () => {
        const pts = await resolveUnitPoints(codes);
        const merged = await loadUnitPool(pts);
        setPoints(pts);
        setPool(pickQuestions(merged, pts, 8));
        setLoading(false);
      })();
    }
  };

  const backTo = grade ? `/junior/hub/${grade}` : "/junior";

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  const correctSoFar = useMemo(
    () => Object.values(answers).filter(Boolean).length,
    [answers],
  );

  // ─── 渲染 ───
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

  // 新单元(g7su*/g7u*/g8u* 等小题库点):走「分组(组=语法点)」并从进入起显示「第N/共X组」;
  // 老单元(旧 g7-t* 大题库)保持原混抽 8 题,避免一组上百题。
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
          <T>本单元</T> {points.length} <T>个语法点混合抽题,成绩计入你的掌握度。</T>
        </p>
      </header>

      {/* 进度条 */}
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

      {/* ① 本次各点表现 */}
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

      {/* ② 长期掌握(题级,与单元页小圆圈一致) */}
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
