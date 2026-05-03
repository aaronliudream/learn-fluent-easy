import { forwardRef, ReactNode, MouseEvent } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";

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
const BackLink = forwardRef<HTMLAnchorElement, Props>(function BackLink(
  { to, className, children, onClick, ariaLabel },
  ref,
) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    const state = (location.state ?? null) as { idx?: number } | null;
    const hasInAppHistory =
      (state && typeof state.idx === "number" && state.idx > 0) ||
      window.history.length > 1;
    if (hasInAppHistory) {
      e.preventDefault();
      navigate(-1);
    }
  };

  return (
    <Link ref={ref} to={to} className={className} onClick={handleClick} aria-label={ariaLabel}>
      {children}
    </Link>
  );
});

export default BackLink;