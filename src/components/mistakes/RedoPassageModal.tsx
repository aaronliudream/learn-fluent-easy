import { useMemo, useState } from "react";
import { RotateCw, X } from "lucide-react";
import { T } from "@/i18n/T";
import type { StreakResult } from "@/lib/mistakeStreak";

/**
 * 整篇型错题(阅读/完形)的「整篇重做」弹窗。
 *
 * ★为什么单开一个组件★
 * 单题弹窗 RedoQuestionModal 认的是**顶层** snapshot.options + correct_answer;
 * 而阅读整篇快照把题放在 snapshot.questions[] 里(每题自带 options/correct_answer),
 * 顶层没有 options → isRedoable 恒为 false → 整篇卡从来没有重做按钮。
 * 这里逐题过 questions[],全部答完给总分。
 *
 * ★巩固规则与单题 MCQ 对齐★
 *   整篇**全对** = 当天一次连对 → 调 onAllCorrect()(内部走 bumpMistakeCorrect,
 *   跨 3 天连对 3 次才移出);**有一题错就不计连对**,可关掉重来。
 *   这与 JuniorReadingPlay 的口径一致(那边也是整篇全对才 bump)。
 *
 * ★答案揭晓规则沿用现有★
 *   平时藏答案;某题选对 → 该题标绿;某题选错 → 标红并揭晓该题正确项
 *   (镜像 RedoQuestionModal 的 wrongPicked→revealed)。原文默认折叠,
 *   要看得自己展开 —— 原文里含答案线索,不主动摊开。
 *
 * 只读 snapshot,不写库、不碰 SRS 排程。
 */

export type PassageQuestion = {
  no?: number;
  stem?: string;
  options?: Record<string, unknown>;
  correct_answer?: string;
  explanation?: string | null;
};

/** 规范化取题:过滤掉空选项;只有「≥2 个选项 且 正确答案命中某个选项字母」才算可重做。 */
export function passageQuestions(snapshot: unknown): {
  no: number;
  stem: string;
  opts: [string, string][];
  correct: string;
  explanation: string;
}[] {
  const raw = (snapshot as { questions?: unknown })?.questions;
  if (!Array.isArray(raw)) return [];
  const out: ReturnType<typeof passageQuestions> = [];
  raw.forEach((q: PassageQuestion, i: number) => {
    const opts =
      q?.options && typeof q.options === "object"
        ? (Object.entries(q.options) as [string, unknown][]).
          filter(([, v]) => v != null && String(v).trim() !== "").
          map(([k, v]) => [k, String(v)] as [string, string]).
          sort(([a], [b]) => a.localeCompare(b))
        : [];
    const correct = String(q?.correct_answer ?? "").trim();
    if (opts.length < 2 || !opts.some(([L]) => L === correct)) return;
    out.push({
      no: q?.no ?? i + 1,
      stem: String(q?.stem ?? ""),
      opts,
      correct,
      explanation: String(q?.explanation ?? ""),
    });
  });
  return out;
}

/**
 * 整篇卡是否可重做:questions[] 里**每一题**都得是合法 MCQ。
 * 只要有一题残缺,总分就没有意义(算不出"全对"),故整篇不给重做 —— 宁可不给,不给错的。
 */
export function isPassageRedoable(snapshot: unknown): boolean {
  const raw = (snapshot as { questions?: unknown })?.questions;
  if (!Array.isArray(raw) || raw.length === 0) return false;
  return passageQuestions(snapshot).length === raw.length;
}

