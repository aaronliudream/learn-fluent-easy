import { Link } from "react-router-dom";
import { T } from "@/i18n/T";
import { fetchGaokaoClassroomSyncProgress } from "@/lib/gaokaoClassroomSync";
import type { GaokaoHubGrade } from "@/lib/gaokaoHub/types";

const LABELS: Record<GaokaoHubGrade, string> = { 1: "高一", 2: "高二", 3: "高三" };

export function GaokaoClassroomSyncBanner({ yearBand }: { yearBand: GaokaoHubGrade }) {
  const gradeKey = yearBand === 1 ? "g1" : yearBand === 2 ? "g2" : "g3";
  const p = fetchGaokaoClassroomSyncProgress(gradeKey);

  return (
    <Link
      to={`/gaokao/hub/${yearBand}`}
      className="mb-4 relative flex items-center gap-4 overflow-hidden rounded-2xl bg-gradient-to-br from-[#2D5896] via-[#0E2746] to-[#1a3d6b] p-4 text-white shadow-md transition hover:-translate-y-0.5"
    >
      <span className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-white/15 blur-2xl" />
      <div className="relative grid size-14 shrink-0 place-items-center rounded-xl bg-white/20 text-3xl backdrop-blur-sm">
        📘
      </div>
      <div className="relative min-w-0 flex-1">
        <div className="text-[10px] font-bold uppercase tracking-[0.16em] opacity-90">CLASSROOM · SYNC</div>
        <div className="text-base font-extrabold leading-tight">
          <T>课堂同步 · 人教版</T>
        </div>
        <div className="mt-0.5 text-xs opacity-90">
          {LABELS[yearBand]} · {p.unitCount} 单元 · 每单元 8 关 · {p.percent}%（{p.mastered}/{p.total}）
        </div>
      </div>
      <span className="relative rounded-full bg-white/25 px-3 py-1 text-xs font-bold backdrop-blur-sm">
        <T>▶ 进入</T>
      </span>
    </Link>
  );
}
