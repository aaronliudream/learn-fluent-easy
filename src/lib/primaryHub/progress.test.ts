import { describe, expect, it } from "vitest";
import { findUnit } from "./courseData";
import { getUnitProgress } from "./progress";
import { getCompletableStageIndices, isReadWriteComingSoon } from "./stageCompletable";
import { migrateUnitStateForEightStages } from "./stageProgressMigrate";
import type { PrimaryHubPersist } from "./types";

describe("stage completable progress", () => {
  it("g4v2_u1 has 8 completable stages", () => {
    expect(getCompletableStageIndices("g4v2_u1")).toHaveLength(8);
  });

  it("g4v2_u2 has 8 completable stages (readWrite live)", () => {
    const unit = findUnit("g4v2_u2");
    expect(unit?.stages).toHaveLength(8);
    expect(getCompletableStageIndices("g4v2_u2")).toHaveLength(8);
    expect(isReadWriteComingSoon("g4v2_u2", 6, unit!.stages[6])).toBe(false);
  });

  it("g4v2_u2 reaches 100% when all 8 stages are done", () => {
    const state: PrimaryHubPersist = {
      user: { name: "t", avatar: "🐻" },
      units: {
        g4v2_u2: {
          completedStages: [0, 1, 2, 3, 4, 5, 6, 7],
          stars: 0,
          firstCompleteDate: null,
          reviewSchedule: [],
          reviewHistory: [],
        },
      },
      mistakes: [],
      lastAITest: null,
      aiTestCount: 0,
      aiTestHistory: [],
      currentUnit: "g4v2_u2",
      currentSemester: "grade4_volume2",
    };
    const p = getUnitProgress(state, "g4v2_u2");
    expect(p.completed).toBe(8);
    expect(p.total).toBe(8);
    expect(p.stageCount).toBe(8);
    expect(p.percent).toBe(100);
  });
});

describe("stageProgressMigrate", () => {
  it("moves old finalQuiz completion from index 6 to 7", () => {
    const migrated = migrateUnitStateForEightStages("g4v2_u2", {
      completedStages: [0, 1, 6],
      stars: 5,
      firstCompleteDate: null,
      reviewSchedule: [],
      reviewHistory: [],
      stageProgress: { 6: 50 },
    });
    expect(migrated.completedStages).toEqual([0, 1, 7]);
    expect(migrated.stageProgress).toEqual({ 7: 50 });
  });
});
