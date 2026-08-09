/**
 * 学习进度卡 —— 四条横向进度条(Aaron 2026-08-09 定版)。
 *
 * 从上到下:已掌握 / 学习中 / 未开始 / 总词数。
 * 每条 = 左侧标签 + 横条 + 右侧「N 词 · X%」;总词数那条只写「N 词」,不写比例。
 *
 * ⚰️ 圆环 / 柱状切换器已删。理由:
 *    · 圆环只画得出"已掌握占比"一件事,学习中和未开始只能挤在旁边当小字;
 *    · 「柱状」那一档其实是**按日成长图**,回答的是"我这几天在往前走吗",
 *      和存量进度根本不是同一个问题,塞进同一个切换器里等于让用户
 *      在两种问题之间切换,而不是在两种画法之间切换。
 *    现在:存量走四条横条,成长图单独一行(见文件末尾)。
 *
 * ⚠️ **口径冲突已知**:这个文件原先有一条约束是"中心页不显示分母"
 *    (showDenominator=false),理由是"分母是某一个库的词数,放在全站中心页
 *    语义就是错的"。四条横条里的第四行「总词数」就是那个分母。
 *    Aaron 2026-08-09 明确要这一行,所以照做 —— 但要知道这两件事是打架的。
 *    缓解:它只是最后一行的小字汇总,不是原来那个 44-56px 的巨大 hero 数字;
 *    而且中心页的这张卡本来就属于"当前词库"那一层(见 VocabCenter 文件头)。
 *
 * ⚠️ 数字为 0 时条长给 3px 最小宽度,**不许消失** —— 一条彻底看不见的行会
 *    被读成"这个分类不存在",而不是"这个分类现在是 0"。
 * ⚠️ 数据未就绪时走骨架屏,**绝不渲染 0**:0 是一个有意义的值,
 *    加载中显示 0 等于告诉用户"你一个词都没学",那是假信息。
 */
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { FONT_STAT, tintToWhite } from "@/lib/vocab/theme";
import VocabGrowth from "@/components/vocab/VocabGrowth";

function prefersReduced(): boolean {
  try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { return false; }
}

/** 未开始那条的灰 / 汇总行的中性色。抽成常量,免得两处各写一个色号慢慢漂开。
 *  ⚠️ 别再调浅:轨道是 rgba(0,0,0,0.05)(在白卡上约 rgb(242,242,242))。
 *     原来用 slate-300 #CBD5E1,一条 100% 的灰条和空轨道肉眼几乎分不出来 ——
 *     用户看到的是"这一行没有数据",而不是"这一行是满的"。
 *     现在 slate-400 / slate-500,与轨道拉开足够对比。 */
const GREY_UNTOUCHED = "#94A3B8";
const GREY_TOTAL = "#64748B";
/** 0 值时的最小可见宽度 */
const MIN_BAR_PX = 3;

/**
 * 一条进度行。
 * @param pct 覆盖自算的百分比(未开始那条要吸收四舍五入误差,见调用处)
 * @param hidePct 汇总行不写比例
 */
