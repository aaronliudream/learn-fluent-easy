/**
 * 成长图的分桶/坐标轴工具 —— 从 src/components/library/VocabGrowthChart.tsx 原样抽出。
 *
 * 抽出来的原因:词汇板块要一张视觉完全一致的成长图,但数据源不同
 * (library 是收藏集,vocab 是 user_vocab_mastery)。耦合只在"归桶"那步,
 * 日期算术、Y 轴刻度、标签格式这些是纯函数,两边共用一份才不会长歪。
 *
 * ⚠️ 行为与抽出前**逐字一致**,不要在这里"顺手优化" ——
 *    library 那张图是 Aaron 定过稿的,改这里等于同时改了两个板块。
 */

export type RangeKey = "1W" | "1M" | "3M" | "6M" | "All";
export type Gran = "day" | "week" | "month";

export const GRAN: Record<RangeKey, Gran> = {
  "1W": "day", "1M": "week", "3M": "month", "6M": "month", "All": "month",
};
export const RANGES: RangeKey[] = ["1W", "1M", "3M", "6M", "All"];

// 北京日当作 UTC 日历做算术(避免二次时区偏移)。
export function addDays(ymd: string, delta: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + delta);
  return dt.toISOString().slice(0, 10);
}

export function mondayOf(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const dow = (dt.getUTCDay() + 6) % 7; // 周一=0
  dt.setUTCDate(dt.getUTCDate() - dow);
  return dt.toISOString().slice(0, 10);
}

export function addMonths(ym: string, delta: number): string {
  const [y, m] = ym.split("-").map(Number);
  const idx = y * 12 + (m - 1) + delta;
  return `${Math.floor(idx / 12)}-${String((idx % 12) + 1).padStart(2, "0")}`;
}

export const isoToBjDay = (iso: string): string =>
  new Date(iso).toLocaleDateString("en-CA", { timeZone: "Asia/Shanghai" });

export function bucketOf(bjDay: string, g: Gran): string {
  if (g === "day") return bjDay;
  if (g === "week") return mondayOf(bjDay);
  return bjDay.slice(0, 7);
}

export function labelOf(key: string, g: Gran, en: boolean): string {
  if (g === "month") { const [y, m] = key.split("-"); return en ? `${Number(m)}/${y.slice(2)}` : `${Number(m)}月`; }
  const [, m, d] = key.split("-"); return `${Number(m)}/${Number(d)}`; // 日/周(周一)都用 M/D
}

/**
 * Y 轴刻度(Aaron 定):起步固定 0/20/40/60/80/100(步长 20、封顶 100);
 * 超过 100 后按 100 间距增长(0/100/200/300/400…);
 * 极大值再自动加档保持刻度数不爆(≤ ~11 条)。
 */
export function niceAxis(rawMax: number): { niceMax: number; ticks: number[] } {
  if (rawMax <= 100) return { niceMax: 100, ticks: [0, 20, 40, 60, 80, 100] };
  let step = 100;
  while (rawMax / step > 10) step += 100; // 只有极大值才加档,常规区间恒 100 间距
  const niceMax = Math.ceil(rawMax / step) * step;
  const ticks: number[] = [];
  for (let t = 0; t <= niceMax; t += step) ticks.push(t);
  return { niceMax, ticks };
}

/** 按 range 生成横轴桶键(升序)。`earliestOf` 只在 All 档用来回溯到最早有数据的月。 */
export function axisKeys(range: RangeKey, bjToday: string, earliestOf?: () => string): string[] {
  const g = GRAN[range];
  const keys: string[] = [];
  if (g === "day") {
    for (let i = 6; i >= 0; i--) keys.push(addDays(bjToday, -i));
    return keys;
  }
  if (g === "week") {
    let wk = mondayOf(bjToday);
    for (let i = 0; i < 5; i++) { keys.push(wk); wk = addDays(wk, -7); }
    return keys.reverse();
  }
  let n = range === "3M" ? 3 : range === "6M" ? 6 : 0;
  if (n === 0) {
    const earliest = earliestOf ? earliestOf() : bjToday.slice(0, 7);
    let idx = bjToday.slice(0, 7), cnt = 1;
    while (idx > earliest && cnt < 240) { idx = addMonths(idx, -1); cnt++; }
    n = cnt;
  }
  let mk = bjToday.slice(0, 7);
  for (let i = 0; i < n; i++) { keys.push(mk); mk = addMonths(mk, -1); }
  return keys.reverse();
}

/** 当前北京日 YYYY-MM-DD。 */
export const bjToday = (): string =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Shanghai" });
