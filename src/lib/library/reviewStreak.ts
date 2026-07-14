/**
 * 图书馆复习 · 连续学习天数(🔥)。第四张可写表 library_review_streak(DECISIONS.md D15,Aaron 批准·仅本功能)。
 * 语义:复习完成一次记「今天学过」;昨天也学过→天数+1;断了→重置为 1。跨天用北京日(UTC+8)。
 * 只写这一张自己的表,绝不碰那三张词汇掌握表。
 */
import { supabase } from "@/integrations/supabase/client";
import { bjToday } from "@/lib/library/favorites";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export type ReviewStreak = {
  review_streak: number;
  longest_streak: number;
  last_review_date: string | null;
};

/** 北京「昨天」YYYY-MM-DD(把北京日当 UTC 日历减一天,避免时区二次偏移)。 */
function bjYesterday(): string {
  const [y, m, d] = bjToday().split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() - 1);
  return dt.toISOString().slice(0, 10);
}

/** 连续是否还「活着」:上次学习是今天或昨天。否则已断(展示时当前天数按 0 算)。 */
export function isStreakAlive(lastDate: string | null): boolean {
  if (!lastDate) return false;
  return lastDate === bjToday() || lastDate === bjYesterday();
}

/** 展示用当前连续天数:活着=真实值,断了=0(longest 仍保留)。 */
export function effectiveStreak(s: ReviewStreak | null): number {
  if (!s) return 0;
  return isStreakAlive(s.last_review_date) ? s.review_streak : 0;
}

export async function getReviewStreak(): Promise<ReviewStreak | null> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return null;
  const { data } = await db
    .from("library_review_streak")
    .select("last_review_date,review_streak,longest_streak")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!data) return { review_streak: 0, longest_streak: 0, last_review_date: null };
  return {
    review_streak: data.review_streak ?? 0,
    longest_streak: data.longest_streak ?? 0,
    last_review_date: data.last_review_date ?? null,
  };
}

/**
 * 复习完成后调一次:标记今天学过并更新连续天数。
 *  · 今天已记过 → 不变(幂等,一天只算一次);
 *  · 上次是昨天 → 天数+1;
 *  · 否则(断了/首次)→ 重置为 1。
 * longest = max(历史最长, 当前)。
 */
export async function bumpReviewStreak(): Promise<ReviewStreak | null> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return null;
  const { data: cur } = await db
    .from("library_review_streak")
    .select("last_review_date,review_streak,longest_streak")
    .eq("user_id", user.id)
    .maybeSingle();

  const today = bjToday();
  if (cur?.last_review_date === today) {
    return {
      review_streak: cur.review_streak ?? 0,
      longest_streak: cur.longest_streak ?? 0,
      last_review_date: today,
    };
  }
  const prev = cur?.review_streak ?? 0;
  const next = cur?.last_review_date === bjYesterday() ? prev + 1 : 1;
  const longest = Math.max(cur?.longest_streak ?? 0, next);
  await db.from("library_review_streak").upsert(
    {
      user_id: user.id,
      last_review_date: today,
      review_streak: next,
      longest_streak: longest,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  return { review_streak: next, longest_streak: longest, last_review_date: today };
}
