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

/* ══════════════════════════════════════════════════════════════════════
 * 元素复用不变量 —— 自动播放解锁的全部前提(2026-08-17 加)
 *
 * 由来:「今日学习第一题不出声,第二题起正常」。根因不是解锁没做,
 * 是原来每次播放都 `new Audio(url)` —— 浏览器的解锁**按元素记**,
 * 手势里解锁过的那个元素,和下一题 new 出来的是两个对象,新元素照样被拒。
 *
 * ⚠️ 这一组用**真实的 HTMLAudioElement**(只桩掉 play/pause),
 *    因为要断言的恰恰是"到底 new 了几个元素" —— 上面那个 FakeAudio 全局桩
 *    会把这件事遮掉。所以单独一个 describe,自带 beforeEach。
 * ══════════════════════════════════════════════════════════════════════ */
describe("元素复用(解锁的前提)", () => {
  const created: HTMLAudioElement[] = [];
  beforeEach(() => {
    vi.unstubAllGlobals();          // 摘掉上面的 FakeAudio,用真元素
    created.length = 0;
    vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function (this: HTMLAudioElement) {
      if (!created.includes(this)) created.push(this);
      return Promise.resolve();
    });
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
  });

  async function freshModule() {
    vi.resetModules();
    return await import("./audio");
  }

  it("连播两条不同的 url,用的是**同一个** audio 元素", async () => {
    const { playUrl } = await freshModule();
    await playUrl("https://cdn.example.com/aa/1.mp3", "w:1");
    await playUrl("https://cdn.example.com/bb/2.mp3", "w:2");
    expect(created.length).toBe(1);
  });

  it("先解锁再播,仍然是同一个元素 —— 解锁才对后续播放有效", async () => {
    const { unlockAudio, playUrl } = await freshModule();
    unlockAudio();
    await playUrl("https://cdn.example.com/aa/1.mp3", "w:1");
    await playUrl("https://cdn.example.com/bb/2.mp3", "w:2");
    expect(created.length).toBe(1);
  });
});

describe("被拦要如实上报,不能静默", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
  });
  async function freshModule() { vi.resetModules(); return await import("./audio"); }

  it("play() 被拒 → playUrl 返回 blocked", async () => {
    vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(() =>
      Promise.reject(new DOMException("NotAllowedError")));
    const { playUrl } = await freshModule();
    /* ⚠️ 这条是听音辨义题的命脉:题面只有播放键、没有词干,
       静默失败等于这道题没法答,UI 必须据此给出可点的提示。 */
    await expect(playUrl("https://cdn.example.com/aa/1.mp3", "w:1")).resolves.toBe("blocked");
  });

  it("正常播放 → played", async () => {
    vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(() => Promise.resolve());
    const { playUrl } = await freshModule();
    await expect(playUrl("https://cdn.example.com/aa/1.mp3", "w:1")).resolves.toBe("played");
  });

  it("没有 url → skipped(不当成失败)", async () => {
    vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(() => Promise.resolve());
    const { playUrl } = await freshModule();
    await expect(playUrl(null, "w:1")).resolves.toBe("skipped");
  });
});
