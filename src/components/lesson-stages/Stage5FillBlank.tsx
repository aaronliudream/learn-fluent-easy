import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { pickPhrase } from "@/data/sparkPhrases";
import type { Stage5Question } from "@/data/g2LessonStages";
import KaraokeText from "@/components/KaraokeText";

export default function Stage5FillBlank({ questions, onComplete }: { questions: Stage5Question[]; onComplete: () => void }) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const q = questions[i];

  useEffect(() => {
    setPicked(null);
    setRevealed(false);
    setFeedback(null);
  }, [i]);

  function pick(opt: string) {
    if (picked) return;
    setPicked(opt);
    setRevealed(true);
    const ok = opt === q.correct;
    setFeedback(ok ? pickPhrase("correct") : `差一点!正确是 "${q.correct}"`);
    setTimeout(() => {
      if (i < questions.length - 1) setI(i + 1);
      else onComplete();
    }, ok ? 1800 : 2400);
  }

  const display = revealed
    ? q.sentence_with_blank.replace("___", q.correct)
    : q.sentence_with_blank;

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="text-xs font-bold text-muted-foreground">{i + 1} / {questions.length}</div>
      <div className="w-full rounded-3xl border-2 border-border bg-card p-6 text-center shadow-tile">
        <div className="text-sm text-muted-foreground">{q.cn}</div>
        <div className="mt-3 text-2xl font-extrabold leading-relaxed md:text-3xl">
          {revealed ? (
            <span>
              {q.sentence_with_blank.split("___")[0]}
              <span className="rounded-md bg-sky-100 px-2 text-sky-600 dark:bg-sky-950/40 dark:text-sky-300">{q.correct}</span>
              {q.sentence_with_blank.split("___")[1]}
            </span>
          ) : (
            display
          )}
        </div>
        {revealed && (
          <div className="mt-4">
            <KaraokeText
              key={`k-${i}`}
              text={q.sentence_with_blank.replace("___", q.correct)}
              autoPlay
              size="sm"
            />
          </div>
        )}
      </div>

      <div className="grid w-full grid-cols-2 gap-3">
        {q.options.map((opt) => {
          const isPicked = picked === opt;
          const isCorrect = opt === q.correct;
          const showCorrect = revealed && isCorrect;
          const showWrong = revealed && isPicked && !isCorrect;
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