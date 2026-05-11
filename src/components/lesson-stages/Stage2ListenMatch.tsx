import { useEffect, useState } from "react";
import { Volume2, Check, X } from "lucide-react";
import { speak } from "@/lib/speak";
import { pickPhrase } from "@/data/sparkPhrases";
import type { Stage2Question } from "@/data/g2LessonStages";

export default function Stage2ListenMatch({ questions, onComplete }: { questions: Stage2Question[]; onComplete: () => void }) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const q = questions[i];

  useEffect(() => {
    setPicked(null);
    setFeedback(null);
    const t = setTimeout(() => speak(q.audio_word), 250);
    return () => clearTimeout(t);
  }, [i, q.audio_word]);

  function pick(opt: string) {
    if (picked) return;
    setPicked(opt);
    if (opt === q.correct_emoji) {
      setFeedback(pickPhrase("correct"));
      setTimeout(() => {
        if (i < questions.length - 1) setI(i + 1);
        else onComplete();
      }, 850);
    } else {
      setFeedback(pickPhrase("wrong"));
      setTimeout(() => {
        setPicked(null);
        setFeedback(null);
        speak(q.audio_word);
      }, 1500);
    }
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="text-xs font-bold text-muted-foreground">已答 {i} / {questions.length}</div>
      <button
        onClick={() => speak(q.audio_word)}
        className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-base font-extrabold text-primary-foreground shadow-tile hover:-translate-y-0.5"
      >
        <Volume2 className="size-5" /> 点我听一次
      </button>

      <div className="grid w-full grid-cols-2 gap-3">
        {q.options.map((opt) => {
          const isPicked = picked === opt;
          const isCorrect = opt === q.correct_emoji;
          const showCorrect = isPicked && isCorrect;
          const showWrong = isPicked && !isCorrect;
          return (
            <button
              key={opt}
              onClick={() => pick(opt)}
              className={`relative flex aspect-square items-center justify-center rounded-3xl border-4 text-7xl shadow-tile transition ${
                showCorrect
                  ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
                  : showWrong
                  ? "border-rose-400 bg-rose-50 dark:bg-rose-950/40"
                  : "border-border bg-card hover:-translate-y-0.5"
              }`}
            >
              {opt}
              {showCorrect && <Check className="absolute right-2 top-2 size-6 text-emerald-500" />}
              {showWrong && <X className="absolute right-2 top-2 size-6 text-rose-500" />}
            </button>
          );
        })}
      </div>

      {feedback && (
        <div className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-bold">
          <span className="text-xl">🦊</span> {feedback}
        </div>
      )}
    </div>
  );
}