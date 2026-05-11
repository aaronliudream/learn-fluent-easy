import { T } from "@/i18n/T";import { useEffect, useState } from "react";
import { ArrowLeft, Volume2, VolumeX } from "lucide-react";
import Stage1WatchListen from "./lesson-stages/Stage1WatchListen";
import Stage2ListenMatch from "./lesson-stages/Stage2ListenMatch";
import Stage3SeeMatch from "./lesson-stages/Stage3SeeMatch";
import Stage4SentenceListen from "./lesson-stages/Stage4SentenceListen";
import Stage5FillBlank from "./lesson-stages/Stage5FillBlank";
import { pickPhrase } from "@/data/sparkPhrases";
import type { LessonStages } from "@/data/g2LessonStages";
import { prefetchTTSBatch } from "@/lib/speak";
import SparkBubble from "./SparkBubble";
import { SparkMoodProvider, useSparkMood } from "@/contexts/SparkMoodContext";
import { ComboProvider } from "@/contexts/ComboContext";
import { isSfxEnabled, setSfxEnabled, playSfx } from "@/lib/soundEffects";

const STAGE_NAMES = ["看 + 听", "听音配图", "看图配词", "听句子", "填空小测"] as const;

export default function LessonStageEngine(props: {
  lesson_id: string;
  stages: LessonStages;
  onExit: () => void;
  onComplete: () => void;
}) {
  return (
    <SparkMoodProvider initial="curious">
      <ComboProvider>
        <LessonStageEngineInner {...props} />
      </ComboProvider>
    </SparkMoodProvider>);

}

function LessonStageEngineInner({
  lesson_id,
  stages,
  onExit,
  onComplete





}: {lesson_id: string;stages: LessonStages;onExit: () => void;onComplete: () => void;}) {
  const { mood, setMood } = useSparkMood();
  const [current, setCurrent] = useState<number>(() => {
    try {
      const v = sessionStorage.getItem(`lessonStage:${lesson_id}`);
      return v ? Math.min(5, Math.max(1, Number(v))) : 1;
    } catch {
      return 1;
    }
  });
  const [muted, setMuted] = useState<boolean>(() => !isSfxEnabled());
  const [stageDoneToast, setStageDoneToast] = useState<string | null>(null);

  // Warm the TTS cache for ALL audio in this lesson the moment the
  // engine mounts. Otherwise the first auto-play in each stage waits
  // on the edge-function round-trip (cold cache = 1-3s delay).
  useEffect(() => {
    const phrases: string[] = [];
    stages.stage1.forEach((c) => {
      phrases.push(c.word);
      if (c.example_en) phrases.push(c.example_en);
    });
    stages.stage2.forEach((q) => phrases.push(q.audio_word));
    stages.stage3.forEach((q) => phrases.push(q.correct_word));
    stages.stage4.forEach((s) => phrases.push(s.en));
    prefetchTTSBatch(phrases);
  }, [stages]);

  useEffect(() => {
    try {
      sessionStorage.setItem(`lessonStage:${lesson_id}`, String(current));
    } catch {/* noop */}
    // Stage opening: curious for 1.5s
    setMood("curious", 1500);
  }, [current, lesson_id, setMood]);

  useEffect(() => {
    if (muted && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSfxEnabled(!muted);
  }, [muted]);

  function nextStage() {
    setStageDoneToast(pickPhrase("stageComplete"));
    setTimeout(() => setStageDoneToast(null), 1200);
    setMood("celebrating", 1400);
    playSfx(current >= 5 ? "complete" : "correct");
    if (current < 5) setCurrent(current + 1);else
    {
      try {sessionStorage.removeItem(`lessonStage:${lesson_id}`);} catch {/* noop */}
      playSfx("complete");
      onComplete();
    }
  }

  const pct = Math.round((current - 1) / 5 * 100);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <button onClick={onExit} aria-label="退出" className="rounded-full p-2 hover:bg-secondary">
            <ArrowLeft className="size-5" />
          </button>
          <SparkBubble mood={mood} size="sm" />
          <div className="flex-1">
            <div className="flex items-center gap-2 text-xs font-bold">
              <span><T>关</T> {current}/5 · {STAGE_NAMES[current - 1]}</span>
            </div>
            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-amber-500 transition-all"
                style={{ width: `${pct + 20}%` }} />
              
            </div>
          </div>
          <button
            onClick={() => setMuted((m) => !m)}
            aria-label={muted ? "取消静音" : "静音"}
            className="rounded-full p-2 hover:bg-secondary">
            
            {muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6 pb-24">
        {current === 1 && <Stage1WatchListen cards={stages.stage1} onComplete={nextStage} />}
        {current === 2 && <Stage2ListenMatch questions={stages.stage2} onComplete={nextStage} />}
        {current === 3 && <Stage3SeeMatch questions={stages.stage3} onComplete={nextStage} />}
        {current === 4 && <Stage4SentenceListen sentences={stages.stage4} onComplete={nextStage} />}
        {current === 5 && <Stage5FillBlank questions={stages.stage5} onComplete={nextStage} />}
      </main>

      {stageDoneToast &&
      <div className="fixed left-1/2 top-20 z-40 -translate-x-1/2 rounded-full bg-foreground/90 px-5 py-2 text-sm font-extrabold text-background shadow-lg">
          🦊 {stageDoneToast}
        </div>
      }
    </div>);

}