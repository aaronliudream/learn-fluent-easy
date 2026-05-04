import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";

type Props = { stage: number; level: number; nickname?: string };

const NODES = [
  { stage: 0, label: "蛋", labelEn: "Egg", emoji: "🥚", req: "起点" },
  { stage: 1, label: "幼年", labelEn: "Baby", emoji: "🐣", req: "Lv.1 解锁" },
  { stage: 2, label: "成年", labelEn: "Adult", emoji: "🦊", req: "Lv.5 解锁" },
  { stage: 3, label: "传说", labelEn: "Legend", emoji: "🐉", req: "Lv.15 解锁" },
];

/**
 * Transparent 4-stage evolution tree.
 * Users always see *what* unlocks the next stage — no black-box reward.
 */
export default function EvolutionTree({ stage, level, nickname }: Props) {
  return (
    <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-tile">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-sm font-extrabold">成长之路</h3>
        <span className="text-[10px] text-muted-foreground">完全透明 · 不开盲盒</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {NODES.map((n, i) => {
          const reached = stage >= n.stage;
          const isCurrent = stage === n.stage;
          return (
            <div key={n.stage} className="relative">
              {i > 0 && (
                <div className={cn("absolute left-0 top-7 h-0.5 w-full -translate-x-1/2",
                  reached ? "bg-emerald-400" : "bg-muted"
                )} />
              )}
              <div className={cn(
                "relative flex flex-col items-center rounded-2xl border p-2 text-center",
                isCurrent && "border-primary ring-2 ring-primary/30",
                reached ? "bg-card" : "bg-muted/40 border-border",
              )}>
                <div className={cn("text-3xl", !reached && "grayscale opacity-50")}>{n.emoji}</div>
                <div className="mt-1 text-[11px] font-bold">{n.label}</div>
                <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{n.labelEn}</div>
                <div className="mt-1 flex items-center gap-0.5 text-[9px] text-muted-foreground">
                  {!reached && <Lock className="size-2.5" />} {n.req}
                </div>
                {isCurrent && (
                  <span className="absolute -top-2 rounded-full bg-primary px-1.5 py-0.5 text-[8px] font-extrabold text-primary-foreground">
                    现在
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-center text-[11px] text-muted-foreground">
        {nickname ? `${nickname} 当前 Lv.${level}` : `当前 Lv.${level}`} · 通过完成学习任务获得经验解锁下一阶段
      </p>
    </div>
  );
}
