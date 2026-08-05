/**
 * 顶部统计双视图:圆环 / 柱状图,右上角滑钮切换。
 *
 * 严格照 docs/vocab-bank/VOCAB_DESIGN_SPEC.md:
 *   · 偏好存 localStorage(key vocab_stats_view),默认圆环,读到非法值回落 ring
 *   · 动效白名单只两处在本组件:环扫出 600ms / count-up 800ms
 *   · 切换本身**无动画**;切过去之后该视图的入场动效照常放一次
 *   · 统计数字 40-56px + tabular-nums(不加等宽,count-up 过程中整行会左右抖)
 *   · 尊重 prefers-reduced-motion:命中时直接落终值
 */
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { FONT_STAT, readStatsView, writeStatsView, type StatsView } from "@/lib/vocab/theme";
import VocabGrowth from "@/components/vocab/VocabGrowth";

function prefersReduced(): boolean {
  try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { return false; }
}

/** 数字 0 → value,800ms。reduced-motion 时直接给终值。 */
function CountUp({ value, className, style }: { value: number; className?: string; style?: React.CSSProperties }) {
  const [n, setN] = useState(() => (prefersReduced() ? value : 0));
  const ref = useRef<number | null>(null);
  useEffect(() => {
    if (prefersReduced()) { setN(value); return; }
    const t0 = performance.now();
    const from = 0;
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / 800);
      // easeOutCubic:末尾减速,读数落定时不显得突兀
      const e = 1 - Math.pow(1 - p, 3);
      setN(Math.round(from + (value - from) * e));
      if (p < 1) ref.current = requestAnimationFrame(step);
    };
    ref.current = requestAnimationFrame(step);
    return () => { if (ref.current) cancelAnimationFrame(ref.current); };
  }, [value]);
  return (
    <span className={className} style={{ fontVariantNumeric: "tabular-nums", ...style }}>{n}</span>
  );
}

type Props = {
  mastered: number;
  learning: number;
  untouched: number;
  /** 环/柱主色(词库身份色);中心页用中性色。 */
  color?: string;
  /** 未登录 / 无数据时的引导文案 */
  emptyHint?: string;
  /** 成长图的统计范围:传了就只统计这些词(词库页),不传统计全部(中心页)。 */
  growthWordIds?: string[];
};

export default function StatsPanel({ mastered, learning, untouched, color = "#0F172A", emptyHint, growthWordIds }: Props) {
  const [view, setView] = useState<StatsView>("ring");
  const [shown, setShown] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => { setView(readStatsView()); }, []);

  // 首次进入视口才放入场动效(spec:环扫出触发一次)
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    if (prefersReduced()) { setShown(true); return; }
    let io: IntersectionObserver | null = null;
    try {
      io = new IntersectionObserver((es) => {
        if (es.some(e => e.isIntersecting)) { setShown(true); io?.disconnect(); }
      }, { threshold: 0.3 });
      io.observe(el);
    } catch {
      setShown(true); // 老浏览器没有 IO,直接显示终态,别让统计区空着
    }
    return () => io?.disconnect();
  }, []);

  const total = Math.max(0, mastered + learning + untouched);
  const pct = total > 0 ? mastered / total : 0;
  const isEmpty = total === 0 || (mastered === 0 && learning === 0);

  const pick = (v: StatsView) => { setView(v); writeStatsView(v); };

  const R = 54, C = 2 * Math.PI * R;

  return (
    <div ref={boxRef} className="rounded-2xl border border-black/[0.08] bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[15px] font-semibold text-slate-900">学习进度</h2>
        {/* 滑钮:白底细边,不用渐变 */}
        <div className="flex rounded-full border border-black/[0.08] p-0.5" role="tablist" aria-label="统计视图">
          {(["ring", "bar"] as StatsView[]).map(v => (
            <button
              key={v}
              role="tab"
              aria-selected={view === v}
              onClick={() => pick(v)}
              className={cn(
                "rounded-full px-3 py-1 text-[12px] font-medium",
                view === v ? "bg-slate-900 text-white" : "text-slate-500",
              )}
            >
              {v === "ring" ? "圆环" : "柱状"}
            </button>
          ))}
        </div>
      </div>

      {view === "ring" ? (
        <div className="flex items-center gap-5">
          <svg width="128" height="128" viewBox="0 0 128 128" className="shrink-0" aria-hidden>
            <circle cx="64" cy="64" r={R} fill="none" stroke="#EEF2F6" strokeWidth="10" />
            <circle
              cx="64" cy="64" r={R} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
              transform="rotate(-90 64 64)"
              style={{
                strokeDasharray: C,
                strokeDashoffset: shown ? C * (1 - pct) : C,
                transition: prefersReduced() ? undefined : "stroke-dashoffset 600ms cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            />
          </svg>
          <div className="min-w-0">
            <div className="flex items-baseline gap-1">
              <CountUp value={mastered} className="text-slate-900" style={{ fontFamily: FONT_STAT, fontSize: "clamp(40px, 12vw, 56px)", fontWeight: 700, lineHeight: 1 }} />
              <span className="text-[13px] text-slate-400">/ {total}</span>
            </div>
            <div className="mt-1 text-[13px] text-slate-500">已掌握</div>
            <div className="mt-3 space-y-1 text-[12px] text-slate-500">
              <div>学习中 <span style={{ fontVariantNumeric: "tabular-nums" }} className="font-medium text-slate-700">{learning}</span></div>
              <div>未开始 <span style={{ fontVariantNumeric: "tabular-nums" }} className="font-medium text-slate-700">{untouched}</span></div>
            </div>
          </div>
        </div>
      ) : (
        /* 柱状 = **按日成长图**(竖向三色柱 + 日期轴 + 时间档),不是横向存量条。
         * 横向存量条只是把圆环的信息换个方向再说一遍,对用户零增量;
         * 成长图回答的是另一个问题:"我这几天到底在往前走吗"。
         * 视觉与 /library/vocab 的「词汇成长」同源(共用 GrowthChart)。 */
        <VocabGrowth wordIds={growthWordIds} />
      )}

      {/* 空态提示只在圆环视图给;柱状视图的空态由成长图自己画坐标轴 + 文案 */}
      {view === "ring" && isEmpty && emptyHint && (
        <p className="mt-4 rounded-xl bg-slate-50 px-3 py-2.5 text-[13px] leading-relaxed text-slate-500">
          {emptyHint}
        </p>
      )}
    </div>
  );
}
