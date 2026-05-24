import type { Mistake, PrimaryHubPersist, UnitState } from "./types";

function uniqSorted(nums: number[]): number[] {
  return [...new Set(nums)].sort((a, b) => a - b);
}

function mergeStageProgress(
  a?: Record<number, number>,
  b?: Record<number, number>,
): Record<number, number> | undefined {
  const keys = new Set([...Object.keys(a ?? {}), ...Object.keys(b ?? {})].map(Number));
  if (keys.size === 0) return undefined;
  const out: Record<number, number> = {};
  for (const k of keys) {
    out[k] = Math.max(a?.[k] ?? 0, b?.[k] ?? 0);
  }
  return out;
}

function mergeVocabViewed(a?: number[], b?: number[]): number[] | undefined {
  const merged = uniqSorted([...(a ?? []), ...(b ?? [])]);
  return merged.length ? merged : undefined;
}

function mergeSentenceCompleted(a?: string[], b?: string[]): string[] | undefined {
  const merged = [...new Set([...(a ?? []), ...(b ?? [])])];
  return merged.length ? merged : undefined;
}

function mergeUnitState(local: UnitState, remote: UnitState): UnitState {
  const completedStages = uniqSorted([...local.completedStages, ...remote.completedStages]);
  const stageProgress = mergeStageProgress(local.stageProgress, remote.stageProgress);
  const vocabViewed = mergeVocabViewed(local.vocabViewed, remote.vocabViewed);
  const sentenceCompleted = mergeSentenceCompleted(local.sentenceCompleted, remote.sentenceCompleted);

  let firstCompleteDate = local.firstCompleteDate ?? remote.firstCompleteDate ?? null;
  if (local.firstCompleteDate && remote.firstCompleteDate) {
    firstCompleteDate =
      local.firstCompleteDate <= remote.firstCompleteDate
        ? local.firstCompleteDate
        : remote.firstCompleteDate;
  }

  return {
    completedStages,
    stageProgress,
    vocabViewed,
    sentenceCompleted,
    stars: Math.max(local.stars ?? 0, remote.stars ?? 0),
    firstCompleteDate,
    reviewSchedule: [...(local.reviewSchedule ?? []), ...(remote.reviewSchedule ?? [])],
    reviewHistory: [...(local.reviewHistory ?? []), ...(remote.reviewHistory ?? [])],
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
    .slice(0, 100);
}

function hasUnitActivity(units: Record<string, UnitState>): boolean {
  return Object.values(units).some(
    (u) =>
      u.completedStages.length > 0 ||
      (u.stageProgress && Object.keys(u.stageProgress).length > 0) ||
      (u.vocabViewed && u.vocabViewed.length > 0) ||
      u.stars > 0,
  );
}

const emptyUnit = (): UnitState => ({
  completedStages: [],
  stars: 0,
  firstCompleteDate: null,
  reviewSchedule: [],
  reviewHistory: [],
});

/** Merge local + remote; prefer retaining more progress (union / max). */
export function mergePrimaryHubPersist(
  local: PrimaryHubPersist,
  remote: PrimaryHubPersist,
): PrimaryHubPersist {
  const unitIds = new Set([...Object.keys(local.units), ...Object.keys(remote.units)]);
  const units: Record<string, UnitState> = {};
  for (const id of unitIds) {
    units[id] = mergeUnitState(local.units[id] ?? emptyUnit(), remote.units[id] ?? emptyUnit());
  }

  const localActive = hasUnitActivity(local.units);

  return {
    user: local.user?.name ? local.user : remote.user,
    units,
    mistakes: mergeMistakes(local.mistakes ?? [], remote.mistakes ?? []),
    lastAITest: Math.max(local.lastAITest ?? 0, remote.lastAITest ?? 0) || null,
    aiTestCount: Math.max(local.aiTestCount ?? 0, remote.aiTestCount ?? 0),
    aiTestHistory: [...(local.aiTestHistory ?? []), ...(remote.aiTestHistory ?? [])].slice(0, 50),
    currentUnit: localActive ? local.currentUnit : remote.currentUnit || local.currentUnit,
    currentSemester: localActive ? local.currentSemester : remote.currentSemester || local.currentSemester,
  };
}

/** Strip volatile fields before cloud compare / upsert payload. */
export function persistPayload(state: PrimaryHubPersist): PrimaryHubPersist {
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
