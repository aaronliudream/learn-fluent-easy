/**
 * 顶部统计双视图:圆环 / 柱状成长图,右上角滑钮切换。
 *
 * 严格照 docs/vocab-bank/VOCAB_DESIGN_SPEC.md:
 *   · 偏好存 localStorage(vocab_stats_view),默认圆环,非法值回落 ring
 *   · 动效白名单只两处在本组件:环扫出 600ms / count-up 800ms
 *   · 切换本身无动画;切过去后该视图的入场动效放一次
 *   · 掌握大字 40-56px + tabular-nums(不等宽,count-up 过程整行会左右抖)
 *   · 尊重 prefers-reduced-motion:命中直接落终值
 *
 * ⚠️ showDenominator=false 时**只显示「已掌握 N」大字,不显示 /总数**。
 *    中心页必须这样:那里的分母是"某一个库的词数",放在全站中心页语义就是错的,
 *    而且词库越加越多时它会变成一个劝退分母。进度感交给里程碑徽章链。
 *    「N / 总数」这种形态只保留在各词库详情页。
 */
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { FONT_STAT, readStatsView, tintToWhite, writeStatsView, type StatsView } from "@/lib/vocab/theme";
import VocabGrowth from "@/components/vocab/VocabGrowth";

function prefersReduced(): boolean {
  try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { return false; }
}

/** 数字 0 → value,800ms。reduced-motion 时直接给终值。 */
function CountUp({ value, className, style }: { value: number; className?: string; style?: React.CSSProperties }) {
  const [n, setN] = useState(() => (prefersReduced() ? value : 0));
  const raf = useRef<number | null>(null);
  useEffect(() => {
    if (prefersReduced()) { setN(value); return; }
    const t0 = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / 800);
      const e = 1 - Math.pow(1 - p, 3);      // easeOutCubic:落定时不突兀
      setN(Math.round(value * e));
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [value]);
  return <span className={className} style={{ fontVariantNumeric: "tabular-nums", ...style }}>{n}</span>;
}

type Props = {
  mastered: number;
  learning: number;
  untouched: number;
  /** 累计已测词数(只涨不跌)。与掌握数构成「实力 + 努力」双成就。 */
  tested?: number;
  /** 环/柱主色(词库身份色);中心页用中性深色。 */
  color?: string;
  emptyHint?: string;
  /** 成长图统计范围:传了只统计这些词(词库页),不传统计全部(中心页)。 */
  growthWordIds?: string[];
  /** false = 只显示「已掌握 N」,不显示 /总数(中心页)。 */
  showDenominator?: boolean;
  /**
   * 紧凑档:内边距、圆环直径、大字全下调一档。
   * ⚠️ 中心页首屏要在 iPhone SE(375×667)不滚动就装下
   *    标题+词库下拉+本卡+两张小卡,这卡是唯一还能压的大块。
   *    压的是**留白和字号**,不是信息 —— 一个数字都没少。
   */
  compact?: boolean;
};

