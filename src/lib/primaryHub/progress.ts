import { findSemester, findUnit, getGradeCourse, isUnitListed } from "./courseData";
import { getCompletableStageIndices } from "./stageCompletable";
import { readUnitState } from "./storage";
import type { PrimaryHubGrade, PrimaryHubPersist, UnitState } from "./types";
/**
 * ★口径★ 小学线用「各单元百分比取平均」,且**单关未完成也能贡献 0–99 的部分进度**
 * (见 getStagePercent 读 stageProgress)。
 * **初中/高中线不同** —— 它们用「关卡计数」,单关只有 0 或 100,学期/册百分比是
 * Σ完成关数 / Σ总关数。所以同样显示 "30%",三条线含义不一样。
 * 这是**已知且刻意保留**的差异,详见 docs/notes/进度口径对照表.md。
 * ⚠️ 看到三条线数字对不上时,先读那份文档再动手,别当 bug 顺手"修"。
 *
 * ★筛选口径★ 本线用 isUnitListed(= available && published !== false),
 * 比另两线的 available 更严格 —— 这是对的,不要"对齐"回去。
 *
 * ★与掌握度无关★ 本文件只读 completedStages / stageProgress,不读任何 mastery 表。
 */

export function getStagePercent(us: UnitState, stageIdx: number): number {
  if (us.completedStages.includes(stageIdx)) return 100;
  const saved = us.stageProgress?.[stageIdx];
  if (saved == null) return 0;
  return Math.min(99, Math.max(0, Math.round(saved)));
}

export function getUnitProgress(state: PrimaryHubPersist, unitId: string) {
  const unit = findUnit(unitId);
  if (!unit || !unit.stages.length) {
    return { percent: 0, completed: 0, total: 0, stageCount: 0 };
  }
  const completable = getCompletableStageIndices(unitId);
  const stageCount = unit.stages.length;
  const us = readUnitState(state, unitId);
  const total = completable.length;
  if (total === 0) {
    return { percent: 0, completed: 0, total: 0, stageCount };
  }
  const completed = completable.filter((i) => us.completedStages.includes(i)).length;
  let sum = 0;
  for (const i of completable) sum += getStagePercent(us, i);
  return {
    percent: Math.round(sum / total),
    completed,
    total,
    stageCount,
  };
}

export function getSemesterProgress(state: PrimaryHubPersist, semesterId: string) {
  const sem = findSemester(semesterId);
  if (!sem || !sem.units.length) {
    return { percent: 0, completedUnits: 0, totalUnits: 0, totalStages: 0, completedStages: 0 };
  }
  let totalStages = 0;
  let completedStages = 0;
  let completedUnits = 0;
  let percentSum = 0;
  let trackedUnits = 0;
  sem.units.forEach((u) => {
    const p = getUnitProgress(state, u.id);
    totalStages += p.total;
    completedStages += p.completed;
    if (isUnitListed(u) && p.total > 0 && p.completed === p.total) completedUnits++;
    if (isUnitListed(u) && p.total > 0) {
      percentSum += p.percent;
      trackedUnits++;
    }
  });
  return {
    percent: trackedUnits > 0 ? Math.round(percentSum / trackedUnits) : 0,
    completedUnits,
    totalUnits: sem.units.filter((u) => isUnitListed(u)).length,
    totalStages,
    completedStages,
  };
}

export function getGradeProgress(state: PrimaryHubPersist, grade: PrimaryHubGrade) {
  const course = getGradeCourse(grade);
  let totalStages = 0;
  let completedStages = 0;
  let percentSum = 0;
  let trackedUnits = 0;
  Object.values(course.semesters).forEach((sem) => {
    sem.units.forEach((u) => {
      const p = getUnitProgress(state, u.id);
      totalStages += p.total;
      completedStages += p.completed;
      if (isUnitListed(u) && p.total > 0) {
        percentSum += p.percent;
        trackedUnits++;
      }
    });
  });
  return {
    percent: trackedUnits > 0 ? Math.round(percentSum / trackedUnits) : 0,
    totalStages,
    completedStages,
  };
}

export function getTotalCompletedStages(state: PrimaryHubPersist): number {
  let total = 0;
  Object.values(state.units).forEach((us) => {
    total += us.completedStages.length;
  });
  return total;
}

export function getTotalStars(state: PrimaryHubPersist): number {
  let total = 0;
  Object.values(state.units).forEach((us) => {
    total += us.stars || 0;
  });
  return total;
}

export function shouldTriggerAITest(state: PrimaryHubPersist): boolean {
  const total = getTotalCompletedStages(state);
  const lastTest = state.lastAITest || 0;
  return total - lastTest >= 4 && total > 0 && state.mistakes.length >= 2;
}
