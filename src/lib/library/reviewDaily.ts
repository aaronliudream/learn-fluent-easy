/**
 * 图书馆复习 · 每天"复习了多少个词/块"计数(三色成长图的橙柱)。
 * 为什么要单独存:Added 可从 created_at 现算、Mastered 可从 last_correct_date 现算(都有历史),
 * 但"某天复习了几个词"库里没有(只存最后做对日期)→ 从今天起用本表记录,逐日累加。
 * 只写这一张自己的表(第五张可写表),绝不碰词汇掌握表。跨天用北京日(UTC+8)。
 */
import { supabase } from "@/integrations/supabase/client";
import { bjToday } from "@/lib/library/favorites";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

/** 一次复习完成后调:今天的复习词数 += n(读后写,单用户无并发)。表未建/失败静默。 */
export async function bumpReviewDaily(n: number): Promise<void> {
  if (!n || n <= 0) return;
  try {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) return;
    const today = bjToday();
    const { data: cur } = await db
      .from("library_vocab_review_daily")
      .select("reviewed")
      .eq("user_id", user.id)
      .eq("day", today)
      .maybeSingle();
    const next = (cur?.reviewed ?? 0) + n;
    await db.from("library_vocab_review_daily").upsert(
      { user_id: user.id, day: today, reviewed: next, updated_at: new Date().toISOString() },
      { onConflict: "user_id,day" },
    );
  } catch { /* 表未建/离线 → 忽略,橙柱暂空 */ }
}

/** 拉本用户每天的复习词数 → Map(北京日 YYYY-MM-DD → count)。表未建 → 空 Map(图正常,橙柱空)。 */
export async function getReviewDaily(): Promise<Map<string, number>> {
  const m = new Map<string, number>();
  try {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) return m;
    const { data } = await db
      .from("library_vocab_review_daily")
      .select("day,reviewed")
      .eq("user_id", user.id);
    for (const r of (data ?? []) as { day: string; reviewed: number }[]) m.set(r.day, r.reviewed ?? 0);
  } catch { /* 表未建 → 空 */ }
  return m;
}
