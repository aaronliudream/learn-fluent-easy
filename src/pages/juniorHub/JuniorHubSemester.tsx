import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useJuniorHub } from "@/lib/juniorHub/context";
import { useHubBack } from "@/lib/useHubBack";
import { findSemester, getGradeCourse } from "@/lib/juniorHub/courseData";
import { readJuniorPublisherParam, withJuniorPublisher, dbPublisherFor } from "@/lib/juniorHub/publisher";
import { unitLabel } from "./JuniorHubUnit";
import { getSemesterProgress, getUnitProgress } from "@/lib/juniorHub/progress";
import { useSemesterMastery } from "@/hooks/useSemesterMastery";
import { savePersist } from "@/lib/juniorHub/storage";
import JuniorFinalChallengeEntryCard from "@/components/juniorHub/finalChallenge/JuniorFinalChallengeEntryCard";

export default function JuniorHubSemester() {
  const { semId } = useParams<{ semId: string }>();
  const { grade, state, setState } = useJuniorHub();
  const nav = useNavigate();
  const [qp] = useSearchParams();
  const pub = readJuniorPublisherParam(qp);
  const wp = (p: string) => withJuniorPublisher(p, pub);
  const sem = semId ? findSemester(semId) : null;
  const course = getGradeCourse(grade, pub);
  const sp = semId ? getSemesterProgress(state, semId) : null;
  const base = `/junior/hub/${grade}`;
  // 返回=原路退回;没有来路(深链/刷新)才回兜底页。见 useHubBack。
  const goBack = useHubBack(wp(`${base}/course`));
  // ⚠️ 必须在下面的 early-return 之前调用(hook 顺序)。整册一次批量拉取。
  const masteryMap = useSemesterMastery(sem?.units, grade, dbPublisherFor(pub));

  if (!sem || !semId) {
    return <div className="p-6 text-center">课程未找到</div>;
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
        {sem.units.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-[#EEEAE0] bg-white p-6 text-center text-sm text-[#888780]">
            📚 教材内容整理中，敬请期待
            {grade === 9 && pub === "fltrp" && (
              <div className="mt-1 text-xs">外研社 2024 新版九年级教材陆续出版中</div>
            )}
          </div>
        )}
        {sem.units.map((unit) => {
          const p = getUnitProgress(state, unit.id);
          const isCurrent = unit.id === state.currentUnit && unit.available;
          const isDone = p.total > 0 && p.completed === p.total;
          return (
            <button
              key={unit.id}
              type="button"
              disabled={!unit.available}
              onClick={() => {
                if (!unit.available) return;
                setState((prev) => {
                  const next = { ...prev, currentUnit: unit.id, currentSemester: semId };
                  savePersist(grade, next);
                  return next;
                });
                nav(wp(`${base}/semester/${semId}/unit/${unit.id}`));
              }}
              className={`w-full rounded-2xl border-2 bg-white p-4 text-left shadow-sm ${
                isCurrent ? "border-[#FF6B35]" : "border-transparent"
              } ${!unit.available ? "opacity-60" : ""}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{unit.emoji}</span>
                <div className="min-w-0 flex-1 text-left">
                  <div className="text-[11px] font-bold uppercase text-[#888780]">{unitLabel(unit)}</div>
                  <div className="font-bold">
                    {unit.title}{unit.cn && unit.cn !== "整理中" ? ` · ${unit.cn}` : ""}
                  </div>
                </div>
                <span>{!unit.available ? "🔒" : isDone ? "✅" : isCurrent ? "▶️" : ""}</span>
              </div>
              {unit.available ? (
                <>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#F4F0E6]">
                      <div className="h-full bg-gradient-to-r from-[#FF6B35] to-[#FFB627]" style={{ width: `${p.percent}%` }} />
                    </div>
                    <span className="text-xs font-bold">{p.percent}%</span>
                  </div>
                  {/* 掌握度与完成度并列(与单元内页同口径同数据源)。整册批量拉取,不逐卡查询。
                      没有掌握数据时整行不渲染 —— 不显示假的 0%,也不能影响上面「即将开放」的判断。 */}
                  {masteryMap[unit.id] ? (
                    <div className="mt-1 flex items-center gap-3 text-xs">
                      <span className="text-[#888780]">已做过 <span className="font-bold text-sky-600">{masteryMap[unit.id].donePct}%</span></span>
                      <span className="text-[#888780]">掌握度 <span className="font-bold text-amber-600">{masteryMap[unit.id].pct}%</span></span>
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="mt-2 text-xs text-[#888780]">📅 即将开放</div>
              )}
            </button>
          );
        })}

        {/* 综合挑战入口:仅人教七年级有题库;上册=期中(v1)、下册=期末(v2)。外研社暂无 → 不展示。 */}
        {grade === 7 && pub === "pep" && (
          <JuniorFinalChallengeEntryCard
            volume={semId.endsWith("volume2") ? "v2" : "v1"}
          />
        )}
      </div>
    </>
  );
}
