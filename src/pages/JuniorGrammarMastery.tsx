import { useEffect, useState } from "react";
import { sanitizeReturnTo } from "@/lib/returnTo";
import { recordSkillAttemptsForQuestion } from "@/lib/recordSkillAttempts";
import { useParams, useSearchParams } from "react-router-dom";
import BackLink from "@/components/BackLink";
import { ArrowLeft, RotateCw, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import {
  GrammarQuestionCard,
  type GrammarQuestion,
  type AnswerResult,
} from "@/components/grammar/GrammarQuestionCard";
import { recordJuniorGrammarAttempt, type JuniorGrammarErrorReason } from "@/lib/juniorGrammarFsrs";
import { recordSeniorGrammarMistake } from "@/lib/seniorGrammarMistake";
import { awardForCorrect, notifyWrong } from "@/lib/coins";
import { fireEmojiConfetti } from "@/lib/feedback";
import { T } from "@/i18n/T";

/* ──────────────────────────────────────────────────────────────────────────
   Single-level MCQ Mastery Test —— 按「不重复题」双指标计分

   - firstResult[idx] : 该题「首次」对错(只写一次,重做不覆盖)
   - finalResult[idx] : 该题「最近一次」对错(每次覆盖)
   - 不重复题数 uniqueCount = Object.keys(firstResult).length(不是作答次数、不是题库总数)
   - 掌握度       = finalResult 中 true 数 / uniqueCount(先错后对计「对」)
   - 首次正确率   = firstResult 中 true 数 / uniqueCount(等级/通过判定用它)

   结束条件(任一):
     ① 首次正确率 ≥ 75% 且已答够 effectiveMin(避免 1 题就 100% 退出)
     ② uniqueCount ≥ effectiveMax(= min(maxQ, 可用 MCQ 去重题数))
     ③ 无新题可出
   达结束即清空 re-queue、直接进结算页。结算三值(掌握度/首次正确率/是否通过)
   在「同一作答函数作用域内用本地变量算好」后落进 completionData,结算页只读不重算。

   题源:junior_grammar_questions(9000-9199 精选;空则回退完整题库),仅取 question_type='mcq'。
   ────────────────────────────────────────────────────────────────────────── */

type LevelConfig = {
  name: string;
  emoji: string;
  skillFocusCn: string;
  minQ: number;
  maxQ: number;
  threshold: number;
};

const LEVEL: LevelConfig = {
  name: "选择题",
  emoji: "🎯",
  skillFocusCn: "选出正确的用法。",
  minQ: 4,
  maxQ: 8,
  threshold: 0.75,
};

type Pt = {
  id: string;
  title: string;
  code: string | null;
  cefr: string | null;
  grade: number | null;
  hook_line: string | null;
  hook_line_cn: string | null;
  mnemonic: string | null;
};

type Difficulty = 1 | 2 | 3;

type CompletionData = {
  uniqueCount: number;
  masteryPct: number; // 掌握度
  firstPct: number; // 首次正确率
  shouldPass: boolean; // 首次正确率 ≥ 75%
  neededMore: number; // <75% 时:距离通过还差几题
};

const Q_SELECT =
  "id,stem,option_a,option_b,option_c,option_d,correct_answer,accepted_answers,explanation,question_type,distractors,natural_note,grammar_topic,use_ai_grading,difficulty,sort_order,kp_id";

/** 等级文案(按首次正确率分档)。 */
function tierInfo(firstPct: number): { emoji: string; big: string; pass: boolean } {
  // 文案限定「本次」,不用「掌握」做长期断言(掌握靠覆盖+稳定+时间验证)。
  if (firstPct >= 100) return { emoji: "🎉", big: "本次全对，表现优秀！", pass: true };
  if (firstPct >= 90) return { emoji: "🌟", big: "本次表现很棒！", pass: true };
  if (firstPct >= 80) return { emoji: "👍", big: "本次不错，继续巩固", pass: true };
  if (firstPct >= 75) return { emoji: "💪", big: "通过！基础已建立，再练一练", pass: true };
  return { emoji: "📚", big: "继续学习，再练一练", pass: false };
}

export default function JuniorGrammarMastery() {
  const { id } = useParams<{ id: string }>();
  // 从 Hub 单元关进入时带 ?returnTo=<单元关URL>(高中=/gaokao/hub/...);有则所有返回出口回 Hub 关,全程不掉初中。
  const [sp] = useSearchParams();
  const returnTo = sanitizeReturnTo(sp.get("returnTo"));   // 站内校验:防 ?returnTo=https://evil 被塞进 <Link to>
  const [pt, setPt] = useState<Pt | null>(null);
  const [pool, setPool] = useState<GrammarQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  const [firstResult, setFirstResult] = useState<Record<number, boolean>>({});
  const [finalResult, setFinalResult] = useState<Record<number, boolean>>({});
  const [retryQueue, setRetryQueue] = useState<number[]>([]);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [completion, setCompletion] = useState<CompletionData | null>(null);
  const [viewResult, setViewResult] = useState(false);

  // ─── Fetch grammar point + MCQ pool(难度升序) ───
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const pointSelect = "id,title,code,cefr,grade,hook_line,hook_line_cn,mnemonic" as const;
      let pointRes = await supabase
        .from("junior_grammar_points")
        .select(pointSelect)
        .eq("id", id)
        .maybeSingle();
      if (!pointRes.data) {
        pointRes = await supabase
          .from("junior_grammar_points")
          .select(pointSelect)
          .eq("code", id)
          .maybeSingle();
      }
      const resolved = pointRes.data as Pt | null;
      const pointId = resolved?.id ?? id;
      const qRes = await supabase
        .from("junior_grammar_questions")
        .select(Q_SELECT)
        .eq("point_id", pointId)
        .gte("sort_order", 9000)
        .lte("sort_order", 9199)
        .order("difficulty", { ascending: true })
        .order("sort_order");
      let allQs = (qRes.data ?? []) as unknown as GrammarQuestion[];
      if (allQs.length === 0) {
        const fb = await supabase
          .from("junior_grammar_questions")
          .select(Q_SELECT)
          .eq("point_id", pointId)
          .order("difficulty", { ascending: true })
          .order("sort_order");
        allQs = (fb.data ?? []) as unknown as GrammarQuestion[];
      }
      if (cancelled) return;
      setPt(resolved);
      setPool(allQs.filter((q) => (q.question_type || "mcq") === "mcq"));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // ─── 派生量(不另存 state) ───
  const availableQuestionCount = pool.length;
  const effectiveMax = Math.min(LEVEL.maxQ, availableQuestionCount);
  const effectiveMin = Math.min(LEVEL.minQ, availableQuestionCount);
  const uniqueCount = Object.keys(firstResult).length;
  const masteredCount = Object.values(finalResult).filter(Boolean).length;
  const firstCorrectCount = Object.values(firstResult).filter(Boolean).length;

  // ─── 挑下一题 ───
  useEffect(() => {
    if (loading || completion) return;
    if (pool.length === 0) return;
    // 当前题有效(下标在范围内)→ 保留
    if (activeIdx !== null && activeIdx < pool.length) return;
    // 重排队列(先错后对)
    if (retryQueue.length > 0 && retryQueue[0] < pool.length) {
      setActiveIdx(retryQueue[0]);
      return;
    }
    // 下一道「未首答」的新题(易→难)
    for (let i = 0; i < pool.length; i++) {
      if (!(i in firstResult)) {
        setActiveIdx(i);
        return;
      }
    }
    setActiveIdx(null);
  }, [loading, completion, pool, firstResult, retryQueue, activeIdx]);

  const activeQ = activeIdx !== null && activeIdx < pool.length ? pool[activeIdx] : null;

  const handleAnswered = (result: AnswerResult) => {
    if (answered || activeIdx === null || !activeQ) return;
    setAnswered(true);
    const idx = activeIdx;
    const isOk = result.kind === "correct" || result.kind === "acceptable";
    void recordSkillAttemptsForQuestion(activeQ.id, isOk);
    // 错题写入(错→存全选项快照;对→按 source_key 自动移出)。纯新增,失败只 warn,不阻断做题。
    void recordSeniorGrammarMistake({ question: activeQ, result, isCorrect: isOk, sourceLabel: pt?.title });

    // ── 含「本次作答」的即时结果,全用本地变量算,绝不 setState 后立刻读 state ──
    const isFirst = !(idx in firstResult);
    const nextFirst = isFirst ? { ...firstResult, [idx]: isOk } : firstResult;
    const nextFinal = { ...finalResult, [idx]: isOk };
    const withoutIdx = retryQueue.filter((i) => i !== idx);
    const nextRetry = isOk ? withoutIdx : [...withoutIdx.slice(0, 2), idx, ...withoutIdx.slice(2)];

    const uCount = Object.keys(nextFirst).length;
    const firstCorr = Object.values(nextFirst).filter(Boolean).length;
    const finalCorr = Object.values(nextFinal).filter(Boolean).length;
    const fRate = uCount > 0 ? firstCorr / uCount : 0;
    const hasNew = pool.some((_, i) => !(i in nextFirst));

    const passedEarly = fRate >= LEVEL.threshold && uCount >= effectiveMin;
    const end = passedEarly || uCount >= effectiveMax || !hasNew;

    setFirstResult(nextFirst);
    setFinalResult(nextFinal);
    setRetryQueue(end ? [] : nextRetry); // 结束即清空 re-queue,不刷完队列

    if (end) {
      const masteryPct = uCount > 0 ? Math.round((finalCorr / uCount) * 100) : 0;
      const firstPct = uCount > 0 ? Math.round((firstCorr / uCount) * 100) : 0;
      const shouldPass = fRate >= LEVEL.threshold;
      const passLine = Math.ceil(effectiveMax * LEVEL.threshold); // 通过线题数
      const neededMore = Math.max(0, passLine - firstCorr);
      setCompletion({ uniqueCount: uCount, masteryPct, firstPct, shouldPass, neededMore });
      if (shouldPass) fireEmojiConfetti({ vibrate: true, count: 60 });
    }

    if (isOk) {
      awardForCorrect(0, "junior_grammar", activeQ.id, "junior_grammar", result.latencyMs);
    } else {
      notifyWrong();
    }
    if (pt?.id) {
      recordJuniorGrammarAttempt({
        pointId: pt.id,
        questionType: activeQ.question_type || "mcq",
        isCorrect: isOk,
        latencyMs: result.latencyMs,
        questionId: activeQ.id,
        kpId: (activeQ as { kp_id?: string | null }).kp_id ?? undefined,
        errorReason:
          result.kind === "wrong"
            ? (result.errorReason as JuniorGrammarErrorReason | undefined)
            : undefined,
      });
    }
  };

  const handleNext = () => {
    if (completion) {
      setViewResult(true); // 已结束 → 看结算页
      return;
    }
    setAnswered(false);
    setActiveIdx(null);
  };

  const restart = () => {
    setFirstResult({});
    setFinalResult({});
    setRetryQueue([]);
    setActiveIdx(null);
    setAnswered(false);
    setCompletion(null);
    setViewResult(false);
  };

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
    const looksLikePlaceholder = !id || id === "id" || id === ":id";
    return (
      <main className="playful-shell mx-auto grid min-h-screen max-w-3xl place-items-center px-5 py-10">
        <div className="playful-card w-full max-w-md px-6 py-8 text-center">
          <p className="text-lg font-extrabold text-foreground"><T>语法点不存在</T></p>
          <p className="mt-2 text-sm text-muted-foreground">
            {looksLikePlaceholder ? (
              <T>请从语法地图进入，不要直接打开带占位符 id 的链接。</T>
            ) : (
              <T>未找到该考点，请确认链接是否正确。</T>
            )}
          </p>
          <BackLink
            to={returnTo || "/junior/grammar"}
            className="playful-btn playful-btn-cyan mt-6 inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-sky-400 px-6 py-2.5 text-sm text-white"
          >
            <ArrowLeft className="size-4" />
            <T>{returnTo ? "返回单元" : "返回语法地图"}</T>
          </BackLink>
        </div>
      </main>
    );
  }

  if (viewResult && completion) {
    return <CompletionScreen pt={pt} data={completion} onRestart={restart} returnTo={returnTo} />;
  }

  const backTo = returnTo || (pt.grade ? `/junior/grammar?grade=${pt.grade}` : "/junior/grammar");

  return (
    <main className="playful-shell mx-auto min-h-screen max-w-3xl px-5 py-6 space-y-4">
      <BackLink
        to={backTo}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> <T>{returnTo ? "返回单元" : "返回考点列表"}</T>
      </BackLink>

      <header className="playful-card relative overflow-hidden p-5">
        <span className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-pink-200/40 blur-2xl" />
        <span className="pointer-events-none absolute -bottom-4 -left-4 size-20 rounded-full bg-cyan-200/40 blur-2xl" />
        <h1 className="relative text-2xl font-extrabold tracking-tight bg-gradient-to-r from-pink-600 to-cyan-600 bg-clip-text text-transparent">
          {pt.title}
        </h1>
        <p className="relative mt-1.5 text-sm text-[#5C5751] dark:text-muted-foreground">
          <T>用选择题检验你对这个语法点的掌握 —— 答对就巩固。</T>
        </p>
      </header>

      {/* 进度条:掌握度 + 首次正确率(实时,按不重复题) */}
      <div className="flex items-center justify-between rounded-2xl border-2 border-pink-300 bg-gradient-to-r from-pink-50 to-cyan-50 px-4 py-3 dark:border-pink-900/50 dark:from-pink-950/30 dark:to-cyan-950/20">
        <div className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-xl bg-white text-lg shadow-sm dark:bg-background">{LEVEL.emoji}</span>
          <span className="text-sm font-extrabold text-[#2C2C2A] dark:text-foreground">{LEVEL.name}</span>
        </div>
        <div className="text-sm font-bold tabular-nums">
          <span className="text-[#5C5751] dark:text-muted-foreground">掌握度 </span>
          <span className="text-emerald-600 dark:text-emerald-400">{masteredCount}/{uniqueCount}</span>
          <span className="text-[#5C5751] dark:text-muted-foreground"> · 首次正确 </span>
          <span className="text-pink-600 dark:text-pink-300">{firstCorrectCount}/{uniqueCount}</span>
        </div>
      </div>

      {/* ─── Active question card ─── */}
      {activeQ ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs px-1">
            <span className="rounded-full bg-gradient-to-r from-pink-100 to-cyan-100 px-2.5 py-0.5 font-bold text-pink-600 dark:from-pink-950/50 dark:to-cyan-950/50 dark:text-pink-300">
              {LEVEL.name}
            </span>
            {(() => {
              const d = (activeQ.difficulty ?? 2) as Difficulty;
              const meta = d === 1
                ? { cn: "易", cls: "bg-sky-500/15 text-sky-700 dark:text-sky-300" }
                : d === 3
                ? { cn: "难", cls: "bg-rose-500/15 text-rose-700 dark:text-rose-300" }
                : { cn: "中", cls: "bg-amber-500/15 text-amber-700 dark:text-amber-300" };
              return <span className={cn("rounded-full px-2 py-0.5 font-bold", meta.cls)}>{meta.cn}</span>;
            })()}
          </div>
          <GrammarQuestionCard
            key={activeQ.id}
            question={activeQ}
            index={uniqueCount}
            onAnswered={handleAnswered}
          />
          {answered && (
            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="text-xs font-bold text-[#5C5751] dark:text-foreground">
                {LEVEL.skillFocusCn}
              </div>
              <button
                onClick={handleNext}
                className="playful-btn playful-btn-cyan shrink-0 inline-flex items-center gap-1 bg-gradient-to-r from-cyan-500 to-teal-400 px-4 py-2 text-sm text-white"
              >
                {completion ? "查看结果 →" : "下一题 →"}
              </button>
            </div>
          )}
        </div>
      ) : pool.length === 0 ? (
        <div className="playful-card p-8 text-center">
          <p className="text-sm text-muted-foreground"><T>该考点暂无选择题。</T></p>
        </div>
      ) : (
        <div className="playful-card p-8 text-center">
          <p className="text-sm text-muted-foreground"><T>加载题目中...</T></p>
        </div>
      )}

      {/* ─── 通关条件(浅底条) ─── */}
      <div className="rounded-xl bg-muted/50 px-3 py-2 text-center text-xs text-[#5C5751] dark:text-muted-foreground">
        通关条件：首次正确率 ≥ {Math.round(LEVEL.threshold * 100)}% · 答错的题可重做(巩固掌握度，不计入首次正确率)
      </div>
    </main>
  );
}

