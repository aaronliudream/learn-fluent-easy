/**
 * 挑战模式 (Challenge Mode) — 连续 3 组完成（≥70%）即解锁单点 20+ 题挑战。
 *
 * scope_key 约定：
 *   - 初中语法：`junior_grammar:{point_id}`
 *   - 高考语法：`senior_grammar:{point_id}`
 *   - 其他模块按需新增前缀
 */
import { supabase } from "@/integrations/supabase/client";

export const CHALLENGE_THRESHOLD = 3;          // 连胜达到此值解锁
export const CHALLENGE_MIN_PCT = 70;           // 单组 ≥70% 才算"完成"
export const CHALLENGE_QUESTIONS_JUNIOR = 20;  // 初中挑战题量
export const CHALLENGE_QUESTIONS_SENIOR = 24;  // 高考挑战题量

export type Streak = {
  consecutive_count: number;
  challenge_unlocked: boolean;
};

const EMPTY: Streak = { consecutive_count: 0, challenge_unlocked: false };

export async function getStreak(scopeKey: string): Promise<Streak> {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return EMPTY;
  const { data } = await supabase
    .from("quiz_streaks")
    .select("consecutive_count, challenge_unlocked")
    .eq("user_id", u.user.id)
    .eq("scope_key", scopeKey)
    .maybeSingle();
  return (data as Streak) ?? EMPTY;
}

/**
 * 记录一次"组完成"。pct ≥ 70 → 连胜 +1；否则归零。
 * 返回最新连胜状态，便于 UI 立即提示"再来 X 组解锁挑战模式"。
 */
export async function recordGroupCompletion(
  scopeKey: string,
  pct: number,
): Promise<Streak> {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return EMPTY;
  const prev = await getStreak(scopeKey);
  const passed = pct >= CHALLENGE_MIN_PCT;
  const next: Streak = passed
    ? {
        consecutive_count: prev.consecutive_count + 1,
        challenge_unlocked: prev.challenge_unlocked || prev.consecutive_count + 1 >= CHALLENGE_THRESHOLD,
      }
    : { consecutive_count: 0, challenge_unlocked: prev.challenge_unlocked };
  await supabase
    .from("quiz_streaks")
    .upsert(
      {
        user_id: u.user.id,
        scope_key: scopeKey,
        consecutive_count: next.consecutive_count,
        challenge_unlocked: next.challenge_unlocked,
        last_completed_at: new Date().toISOString(),
      },
      { onConflict: "user_id,scope_key" },
    );
  return next;
}
