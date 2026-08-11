/**
 * 错题本闯关的取词覆盖 —— 守的是 Aaron 报的"同一批词反复出现"。
 *
 * 原因:`startRound` 里是 `ordered.slice(0, ROUND)`,**完全不看轮次**,每轮取前 10 个。
 * 答对只让 `streak_days +1`(要连对 3 天才移出错题本),词仍在列表里、仍排前面,
 * 于是第 2 轮抽到的还是第 1 轮那批。
 *
 * ⚠️ 这几条测试的价值在于:这个 bug **看代码很难发现**(`slice(0,10)` 长得很正常),
 *    但用"两轮之间有没有重叠"一测就露馅。
 */
import { describe, expect, it } from "vitest";
import { pickRoundTargets } from "./VocabMistakes";

const words = (n: number) => Array.from({ length: n }, (_, i) => ({ id: `w${i + 1}` }));
const ids = (a: { id: string }[]) => a.map(x => x.id);

describe("pickRoundTargets · 一场之内不重复", () => {
  it("第 2 轮**不能**再出第 1 轮考过的词(这就是那个 bug)", () => {
    const all = words(25);
    const r1 = pickRoundTargets(all, new Set(), 10);
    const r2 = pickRoundTargets(all, r1.nextTested, 10);
    expect(ids(r1.targets)).toEqual(["w1", "w2", "w3", "w4", "w5", "w6", "w7", "w8", "w9", "w10"]);
    expect(ids(r2.targets)).toEqual(["w11", "w12", "w13", "w14", "w15", "w16", "w17", "w18", "w19", "w20"]);
    /* 判据是**交集为空**,不是"下标对上" —— 排序会随 listMistakes 变 */
    expect(ids(r2.targets).filter(x => ids(r1.targets).includes(x))).toEqual([]);
  });

  it("三轮走完 25 个词,每个词恰好被覆盖一次", () => {
    const all = words(25);
    let tested = new Set<string>();
    const seen: string[] = [];
    for (let i = 0; i < 3; i++) {
      const r = pickRoundTargets(all, tested, 10);
      seen.push(...ids(r.targets));
      tested = r.nextTested;
    }
    expect(seen.length).toBe(25);
    expect(new Set(seen).size).toBe(25);       // 无重复
  });

  it("覆盖满一轮之后清空重来,而不是卡在「没有未测词」", () => {
    const all = words(10);
    const r1 = pickRoundTargets(all, new Set(), 10);
    expect(r1.nextTested.size).toBe(0);        // 满一轮 → 清零
    const r2 = pickRoundTargets(all, r1.nextTested, 10);
    expect(ids(r2.targets)).toEqual(ids(all)); // 第二遍从头再来,这是对的
  });

  it("错题数少于一轮容量时,有几个考几个(不硬凑)", () => {
    const all = words(3);
    const r = pickRoundTargets(all, new Set(), 10);
    expect(ids(r.targets)).toEqual(["w1", "w2", "w3"]);
  });

  it("错题本空 → 不出题(调用方据此 return,不能崩)", () => {
    const r = pickRoundTargets([], new Set(), 10);
    expect(r.targets).toEqual([]);
  });

  it("已测集合里有已被移出错题本的词(跨轮 reload 后)不影响取词", () => {
    /* 答对 3 天的词会被移出 → ordered 变短,但 tested 里还留着它的 id。
       此时不该因为 tested.size 虚高而误判"已覆盖满"。 */
    const all = words(5);                                   // w1..w5
    const tested = new Set(["w1", "w2", "w99"]);            // w99 已移出
    const r = pickRoundTargets(all, tested, 10);
    expect(ids(r.targets)).toEqual(["w3", "w4", "w5"]);
  });
});
