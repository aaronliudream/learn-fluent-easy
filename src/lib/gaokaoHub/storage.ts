import type { GaokaoHubGrade, GaokaoHubPersist, UnitState } from "./types";
import { findUnit } from "./courseData";

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
    const out: GaokaoHubPersist = {
      ...defaultPersist(),
      ...parsed,
      units: parsed.units ?? {},
      mistakes: parsed.mistakes ?? [],
      aiTestHistory: parsed.aiTestHistory ?? [],
    };
    // 清脏进度:删掉已隐藏/不存在单元的进度;currentUnit 指向不可见单元则重置(不被"继续学习"带回)。
    for (const id of Object.keys(out.units)) {
      const u = findUnit(id);
      if (!u || !u.available) delete out.units[id];
    }
    const cur = out.currentUnit ? findUnit(out.currentUnit) : null;
    if (!cur || !cur.available) {
      out.currentUnit = "";
      out.currentSemester = "";
    }
    return out;
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
