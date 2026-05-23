import { findSemester, findUnit, getGradeCourse } from "./courseData";
import { getUnitState } from "./storage";
import type { PrimaryHubGrade, PrimaryHubPersist } from "./types";

export function getUnitProgress(state: PrimaryHubPersist, unitId: string) {
  const unit = findUnit(unitId);
  if (!unit || !unit.stages.length) return { percent: 0, completed: 0, total: 0 };
  const us = getUnitState(state, unitId);
  const total = unit.stages.length;
  const completed = us.completedStages.length;
  return { percent: Math.round((completed / total) * 100), completed, total };
}

export function getSemesterProgress(state: PrimaryHubPersist, semesterId: string) {
  const sem = findSemester(semesterId);
  if (!sem || !sem.units.length) {
    return { percent: 0, completedUnits: 0, totalUnits: 0, totalStages: 0, completedStages: 0 };
  }
  let totalStages = 0;
  let completedStages = 0;
  let completedUnits = 0;
  sem.units.forEach((u) => {
    const p = getUnitProgress(state, u.id);
    totalStages += p.total;
    completedStages += p.completed;
    if (p.total > 0 && p.completed === p.total) completedUnits++;
  });
  return {
    percent: totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0,
    completedUnits,
    totalUnits: sem.units.filter((u) => u.available).length,
    totalStages,
    completedStages,
  };
}

export function getGradeProgress(state: PrimaryHubPersist, grade: PrimaryHubGrade) {
  const course = getGradeCourse(grade);
  let totalStages = 0;
  let completedStages = 0;
  Object.values(course.semesters).forEach((sem) => {
    sem.units.forEach((u) => {
      const p = getUnitProgress(state, u.id);
      totalStages += p.total;
      completedStages += p.completed;
    });
  });
  return {
    percent: totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0,
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
