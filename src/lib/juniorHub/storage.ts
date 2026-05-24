import type { JuniorHubGrade, JuniorHubPersist, UnitState } from "./types";

const defaultUnitState = (): UnitState => ({
  completedStages: [],
  stars: 0,
  firstCompleteDate: null,
  lastAiTestAtProgress: 0,
});

const defaultPersist = (): JuniorHubPersist => ({
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
}

export function getUnitState(state: JuniorHubPersist, unitId: string): UnitState {
  return state.units[unitId] ?? defaultUnitState();
}
