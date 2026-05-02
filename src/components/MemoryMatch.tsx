/**
 * Memory Match — vocabulary pairing mini-game.
 * Tap a word, then tap its meaning (or vice versa) to clear the pair.
 * Played as a fun coda after finishing a group's quiz.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles, RotateCw, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { awardCoins } from "@/lib/coinsBadges";

type Pair = { id: string; word: string; meaning: string };
type Card = {
  key: string;       // unique per card
  pairId: string;    // which pair it belongs to
  text: string;
  side: "en" | "cn";
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export interface MemoryMatchProps {
  /** Vocabulary to play with — first 6 are used (12 cards in a 4×3 grid). */
  pool: Array<{ id: string; word: string; meaning_cn: string }>;
  onClose: () => void;
}

const MAX_PAIRS = 6;

export default function MemoryMatch({ pool, onClose }: MemoryMatchProps) {
  const [round, setRound] = useState(0);
  const pairs = useMemo<Pair[]>(() => {
    return shuffle(pool)
      .slice(0, MAX_PAIRS)
      .map((v) => ({ id: v.id, word: v.word, meaning: v.meaning_cn }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool, round]);

  const cards = useMemo<Card[]>(() => {
    const all: Card[] = [];
    pairs.forEach((p) => {
      all.push({ key: `${p.id}-en`, pairId: p.id, text: p.word, side: "en" });
      all.push({ key: `${p.id}-cn`, pairId: p.id, text: p.meaning, side: "cn" });
    });
    return shuffle(all);
  }, [pairs]);

  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [picked, setPicked] = useState<Card | null>(null);
  const [wrongPair, setWrongPair] = useState<[string, string] | null>(null);
  const [moves, setMoves] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [coins, setCoins] = useState<number | null>(null);
  const startedAtRef = useRef<number>(Date.now());
  const [elapsed, setElapsed] = useState(0);

  // Reset per round
  useEffect(() => {
    setMatched(new Set());
    setPicked(null);
    setWrongPair(null);
    setMoves(0);
    setMistakes(0);
    setCoins(null);
    startedAtRef.current = Date.now();
    setElapsed(0);
  }, [round]);

  // Tick a stopwatch while not finished
  useEffect(() => {
    if (matched.size >= pairs.length * 2) return;
    const t = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000));
    }, 250);
    return () => clearInterval(t);
  }, [matched, pairs.length]);

  const finished = matched.size >= pairs.length * 2;

  // Award coins exactly once on completion
  useEffect(() => {
    if (!finished || coins !== null) return;
    const perfect = mistakes === 0;
    const speedBonus = elapsed < 30 ? 10 : elapsed < 60 ? 5 : 0;
    const reward = pairs.length * 3 + (perfect ? 15 : 0) + speedBonus;
    setCoins(reward);
    awardCoins(reward).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  function pick(card: Card) {
    if (finished) return;
    if (matched.has(card.key)) return;
    if (wrongPair) return; // brief lockout while flashing red
    if (picked && picked.key === card.key) {
      setPicked(null);
      return;
    }
    if (!picked) {
      setPicked(card);
      return;
    }
    // Two cards selected — evaluate
    setMoves((m) => m + 1);
    if (picked.pairId === card.pairId && picked.side !== card.side) {
      // Match!
      const next = new Set(matched);
      next.add(picked.key);
      next.add(card.key);
      setMatched(next);
      setPicked(null);
    } else {
      // Wrong — flash red, then clear
      setMistakes((n) => n + 1);
      setWrongPair([picked.key, card.key]);
      setTimeout(() => {
        setWrongPair(null);
        setPicked(null);
      }, 600);
    }
  }

  return (
    <div className="rounded-3xl border-2 border-fuchsia-500/40 bg-gradient-to-br from-fuchsia-500/5 via-rose-500/5 to-amber-400/5 p-5 shadow-tile">
      <div className="mb-3 flex items-center justify-between">
        <div className="inline-flex items-center gap-2">
          <Sparkles className="size-4 text-fuchsia-500" />
          <span className="text-sm font-extrabold">趣味配对 · Memory Match</span>
        </div>
        <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground tabular-nums">
          <span>⏱ {elapsed}s</span>
          <span>👆 {moves}</span>
          {mistakes > 0 && <span className="text-rose-500">✗ {mistakes}</span>}
        </div>
      </div>

      <p className="mb-3 text-xs text-muted-foreground">
        点单词 → 点对应的中文释义。配对越快、错的越少，金币越多 🪙
      </p>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {cards.map((c) => {
          const isMatched = matched.has(c.key);
          const isPicked = picked?.key === c.key;
          const isWrong = wrongPair?.includes(c.key);
          return (
            <button
              key={c.key}
              onClick={() => pick(c)}
              disabled={isMatched}
              className={cn(
                "min-h-[68px] rounded-2xl border-2 p-2 text-center text-sm font-semibold transition-all",
                "flex items-center justify-center break-words leading-tight",
                isMatched && "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 opacity-50 scale-95",
                !isMatched && isPicked && "border-fuchsia-500 bg-fuchsia-500/15 scale-105 shadow-lg",
                !isMatched && !isPicked && !isWrong && "border-border bg-card hover:border-primary/60 hover:scale-[1.02]",
                isWrong && "border-rose-500 bg-rose-500/15 animate-pulse",
                c.side === "en" && !isMatched && "font-mono",
              )}
            >
              {c.text}
            </button>
          );
        })}
      </div>

      {finished && (
        <div className="mt-4 rounded-2xl border-2 border-amber-400/40 bg-amber-400/10 p-4 text-center animate-fade-in">
          <Trophy className="mx-auto size-7 text-amber-500" />
          <div className="mt-1 text-base font-extrabold">
            完美收尾！{mistakes === 0 ? "全对 🎯" : `${mistakes} 次失误`}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            用时 {elapsed}s · {moves} 次点击
          </div>
          {coins !== null && coins > 0 && (
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-sm font-bold text-amber-700 dark:text-amber-300">
              🪙 +{coins} 金币
            </div>
          )}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => setRound((r) => r + 1)}>
              <RotateCw className="mr-1 size-4" /> 再来一局
            </Button>
            <Button onClick={onClose}>完成 ✓</Button>
          </div>
        </div>
      )}
    </div>
  );
}
