import { T } from "@/i18n/T";

/**
 * 30-day daily-minutes sparkline + week-over-week delta headline.
 * Pure SVG — no chart library required.
 */
export function TrendChart(props: {
  trend30d: { date: string; minutes: number }[];
  weeklyMinutesDelta: number;
}) {
  const { trend30d, weeklyMinutesDelta } = props;

  const maxY = Math.max(10, ...trend30d.map((d) => d.minutes));
  const W = 700, H = 140, PAD = 6;
  const stepX = (W - PAD * 2) / Math.max(1, trend30d.length - 1);
  const points = trend30d.map((d, i) => {
    const x = PAD + i * stepX;
    const y = PAD + (H - PAD * 2) * (1 - d.minutes / maxY);
    return { x, y };
  });
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L${points[points.length - 1].x.toFixed(1)},${H} L${points[0].x.toFixed(1)},${H} Z`;
  const last = points[points.length - 1];

  const last7Total  = trend30d.slice(23, 30).reduce((s, x) => s + x.minutes, 0);
  const prev7Total  = trend30d.slice(16, 23).reduce((s, x) => s + x.minutes, 0);
  const pctDelta = prev7Total > 0
    ? Math.round(((last7Total - prev7Total) / prev7Total) * 100)
    : (last7Total > 0 ? 100 : 0);

  const deltaPositive = weeklyMinutesDelta >= 0;
  const deltaLabel = `${deltaPositive ? "+" : ""}${weeklyMinutesDelta} 分钟`;
  const deltaPctLabel = `${pctDelta >= 0 ? "+" : ""}${pctDelta}%`;

  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-tile">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground"><T>近 30 天</T></div>
          <div className="mt-0.5 flex items-baseline gap-2">
            <div className="text-2xl font-extrabold tabular-nums">{deltaLabel}</div>
            <div className={`text-xs font-bold ${deltaPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
              <T>本周</T> {deltaPctLabel} {deltaPositive ? "↑" : "↓"}
            </div>
          </div>
          <div className="text-xs text-muted-foreground mt-0.5 tabular-nums">
            <T>本周累计</T> {last7Total} <T>分钟 · 上周</T> {prev7Total} <T>分钟</T>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-32" preserveAspectRatio="none">
          <defs>
            <linearGradient id="sparkgrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%"  stopColor="#ED3F8C" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#ED3F8C" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#sparkgrad)" stroke="none" />
          <path d={linePath} fill="none" stroke="#ED3F8C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={last.x} cy={last.y} r="4.5" fill="#ED3F8C" stroke="#fff" strokeWidth="2" />
        </svg>
        <div className="mt-1 flex justify-between text-[10px] text-muted-foreground tabular-nums">
          <span>{shortDate(trend30d[0]?.date)}</span>
          <span>{shortDate(trend30d[7]?.date)}</span>
          <span>{shortDate(trend30d[14]?.date)}</span>
          <span>{shortDate(trend30d[22]?.date)}</span>
          <span>{shortDate(trend30d[29]?.date)}</span>
        </div>
      </div>
    </section>
  );
}

function shortDate(iso: string | undefined): string {
  if (!iso) return "";
  return iso.slice(5).replace("-", "/"); // "MM/DD"
}
