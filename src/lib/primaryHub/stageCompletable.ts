import { findUnit } from "./courseData";
import { getReadWriteConfig } from "./readWriteRegistry";
import type { StageDef } from "./types";

/** Stage is playable for progress, stars, and unit completion. */
export function isStageCompletable(unitId: string, stageIdx: number, stage: StageDef): boolean {
  if (stage.type === "readWrite" && !getReadWriteConfig(unitId, stageIdx)) {
    return false;
  }
  return true;
}

export function isReadWriteComingSoon(unitId: string, stageIdx: number, stage: StageDef): boolean {
  return stage.type === "readWrite" && !getReadWriteConfig(unitId, stageIdx);
}

export function getCompletableStageIndices(unitId: string): number[] {
  const unit = findUnit(unitId);
  if (!unit) return [];
  return unit.stages
    .map((stage, index) => (isStageCompletable(unitId, index, stage) ? index : -1))
    .filter((index) => index >= 0);
}
