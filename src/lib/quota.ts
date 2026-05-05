import { supabase } from "@/integrations/supabase/client";
import { trackFunnel } from "@/lib/funnel";

export type QuotaResult = {
  allowed: boolean;
  used: number;
  limit: number; // -1 = unlimited (Pro)
  tier: "free" | "monthly" | "yearly" | "guest";
  remaining?: number;
};

export type QuotaStatus = QuotaResult;

/** Consume one question quota. For guests (not signed in), always allow.
 *  Returns { allowed: false } if free user has exceeded today's 5-question limit. */
export async function consumeQuestionQuota(): Promise<QuotaResult> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { allowed: true, used: 0, limit: 5, tier: "guest", remaining: 5 };
    }
    const { data, error } = await (supabase.rpc as any)("consume_question_quota");
    if (error) {
      console.warn("[quota] consume failed", error);
      return { allowed: true, used: 0, limit: 5, tier: "free" };
    }
    const r = data as QuotaResult;
    if (!r.allowed) {
      trackFunnel("paywall_hit", "daily_quota_exhausted", { tier: r.tier, limit: r.limit }).catch(() => {});
    }
    return r;
  } catch (e) {
    console.warn("[quota] error", e);
    return { allowed: true, used: 0, limit: 5, tier: "free" };
  }
}

export async function getQuotaStatus(): Promise<QuotaStatus> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { allowed: true, used: 0, limit: 5, tier: "guest", remaining: 5 };
    const { data, error } = await (supabase.rpc as any)("get_quota_status");
    if (error) return { allowed: true, used: 0, limit: 5, tier: "free", remaining: 5 };
    return data as QuotaStatus;
  } catch {
    return { allowed: true, used: 0, limit: 5, tier: "free", remaining: 5 };
  }
}