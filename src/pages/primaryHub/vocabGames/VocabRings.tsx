/**
 * 小学词汇板块顶部双圆环：完成度(学过的词/总词) + 掌握度(掌握的词/总词)。
 * 纯 SVG donut，自包含、无外部依赖；数据来自 srs.getProgress。
 */
type RingProps = {
  percent: number; // 0-100
  label: string;
  sub: string;
  color: string;
  track: string;
};

function Ring({ percent, label, sub, color, track }: RingProps) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, percent));
  const dash = (pct / 100) * c;
  return (
    <div className="flex flex-1 flex-col items-center">
      <div className="relative grid place-items-center">
        <svg width="88" height="88" viewBox="0 0 88 88" className="-rotate-90">
          <circle cx="44" cy="44" r={r} fill="none" stroke={track} strokeWidth="9" />
          <circle
            cx="44"
            cy="44"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${c - dash}`}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute flex flex-col items-center leading-none">
          <span className="text-xl font-extrabold" style={{ color }}>
            {pct}%
          </span>
        </div>
      </div>
      <div className="mt-1.5 text-sm font-bold text-[#2b2b2b]">{label}</div>
      <div className="text-[11px] text-[#8a8a8a]">{sub}</div>
    </div>
  );
}

export default function VocabRings({
  total,
  seen,
  mastered,
}: {
  total: number;
  seen: number;
  mastered: number;
}) {
  const donePct = total ? Math.round((seen / total) * 100) : 0;
  const masterPct = total ? Math.round((mastered / total) * 100) : 0;
  return (
    <div className="flex items-center justify-around rounded-3xl bg-white p-4 shadow-sm">
      <Ring
        percent={donePct}
        label="完成度"
        sub={`学过 ${seen} / ${total} 词`}
        color="#3FB23C"
        track="#E4F3E3"
      />
      <div className="h-16 w-px bg-[#EEEAE0]" />
      <Ring
        percent={masterPct}
        label="掌握度"
        sub={`掌握 ${mastered} / ${total} 词`}
        color="#FF8A00"
        track="#FFEFD9"
      />
    </div>
  );
}
