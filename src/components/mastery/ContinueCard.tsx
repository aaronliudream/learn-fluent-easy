import { Link } from "react-router-dom";
import { ArrowRight, Zap } from "lucide-react";
import type { Stage } from "@/hooks/useMasteryOverview";
import { useMasteryOverview, pickContinue } from "@/hooks/useMasteryOverview";

/** Smart "continue learning" card. Drops in any module/stage page header. */
export function ContinueCard({ stage }: { stage: Stage }) {
  const ov = useMasteryOverview(stage);
  if (!ov.signedIn || ov.loading) return null;
  const pick = pickContinue(stage, ov);
  const tone =
    pick.kind === "due"
      ? "from-orange-500 to-rose-500"
      : pick.kind === "resume"
      ? "from-indigo-500 to-violet-500"
      : "from-emerald-500 to-teal-500";
  return (
    <Link
      to={pick.to}
      className={`group relative mb-4 flex items-center gap-4 overflow-hidden rounded-2xl bg-gradient-to-br ${tone} p-4 text-white shadow-tile transition-all hover:-translate-y-0.5`}
    >
      <span className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-white/15 blur-2xl" />
      <div className="relative grid size-12 shrink-0 place-items-center rounded-xl bg-white/20 backdrop-blur-sm">
        <Zap className="size-6" />
      </div>
      <div className="relative flex-1 min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-80">
          {pick.kind === "due" ? "今日到期" : pick.kind === "resume" ? "继续上次" : "今日推荐"}
        </div>
        <div className="mt-0.5 truncate text-base font-extrabold leading-tight">{pick.title}</div>
        <div className="mt-0.5 truncate text-xs opacity-90">{pick.subtitle}</div>
      </div>
      <ArrowRight className="relative size-5 shrink-0 opacity-90 transition-transform group-hover:translate-x-1" />
    </Link>
  );
}