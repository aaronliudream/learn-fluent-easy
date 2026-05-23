import { AI_DIMENSIONS, type DimResults } from "@/lib/primaryHub/types";

export function DimensionBars({ dims }: { dims: DimResults }) {
  return (
    <>
      {AI_DIMENSIONS.map((d) => {
        const r = dims[d.key] || { correct: 0, total: 0 };
        if (r.total === 0) {
          return (
            <div key={d.key} className="mb-2 flex items-center gap-2">
              <div className="flex w-14 items-center gap-1 text-xs font-semibold text-[#5C5751]">
                {d.emoji} {d.label}
              </div>
              <div className="h-2 flex-1 overflow-hidden rounded bg-[#F4F0E6]">
                <div className="h-full w-0 bg-[#DDD]" />
              </div>
              <div className="w-9 text-right text-xs font-bold text-[#BBB]">—</div>
            </div>
          );
        }
        const pct = Math.round((r.correct / r.total) * 100);
        const lvl = pct >= 75 ? "from-[#8FBC4D] to-[#6FA92A]" : pct >= 50 ? "from-[#FFC845] to-[#F5A623]" : "from-[#FF8E72] to-[#E0623F]";
        return (
          <div key={d.key} className="mb-2 flex items-center gap-2">
            <div className="flex w-14 items-center gap-1 text-xs font-semibold text-[#5C5751]">
              {d.emoji} {d.label}
            </div>
            <div className="h-2 flex-1 overflow-hidden rounded bg-[#F4F0E6]">
              <div className={`h-full rounded bg-gradient-to-r ${lvl}`} style={{ width: `${pct}%` }} />
            </div>
            <div className="w-9 text-right text-xs font-bold">{pct}%</div>
          </div>
        );
      })}
    </>
  );
}
