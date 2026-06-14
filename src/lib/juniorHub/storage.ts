import type { JuniorHubGrade, JuniorHubPersist, UnitState } from "./types";

const defaultUnitState = (): UnitState => ({
  completedStages: [],
  stars: 0,
  firstCompleteDate: null,
  lastAiTestAtProgress: 0,
});

export const defaultPersist = (): JuniorHubPersist => ({
  user: { name: "同学", avatar: "🎓" },
  units: {},
  mistakes: [],
  lastAITest: null,
  aiTestCount: 0,
  aiTestHistory: [],
  currentUnit: "",
  currentSemester: "",
});

function key(grade: JuniorHubGrade) {
  return `juniorHub:${grade}`;
}

/**
 * Cloud-sync bridge: the JuniorHubProvider registers a callback so that EVERY
 * savePersist (from any call site) also schedules a debounced cloud upsert when
 * signed in. Kept here (not in context) so external writers sync without changes.
 */
let cloudSyncCb: ((grade: JuniorHubGrade, state: JuniorHubPersist) => void) | null = null;
export function registerJuniorHubCloudSync(
  cb: ((grade: JuniorHubGrade, state: JuniorHubPersist) => void) | null,
) {
  cloudSyncCb = cb;
}

export function loadPersist(grade: JuniorHubGrade): JuniorHubPersist {
  try {
    const raw = localStorage.getItem(key(grade));
    if (!raw) return defaultPersist();
    const parsed = JSON.parse(raw) as JuniorHubPersist;
    return {
      ...defaultPersist(),
      ...parsed,
      units: parsed.units ?? {},
      mistakes: parsed.mistakes ?? [],
      aiTestHistory: parsed.aiTestHistory ?? [],
    };
  } catch {
    return defaultPersist();
  }
}

export function savePersist(grade: JuniorHubGrade, state: JuniorHubPersist) {
  localStorage.setItem(key(grade), JSON.stringify(state));
  cloudSyncCb?.(grade, state);
}

/** Write localStorage only — does NOT trigger a cloud push. Used during cloud
 * hydration to avoid pushing back what we just pulled (the hydrate flow pushes
 * the merged state itself exactly once). */
export function savePersistLocalOnly(grade: JuniorHubGrade, state: JuniorHubPersist) {
  localStorage.setItem(key(grade), JSON.stringify(state));
}

export function getUnitState(state: JuniorHubPersist, unitId: string): UnitState {
  return state.units[unitId] ?? defaultUnitState();
}
