import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { recordResult, selectWords, getProgress, MASTERED_BOX } from "./srs";
import type { GameWord } from "./types";

const KEY = "bme_vocab_srs_v1_g4";

function word(id: string): GameWord {
  return { id, en: id, cn: id, unitId: "g4v1_u1", volume: 1 };
}
function read(id: string) {
  const raw = window.localStorage.getItem(KEY);
  return raw ? JSON.parse(raw).words[id] : undefined;
}
/** 答对 MASTERED_BOX 次 → 该词进入"已掌握(休眠)"。 */
function master(id: string) {
  for (let i = 0; i < MASTERED_BOX; i++) recordResult(id, true);
}

beforeEach(() => {
  window.localStorage.clear();
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-06-01T00:00:00Z"));
});
afterEach(() => {
  vi.useRealTimers();
});

describe("recordResult", () => {
  it("连续答对让 box 上升、nextDue 推后到将来", () => {
    const now = Date.now();
    recordResult("cat", true);
    let s = read("cat");
    expect(s.box).toBe(1);
    expect(s.streak).toBe(1);
    expect(s.nextDue).toBeGreaterThan(now);
    recordResult("cat", true);
    recordResult("cat", true);
    s = read("cat");
    expect(s.box).toBe(3);
  });

  it("答错让 box 回退两格、nextDue 在 1 分钟内、streak 清零", () => {
    recordResult("dog", true);
    recordResult("dog", true);
    recordResult("dog", true); // box=3
    const now = Date.now();
    recordResult("dog", false);
    const s = read("dog");
    expect(s.box).toBe(1);
    expect(s.streak).toBe(0);
    expect(s.nextDue).toBeLessThanOrEqual(now + 60_000);
  });

  it("box 不低于 0、不高于 5", () => {
    recordResult("x", false);
    expect(read("x").box).toBe(0);
    for (let i = 0; i < 8; i++) recordResult("y", true);
    expect(read("y").box).toBe(5);
  });
});

describe("MASTERED_BOX = 2 与 getProgress 渐进式", () => {
  it("MASTERED_BOX 为 2", () => {
    expect(MASTERED_BOX).toBe(2);
  });

  it("答对 2 次即计入已掌握;percent 渐进", () => {
    const pool = [word("a"), word("b"), word("c"), word("d")];
    master("a"); // box2 掌握
    master("b"); // box2 掌握
    recordResult("c", true); // box1,未掌握
    const p = getProgress(pool);
    expect(p.total).toBe(4);
    expect(p.mastered).toBe(2);
    expect(p.seen).toBe(3);
    // boxSum = 2 + 2 + 1 + 0 = 5; 满格 = 4*2 = 8 → 63%
    expect(p.percent).toBe(63);
  });

  it("某词只答对 1 次时,贡献约为该词满格的一半", () => {
    const pool = [word("solo")];
    recordResult("solo", true); // box1
    const p = getProgress(pool);
    expect(p.mastered).toBe(0);
    expect(p.percent).toBe(50); // 1 / (1*2)
  });

  it("空 store → 0", () => {
    expect(getProgress([word("a"), word("b")])).toEqual({
      total: 2,
      mastered: 0,
      seen: 0,
      percent: 0,
    });
  });
});

describe("selectWords", () => {
  it("到期复习词占比 ≈ reviewRatio,新词被纳入", () => {
    // 4 个 due(答对 1 次 → box1,属 due bucket) + 6 个 fresh(没测过)
    const dueIds = ["d1", "d2", "d3", "d4"];
    dueIds.forEach((id) => recordResult(id, true));
    const freshIds = ["f1", "f2", "f3", "f4", "f5", "f6"];
    const pool = [...dueIds, ...freshIds].map(word);

    const picked = selectWords(pool, 4, { reviewRatio: 0.5 }).map((w) => w.id);
    const reviewCount = picked.filter((id) => dueIds.includes(id)).length;
    expect(reviewCount).toBe(2); // round(4 * 0.5)
    expect(picked.some((id) => freshIds.includes(id))).toBe(true); // 有新词
    expect(picked).toHaveLength(4);
  });

  it("已掌握(休眠)词最多混入 maxMastered 个", () => {
    master("m1");
    master("m2");
    const pool = [word("m1"), word("m2"), word("f1"), word("f2"), word("f3")];
    const picked = selectWords(pool, 4, { maxMastered: 1 }).map((w) => w.id);
    const masteredCount = picked.filter((id) => id === "m1" || id === "m2").length;
    expect(masteredCount).toBeLessThanOrEqual(1);
    expect(picked.some((id) => id.startsWith("f"))).toBe(true);
  });

  it("没有到期词时,全是新词", () => {
    const pool = ["f1", "f2", "f3"].map(word);
    const picked = selectWords(pool, 3).map((w) => w.id);
    expect(picked.sort()).toEqual(["f1", "f2", "f3"]);
  });
});
