import { describe, it, expect, beforeEach } from "vitest";
import {
  computeLevelStates,
  getRankTier,
  getTotalStars,
  loadAllLevelProgress,
  saveLevelProgress,
  type LevelConfig,
  type LevelProgress,
} from "./progress";

const CFG: LevelConfig[] = [
  { id: 1, name: "关 1", type: "picture_match_sentence" },
  { id: 2, name: "关 2", type: "picture_match_word" },
  { id: 3, name: "关 3", type: "listen_and_choose_word" },
  { id: 4, name: "关 4", type: "listen_and_judge_picture" },
  { id: 5, name: "关 5", type: "odd_one_out" },
  { id: 6, name: "关 6", type: "reading_judge_TF" },
  { id: 7, name: "敬请期待", type: null },
  { id: 8, name: "敬请期待", type: null },
  { id: 9, name: "敬请期待", type: null },
  { id: 10, name: "敬请期待", type: null },
];

const mkProgress = (levelId: number, stars: number): LevelProgress => ({
  levelId,
  stars,
  attempts: 1,
  bestScore: stars / 3,
  lastAttemptAt: Date.now(),
});

describe("computeLevelStates", () => {
  it("on a fresh user: 关 1 is current, 关 2-6 locked, 关 7-10 locked (unplayable)", () => {
    const states = computeLevelStates(CFG, {});
    expect(states[0].state).toBe("current");
    for (let i = 1; i <= 5; i++) expect(states[i].state).toBe("locked");
    for (let i = 6; i <= 9; i++) expect(states[i].state).toBe("locked");
  });

  it("after completing 关 1, 关 2 becomes current and 关 1 shows stars", () => {
    const states = computeLevelStates(CFG, { 1: mkProgress(1, 3) });
    expect(states[0].state).toBe("completed");
    expect(states[0].stars).toBe(3);
    expect(states[1].state).toBe("current");
    for (let i = 2; i <= 5; i++) expect(states[i].state).toBe("locked");
  });

  it("after completing 关 1-5, 关 6 becomes current", () => {
    const prog = { 1: mkProgress(1, 3), 2: mkProgress(2, 2), 3: mkProgress(3, 3), 4: mkProgress(4, 1), 5: mkProgress(5, 3) };
    const states = computeLevelStates(CFG, prog);
    for (let i = 0; i <= 4; i++) expect(states[i].state).toBe("completed");
    expect(states[5].state).toBe("current");
  });

  it("after completing all 6 playable levels, no level is current (everything completed or locked-placeholder)", () => {
    const prog: Record<number, LevelProgress> = {};
    for (let i = 1; i <= 6; i++) prog[i] = mkProgress(i, 3);
    const states = computeLevelStates(CFG, prog);
    for (let i = 0; i <= 5; i++) expect(states[i].state).toBe("completed");
    for (let i = 6; i <= 9; i++) expect(states[i].state).toBe("locked");
    expect(states.some((s) => s.state === "current")).toBe(false);
  });

  it("a 0-star attempt (tried but failed) does NOT count as completed; the level stays current", () => {
    const states = computeLevelStates(CFG, { 1: mkProgress(1, 0) });
    expect(states[0].state).toBe("current");
  });

  it("placeholder levels (type=null) never become current even if no playable left", () => {
    const states = computeLevelStates(CFG.slice(6), {}); // only 关 7-10
    for (const s of states) expect(s.state).toBe("locked");
  });
});

describe("getTotalStars", () => {
  it("only counts playable levels", () => {
    const prog = { 1: mkProgress(1, 3), 7: mkProgress(7, 3) }; // 关 7 placeholder shouldn't count
    expect(getTotalStars(prog, CFG)).toBe(3);
  });
  it("sums across multiple completed levels", () => {
    const prog = { 1: mkProgress(1, 3), 2: mkProgress(2, 2), 3: mkProgress(3, 1) };
    expect(getTotalStars(prog, CFG)).toBe(6);
  });
});

describe("getRankTier (boundary thresholds: 0-3 bronze / 4-9 silver / 10-15 gold / 16-18 rainbow)", () => {
  it("0 → bronze", () => expect(getRankTier(0)).toBe("bronze"));
  it("3 → bronze", () => expect(getRankTier(3)).toBe("bronze"));
  it("4 → silver", () => expect(getRankTier(4)).toBe("silver"));
  it("9 → silver", () => expect(getRankTier(9)).toBe("silver"));
  it("10 → gold", () => expect(getRankTier(10)).toBe("gold"));
  it("15 → gold", () => expect(getRankTier(15)).toBe("gold"));
  it("16 → rainbow", () => expect(getRankTier(16)).toBe("rainbow"));
  it("18 → rainbow", () => expect(getRankTier(18)).toBe("rainbow"));
});

describe("LS round-trip with user isolation", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("save then load returns the same shape", () => {
    saveLevelProgress("user-a", 4, mkProgress(1, 2));
    const loaded = loadAllLevelProgress("user-a", 4);
    expect(loaded[1].stars).toBe(2);
  });

  it("different users do not see each other's progress", () => {
    saveLevelProgress("user-a", 4, mkProgress(1, 3));
    saveLevelProgress("user-b", 4, mkProgress(1, 1));
    expect(loadAllLevelProgress("user-a", 4)[1].stars).toBe(3);
    expect(loadAllLevelProgress("user-b", 4)[1].stars).toBe(1);
  });

  it("guest (userId=null) gets a stable anon scope across calls", () => {
    saveLevelProgress(null, 4, mkProgress(1, 2));
    const loaded = loadAllLevelProgress(null, 4);
    expect(loaded[1].stars).toBe(2);
  });
});
