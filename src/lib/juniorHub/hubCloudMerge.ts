import type { Mistake, JuniorHubPersist, UnitState } from "./types";

/**
 * Merge logic for Junior Hub cloud sync. Direction is ALWAYS local ∪ remote
 * (union of completed stages, max of stars/counters) — never overwrite. This
 * guarantees that pulling an empty/partial cloud state can only ADD progress,
 * never erase what a device already has.
 */

function uniqSorted(nums: number[]): number[] {
  return [...new Set(nums)].sort((a, b) => a - b);
}

function mergeUnitState(local: UnitState, remote: UnitState): UnitState {
  const completedStages = uniqSorted([...local.completedStages, ...remote.completedStages]);

  let firstCompleteDate = local.firstCompleteDate ?? remote.firstCompleteDate ?? null;
  if (local.firstCompleteDate && remote.firstCompleteDate) {
    firstCompleteDate =
      local.firstCompleteDate <= remote.firstCompleteDate
        ? local.firstCompleteDate
        : remote.firstCompleteDate;
  }

  return {
    completedStages,
    stars: Math.max(local.stars ?? 0, remote.stars ?? 0),
    firstCompleteDate,
    lastAiTestAtProgress: Math.max(
      local.lastAiTestAtProgress ?? 0,
      remote.lastAiTestAtProgress ?? 0,
    ),
  };
}

function mergeMistakes(a: Mistake[], b: Mistake[]): Mistake[] {
  const byKey = new Map<string, Mistake>();
  for (const m of [...a, ...b]) {
    const key = `${m.unitId ?? ""}|${m.q}|${m.answer}`;
    const prev = byKey.get(key);
    if (!prev || (m.id ?? 0) > (prev.id ?? 0)) byKey.set(key, m);
  }
  return [...byKey.values()]
    .sort((x, y) => String(y.date ?? "").localeCompare(String(x.date ?? "")))
    .slice(0, 150);
}

export function unitHasActivity(u: UnitState): boolean {
  return u.completedStages.length > 0 || (u.stars ?? 0) > 0 || u.firstCompleteDate != null;
}

export function hasUnitActivity(units: Record<string, UnitState>): boolean {
  return Object.values(units).some(unitHasActivity);
}

/** Drop empty unit shells (getUnitState default pollution) before cloud upsert. */
export function stripEmptyUnits(state: JuniorHubPersist): JuniorHubPersist {
  const units: Record<string, UnitState> = {};
  for (const [id, u] of Object.entries(state.units)) {
    if (unitHasActivity(u)) units[id] = u;
  }
  return { ...state, units };
}

const emptyUnit = (): UnitState => ({
  completedStages: [],
  stars: 0,
  firstCompleteDate: null,
  lastAiTestAtProgress: 0,
});

/** Merge local + remote; prefer retaining more progress (union / max). */
export function mergeJuniorHubPersist(
  local: JuniorHubPersist,
  remote: JuniorHubPersist,
): JuniorHubPersist {
  const unitIds = new Set([...Object.keys(local.units), ...Object.keys(remote.units)]);
  const units: Record<string, UnitState> = {};
  for (const id of unitIds) {
    units[id] = mergeUnitState(local.units[id] ?? emptyUnit(), remote.units[id] ?? emptyUnit());
  }

  const localActive = hasUnitActivity(local.units);
  const localHasName = !!local.user?.name && local.user.name !== "同学";

  return {
    user: localHasName ? local.user : remote.user?.name ? remote.user : local.user,
    units,
    mistakes: mergeMistakes(local.mistakes ?? [], remote.mistakes ?? []),
    lastAITest: Math.max(local.lastAITest ?? 0, remote.lastAITest ?? 0) || null,
    aiTestCount: Math.max(local.aiTestCount ?? 0, remote.aiTestCount ?? 0),
    aiTestHistory: [...(local.aiTestHistory ?? []), ...(remote.aiTestHistory ?? [])].slice(0, 50),
    currentUnit: localActive ? local.currentUnit : remote.currentUnit || local.currentUnit,
    currentSemester: localActive
      ? local.currentSemester
      : remote.currentSemester || local.currentSemester,
  };
}

/** Strip volatile fields before building the cloud upsert payload. */
export function persistPayload(state: JuniorHubPersist): JuniorHubPersist {
  return {
    user: state.user,
    units: state.units,
    mistakes: state.mistakes,
    lastAITest: state.lastAITest,
    aiTestCount: state.aiTestCount,
    aiTestHistory: state.aiTestHistory,
    currentUnit: state.currentUnit,
    currentSemester: state.currentSemester,
  };
}