export default function StatsPanel({
  mastered, learning, untouched, tested, color = "#0F172A",
  emptyHint, growthWordIds, showDenominator = true, compact = false,
}: Props) {
  const [view, setView] = useState<StatsView>("ring");
  const [shown, setShown] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => { setView(readStatsView()); }, []);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    if (prefersReduced()) { setShown(true); return; }
    let io: IntersectionObserver | null = null;
    try {
      io = new IntersectionObserver(es => {
        if (es.some(e => e.isIntersecting)) { setShown(true); io?.disconnect(); }
      }, { threshold: 0.3 });
      io.observe(el);
    } catch { setShown(true); }
    return () => io?.disconnect();
  }, []);

  const total = Math.max(0, mastered + learning + untouched);
  const pct = total > 0 ? mastered / total : 0;
  /* 环身要画**两段**:深身份色=已掌握,浅身份色=学习中。
   * ⚠️ 由来:实测"学习中 64"时圆环全空 —— 环只绑定了 mastered。
   *    头四天不可能有任何 mastered(掌握判定要 4 个不同日期),
   *    于是新用户前四天看到的永远是全灰环,努力完全不可见。
   *    环心大字仍是"已掌握 N"(口径不变),但环身必须让努力看得见。 */
  const pctReached = total > 0 ? (mastered + learning) / total : 0;
  const isEmpty = mastered === 0 && learning === 0;
  const pick = (v: StatsView) => { setView(v); writeStatsView(v); };

  /* 浅段用**向白混色**得到的真浅色,不用 opacity。
   * ⚠️ 由来:第一版写的是 strokeOpacity={0.3}。身份色 #0C447C 是深海军蓝,
   *    掉到 30% 之后是 rgb(178,193,209) —— **色相基本没了,就是个浅灰蓝**,
   *    和 #EFF1F5 的轨道放一起,肉眼(和截图)读出来就是"全灰"。
   *    环画了、数据也对,但用户看到的是没生效。
   *    混色保住色相:同样的浅,但一眼能看出是蓝的。
   * ⚠️ 实现搬到 theme.ts 的 tintToWhite —— 这套混色现在中心页的词库卡也要用,
   *    两处各写一份必然漂移。 */
  const lightColor = tintToWhite(color, 0.62);

  /* 紧凑档的几何:环 96px(R=40),常规 128px(R=54)。
   * 描边宽度同步下调,否则小环配 11px 粗边看起来是个"甜甜圈糊了"。 */
  const BOX = compact ? 96 : 128;
  const R = compact ? 40 : 54;
  const SW = compact ? 9 : 11;
  const C = 2 * Math.PI * R;
  /* 空态不画纯灰圈:给一段浅身份色引导弧(12% 周长),
   * 让空环看起来是"还没走到"而不是"坏了"。 */
  const emptyArc = C * 0.12;

  return (
    <div ref={boxRef} className={cn(
      "rounded-2xl border border-black/[0.06] bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]",
      compact ? "p-4" : "p-5",
    )}>
      <div className={cn("flex items-center justify-between", compact ? "mb-3" : "mb-4")}>
        <h2 className="text-[16px] font-semibold text-slate-900">学习进度</h2>
        <div className="flex rounded-full border border-black/[0.08] p-0.5" role="tablist" aria-label="统计视图">
          {(["ring", "bar"] as StatsView[]).map(v => (
            <button
              key={v} role="tab" aria-selected={view === v} onClick={() => pick(v)}
              className={cn("rounded-full px-3 py-1 text-[13px] font-medium",
                view === v ? "bg-slate-900 text-white" : "text-slate-500")}
            >
              {v === "ring" ? "圆环" : "柱状"}
            </button>
          ))}
        </div>
      </div>

      {view === "ring" ? (
        <div className={cn("flex items-center", compact ? "gap-4" : "gap-5")}>
          <svg width={BOX} height={BOX} viewBox={`0 0 ${BOX} ${BOX}`} className="shrink-0" aria-hidden>
            <circle cx={BOX / 2} cy={BOX / 2} r={R} fill="none" stroke="#EFF1F5" strokeWidth={SW} />
            {isEmpty ? (
              /* 空态引导弧:浅身份色,提示"从这里开始" */
              <circle
                cx={BOX / 2} cy={BOX / 2} r={R} fill="none" stroke={color} strokeOpacity={0.25} strokeWidth={SW}
                strokeLinecap="round" transform={`rotate(-90 ${BOX / 2} ${BOX / 2})`}
                style={{ strokeDasharray: `${emptyArc} ${C}`, strokeDashoffset: 0 }}
              />
            ) : (
              <>
                {/* 浅段 = 已掌握 + 学习中(先画,被深段盖住前半) */}
                <circle
                  cx={BOX / 2} cy={BOX / 2} r={R} fill="none" stroke={lightColor} strokeWidth={SW}
                  strokeLinecap="round" transform={`rotate(-90 ${BOX / 2} ${BOX / 2})`}
                  style={{
                    strokeDasharray: C,
                    strokeDashoffset: shown ? C * (1 - pctReached) : C,
                    transition: prefersReduced() ? undefined : "stroke-dashoffset 600ms cubic-bezier(0.22, 1, 0.36, 1)",
                  }}
                />
                {/* 深段 = 已掌握。mastered 为 0 时这段自然不显示,浅段独自撑起环身 */}
                <circle
                  cx={BOX / 2} cy={BOX / 2} r={R} fill="none" stroke={color} strokeWidth={SW} strokeLinecap="round"
                  transform={`rotate(-90 ${BOX / 2} ${BOX / 2})`}
                  style={{
                    strokeDasharray: C,
                    strokeDashoffset: shown ? C * (1 - pct) : C,
                    transition: prefersReduced() ? undefined : "stroke-dashoffset 600ms cubic-bezier(0.22, 1, 0.36, 1)",
                  }}
                />
              </>
            )}
          </svg>

          <div className="min-w-0">
            {/* 全页最大的字就是这个数 */}
            <div className="flex items-baseline gap-1.5">
              <CountUp
                value={mastered}
                className="text-slate-900"
                style={{
                  fontFamily: FONT_STAT, fontWeight: 700, lineHeight: 1, letterSpacing: "-0.02em",
                  fontSize: compact ? "clamp(34px, 10vw, 44px)" : "clamp(44px, 13vw, 56px)",
                }}
              />
              {showDenominator && <span className="text-[14px] text-slate-400">/ {total}</span>}
            </div>
            <div className={cn("text-[14px] font-medium text-slate-600", compact ? "mt-1" : "mt-1.5")}>已掌握</div>
            <div className={cn(
              "flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-slate-500",
              compact ? "mt-2" : "mt-3",
            )}>
              <span>学习中 <b className="font-semibold text-slate-800" style={{ fontVariantNumeric: "tabular-nums" }}>{learning}</b></span>
              {typeof tested === "number"
                ? <span>已测 <b className="font-semibold text-slate-800" style={{ fontVariantNumeric: "tabular-nums" }}>{tested}</b></span>
                : <span>未开始 <b className="font-semibold text-slate-800" style={{ fontVariantNumeric: "tabular-nums" }}>{untouched}</b></span>}
            </div>
          </div>
        </div>
      ) : (
        /* 柱状 = 按日成长图(竖向三色柱 + 日期轴 + 时间档),不是横向存量条。
         * 横向存量条只是把圆环的信息换个方向再说一遍;成长图回答的是
         * "我这几天到底在往前走吗"。视觉与 /library/vocab 同源(共用 GrowthChart)。 */
        <VocabGrowth wordIds={growthWordIds} />
      )}

      {view === "ring" && isEmpty && emptyHint && (
        <p className={cn("rounded-xl bg-slate-50 px-3.5 text-[14px] leading-relaxed text-slate-500", compact ? "mt-3 py-2.5" : "mt-4 py-3")}>
          {emptyHint}
        </p>
      )}
    </div>
  );
}
