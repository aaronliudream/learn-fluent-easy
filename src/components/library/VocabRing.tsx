/**
 * 我的词库顶部大卡 —— 照效果图(voc.jpg):一张大圆角卡,内含
 *   ① 三个【独立同心环】(Apple-Watch 式):外环灰=学习中 / 中环绿=已掌握 / 内环橙=待复习
 *   ② 三个 chip:总计 / 已掌握 / 待复习   ③ 卡内蓝色「开始复习 →」按钮
 * 每环各自一圆:浅灰底槽 + 该指标占总词数比例的圆头弧(从 12 点顺时针)。纯前端现算,零查询。
 */
import { ArrowRight } from "lucide-react";
import { T } from "@/i18n/T";

const GREEN = "#16A34A"; // 已掌握
const ORANGE = "#F59E0B"; // 待复习
const GRAY = "#9CA3AF"; // 学习中
const TRACK = "#E5E7EB"; // 底槽
const SLATE = "#94A3B8"; // 总计 chip 圆点

const VB = 200;
const C0 = VB / 2;
const SW = 15;
const RINGS_R = [86, 66, 46];

export default function VocabRing({
  total,
  mastered,
  due,
  en,
  onStart,
}: {
  total: number;
  mastered: number;
  due: number;
  en: boolean;
  onStart: () => void;
}) {
  const rest = Math.max(0, total - mastered - due);
  const denom = total > 0 ? total : 1;
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
    <div className="mt-4 flex flex-col items-center gap-5 rounded-3xl border border-slate-100 bg-white px-5 py-6 shadow-sm">
      <div className="relative aspect-square w-[min(72vw,300px)]">
        <svg viewBox={`0 0 ${VB} ${VB}`} className="h-full w-full">
          <g transform={`rotate(-90 ${C0} ${C0})`}>
            {rings.map((ring, i) => {
              const circ = 2 * Math.PI * ring.r;
              const len = ring.frac * circ;
              return (
                <g key={i}>
                  <circle cx={C0} cy={C0} r={ring.r} fill="none" stroke={TRACK} strokeWidth={SW} />
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

      {/* 卡内蓝色「开始复习 →」按钮(效果图那样,在卡里,不在外面) */}
      {due > 0 ? (
        <button
          type="button"
          onClick={onStart}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3.5 text-base font-bold text-white shadow-sm transition hover:bg-blue-700"
        >
          <T>开始复习</T> <ArrowRight className="size-5" />
        </button>
      ) : (
        <div className="w-full rounded-2xl bg-emerald-50 py-3.5 text-center text-sm font-semibold text-emerald-700">
          <T>今日已清零,明天再来 🎉</T>
        </div>
      )}
    </div>
  );
}
