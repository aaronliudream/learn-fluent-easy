import { useEffect, useRef, useState } from "react";
import { useRevealScroll } from "@/lib/useRevealScroll";
import { ChevronRight, HelpCircle } from "lucide-react";
import type { Stage4Sentence } from "@/data/g2LessonStages";
import { stopSpeaking } from "@/lib/speak";
import QuizOverlay from "./QuizOverlay";
import KaraokeText from "@/components/KaraokeText";

export default function Stage4SentenceListen({ sentences, onComplete }: { sentences: Stage4Sentence[]; onComplete: () => void }) {
  const [i, setI] = useState(0);
  const [phase, setPhase] = useState<"listen" | "quiz" | "revealed">("listen");
  // 选完答案后把操作区滚进视口(手机上它常在选项下方屏外)
  const actionRef = useRevealScroll<HTMLButtonElement>(phase === "revealed");
  const playKey = useRef(0);
  const s = sentences[i];

  useEffect(() => {
    setPhase("listen");
    playKey.current += 1;
  }, [i]);

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="text-xs font-bold text-muted-foreground">{i + 1} / {sentences.length}</div>
      {s.scene_hint && (
        <div className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">
          · {s.scene_hint}
        </div>
      )}
      <div className="relative w-full rounded-3xl border-2 border-border bg-card p-6 text-center shadow-tile">
        <KaraokeText
          key={playKey.current}
          text={s.en}
          cn={phase === "revealed" ? s.cn : undefined}
          autoPlay
          size="lg"
        />
        {phase === "quiz" && (
          <QuizOverlay
            question={s.quiz.question}
            correct={s.quiz.correct}
            options={s.quiz.options}
            onCorrect={() => setPhase("revealed")}
            onWrong={() => { playKey.current += 1; }}
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
          ref={actionRef}
          onClick={() => (i < sentences.length - 1 ? setI(i + 1) : onComplete())}
          className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-pink-500 to-amber-500 px-5 py-2 text-sm font-extrabold text-white shadow-tile"
        >
          {i < sentences.length - 1 ? "下一句" : "进入下一关"} <ChevronRight className="size-4" />
        </button>
      )}
    </div>
  );
}