/**
 * 「我还差什么」—— 掌握度三条腿的显示件。
 *
 * 由来(2026-08-17):UI 此前只有"掌握 / 未掌握"两态,用户不知道自己卡在
 * 天数、题型还是等级。一个不可见的目标等于不存在的目标 ——
 * 用户学了 800+ 个词、掌握数 0,却完全看不出差在哪。
 *
 * ⚠️ 阈值一律从 `masteryProgress` 来,**这里不写任何字面量**。
 *    在 UI 里写 4/4/2 的话,哪天判定规则一改,界面会继续按旧阈值报进度 ——
 *    出现的正是 isMasteredRow 注释里警告的那种分叉:
 *    "进度显示 4/4·2/2 却不标掌握"。
 * ⚠️ 也**不在这里重新判定掌握**,直接用 p.mastered(它就是 isMasteredRow)。
 *
 * 两种形态:
 *   variant="chip"  折叠行里用 —— 位置窄,只说**最要紧的那一条**还差什么;
 *   variant="full"  展开区/词卡里用 —— 三条腿全给,天数 3/4 · 题型 1/2 · 等级 3/4。
 */
import { cn } from "@/lib/utils";
import type { MasteryProgress } from "@/lib/vocab/data";

const LABEL = { days: "天数", modes: "题型", level: "等级" } as const;

/** 未达标的腿,按"最该先补哪个"排:题型最卡人(它是死结所在),其次天数,最后等级。 */
const ORDER = ["modes", "days", "level"] as const;

export function MasteryLegs({ p, variant = "full", className }: {
  p: MasteryProgress;
  variant?: "chip" | "full";
  className?: string;
}) {
  if (p.mastered) {
    return (
      <span className={cn("shrink-0 text-[11px] font-medium text-emerald-600", className)}>已掌握</span>
    );
  }
  /* 一次都没学过:不摆一排 0/4 吓人,也不占位置 */
  const started = p.days.have > 0 || p.modes.have > 0 || p.level.have > 0;
  if (!started) return null;

  if (variant === "chip") {
    const worst = ORDER.find(k => !p[k].ok);
    if (!worst) return null;                       // 三条都达标却没 mastered:交给 full 去显示,别在这瞎猜
    const leg = p[worst];
    return (
      <span
        className={cn("shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700", className)}
        title={`还差${LABEL[worst]}:${leg.have}/${leg.need}`}
      >
        差{LABEL[worst]} {leg.have}/{leg.need}
      </span>
    );
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px]", className)}>
      {(["days", "modes", "level"] as const).map(k => (
        <span key={k} className={cn(p[k].ok ? "text-slate-400" : "font-medium text-amber-700")}>
          {LABEL[k]} {p[k].have}/{p[k].need}
        </span>
      ))}
    </div>
  );
}
