import { T } from "@/i18n/T";import { useEffect, useState } from "react";
import { Coins } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  fetchCoinTotals,
  type BadgeDef,
  type CoinTotals } from
"@/lib/coinsBadges";

/** Tiny floating badge that shows the user's coin balance. */
export function CoinPill({
  refreshKey,
  className




}: { /** Bump this number to force a re-fetch (e.g. after awarding coins). */refreshKey?: number;className?: string;}) {
  const [totals, setTotals] = useState<CoinTotals | null>(null);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchCoinTotals().then((t) => {
      if (cancelled) return;
      setTotals((prev) => {
        if (prev && t.balance !== prev.balance) {
          setPulse(true);
          setTimeout(() => setPulse(false), 800);
        }
        return t;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  if (!totals) return null;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-amber-400/50 bg-gradient-to-r from-amber-100 to-yellow-100 px-3 py-1 text-sm font-bold text-amber-900 shadow-sm transition dark:from-amber-500/15 dark:to-yellow-500/15 dark:text-amber-300",
        pulse && "scale-110 ring-2 ring-amber-400/60",
        className
      )}
      title={`累计获得 ${totals.total_earned} 金币`}>
      
      <Coins className="size-4" />
      <span className="tabular-nums">{totals.balance.toLocaleString()}</span>
    </div>);

}

/** A celebratory toast queue that pops badges in sequence. */
export function BadgeUnlockOverlay({
  badges,
  onDismiss



}: {badges: BadgeDef[];onDismiss: () => void;}) {
  const [index, setIndex] = useState(0);
  const current = badges[index];

  useEffect(() => {
    if (!current) return;
    const t = setTimeout(() => {
      if (index + 1 >= badges.length) {
        onDismiss();
      } else {
        setIndex(index + 1);
      }
    }, 2600);
    return () => clearTimeout(t);
  }, [current, index, badges.length, onDismiss]);

  if (!current) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-20 z-50 flex justify-center px-4">
      <div className="pointer-events-auto animate-in fade-in zoom-in-90 slide-in-from-top-4 duration-300 rounded-2xl border border-amber-400/40 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 p-4 pr-5 shadow-[0_20px_60px_-15px_rgba(245,158,11,0.5)] dark:from-amber-500/10 dark:via-yellow-500/10 dark:to-orange-500/10">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-orange-400 text-2xl shadow-inner">
            {current.emoji}
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400">
              <T>新徽章解锁</T>
            </div>
            <div className="text-base font-extrabold text-foreground">
              {current.title}
            </div>
            <div className="text-xs text-muted-foreground">
              {current.description}
            </div>
          </div>
        </div>
      </div>
    </div>);

}