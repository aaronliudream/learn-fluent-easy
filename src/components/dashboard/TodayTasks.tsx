import { Link } from "react-router-dom";
import { T } from "@/i18n/T";
import type { StageKey } from "@/hooks/useDashboardExtras";

/**
 * "Today's 3 things to do" — a curated to-do list that combines:
 *   1. Mistakes review (if there are any due)
 *   2. Vocab consolidation (stage-aware route)
 *   3. Reading practice (stage-aware route)
 *
 * Routes adapt to the user's most-recent stage.
 */
const ROUTES: Record<StageKey, { vocab: string; reading: string }> = {
  primary: { vocab: "/primary", reading: "/primary" },
  junior:  { vocab: "/junior/vocab",  reading: "/junior/reading"  },
  senior:  { vocab: "/gaokao/vocab",  reading: "/gaokao/reading"  },
};

export function TodayTasks(props: {
  stage: StageKey;
  dueCount: number;      // # mistakes due (from TodayReviewCard / user_mistakes)
  weakVocab: number;     // approximate # of weak vocab items (from GPS)
  hasReading: boolean;   // whether reading is available for this stage
}) {
  const { stage, dueCount, weakVocab, hasReading } = props;
  const routes = ROUTES[stage];
  const reviewMins = Math.max(1, Math.round(dueCount * 0.5));
  const vocabMins = 8;
  const readingMins = 10;
  const total = (dueCount > 0 ? reviewMins : 0) + vocabMins + (hasReading ? readingMins : 0);

  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-tile">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-extrabold"><T>📋 今天要做的</T></h3>
        <span className="text-xs text-muted-foreground tabular-nums"><T>预计</T> ~{total} <T>分钟</T></span>
      </div>
      <div className="space-y-2.5">
        {dueCount > 0 && (
          <TaskItem
            to="/mistakes"
            tone="warm"
            icon="⏰"
            title="复习今天的错题"
            sub={`${dueCount} 道 · 预计 ${reviewMins} 分钟 · 按记忆曲线推送`}
            cta="开始"
          />
        )}
        <TaskItem
          to={routes.vocab}
          tone="cool"
          icon="📖"
          title="词汇巩固"
          sub={weakVocab > 0
            ? `${weakVocab} 个薄弱词 · 预计 ${vocabMins} 分钟`
            : `继续学习新词 · 预计 ${vocabMins} 分钟`}
          cta="开始"
        />
        {hasReading && (
          <TaskItem
            to={routes.reading}
            tone="mint"
            icon="📃"
            title="阅读训练"
            sub={`1 篇 · 预计 ${readingMins} 分钟`}
            cta="开始"
          />
        )}
      </div>
    </section>
  );
}

const TONES = {
  warm: {
    bg: "bg-gradient-to-br from-orange-50 to-rose-50 dark:from-orange-500/10 dark:to-rose-500/10",
    border: "border-orange-200 dark:border-orange-500/30",
    icon: "bg-gradient-to-br from-orange-500 to-rose-500",
    cta: "bg-rose-600",
  },
  cool: {
    bg: "bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-500/10 dark:to-indigo-500/10",
    border: "border-violet-200 dark:border-violet-500/30",
    icon: "bg-gradient-to-br from-indigo-500 to-violet-500",
    cta: "bg-indigo-600",
  },
  mint: {
    bg: "bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-500/10 dark:to-teal-500/10",
    border: "border-emerald-200 dark:border-emerald-500/30",
    icon: "bg-gradient-to-br from-emerald-500 to-teal-500",
    cta: "bg-emerald-600",
  },
} as const;

function TaskItem({
  to, tone, icon, title, sub, cta,
}: {
  to: string;
  tone: keyof typeof TONES;
  icon: string;
  title: string;
  sub: string;
  cta: string;
}) {
  const t = TONES[tone];
  return (
    <Link
      to={to}
      className={`group flex items-center gap-3 rounded-2xl border ${t.border} ${t.bg} p-3 transition-all hover:translate-x-0.5`}>
      <div className={`grid size-11 shrink-0 place-items-center rounded-xl ${t.icon} text-white text-xl shadow-sm`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold leading-tight"><T>{title}</T></div>
        <div className="text-xs text-muted-foreground mt-0.5 tabular-nums"><T>{sub}</T></div>
      </div>
      <div className={`rounded-full ${t.cta} text-white text-xs font-bold px-3 py-1.5 group-hover:scale-105 transition`}>
        <T>{cta}</T> →
      </div>
    </Link>
  );
}
