import { useEffect, useRef, useState } from "react";
import { Volume2, ChevronRight, HelpCircle } from "lucide-react";
import type { Stage4Sentence } from "@/data/g2LessonStages";
import { speak, stopSpeaking } from "@/lib/speak";
import QuizOverlay from "./QuizOverlay";

/** Approximate per-word duration for Karaoke highlight when using MP3 TTS. */
const MS_PER_WORD = 360;

export default function Stage4SentenceListen({ sentences, onComplete }: { sentences: Stage4Sentence[]; onComplete: () => void }) {
  const [i, setI] = useState(0);
  const [activeWord, setActiveWord] = useState(-1);
  const [phase, setPhase] = useState<"listen" | "quiz" | "revealed">("listen");
  const playedRef = useRef(false);
  const timersRef = useRef<number[]>([]);
  const s = sentences[i];
  const words = s.en.split(/(\s+)/);
  const wordCount = s.en.trim().split(/\s+/).length;

  function clearTimers() {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  }

  function play() {
    clearTimers();
    stopSpeaking();
    setActiveWord(0);
    // Schedule per-word highlight progression. Approximate timing — good
    // enough for 5–10 word sentences and lets us use high-quality MP3 TTS.
    for (let w = 1; w < wordCount; w++) {
      const id = window.setTimeout(() => setActiveWord(w), w * MS_PER_WORD);
      timersRef.current.push(id);
    }
    const endId = window.setTimeout(() => setActiveWord(-1), wordCount * MS_PER_WORD + 400);
    timersRef.current.push(endId);
    void speak(s.en);
  }

  useEffect(() => {
    setPhase("listen");
    setActiveWord(-1);
    playedRef.current = false;
    const t = setTimeout(() => {
      if (!playedRef.current) {
        playedRef.current = true;
        play();
      }
    }, 300);
    return () => {
      clearTimeout(t);
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  useEffect(() => {
    return () => {
      clearTimers();
      stopSpeaking();
    };
  }, []);

  let wordIdx = -1;

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="text-xs font-bold text-muted-foreground">{i + 1} / {sentences.length}</div>
      {s.scene_hint && (
        <div className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">
          · {s.scene_hint}
        </div>
      )}
      <div className="relative w-full rounded-3xl border-2 border-border bg-card p-6 text-center shadow-tile">
        <div className="text-2xl font-extrabold leading-relaxed md:text-3xl">
          {words.map((w, k) => {
            if (/^\s+$/.test(w)) return <span key={k}>{w}</span>;
            wordIdx += 1;
            const isActive = wordIdx === activeWord;
            const isPast = activeWord >= 0 && wordIdx < activeWord;
            return (
              <span
                key={k}
                className={`inline-block transition-all ${
                  isActive
                    ? "scale-110 text-orange-500"
                    : isPast
                    ? "text-foreground"
                    : "text-muted-foreground/50"
                }`}
              >
                {w}
              </span>
            );
          })}
        </div>
        {phase === "revealed" && (
          <div className="mt-3 text-base font-bold text-foreground">{s.cn}</div>
        )}
        <button
          onClick={play}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground shadow-tile"
        >
          <Volume2 className="size-4" /> 重听
        </button>
        {phase === "quiz" && (
          <QuizOverlay
            question={s.quiz.question}
            correct={s.quiz.correct}
            options={s.quiz.options}
            onCorrect={() => setPhase("revealed")}
            onWrong={() => play()}
          />
        )}
      </div>

      {phase === "listen" && (
        <button
          onClick={() => setPhase("quiz")}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2 text-sm font-extrabold text-white shadow-tile"
        >
          <HelpCircle className="size-4" /> 我听完了 → 答题
        </button>
      )}
      {phase === "revealed" && (
        <button
          onClick={() => (i < sentences.length - 1 ? setI(i + 1) : onComplete())}
          className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-pink-500 to-amber-500 px-5 py-2 text-sm font-extrabold text-white shadow-tile"
        >
          {i < sentences.length - 1 ? "下一句" : "进入下一关"} <ChevronRight className="size-4" />
        </button>
      )}
    </div>
  );
}