function Bar({ label, value, total, barColor, shown, pct, hidePct = false }: {
  label: string; value: number; total: number; barColor: string;
  shown: boolean; pct?: number; hidePct?: boolean;
}) {
  const ratio = total > 0 ? Math.min(1, Math.max(0, value / total)) : 0;
  const shownPct = pct ?? (total > 0 ? Math.round(ratio * 100) : 0);
  return (
    <div className="flex items-center gap-2.5">
      <span className="w-[52px] shrink-0 text-[13px] text-slate-500">{label}</span>
      <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-black/[0.05]">
        <div
          className="h-full rounded-full"
          style={{
            /* 0 值给 3px 保底;非 0 用百分比。两者不能混在一个表达式里 ——
               calc(max(3px, 0%)) 在部分浏览器上会算成 3px 却丢掉圆角过渡。 */
            width: shown ? (value > 0 ? `${ratio * 100}%` : `${MIN_BAR_PX}px`) : `${MIN_BAR_PX}px`,
            background: barColor,
            transition: prefersReduced() ? undefined : "width 600ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
      </div>
      {/* ⚠️ 宽度按**最长的那种串**留:「4470 词 · 100%」。
             78px 装不下它,会折成两行,那一行就比其它三行高一截 ——
             真机截图上一眼能看出来,而数据是全对的。
             whitespace-nowrap 是第二道保险:词库放量到五位数时宁可挤出去也别换行。 */}
      <span className="w-[96px] shrink-0 whitespace-nowrap text-right text-[12px] text-slate-500"
        style={{ fontFamily: FONT_STAT, fontVariantNumeric: "tabular-nums" }}>
        {value} 词{hidePct ? "" : ` · ${shownPct}%`}
      </span>
    </div>
  );
}

type Props = {
  mastered: number;
  learning: number;
  untouched: number;
  /** 主色(词库身份色);中心页用中性深色。 */
  color?: string;
  emptyHint?: string;
  /** 成长图统计范围:传了只统计这些词(词库页),不传统计全部(中心页)。 */
  growthWordIds?: string[];
  /** true = 数据还没到位,走骨架屏。**绝不用 0 冒充"还没加载"**。 */
  loading?: boolean;
  /** 紧凑档:内边距下调一档(中心页首屏要给上面的词库卡让位)。 */
  compact?: boolean;
};

export default function StatsPanel({
  mastered, learning, untouched, color = "#0F172A",
  emptyHint, growthWordIds, loading = false, compact = false,
}: Props) {
  const [shown, setShown] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);

  /* ⚠️ 依赖里必须有 loading。
   *    loading 时组件**提前 return 骨架屏**,boxRef 压根没挂上,
   *    这个 effect 拿到 null 就走了;依赖写成 [] 的话 loading 变 false 后
   *    它不会重跑,shown 永远停在 false ——
   *    表现是**四条进度条全部停在 3px 的保底宽度**,数据全对但一条都没画出来。
   *    截图上还很难看出来:浅灰填充和浅灰轨道几乎同色,肉眼以为"就是这样"。
   *    是量了 getComputedStyle 的实际 width 才抓到的。 */
  useEffect(() => {
    if (loading) return;                    // 骨架屏阶段没有 ref 可观察,等它过去
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
  }, [loading]);

  const total = Math.max(0, mastered + learning + untouched);
  const isEmpty = mastered === 0 && learning === 0;

  /* 浅色用**向白混色**,不用 opacity。
   * ⚠️ 由来:身份色 #0C447C 掉到 30% 透明度后是 rgb(178,193,209) ——
   *    色相基本没了,就是个浅灰蓝,和灰色轨道放一起肉眼读出来是"全灰"。
   *    混色保住色相:同样的浅,但一眼能看出是蓝的。 */
  const lightColor = tintToWhite(color, 0.62);

  /* 三条百分比要**加起来正好 100**。各自四舍五入会出现 99 或 101,
     所以把误差吸收进"未开始"那条 —— 它通常是最大的一条,吸收 1% 的相对失真最小。 */
  const pMastered = total > 0 ? Math.round((mastered / total) * 100) : 0;
  const pLearning = total > 0 ? Math.round((learning / total) * 100) : 0;
  const pUntouched = total > 0 ? Math.max(0, 100 - pMastered - pLearning) : 0;

  const shell = cn(
    "rounded-2xl border border-black/[0.06] bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]",
    compact ? "px-4 py-3" : "p-5",
  );

  if (loading) {
    return (
      <div className={cn(shell, "mt-3")} aria-busy="true" aria-label="学习进度加载中">
        <div className="mb-4 h-4 w-20 animate-pulse rounded bg-black/[0.06]" />
        <div className="space-y-2">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-2.5">
              <div className="h-3 w-[52px] shrink-0 animate-pulse rounded bg-black/[0.06]" />
              <div className="h-2 min-w-0 flex-1 animate-pulse rounded-full bg-black/[0.05]" />
              <div className="h-3 w-[96px] shrink-0 animate-pulse rounded bg-black/[0.06]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div ref={boxRef} className={cn(shell, "mt-3")}>
        <h2 className={cn("text-[16px] font-semibold text-slate-900", compact ? "mb-3" : "mb-4")}>学习进度</h2>

        <div className="space-y-2">
          <Bar label="已掌握" value={mastered} total={total} barColor={color} shown={shown} pct={pMastered} />
          <Bar label="学习中" value={learning} total={total} barColor={lightColor} shown={shown} pct={pLearning} />
          <Bar label="未开始" value={untouched} total={total} barColor={GREY_UNTOUCHED} shown={shown} pct={pUntouched} />
          {/* 汇总行:满条 + 中性色 + 上分隔线,与上三条明确区分。
              右侧**不写比例** —— 它就是分母,写「100%」是句废话,
              还会让人误以为它是第四个并列分类。 */}
          <div className="border-t border-black/[0.06] pt-2">
            <Bar label="总词数" value={total} total={total} barColor={GREY_TOTAL} shown={shown} hidePct />
          </div>
        </div>

        {isEmpty && emptyHint && (
          <p className={cn("rounded-xl bg-slate-50 px-3.5 text-[14px] leading-relaxed text-slate-500", compact ? "mt-3 py-2.5" : "mt-4 py-3")}>
            {emptyHint}
          </p>
        )}
      </div>

      {/* 成长图单独一行,不再和进度卡挤在一起(Aaron 2026-08-09)。
          它回答的是"这几天有没有在往前走",与上面的存量分布是两个问题,
          共处一张卡里、还共用一个切换器,只会让两个都说不清。 */}
      {/* ⚠️ 这张卡**不给标题**(Aaron 2026-08-09):图内左上角已经有
          「词汇成长 · 本周新掌握 +N」那一行,再加一个「每日成长」大标题
          就是同一件事说两遍,还白占一行高度。 */}
      <div className={cn(shell, "mt-3")}>
        <VocabGrowth wordIds={growthWordIds} />
      </div>
    </>
  );
}
