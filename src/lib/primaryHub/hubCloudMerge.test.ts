import { describe, expect, it } from "vitest";
import { hasUnitActivity, mergePrimaryHubPersist, stripEmptyUnits } from "./hubCloudMerge";
import type { PrimaryHubPersist } from "./types";

const base = (): PrimaryHubPersist => ({
  user: { name: "小朋友", avatar: "🐻" },
  units: {},
  mistakes: [],
  lastAITest: null,
  aiTestCount: 0,
  aiTestHistory: [],
  currentUnit: "g4v2_u2",
  currentSemester: "grade4_volume2",
});

describe("mergePrimaryHubPersist", () => {
  it("unions completedStages and takes max stars", () => {
    const local = base();
    local.units.g4v2_u2 = {
      completedStages: [0, 1],
      stars: 8,
      firstCompleteDate: null,
      reviewSchedule: [],
      reviewHistory: [],
    };
    const remote = base();
    remote.units.g4v2_u2 = {
      completedStages: [1, 2],
      stars: 12,
      firstCompleteDate: "2026-05-01",
      reviewSchedule: [],
      reviewHistory: [],
    };
    const merged = mergePrimaryHubPersist(local, remote);
    expect(merged.units.g4v2_u2.completedStages.sort()).toEqual([0, 1, 2]);
    expect(merged.units.g4v2_u2.stars).toBe(12);
  });

  it("merges vocabViewed indices", () => {
    const local = base();
    local.units.g4v2_u2 = {
      completedStages: [],
      stars: 0,
      vocabViewed: [0, 1, 2],
      firstCompleteDate: null,
      reviewSchedule: [],
      reviewHistory: [],
    };
    const remote = base();
    remote.units.g4v2_u2 = {
      completedStages: [],
      stars: 0,
      vocabViewed: [2, 3, 4],
      firstCompleteDate: null,
      reviewSchedule: [],
      reviewHistory: [],
    };
    const merged = mergePrimaryHubPersist(local, remote);
    expect(merged.units.g4v2_u2.vocabViewed).toEqual([0, 1, 2, 3, 4]);
  });

  it("uploads local-only progress when remote empty", () => {
    const local = base();
    local.units.g4v2_u2 = {
      completedStages: [0],
      stars: 5,
      firstCompleteDate: null,
      reviewSchedule: [],
      reviewHistory: [],
    };
    const merged = mergePrimaryHubPersist(local, base());
    expect(merged.units.g4v2_u2.completedStages).toEqual([0]);
  });

  it("stripEmptyUnits removes shells without activity", () => {
    const state = base();
    state.units.g4v1_u1 = {
      completedStages: [],
      stars: 0,
      firstCompleteDate: null,
      reviewSchedule: [],
      reviewHistory: [],
    };
    state.units.g4v2_u2 = {
      completedStages: [],
      stars: 0,
      stageProgress: { 0: 11 },
      firstCompleteDate: null,
      reviewSchedule: [],
      reviewHistory: [],
    };
    const stripped = stripEmptyUnits(state);
    expect(Object.keys(stripped.units)).toEqual(["g4v2_u2"]);
    expect(hasUnitActivity(stripped.units)).toBe(true);
  });
});