export default function RedoPassageModal({
  title, body, snapshot, onAllCorrect, onClose
}: {
  title: string;
  body: string;
  snapshot: unknown;
  /** 整篇全对时调用一次;返回连对结果供提示文案使用。 */
  onAllCorrect: () => Promise<StreakResult | null>;
  onClose: () => void;
}) {
  const qs = useMemo(() => passageQuestions(snapshot), [snapshot]);
  const [picks, setPicks] = useState<Record<number, string>>({});
  const [showBody, setShowBody] = useState(false);
  const [streakRes, setStreakRes] = useState<StreakResult | null>(null);
  const [bumped, setBumped] = useState(false);

  const answered = Object.keys(picks).length;
  const allAnswered = qs.length > 0 && answered >= qs.length;
  const correctCount = qs.filter((q, i) => picks[i] === q.correct).length;
  const allCorrect = allAnswered && correctCount === qs.length;

  const pick = async (qi: number, L: string) => {
    if (picks[qi]) return;                       // 每题只答一次,答过锁定
    const next = { ...picks, [qi]: L };
    setPicks(next);
    // 全部答完且全对 → 记一次连对(只记一次,防重复 bump)
    const done = Object.keys(next).length >= qs.length;
    const perfect = done && qs.every((q, i) => next[i] === q.correct);
    if (perfect && !bumped) {
      setBumped(true);
      setStreakRes(await onAllCorrect());
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      onClick={onClose}>
      <div
        className="flex max-h-[92vh] w-full max-w-lg flex-col rounded-t-3xl bg-card shadow-xl sm:max-h-[88vh] sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}>

        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 text-sm font-bold text-sky-700 dark:text-sky-300">
              <RotateCw className="size-4" /> <T>整篇重做</T>
              <span className="text-xs font-normal text-muted-foreground">
                {answered}/{qs.length}
              </span>
            </div>
            {title && <div className="mt-0.5 truncate text-xs text-muted-foreground">{title}</div>}
          </div>
          <button
            onClick={onClose}
            className="grid size-8 flex-shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-secondary"
            aria-label="关闭">
            <X className="size-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {/* 原文默认折叠:原文含答案线索,要看得自己点开 */}
          {body &&
          <div className="mb-4">
              <button
              type="button"
              onClick={() => setShowBody((v) => !v)}
              className="rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground/70 hover:bg-secondary/70">
                {showBody ? "▲ 收起原文" : "▼ 展开原文"}
              </button>
              {showBody &&
            <div className="mt-2 whitespace-pre-wrap rounded-xl bg-background/60 p-3 text-sm leading-relaxed text-foreground/80">
                  {body}
                </div>
            }
            </div>
          }

          <ol className="space-y-5">
            {qs.map((q, qi) => {
              const picked = picks[qi] ?? null;
              const solved = picked === q.correct;
              const wrongPicked = picked !== null && picked !== q.correct;
              return (
                <li key={qi} className="border-t border-border/60 pt-4 first:border-t-0 first:pt-0">
                  <div className="mb-2 text-base font-semibold leading-relaxed text-foreground">
                    {q.no}. {q.stem}
                  </div>
                  <ul className="space-y-2">
                    {q.opts.map(([L, txt]) => {
                      const isCorrect = L === q.correct;
                      const isPicked = picked === L;
                      const state =
                      solved && isCorrect ? "correct" :
                      isPicked && !isCorrect ? "wrong" :
                      wrongPicked && isCorrect ? "revealed" : "idle";
                      const cls =
                      state === "correct" ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-500/10" :
                      state === "wrong" ? "border-rose-300 bg-rose-50 opacity-80 dark:bg-rose-500/10" :
                      state === "revealed" ? "border-emerald-300 bg-emerald-50/70 dark:bg-emerald-500/5" :
                      "border-border bg-background hover:border-sky-300";
                      return (
                        <li key={L}>
                          <button
                            onClick={() => void pick(qi, L)}
                            disabled={picked !== null}
                            className={`flex w-full items-baseline gap-2.5 rounded-2xl border-2 px-4 py-2.5 text-left text-base transition ${cls}`}>
                            <span className={`grid size-6 flex-shrink-0 place-items-center rounded-lg text-xs font-extrabold ${
                            state === "correct" || state === "revealed" ? "bg-emerald-400 text-white" :
                            state === "wrong" ? "bg-rose-400 text-white" : "bg-secondary text-foreground"}`}>
                              {state === "correct" || state === "revealed" ? "✓" : state === "wrong" ? "✕" : L}
                            </span>
                            <span className={`min-w-0 break-words ${state === "wrong" ? "line-through" : ""}`}>{txt}</span>
                          </button>
                        </li>);

                    })}
                  </ul>
                  {wrongPicked && q.explanation &&
                  <div className="mt-2 rounded-xl bg-secondary/60 p-3 text-sm leading-relaxed text-foreground/80">
                      💡 {q.explanation}
                    </div>
                  }
                </li>);

            })}
          </ol>
        </div>

        {/* 全部答完 → 得分 + 巩固提示。有错不计连对,说清楚为什么。 */}
        {allAnswered &&
        <div className="border-t border-border px-5 py-4">
            <div className={`rounded-2xl p-3 text-sm font-semibold ${
          allCorrect ?
          "border border-emerald-300 bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300" :
          "border border-amber-300 bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300"}`
          }>
              <div>
                {allCorrect ? "🎉" : "📊"} <T>本次答对</T> {correctCount} / {qs.length} <T>题</T>
              </div>
              <div className="mt-1 font-normal">
                {!allCorrect ?
              <T>整篇全对才算一次巩固。看完解析,关掉再来一遍。</T> :
              streakRes?.is_resolved ?
              <T>跨 3 天连对达成,已彻底掌握,移出错题本!</T> :
              streakRes?.already_today ?
              <T>今天已巩固过,明天再来一次 +1。</T> :
              streakRes ?
              <span>巩固 {streakRes.correct_streak}/3 · 跨 3 天各全对 1 次即彻底掌握</span> :
              <T>全对!</T>}
              </div>
            </div>
          </div>
        }
      </div>
    </div>);

}
