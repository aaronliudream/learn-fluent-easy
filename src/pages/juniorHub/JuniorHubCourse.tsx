import { useNavigate, useSearchParams } from "react-router-dom";
import { useJuniorHub } from "@/lib/juniorHub/context";
import { getGradeCourse, semesterIdsForGrade } from "@/lib/juniorHub/courseData";
import { readJuniorPublisherParam, withJuniorPublisher } from "@/lib/juniorHub/publisher";
import { getSemesterProgress } from "@/lib/juniorHub/progress";

export default function JuniorHubCourse() {
  const { grade, state } = useJuniorHub();
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const pub = readJuniorPublisherParam(sp);
  const course = getGradeCourse(grade, pub);
  const base = `/junior/hub/${grade}`;
  const semIds = semesterIdsForGrade(grade, pub);

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
              onClick={() => !locked && nav(withJuniorPublisher(`${base}/semester/${semId}`, pub))}
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
      </div>
    </>
  );
}
