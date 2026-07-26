/** 通用结算覆盖层(四个词汇游戏复用)。 */
export default function GameResult({
  title,
  emoji = "🎉",
  lines,
  stars,
  onAgain,
  onHome,
  againLabel = "🔄 再来一轮",
  homeLabel = "返回游戏中心",
}: {
  title: string;
  emoji?: string;
  lines: string[];
  stars?: number; // 0..3,可选
  onAgain?: () => void; // 省略 → 不渲染"再来一轮"(图书馆复习:今日已清零时不该再给入口)
  onHome: () => void;
  againLabel?: string; // 复用方可改按钮文案(默认小学游戏中心用语)
  homeLabel?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-6">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-xl">
        <div className="text-5xl">{emoji}</div>
        <div className="mt-2 text-xl font-bold text-[#2b2b2b]">{title}</div>
        {typeof stars === "number" && (
          <div className="mt-2 text-2xl" aria-label={`${stars} 星`}>
            {"⭐".repeat(Math.max(0, stars))}
            <span className="opacity-30">{"☆".repeat(Math.max(0, 3 - stars))}</span>
          </div>
        )}
        <div className="mt-3 space-y-1 text-sm text-[#666]">
          {lines.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
        <div className="mt-5 flex flex-col gap-2">
          {onAgain && (
            <button
              type="button"
              onClick={onAgain}
              className="w-full rounded-full bg-gradient-to-r from-[#FF6B35] to-[#FFB627] py-3 font-bold text-white"
            >
              {againLabel}
            </button>
          )}
          <button
            type="button"
            onClick={onHome}
            className="w-full rounded-full bg-[#F0EDE6] py-3 font-bold text-[#666]"
          >
            {homeLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