/* ─────────────── Completion Screen(只读 completionData,不重算) ─────────────── */
function CompletionScreen({
  pt,
  data,
  onRestart,
  returnTo,
}: {
  pt: Pt;
  data: CompletionData;
  onRestart: () => void;
  returnTo?: string | null;
}) {
  const tier = tierInfo(data.firstPct);
  const backToList = returnTo || (pt.grade ? `/junior/grammar?grade=${pt.grade}` : "/junior/grammar");
  const backToHub = returnTo || (pt.grade ? `/junior/hub/${pt.grade}` : "/junior");
  const sub = tier.pass
    ? "本次测试表现不错，继续巩固会更棒"
    : data.neededMore > 0
    ? `距离通过还差 ${data.neededMore} 题`
    : "再学习一遍会更好。";

  return (
    <main className="playful-shell mx-auto min-h-screen max-w-3xl px-5 py-10 space-y-6 text-center">
      <section className="relative overflow-hidden rounded-[2rem] border-2 border-pink-200/80 bg-gradient-to-br from-pink-100 via-white to-cyan-100 p-8 space-y-3 dark:border-pink-900/50 dark:from-pink-950/40 dark:via-background dark:to-cyan-950/40">
        <div className="relative mx-auto grid size-20 place-items-center rounded-full bg-gradient-to-br from-pink-400 to-cyan-400 text-4xl shadow-lg spark-bob">
          {tier.emoji}
        </div>
        <h1 className="relative text-2xl font-extrabold leading-tight tracking-tight bg-gradient-to-r from-pink-600 to-cyan-600 bg-clip-text text-transparent sm:text-3xl">
          {tier.big}
        </h1>
        <p className="relative text-base text-[#5C5751] dark:text-muted-foreground">{sub}</p>
        <div className="relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500/15 to-cyan-500/15 px-4 py-1.5 text-sm font-bold text-pink-700 dark:text-pink-300">
          <Trophy className="size-4" />
          掌握度 {data.masteryPct}% · 首次正确率 {data.firstPct}%
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {tier.pass ? (
          <BackLink
            to={backToList}
            className="playful-btn playful-btn-cyan inline-flex items-center gap-1.5 bg-gradient-to-r from-cyan-500 to-teal-400 px-5 py-2.5 text-sm text-white"
          >
            <T>继续学习</T>
          </BackLink>
        ) : (
          <button
            onClick={onRestart}
            className="playful-btn inline-flex items-center gap-1.5 bg-gradient-to-r from-pink-500 to-rose-400 px-5 py-2.5 text-sm text-white"
          >
            <RotateCw className="size-4" /> <T>再做一遍</T>
          </button>
        )}
        <BackLink
          to={backToHub}
          className="playful-btn inline-flex items-center gap-1.5 border border-border bg-card px-5 py-2.5 text-sm text-foreground"
        >
          <T>返回单元</T>
        </BackLink>
      </div>
    </main>
  );
}
