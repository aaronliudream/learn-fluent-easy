import type { PrimaryHubGrade, PrimaryHubPersist, UnitState } from "./types";
import { getGradeCourse, semesterIdsForGrade } from "./courseData";
import { migratePersistUnits } from "./stageProgressMigrate";

const STORAGE_PREFIX = "primary_hub_v1_";

function defaultCurrentForGrade(grade: PrimaryHubGrade): { unitId: string; semesterId: string } {
  const [v1, v2] = semesterIdsForGrade(grade);
  const course = getGradeCourse(grade);
  for (const semId of [v1, v2]) {
    const sem = course.semesters[semId];
    const unit = sem?.units.find((u) => u.available && u.vocabulary.length > 0);
    if (unit) return { unitId: unit.id, semesterId: semId };
  }
  return { unitId: "", semesterId: v1 };
}

export function defaultPersist(grade: PrimaryHubGrade): PrimaryHubPersist {
  const { unitId, semesterId } = defaultCurrentForGrade(grade);
  return {
    user: { name: "小朋友", avatar: "🐻" },
    units: {},
    mistakes: [],
    lastAITest: null,
    aiTestCount: 0,
    aiTestHistory: [],
    currentUnit: unitId,
    currentSemester: semesterId,
  };
}

export function loadPersist(grade: PrimaryHubGrade): PrimaryHubPersist {
  const base = defaultPersist(grade);
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + grade);
    if (!raw) return base;
    const data = JSON.parse(raw) as Partial<PrimaryHubPersist>;
    const merged: PrimaryHubPersist = {
      ...base,
      ...data,
      user: { ...base.user, ...data.user },
      units: data.units ?? base.units,
      mistakes: data.mistakes ?? base.mistakes,
      aiTestHistory: data.aiTestHistory ?? base.aiTestHistory,
    };
    return migratePersistUnits(merged);
  } catch {
    return base;
  }
}

export function savePersist(grade: PrimaryHubGrade, state: PrimaryHubPersist): void {
  try {
    localStorage.setItem(
      STORAGE_PREFIX + grade,
      JSON.stringify({
        user: state.user,
        units: state.units,
        mistakes: state.mistakes,
        lastAITest: state.lastAITest,
        aiTestCount: state.aiTestCount,
        aiTestHistory: state.aiTestHistory,
        currentUnit: state.currentUnit,
        currentSemester: state.currentSemester,
      }),
    );
  } catch {
    /* quota */
  }
}

export function getUnitState(state: PrimaryHubPersist, unitId: string): UnitState {
  if (!state.units[unitId]) {
    state.units[unitId] = {
      completedStages: [],
      stars: 0,
      firstCompleteDate: null,
      reviewSchedule: [],
      reviewHistory: [],
    };
  }
  return state.units[unitId];
}
