import { useEffect, useState } from "react";

/**
 * 消化动画 — 答对后种子飞入宠物体内"咀嚼/消化"4-6 秒。
 * 行为意图：刻意放慢节奏，弱化即时金币反馈，强化"延迟满足"。
 * 触发：监听全局事件 `seed:digest`（由 lib/currencies.ts addPendingSeed 派发）。
 * 文案：明确告诉孩子"明天到账"，建立时间认知。
 */
export function DigestionAnimation() {
  const [bursts, setBursts] = useState<{ id: number; amount: number }[]>([]);

  useEffect(() => {
    const onDigest = (e: Event) => {
      const detail = (e as CustomEvent).detail as { amount: number };
      const amount = detail?.amount ?? 1;
      const id = Date.now() + Math.random();
      setBursts((prev) => (prev.length > 0 ? prev : [{ id, amount }]));
      window.setTimeout(() => setBursts([]), 4500);
    };
    window.addEventListener("seed:digest", onDigest);
    return () => window.removeEventListener("seed:digest", onDigest);
  }, []);

  if (bursts.length === 0) return null;

  return (
    <div aria-live="polite" className="pointer-events-none fixed left-1/2 top-24 z-[60] -translate-x-1/2">
      {bursts.map((b) => (
        <div
          key={b.id}
          className="flex flex-col items-center gap-1 rounded-2xl bg-emerald-500/95 px-4 py-2 text-white shadow-xl"
          style={{ animation: "digest-pop 4500ms ease-out forwards" }}
        >
          <div className="text-xl font-extrabold">🌱 +{b.amount} 种子</div>
          <div className="text-[11px] opacity-90">宠物正在消化…明天到账</div>
        </div>
      ))}
      <style>{`
        @keyframes digest-pop {
          0%   { transform: translateY(-6px) scale(0.9); opacity: 0; }
          12%  { transform: translateY(0) scale(1.05); opacity: 1; }
          25%  { transform: translateY(0) scale(1); opacity: 1; }
          80%  { transform: translateY(8px) scale(0.96); opacity: 0.9; }
          100% { transform: translateY(40px) scale(0.6); opacity: 0; }
        }
      `}</style>
    </div>
  );
}