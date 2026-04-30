import { useEffect, useRef } from "react";

/**
 * Returns a function `register(idx)` that gives you a ref-callback to attach
 * to each item in a list. Whenever `activeIdx` changes to a non-null value,
 * the corresponding element is scrolled into view smoothly, centered in the
 * viewport so the user never has to scroll manually while audio plays.
 *
 * Avoids triggering on the user's own scroll — only re-centers when the
 * active index actually changes.
 */
export function useScrollToActive(activeIdx: number | null) {
  const refs = useRef<Record<number, HTMLElement | null>>({});

  useEffect(() => {
    if (activeIdx == null) return;
    const el = refs.current[activeIdx];
    if (!el) return;
    // Defer so layout (active-class style change) is committed first.
    const id = window.requestAnimationFrame(() => {
      try {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      } catch {
        el.scrollIntoView();
      }
    });
    return () => window.cancelAnimationFrame(id);
  }, [activeIdx]);

  return (idx: number) => (node: HTMLElement | null) => {
    refs.current[idx] = node;
  };
}