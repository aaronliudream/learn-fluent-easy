import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useJuniorHub } from "@/lib/juniorHub/context";
import {
  getGradeProgress,
  getSemesterProgress,
  getTotalCompletedStages,
  getTotalStars,
  getUnitProgress,
} from "@/lib/juniorHub/progress";
import { findUnit, getGradeCourse, semesterIdsForGrade } from "@/lib/juniorHub/courseData";
import { readJuniorPublisherParam, withJuniorPublisher } from "@/lib/juniorHub/publisher";
import { unitLabel } from "./JuniorHubUnit";
import { getUnitState } from "@/lib/juniorHub/storage";
import { AITestCard } from "@/components/juniorHub/AITestCard";

export default function JuniorHubHome() {
  const { grade, state } = useJuniorHub();
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const pub = readJuniorPublisherParam(sp);
  const wp = (p: string) => withJuniorPublisher(p, pub);
  const course = getGradeCourse(grade, pub);
  const gradeP = getGradeProgress(state, grade, pub);
  const semIds = semesterIdsForGrade(grade, pub);
  const v1Id = semIds[0];
  const v2Id = semIds[1];
  const semV1 = v1Id ? getSemesterProgress(state, v1Id) : { percent: 0 };
  const semV2 = v2Id ? getSemesterProgress(state, v2Id) : { percent: 0 };

  const currentUnit = findUnit(state.currentUnit);
  // 进度 state 按 grade 共享(pep/fltrp 同一 juniorHub:N),但 unitId 前缀区分出版社(wy*=外研社)。
  // 「继续学习」卡只在 currentUnit 属于当前出版社时显示,避免跨社串味(如默认 currentUnit 是人教单元)。
  const currentUnitMatchesPub =
    !!currentUnit && (currentUnit.id.startsWith("wy") ? pub === "fltrp" : pub === "pep");
  const us = currentUnit ? getUnitState(state, currentUnit.id) : null;
  const nextStageIdx = us?.completedStages.length ?? 0;
  const nextStage = currentUnitMatchesPub ? currentUnit?.stages[nextStageIdx] : undefined;
  const unitP = currentUnit ? getUnitProgress(state, currentUnit.id) : { percent: 0 };

  const base = `/junior/hub/${grade}`;

  return (
    <>
      <div className="bg-gradient-to-br from-indigo-600 to-violet-600 px-5 pb-6 pt-4 text-white">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="grid size-10 place-items-center rounded-full bg-white/30 text-2xl">{state.user.avatar}</div>
            <div>
              <div className="text-xs opacity-90">早上好！</div>
              <div className="text-base font-semibold">{state.user.name}</div>
            </div>
          </div>
          {/* 全站统一 DB 错题本;LS 计数不再作准,去掉小红点避免与真数据不符。 */}
          <Link to="/mistakes" className="relative grid size-9 place-items-center rounded-full bg-white/20 text-base">
            📝
          </Link>
        </div>
        <div className="rounded-xl bg-white/15 p-3 backdrop-blur">
          <div className="text-xs opacity-90">📊 {course.name}总进度</div>
          <div className="text-2xl font-bold">{gradeP.percent}%</div>
          <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-white/30">
            <div className="h-full bg-white transition-all" style={{ width: `${gradeP.percent}%` }} />
          </div>
          <div className="flex flex-wrap gap-4 text-xs opacity-90">
            {v1Id && (
              <span>
                📗 {course.semesters[v1Id]?.name ?? "上册"}{" "}
                {semV1.percent === 0 && !course.semesters[v1Id]?.available ? "未开放" : `${semV1.percent}%`}
              </span>
            )}
            {v2Id && <span>📘 {course.semesters[v2Id]?.name ?? "下册"} {semV2.percent}%</span>}
          </div>
        </div>
      </div>

      <div className="px-4 pt-4">
        {grade === 9 && pub === "fltrp" && (
          <div className="mb-4 rounded-xl border border-[#EEEAE0] bg-[#FBF8F2] px-4 py-2.5 text-xs text-[#888780]">
            📖 外研社 2024 新版九年级教材陆续出版中
          </div>
        )}
        <AITestCard />

        {nextStage && currentUnit?.available && (
          <section className="mb-4">
            <div className="mb-2 px-1 text-base font-semibold">📍 继续学习</div>
            <button
              type="button"
              onClick={() =>
                nav(wp(`${base}/semester/${state.currentSemester}/unit/${currentUnit.id}/stage/${nextStageIdx}`))
              }
              className="w-full rounded-2xl bg-gradient-to-br from-[#378ADD] to-[#5DAEEE] p-4 text-left text-white shadow-sm transition hover:-translate-y-0.5"
            >
              <div className="text-xs opacity-90">
                {unitLabel(currentUnit)} {currentUnit.title} · 第 {nextStageIdx + 1} 关
              </div>
              <div className="text-lg font-semibold">
                {nextStage.icon} {nextStage.title}
              </div>
              <div className="text-sm opacity-90">
                {nextStage.subtitle} · 约 {nextStage.time}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/30">
                  <div className="h-full bg-white" style={{ width: `${unitP.percent}%` }} />
                </div>
                <span className="text-sm font-semibold">{unitP.percent}%</span>
              </div>
            </button>
          </section>
        )}

        <section className="mb-4">
          <div className="mb-2 flex items-center justify-between px-1">
            <div className="text-base font-semibold">📚 我的课程</div>
            <Link to={wp(`${base}/course`)} className="text-sm font-medium text-[#FF6B35]">
              查看全部 →
            </Link>
          </div>
          {semIds.filter(Boolean).map((semId) => {
            const sem = course.semesters[semId];
            const sp = getSemesterProgress(state, semId);
            const locked = !sem.available;
            return (
              <button
                key={semId}
                type="button"
                disabled={locked}
                onClick={() => !locked && nav(wp(`${base}/semester/${semId}`))}
                className={`mb-3 w-full rounded-2xl bg-white p-4 text-left shadow-sm ${locked ? "opacity-70" : "transition hover:-translate-y-0.5"}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{semId.endsWith("volume1") ? "📗" : "📘"}</span>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold">
                      {course.name}
                      {sem.name}
                    </div>
                    <div className="text-xs text-[#888780]">
                      {locked ? "即将开放" : `${sp.completedUnits} / ${sp.totalUnits} 单元已完成`}
                    </div>
                  </div>
                  <span className="rounded-full bg-[#F4F0E6] px-2 py-0.5 text-[10px] font-bold text-[#888780]">
                    {locked ? "🔒 未开放" : sp.percent === 100 ? "已完成" : sp.percent > 0 ? "学习中" : "未开始"}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#F4F0E6]">
                    <div className="h-full bg-gradient-to-r from-[#FF6B35] to-[#FFB627]" style={{ width: `${sp.percent}%` }} />
                  </div>
                  <span className="text-xs font-bold">{sp.percent}%</span>
                </div>
              </button>
            );
          })}
        </section>

        <section>
          <div className="mb-2 px-1 text-base font-semibold">📊 学习统计</div>
          <div className="grid grid-cols-3 gap-2 rounded-2xl bg-white p-3.5 shadow-sm">
            <div className="text-center">
              <div className="text-xl font-bold text-[#FF6B35]">{getTotalCompletedStages(state)}</div>
              <div className="text-[11px] text-[#888780]">已完成关卡</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-[#639922]">{getTotalStars(state)}</div>
              <div className="text-[11px] text-[#888780]">总星星</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-[#B45EFF]">{state.aiTestCount}</div>
              <div className="text-[11px] text-[#888780]">AI 测试次数</div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
