/**
 * playChain 的顺序与停顿。
 *
 * 为什么值得测:反馈层「先单词后例句」这条链一旦顺序错或停顿没生效,
 * 用户听到的就是"答对后直接读例句"—— 这正是 2026-08-09 报上来的那个 bug,
 * 而它在代码里只是一行数组构造,肉眼极容易看漏。
 *
 * ⚠️ 这里不碰真 <audio>:jsdom 里 play() 不会真的触发 ended,链会永远挂住。
 *    改成 stub 掉 HTMLMediaElement 的 play,并让 src 一旦设置就在下一 tick 派发 ended。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/** 记录播放顺序与每条之间的真实间隔 */
let played: { key: string; at: number }[] = [];

beforeEach(() => {
  played = [];
  vi.stubGlobal("Audio", class FakeAudio {
    src: string;
    private handlers: Record<string, (() => void)[]> = {};
    constructor(src: string) { this.src = src; }
    addEventListener(ev: string, fn: () => void) { (this.handlers[ev] ||= []).push(fn); }
    removeEventListener() { /* noop */ }
    pause() { /* noop */ }
    play() {
      played.push({ key: this.src, at: Date.now() });
      // 模拟"放完了":下一 tick 派发 ended
      setTimeout(() => this.handlers["ended"]?.forEach(f => f()), 10);
      return Promise.resolve();
    }
  });
});

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe("playChain", () => {
  it("按给定顺序播,不乱序", async () => {
    const { playChain } = await import("./audio");
    await playChain([
      { url: "w.mp3", key: "w" },
      { url: "e1.mp3", key: "e1" },
      { url: "e2.mp3", key: "e2" },
    ]);
    expect(played.map(p => p.key)).toEqual(["w.mp3", "e1.mp3", "e2.mp3"]);
  });

  it("gapAfterMs 真的插进了两条之间(单词读完停 0.6s 再读例句)", async () => {
    const { playChain } = await import("./audio");
    await playChain([
      { url: "w.mp3", key: "w", gapAfterMs: 300 },
      { url: "e1.mp3", key: "e1" },
    ]);
    expect(played).toHaveLength(2);
    const delta = played[1].at - played[0].at;
    // 10ms 播放 + 300ms 停顿;放宽下界防止 CI 抖动,上界防止停顿被忽略后误判通过
    expect(delta).toBeGreaterThanOrEqual(280);
    expect(delta).toBeLessThan(900);
  });

  it("不给 gapAfterMs 时两条紧挨着(证明上一条测的是停顿本身,不是固有延迟)", async () => {
    const { playChain } = await import("./audio");
    await playChain([
      { url: "w.mp3", key: "w" },
      { url: "e1.mp3", key: "e1" },
    ]);
    expect(played[1].at - played[0].at).toBeLessThan(200);
  });

  it("最后一条的 gapAfterMs 不空等 —— 后面没东西了", async () => {
    const { playChain } = await import("./audio");
    const t0 = Date.now();
    await playChain([{ url: "w.mp3", key: "w", gapAfterMs: 1500 }]);
    expect(Date.now() - t0).toBeLessThan(600);
  });

  it("停顿期间开了新链 → 旧链立刻停,不会诈尸再读一句", async () => {
    const { playChain } = await import("./audio");
    const old = playChain([
      { url: "old1.mp3", key: "o1", gapAfterMs: 400 },
      { url: "old2.mp3", key: "o2" },
    ]);
    // 等旧链播完第一条、正处在停顿里
    await new Promise(r => setTimeout(r, 120));
    await playChain([{ url: "new.mp3", key: "n" }]);
    await old;
    await new Promise(r => setTimeout(r, 500));
    // old2 绝不该出现 —— 它是"停顿结束后诈尸"的典型症状
    expect(played.map(p => p.key)).not.toContain("old2.mp3");
    expect(played.map(p => p.key)).toContain("new.mp3");
  });

  it("没有 url 的条目跳过,不中断整条链", async () => {
    const { playChain } = await import("./audio");
    await playChain([
      { url: null, key: "x" },
      { url: "e1.mp3", key: "e1" },
    ]);
    expect(played.map(p => p.key)).toEqual(["e1.mp3"]);
  });
});
