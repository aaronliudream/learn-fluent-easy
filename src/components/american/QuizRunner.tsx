/**
 * 美语课程 · 通用答题引擎(关5/6/8/9/10 共用)。
 * - choice:选项 → 即时对错反馈 + 揭示正确项;每题一次作答,掌握靠多次游玩累积(答对2次)。
 * - reveal:句型转换/情景应答等开放题 → 显示参考答案 → 自评"答对/没答对"记掌握。
 * 每题作答回调 onAnswer(id,isCorrect) 由各关落库(american_user_mastery)。
 */
import { useCallback, useMemo, useState } from "react";
import { Check, X, Volume2, ChevronRight } from "lucide-react";
import { T } from "@/i18n/T";
import { speakUS, unlockAmericanAudio } from "@/lib/american/audio";
import type { AmericanQuestion } from "@/lib/american/data";

export type QuizItem =
  | { kind: "choice"; id: string; stem: string; options: string[]; answerIndex: number }
  | { kind: "reveal"; id: string; prompt: string; answer: string };

/** american_questions → QuizItem(choice / reveal[transform·scenario])。 */
export function questionsToItems(qs: AmericanQuestion[]): QuizItem[] {
  return qs.map((q) =>
    q.qtype === "transform" || q.qtype === "scenario"
      ? { kind: "reveal", id: q.id, prompt: q.payload.stem, answer: q.payload.answer_text ?? "" }
      : { kind: "choice", id: q.id, stem: q.payload.stem, options: q.payload.options ?? [], answerIndex: q.payload.answer_index ?? 0 },
  );
}

export function QuizRunner({
  items,
  onAnswer,
  onComplete,
  speakStem = false,
  header,
}: {
  items: QuizItem[];
  onAnswer: (id: string, isCorrect: boolean) => void;
  onComplete: (scorePct: number) => void;
  /** choice 题干朗读(听力关用);reveal 参考答案总是可朗读。 */
  speakStem?: boolean;
  header?: React.ReactNode;
}) {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const total = items.length;
  const item = items[idx];

  const next = useCallback(() => {
    if (idx + 1 >= total) {
      setFinished(true);
      const pct = total ? Math.round((correctCount / total) * 100) : 0;
      onComplete(pct);
    } else {
      setIdx((i) => i + 1);
      setPicked(null);
      setRevealed(false);
    }
  }, [idx, total, correctCount, onComplete]);

  const answerChoice = useCallback((i: number) => {
    if (picked !== null || item.kind !== "choice") return;
    setPicked(i);
    const ok = i === item.answerIndex;
    if (ok) setCorrectCount((c) => c + 1);
    onAnswer(item.id, ok);
  }, [picked, item, onAnswer]);

  const selfGrade = useCallback((ok: boolean) => {
    if (item.kind !== "reveal") return;
    if (ok) setCorrectCount((c) => c + 1);
    onAnswer(item.id, ok);
    next();
  }, [item, onAnswer, next]);

  const pct = useMemo(() => (total ? Math.round((correctCount / total) * 100) : 0), [correctCount, total]);

  if (finished) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-5xl">{pct >= 80 ? "🏆" : pct >= 60 ? "👍" : "💪"}</p>
        <h2 className="mt-3 text-xl font-bold text-slate-800"><T>本关完成!</T></h2>
        <p className="mt-1 text-sm text-slate-500">
          <T>答对</T> {correctCount}/{total} · {pct}%
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pb-28 pt-4">
      {header}
      {/* 进度 */}
      <div className="mb-4 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-sky-500 transition-all" style={{ width: `${((idx) / total) * 100}%` }} />
        </div>
        <span className="text-xs font-semibold text-slate-400">{idx + 1}/{total}</span>
      </div>

      {item.kind === "choice" ? (
        <section>
          <div className="mb-4 flex items-start gap-2">
            <p className="flex-1 text-lg font-semibold leading-relaxed text-slate-800">{item.stem}</p>
            {speakStem && (
              <button type="button" aria-label="朗读题干"
                onClick={() => { unlockAmericanAudio(); void speakUS(item.stem); }}
                className="mt-1 inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                <Volume2 className="size-4" />
              </button>
            )}
          </div>
          <div className="grid gap-2.5">
            {item.options.map((opt, i) => {
              const isAns = i === item.answerIndex;
              const isPicked = picked === i;
              let cls = "border-slate-200 bg-white text-slate-700 hover:border-sky-300";
              if (picked !== null) {
                if (isAns) cls = "border-emerald-400 bg-emerald-50 text-emerald-700";
                else if (isPicked) cls = "border-rose-300 bg-rose-50 text-rose-600";
                else cls = "border-slate-200 bg-white text-slate-400";
              }
              return (
                <button key={i} type="button" disabled={picked !== null} onClick={() => answerChoice(i)}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-[15px] transition ${cls}`}>
                  <span>{opt}</span>
                  {picked !== null && isAns && <Check className="size-4 shrink-0 text-emerald-600" />}
                  {picked !== null && isPicked && !isAns && <X className="size-4 shrink-0 text-rose-500" />}
                </button>
              );
            })}
          </div>
          {picked !== null && (
            <button type="button" onClick={next}
              className="mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-sky-600 py-3 text-sm font-semibold text-white">
              {idx + 1 >= total ? <T>完成本关</T> : <><T>下一题</T> <ChevronRight className="size-4" /></>}
            </button>
          )}
        </section>
      ) : (
        <section>
          <p className="mb-4 text-lg font-semibold leading-relaxed text-slate-800">{item.prompt}</p>
          {!revealed ? (
            <button type="button" onClick={() => setRevealed(true)}
              className="inline-flex w-full items-center justify-center rounded-full border border-sky-300 bg-sky-50 py-3 text-sm font-semibold text-sky-700">
              <T>显示参考答案</T>
            </button>
          ) : (
            <>
              <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                <span className="text-[15px] font-semibold text-emerald-800">{item.answer}</span>
                <button type="button" aria-label="朗读答案"
                  onClick={() => { unlockAmericanAudio(); void speakUS(item.answer); }}
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <Volume2 className="size-4" />
                </button>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <button type="button" onClick={() => selfGrade(false)}
                  className="rounded-full border border-slate-200 py-3 text-sm font-semibold text-slate-500">
                  <T>没答对</T>
                </button>
                <button type="button" onClick={() => selfGrade(true)}
                  className="rounded-full bg-emerald-600 py-3 text-sm font-semibold text-white">
                  <T>我答对了</T>
                </button>
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}
