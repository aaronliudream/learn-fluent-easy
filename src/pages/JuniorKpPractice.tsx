import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { sanitizeReturnTo } from "@/lib/returnTo";
import BackLink from "@/components/BackLink";
import { ArrowLeft, RotateCw, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  GrammarQuestionCard,
  type GrammarQuestion,
  type AnswerResult,
} from "@/components/grammar/GrammarQuestionCard";
import {
  recordJuniorGrammarAttempt,
  KP_LEARNED_STREAK,
  type JuniorGrammarErrorReason,
} from "@/lib/juniorGrammarFsrs";
import { recordSeniorGrammarMistake } from "@/lib/seniorGrammarMistake";
import {
  loadKp,
  loadKpMcqPool,
  loadKpMastery,
  streakFromRows,
  kpState,
  type KpCatalogItem,
} from "@/lib/juniorKnowledgePoint";
import { recordSkillAttemptsForQuestion } from "@/lib/recordSkillAttempts";
import { awardForCorrect, notifyWrong } from "@/lib/coins";
import { fireEmojiConfetti } from "@/lib/feedback";
import { T } from "@/i18n/T";

/* ──────────────────────────────────────────────────────────────────────────
   知识点练习 —— 按 kp_id 出该知识点的 MCQ,连续答对 KP_LEARNED_STREAK 道即点亮 Learned。
   通关条件 = 连对 5 道(本地实时计数,初值从 DB grammar_kp 行的 streak 续连)。
   * 不复用 JuniorGrammarMastery / JuniorUnitGrammarTest 的判分骨架。
   * 仅复用 GrammarQuestionCard(不改形态) + recordJuniorGrammarAttempt(已带 kpId) + juniorKnowledgePoint。
   ────────────────────────────────────────────────────────────────────────── */

