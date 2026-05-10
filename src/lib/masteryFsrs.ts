/**
 * 跨模块共享的轻量 SRS 函数 — 对 mastery 行调用 nextSrsState 即可拿到
 * 下一次的 ease / interval_days / due_at.
 *
 * 设计原则:**纯函数**,不读不写数据库,任何 mastery 表(primary_word_mastery、
 * primary_phonics_mastery、未来的 sight_word_mastery …)都能复用。
 */

export type SrsState = {
  ease: number;          // 1.3 ~ 3.0
  interval_days: number; // 实际天数
  due_at: string;        // ISO
};

export type SrsInput = Partial<SrsState> | null | undefined;

/**
 * 给定上一状态 + 是否答对,计算下一状态.
 *  - 答对: ease+0.05 (≤3), interval = max(1, prev*ease)
 *  - 答错: ease-0.15 (≥1.3), interval = 1 天
 */
export function nextSrsState(prev: SrsInput, correct: boolean): SrsState {
  const ease0 = prev?.ease ?? 2.5;
  const intv0 = prev?.interval_days ?? 0;
  let ease: number;
  let interval_days: number;
  if (correct) {
    ease = Math.min(3.0, ease0 + 0.05);
    interval_days = intv0 < 1 ? 1 : Math.min(60, intv0 * ease);
  } else {
    ease = Math.max(1.3, ease0 - 0.15);
    interval_days = 1;
  }
  const due_at = new Date(Date.now() + interval_days * 86_400_000).toISOString();
  return { ease, interval_days, due_at };
}

/** 是否到期(用于"今日复习"). mastery_level >= 3 视为长期掌握,不再纳入复习. */
export function isMasteryDue(row: { mastery_level?: number; due_at?: string } | undefined | null): boolean {
  if (!row) return false;
  if ((row.mastery_level ?? 0) >= 3) return false;
  if (!row.due_at) return false;
  return new Date(row.due_at).getTime() <= Date.now();
}