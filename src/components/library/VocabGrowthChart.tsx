/**
 * 词汇成长图(/library/vocab)——照效果图(voc.jpg):三色分组柱 + 1W/1M/3M/6M/All 切换,默认 1W。
 *   🔵 Added 每天新增(created_at,有历史)  🟠 Reviewed 每天复习(review_daily,从今天起)  🟢 Mastered 每天新掌握(last_correct_date,有历史)
 * 与用户词库实时挂钩:Added/Mastered 来自收藏集现算,Reviewed 来自每日计数表 —— 收藏/复习后 reload 即同步。
 * 分桶粒度:1W=按天(7)、1M=按周(近5周)、3M/6M/All=按月。
 */
import { useMemo, useState } from "react";
import { vocabIsMastered, type LibraryFavorite } from "@/lib/library/favorites";

const BLUE = "#3B82F6"; // Added
const ORANGE = "#F59E0B"; // Reviewed
const GREEN = "#22C55E"; // Mastered

type RangeKey = "1W" | "1M" | "3M" | "6M" | "All";
type Gran = "day" | "week" | "month";
const GRAN: Record<RangeKey, Gran> = { "1W": "day", "1M": "week", "3M": "month", "6M": "month", "All": "month" };

// 北京日当作 UTC 日历做算术(避免二次时区偏移)。
function addDays(ymd: string, delta: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + delta);
  return dt.toISOString().slice(0, 10);
}
function mondayOf(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const dow = (dt.getUTCDay() + 6) % 7; // 周一=0
  dt.setUTCDate(dt.getUTCDate() - dow);
  return dt.toISOString().slice(0, 10);
}
function addMonths(ym: string, delta: number): string {
  const [y, m] = ym.split("-").map(Number);
  const idx = y * 12 + (m - 1) + delta;
  return `${Math.floor(idx / 12)}-${String((idx % 12) + 1).padStart(2, "0")}`;
}
const isoToBjDay = (iso: string): string => new Date(iso).toLocaleDateString("en-CA", { timeZone: "Asia/Shanghai" });
function bucketOf(bjDay: string, g: Gran): string {
  if (g === "day") return bjDay;
  if (g === "week") return mondayOf(bjDay);
  return bjDay.slice(0, 7);
}
function labelOf(key: string, g: Gran, en: boolean): string {
  if (g === "month") { const [y, m] = key.split("-"); return en ? `${Number(m)}/${y.slice(2)}` : `${Number(m)}月`; }
  const [, m, d] = key.split("-"); return `${Number(m)}/${Number(d)}`; // 日/周(周一)都用 M/D
}