function shuffle<T>(arr: T[]): T[] {
  const r = [...arr];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

export default function JuniorKpPractice() {
  const { kpId } = useParams<{ kpId: string }>();
  const nav = useNavigate();
  // 从 Hub 单元关进入时带 ?returnTo=<单元关URL>;有则返回出口回单元关(而非语法专区)。
  const [searchParams] = useSearchParams();
  const returnTo = sanitizeReturnTo(searchParams.get("returnTo"));   // 站内校验:防 ?returnTo=https://evil 被塞进 <Link to>

  const [kp, setKp] = useState<KpCatalogItem | null>(null);
  const [pool, setPool] = useState<GrammarQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [alreadyMastered, setAlreadyMastered] = useState(false);

  const [idx, setIdx] = useState(0); // 指向 pool(已洗牌)
  const [answered, setAnswered] = useState(false);
  const [streak, setStreak] = useState(0);
  const [wrongFlash, setWrongFlash] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const celebratedRef = useRef(false); // 本 session 只庆祝一次跨越

  useEffect(() => {
    if (!kpId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [meta, mcqs, rows] = await Promise.all([
        loadKp(kpId),
        loadKpMcqPool(kpId),
        loadKpMastery(),
      ]);
      if (cancelled) return;
      setKp(meta);
      setPool(shuffle(mcqs));
      setStreak(streakFromRows(kpId, rows));
      const row = rows.find((r) => r.item_id === kpId) ?? null;
      const st = kpState(row);
      setAlreadyMastered(st === "Mastered");
      if ((row?.mastery_matrix?.streak ?? 0) >= KP_LEARNED_STREAK) celebratedRef.current = true;
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [kpId]);

  const activeQ = pool.length > 0 ? pool[idx % pool.length] : null;

  const handleAnswered = (result: AnswerResult) => {
    if (answered || !activeQ || !kp) return;
    setAnswered(true);
    const isOk = result.kind === "correct" || result.kind === "acceptable";

    void recordSkillAttemptsForQuestion(activeQ.id, isOk);
    // 错题写入(错→存全选项快照;对→按 source_key 自动移出)。纯新增,失败只 warn,不阻断做题。
    void recordSeniorGrammarMistake({ question: activeQ, result, isCorrect: isOk, sourceLabel: kp.title });
    if (isOk) {
      awardForCorrect(0, "junior_grammar", activeQ.id, "junior_grammar", result.latencyMs);
    } else {
      notifyWrong();
    }
    // 同一次作答:写考点行(现有逻辑)+ 知识点行(streak/Learned),归到该题真实 point/kp。
    recordJuniorGrammarAttempt({
      pointId: kp.point_id,
      questionType: "mcq",
      isCorrect: isOk,
      latencyMs: result.latencyMs,
      questionId: activeQ.id,
      kpId: kp.id,
      errorReason:
        result.kind === "wrong"
          ? (result.errorReason as JuniorGrammarErrorReason | undefined)
          : undefined,
    });

    if (isOk) {
      setWrongFlash(false);
      setStreak((s) => {
        const next = s + 1;
        if (next >= KP_LEARNED_STREAK && !celebratedRef.current) {
          celebratedRef.current = true;
          setCelebrate(true);
          fireEmojiConfetti({ vibrate: true, count: 60 });
        }
        return next;
      });
    } else {
      setStreak(0);
      setWrongFlash(true);
    }
  };

  const handleNext = () => {
    setAnswered(false);
    setIdx((i) => {
      const n = i + 1;
      // 走完一轮 → 重新洗牌继续(保证不立刻重复同一题)
      if (n % pool.length === 0 && pool.length > 1) {
        const reshuffled = shuffle(pool);
        if (reshuffled[0]?.id === activeQ?.id && reshuffled.length > 1) {
          [reshuffled[0], reshuffled[1]] = [reshuffled[1], reshuffled[0]];
        }
        setPool(reshuffled);
        return 0;
      }
      return n;
    });
  };

  const backTo = returnTo || (kp ? `/junior/grammar/${kp.point_id}` : "/junior/grammar");
  const filled = Math.min(streak, KP_LEARNED_STREAK);

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

  if (!kp) {
    return (
      <main className="playful-shell mx-auto grid min-h-screen max-w-3xl place-items-center px-5 py-10">
        <div className="playful-card w-full max-w-md px-6 py-8 text-center">
          <p className="text-lg font-extrabold text-foreground"><T>知识点不存在</T></p>
          <BackLink to={returnTo || "/junior/grammar"} className="playful-btn playful-btn-cyan mt-6 inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-sky-400 px-6 py-2.5 text-sm text-white">
            <ArrowLeft className="size-4" /> <T>{returnTo ? "返回单元" : "返回考点列表"}</T>
          </BackLink>
        </div>
      </main>
    );
  }

  return (
    <main className="playful-shell mx-auto min-h-screen max-w-3xl px-5 py-6 space-y-4">
      <BackLink to={backTo} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> <T>返回考点</T>
      </BackLink>

      <header className="playful-card relative overflow-hidden p-5">
        <span className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-pink-200/40 blur-2xl" />
        <h1 className="relative text-2xl font-extrabold tracking-tight bg-gradient-to-r from-pink-600 to-cyan-600 bg-clip-text text-transparent">
          {kp.title}
        </h1>
        <p className="relative mt-1.5 text-sm text-[#5C5751] dark:text-muted-foreground">
          <T>连续答对 {KP_LEARNED_STREAK} 道点亮「已学会」 —— 答错会清零,要连着对。</T>
          {alreadyMastered && <span className="ml-2 font-bold text-emerald-600">✓ 已掌握</span>}
        </p>
      </header>

      {/* 连对进度条:5 格,答对一道亮一格 */}
      <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3 dark:border-amber-900/50 dark:from-amber-950/30 dark:to-orange-950/20">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-extrabold text-[#2C2C2A] dark:text-foreground">🔥 连对进度</span>
          <span className="text-sm font-extrabold tabular-nums text-amber-600 dark:text-amber-300">{filled}/{KP_LEARNED_STREAK}</span>
        </div>
        <div className="flex gap-1.5">
          {Array.from({ length: KP_LEARNED_STREAK }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-3 flex-1 rounded-full transition-colors",
                i < filled ? "bg-gradient-to-r from-amber-400 to-orange-500" : "bg-muted",
              )}
            />
          ))}
        </div>
        {wrongFlash && (
          <p className="mt-2 text-xs font-bold text-rose-600 dark:text-rose-400">
            ❌ <T>连对清零,需重新连续答对 {KP_LEARNED_STREAK} 道</T>
          </p>
        )}
      </div>

      {/* 答题卡 */}
      {activeQ ? (
        <div className="space-y-3">
          <GrammarQuestionCard
            key={`${activeQ.id}-${idx}`}
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
                <T>下一题 →</T>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="playful-card p-8 text-center">
          <p className="text-sm text-muted-foreground"><T>这个知识点暂无练习题</T></p>
        </div>
      )}

      {/* 🎉 已学会 庆祝 */}
      {celebrate && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-5" onClick={() => setCelebrate(false)}>
          <div className="playful-card w-full max-w-sm space-y-4 p-7 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto grid size-20 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-4xl shadow-lg spark-bob">🎉</div>
            <h2 className="text-2xl font-extrabold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              已学会（Learned）！
            </h2>
            <p className="text-sm text-[#5C5751] dark:text-muted-foreground">
              <T>你连对了 {KP_LEARNED_STREAK} 道「{kp.title}」,这个知识点已点亮。</T>
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setCelebrate(false)}
                className="playful-btn inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-pink-500 to-rose-400 px-5 py-2.5 text-sm text-white"
              >
                <Sparkles className="size-4" /> <T>继续巩固</T>
              </button>
              <button
                onClick={() => nav(backTo)}
                className="playful-btn inline-flex items-center justify-center gap-1.5 border border-border bg-card px-5 py-2.5 text-sm text-foreground"
              >
                <T>返回考点</T>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
