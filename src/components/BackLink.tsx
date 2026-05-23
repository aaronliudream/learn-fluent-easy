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
 * Back navigation: always goes to the explicit parent route (`to`) with replace,
 * never browser history.back() — avoids list ↔ detail loops when child pages push onto the stack.
 */
const BackLink = forwardRef<HTMLAnchorElement, Props>(function BackLink({ to, className, children, onClick, ariaLabel }, ref) {
  const navigate = useNavigate();

  /**
   * 始终导航到 `to` 指定的父级页面（replace），不使用 history.back()。
   * 带文案的「返回 XXX」按钮应去固定上级，而不是浏览器上一页；
   * 否则子页用 Link push 进栈后，列表页 BackLink 的 navigate(-1) 会回到子页，形成死循环。
   */
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    e.preventDefault();
    navigate(to, { replace: true });
  };

  return (
    <Link ref={ref} to={to} className={className} onClick={handleClick} aria-label={ariaLabel}>
      {children}
    </Link>
  );
});

export default BackLink;