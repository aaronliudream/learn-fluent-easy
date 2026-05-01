import { useEffect, useState } from "react";
import { getXPPreset, type Intensity } from "@/lib/feedback";

/**
 * Floating "+N XP" burst. Trigger by incrementing the `trigger` prop.
 * Visual intensity (duration, drift distance) is centrally configured in
 * `@/lib/feedback` so all in-app celebrations share the same rhythm.
 * Coalesces rapid triggers into a single visible burst to avoid stacking.
 */
export function XPBurst({
  trigger,
  amount = 1,
  label = "XP",
  intensity = "subtle",
}: {
  trigger: number;
  amount?: number;
  label?: string;
  intensity?: Intensity;
}) {
  const [bursts, setBursts] = useState<{ id: number; amount: number }[]>([]);
  const preset = getXPPreset(intensity);

  useEffect(() => {
    if (trigger <= 0) return;
    // Coalesce: if a burst is already on screen, skip — prevents stacked spam
    // when the user blasts through several questions in a row.
    setBursts((b) => {
      if (b.length > 0) return b;
      const id = Date.now() + Math.random();
      return [...b, { id, amount }];
    });
    const t = window.setTimeout(() => {
      setBursts([]);
    }, preset.durationMs);
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
            animation: `xp-burst ${preset.durationMs}ms ease-out forwards`,
            // Custom drift distance fed to the keyframe via CSS var
            ["--xp-drift" as never]: `-${preset.driftPx}px`,
          }}
        >
          +{b.amount} {label}
        </div>
      ))}
    </div>
  );
}