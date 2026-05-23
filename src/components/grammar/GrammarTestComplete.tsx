import { T } from "@/i18n/T";
import BackLink from "@/components/BackLink";
import { RotateCw, Sparkles, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { JuniorCheckpoint } from "@/components/assessment/JuniorCheckpoint";
import {
  CHALLENGE_QUESTIONS_JUNIOR,
  CHALLENGE_THRESHOLD,
  type Streak,
} from "@/lib/challengeMode";
import type { GrammarQuestion } from "@/components/grammar/GrammarQuestionCard";
import type { AnswerResult } from "@/components/grammar/GrammarQuestionCard";

type Props = {
  pointId: string;
  pointTitle: string;
  grade: number;
  qs: GrammarQuestion[];
  results: Record<string, AnswerResult>;
  correctCount: number;
  pct: number;
  grammarBackTo: string;
  isChallenge?: boolean;
  groupStreak: Streak;
  onReset: () => void;
  onEnterChallenge: () => void;
  onExitChallenge: () => void;
};

function scoreEmoji(pct: number) {
  if (pct === 100) return "🌟";
  if (pct >= 90) return "🎉";
  if (pct >= 70) return "👍";
  return "💪";
}

function scoreTitle(pct: number) {
  if (pct === 100) return "满分通关！";
  if (pct >= 90) return "太厉害啦！";
  if (pct >= 70) return "不错哦！";
  return "再来一次会更好！";
}

export function GrammarTestComplete({
  pointId,
  pointTitle,
  grade,
  qs,
  results,
  correctCount,
  pct,
  grammarBackTo,
  isChallenge,
  groupStreak,
  onReset,
  onEnterChallenge,
  onExitChallenge,
}: Props) {
  const answeredCount = Object.keys(results).length;

  return (
    <section className="relative overflow-hidden rounded-[2rem] border-2 border-pink-200/80 bg-gradient-to-br from-pink-100 via-white to-cyan-100 p-6 sm:p-8 text-center shadow-[0_16px_40px_-16px_rgba(236,72,153,0.35)] dark:border-pink-900/50 dark:from-pink-950/40 dark:via-background dark:to-cyan-950/40">
      <span className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-pink-300/30 blur-3xl" />
      <span className="pointer-events-none absolute -bottom-10 -left-6 size-28 rounded-full bg-cyan-300/30 blur-3xl" />

      <div className="relative mx-auto grid size-20 place-items-center rounded-full bg-gradient-to-br from-pink-400 to-rose-400 text-white shadow-lg spark-bob">
        <Trophy className="size-10" />
      </div>

      <h3 className="relative mt-4 text-2xl font-extrabold bg-gradient-to-r from-pink-600 via-rose-500 to-cyan-600 bg-clip-text text-transparent">
        {scoreEmoji(pct)} <T>{scoreTitle(pct)}</T>
      </h3>

      {qs.length > 0 ? (
        <p className="relative mt-2 text-sm text-muted-foreground">
          <T>答对</T> {correctCount} / {qs.length} · <T>正确率</T>{" "}
          <span className="font-extrabold text-pink-600">{pct}%</span>
        </p>
      ) : (
        <p className="relative mt-2 text-sm text-muted-foreground">
          <T>已完成本考点的学习</T>
        </p>
      )}

      {answeredCount > 0 && (
        <div className="relative mx-auto mt-5 max-w-md rounded-2xl border-2 border-pink-100 bg-white/80 p-4 text-left dark:border-pink-900/40 dark:bg-card/80">
          <div className="mb-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-pink-500">
            <Sparkles className="size-3" />
            <T>本次答题概览</T>
          </div>
          <div className="flex flex-wrap gap-2">
            {qs.map((q, i) => {
              const r = results[q.id];
              const ok = r && (r.kind === "correct" || r.kind === "acceptable");
              return (
                <span
                  key={q.id}
                  className={cn(
                    "inline-flex size-8 items-center justify-center rounded-xl text-xs font-extrabold shadow-sm transition",
                    ok && "bg-gradient-to-br from-emerald-400 to-teal-500 text-white",
                    r && !ok && "bg-gradient-to-br from-rose-400 to-pink-500 text-white",
                    !r && "bg-muted text-muted-foreground",
                  )}
                  title={`第 ${i + 1} 题`}
                >
                  {i + 1}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {pointId && qs.length > 0 && (
        <div className="relative mt-4 flex justify-center">
          <JuniorCheckpoint pointId={pointId} pointTitle={pointTitle} grade={grade} />
        </div>
      )}

      <div className="relative mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onReset}
          className="playful-btn inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-400 px-6 py-2.5 text-sm text-white"
        >
          <RotateCw className="size-4" />
          <T>再做一遍</T>
        </button>

        {groupStreak.challenge_unlocked && !isChallenge && (
          <button
            type="button"
            onClick={onEnterChallenge}
            className="playful-btn playful-btn-cyan inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-teal-400 px-6 py-2.5 text-sm text-white"
          >
            <T>🏆 挑战模式（</T>
            {CHALLENGE_QUESTIONS_JUNIOR} <T>题）</T>
          </button>
        )}

        {isChallenge && (
          <button
            type="button"
            onClick={onExitChallenge}
            className="playful-btn inline-flex items-center gap-2 border-2 border-pink-200 bg-white px-6 py-2.5 text-sm text-pink-700 dark:border-pink-800 dark:bg-card dark:text-pink-300"
          >
            <T>↩️ 退出挑战模式</T>
          </button>
        )}

        <BackLink
          to={grammarBackTo}
          className="playful-btn playful-btn-cyan inline-flex items-center gap-2 bg-gradient-to-r from-cyan-400 to-sky-400 px-6 py-2.5 text-sm text-white"
        >
          <T>📚 下一个考点</T>
        </BackLink>

        <BackLink
          to="/junior"
          className="playful-btn inline-flex items-center gap-2 border-2 border-cyan-200 bg-white px-6 py-2.5 text-sm text-cyan-700 dark:border-cyan-800 dark:bg-card dark:text-cyan-300"
        >
          <T>🏠 初中首页</T>
        </BackLink>
      </div>

      {!groupStreak.challenge_unlocked && pct >= 70 && (
        <p className="relative mt-4 text-xs font-bold text-pink-600 dark:text-pink-300">
          <T>🔥 连续完成</T> {groupStreak.consecutive_count}/{CHALLENGE_THRESHOLD} <T>组</T>
          {groupStreak.consecutive_count < CHALLENGE_THRESHOLD &&
            ` · 再 ${CHALLENGE_THRESHOLD - groupStreak.consecutive_count} 组解锁挑战模式 🏆`}
        </p>
      )}
      {!groupStreak.challenge_unlocked && pct < 70 && groupStreak.consecutive_count === 0 && (
        <p className="relative mt-4 text-xs text-muted-foreground">
          <T>💡 单组正确率 ≥70% 才计入连胜，加油！</T>
        </p>
      )}
    </section>
  );
}
