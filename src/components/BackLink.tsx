import { ReactNode, MouseEvent, forwardRef } from "react";
import { Link, useNavigate } from "react-router-dom";

type Props = {
  /** Fallback route if there's no history to go back to */
  to: string;
  className?: string;
  children: ReactNode;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
  ariaLabel?: string;
};

/**
 * Smart back link: goes to the previous page in history.
 * Falls back to `to` if there is no in-app history (e.g. opened directly).
 */
const BackLink = forwardRef<HTMLAnchorElement, Props>(function BackLink({ to, className, children, onClick, ariaLabel }, ref) {
  const navigate = useNavigate();

  /**
   * 智能返回：
   * - 如果浏览器有 in-app 历史 → 走 history.back()，返回真正的上一页
   * - 否则（直接打开链接、刷新过、或外部进入）→ 落到 `to` fallback
   * 这样用户从「列表 → 详情」点返回会回到列表，不会被踢到首页。
   */
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    // 只在 SPA 内有历史栈时才用 back()
    const hasHistory = typeof window !== "undefined" && window.history.length > 1
      && (window.history.state?.idx ?? 0) > 0;
    if (hasHistory) {
      e.preventDefault();
      navigate(-1);
    }
    // 否则让 <Link to={to}> 走默认导航
  };

  return (
    <Link ref={ref} to={to} className={className} onClick={handleClick} aria-label={ariaLabel}>
      {children}
    </Link>
  );
});

export default BackLink;