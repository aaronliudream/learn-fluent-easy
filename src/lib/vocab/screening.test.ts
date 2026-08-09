/**
 * 快筛估算口径的测试。
 *
 * 这个功能对用户只输出一个数字(「你已认识约 N 个」),所以那个数字怎么来的
 * 必须能被检验 —— 否则和编数字没区别。这里把口径的每一条都钉死。
 */
import { describe, expect, it } from "vitest";
import {
  estimate, stratumOf, STRATA, POOL_SIZE, PER_STRATUM,
  type ScreenAnswer, type ScreenItem, type StratumId,
} from "./screening";

/** 造 40 道题:每层 8 道,前 2 道是验真题。 */
function mkItems(): ScreenItem[] {
  const items: ScreenItem[] = [];
  for (const s of STRATA) {
    for (let i = 0; i < PER_STRATUM; i++) {
      items.push({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        word: { id: `w-${s.id}-${i}`, headword: `w${s.id}${i}`, def_zh: "释义" } as any,
        stratum: s.id as StratumId,
        verify: i < 2,
        options: i < 2 ? ["释义", "A", "B", "C"] : undefined,
        answer: i < 2 ? "释义" : undefined,
      });
    }
  }
  return items;
}

/** 按"每层认识前 k 道"填答案;验真题一律答对(无水分)。 */
function answerTopK(items: ScreenItem[], kByStratum: Record<number, number>): Map<number, ScreenAnswer> {
  const m = new Map<number, ScreenAnswer>();
  const seen: Record<number, number> = {};
  items.forEach((it, i) => {
    const n = (seen[it.stratum] = (seen[it.stratum] ?? 0) + 1);
    const known = n <= (kByStratum[it.stratum] ?? 0);
    m.set(i, { known, verifiedCorrect: it.verify && known ? true : undefined });
  });
  return m;
}

describe("stratumOf · 与 DDL 的 CASE 同一套判据", () => {
  it.each([
    [657, 1], [6968, 1],
    [6977, 2], [10234, 2],
    [10236, 3], [14458, 3],
    [14459, 4], [20528, 4],
    [20532, 5], [48340, 5],
  ])("freq_rank %i → 第 %i 层", (rank, want) => {
    expect(stratumOf(rank)).toBe(want);
  });

  it("freq_rank 为空归第 5 层(实测那 123 个词全是生僻词)", () => {
    expect(stratumOf(null)).toBe(5);
    expect(stratumOf(undefined)).toBe(5);
  });

  it("分层点无缝无重叠:相邻层边界紧挨着", () => {
    for (let i = 0; i < STRATA.length - 1; i++) {
      const hi = STRATA[i].maxRank as number;
      expect(stratumOf(hi)).toBe(STRATA[i].id);
      expect(stratumOf(STRATA[i + 1].minRank)).toBe(STRATA[i + 1].id);
    }
  });

  it("池子总数 = 各层之和 = 4470(与 DDL validate 实测一致)", () => {
    expect(POOL_SIZE).toBe(4470);
  });
});

