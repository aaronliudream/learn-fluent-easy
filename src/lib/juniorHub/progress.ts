import { findSemester, findUnit, getGradeCourse } from "./courseData";
import { getUnitState } from "./storage";
import type { JuniorPublisher } from "./publisher";
import { AI_TEST_PROGRESS_STEP, type JuniorHubGrade, type JuniorHubPersist } from "./types";

export function getUnitProgress(state: JuniorHubPersist, unitId: string) {
  const unit = findUnit(unitId);
  if (!unit || !unit.stages.length) return { percent: 0, completed: 0, total: 0, ratio: 0 };
  const us = getUnitState(state, unitId);
  const total = unit.stages.length;
  const completed = us.completedStages.length;
  const ratio = total > 0 ? completed / total : 0;
  return { percent: Math.round(ratio * 100), completed, total, ratio };
}

export function getSemesterProgress(state: JuniorHubPersist, semesterId: string) {
  const semester = findSemester(semesterId);
  if (!semester || !semester.units.length) {
    return { percent: 0, completedUnits: 0, totalUnits: 0, totalStages: 0, completedStages: 0 };
  }
  let totalStages = 0;
  let completedStages = 0;
  let completedUnits = 0;
  semester.units.forEach((u) => {
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

export function getGradeProgress(state: JuniorHubPersist, grade: JuniorHubGrade, publisher: JuniorPublisher = "pep") {
  const course = getGradeCourse(grade, publisher);
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

export function getTotalStars(state: JuniorHubPersist): number {
  let total = 0;
  Object.values(state.units).forEach((us) => {
    total += us.stars || 0;
  });
  return total;
}

export function getTotalCompletedStages(state: JuniorHubPersist): number {
  let total = 0;
  Object.values(state.units).forEach((us) => {
    total += us.completedStages.length;
  });
  return total;
}

/** True when unit progress crossed a new 10% milestone since last AI test for this unit. */
export function shouldTriggerUnitAITest(state: JuniorHubPersist, unitId: string): boolean {
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
