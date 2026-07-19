/**
 * 关6 · 美语点睛。先看卡片(完成度),再做 stage6 小测(掌握度)。
 * 方案A改良:同一张 american_amencontrast 表混装两种卡,按该条有无 example1 切换渲染:
 *   有 example1 → 语块卡(chunk + 音标 + 中文 + 2 例句);无 → 美英对照卡(us / uk / note_cn)。
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { Volume2, ArrowRight } from "lucide-react";
import { T } from "@/i18n/T";
import { QuizRunner, questionsToItems } from "@/components/american/QuizRunner";
import { speakUS, unlockAmericanAudio, prewarmUS } from "@/lib/american/audio";
import { markStageComplete, recordMastery, type LessonBundle } from "@/lib/american/data";
import { recordAmericanMistake, americanLessonLabel } from "@/lib/american/americanMistake";

export function AmericanContrastStage({ bundle, onDone }: { bundle: LessonBundle; onDone?: () => void }) {
  const [phase, setPhase] = useState<"learn" | "quiz">("learn");
  const qs = useMemo(() => bundle.questions.filter((q) => q.stage === 6), [bundle]);
  const items = useMemo(() => questionsToItems(qs), [qs]);

  // 进关预热美语说法(us)+语块例句音频 → 点喇叭直接播;新语块例句(从未播过)也借此触发 edge 现合成回填 CDN。
  useEffect(() => {
    prewarmUS(bundle.contrast.flatMap((c) => [c.us, c.example1, c.example2]));
  }, [bundle.contrast]);

  const onAnswer = useCallback((id: string, ok: boolean) => { void recordMastery("am_question", id, ok); }, []);
  const onComplete = useCallback(() => {
    void markStageComplete(bundle.lesson.id, 6);
    if (onDone) setTimeout(onDone, 1400);
  }, [bundle.lesson.id, onDone]);

  const label = americanLessonLabel(bundle.lesson);
  if (phase === "quiz") return <QuizRunner items={items} onAnswer={onAnswer} onComplete={onComplete}
    onRecordMistake={(it, picked, ok) => recordAmericanMistake(it, picked, ok, label)} />;

  return (
    <div className="mx-auto max-w-2xl px-4 pb-28 pt-4">
      <header className="mb-4">
        <h1 className="text-lg font-bold text-slate-800">🇺🇸 <T>美语点睛</T></h1>
        <p className="mt-0.5 text-sm text-slate-500"><T>地道美式说法与常用语块,一起积累</T></p>
      </header>
      <div className="space-y-2.5">
        {bundle.contrast.map((c) =>
          c.example1 ? (
            // 语块卡:chunk(us) + 音标(ipa) + 中文(note_cn) + 最多 2 例句
            <div key={c.id} className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">💬 <T>语块</T></span>
                <span className="flex-1 text-[15px] font-semibold text-slate-800">{c.us}</span>
                <button type="button" aria-label="朗读语块"
                  onClick={() => { unlockAmericanAudio(); void speakUS(c.us); }}
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                  <Volume2 className="size-4" />
                </button>
              </div>
              {c.ipa && <p className="mt-1 text-sm text-slate-400">{c.ipa}</p>}
              {c.note_cn && <p className="mt-1 text-sm text-slate-600">{c.note_cn}</p>}
              <div className="mt-2.5 space-y-2 border-t border-slate-100 pt-2.5">
                {[[c.example1, c.example1_cn], [c.example2, c.example2_cn]]
                  .filter(([en]) => en)
                  .map(([en, cn], i) => (
                    <div key={i} className="text-sm">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-700">{en}</span>
                        <button type="button" aria-label="朗读例句"
                          onClick={() => { unlockAmericanAudio(); void speakUS(en as string); }}
                          className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-500">
                          <Volume2 className="size-3.5" />
                        </button>
                      </div>
                      {cn && <div className="mt-0.5 text-[13px] text-slate-400">{cn}</div>}
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            // 美英对照卡:us / uk / note_cn(原样)
            <div key={c.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-sky-100 px-2 py-0.5 text-xs font-bold text-sky-700">🇺🇸 US</span>
                <span className="flex-1 text-[15px] font-semibold text-slate-800">{c.us}</span>
                <button type="button" aria-label="朗读美语说法"
                  onClick={() => { unlockAmericanAudio(); void speakUS(c.us); }}
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-600">
                  <Volume2 className="size-4" />
                </button>
              </div>
              {c.uk && c.uk !== "—" && (
                <div className="mt-1.5 flex items-center gap-2 text-sm text-slate-400">
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold">🇬🇧 UK</span>
                  <span>{c.uk}</span>
                </div>
              )}
              {c.note_cn && <p className="mt-1.5 text-sm text-slate-500">{c.note_cn}</p>}
            </div>
          )
        )}
      </div>
      <button type="button" onClick={() => setPhase("quiz")}
        className="mt-6 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-sky-600 py-3 text-sm font-semibold text-white">
        <T>开始小测</T> <ArrowRight className="size-4" />
      </button>
    </div>
  );
}