describe("estimate", () => {
  it("全不认识 → 0,区间也是 0(不能给出正的下界)", () => {
    const items = mkItems();
    const r = estimate(items, answerTopK(items, {}));
    expect(r.known).toBe(0);
    expect(r.lo).toBe(0);
    expect(r.hi).toBe(0);
  });

  it("全认识且验真全对 → 满池 4470", () => {
    const items = mkItems();
    const r = estimate(items, answerTopK(items, { 1: 8, 2: 8, 3: 8, 4: 8, 5: 8 }));
    expect(r.known).toBe(POOL_SIZE);
  });

  it("每层认识一半 → 约一半(4470 × 0.5 = 2235)", () => {
    const items = mkItems();
    const r = estimate(items, answerTopK(items, { 1: 4, 2: 4, 3: 4, 4: 4, 5: 4 }));
    expect(r.known).toBe(2235);
  });

  it("典型形态:高频层认识多、低频层认识少 —— 估算落在两者之间", () => {
    const items = mkItems();
    const r = estimate(items, answerTopK(items, { 1: 8, 2: 6, 3: 3, 4: 1, 5: 0 }));
    // (8+6+3+1+0)/8 × 894 = 2011.5
    expect(r.known).toBe(2012);
    expect(r.lo).toBeLessThan(r.known);
    expect(r.hi).toBeGreaterThan(r.known);
  });

  it("验真答错会打折 —— 自称认识但选错,估算必须低于不打折", () => {
    const items = mkItems();
    const clean = answerTopK(items, { 1: 8, 2: 8, 3: 8, 4: 8, 5: 8 });
    const inflated = new Map(clean);
    // 10 道验真题里错 5 道 → inflation = 0.5
    let flipped = 0;
    items.forEach((it, i) => {
      if (it.verify && flipped < 5) { inflated.set(i, { known: true, verifiedCorrect: false }); flipped++; }
    });
    const a = estimate(items, clean);
    const b = estimate(items, inflated);
    expect(b.inflation).toBeCloseTo(0.5, 5);
    expect(b.known).toBeLessThan(a.known);
    expect(b.known).toBe(Math.round(POOL_SIZE * 0.5));
  });

  it("一道验真题都没自称认识 → inflation=null 且**不打折**(没有证据就别编)", () => {
    const items = mkItems();
    // 只认识非验真题(每层后 6 道)
    const m = new Map<number, ScreenAnswer>();
    const seen: Record<number, number> = {};
    items.forEach((it, i) => {
      const n = (seen[it.stratum] = (seen[it.stratum] ?? 0) + 1);
      m.set(i, { known: n > 2 });          // 前 2 道(验真题)一律"不认识"
    });
    const r = estimate(items, m);
    expect(r.inflation).toBeNull();
    expect(r.known).toBe(Math.round(POOL_SIZE * (6 / 8)));   // 未打折
  });

  it("自称不认识的验真题不参与水分计算(它没在声称什么)", () => {
    const items = mkItems();
    const m = answerTopK(items, { 1: 8, 2: 8, 3: 8, 4: 8, 5: 8 });
    // 把某道验真题改成"不认识但恰好选错" —— 不该影响 inflation
    const vi = items.findIndex(it => it.verify);
    m.set(vi, { known: false, verifiedCorrect: false });
    const r = estimate(items, m);
    expect(r.inflation).toBe(1);
  });

  it("区间被裁在 [0, 4470] 内,不出现负数或超池", () => {
    const items = mkItems();
    for (const k of [0, 1, 4, 7, 8]) {
      const r = estimate(items, answerTopK(items, { 1: k, 2: k, 3: k, 4: k, 5: k }));
      expect(r.lo).toBeGreaterThanOrEqual(0);
      expect(r.hi).toBeLessThanOrEqual(POOL_SIZE);
      expect(r.lo).toBeLessThanOrEqual(r.known);
      expect(r.hi).toBeGreaterThanOrEqual(r.known);
    }
  });

  it("建议起点 = 第一个认识率 < 60% 的层", () => {
    const items = mkItems();
    // 第 3 层 3/8 = 37.5% < 60%,前两层 8/8、6/8=75% 都 ≥60%
    expect(estimate(items, answerTopK(items, { 1: 8, 2: 6, 3: 3, 4: 1, 5: 0 })).startAt).toBe(3);
    // 全会 → 推最生僻那层
    expect(estimate(items, answerTopK(items, { 1: 8, 2: 8, 3: 8, 4: 8, 5: 8 })).startAt).toBe(5);
    // 全不会 → 从第 1 层开始
    expect(estimate(items, answerTopK(items, {})).startAt).toBe(1);
  });

  it("各层认识数之和 ≈ 总估算(层与总口径一致,不能各算各的)", () => {
    const items = mkItems();
    const r = estimate(items, answerTopK(items, { 1: 7, 2: 5, 3: 4, 4: 2, 5: 1 }));
    const sum = r.perStratum.reduce((s, x) => s + x.known, 0);
    expect(Math.abs(sum - r.known)).toBeLessThanOrEqual(3);   // 只允许各层四舍五入的累计误差
  });
});
