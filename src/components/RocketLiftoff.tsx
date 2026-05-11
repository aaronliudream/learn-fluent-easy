import { useEffect, useMemo } from "react";

/** Full-screen rocket liftoff celebration shown when all 30 lessons are done. */
export default function RocketLiftoff({
  onClose,
  onBackToMap,
}: {
  onClose: () => void;
  onBackToMap: () => void;
}) {
  // Random star positions, stable across renders.
  const stars = useMemo(
    () =>
      Array.from({ length: 36 }).map(() => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 1.5,
        size: 8 + Math.random() * 14,
      })),
    []
  );

  useEffect(() => {
    const t = window.setTimeout(() => {
      // Optional auto-dismiss: keep overlay open for user; do nothing here.
    }, 4500);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden bg-gradient-to-b from-indigo-950 via-purple-950 to-black">
      {/* Stars */}
      {stars.map((s, i) => (
        <span
          key={i}
          className="star-twinkle absolute select-none"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            fontSize: `${s.size}px`,
            animationDelay: `${s.delay}s`,
          }}
        >
          ⭐
        </span>
      ))}

      {/* Rocket */}
      <div
        className="rocket-liftoff absolute left-1/2 -translate-x-1/2 text-center"
        style={{ bottom: "10%" }}
      >
        <div className="text-[120px] leading-none">🚀</div>
        <div className="rocket-flame mx-auto -mt-2 text-5xl">🔥</div>
      </div>

      {/* Caption */}
      <div className="pointer-events-none absolute inset-x-0 top-[18%] px-6 text-center text-white">
        <div className="text-3xl font-extrabold drop-shadow-lg">
          🚀 Spark 飞向月球啦!
        </div>
        <div className="mt-2 text-base font-bold opacity-90">
          你完成了全部 30 节,Spark 终于能起飞了
        </div>
        <div className="mt-6 inline-block rounded-2xl bg-white/15 px-5 py-3 text-base font-extrabold backdrop-blur">
          🛸 终极徽章:Spark 飞行员
        </div>
      </div>

      {/* Action */}
      <div className="absolute inset-x-0 bottom-8 flex justify-center gap-3 px-6">
        <button
          onClick={onBackToMap}
          className="rounded-full bg-white px-6 py-3 text-base font-extrabold text-indigo-700 shadow-tile"
        >
          回到地图
        </button>
        <button
          onClick={onClose}
          className="rounded-full border-2 border-white/60 px-6 py-3 text-base font-bold text-white"
        >
          关闭
        </button>
      </div>
    </div>
  );
}