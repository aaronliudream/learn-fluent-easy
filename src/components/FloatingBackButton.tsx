import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { T } from "@/i18n/T";

type Props = {
  /** Path to navigate to. If `true`, calls history.back(). */
  to: string | true;
  /** Pixels scrolled before the button appears. Default 240. */
  showAfter?: number;
  /** Optional override for the label shown on desktop. */
  label?: string;
};

/**
 * A large, always-reachable Back button that floats above content once the
 * user scrolls down. Designed for long reading / dialogue pages where the
 * top-of-page header back arrow is far away.
 *
 * - Mobile: round 56px button bottom-left, big enough to thumb-tap.
 * - Desktop: pill with a "Back" label.
 * - Auto-hides while the user is at the very top (the PageHeader's back
 *   arrow is already visible there).
 */
export const FloatingBackButton = ({ to, showAfter = 240, label }: Props) => {
  const nav = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > showAfter);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [showAfter]);

  return (
    <button
      type="button"
      onClick={() => (to === true ? nav(-1) : nav(to))}
      aria-label="Back"
      className={`fixed bottom-6 left-4 z-40 flex items-center gap-2 rounded-full bg-primary px-4 py-3.5 font-bold text-primary-foreground shadow-2xl shadow-primary/40 ring-2 ring-background transition-all duration-200 hover:scale-105 active:scale-95 md:bottom-8 md:left-8 md:px-5 md:py-4 ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <ArrowLeft className="size-5 md:size-6" strokeWidth={2.5} />
      <span className="hidden text-sm font-extrabold md:inline">
        <T>{label ?? "返回"}</T>
      </span>
    </button>
  );
};