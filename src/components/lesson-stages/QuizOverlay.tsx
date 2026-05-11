import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { pickPhrase } from "@/data/sparkPhrases";
import { useSparkMood } from "@/contexts/SparkMoodContext";
import { useCombo } from "@/contexts/ComboContext";

type Props = {
  question: string;
  correct: string;
  options: string[];
  onCorrect: () => void;
  onWrong?: () => void; // e.g. replay audio
  maxRetries?: number;
};

export default function QuizOverlay({
  question,
  correct,
  options,
  onCorrect,
  onWrong,
  maxRetries = 2,
}: Props) {
  const { setMood } = useSparkMood();
  const { bump } = useCombo();
  const [picked, setPicked] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [tries, setTries] = useState(0);
  const [feedback, setFeedback] = useState<string>("");
  const [forceReveal, setForceReveal] = useState(false);

  useEffect(() => {
    setPicked(null);
    setLocked(false);
    setTries(0);
    setFeedback("");
    setForceReveal(false);
  }, [question, correct]);

  function handlePick(opt: string) {
    if (locked) return;
    setPicked(opt);
    setLocked(true);
    if (opt === correct) {
      setFeedback(pickPhrase("correct"));
      setMood("excited", 1200);
      bump(true);
      window.setTimeout(() => onCorrect(), 800);
      return;
    }
    const nextTries = tries + 1;
    setTries(nextTries);
    if (nextTries >= maxRetries) {
      setFeedback("正确答案是 👇");
      setForceReveal(true);
      setMood("encouraging", 1400);
      bump(false);
      window.setTimeout(() => onCorrect(), 1400);
      return;
    }
    setFeedback("差一点,再听一次?");
    setMood("encouraging", 1500);
    bump(false);
    onWrong?.();
    window.setTimeout(() => {
      setPicked(null);
      setLocked(false);
      setFeedback("");
    }, 1500);
  }

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center rounded-3xl bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-card p-5 shadow-tile">
        <div className="mb-4 flex items-center gap-2">
          <span className="text-2xl">🦊</span>
          <div className="text-base font-bold text-foreground">{question}</div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {options.map((opt) => {
            const isCorrectAns = opt === correct;
            const isPicked = picked === opt;
            const showGreen = (isPicked && isCorrectAns) || (forceReveal && isCorrectAns);
            const showRed = isPicked && !isCorrectAns;
            return (
              <button
                key={opt}
                onClick={() => handlePick(opt)}
                disabled={locked}
                className={`relative rounded-xl border-2 px-3 py-3 text-sm font-bold transition ${
                  showGreen
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                    : showRed
                    ? "border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                    : "border-border bg-background hover:-translate-y-0.5"
                } disabled:cursor-not-allowed`}
              >
                {opt}
                {showGreen && <Check className="absolute right-1 top-1 size-4" />}
                {showRed && <X className="absolute right-1 top-1 size-4" />}
              </button>
            );
          })}
        </div>
        {feedback && (
          <div className="mt-3 text-center text-sm font-bold text-muted-foreground">
            {feedback}
          </div>
        )}
      </div>
    </div>
  );
}