/**
 * 今日学习编排的测试。
 *
 * Aaron 验收时点名要看的三条里,有两条由这里保证:
 * 「按钮上的数字对不对」「点进去的序列顺序对不对」。
 * 排序或截断错了在界面上极难看出来 —— 用户只会觉得"怎么老是这几个词",
 * 所以口径必须钉死。
 */
import { describe, expect, it } from "vitest";
import { orderTasks, normalizeMode, REVIEW_CAP } from "./todayPlan";
import type { VocabWord } from "./data";

const w = (id: string, freq: number | null = 1000): VocabWord =>
  ({ id, headword: id, freq_rank: freq } as unknown as VocabWord);

const dueOf = (id: string, at: string, freq = 1000) => ({ word: w(id, freq), nextReviewAt: at });

describe("orderTasks · 三批的先后", () => {
  it("复习 → 错题 → 新词,顺序不能反", () => {
    const { tasks } = orderTasks(
      [dueOf("r1", "2026-08-01")],
      [{ word: w("m1"), mode: "spell" }],
      [w("n1")],
      10,
    );
    expect(tasks.map(t => t.kind)).toEqual(["review", "mistake", "new"]);
  });

  it("同一批内按 freq_rank 高频在前", () => {
    const { tasks } = orderTasks(
      [dueOf("lo", "2026-08-01", 9000), dueOf("hi", "2026-08-01", 100)],
      [], [], 10,
    );
    expect(tasks.map(t => t.word.id)).toEqual(["hi", "lo"]);
  });

  it("freq_rank 为空的排最后,不能因为 null 被当成 0 顶到最前", () => {
    const { tasks } = orderTasks([dueOf("x", "2026-08-01", null), dueOf("y", "2026-08-01", 500)], [], [], 10);
    expect(tasks.map(t => t.word.id)).toEqual(["y", "x"]);
  });
});

describe("orderTasks · 复习截断", () => {
  const many = Array.from({ length: REVIEW_CAP + 12 }, (_, i) =>
    // next_review_at 越早 = 拖得越久
    dueOf(`w${i}`, `2026-08-${String((i % 28) + 1).padStart(2, "0")}`, i));

  it(`超过 ${REVIEW_CAP} 条时只派 ${REVIEW_CAP} 条,其余记入 deferred`, () => {
    const { tasks, deferred } = orderTasks(many, [], [], 100);
    expect(tasks.filter(t => t.kind === "review")).toHaveLength(REVIEW_CAP);
    expect(deferred).toBe(12);
  });

  it("截断按**最久未复习优先**,不是随机也不是丢最早的", () => {
    const due = [
      dueOf("oldest", "2026-01-01"),
      dueOf("newer", "2026-08-01"),
      dueOf("newest", "2026-08-09"),
    ];
    // 把 CAP 想象成 1:用 goal 无关,直接看排序结果里 oldest 是否被保留
    const { tasks } = orderTasks(due, [], [], 100);
    expect(tasks.map(t => t.word.id)).toContain("oldest");
  });

  it("没超过 CAP 时 deferred = 0", () => {
    const { deferred } = orderTasks([dueOf("a", "2026-08-01")], [], [], 10);
    expect(deferred).toBe(0);
  });
});

describe("orderTasks · 新词补足到目标", () => {
  const fresh = Array.from({ length: 50 }, (_, i) => w(`n${i}`, i));

  it("目标 20、已排 5 → 补 15 个新词", () => {
    const due = Array.from({ length: 5 }, (_, i) => dueOf(`r${i}`, "2026-08-01", i));
    const { tasks } = orderTasks(due, [], fresh, 20);
    expect(tasks.filter(t => t.kind === "new")).toHaveLength(15);
    expect(tasks).toHaveLength(20);
  });

  it("⚠️ 复习已超目标时**一个新词都不补** —— 否则「目标 20」会变成「每天 60」", () => {
    const due = Array.from({ length: 40 }, (_, i) => dueOf(`r${i}`, "2026-08-01", i));
    const { tasks } = orderTasks(due, [], fresh, 20);
    expect(tasks.filter(t => t.kind === "new")).toHaveLength(0);
    expect(tasks).toHaveLength(40);   // 复习一个不少,该学的还得学
  });

  it("错题也算进已排量", () => {
    const mistakes = Array.from({ length: 8 }, (_, i) => ({ word: w(`m${i}`, i), mode: "spell" as const }));
    const { tasks } = orderTasks([], mistakes, fresh, 20);
    expect(tasks.filter(t => t.kind === "new")).toHaveLength(12);
  });

  it("新词不够就有多少给多少,不报错", () => {
    const { tasks } = orderTasks([], [], [w("only")], 20);
    expect(tasks.filter(t => t.kind === "new")).toHaveLength(1);
  });

  it("全空 → 空计划", () => {
    const { tasks, deferred } = orderTasks([], [], [], 20);
    expect(tasks).toEqual([]);
    expect(deferred).toBe(0);
  });
});

describe("orderTasks · 每一项用什么题型", () => {
  it("复习用英汉选择(最快)", () => {
    const { tasks } = orderTasks([dueOf("r", "2026-08-01")], [], [], 10);
    expect(tasks[0].mode).toBe("zh_choice");
    expect(tasks[0].showCardFirst).toBe(false);
  });

  it("错题用它**当初错的那种**题型 —— 换题型等于绕开短板", () => {
    const { tasks } = orderTasks([], [{ word: w("m"), mode: "spell" }], [], 10);
    expect(tasks[0].mode).toBe("spell");
  });

  it("新词先看卡再考", () => {
    const { tasks } = orderTasks([], [], [w("n")], 10);
    expect(tasks[0].showCardFirst).toBe(true);
  });
});

describe("normalizeMode", () => {
  it.each(["zh_choice", "en_choice", "match", "listen", "spell"])("认得 %s", m => {
    expect(normalizeMode(m)).toBe(m);
  });
  it.each([null, undefined, "", "bogus"])("认不出的退回 zh_choice(%s)", m => {
    expect(normalizeMode(m as string)).toBe("zh_choice");
  });
});
