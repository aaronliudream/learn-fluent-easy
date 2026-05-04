import { ReactNode, MouseEvent, forwardRef } from "react";
import { Link } from "react-router-dom";

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
  return (
    <Link ref={ref} to={to} className={className} onClick={onClick} aria-label={ariaLabel}>
      {children}
    </Link>
  );
});

export default BackLink;