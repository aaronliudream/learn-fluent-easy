import { useT } from "@/i18n/T";
import type { Badge } from "@/hooks/useStreakStats";

/**
 * Horizontal scroll strip of badges. Earned badges glow; locked badges
 * show a faint silhouette + progress dots. Designed to live inline on
 * the home page below the Today Task card.
 */
export function BadgeStrip({ badges }: { badges: Badge[] }) {
  const t = useT();
  return (
    <div className="flex gap-2.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {badges.map((b) => {
        const earned = b.earned;
        const pct =
          b.progress && b.progress.target > 0
            ? Math.min(1, b.progress.current / b.progress.target)
            : earned
            ? 1
            : 0;
        return (
          <div
            key={b.id}
            className={`relative flex w-[88px] shrink-0 flex-col items-center gap-1 rounded-2xl border p-2.5 text-center transition ${
              earned
                ? "border-accent/30 bg-gradient-to-b from-accent/15 to-accent/0"
                : "border-border bg-card"
            }`}
            title={t(b.desc)}
          >
            <div
              className={`grid size-11 place-items-center rounded-full text-xl ${
                earned
                  ? "bg-accent/20 ring-2 ring-accent/40 animate-badge-pop"
                  : "bg-muted opacity-50 grayscale"
              }`}
            >
              <span aria-hidden>{b.emoji}</span>
            </div>
            <div
              className={`line-clamp-1 text-[10px] font-bold ${
                earned ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {t(b.label)}
            </div>
            {!earned && b.progress && (
              <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-accent/70 transition-all"
                  style={{ width: `${Math.round(pct * 100)}%` }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}