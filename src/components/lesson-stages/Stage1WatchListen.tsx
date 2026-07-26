import { useEffect, useState } from "react";
import { useRevealScroll } from "@/lib/useRevealScroll";
import { Volume2, ChevronRight, HelpCircle } from "lucide-react";
import { speak } from "@/lib/speak";
import type { Stage1Card } from "@/data/g2LessonStages";
import QuizOverlay from "./QuizOverlay";
import KaraokeText from "@/components/KaraokeText";

const BG = [
  "from-sky-50 to-cyan-100 dark:from-sky-950/40 dark:to-cyan-950/40",
  "from-amber-50 to-orange-100 dark:from-amber-950/40 dark:to-orange-950/40",
  "from-violet-50 to-fuchsia-100 dark:from-violet-950/40 dark:to-fuchsia-950/40",
  "from-emerald-50 to-teal-100 dark:from-emerald-950/40 dark:to-teal-950/40",
  "from-rose-50 to-pink-100 dark:from-rose-950/40 dark:to-pink-950/40",
  "from-indigo-50 to-blue-100 dark:from-indigo-950/40 dark:to-blue-950/40",
];

export default function Stage1WatchListen({ cards, onComplete }: { cards: Stage1Card[]; onComplete: () => void }) {
  const [i, setI] = useState(0);
  const [phase, setPhase] = useState<"listen" | "quiz" | "revealed">("listen");
  // 选完答案后把操作区滚进视口(手机上它常在选项下方屏外)
  const actionRef = useRevealScroll<HTMLButtonElement>(phase === "revealed");
  const card = cards[i];

  useEffect(() => {
    setPhase("listen");
    const t = setTimeout(() => speak(card.word), 250);
    return () => clearTimeout(t);
  }, [i, card.word]);

  function handleCorrect() {
    setPhase("revealed");
  }

  function next() {
    if (i < cards.length - 1) setI(i + 1);
    else onComplete();
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="text-xs font-bold text-muted-foreground">{i + 1} / {cards.length}</div>
      <div className={`relative w-full rounded-3xl border-2 border-border bg-gradient-to-br ${BG[i % BG.length]} p-8 text-center shadow-tile`}>
        <div className="text-[110px] leading-none">{card.emoji}</div>
        <div className="mt-4 text-3xl font-black text-foreground">{card.word}</div>
        <div className="mt-1 text-sm text-muted-foreground">{card.ipa}</div>
        {phase === "revealed" && (
          <>
            <div className="mt-3 text-xl font-bold text-foreground">{card.meaning_cn}</div>
            <div className="mt-4 rounded-xl bg-background/60 p-3">
              <KaraokeText text={card.example_en} cn={card.example_cn} size="sm" />
            </div>
          </>
        )}
        <button
          onClick={() => speak(card.word)}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground shadow-tile hover:-translate-y-0.5 transition"
        >
          <Volume2 className="size-4" /> 再听一次
        </button>

        {phase === "quiz" && (
          <QuizOverlay
            question={card.quiz.question}
            correct={card.quiz.correct}
            options={card.quiz.options}
            onCorrect={handleCorrect}
            onWrong={() => speak(card.word)}
          />
        )}
      </div>

      <div className="flex w-full items-center justify-end gap-3">
        {phase === "listen" && (
          <button
            onClick={() => setPhase("quiz")}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2 text-sm font-extrabold text-white shadow-tile"
          >
            <HelpCircle className="size-4" /> 我听到了 → 答题
          </button>
        )}
        {phase === "revealed" && (
          <button
            ref={actionRef}
            onClick={next}
            className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-pink-500 to-amber-500 px-5 py-2 text-sm font-extrabold text-white shadow-tile"
          >
            {i < cards.length - 1 ? "下一个" : "进入下一关"} <ChevronRight className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}