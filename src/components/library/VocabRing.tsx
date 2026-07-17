/**
 * 我的词库顶部大圆环 —— 照效果图(voc.jpg):三个【独立同心环】(Apple-Watch 式),不是一个环分段。
 *   · 外环(灰)= 学习中   · 中环(绿)= 已掌握   · 内环(橙)= 待复习
 * 每环各自一个圆:浅灰底槽(整圈)+ 该指标占总词数比例的彩色弧(圆头 round,从 12 点顺时针)。
 * 尺寸响应式:min(72vw,300px)——窄屏占满饱满、宽屏封顶显大。纯展示,数据前端现算零查询。
 */
import { T } from "@/i18n/T";

const GREEN = "#16A34A"; // 已掌握
const ORANGE = "#F59E0B"; // 待复习
const GRAY = "#9CA3AF"; // 学习中(可见中灰)
const TRACK = "#E5E7EB"; // 底槽
const SLATE = "#94A3B8"; // 总计 chip 圆点

const VB = 200;
const C0 = VB / 2;
const SW = 15; // 每环粗细
// 三个同心半径(外→内):留够间隙 + 中心放大号数字。
const RINGS_R = [86, 66, 46];

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
  const denom = total > 0 ? total : 1;
  // 外→内:学习中(灰)/已掌握(绿)/待复习(橙),各自占总词数比例。
  const rings = [
    { r: RINGS_R[0], color: GRAY, frac: Math.min(1, rest / denom) },
    { r: RINGS_R[1], color: GREEN, frac: Math.min(1, mastered / denom) },
    { r: RINGS_R[2], color: ORANGE, frac: Math.min(1, due / denom) },
  ];

  const Chip = ({ color, label, n }: { color: string; label: string; n: number }) => (
    <div className="flex items-center gap-1.5 rounded-full bg-slate-50 px-3.5 py-1.5">
      <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-xs text-slate-500"><T>{label}</T></span>
      <span className="text-sm font-bold tabular-nums text-slate-800">{n}</span>
    </div>
  );

  return (
    <div className="mt-4 flex flex-col items-center gap-5 rounded-2xl border border-slate-100 bg-white px-4 py-6 shadow-sm">
      <div className="relative aspect-square w-[min(72vw,300px)]">
        <svg viewBox={`0 0 ${VB} ${VB}`} className="h-full w-full">
          <g transform={`rotate(-90 ${C0} ${C0})`}>
            {rings.map((ring, i) => {
              const circ = 2 * Math.PI * ring.r;
              const len = ring.frac * circ;
              return (
                <g key={i}>
                  {/* 底槽:整圈浅灰 */}
                  <circle cx={C0} cy={C0} r={ring.r} fill="none" stroke={TRACK} strokeWidth={SW} />
                  {/* 进度弧:该指标比例,圆头,从 12 点顺时针 */}
                  {ring.frac > 0 && (
                    <circle
                      cx={C0}
                      cy={C0}
                      r={ring.r}
                      fill="none"
                      stroke={ring.color}
                      strokeWidth={SW}
                      strokeLinecap="round"
                      strokeDasharray={`${len} ${circ - len}`}
                    />
                  )}
                </g>
              );
            })}
          </g>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[52px] font-extrabold leading-none tabular-nums text-slate-900">{total}</span>
          <span className="mt-1.5 text-[13px] font-medium text-slate-400">
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
