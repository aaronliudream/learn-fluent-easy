import { useEffect, useState } from "react";

/**
 * Floating "+N XP" burst that appears at a screen position then drifts up
 * and fades out. Trigger by incrementing the `trigger` prop. Position
 * defaults to top-center of the viewport. Cheap CSS-only animation.
 */
export function XPBurst({
  trigger,
  amount = 1,
  label = "XP",
}: {
  trigger: number;
  amount?: number;
  label?: string;
}) {
  const [bursts, setBursts] = useState<{ id: number; amount: number }[]>([]);

  useEffect(() => {
    if (trigger <= 0) return;
    const id = Date.now() + Math.random();
    setBursts((b) => [...b, { id, amount }]);
    const t = window.setTimeout(() => {
      setBursts((b) => b.filter((x) => x.id !== id));
    }, 1200);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  if (bursts.length === 0) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed left-1/2 top-24 z-[60] -translate-x-1/2"
    >
      {bursts.map((b) => (
        <div
          key={b.id}
          className="rounded-full bg-accent px-3 py-1 text-sm font-extrabold text-accent-foreground shadow-lg"
          style={{
            animation: "xp-burst 1.1s ease-out forwards",
          }}
        >
          +{b.amount} {label}
        </div>
      ))}
    </div>
  );
}