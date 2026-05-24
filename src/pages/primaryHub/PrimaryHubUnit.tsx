import { useNavigate, useParams } from "react-router-dom";
import { usePrimaryHub } from "@/lib/primaryHub/context";
import { findUnit } from "@/lib/primaryHub/courseData";
import { getUnitProgress, getStagePercent } from "@/lib/primaryHub/progress";
import { getUnitState } from "@/lib/primaryHub/storage";

export default function PrimaryHubUnit() {
  const { semId, unitId } = useParams<{ semId: string; unitId: string }>();
  const { grade, state } = usePrimaryHub();
  const nav = useNavigate();
  const unit = unitId ? findUnit(unitId) : null;
  const us = unitId ? getUnitState(state, unitId) : null;
  const p = unitId ? getUnitProgress(state, unitId) : { percent: 0, completed: 0, total: 0 };
  const base = `/primary/hub/${grade}`;

  if (!unit || !unitId || !semId) {
    return <div className="p-6 text-center">单元未找到</div>;
  }

  return (
    <>
      <div className="flex items-center gap-3 border-b border-[#EEEAE0] bg-white px-4 py-3">
        <button type="button" onClick={() => nav(`${base}/semester/${semId}`)} className="text-xl">
          ←
        </button>
        <div className="text-lg font-bold">
          Unit {unit.num} {unit.title}
        </div>
      </div>
      <div className="bg-gradient-to-br from-[#FF6B35] to-[#FFB627] px-5 py-5 text-white">
        <div className="text-xs opacity-90">
          Unit {unit.num} · {unit.cn}
        </div>
        <div className="text-2xl font-bold">
          {unit.emoji} {unit.title}
        </div>
        <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-white/30">
          <div className="h-full bg-white" style={{ width: `${p.percent}%` }} />
        </div>
        <div className="flex gap-6 text-sm">
          <div>
            <div className="text-lg font-bold">
              {p.completed}/{p.total}
            </div>
            <div className="text-xs opacity-90">已完成关卡</div>
          </div>
          <div>
            <div className="text-lg font-bold">{us?.stars ?? 0}</div>
            <div className="text-xs opacity-90">⭐ 星星</div>
          </div>
          <div>
            <div className="text-lg font-bold">{p.percent}%</div>
            <div className="text-xs opacity-90">完成度</div>
          </div>
        </div>
      </div>
      <div className="space-y-2 px-4 py-4">
        {unit.stages.map((stage, i) => {
          const done = us?.completedStages.includes(i) ?? false;
          const stagePercent = us ? getStagePercent(us, i) : 0;
          const inProgress = !done && stagePercent > 0;
          return (
            <button
              key={stage.id}
              type="button"
              onClick={() => nav(`${base}/semester/${semId}/unit/${unitId}/stage/${i}`)}
              className={`flex w-full items-center gap-3 rounded-2xl border bg-white p-4 text-left shadow-sm ${
                done ? "border-[#C9E0A8]" : inProgress ? "border-[#FFB627]/60" : "border-[#FF6B35]/40"
              }`}
            >
              <div className="grid size-10 place-items-center rounded-xl bg-[#FFF8F0] text-sm font-bold">
                {done ? "✓" : i + 1}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold">
                  {stage.icon} {stage.title}
                </div>
                <div className="text-xs text-[#888780]">
                  {stage.subtitle} · {stage.time}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#F4F0E6]">
                    <div
                      className={`h-full ${done ? "bg-[#6FA92A]" : "bg-gradient-to-r from-[#FF6B35] to-[#FFB627]"}`}
                      style={{ width: `${stagePercent}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold tabular-nums text-[#888780]">{stagePercent}%</span>
                </div>
              </div>
              <span className="self-start text-[#888780]">›</span>
            </button>
          );
        })}
      </div>
    </>
  );
}
