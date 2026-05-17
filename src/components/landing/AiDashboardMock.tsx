/** AI Banner 左侧仿真数据看板 — 纯 HTML/CSS，非图片 */

export default function AiDashboardMock() {
  return (
    <div
      className="w-full max-w-[280px] rounded-xl border border-white/10 bg-[#0f1f38] p-3 shadow-inner"
      aria-hidden>
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
        <span className="text-[10px] font-bold uppercase tracking-wide text-[#e5b567]">AI 学情</span>
        <span className="rounded bg-[#e5b567]/20 px-1.5 py-0.5 text-[9px] font-bold text-[#e5b567]">LIVE</span>
      </div>

      <div className="mt-3 flex gap-3">
        <div className="relative size-16 shrink-0">
          <svg viewBox="0 0 36 36" className="size-full -rotate-90">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              stroke="#e5b567"
              strokeWidth="3"
              strokeDasharray="72 100"
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-extrabold text-white">
            72%
          </span>
        </div>
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[78%] rounded-full bg-sky-400" />
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[55%] rounded-full bg-emerald-400" />
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[88%] rounded-full bg-[#e5b567]" />
          </div>
        </div>
      </div>

      <div className="mt-3 flex h-14 items-end justify-between gap-1">
        {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t bg-gradient-to-t from-[#e5b567]/40 to-[#e5b567]"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>

      <svg viewBox="0 0 200 40" className="mt-2 h-8 w-full text-sky-400/80" preserveAspectRatio="none">
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          points="0,32 30,28 60,18 90,22 120,8 150,14 180,6 200,10"
        />
      </svg>
    </div>
  );
}
