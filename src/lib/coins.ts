import { supabase } from "@/integrations/supabase/client";

/**
 * 学习场景奖励星币（小学/初中/高中通用）
 * 后端会按"答对题数 × 系数"封顶每日 500，防止刷分
 * @param amount 星币数（建议：答对一题 1-3、完成一局额外 5-10）
 * @param source 来源标记，便于日后统计：'primary_quiz'|'primary_listen'|'primary_spell'|'primary_match'|'junior_*'|'gaokao_*'
 */
export async function awardCoins(amount: number, source: string = "study"): Promise<{ awarded: number; balance: number; capped: boolean } | null> {
  if (!amount || amount <= 0) return null;
  try {
    const { data, error } = await supabase.rpc("award_learning_coins", { _amount: amount, _source: source });
    if (error) { console.warn("[coins] award failed", error); return null; }
    const row = Array.isArray(data) ? data[0] : data;
    return row ?? null;
  } catch (e) {
    console.warn("[coins] exception", e);
    return null;
  }
}

export async function getCoinBalance(): Promise<number> {
  const { data: u } = await supabase.auth.getUser();
  if (!u?.user) return 0;
  const { data } = await supabase.from("user_coins").select("balance").eq("user_id", u.user.id).maybeSingle();
  return data?.balance ?? 0;
}