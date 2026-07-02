/**
 * 关6 · 美语点睛。先看美语 vs 英语对照卡(完成度),再做 stage6 小测(掌握度)。
 */
import { useCallback, useMemo, useState } from "react";
import { Volume2, ArrowRight } from "lucide-react";
import { T } from "@/i18n/T";
import { QuizRunner, questionsToItems } from "@/components/american/QuizRunner";
import { speakUS, unlockAmericanAudio } from "@/lib/american/audio";
import { markStageComplete, recordMastery, type LessonBundle } from "@/lib/american/data";

export function AmericanContrastStage({ bundle, onDone }: { bundle: LessonBundle; onDone?: () => void }) {
  const [phase, setPhase] = useState<"learn" | "quiz">("learn");
  const qs = useMemo(() => bundle.questions.filter((q) => q.stage === 6), [bundle]);
  const items = useMemo(() => questionsToItems(qs), [qs]);

  const onAnswer = useCallback((id: string, ok: boolean) => { void recordMastery("am_question", id, ok); }, []);
  const onComplete = useCallback(() => {
    void markStageComplete(bundle.lesson.id, 6);
    if (onDone) setTimeout(onDone, 1400);
  }, [bundle.lesson.id, onDone]);

  if (phase === "quiz") return <QuizRunner items={items} onAnswer={onAnswer} onComplete={onComplete} />;

  return (
    <div className="mx-auto max-w-2xl px-4 pb-28 pt-4">
      <header className="mb-4">
        <h1 className="text-lg font-bold text-slate-800">🇺🇸 <T>美语点睛</T></h1>
        <p className="mt-0.5 text-sm text-slate-500"><T>看看这些地道美式说法,和英式有何不同</T></p>
      </header>
      <div className="space-y-2.5">
        {bundle.contrast.map((c) => (
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
        ))}
      </div>
      <button type="button" onClick={() => setPhase("quiz")}
        className="mt-6 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-sky-600 py-3 text-sm font-semibold text-white">
        <T>开始小测</T> <ArrowRight className="size-4" />
      </button>
    </div>
  );
}
