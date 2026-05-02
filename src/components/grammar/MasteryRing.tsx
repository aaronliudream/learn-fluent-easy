type Props = {
  value: number;
  size?: number;
  stroke?: number;
  className?: string;
  colorClass?: string;
  trackClass?: string;
  children?: React.ReactNode;
};

export function MasteryRing({
  value,
  size = 56,
  stroke = 6,
  className = "",
  colorClass = "stroke-primary",
  trackClass = "stroke-muted/40",
  children,
}: Props) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  const dash = c * v;
  return (
    <div className={`relative inline-grid place-items-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className={trackClass} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          className={`${colorClass} transition-all duration-500`}
          strokeDasharray={`${dash} ${c}`}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}
