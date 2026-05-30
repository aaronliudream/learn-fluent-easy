import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { recordResult, selectWords, getProgress, MASTERED_BOX } from "./srs";
import type { GameWord } from "./types";

const KEY = "bme_vocab_srs_v1_g4";

function word(id: string): GameWord {
  return { id, en: id, cn: id, unitId: "g4v1_u1", volume: 1 };
}

/** 读 store 里某词的盒子等信息(测试内部用)。 */
function read(id: string) {
  const raw = window.localStorage.getItem(KEY);
  return raw ? JSON.parse(raw).words[id] : undefined;
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
    expect(s.correct).toBe(1);
    expect(s.streak).toBe(1);
    expect(s.nextDue).toBeGreaterThan(now); // 推到将来

    recordResult("cat", true);
    recordResult("cat", true);
    s = read("cat");
    expect(s.box).toBe(3);
    expect(s.streak).toBe(3);
  });

  it("答错让 box 回退两格、nextDue 在 1 分钟内、streak 清零", () => {
    recordResult("dog", true);
    recordResult("dog", true);
    recordResult("dog", true); // box=3
    const now = Date.now();
    recordResult("dog", false);
    const s = read("dog");
    expect(s.box).toBe(1); // 3 - 2
    expect(s.streak).toBe(0);
    expect(s.wrong).toBe(1);
    expect(s.nextDue).toBeLessThanOrEqual(now + 60_000);
  });

  it("box 不会低于 0、不会高于 5", () => {
    recordResult("x", false);
    expect(read("x").box).toBe(0); // max(0, 0-2)
    for (let i = 0; i < 8; i++) recordResult("y", true);
    expect(read("y").box).toBe(5); // min(5, ...)
  });
});

describe("selectWords", () => {
  it("没测过的词排在已掌握(休眠)的词前面 —— 池子够时已掌握词不出", () => {
    // M 刷到已掌握且在复习期内(休眠)
    for (let i = 0; i < MASTERED_BOX; i++) recordResult("mastered", true);
    const pool = [
      word("mastered"),
      word("fresh1"),
      word("fresh2"),
      word("fresh3"),
    ];
    const picked = selectWords(pool, 3).map((w) => w.id);
    expect(picked).not.toContain("mastered"); // 已掌握休眠 → 基本不出
    expect(picked).toEqual(expect.arrayContaining(["fresh1", "fresh2", "fresh3"]));
  });

  it("maxMastered 生效:已掌握词最多混入设定个数", () => {
    for (let i = 0; i < MASTERED_BOX; i++) recordResult("m1", true);
    for (let i = 0; i < MASTERED_BOX; i++) recordResult("m2", true);
    // 池子里只有 1 个新词 + 2 个已掌握;要 2 个,maxMastered=1 → 至多 1 个已掌握
    const pool = [word("m1"), word("m2"), word("fresh")];
    const picked = selectWords(pool, 2, { maxMastered: 1 }).map((w) => w.id);
    const masteredCount = picked.filter((id) => id === "m1" || id === "m2").length;
    expect(masteredCount).toBeLessThanOrEqual(1);
    expect(picked).toContain("fresh");
  });

  it("错得多的词优先级更高", () => {
    recordResult("hard", false); // 错过一次,box 0,很快到期
    vi.setSystemTime(Date.now() + 2 * 60_000); // 过了重试期
    const pool = [word("hard"), word("seen_ok")];
    // seen_ok 答对过一次(box1,休眠中)
    recordResult("seen_ok", true);
    const picked = selectWords(pool, 1).map((w) => w.id);
    expect(picked[0]).toBe("hard");
  });
});

describe("getProgress", () => {
  it("把若干词刷到 box>=4 后 mastered/percent 正确", () => {
    const pool = [word("a"), word("b"), word("c"), word("d")];
    // a、b 刷到已掌握
    for (let i = 0; i < MASTERED_BOX; i++) recordResult("a", true);
    for (let i = 0; i < MASTERED_BOX; i++) recordResult("b", true);
    recordResult("c", true); // 只 box1,未掌握
    const p = getProgress(pool);
    expect(p.total).toBe(4);
    expect(p.mastered).toBe(2);
    expect(p.seen).toBe(3);
    expect(p.percent).toBe(50); // 2/4
  });

  it("空 store → 0", () => {
    const p = getProgress([word("a"), word("b")]);
    expect(p).toEqual({ total: 2, mastered: 0, seen: 0, percent: 0 });
  });
});
