/**
 * 关7 · 对话填空。展示挖空对话,逐空选词填入(选项为原文位置,不打散)。
 * 记 am_question(答对2次=掌握),全部作答 → 完成。
 */
import { useCallback, useMemo, useState } from "react";
import { Check, X, ChevronRight, Volume2 } from "lucide-react";
import { T } from "@/i18n/T";
import { speakUS, unlockAmericanAudio } from "@/lib/american/audio";
import { markStageComplete, recordMastery, type LessonBundle } from "@/lib/american/data";

export function AmericanClozeStage({ bundle, onDone }: { bundle: LessonBundle; onDone?: () => void }) {
  const blanks = useMemo(
    () => bundle.questions.filter((q) => q.stage === 7).sort((a, b) => (a.payload.blank_no ?? 0) - (b.payload.blank_no ?? 0)),
    [bundle],
  );
  const context = blanks[0]?.payload.context ?? "";

  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);

  const q = blanks[idx];
  const opts = q?.payload.options ?? [];
  const ans = q?.payload.answer_index ?? 0;

  const pick = useCallback((i: number) => {
    if (picked !== null || !q) return;
    setPicked(i);
    const ok = i === ans;
    if (ok) setCorrect((c) => c + 1);
    void recordMastery("am_question", q.id, ok);
  }, [picked, q, ans]);

  const next = useCallback(() => {
    if (idx + 1 >= blanks.length) {
      void markStageComplete(bundle.lesson.id, 7);
      setDone(true);
      if (onDone) setTimeout(onDone, 1600);
    } else { setIdx((i) => i + 1); setPicked(null); }
  }, [idx, blanks.length, bundle.lesson.id, onDone]);

  if (done) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-5xl">✏️</p>
        <h2 className="mt-3 text-xl font-bold text-slate-800"><T>对话填空完成!</T></h2>
        <p className="mt-1 text-sm text-slate-500"><T>答对</T> {correct}/{blanks.length}</p>
      </div>
    );
  }
  if (!q) return <p className="py-16 text-center text-sm text-slate-400"><T>本课暂无填空</T></p>;

  return (
    <div className="mx-auto max-w-2xl px-4 pb-28 pt-4">
      {/* 对话原文 */}
      {context && (
        <div className="mb-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">{context}</p>
        </div>
      )}
      <div className="mb-4 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-sky-500 transition-all" style={{ width: `${(idx / blanks.length) * 100}%` }} />
        </div>
        <span className="text-xs font-semibold text-slate-400">{idx + 1}/{blanks.length}</span>
      </div>

      <p className="mb-3 text-base font-semibold text-slate-800"><T>第</T> {q.payload.blank_no} <T>空,选择正确的词</T></p>
      <div className="grid gap-2.5">
        {opts.map((opt, i) => {
          const isAns = i === ans;
          const isPicked = picked === i;
          let cls = "border-slate-200 bg-white text-slate-700 hover:border-sky-300";
          if (picked !== null) {
            if (isAns) cls = "border-emerald-400 bg-emerald-50 text-emerald-700";
            else if (isPicked) cls = "border-rose-300 bg-rose-50 text-rose-600";
            else cls = "border-slate-200 bg-white text-slate-400";
          }
          return (
            <button key={i} type="button" disabled={picked !== null} onClick={() => pick(i)}
              className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-[15px] transition ${cls}`}>
              <span>{opt}</span>
              <span className="flex items-center gap-2">
                {picked !== null && isAns && (
                  <button type="button" aria-label="朗读" onClick={(e) => { e.stopPropagation(); unlockAmericanAudio(); void speakUS(opt); }}>
                    <Volume2 className="size-4 text-emerald-500" />
                  </button>
                )}
                {picked !== null && isAns && <Check className="size-4 text-emerald-600" />}
                {picked !== null && isPicked && !isAns && <X className="size-4 text-rose-500" />}
              </span>
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <button type="button" onClick={next}
          className="mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-sky-600 py-3 text-sm font-semibold text-white">
          {idx + 1 >= blanks.length ? <T>完成本关</T> : <><T>下一空</T> <ChevronRight className="size-4" /></>}
        </button>
      )}
    </div>
  );
}