export default function VocabGrowthChart({
  favs,
  reviewedByDay,
  bjToday,
  en,
}: {
  favs: LibraryFavorite[]; // 已剔虚词的可复习集
  reviewedByDay: Map<string, number>; // 北京日 → 当天复习词数
  bjToday: string; // 当前北京日 YYYY-MM-DD
  en: boolean;
}) {
  const [range, setRange] = useState<RangeKey>("1W");
  const g = GRAN[range];

  const { axis, data, max } = useMemo(() => {
    // 1) 生成横轴桶键
    let keys: string[] = [];
    if (g === "day") { for (let i = 6; i >= 0; i--) keys.push(addDays(bjToday, -i)); }
    else if (g === "week") { let wk = mondayOf(bjToday); for (let i = 0; i < 5; i++) { keys.push(wk); wk = addDays(wk, -7); } keys.reverse(); }
    else {
      // 月:3M/6M 固定,All 从最早数据月到今
      let n = range === "3M" ? 3 : range === "6M" ? 6 : 0;
      if (n === 0) {
        let earliest = bjToday.slice(0, 7);
        for (const f of favs) { const d = isoToBjDay(f.created_at).slice(0, 7); if (d < earliest) earliest = d; if (f.last_correct_date) { const md = f.last_correct_date.slice(0, 7); if (md < earliest) earliest = md; } }
        for (const day of reviewedByDay.keys()) { const md = day.slice(0, 7); if (md < earliest) earliest = md; }
        let idx = bjToday.slice(0, 7), cnt = 1; while (idx > earliest && cnt < 240) { idx = addMonths(idx, -1); cnt++; }
        n = cnt;
      }
      let mk = bjToday.slice(0, 7); for (let i = 0; i < n; i++) { keys.push(mk); mk = addMonths(mk, -1); } keys.reverse();
    }
    const set = new Set(keys);
    const map = new Map<string, { added: number; reviewed: number; mastered: number }>();
    for (const k of keys) map.set(k, { added: 0, reviewed: 0, mastered: 0 });

    // 2) 归桶:Added(created_at)、Mastered(last_correct_date 且已掌握)、Reviewed(review_daily)
    for (const f of favs) {
      const ak = bucketOf(isoToBjDay(f.created_at), g);
      if (set.has(ak)) map.get(ak)!.added += 1;
      if (vocabIsMastered(f) && f.last_correct_date) {
        const mk = bucketOf(f.last_correct_date, g);
        if (set.has(mk)) map.get(mk)!.mastered += 1;
      }
    }
    for (const [day, n] of reviewedByDay) {
      const rk = bucketOf(day, g);
      if (set.has(rk)) map.get(rk)!.reviewed += n;
    }

    let mx = 0;
    for (const k of keys) { const b = map.get(k)!; mx = Math.max(mx, b.added, b.reviewed, b.mastered); }
    return { axis: keys, data: map, max: mx };
  }, [favs, reviewedByDay, bjToday, g, range]);

  const RANGES: RangeKey[] = ["1W", "1M", "3M", "6M", "All"];
  const TRACK = 92; // 柱区像素高
  const bar = (n: number, color: string) => (
    <div className="w-3 rounded-t-sm sm:w-3.5" style={{ height: `${max > 0 && n > 0 ? Math.max(3, (n / max) * TRACK) : 0}px`, backgroundColor: color }} />
  );

  return (
    <div className="mt-3 rounded-2xl border border-slate-100 bg-white px-4 py-3.5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="text-lg font-extrabold text-slate-800">{en ? "Vocabulary Growth" : "词汇成长"}</div>
        <div className="flex shrink-0 rounded-full bg-slate-100 p-0.5">
          {RANGES.map((r) => (
            <button key={r} type="button" onClick={() => setRange(r)}
              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold transition ${range === r ? "bg-white text-sky-700 shadow-sm" : "text-slate-500"}`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* 三色分组柱 */}
      <div className="mt-3 overflow-x-auto pb-1">
        <div className="flex items-end gap-2" style={{ minWidth: `${axis.length * 52}px` }}>
          {axis.map((k) => {
            const b = data.get(k)!;
            const total = b.added + b.reviewed + b.mastered;
            return (
              <div key={k} className="flex min-w-[44px] flex-1 flex-col items-center">
                <div className="flex items-end gap-1" style={{ height: TRACK }}>
                  {bar(b.added, BLUE)}
                  {bar(b.reviewed, ORANGE)}
                  {bar(b.mastered, GREEN)}
                </div>
                <span className="mt-1 whitespace-nowrap text-[10px] text-slate-400">{labelOf(k, g, en)}</span>
                <span className="sr-only">{total}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 图例 */}
      <div className="mt-1 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
        <span className="inline-flex items-center gap-1"><span className="size-2.5 rounded-sm" style={{ backgroundColor: BLUE }} /> {en ? "Added" : "新增"}</span>
        <span className="inline-flex items-center gap-1"><span className="size-2.5 rounded-sm" style={{ backgroundColor: ORANGE }} /> {en ? "Reviewed" : "复习"}</span>
        <span className="inline-flex items-center gap-1"><span className="size-2.5 rounded-sm" style={{ backgroundColor: GREEN }} /> {en ? "Mastered" : "掌握"}</span>
      </div>
    </div>
  );
}
