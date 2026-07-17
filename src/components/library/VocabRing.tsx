/**
 * 我的词库顶部大圆环:总词数拆成 已掌握(绿)/ 待复习(橙)/ 学习中(灰) 三段。
 * 视觉:粗环(stroke 24)、圆头(round)、浅灰底槽、饱满色、超大中心数字、下方三 chip。
 * 尺寸响应式:宽度 min(72vw,260px)——窄屏(手机)占满显饱满,宽屏(电脑)封顶显大不空。
 * 纯展示,数据全前端从收藏集现算(零查询)。
 */
import { T } from "@/i18n/T";

const GREEN = "#16A34A"; // 已掌握(深一档饱满绿)
const ORANGE = "#F59E0B"; // 待复习(亮橙)
const GRAY = "#D1D5DB"; // 学习中(浅灰)
const TRACK = "#E5E7EB"; // 底槽(更浅灰)
const SLATE = "#94A3B8"; // 总计圆点(中性)

// viewBox 坐标(SVG 会缩放到容器宽度,故此处用相对单位)。
const VB = 200;
const C0 = VB / 2;
const R = 76;
const SW = 24;
const CIRC = 2 * Math.PI * R;
const GAP = 14; // 段间空隙(viewBox 弧长),配合 round 端点留呼吸

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
  const raw = [
    { n: mastered, color: GREEN },
    { n: due, color: ORANGE },
    { n: rest, color: GRAY },
  ].filter((s) => s.n > 0);

  const gaps = raw.length >= 1 ? raw.length * GAP : 0;
  const avail = Math.max(0, CIRC - gaps);
  const denom = total > 0 ? total : 1;
  let acc = 0;
  const arcs = raw.map((s) => {
    const len = (s.n / denom) * avail;
    const arc = { color: s.color, dash: `${len} ${CIRC - len}`, offset: -acc };
    acc += len + GAP;
    return arc;
  });

  const Chip = ({ color, label, n }: { color: string; label: string; n: number }) => (
    <div className="flex items-center gap-1.5 rounded-full bg-slate-50 px-3.5 py-1.5">
      <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-xs text-slate-500"><T>{label}</T></span>
      <span className="text-sm font-bold tabular-nums text-slate-800">{n}</span>
    </div>
  );

  return (
    <div className="mt-4 flex flex-col items-center gap-5 rounded-2xl border border-slate-100 bg-white px-4 py-6 shadow-sm">
      <div className="relative aspect-square w-[min(72vw,260px)]">
        <svg viewBox={`0 0 ${VB} ${VB}`} className="h-full w-full">
          <g transform={`rotate(-90 ${C0} ${C0})`}>
            <circle cx={C0} cy={C0} r={R} fill="none" stroke={TRACK} strokeWidth={SW} />
            {total > 0 &&
              arcs.map((a, i) => (
                <circle
                  key={i}
                  cx={C0}
                  cy={C0}
                  r={R}
                  fill="none"
                  stroke={a.color}
                  strokeWidth={SW}
                  strokeLinecap="round"
                  strokeDasharray={a.dash}
                  strokeDashoffset={a.offset}
                />
              ))}
          </g>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[56px] font-extrabold leading-none tabular-nums text-slate-900">{total}</span>
          <span className="mt-2 text-[13px] font-medium text-slate-400">
            {en ? "words in library" : "总词数"}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Chip color={SLATE} label={en ? "Total" : "总计"} n={total} />
        <Chip color={GREEN} label={en ? "Mastered" : "已掌握"} n={mastered} />
        <Chip color={ORANGE} label={en ? "Due" : "待复习"} n={due} />
      </div>
    </div>
  );
}
