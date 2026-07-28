import { useNavigate, useParams } from "react-router-dom";
import NotFoundCard from "@/components/hub/NotFoundCard";
import { useHubBack } from "@/lib/useHubBack";
import { usePrimaryHub } from "@/lib/primaryHub/context";
import { findSemester, getGradeCourse, isUnitListed } from "@/lib/primaryHub/courseData";
import { getSemesterProgress, getUnitProgress } from "@/lib/primaryHub/progress";
import { savePersist } from "@/lib/primaryHub/storage";
import FinalChallengeEntryCard from "@/components/primaryHub/finalChallenge/FinalChallengeEntryCard";

export default function PrimaryHubSemester() {
  const { semId } = useParams<{ semId: string }>();
  const { grade, state, setState } = usePrimaryHub();
  const nav = useNavigate();
  const sem = semId ? findSemester(semId) : null;
  const course = getGradeCourse(grade);
  const sp = semId ? getSemesterProgress(state, semId) : null;
  const base = `/primary/hub/${grade}`;
  // 返回=原路退回;没有来路(深链/刷新)才回兜底页。见 useHubBack。
  const goBack = useHubBack(`${base}/course`);
  // semId 形如 grade4_volume1 / grade4_volume2 —— 上册取 v1 题库，下册默认 v2。
  const vol = semId?.includes("volume1") ? "v1" : "v2";

  if (!sem || !semId) {
    return <NotFoundCard title="未找到这一册" homePath={`/primary/hub/${grade}`} />;
  }

  return (
    <>
      <div className="flex items-center gap-3 border-b border-[#EEEAE0] bg-white px-4 py-3">
        <button type="button" onClick={goBack} className="text-xl">
          ←
        </button>
        <div className="text-lg font-bold">
          {course.name}
          {sem.name}
        </div>
      </div>
      <div className="bg-gradient-to-br from-[#FF6B35] to-[#FFB627] px-5 py-5 text-white">
        <div className="text-xs opacity-90">
          📘 {course.name} {sem.name}
        </div>
        <div className="text-2xl font-bold">{sp?.percent ?? 0}% 完成</div>
        <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-white/30">
          <div className="h-full bg-white" style={{ width: `${sp?.percent ?? 0}%` }} />
        </div>
        <div className="flex gap-8 text-sm">
          <div>
            <div className="text-lg font-bold">{sp?.completedUnits ?? 0}</div>
            <div className="text-xs opacity-90">已完成单元</div>
          </div>
          <div>
            <div className="text-lg font-bold">{sp?.completedStages ?? 0}</div>
            <div className="text-xs opacity-90">已完成关卡</div>
          </div>
        </div>
      </div>
      <div className="space-y-3 px-4 py-4">
        {sem.units.filter(isUnitListed).map((unit) => {
          const p = getUnitProgress(state, unit.id);
          const isCurrent = unit.id === state.currentUnit && unit.available;
          const isDone = p.total > 0 && p.completed === p.total;
          return (
            <button
              key={unit.id}
              type="button"
              disabled={!unit.available}
              onClick={() => {
                if (!isUnitListed(unit)) return;
                setState((prev) => {
                  const next = { ...prev, currentUnit: unit.id, currentSemester: semId };
                  savePersist(grade, next);
                  return next;
                });
                nav(`${base}/semester/${semId}/unit/${unit.id}`);
              }}
              className={`w-full rounded-2xl border-2 bg-white p-4 text-left shadow-sm ${
                isCurrent ? "border-[#FF6B35]" : "border-transparent"
              } ${!unit.available ? "opacity-60" : ""}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{unit.emoji}</span>
                <div className="min-w-0 flex-1 text-left">
                  <div className="text-[11px] font-bold uppercase text-[#888780]">Unit {unit.num}</div>
                  <div className="font-bold">
                    {unit.title} · {unit.cn}
                  </div>
                </div>
                <span>{!unit.available ? "🔒" : isDone ? "✅" : isCurrent ? "▶️" : ""}</span>
              </div>
              {unit.available ? (
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#F4F0E6]">
                    <div className="h-full bg-gradient-to-r from-[#FF6B35] to-[#FFB627]" style={{ width: `${p.percent}%` }} />
                  </div>
                  <span className="text-xs font-bold">{p.percent}%</span>
                </div>
              ) : (
                <div className="mt-2 text-xs text-[#888780]">📅 即将开放</div>
              )}
            </button>
          );
        })}
        {(grade === 3 || grade === 4 || grade === 5 || grade === 6) && <FinalChallengeEntryCard volume={vol} />}
      </div>
    </>
  );
}
