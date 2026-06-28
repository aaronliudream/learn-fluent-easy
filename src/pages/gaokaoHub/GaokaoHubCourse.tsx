import { Link, useNavigate } from "react-router-dom";
import { useGaokaoHub } from "@/lib/gaokaoHub/context";
import { getGradeCourse, semesterIdsForGrade } from "@/lib/gaokaoHub/courseData";
import { getSemesterProgress } from "@/lib/gaokaoHub/progress";
import { withPublisher } from "@/lib/gaokaoHub/publisher";

export default function GaokaoHubCourse() {
  const { grade, publisher, state } = useGaokaoHub();
  const nav = useNavigate();
  const course = getGradeCourse(grade, publisher);
  const base = `/gaokao/hub/${grade}`;
  const semIds = semesterIdsForGrade(grade, publisher);

  return (
    <>
      <div className="bg-gradient-to-br from-[#FF6B35] to-[#FFB627] px-5 pb-6 pt-4 text-white">
        <div className="text-sm opacity-90">📚 学习中心</div>
        <div className="text-xl font-bold">选择课程开始学习</div>
      </div>
      <div className="px-4 pt-4">
        <div className="mb-2 text-base font-semibold">{course.name}</div>
        {semIds.map((semId) => {
          const sem = course.semesters[semId];
          if (!sem) return null;
          const sp = getSemesterProgress(state, semId);
          const locked = !sem.available;
          return (
            <button
              key={semId}
              type="button"
              disabled={locked}
              onClick={() => !locked && nav(withPublisher(`${base}/semester/${semId}`, publisher))}
              className={`mb-3 w-full rounded-2xl bg-white p-4 text-left shadow-sm ${locked ? "opacity-70" : ""}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{semId.endsWith("volume1") ? "📗" : "📘"}</span>
                <div className="flex-1">
                  <div className="font-semibold">
                    {course.name}
                    {sem.name}
                  </div>
                  <div className="text-xs text-[#888780]">
                    {locked ? "即将开放" : `${sem.units.filter((u) => u.available).length} 个单元 · ${sp.completedUnits} 已完成`}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
        <div className="rounded-2xl bg-[#FFF8F0] p-4 text-center">
          <div className="mb-1 text-3xl">🚀</div>
          <div className="text-sm font-semibold">更多内容持续更新中</div>
          <Link to="/primary" className="mt-2 inline-block text-xs text-[#FF6B35]">
            ← 切换年级
          </Link>
        </div>
      </div>
    </>
  );
}
