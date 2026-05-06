import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useMasteryOverview, pickContinue, type Stage } from "@/hooks/useMasteryOverview";
import { MasteryRing } from "./MasteryRing";
import { useState } from "react";

/** Compact at-a-glance mastery card on the home page, links to /dashboard. */
export function HomeMasterySummary() {
  const [stage, setStage] = useState<Stage>("gaokao");
  const ov = useMasteryOverview(stage);
  if (!ov.signedIn) return null;
  const pick = pickContinue(stage, ov);

  return (
    <section className="mt-6 overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          📊 我的掌握度
        </div>
        <div className="inline-flex rounded-full bg-muted p-0.5 text-[11px] font-bold">
          {(["junior", "gaokao"] as Stage[]).map((s) => (
            <button
              key={s}
              onClick={() => setStage(s)}
              className={`rounded-full px-2.5 py-0.5 transition ${stage === s ? "bg-background text-foreground shadow" : "text-muted-foreground"}`}
            >
              {s === "junior" ? "初中" : "高中"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 p-4 md:flex-row md:gap-6">
        <MasteryRing percent={ov.percent} size={108} thickness={10} sublabel={`${ov.mastered}/${ov.total}`} />
        <div className="grid w-full grid-cols-2 gap-2 md:grid-cols-4">
          <Mini n={ov.mastered} label="🌳 掌握" />
          <Mini n={ov.learned}  label="🌿 学过" />
          <Mini n={ov.untouched} label="🌱 未学" />
          <Mini n={ov.due}      label="⏰ 待复习" highlight={ov.due > 0} />
        </div>
      </div>

      {!ov.loading && (
        <Link
          to={pick.to}
          className="group flex items-center gap-3 border-t border-border bg-gradient-to-r from-primary/10 via-transparent to-emerald-500/10 px-4 py-3 transition hover:bg-primary/15"
        >
          <span className="text-base">📍</span>
          <div className="flex-1 min-w-0">
            <div className="truncate text-sm font-extrabold">{pick.title}</div>
            <div className="truncate text-[11px] text-muted-foreground">{pick.subtitle}</div>
          </div>
          <span className="text-[11px] font-bold text-primary">继续 <ArrowRight className="inline size-3" /></span>
        </Link>
      )}

      <Link
        to="/dashboard"
        className="block border-t border-border px-4 py-2 text-center text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:bg-muted/50 hover:text-foreground"
      >
        查看完整学习中心 →
      </Link>
    </section>
  );
}

function Mini({ n, label, highlight }: { n: number; label: string; highlight?: boolean }) {
  return (
    <div className={`rounded-lg border px-2 py-1.5 text-center ${highlight ? "border-orange-500/40 bg-orange-500/10" : "border-border bg-background"}`}>
      <div className={`text-base font-extrabold tabular-nums ${highlight ? "text-orange-600 dark:text-orange-400" : ""}`}>{n.toLocaleString()}</div>
      <div className="text-[10px] font-semibold text-muted-foreground">{label}</div>
    </div>
  );
}