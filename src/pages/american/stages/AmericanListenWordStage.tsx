/**
 * 关3 · 听音辨词。听美音 → 从 4 个单词里选出听到的那个。
 * 记 american_word_mastery(game=listen;与关2/4 共享词掌握)。
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { Volume2, Check, X, ChevronRight } from "lucide-react";
import { T } from "@/i18n/T";
import { speakUS, unlockAmericanAudio, prewarmUS } from "@/lib/american/audio";
import { markStageComplete, recordWordMastery, type AmericanWord, type LessonBundle } from "@/lib/american/data";

function shuffle<X>(a: X[]): X[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
  return r;
}

export function AmericanListenWordStage({ bundle, onDone }: { bundle: LessonBundle; onDone?: () => void }) {
  const words = bundle.words;
  const unit = bundle.lesson.unit_no;

  const rounds = useMemo(() => {
    return shuffle(words).map((w) => {
      const distractors = shuffle(words.filter((x) => x.id !== w.id)).slice(0, 3);
      return { word: w, options: shuffle([w, ...distractors]) as AmericanWord[] };
    });
  }, [words]);

  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);

  const round = rounds[idx];

  // 进关预热全部生词音频 → 后续点喇叭永远命中缓存直接播(消除冷词首播竞态/iOS 静音)。
  useEffect(() => { prewarmUS(words.map((w) => w.word)); }, [words]);

  useEffect(() => { if (round && !done) void speakUS(round.word.word); }, [idx, round, done]);

  const pick = useCallback((wid: string) => {
    if (picked || !round) return;
    setPicked(wid);
    const ok = wid === round.word.id;
    if (ok) setCorrect((c) => c + 1);
    void recordWordMastery(round.word.id, unit, "listen", ok);
  }, [picked, round, unit]);

  const next = useCallback(() => {
    if (idx + 1 >= rounds.length) {
      void markStageComplete(bundle.lesson.id, 3);
      setDone(true);
      if (onDone) setTimeout(onDone, 1600);
    } else { setIdx((i) => i + 1); setPicked(null); }
  }, [idx, rounds.length, bundle.lesson.id, onDone]);

  if (done) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-5xl">🎧</p>
        <h2 className="mt-3 text-xl font-bold text-slate-800"><T>听音辨词完成!</T></h2>
        <p className="mt-1 text-sm text-slate-500"><T>答对</T> {correct}/{rounds.length}</p>
      </div>
    );
  }
  if (!round) return <p className="py-16 text-center text-sm text-slate-400"><T>本课暂无生词</T></p>;

  const allHaveMeaning = round.options.every((o) => !!o.meaning_cn);

  return (
    <div className="mx-auto max-w-2xl px-4 pb-28 pt-4">
      <div className="mb-4 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-sky-500 transition-all" style={{ width: `${(idx / rounds.length) * 100}%` }} />
        </div>
        <span className="text-xs font-semibold text-slate-400">{idx + 1}/{rounds.length}</span>
      </div>

      <div className="mb-6 flex flex-col items-center">
        <button type="button" aria-label="播放单词"
          onClick={() => { unlockAmericanAudio(); void speakUS(round.word.word); }}
          className="inline-flex size-20 items-center justify-center rounded-full bg-sky-600 text-white shadow-lg transition hover:scale-105">
          <Volume2 className="size-8" />
        </button>
        <p className="mt-2 text-xs text-slate-400"><T>点击重听</T></p>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {round.options.map((o) => {
          const isAns = o.id === round.word.id;
          // 全部选项都有释义→答后每项都显中文;有任一项查不到→降级只显正确项释义(不报错)
          const showMeaning = !!picked && !!o.meaning_cn && (allHaveMeaning || isAns);
          const isPicked = picked === o.id;
          let cls = "border-slate-200 bg-white text-slate-700 hover:border-sky-300";
          if (picked) {
            if (isAns) cls = "border-emerald-400 bg-emerald-50 text-emerald-700";
            else if (isPicked) cls = "border-rose-300 bg-rose-50 text-rose-600";
            else cls = "border-slate-200 bg-white text-slate-400";
          }
          return (
            <button key={o.id} type="button" disabled={!!picked} onClick={() => pick(o.id)}
              className={`flex flex-col rounded-xl border px-4 py-3 text-left text-base font-medium transition ${cls}`}>
              <span className="flex w-full items-center justify-between">
                <span>{o.word}</span>
                {picked && isAns && <Check className="size-4 text-emerald-600" />}
                {picked && isPicked && !isAns && <X className="size-4 text-rose-500" />}
              </span>
              {showMeaning && (
                <span className="mt-0.5 text-xs font-normal opacity-80">{o.meaning_cn}</span>
              )}
            </button>
          );
        })}
      </div>

      {picked && (
        <button type="button" onClick={next}
          className="mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-sky-600 py-3 text-sm font-semibold text-white">
          {idx + 1 >= rounds.length ? <T>完成本关</T> : <><T>下一题</T> <ChevronRight className="size-4" /></>}
        </button>
      )}
    </div>
  );
}
