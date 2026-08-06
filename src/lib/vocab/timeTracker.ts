/**
 * 学习时长追踪器 —— 只算**活跃时长**,切后台立刻暂停。
 *
 * ⚠️ 判据用 `visibilitychange` **加** `blur/focus` 两条。
 *    只看 visibilityState 的话,**桌面端切到别的窗口页面仍是 visible**,
 *    时长会一直涨 —— 图书馆那边就踩过这个坑(阅读时长虚高到 20 小时)。
 *
 * ⚠️ 还有一道**无操作超时**:超过 3 分钟没有任何交互就当离开。
 *    页面开着去吃饭不算学习;那种数字骗的是用户自己。
 *
 * 每 30 秒 flush 一次,退出/隐藏时立即 flush,避免关页面丢掉最后一段。
 */
import { flushTime } from "@/lib/vocab/stats";

const FLUSH_MS = 30_000;
const IDLE_MS = 3 * 60_000;

let active = false;
let startedAt = 0;
let pending = 0;
let lastInput = 0;
let timer: number | null = null;
let bound = false;

const now = () => Date.now();

function accumulate() {
  if (!active) return;
  const t = now();
  pending += t - startedAt;
  startedAt = t;
}

function pause() {
  if (!active) return;
  accumulate();
  active = false;
}

function resume() {
  if (active) return;
  startedAt = now();
  lastInput = startedAt;
  active = true;
}

async function flush() {
  accumulate();
  if (pending <= 0) return;
  const ms = pending;
  pending = 0;                       // 先清零再写:写失败也不重复计,宁可少算不多算
  await flushTime(ms);
}

function onVisibility() {
  if (document.visibilityState === "hidden") { void flush(); pause(); }
  else resume();
}
function onBlur() { void flush(); pause(); }
function onFocus() { resume(); }
function onInput() { lastInput = now(); if (!active && document.visibilityState === "visible") resume(); }

function tick() {
  // 无操作超时:静默太久当离开,把这一段也 flush 掉再暂停
  if (active && now() - lastInput > IDLE_MS) { void flush(); pause(); return; }
  void flush();
}

/** 在做题/浏览词卡的页面挂载时调用,返回停止函数。 */
export function startTracking(): () => void {
  if (!bound) {
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    for (const e of ["pointerdown", "keydown", "touchstart"]) {
      window.addEventListener(e, onInput, { passive: true });
    }
    // 关页面时最后一次 flush。⚠️ 用 pagehide 而不是 unload —— iOS Safari 不可靠地触发 unload
    window.addEventListener("pagehide", () => { void flush(); });
    bound = true;
  }
  resume();
  if (timer === null) timer = window.setInterval(tick, FLUSH_MS);

  return () => {
    void flush();
    pause();
    if (timer !== null) { window.clearInterval(timer); timer = null; }
  };
}
