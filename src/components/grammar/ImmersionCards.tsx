import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Volume2 } from "lucide-react";
import { speak } from "@/lib/speak";
import { cn } from "@/lib/utils";

/**
 * Immersion-card stage: situation/Chinese/English triplets the student
 * pages through. Each card is a "I've seen this used in real context"
 * reference — meant to expand pattern recognition before practice.
 *
 * Tap the speaker icon → TTS the English sentence.
 * Arrows or swipe (mobile) advance.
 *
 * If `cards` is empty, returns null (parent should skip the stage).
 */

export type ImmersionCard = {
  situation: string;
  cn: string;
  en: string;
};

interface Props {
  cards: ImmersionCard[];
  onContinue: () => void;
}

export function ImmersionCards({ cards, onContinue }: Props) {
  const [idx, setIdx] = useState(0);
  const [seen, setSeen] = useState<Set<number>>(new Set([0]));

  useEffect(() => {
    setSeen((s) => {
      const next = new Set(s);
      next.add(idx);
      return next;
    });
  }, [idx]);

  // Keyboard support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
      if (e.key === "ArrowRight") {
        next();
        e.preventDefault();
      } else if (e.key === "ArrowLeft") {
        prev();
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  if (!cards || cards.length === 0) return null;

  const card = cards[idx];
  const canPrev = idx > 0;
  const canNext = idx < cards.length - 1;
  const allSeen = seen.size === cards.length;

  const next = () => { if (canNext) setIdx((i) => i + 1); };
  const prev = () => { if (canPrev) setIdx((i) => i - 1); };

  const playEnglish = () => {
    speak(card.en, { accent: "US" }).catch(() => { /* ignore */ });
  };

  return (
    <section className="w-full max-w-2xl mx-auto pb-4">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-xs">
          <span className="font-mono text-sky-600 dark:text-sky-400 tracking-widest">📚 沉浸训练</span>
          <span className="text-muted-foreground"> · 看 {cards.length} 个真实场景</span>
        </div>
        <div className="text-xs text-muted-foreground tabular-nums">
          {idx + 1} / {cards.length}
        </div>
      </div>

      {/* Card */}
      <div className="rounded-3xl border-2 border-sky-200 dark:border-sky-900 bg-gradient-to-br from-sky-50 to-indigo-50 dark:from-sky-950/30 dark:to-indigo-950/20 p-6 sm:p-8 mb-4 min-h-[220px] flex flex-col">
        <div className="text-[10px] font-bold uppercase tracking-widest text-sky-600 dark:text-sky-400 mb-3">
          📍 {card.situation}
        </div>
        <div className="text-base text-muted-foreground mb-4">{card.cn}</div>
        <div className="flex-1 flex items-center">
          <div className="flex items-start gap-3 w-full">
            <p className="flex-1 text-xl sm:text-2xl font-bold leading-snug text-sky-700 dark:text-sky-300 italic">
              "{card.en}"
            </p>
            <button
              onClick={playEnglish}
              className="flex-shrink-0 w-9 h-9 rounded-full bg-sky-500 hover:bg-sky-600 transition flex items-center justify-center text-white shadow-sm"
              title="朗读英文"
              aria-label="朗读英文"
            >
              <Volume2 className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Card dots */}
      <div className="flex items-center justify-center gap-1.5 mb-4">
        {cards.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === idx ? "w-6 bg-sky-500" : seen.has(i) ? "w-1.5 bg-sky-300 dark:bg-sky-700" : "w-1.5 bg-muted",
            )}
            aria-label={`跳到第 ${i + 1} 张`}
          />
        ))}
      </div>

      {/* Nav controls */}
      <div className="flex items-center gap-2 justify-between mb-4">
        <button
          onClick={prev}
          disabled={!canPrev}
          className="rounded-full border-2 border-border h-10 px-4 inline-flex items-center gap-1 text-sm hover:border-sky-400 disabled:opacity-30 disabled:cursor-not-allowed transition"
          aria-label="上一张"
        >
          <ChevronLeft className="size-4" /> 上一张
        </button>
        <button
          onClick={next}
          disabled={!canNext}
          className="rounded-full border-2 border-border h-10 px-4 inline-flex items-center gap-1 text-sm hover:border-sky-400 disabled:opacity-30 disabled:cursor-not-allowed transition"
          aria-label="下一张"
        >
          下一张 <ChevronRight className="size-4" />
        </button>
      </div>

      {/* Continue */}
      <div className="text-center">
        <button
          onClick={onContinue}
          className={cn(
            "px-6 py-3 rounded-full text-sm font-extrabold transition inline-flex items-center gap-2",
            allSeen
              ? "bg-sky-500 text-white hover:bg-sky-600 shadow-md"
              : "bg-muted text-muted-foreground hover:bg-muted/80",
          )}
        >
          {allSeen ? "看完了，开始练习 →" : "够了，开始练习 →"}
        </button>
        <p className="text-[11px] text-muted-foreground mt-2 italic">⌨ ←/→ 翻页 · 🔊 听英文</p>
      </div>
    </section>
  );
}
