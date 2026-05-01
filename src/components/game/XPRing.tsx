import { Flame } from "lucide-react";

/**
 * Compact XP / streak progress ring.
 * `value` 0..target. Renders an SVG circle that fills clockwise.
 * Center shows current streak day count + a flame icon.
 */
export function XPRing({
  value,
  target = 7,
  size = 88,
  label = "DAY STREAK",
}: {
  value: number;
  target?: number;
  size?: number;
  label?: string;
}) {
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, value / target);
  const offset = c * (1 - pct);

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="hsl(var(--xp-track))"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="hsl(var(--xp))"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 700ms cubic-bezier(.4,0,.2,1)" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="flex flex-col items-center leading-none">
          <Flame
            className={`size-4 text-accent ${value > 0 ? "animate-flame" : "opacity-40"}`}
            strokeWidth={2.5}
          />
          <span className="num mt-1 text-lg font-extrabold text-foreground">{value}</span>
          <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}