import { findUnit } from "./courseData";
import type { PrimaryHubPersist, UnitState } from "./types";

const EIGHT_STAGE_MIGRATION_UNITS = [
  "g4v2_u2",
  "g4v2_u3",
  "g4v2_u4",
  "g4v2_u5",
  "g4v2_u6",
] as const;

/**
 * u2–u6 gained readWrite at index 6; finalQuiz moved 6 → 7.
 * Remap saved progress from the old 7-stage layout.
 */
export function migrateUnitStateForEightStages(unitId: string, us: UnitState): UnitState {
  const unit = findUnit(unitId);
  if (!unit || unit.stages.length !== 8) return us;
  if (unit.stages[6]?.type !== "readWrite" || unit.stages[7]?.type !== "finalQuiz") {
    return us;
  }

  let completed = [...us.completedStages];
  let stageProgress = us.stageProgress ? { ...us.stageProgress } : undefined;

  if (completed.includes(6) && !completed.includes(7)) {
    completed = completed.filter((i) => i !== 6);
    completed.push(7);
  }

  if (stageProgress && stageProgress[6] != null && stageProgress[7] == null) {
    stageProgress = { ...stageProgress, 7: stageProgress[6] };
    const { 6: _removed, ...rest } = stageProgress;
    stageProgress = Object.keys(rest).length > 0 ? rest : undefined;
  }

  if (
    completed.length === us.completedStages.length &&
    stageProgress === us.stageProgress
  ) {
    return us;
  }

  return { ...us, completedStages: completed, stageProgress };
}

export function migratePersistUnits(state: PrimaryHubPersist): PrimaryHubPersist {
  let changed = false;
  const units = { ...state.units };

  for (const unitId of EIGHT_STAGE_MIGRATION_UNITS) {
    const us = units[unitId];
    if (!us) continue;
    const next = migrateUnitStateForEightStages(unitId, us);
    if (next !== us) {
      units[unitId] = next;
      changed = true;
    }
  }

  return changed ? { ...state, units } : state;
}
