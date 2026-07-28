import { Link, useNavigate } from "react-router-dom";
import { usePrimaryHub } from "@/lib/primaryHub/context";
import {
  getGradeProgress,
  getSemesterProgress,
  getTotalCompletedStages,
  getTotalStars,
  getUnitProgress,
} from "@/lib/primaryHub/progress";
import { findUnit, getGradeCourse, isUnitListed, semesterIdsForGrade } from "@/lib/primaryHub/courseData";
import { readUnitState } from "@/lib/primaryHub/storage";
import { getWordsForGrade } from "@/lib/primaryHub/vocabGames/words";
import { getProgress } from "@/lib/primaryHub/vocabGames/srs";

export default function PrimaryHubHome() {
  const { grade, state } = usePrimaryHub();
  const nav = useNavigate();
  const course = getGradeCourse(grade);
  // 词汇游戏入口对 3/4/5/6 全年级开放(词源按年级走)
  const vocabP = getProgress(getWordsForGrade(grade));
  const gradeP = getGradeProgress(state, grade);
  const [v1Id, v2Id] = semesterIdsForGrade(grade);
  const semV1 = getSemesterProgress(state, v1Id);
  const semV2 = getSemesterProgress(state, v2Id);

  const currentUnit = findUnit(state.currentUnit);
  const us = currentUnit ? readUnitState(state, currentUnit.id) : null;
  const nextStageIdx = us?.completedStages.length ?? 0;
  const nextStage = currentUnit?.stages[nextStageIdx];
  const unitP = currentUnit ? getUnitProgress(state, currentUnit.id) : { percent: 0 };

  const base = `/primary/hub/${grade}`;

  return (
    <>
      <div className="flex items-center gap-3 border-b border-[#EEEAE0] bg-white px-4 py-3">
        <button type="button" onClick={() => nav("/primary")} className="text-xl" aria-label="返回小学专区">
          ←
        </button>
        <div className="text-lg font-bold">{course.name}</div>
      </div>
      <div className="bg-gradient-to-br from-[#FF6B35] to-[#FFB627] px-5 pb-6 pt-4 text-white">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="grid size-10 place-items-center rounded-full bg-white/30 text-2xl">{state.user.avatar}</div>
            <div>
              <div className="text-xs opacity-90">早上好！</div>
              <div className="text-base font-semibold">{state.user.name}</div>
            </div>
          </div>
          <Link to={`${base}/mistakes`} className="relative grid size-9 place-items-center rounded-full bg-white/20 text-base">
            📝
            {state.mistakes.length > 0 && (
              <span className="absolute right-1 top-1 size-2.5 rounded-full border-2 border-[#FF6B35] bg-[#FFE062]" />
            )}
          </Link>
        </div>
        <div className="rounded-xl bg-white/15 p-3 backdrop-blur">
          <div className="text-xs opacity-90">📊 {course.name}总进度</div>
          <div className="text-2xl font-bold">{gradeP.percent}%</div>
          <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-white/30">
            <div className="h-full bg-white transition-all" style={{ width: `${gradeP.percent}%` }} />
          </div>
          <div className="flex gap-4 text-xs opacity-90">
            <span>📗 上册 {semV1.percent === 0 && !getGradeCourse(grade).semesters[v1Id]?.available ? "未开放" : `${semV1.percent}%`}</span>
            <span>📘 下册 {semV2.percent}%</span>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4">

        {nextStage && currentUnit && isUnitListed(currentUnit) && (
          <section className="mb-4">
            <div className="mb-2 px-1 text-base font-semibold">📍 继续学习</div>
            <button
              type="button"
              onClick={() =>
                nav(`${base}/semester/${state.currentSemester}/unit/${currentUnit.id}/stage/${nextStageIdx}`)
              }
              className="w-full rounded-2xl bg-gradient-to-br from-[#378ADD] to-[#5DAEEE] p-4 text-left text-white shadow-sm transition hover:-translate-y-0.5"
            >
              <div className="text-xs opacity-90">
                {currentUnit.title} · 第 {nextStageIdx + 1} 关
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
            <Link to={`${base}/course`} className="text-sm font-medium text-[#FF6B35]">
              查看全部 →
            </Link>
          </div>
          {[v1Id, v2Id].map((semId) => {
            const sem = course.semesters[semId];
            const sp = getSemesterProgress(state, semId);
            const locked = !sem.available;
            return (
              <button
                key={semId}
                type="button"
                disabled={locked}
                onClick={() => !locked && nav(`${base}/semester/${semId}`)}
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

        {vocabP && (
          <section className="mb-4">
            <button
              type="button"
              onClick={() => nav(`${base}/vocab-games`)}
              className="w-full rounded-2xl bg-gradient-to-br from-[#B45EFF] to-[#7C5CFF] p-4 text-left text-white shadow-sm transition hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎮</span>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{course.name}词汇 · 玩游戏记单词</div>
                  <div className="text-xs opacity-90">配对 · 单词雨 · 打地鼠 · 拼字接龙</div>
                </div>
                <span className="text-sm font-semibold">{vocabP.percent}%</span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/30">
                <div className="h-full bg-white" style={{ width: `${vocabP.percent}%` }} />
              </div>
            </button>
          </section>
        )}

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
