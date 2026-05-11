import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { speak } from "@/lib/speak";
import { pickPhrase } from "@/data/sparkPhrases";
import type { Stage3Question } from "@/data/g2LessonStages";

export default function Stage3SeeMatch({ questions, onComplete }: { questions: Stage3Question[]; onComplete: () => void }) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const q = questions[i];

  useEffect(() => {
    setPicked(null);
    setFeedback(null);
  }, [i]);

  function pick(opt: string) {
    if (picked) return;
    setPicked(opt);
    if (opt === q.correct_word) {
      speak(opt);
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
      }, 1500);
    }
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="text-xs font-bold text-muted-foreground">已答 {i} / {questions.length}</div>
      <div className="flex h-44 w-full items-center justify-center rounded-3xl border-2 border-border bg-gradient-to-br from-amber-50 to-orange-100 text-[120px] shadow-tile dark:from-amber-950/40 dark:to-orange-950/40">
        {q.image_emoji}
      </div>

      <div className="flex w-full flex-col gap-2">
        {q.options.map((opt) => {
          const isPicked = picked === opt;
          const isCorrect = opt === q.correct_word;
          const showCorrect = isPicked && isCorrect;
          const showWrong = isPicked && !isCorrect;
          return (
            <button
              key={opt}
              onClick={() => pick(opt)}
              className={`flex items-center justify-between rounded-2xl border-4 px-5 py-4 text-lg font-extrabold shadow-tile transition ${
                showCorrect
                  ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
                  : showWrong
                  ? "border-rose-400 bg-rose-50 dark:bg-rose-950/40"
                  : "border-border bg-card hover:-translate-y-0.5"
              }`}
            >
              <span>{opt}</span>
              {showCorrect && <Check className="size-5 text-emerald-500" />}
              {showWrong && <X className="size-5 text-rose-500" />}
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