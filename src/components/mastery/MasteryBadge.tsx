import { cn } from "@/lib/utils";

export type MasteryStatus = "untouched" | "learned" | "mastered" | "expert" | "due";

const META: Record<MasteryStatus, { label: string; emoji: string; cls: string }> = {
  untouched: { label: "未学",   emoji: "🌱", cls: "bg-muted text-muted-foreground" },
  learned:   { label: "学过",   emoji: "🌿", cls: "bg-blue-500/15 text-blue-700 dark:text-blue-300" },
  mastered:  { label: "掌握",   emoji: "🌳", cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  expert:    { label: "精通",   emoji: "👑", cls: "bg-amber-500/20 text-amber-700 dark:text-amber-300" },
  due:       { label: "待复习", emoji: "⏰", cls: "bg-orange-500/15 text-orange-700 dark:text-orange-300 animate-pulse" },
};

export function MasteryBadge({
  status,
  className,
  showLabel = true,
}: { status: MasteryStatus; className?: string; showLabel?: boolean }) {
  const m = META[status];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold", m.cls, className)}>
      <span aria-hidden>{m.emoji}</span>
      {showLabel && <span>{m.label}</span>}
    </span>
  );
}

export const MASTERY_LEGEND: { status: MasteryStatus; desc: string }[] = [
  { status: "untouched", desc: "从未学习" },
  { status: "learned",   desc: "接触过但未达标" },
  { status: "mastered",  desc: "≥80% 通过" },
  { status: "expert",    desc: "5★ 完美掌握" },
  { status: "due",       desc: "今日到期需复习" },
];