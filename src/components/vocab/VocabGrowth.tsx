/**
 * 词汇成长图(/vocab、/vocab/:bankCode 的柱状视图)。
 *
 * ── 视觉对齐来源 ──────────────────────────────────────────────
 * 与 /library/vocab 的「词汇成长」**同一个渲染组件**
 * (@/components/charts/GrowthChart,从 library/VocabGrowthChart.tsx 抽出),
 * 所以三色分组柱、Y 轴刻度规则、1W/1M/3M/6M/All 时间档、图例全部逐像素一致。
 * 这里只负责把 user_vocab_mastery 归桶。
 *
 * ── ⚠️ 数据缺口(必须知道,否则会以为图坏了)────────────────────
 * library 那张图的三条序列各有来源:
 *   Added    ← library_vocab_favorites.created_at
 *   Reviewed ← library_vocab_review_daily(每日计数表)
 *   Mastered ← last_correct_date
 * 词汇板块目前**只有第三条能算**:
 *   · user_vocab_mastery **没有 created_at / 首学日** → 「新增」无源
 *   · 没有 vocab_review_daily 对应表         → 「复习」无源
 * 所以这两条现在恒为 0,并不是 bug。补法见
 * SQLAA/vocab_growth_series_ddl.sql(加一列 + 建一张表),PR-2 开始写入时才用得上。
 * 在那之前保留三条序列是为了**版式与 library 一致**,补上数据后不用改前端。
 */
import { useEffect, useMemo, useState } from "react";
import GrowthChart, { type GrowthSeries } from "@/components/charts/GrowthChart";
import {
  axisKeys, bjToday as bjTodayOf, bucketOf, GRAN, mondayOf, type RangeKey,
} from "@/lib/charts/growthBuckets";
import { isMasteredRow, listMasteryRows, type MasteryRow } from "@/lib/vocab/data";
import { logFail } from "@/lib/vocab/report";

const BLUE = "#3B82F6";   // 新增
const ORANGE = "#F59E0B"; // 复习
const GREEN = "#22C55E";  // 掌握

export default function VocabGrowth({ wordIds }: { wordIds?: string[] }) {
  const [range, setRange] = useState<RangeKey>("1W");
  const [rows, setRows] = useState<MasteryRow[]>([]);
  /**
   * 取失败。**这一态原来是被当成"空"处理的** —— `catch(() => setRows([]))`
   * 之后图是空的,于是打出 emptyHint「开始学习后这里会记录你的成长」。
   * 对一个学了三个月的用户说这句话,就是把"坏"讲成了"空"。
   */
  const [failed, setFailed] = useState(false);
  const today = bjTodayOf();
  const g = GRAN[range];

  useEffect(() => {
    let alive = true;
    setFailed(false);
    listMasteryRows(wordIds)
      .then(r => { if (alive) setRows(r); })
      .catch(e => { logFail("VocabGrowth/listMasteryRows", e); if (alive) { setRows([]); setFailed(true); } });
    return () => { alive = false; };
  }, [wordIds]);

  const { axis, data, weekMastered } = useMemo(() => {
    const keys = axisKeys(range, today, () => {
      let earliest = today.slice(0, 7);
      for (const r of rows) {
        // 轴的起点也要看 first_learned_date,否则新学的那几天会被轴排除在外
        for (const d of [r.last_correct_date, r.first_learned_date]) {
          if (d) { const m = d.slice(0, 7); if (m < earliest) earliest = m; }
        }
      }
      return earliest;
    });
    const set = new Set(keys);
    const map = new Map<string, { added: number; reviewed: number; mastered: number }>();
    for (const k of keys) map.set(k, { added: 0, reviewed: 0, mastered: 0 });

    /* 两条真实数据源:
     *   新学 ← first_learned_date(第一次答对那天)
     *   掌握 ← last_correct_date(达成掌握那天)
     * ⚠️ 原来只填「掌握」,而掌握判定要 4 个不同日期 —— 新用户前四天
     *    必然全 0,图整个空掉、还触发"还没有学习记录"的空态文案。
     *    实测:64 个词跨两天作答,图仍全空。**不是没数据,是没画。**
     * 「复习」暂时无源,等 PR-6 的 vocab_study_days 落地后接上,
     *    到时候以 study_days 为准,不在这里另起一套(避免双写)。 */
    const weekStart = mondayOf(today);
    let wk = 0;
    for (const r of rows) {
      if (r.first_learned_date) {
        const ka = bucketOf(r.first_learned_date, g);
        if (set.has(ka)) map.get(ka)!.added += 1;
      }
      if (!isMasteredRow(r) || !r.last_correct_date) continue;
      const k = bucketOf(r.last_correct_date, g);
      if (set.has(k)) map.get(k)!.mastered += 1;
      if (r.last_correct_date >= weekStart) wk += 1;
    }
    return { axis: keys, data: map, weekMastered: wk };
  }, [rows, range, g, today]);

  const series: GrowthSeries[] = [
    { key: "added", label: "新学", color: BLUE },
    { key: "reviewed", label: "复习", color: ORANGE },
    { key: "mastered", label: "掌握", color: GREEN },
  ];

  return (
    <GrowthChart
      /* 词汇侧启用堆叠:「已掌握」和「学习中」是同一批词的两个阶段,
         并排会读成两件独立的事。图书馆侧不传这个 prop,观感不变。 */
      stacked
      title="词汇成长"
      titleClassName="text-[15px] font-semibold text-slate-900"
      series={series}
      axis={axis}
      gran={g}
      range={range}
      onRange={setRange}
      headerRight={
        failed ? (
          /* 失败时右上角**不写「+0」** —— 那是一个具体的数字断言,而我们没有数字 */
          <span className="text-[13px] text-slate-400">本周新掌握 —</span>
        ) : weekMastered > 0 ? (
          <span className="text-[13px] font-semibold text-emerald-600" style={{ fontVariantNumeric: "tabular-nums" }}>
            本周新掌握 +{weekMastered}
          </span>
        ) : (
          <span className="text-[13px] text-slate-400">本周新掌握 +0</span>
        )
      }
      valuesOf={(k) => {
        const b = data.get(k);
        return [b?.added ?? 0, b?.reviewed ?? 0, b?.mastered ?? 0];
      }}
      /* ⚠️ 空态与失败态**说两句不同的话**。同一句「开始学习后…」两边都用,
         就等于告诉学了三个月的用户"你还没开始",而真相是这次没取到。 */
      emptyHint={failed ? "成长数据没能加载 —— 不是没有记录,是这次没取到" : "开始学习后这里会记录你的成长"}
    />
  );
}
