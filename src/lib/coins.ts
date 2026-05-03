import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { addPendingSeed } from "@/lib/currencies";
import { isFatigued, noteAnswered } from "@/lib/fatigue";

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
    if (row && row.awarded > 0) {
      petReact(row.awarded >= 10 ? "happy" : "correct", { coins: row.awarded });
      void addPendingSeed(row.awarded, source);
    }
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
  reason?: string | null;
}

/**
 * 每答对一题调用。基础 1 星币 + 连对加成 + 10% 闪光币。
 * 强烈建议传 itemId + module，走服务端反刷分：
 *   - 已掌握 (5★) → 0 币
 *   - 24h 内同题第 2 次 → 30%
 *   - 第 3 次起 → 0 币
 *   - 每日 500 封顶
 */
export async function awardForCorrect(
  streak: number,
  source: string,
  itemId?: string,
  module?: string,
  answerMs?: number,
): Promise<RichAward | null> {
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
  let total = base + streakBonus + flashAmt;
  // 反作弊：答题过快（<1.2s）→ 奖励减半，提示用户慢下来思考
  let tooFast = false;
  if (typeof answerMs === "number" && answerMs > 0 && answerMs < 1200) {
    tooFast = true;
    total = Math.max(1, Math.ceil(total / 2));
  }
  // #14 宠物疲劳：长时间/大量同题型 → 奖励减半 + 提示休息
  noteAnswered(source);
  if (isFatigued(source)) {
    total = Math.max(1, Math.ceil(total / 2));
  }
  let r: { awarded: number; balance: number; capped: boolean } | null = null;
  let reason: string | null = null;
  if (itemId) {
    try {
      const { data, error } = await supabase.rpc("award_for_item", {
        _amount: total,
        _source: `${source}_correct`,
        _item_id: itemId,
        _module: module ?? null,
      });
      if (error) { console.warn("[coins] award_for_item failed", error); return null; }
      const row: any = Array.isArray(data) ? data[0] : data;
      r = row ? { awarded: row.awarded, balance: row.balance, capped: row.capped } : null;
      reason = row?.reason ?? null;
      if (r && r.awarded > 0) {
        petReact(r.awarded >= 10 ? "happy" : "correct", { coins: r.awarded });
        void addPendingSeed(r.awarded, `${source}_correct`);
      }
      // 透明反馈：让用户知道为什么这次没拿到币
      if (r && r.awarded === 0) {
        if (reason === "mastered") toast("⭐ 已掌握，重做无奖励", { duration: 1600 });
        else if (reason === "repeat_zero") toast("🔁 同题今日已多次奖励，无新奖励", { duration: 1600 });
        else if (reason === "daily_cap") toast("🎯 今日金币已封顶，明天再来", { duration: 1600 });
      } else if (reason === "repeat_30pct") {
        toast("🔂 重复练习，奖励减至 30%", { duration: 1400 });
      }
    } catch (e) {
      console.warn("[coins] exception", e);
      return null;
    }
  } else {
    r = await awardCoins(total, `${source}_correct`);
  }
  if (!r) return null;
  // 闪光时覆盖默认事件，发更醒目的反馈
  if (flash && r.awarded > 0) petReact("flash", { coins: r.awarded });
  if (tooFast) {
    toast("🐢 答得太快啦，奖励减半。慢下来思考更牢固～", { duration: 1800 });
  }
  return { ...r, flash, streakBonus, base, kind: flash ? "flash" : streakBonus ? "streak" : "base", reason };
}

/** 每完成 5 题再发一次"答题包"奖励 +5 */
export async function awardForBlock(source: string): Promise<RichAward | null> {
  const r = await awardCoins(5, `${source}_block`);
  if (!r) return null;
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