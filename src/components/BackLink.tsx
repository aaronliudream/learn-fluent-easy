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
   * - 否则（直接打开链接、刷新过、或外部进入）→ 用 replace 导到 `to` fallback
   *   用 replace 而不是 push 是为了避免循环：如果 A 页直达 → 用 fallback 到 B 页，
   *   B 页再点返回时 navigate(-1) 会回到 A 页，形成 A↔B 死循环。
   *   replace 不增长历史栈，B 页的返回会落到 B 自己的 fallback。
   */
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    const hasHistory = typeof window !== "undefined" && window.history.length > 1
      && (window.history.state?.idx ?? 0) > 0;
    e.preventDefault();
    if (hasHistory) {
      navigate(-1);
    } else {
      navigate(to, { replace: true });
    }
  };

  return (
    <Link ref={ref} to={to} className={className} onClick={handleClick} aria-label={ariaLabel}>
      {children}
    </Link>
  );
});

export default BackLink;