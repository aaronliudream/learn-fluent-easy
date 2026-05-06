import { cn } from "@/lib/utils";

/** Donut ring showing mastered/learned/untouched distribution. */
export function MasteryRing({
  percent,
  size = 120,
  thickness = 12,
  className,
  label,
  sublabel,
}: {
  percent: number; // 0..100 (mastered share)
  size?: number;
  thickness?: number;
  className?: string;
  label?: string;
  sublabel?: string;
}) {
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const dash = (percent / 100) * c;
  return (
    <div className={cn("relative grid place-items-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="hsl(var(--muted))" strokeWidth={thickness} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#mastery-grad)"
          strokeWidth={thickness}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
        />
        <defs>
          <linearGradient id="mastery-grad" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(160 70% 45%)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="text-2xl font-extrabold leading-none tabular-nums">{percent}%</div>
          {label && <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</div>}
          {sublabel && <div className="text-[10px] text-muted-foreground">{sublabel}</div>}
        </div>
      </div>
    </div>
  );
}