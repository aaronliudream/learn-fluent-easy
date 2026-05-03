import { ReactNode, MouseEvent } from "react";
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
export default function BackLink({ to, className, children, onClick, ariaLabel }: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    // Detect in-app history. `idx` is set by react-router for entries it created.
    const state = (location.state ?? null) as { idx?: number } | null;
    const hasInAppHistory =
      (state && typeof state.idx === "number" && state.idx > 0) ||
      window.history.length > 1;
    if (hasInAppHistory) {
      e.preventDefault();
      navigate(-1);
    }
    // else: let the <Link> navigate to the fallback `to`
  };

  return (
    <Link to={to} className={className} onClick={handleClick} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}