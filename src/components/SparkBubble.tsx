import { SPARK_MOODS, type SparkMood } from "@/data/sparkMoods";

type Size = "sm" | "md" | "lg";

const SIZE_MAP: Record<Size, { box: string; emoji: string }> = {
  sm: { box: "size-8",  emoji: "text-lg" },
  md: { box: "size-12", emoji: "text-2xl" },
  lg: { box: "size-20", emoji: "text-4xl" },
};

export default function SparkBubble({
  mood = "default",
  text,
  size = "md",
  className = "",
}: {
  mood?: SparkMood;
  text?: string;
  size?: Size;
  className?: string;
}) {
  const conf = SPARK_MOODS[mood];
  const sz = SIZE_MAP[size];
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        key={mood /* re-trigger animation on mood change */}
        className={`grid ${sz.box} shrink-0 place-items-center rounded-2xl shadow-sm ${conf.bgClass} ${conf.animClass}`}
        aria-label={`Spark ${conf.label}`}
      >
        <span className={sz.emoji} role="img">
          {conf.emoji}
        </span>
      </div>
      {text && (
        <div className="relative max-w-xs rounded-2xl border border-border bg-card px-3 py-2 text-sm font-bold text-foreground shadow-sm">
          {text}
        </div>
      )}
    </div>
  );
}