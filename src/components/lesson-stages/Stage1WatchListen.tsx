import { useEffect, useState } from "react";
import { Volume2, ChevronLeft, ChevronRight } from "lucide-react";
import { speak } from "@/lib/speak";
import type { Stage1Card } from "@/data/g2LessonStages";

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
  const [seen, setSeen] = useState<Set<number>>(new Set([0]));
  const card = cards[i];

  useEffect(() => {
    setSeen((s) => new Set(s).add(i));
    const t = setTimeout(() => speak(card.word), 250);
    return () => clearTimeout(t);
  }, [i, card.word]);

  const allSeen = seen.size >= cards.length;

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="text-xs font-bold text-muted-foreground">{i + 1} / {cards.length}</div>
      <div className={`w-full rounded-3xl border-2 border-border bg-gradient-to-br ${BG[i % BG.length]} p-8 text-center shadow-tile`}>
        <div className="text-[110px] leading-none">{card.emoji}</div>
        <div className="mt-4 text-3xl font-black text-foreground">{card.word}</div>
        <div className="mt-1 text-sm text-muted-foreground">{card.ipa}</div>
        <div className="mt-3 text-xl font-bold text-foreground">{card.meaning_cn}</div>
        <div className="mt-4 rounded-xl bg-background/60 p-3 text-sm">
          <div className="font-semibold">{card.example_en}</div>
          <div className="text-muted-foreground">{card.example_cn}</div>
        </div>
        <button
          onClick={() => speak(card.word)}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground shadow-tile hover:-translate-y-0.5 transition"
        >
          <Volume2 className="size-4" /> 再听一次
        </button>
      </div>

      <div className="flex w-full items-center justify-between gap-3">
        <button
          onClick={() => setI((v) => Math.max(0, v - 1))}
          disabled={i === 0}
          className="inline-flex items-center gap-1 rounded-full border-2 border-border bg-card px-4 py-2 text-sm font-bold disabled:opacity-40"
        >
          <ChevronLeft className="size-4" /> 上一个
        </button>
        {i < cards.length - 1 ? (
          <button
            onClick={() => setI((v) => Math.min(cards.length - 1, v + 1))}
            className="inline-flex items-center gap-1 rounded-full bg-secondary px-4 py-2 text-sm font-bold"
          >
            下一个 <ChevronRight className="size-4" />
          </button>
        ) : (
          <button
            onClick={onComplete}
            disabled={!allSeen}
            className="rounded-full bg-gradient-to-r from-pink-500 to-amber-500 px-6 py-2 text-sm font-extrabold text-white shadow-tile disabled:opacity-50"
          >
            进入下一关 →
          </button>
        )}
      </div>
    </div>
  );
}