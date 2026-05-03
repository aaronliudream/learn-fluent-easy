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

// =====================================================
// 行为科学：多层奖励（基础 + 连对加成 + 闪光币）
// 设计目标：给孩子可预期的小奖励 + 偶发惊喜（变量奖励）
// =====================================================

type AwardKind = "base" | "streak" | "flash" | "block";
export interface RichAward {
  awarded: number;
  balance: number;
  capped: boolean;
  flash: boolean;        // 是否触发闪光币
  streakBonus: number;   // 连对加成
  base: number;
  kind: AwardKind;
}

/**
 * 每答对一题调用：基础 1 星币，连对 3/5/10 题额外 +1/+2/+3，10% 概率闪光币 +3~10
 */
export async function awardForCorrect(streak: number, source: string): Promise<RichAward | null> {
  let base = 1;
  let streakBonus = 0;
  if (streak >= 10) streakBonus = 3;
  else if (streak >= 5) streakBonus = 2;
  else if (streak >= 3) streakBonus = 1;
  let flash = false;
  let flashAmt = 0;
  if (Math.random() < 0.1) {
    flash = true;
    flashAmt = 3 + Math.floor(Math.random() * 8); // 3-10
  }
  const total = base + streakBonus + flashAmt;
  const r = await awardCoins(total, `${source}_correct`);
  if (!r) return null;
  // 通知 FloatingPet
  petReact(flash ? "flash" : "correct", { coins: r.awarded });
  return { ...r, flash, streakBonus, base, kind: flash ? "flash" : streakBonus ? "streak" : "base" };
}

/** 每完成 5 题再发一次"答题包"奖励 +5 */
export async function awardForBlock(source: string): Promise<RichAward | null> {
  const r = await awardCoins(5, `${source}_block`);
  if (!r) return null;
  petReact("happy", { coins: r.awarded });
  return { ...r, flash: false, streakBonus: 0, base: 5, kind: "block" };
}

/** 答错时让宠物做反应（不扣星币） */
export function notifyWrong() {
  petReact("wrong");
}

// ---- 宠物事件总线 ----
type PetReactKind = "correct" | "wrong" | "flash" | "happy";
export function petReact(kind: PetReactKind, detail?: { coins?: number }) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("pet:react", { detail: { kind, ...detail } }));
}