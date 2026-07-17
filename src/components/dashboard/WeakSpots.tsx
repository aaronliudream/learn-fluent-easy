import { Link } from "react-router-dom";
import { T } from "@/i18n/T";
import type { WeakSpot } from "@/hooks/useDashboardExtras";

/**
 * Top-3 weak items from user_mistakes, with a one-tap "练" button.
 * Empty state encourages the user — never blank.
 */
export function WeakSpots({ items }: { items: WeakSpot[] }) {
  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-tile">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-extrabold"><T>🎯 最近常错</T></h3>
        <Link to="/mistakes" className="text-xs font-bold text-[hsl(var(--brand-magenta))] hover:opacity-80">
          <T>全部错题</T> →
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-center">
          <div className="text-2xl">✨</div>
          <div className="mt-1 text-sm font-semibold"><T>暂无薄弱点，继续保持！</T></div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            <T>错题会在练习时自动收集到这里</T>
          </div>
        </div>
      ) : (
        <ol className="space-y-2">
          {items.map((w, i) => (
            <li
              key={w.id}
              className="flex items-center gap-2.5 rounded-xl border border-orange-200 bg-orange-50/60 p-2.5 dark:border-orange-500/30 dark:bg-orange-500/10">
              <span className="grid size-6 place-items-center rounded-lg bg-orange-200 text-orange-800 text-xs font-extrabold tabular-nums dark:bg-orange-500/30 dark:text-orange-100">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm truncate">{w.label}</div>
                <div className="text-[11px] text-muted-foreground tabular-nums">
                  <T>错</T> {w.wrong_count} <T>次</T> · {timeAgo(w.last_wrong_at)}
                </div>
              </div>
              <Link
                to="/mistakes"
                className="rounded-full bg-foreground text-background text-xs font-bold px-2.5 py-1 hover:opacity-85">
                <T>练</T> →
              </Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function timeAgo(iso: string): string {
  if (!iso) return "—";
  const t = new Date(iso).getTime();
  const diff = Date.now() - t;
  if (Number.isNaN(diff) || diff < 0) return "—";
  const mins = Math.round(diff / 60_000);
  if (mins < 60) return mins <= 1 ? "刚刚" : `${mins} 分钟前`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} 小时前`;
  const days = Math.round(hrs / 24);
  if (days === 1) return "昨天";
  if (days < 7)  return `${days} 天前`;
  const wks = Math.round(days / 7);
  if (wks < 4)   return `${wks} 周前`;
  return `${Math.round(days / 30)} 月前`;
}
