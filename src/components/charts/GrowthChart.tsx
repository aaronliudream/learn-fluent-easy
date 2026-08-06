/**
 * 成长图(纯展示)—— 竖向分组柱 + Y 轴刻度 + 横网格 + X 轴日期 + 时间档切换 + 图例。
 *
 * 从 src/components/library/VocabGrowthChart.tsx **原样抽出渲染层**,
 * 标记/结构/间距/字号一律照搬,好让 /library/vocab 与 /vocab 两张图长得一模一样。
 * 抽出后 library 那个组件只保留"把收藏集归桶"的逻辑,渲染走这里;
 * 词汇板块则把 user_vocab_mastery 归桶后喂同一个组件。
 *
 * ⚠️ 只负责画。分桶、取数、时区一律由调用方算好传进来 ——
 *    这样两个板块的数据源怎么变都不会波及版式。
 */
import { labelOf, niceAxis, RANGES, type Gran, type RangeKey } from "@/lib/charts/growthBuckets";

export type GrowthSeries = { key: string; label: string; color: string };

const TRACK = 100; // 柱区像素高

export default function GrowthChart({
  title,
  series,
  axis,
  gran,
  valuesOf,
  range,
  onRange,
  en = false,
  headerRight,
  emptyHint,
  titleClassName = "text-lg font-extrabold text-slate-800",
  stacked = false,
}: {
  title: string;
  series: GrowthSeries[];
  /** 横轴桶键(升序) */
  axis: string[];
  gran: Gran;
  /** 取某个桶里各 series 的值,顺序与 series 一致 */
  valuesOf: (bucketKey: string) => number[];
  range: RangeKey;
  onRange: (r: RangeKey) => void;
  en?: boolean;
  /** 标题右侧的补充信息(如"本周新掌握 +N") */
  headerRight?: React.ReactNode;
  /** 全 0 时显示的引导文案(坐标轴照画,不留空白) */
  emptyHint?: string;
  /** 默认值是 library 那张图的原始标题样式 —— 抽取时不能顺手改了它的观感。 */
  titleClassName?: string;
  /**
   * 堆叠模式:同一天的各 series 叠成**一根柱**,而不是并排几根。
   * ⚠️ 默认 false —— 图书馆那张图不传这个 prop,观感一个像素都不变。
   *    词汇侧要它是因为「掌握」和「学习中」是同一批词的两个阶段,
   *    并排会读成"两件独立的事",叠起来才看得出"今天一共动了多少词"。
   */
  stacked?: boolean;
}) {
  let max = 0;
  /* ⚠️ 堆叠时纵轴上限要按**每桶的和**取,不是按单个 series 的最大值 ——
   *    否则叠起来的柱子会顶出画布。 */
  for (const k of axis) {
    const vals = valuesOf(k);
    if (stacked) max = Math.max(max, vals.reduce((a, b) => a + (b || 0), 0));
    else for (const v of vals) max = Math.max(max, v);
  }
  const { niceMax, ticks } = niceAxis(max);
  const isEmpty = max === 0;

  const bar = (n: number, color: string) => (
    <div
      className="w-3 sm:w-3.5"
      style={{ height: `${niceMax > 0 && n > 0 ? Math.max(3, (n / niceMax) * TRACK) : 0}px`, backgroundColor: color }}
    />
  );

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-baseline gap-2">
          <span className={titleClassName}>{title}</span>
          {headerRight}
        </div>
        <div className="flex shrink-0 rounded-full bg-slate-100 p-0.5">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => onRange(r)}
              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold transition ${
                range === r ? "bg-white text-sky-700 shadow-sm" : "text-slate-500"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* 三色分组柱 + Y轴刻度(自动调节) + 横网格线;柱为长方形(顶不圆角) */}
      <div className="mt-3 flex">
        <div
          className="mr-2 flex shrink-0 flex-col justify-between py-0 text-right text-[10px] tabular-nums text-slate-400"
          style={{ height: TRACK }}
        >
          {[...ticks].reverse().map((t, i) => (
            <span key={i} className="leading-none">{t}</span>
          ))}
        </div>
        <div className="min-w-0 flex-1 overflow-x-auto pb-1">
          <div className="mx-auto w-max">
            <div className="relative flex items-end gap-3" style={{ height: TRACK }}>
              {ticks.map((t, i) => (
                <div
                  key={`grid-${i}`}
                  className="pointer-events-none absolute inset-x-0 border-t border-slate-100"
                  style={{ bottom: `${(t / niceMax) * TRACK}px` }}
                />
              ))}
              {axis.map((k) => {
                const vals = valuesOf(k);
                return (
                  <div key={k} className="flex w-14 items-end justify-center gap-1" style={{ height: TRACK }}>
                    {stacked ? (
                      /* 堆叠:一根柱,自下而上按 series 顺序叠。
                         第一个 series 在最下面(词汇侧传的是「已掌握」),
                         视觉上"扎实的部分"托底,与圆环的深浅关系一致。 */
                      <span className="flex w-3 flex-col-reverse sm:w-3.5">
                        {series.map((s, i) => (
                          <span key={s.key} className="w-full"
                            style={{
                              height: `${niceMax > 0 && (vals[i] ?? 0) > 0 ? Math.max(3, ((vals[i] ?? 0) / niceMax) * TRACK) : 0}px`,
                              backgroundColor: s.color,
                            }} />
                        ))}
                      </span>
                    ) : (
                      series.map((s, i) => <span key={s.key}>{bar(vals[i] ?? 0, s.color)}</span>)
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-1 flex gap-3">
              {axis.map((k) => (
                <span key={k} className="w-14 whitespace-nowrap text-center text-[10px] text-slate-400">
                  {labelOf(k, gran, en)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-1 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
        {series.map((s) => (
          <span key={s.key} className="inline-flex items-center gap-1">
            <span className="size-2.5 rounded-sm" style={{ backgroundColor: s.color }} /> {s.label}
          </span>
        ))}
      </div>

      {isEmpty && emptyHint && (
        <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2.5 text-center text-[13px] leading-relaxed text-slate-500">
          {emptyHint}
        </p>
      )}
    </div>
  );
}
