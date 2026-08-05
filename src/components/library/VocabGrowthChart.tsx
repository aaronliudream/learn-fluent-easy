/**
 * 词汇成长图(/library/vocab)——照效果图(voc.jpg):三色分组柱 + 1W/1M/3M/6M/All 切换,默认 1W。
 *   🔵 Added 每天新增(created_at,有历史)  🟠 Reviewed 每天复习(review_daily,从今天起)  🟢 Mastered 每天新掌握(last_correct_date,有历史)
 * 与用户词库实时挂钩:Added/Mastered 来自收藏集现算,Reviewed 来自每日计数表 —— 收藏/复习后 reload 即同步。
 * 分桶粒度:1W=按天(7)、1M=按周(近5周)、3M/6M/All=按月。
 *
 * ⚠️ 2026-08-04 重构:渲染层抽到 @/components/charts/GrowthChart,日期/刻度工具抽到
 *    @/lib/charts/growthBuckets —— 词汇板块(/vocab)要一张视觉完全一致的图,
 *    但数据源是 user_vocab_mastery。**本组件对外的 props 没变**,LibraryVocab.tsx 一行没动。
 *    这里只剩"把收藏集归桶"这一件事。
 */
import { useMemo, useState } from "react";
import { vocabIsMastered, type LibraryFavorite } from "@/lib/library/favorites";
import GrowthChart, { type GrowthSeries } from "@/components/charts/GrowthChart";
import { axisKeys, bucketOf, GRAN, isoToBjDay, type RangeKey } from "@/lib/charts/growthBuckets";

const BLUE = "#3B82F6"; // Added
const ORANGE = "#F59E0B"; // Reviewed
const GREEN = "#22C55E"; // Mastered

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

  const { axis, data } = useMemo(() => {
    const keys = axisKeys(range, bjToday, () => {
      let earliest = bjToday.slice(0, 7);
      for (const f of favs) {
        const d = isoToBjDay(f.created_at).slice(0, 7);
        if (d < earliest) earliest = d;
        if (f.last_correct_date) { const md = f.last_correct_date.slice(0, 7); if (md < earliest) earliest = md; }
      }
      for (const day of reviewedByDay.keys()) { const md = day.slice(0, 7); if (md < earliest) earliest = md; }
      return earliest;
    });

    const set = new Set(keys);
    const map = new Map<string, { added: number; reviewed: number; mastered: number }>();
    for (const k of keys) map.set(k, { added: 0, reviewed: 0, mastered: 0 });

    // 归桶:Added(created_at)、Mastered(last_correct_date 且已掌握)、Reviewed(review_daily)
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

    return { axis: keys, data: map };
  }, [favs, reviewedByDay, bjToday, g, range]);

  const series: GrowthSeries[] = [
    { key: "added", label: en ? "Added" : "新增", color: BLUE },
    { key: "reviewed", label: en ? "Reviewed" : "复习", color: ORANGE },
    { key: "mastered", label: en ? "Mastered" : "掌握", color: GREEN },
  ];

  return (
    <div className="mt-3 rounded-2xl border border-slate-100 bg-white px-4 py-3.5 shadow-sm">
      <GrowthChart
        title={en ? "Vocabulary Growth" : "词汇成长"}
        series={series}
        axis={axis}
        gran={g}
        range={range}
        onRange={setRange}
        en={en}
        valuesOf={(k) => {
          const b = data.get(k);
          return [b?.added ?? 0, b?.reviewed ?? 0, b?.mastered ?? 0];
        }}
      />
    </div>
  );
}
