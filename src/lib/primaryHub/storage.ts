import type { PrimaryHubGrade, PrimaryHubPersist, UnitState } from "./types";
import { getGradeCourse, isUnitListed, semesterIdsForGrade } from "./courseData";
import { migratePersistUnits } from "./stageProgressMigrate";

export const STORAGE_PREFIX = "primary_hub_v1_";

export const PRIMARY_HUB_GRADES = [3, 4, 5, 6] as const;

type CloudSyncFn = (grade: PrimaryHubGrade, state: PrimaryHubPersist) => void;
let cloudSyncFn: CloudSyncFn | null = null;
let cloudSyncBlocked = false;

/** Block cloud upsert while guest-merge prompt is pending. */
export function setPrimaryHubCloudSyncBlocked(blocked: boolean): void {
  cloudSyncBlocked = blocked;
}

/** Registered by PrimaryHubProvider when mounted (debounced cloud upsert). */
export function registerPrimaryHubCloudSync(fn: CloudSyncFn | null): void {
  cloudSyncFn = fn;
}

function defaultCurrentForGrade(grade: PrimaryHubGrade): { unitId: string; semesterId: string } {
  const [v1, v2] = semesterIdsForGrade(grade);
  const course = getGradeCourse(grade);
  for (const semId of [v1, v2]) {
    const sem = course.semesters[semId];
    const unit = sem?.units.find((u) => isUnitListed(u) && u.vocabulary.length > 0);
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

export function savePersistLocalOnly(grade: PrimaryHubGrade, state: PrimaryHubPersist): void {
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

export function savePersist(grade: PrimaryHubGrade, state: PrimaryHubPersist): void {
  savePersistLocalOnly(grade, state);
  if (!cloudSyncBlocked) cloudSyncFn?.(grade, state);
}

export function clearPersist(grade: PrimaryHubGrade): void {
  try {
    localStorage.removeItem(STORAGE_PREFIX + grade);
  } catch {
    /* ignore */
  }
}

export function clearAllPrimaryHubLocal(): void {
  for (const g of PRIMARY_HUB_GRADES) clearPersist(g);
}

const EMPTY_UNIT: UnitState = {
  completedStages: [],
  stars: 0,
  firstCompleteDate: null,
  reviewSchedule: [],
  reviewHistory: [],
};

/** Read-only; does not mutate state (safe during render / progress calc). */
export function readUnitState(state: PrimaryHubPersist, unitId: string): UnitState {
  return state.units[unitId] ?? EMPTY_UNIT;
}

/** Ensures unit exists on state; only use inside setState before commit. */
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
