import { useEffect, useRef, useState, useCallback } from "react";

export type DragPos = { x: number; y: number } | null;

/**
 * Make a floating element draggable by mouse / touch.
 * - Persists offset in localStorage by `storageKey`.
 * - Distinguishes drag from click: returns `wasDragging()` to suppress click.
 * - Keeps element within viewport on drag end + window resize.
 *
 * Element should be `position: fixed`. We translate via inline `style.transform`.
 */
export function useDraggable(storageKey: string) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState<DragPos>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });
  const [dragging, setDragging] = useState(false);
  const draggingRef = useRef(false);
  const movedRef = useRef(false);
  const startRef = useRef({ x: 0, y: 0, baseX: 0, baseY: 0 });

  const clamp = useCallback((p: { x: number; y: number }) => {
    const el = ref.current;
    if (!el || typeof window === "undefined") return p;
    const rect = el.getBoundingClientRect();
    // rect already includes the current transform; convert to "natural" rect
    const naturalLeft = rect.left - (pos?.x ?? 0);
    const naturalTop = rect.top - (pos?.y ?? 0);
    const minX = -naturalLeft + 4;
    const maxX = window.innerWidth - naturalLeft - rect.width - 4;
    const minY = -naturalTop + 4;
    const maxY = window.innerHeight - naturalTop - rect.height - 4;
    return {
      x: Math.min(Math.max(p.x, minX), maxX),
      y: Math.min(Math.max(p.y, minY), maxY),
    };
  }, [pos]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    // Only left mouse button or touch/pen
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const el = ref.current;
    if (!el) return;
    draggingRef.current = true;
    movedRef.current = false;
    startRef.current = {
      x: e.clientX,
      y: e.clientY,
      baseX: pos?.x ?? 0,
      baseY: pos?.y ?? 0,
    };
    try { (e.currentTarget as Element).setPointerCapture(e.pointerId); } catch {}
  }, [pos]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    if (!movedRef.current && Math.hypot(dx, dy) > 5) {
      movedRef.current = true;
      setDragging(true);
    }
    if (movedRef.current) {
      e.preventDefault();
      setPos({ x: startRef.current.baseX + dx, y: startRef.current.baseY + dy });
    }
  }, []);

  const endDrag = useCallback(() => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setDragging(false);
    setPos((p) => {
      if (!p) return p;
      const c = clamp(p);
      try { localStorage.setItem(storageKey, JSON.stringify(c)); } catch {}
      return c;
    });
  }, [clamp, storageKey]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    try { (e.currentTarget as Element).releasePointerCapture(e.pointerId); } catch {}
    endDrag();
  }, [endDrag]);

  // Keep within viewport on resize
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onResize = () => setPos((p) => (p ? clamp(p) : p));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [clamp]);

  /** Call inside onClick to skip the click when a drag just ended. */
  const wasDragging = useCallback(() => {
    if (movedRef.current) {
      movedRef.current = false;
      return true;
    }
    return false;
  }, []);

  const style: React.CSSProperties = pos
    ? { transform: `translate(${pos.x}px, ${pos.y}px)`, touchAction: "none" }
    : { touchAction: "none" };

  return {
    ref,
    style,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
    },
    wasDragging,
    dragging,
  };
}