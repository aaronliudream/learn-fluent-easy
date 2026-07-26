/**
 * 图书馆词库引导提示 · 频次策略。
 *
 * 铁律(Aaron 2026-07-25 裁决 §二):localStorage **只作抑制,不作真值**。
 * 真判据永远是服务端算出来的分段(segment.ts);这里只负责"已经弹过了,别再烦他"。
 * 换设备最坏情况 = 多弹一次,可接受;绝不反过来拿 localStorage 当主判据。
 *
 * 带链接提示(「去看看」)的三条封顶,任一触发即不弹:
 *   ① 每 7 天最多一次
 *   ② 累计最多 3 次
 *   ③ 用户点过「去看看」→ 永久不再弹
 * 封顶是给 C 类(有收藏但没复习痕迹)用的 —— 方案② 会把"进过页面但没复习"的人也判成 C,
 * 不封顶就会反复骚扰。A/B 类的"第一个收藏词"提示天然只有一次,不受 ①② 限制,但会记账,
 * 免得刚弹完首词提示、转头又被 C 规则弹一次。
 */

const K_LINK_COUNT = "library_vocab_nudge_link_count"; // 累计弹过几次带链接提示
const K_LINK_LAST = "library_vocab_nudge_link_last"; // 上次弹的时间戳(ms)
const K_LINK_OPENED = "library_vocab_nudge_opened"; // 点过「去看看」
const K_B_HINT = "library_vocab_b_hint_shown"; // B 类阅读页提示已展示(终身一次)

export const LINK_NUDGE_MAX = 3;
export const LINK_NUDGE_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

function readInt(key: string): number {
  try {
    return Number(localStorage.getItem(key) || 0) || 0;
  } catch {
    return 0;
  }
}

function write(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* 隐私模式/配额:抑制失效顶多多弹一次,不影响功能 */
  }
}

/** C 类能不能弹带链接提示(三条封顶全过才行)。 */
export function canShowLinkNudge(): boolean {
  try {
    if (localStorage.getItem(K_LINK_OPENED)) return false; // ③ 点过就永久不弹
  } catch {
    /* 读不到 → 按没点过算 */
  }
  if (readInt(K_LINK_COUNT) >= LINK_NUDGE_MAX) return false; // ② 累计 3 次封顶
  const last = readInt(K_LINK_LAST);
  if (last && Date.now() - last < LINK_NUDGE_COOLDOWN_MS) return false; // ① 7 天冷却
  return true;
}

/** 弹了一次带链接提示 → 记账(次数 +1、刷新冷却起点)。 */
export function markLinkNudgeShown(): void {
  write(K_LINK_COUNT, String(readInt(K_LINK_COUNT) + 1));
  write(K_LINK_LAST, String(Date.now()));
}

/** 用户点了「去看看」→ 永久不再弹带链接提示。 */
export function markVocabPageOpened(): void {
  write(K_LINK_OPENED, "1");
}

/** B 类阅读页轻提示:终身只显示一次。 */
export function bHintShown(): boolean {
  try {
    return !!localStorage.getItem(K_B_HINT);
  } catch {
    return false;
  }
}

export function markBHintShown(): void {
  write(K_B_HINT, "1");
}
