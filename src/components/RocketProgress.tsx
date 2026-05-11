/**
 * Spark's rocket assembly progress.
 * Each lesson completed = 1 gear; parts unlock at fixed thresholds.
 */
export const ROCKET_PARTS = [
  { name: "驾驶舱", icon: "🛸", unlockAt: 1 },
  { name: "主体",   icon: "🚀", unlockAt: 7 },
  { name: "引擎",   icon: "🔥", unlockAt: 13 },
  { name: "左翼",   icon: "✈️", unlockAt: 19 },
  { name: "右翼",   icon: "🛩️", unlockAt: 25 },
] as const;

export const TOTAL_LESSONS = 30;

/** If completedCount crossed a threshold compared to prevCount, return the part. */
export function detectUnlockedPart(prevCount: number, newCount: number) {
  return ROCKET_PARTS.find((p) => prevCount < p.unlockAt && newCount >= p.unlockAt) ?? null;
}

/** Hint message for the next gear / part to unlock. */
export function nextUnlockHint(count: number): string {
  if (count >= TOTAL_LESSONS) return "🎉 全部 30 个齿轮已集齐!";
  const next = ROCKET_PARTS.find((p) => count < p.unlockAt);
  if (!next) return `再 ${TOTAL_LESSONS - count} 个齿轮就能让 Spark 起飞!`;
  const need = next.unlockAt - count;
  return `再 ${need} 个齿轮解锁 ${next.icon} ${next.name}!`;
}

export default function RocketProgress({
  completedCount,
  highlightPart,
  size = "md",
}: {
  completedCount: number;
  /** Part name to pulse (e.g. just unlocked). */
  highlightPart?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sz = size === "lg" ? "size-12 text-2xl" : size === "sm" ? "size-7 text-base" : "size-10 text-xl";
  return (
    <div className="flex items-center gap-1.5" aria-label={`火箭进度 ${completedCount}/30`}>
      {ROCKET_PARTS.map((p) => {
        const unlocked = completedCount >= p.unlockAt;
        const pulse = highlightPart === p.name;
        return (
          <div
            key={p.name}
            title={`${p.name} · 完成 ${p.unlockAt} 节解锁`}
            className={`grid ${sz} place-items-center rounded-xl border-2 transition ${
              unlocked
                ? "border-amber-400 bg-gradient-to-br from-amber-100 to-orange-200 shadow-sm dark:border-amber-600 dark:from-amber-900/40 dark:to-orange-900/40"
                : "border-dashed border-muted bg-muted/30 opacity-50 grayscale"
            } ${pulse ? "spark-pulse ring-2 ring-amber-400" : ""}`}
          >
            <span>{p.icon}</span>
          </div>
        );
      })}
    </div>
  );
}