import { ERROR_REASON_LABELS, type GrammarErrorReason } from "@/lib/grammarFsrs";

type Props = { data: Record<GrammarErrorReason, number>; size?: number };

const KEYS: GrammarErrorReason[] = ["rule_unknown", "confusion", "careless", "vocab", "speed"];

export function ErrorRadar({ data, size = 200 }: Props) {
  const max = Math.max(1, ...KEYS.map((k) => data[k] || 0));
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 28;
  const points = KEYS.map((k, i) => {
    const angle = (Math.PI * 2 * i) / KEYS.length - Math.PI / 2;
    const v = (data[k] || 0) / max;
    return { x: cx + Math.cos(angle) * radius * v, y: cy + Math.sin(angle) * radius * v, k, angle };
  });
  const labelPts = KEYS.map((k, i) => {
    const angle = (Math.PI * 2 * i) / KEYS.length - Math.PI / 2;
    return {
      x: cx + Math.cos(angle) * (radius + 16),
      y: cy + Math.sin(angle) * (radius + 16),
      k,
    };
  });
  const polygon = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg width={size} height={size} className="overflow-visible">
      {[0.25, 0.5, 0.75, 1].map((s) => (
        <polygon
          key={s}
          points={KEYS.map((_, i) => {
            const angle = (Math.PI * 2 * i) / KEYS.length - Math.PI / 2;
            return `${cx + Math.cos(angle) * radius * s},${cy + Math.sin(angle) * radius * s}`;
          }).join(" ")}
          fill="none"
          className="stroke-muted/40"
          strokeWidth={1}
        />
      ))}
      <polygon points={polygon} className="fill-primary/20 stroke-primary" strokeWidth={1.5} />
      {points.map((p) => (
        <circle key={p.k} cx={p.x} cy={p.y} r={3} className="fill-primary" />
      ))}
      {labelPts.map((p) => (
        <text
          key={p.k}
          x={p.x}
          y={p.y}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-foreground text-[10px] font-medium"
        >
          {ERROR_REASON_LABELS[p.k]} ({data[p.k] || 0})
        </text>
      ))}
    </svg>
  );
}
