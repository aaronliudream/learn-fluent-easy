/**
 * 我的词库顶部大圆环:把「总词数」拆成 已掌握(绿)/ 待复习(橙)/ 学习中·今日已练(灰) 三段。
 * 纯展示,数据全部前端从收藏集现算(零查询)。中心显总词数,下方三个数字图例。
 */
import { T } from "@/i18n/T";

const GREEN = "#10b981"; // 已掌握
const ORANGE = "#f59e0b"; // 待复习
const GRAY = "#cbd5e1"; // 其余(学习中·今日已练/未起步)

export default function VocabRing({
  total,
  mastered,
  due,
  en,
}: {
  total: number;
  mastered: number;
  due: number;
  en: boolean;
}) {
  const rest = Math.max(0, total - mastered - due);
  const R = 52;
  const C = 2 * Math.PI * R;
  const denom = total > 0 ? total : 1;
  const segs = [
    { n: mastered, color: GREEN },
    { n: due, color: ORANGE },
    { n: rest, color: GRAY },
  ];
  // 依次铺弧:每段 dasharray=[本段长, 其余],dashoffset 累进。
  let acc = 0;
  const arcs = segs.map((s, i) => {
    const len = (s.n / denom) * C;
    const dash = `${len} ${C - len}`;
    const offset = -acc;
    acc += len;
    return { key: i, color: s.color, dash, offset };
  });

  const Stat = ({ color, label, n }: { color: string; label: string; n: number }) => (
    <div className="flex items-center gap-1.5">
      <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-sm font-bold tabular-nums text-slate-800">{n}</span>
      <span className="text-xs text-slate-500"><T>{label}</T></span>
    </div>
  );

  return (
    <div className="mt-4 flex items-center gap-5 rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm">
      <div className="relative shrink-0" style={{ width: 128, height: 128 }}>
        <svg width="128" height="128" viewBox="0 0 128 128" className="-rotate-90">
          <circle cx="64" cy="64" r={R} fill="none" stroke="#f1f5f9" strokeWidth="12" />
          {total > 0 &&
            arcs.map((a) =>
              a.dash.startsWith("0 ") ? null : (
                <circle
                  key={a.key}
                  cx="64"
                  cy="64"
                  r={R}
                  fill="none"
                  stroke={a.color}
                  strokeWidth="12"
                  strokeDasharray={a.dash}
                  strokeDashoffset={a.offset}
                  strokeLinecap="butt"
                />
              ),
            )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-extrabold tabular-nums leading-none text-slate-900">{total}</span>
          <span className="mt-0.5 text-[11px] text-slate-400"><T>总词数</T></span>
        </div>
      </div>
      <div className="flex flex-col gap-2.5">
        <Stat color={GREEN} label="已掌握" n={mastered} />
        <Stat color={ORANGE} label="待复习" n={due} />
        <Stat color={GRAY} label={en ? "In progress" : "学习中"} n={rest} />
      </div>
    </div>
  );
}
