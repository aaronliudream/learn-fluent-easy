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
  label = "能力",
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

  // 延迟满足 / 内在动机设计：把"+N XP"重塑为"能力 +0.x% 📈"。
  // 让孩子把注意力从"赚取"转向"成长"，而不是货币累积。
  const pct = (b: { amount: number }) => (b.amount * 0.3).toFixed(1);

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
          {label} +{pct(b)}% 📈
        </div>
      ))}
    </div>
  );
}