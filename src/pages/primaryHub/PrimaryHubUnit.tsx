import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useHubBack } from "@/lib/useHubBack";
import { usePrimaryHub } from "@/lib/primaryHub/context";
import { findUnit, isUnitPublished } from "@/lib/primaryHub/courseData";
import { getUnitProgress, getStagePercent } from "@/lib/primaryHub/progress";
import { isReadWriteComingSoon } from "@/lib/primaryHub/stageCompletable";
import { readUnitState } from "@/lib/primaryHub/storage";

export default function PrimaryHubUnit() {
  const { semId, unitId } = useParams<{ semId: string; unitId: string }>();
  const { grade, state } = usePrimaryHub();
  const nav = useNavigate();
  const unit = unitId ? findUnit(unitId) : null;
  const us = unitId ? readUnitState(state, unitId) : null;
  const p = unitId
    ? getUnitProgress(state, unitId)
    : { percent: 0, completed: 0, total: 0, stageCount: 0 };
  const base = `/primary/hub/${grade}`;
  // 返回=原路退回;没有来路(深链/刷新)才回兜底页。见 useHubBack。
  const goBack = useHubBack(`${base}/semester/${semId}`);

  if (!unit || !unitId || !semId) {
    return <div className="p-6 text-center">单元未找到</div>;
  }

  if (!isUnitPublished(unit)) {
    return <Navigate to={`${base}/semester/${semId}`} replace />;
  }

  return (
    <>
      <div className="flex items-center gap-3 border-b border-[#EEEAE0] bg-white px-4 py-3">
        <button type="button" onClick={goBack} className="text-xl">
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
              {p.stageCount > p.total ? (
                <span className="text-sm font-normal opacity-90"> · 共 {p.stageCount} 关</span>
              ) : null}
            </div>
            <div className="text-xs opacity-90">已完成可玩关卡</div>
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
          const comingSoon = isReadWriteComingSoon(unitId, i, stage);
          const done = !comingSoon && (us?.completedStages.includes(i) ?? false);
          const stagePercent = comingSoon ? 0 : us ? getStagePercent(us, i) : 0;
          const inProgress = !comingSoon && !done && stagePercent > 0;
          return (
            <button
              key={stage.id}
              type="button"
              onClick={() => nav(`${base}/semester/${semId}/unit/${unitId}/stage/${i}`)}
              className={`flex w-full items-center gap-3 rounded-2xl border bg-white p-4 text-left shadow-sm ${
                comingSoon
                  ? "border-dashed border-[#CCC8BE] bg-[#FAFAF8] opacity-90"
                  : done
                    ? "border-[#C9E0A8]"
                    : inProgress
                      ? "border-[#FFB627]/60"
                      : "border-[#FF6B35]/40"
              }`}
            >
              <div
                className={`grid size-10 place-items-center rounded-xl text-sm font-bold ${
                  comingSoon ? "bg-[#F0EDE6] text-[#888780]" : "bg-[#FFF8F0]"
                }`}
              >
                {comingSoon ? "🚧" : done ? "✓" : i + 1}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold">
                  {stage.icon} {stage.title}
                  {comingSoon ? (
                    <span className="ml-1.5 text-xs font-semibold text-[#888780]">即将上线</span>
                  ) : null}
                </div>
                <div className="text-xs text-[#888780]">
                  {stage.subtitle} · {stage.time}
                </div>
                {!comingSoon && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#F4F0E6]">
                      <div
                        className={`h-full ${done ? "bg-[#6FA92A]" : "bg-gradient-to-r from-[#FF6B35] to-[#FFB627]"}`}
                        style={{ width: `${stagePercent}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold tabular-nums text-[#888780]">{stagePercent}%</span>
                  </div>
                )}
              </div>
              <span className="self-start text-[#888780]">›</span>
            </button>
          );
        })}
      </div>
    </>
  );
}
