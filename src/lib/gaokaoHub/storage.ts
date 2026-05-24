import type { GaokaoHubGrade, GaokaoHubPersist, UnitState } from "./types";

const defaultUnitState = (): UnitState => ({
  completedStages: [],
  stars: 0,
  firstCompleteDate: null,
  lastAiTestAtProgress: 0,
});

const defaultPersist = (): GaokaoHubPersist => ({
  user: { name: "同学", avatar: "🎓" },
  units: {},
  mistakes: [],
  lastAITest: null,
  aiTestCount: 0,
  aiTestHistory: [],
  currentUnit: "",
  currentSemester: "",
});

function key(grade: GaokaoHubGrade) {
  return `gaokaoHub:${grade}`;
}

export function loadPersist(grade: GaokaoHubGrade): GaokaoHubPersist {
  try {
    const raw = localStorage.getItem(key(grade));
    if (!raw) return defaultPersist();
    const parsed = JSON.parse(raw) as GaokaoHubPersist;
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

export function savePersist(grade: GaokaoHubGrade, state: GaokaoHubPersist) {
  localStorage.setItem(key(grade), JSON.stringify(state));
}

export function getUnitState(state: GaokaoHubPersist, unitId: string): UnitState {
  return state.units[unitId] ?? defaultUnitState();
}
