import { useEffect, useRef } from "react";

/**
 * 答题组件通用:选中答案后,把随之出现的操作区(确认/下一题/解析)滚进视口。
 *
 * ★为什么需要★
 * 手机竖屏下,选项列表本身就占满一屏;选完答案后「下一题」按钮渲染在选项下方,
 * 直接落在视口外,学生每答一题都要手动往下滑一次。真机验收在「听音辨词」上撞到,
 * 但全站 20+ 个答题组件是同一形态。
 *
 * ★为什么是 block:'nearest' + smooth★
 * `nearest` 只滚「够看见」的最小距离 —— 按钮已经在视口内时一动不动,不会出现
 * 每答一题页面就跳一下的反效果;`center`/`start` 会把已经可见的按钮硬拽到中间。
 * 尊重系统的「减弱动态效果」设置,开了就瞬时定位不做动画。
 *
 * ★为什么等一帧★
 * active 变真的那一次 render,按钮往往刚被挂上,布局还没落定,立刻量位置会量到旧值。
 * 放到 requestAnimationFrame 里,等这一帧画完再滚。
 *
 * 用法:
 *     const actionRef = useRevealScroll<HTMLDivElement>(picked !== null);
 *     ...
 *     {picked !== null && <div ref={actionRef}><button>下一题 →</button></div>}
 *
 * 只在 active 由假变真的那一刻滚一次;为真期间的重渲染不重复滚。
 */
export function useRevealScroll<T extends HTMLElement = HTMLDivElement>(active: boolean) {
  const ref = useRef<T | null>(null);
  const prev = useRef(false);

  useEffect(() => {
    if (active && !prev.current) {
      const id = requestAnimationFrame(() => {
        const el = ref.current;
        if (!el) return;
        const reduce =
          typeof window !== "undefined" &&
          typeof window.matchMedia === "function" &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" });
      });
      prev.current = active;
      return () => cancelAnimationFrame(id);
    }
    prev.current = active;
  }, [active]);

  return ref;
}

export default useRevealScroll;
