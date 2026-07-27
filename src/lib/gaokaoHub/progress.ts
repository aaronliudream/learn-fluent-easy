import { findSemester, findUnit, getGradeCourse } from "./courseData";
import { getUnitState } from "./storage";
import { AI_TEST_PROGRESS_STEP, type GaokaoHubGrade, type GaokaoHubPersist } from "./types";

/**
 * ★口径★ 高中线用「关卡计数」:百分比 = 已完成关数 / 总关数,单关只有 0 或 100,没有中间态。
 * 初中线(juniorHub/progress.ts)同口径;**小学线(primaryHub/progress.ts)不同** —— 它用
 * 「各单元百分比取平均」,且单关未完成也能贡献 0–99 的部分进度。
 * 三条线口径不一致是**已知且刻意保留**的,详见 docs/notes/进度口径对照表.md。
 * ⚠️ 看到三条线数字对不上时,先读那份文档再动手,别当 bug 顺手"修"。
 *
 * ★与掌握度无关★ 本文件只读 completedStages(本地 + 云同步的关卡完成计数),不读任何 mastery 表。
 */

export function getUnitProgress(state: GaokaoHubPersist, unitId: string) {
  const unit = findUnit(unitId);
  if (!unit || !unit.stages.length) return { percent: 0, completed: 0, total: 0, ratio: 0 };
  const us = getUnitState(state, unitId);
  const total = unit.stages.length;
  const completed = us.completedStages.length;
  const ratio = total > 0 ? completed / total : 0;
  return { percent: Math.round(ratio * 100), completed, total, ratio };
}

export function getSemesterProgress(state: GaokaoHubPersist, semesterId: string) {
  const semester = findSemester(semesterId);
  if (!semester || !semester.units.length) {
    return { percent: 0, completedUnits: 0, totalUnits: 0, totalStages: 0, completedStages: 0 };
  }
  let totalStages = 0;
  let completedStages = 0;
  let completedUnits = 0;
  semester.units.filter((u) => u.available).forEach((u) => {
    const p = getUnitProgress(state, u.id);
    totalStages += p.total;
    completedStages += p.completed;
    if (p.total > 0 && p.completed === p.total) completedUnits++;
  });
  return {
    percent: totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0,
    completedUnits,
    totalUnits: semester.units.filter((u) => u.available).length,
    totalStages,
    completedStages,
  };
}

export function getGradeProgress(state: GaokaoHubPersist, grade: GaokaoHubGrade) {
  const course = getGradeCourse(grade);
  let totalStages = 0;
  let completedStages = 0;
  Object.values(course.semesters).forEach((sem) => {
    sem.units.filter((u) => u.available).forEach((u) => {
      const p = getUnitProgress(state, u.id);
      totalStages += p.total;
      completedStages += p.completed;
    });
  });
  return {
    percent: totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0,
    totalStages,
    completedStages,
    stageDone: completedStages,
    stageTotal: totalStages,
  };
}

export function getTotalStars(state: GaokaoHubPersist): number {
  let total = 0;
  Object.values(state.units).forEach((us) => {
    total += us.stars || 0;
  });
  return total;
}

export function getTotalCompletedStages(state: GaokaoHubPersist): number {
  let total = 0;
  Object.values(state.units).forEach((us) => {
    total += us.completedStages.length;
  });
  return total;
}

export function shouldTriggerUnitAITest(state: GaokaoHubPersist, unitId: string): boolean {
  const unit = findUnit(unitId);
  if (!unit || !unit.stages.length) return false;
  const p = getUnitProgress(state, unitId);
  if (p.ratio < AI_TEST_PROGRESS_STEP) return false;
  const us = getUnitState(state, unitId);
  const milestone = Math.floor(p.ratio / AI_TEST_PROGRESS_STEP) * AI_TEST_PROGRESS_STEP;
  if (milestone <= us.lastAiTestAtProgress) return false;
  return state.mistakes.length > 0 || p.completed >= 1;
}

export function nextAiTestMilestone(ratio: number): number {
  const step = AI_TEST_PROGRESS_STEP;
  return Math.ceil(ratio / step) * step || step;
}
