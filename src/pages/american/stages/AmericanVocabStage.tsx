/**
 * 关2 · 核心词汇。生词卡:看英文(美音)→ 回忆 → 翻卡看释义/例句 → 自评"认识/不认识"。
 * 记 american_word_mastery(game=quiz;三关共享词掌握,答对2次=掌握)。
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { Volume2, RotateCcw } from "lucide-react";
import { T } from "@/i18n/T";
import { speakUS, unlockAmericanAudio } from "@/lib/american/audio";
import { markStageComplete, recordWordMastery, type LessonBundle } from "@/lib/american/data";

export function AmericanVocabStage({ bundle, onDone }: { bundle: LessonBundle; onDone?: () => void }) {
  const words = bundle.words;
  const unit = bundle.lesson.unit_no;
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const [done, setDone] = useState(false);

  const w = words[idx];

  // 每张卡出现时自动朗读一次
  useEffect(() => {
    if (!w || done) return;
    void speakUS(w.word);
  }, [idx, w, done]);

  const grade = useCallback((ok: boolean) => {
    if (!w) return;
    void recordWordMastery(w.id, unit, "quiz", ok);
    if (ok) setKnown((k) => k + 1);
    if (idx + 1 >= words.length) {
      void markStageComplete(bundle.lesson.id, 2);
      setDone(true);
      if (onDone) setTimeout(onDone, 1600);
    } else {
      setIdx((i) => i + 1);
      setFlipped(false);
    }
  }, [w, unit, idx, words.length, bundle.lesson.id, onDone]);

  if (done) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-5xl">🎉</p>
        <h2 className="mt-3 text-xl font-bold text-slate-800"><T>词汇学完!</T></h2>
        <p className="mt-1 text-sm text-slate-500"><T>认识</T> {known}/{words.length}</p>
      </div>
    );
  }
  if (!w) return <p className="py-16 text-center text-sm text-slate-400"><T>本课暂无生词</T></p>;

  return (
    <div className="mx-auto max-w-2xl px-4 pb-28 pt-4">
      <div className="mb-4 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-sky-500 transition-all" style={{ width: `${(idx / words.length) * 100}%` }} />
        </div>
        <span className="text-xs font-semibold text-slate-400">{idx + 1}/{words.length}</span>
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-sm">
        <div className="flex items-center justify-center gap-2">
          <span className="text-2xl font-bold text-slate-900">{w.word}</span>
          <button type="button" aria-label="朗读单词"
            onClick={() => { unlockAmericanAudio(); void speakUS(w.word); }}
            className="inline-flex size-9 items-center justify-center rounded-full bg-sky-100 text-sky-600">
            <Volume2 className="size-4" />
          </button>
        </div>
        {w.ipa && <p className="mt-1 text-sm text-slate-400">{w.ipa}{w.pos ? ` · ${w.pos}` : ""}</p>}

        {flipped ? (
          <div className="mt-5 border-t border-slate-100 pt-5">
            <p className="text-lg font-semibold text-slate-800">{w.meaning_cn}</p>
            {w.example && <p className="mt-2 text-sm text-slate-500">{w.example}</p>}
          </div>
        ) : (
          <button type="button" onClick={() => setFlipped(true)}
            className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-sky-300 bg-sky-50 px-5 py-2.5 text-sm font-semibold text-sky-700">
            <RotateCcw className="size-4" /> <T>翻卡看释义</T>
          </button>
        )}
      </div>

      {flipped && (
        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <button type="button" onClick={() => grade(false)}
            className="rounded-full border border-slate-200 py-3 text-sm font-semibold text-slate-500">
            <T>不认识</T>
          </button>
          <button type="button" onClick={() => grade(true)}
            className="rounded-full bg-emerald-600 py-3 text-sm font-semibold text-white">
            <T>认识</T>
          </button>
        </div>
      )}
    </div>
  );
}
