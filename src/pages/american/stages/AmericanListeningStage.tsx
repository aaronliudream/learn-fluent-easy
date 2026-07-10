/**
 * 关8 · 听对话答题。可反复重听本课对话(美音),再答 stage8 选择题。
 */
import { useCallback, useMemo, useRef, useState } from "react";
import { Play, Square } from "lucide-react";
import { T } from "@/i18n/T";
import { QuizRunner, questionsToItems } from "@/components/american/QuizRunner";
import { speakUS, stopSpeaking, unlockAmericanAudio } from "@/lib/american/audio";
import { markStageComplete, recordMastery, type LessonBundle } from "@/lib/american/data";
import { recordAmericanMistake, americanLessonLabel } from "@/lib/american/americanMistake";

export function AmericanListeningStage({ bundle, onDone }: { bundle: LessonBundle; onDone?: () => void }) {
  const qs = useMemo(() => bundle.questions.filter((q) => q.stage === 8), [bundle]);
  const items = useMemo(() => questionsToItems(qs), [qs]);
  const [playing, setPlaying] = useState(false);
  const seq = useRef(0);

  const playAll = useCallback(() => {
    unlockAmericanAudio();
    const my = ++seq.current;
    setPlaying(true);
    (async () => {
      for (const s of bundle.sentences) {
        if (my !== seq.current) return;
        await speakUS(s.text_en);
        if (my !== seq.current) return;
        await new Promise((r) => setTimeout(r, 120));
      }
      if (my === seq.current) setPlaying(false);
    })();
  }, [bundle.sentences]);

  const stop = useCallback(() => { seq.current++; stopSpeaking(); setPlaying(false); }, []);

  const onAnswer = useCallback((id: string, ok: boolean) => { void recordMastery("am_question", id, ok); }, []);
  const onComplete = useCallback(() => {
    seq.current++; stopSpeaking();
    void markStageComplete(bundle.lesson.id, 8);
    if (onDone) setTimeout(onDone, 1400);
  }, [bundle.lesson.id, onDone]);

  const header = (
    <div className="mb-4 rounded-2xl border border-sky-100 bg-sky-50/60 p-4">
      <p className="mb-2 text-sm font-semibold text-sky-800">🎧 <T>先听对话,再答题(可反复听)</T></p>
      {playing ? (
        <button type="button" onClick={stop}
          className="inline-flex items-center gap-1.5 rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white">
          <Square className="size-4" /> <T>停止</T>
        </button>
      ) : (
        <button type="button" onClick={playAll}
          className="inline-flex items-center gap-1.5 rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white">
          <Play className="size-4" /> <T>播放对话</T>
        </button>
      )}
    </div>
  );

  const label = americanLessonLabel(bundle.lesson);
  // 关8 听力单题无 payload.audio(音频=共享对话)→ 强制归 hub_listening,并存对话原文供错题本重听。
  const dialogueText = bundle.sentences.map((s) => s.text_en).join("\n");
  return <QuizRunner items={items} onAnswer={onAnswer} onComplete={onComplete}
    onRecordMistake={(it, picked, ok) => recordAmericanMistake(it, picked, ok, label, { forceModule: "hub_listening", audio: dialogueText })} speakStem header={header} />;
}
