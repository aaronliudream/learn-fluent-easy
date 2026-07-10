import { supabase } from "@/integrations/supabase/client";

/**
 * 错题「跨3天连对移出」统一入口 —— 全站唯一让错题移出(is_resolved=true)的途径。
 *
 * 规则(逻辑全在 DB RPC bump_mistake_correct,前端只是调用):
 *  - 做对且非同天(北京时间 UTC+8)→ correct_streak +1、last_correct_date=今天;
 *  - 同一天重复做对 → 不加(防刷,返回 already_today=true);
 *  - correct_streak >= 3 → is_resolved=true,移出错题本;
 *  - 做错 → 各写入器的 upsert 把 correct_streak 归0、last_correct_date 置 null(连对清零)。
 *
 * 铁律:纯逻辑替换,失败只 console.warn、绝不阻断做题;返回 null 时调用方当作"未变化"处理。
 */
export type StreakResult = {
  correct_streak: number;
  is_resolved: boolean;
  already_today: boolean;
};

export async function bumpMistakeCorrect(
  module: string,
  sourceKey: string,
): Promise<StreakResult | null> {
  try {
    const { data, error } = await supabase.rpc("bump_mistake_correct", {
      _module: module,
      _source_key: sourceKey,
    });
    if (error) {
      console.warn("[mistake streak] rpc failed", error);
      return null;
    }
    const row = Array.isArray(data) ? data[0] : data;
    return (row as StreakResult) ?? null;
  } catch (e) {
    console.warn("[mistake streak] error", e);
    return null;
  }
}

/** 北京时间(UTC+8)今天 YYYY-MM-DD —— 与 RPC 的 (now() at time zone 'Asia/Shanghai')::date 同口径。 */
export function bjToday(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Shanghai" });
}
