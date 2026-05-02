import { supabase } from "@/integrations/supabase/client";

/* ---------- Badge catalog ---------- */
export type BadgeDef = {
  code: string;
  emoji: string;
  title: string;
  description: string;
};

export const BADGE_CATALOG: Record<string, BadgeDef> = {
  first_steps: {
    code: "first_steps",
    emoji: "🌱",
    title: "初学者",
    description: "完成你的第一组词汇练习",
  },
  flawless_group: {
    code: "flawless_group",
    emoji: "💯",
    title: "完美一组",
    description: "一组练习全部答对",
  },
  combo_5: {
    code: "combo_5",
    emoji: "🔥",
    title: "连击 ×3",
    description: "单次会话达成 5 连击",
  },
  combo_10: {
    code: "combo_10",
    emoji: "🚀",
    title: "连击 ×5",
    description: "单次会话达成 10 连击 ON FIRE",
  },
  coins_500: {
    code: "coins_500",
    emoji: "🥉",
    title: "铜币学员",
    description: "累计获得 500 金币",
  },
  coins_2000: {
    code: "coins_2000",
    emoji: "🥈",
    title: "银币学员",
    description: "累计获得 2,000 金币",
  },
  coins_5000: {
    code: "coins_5000",
    emoji: "🥇",
    title: "金币学员",
    description: "累计获得 5,000 金币",
  },
  srs_master: {
    code: "srs_master",
    emoji: "🧠",
    title: "记忆大师",
    description: "完成一次智能复习且正确率 ≥ 90%",
  },
  spelling_pro: {
    code: "spelling_pro",
    emoji: "⌨️",
    title: "拼写达人",
    description: "在一次会话中完成 5 题拼写挑战",
  },
  wordrush_master: {
    code: "wordrush_master",
    emoji: "⚡",
    title: "节奏猎手",
    description: "Word Rush 单局得分 ≥ 300",
  },
};

/* ---------- Coin balance ---------- */
export type CoinTotals = { balance: number; total_earned: number };

export async function fetchCoinTotals(): Promise<CoinTotals> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { balance: 0, total_earned: 0 };
  const { data, error } = await supabase
    .from("user_coins")
    .select("balance, total_earned")
    .eq("user_id", auth.user.id)
    .maybeSingle();
  if (error) {
    console.error("fetchCoinTotals", error);
    return { balance: 0, total_earned: 0 };
  }
  return data ?? { balance: 0, total_earned: 0 };
}

/** Atomically award coins. Returns new totals or null when not signed in. */
export async function awardCoins(amount: number): Promise<CoinTotals | null> {
  if (!amount || amount <= 0) return null;
  const { data, error } = await supabase.rpc("award_coins", {
    _amount: Math.floor(amount),
  });
  if (error) {
    console.error("awardCoins", error);
    return null;
  }
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return null;
  return { balance: row.balance, total_earned: row.total_earned };
}

/* ---------- Badges ---------- */
export async function fetchEarnedBadges(): Promise<Set<string>> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return new Set();
  const { data } = await supabase
    .from("user_badges")
    .select("badge_code")
    .eq("user_id", auth.user.id);
  return new Set((data ?? []).map((r) => r.badge_code as string));
}

/**
 * Insert a badge if not already earned. Returns the BadgeDef when newly
 * unlocked, or null when already owned / unknown / not signed in.
 */
export async function unlockBadge(code: string): Promise<BadgeDef | null> {
  const def = BADGE_CATALOG[code];
  if (!def) return null;
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { error } = await supabase
    .from("user_badges")
    .insert({ user_id: auth.user.id, badge_code: code });
  if (error) {
    // 23505 unique violation = already owned → silent
    if ((error as { code?: string }).code === "23505") return null;
    console.error("unlockBadge", error);
    return null;
  }
  return def;
}

/**
 * Run a batch of milestone checks based on session stats + new totals.
 * Returns the list of badges that were freshly unlocked.
 */
export type SessionMilestones = {
  bestStreak: number;
  spellCorrect: number;
  perfectGroup: boolean;
  srsAccuracyPct?: number;
  totalEarned: number;
  attempted: number;
};

export async function evaluateMilestones(
  m: SessionMilestones,
): Promise<BadgeDef[]> {
  const codes: string[] = [];
  if (m.attempted > 0) codes.push("first_steps");
  if (m.perfectGroup) codes.push("flawless_group");
  if (m.bestStreak >= 5) codes.push("combo_5");
  if (m.bestStreak >= 10) codes.push("combo_10");
  if (m.totalEarned >= 500) codes.push("coins_500");
  if (m.totalEarned >= 2000) codes.push("coins_2000");
  if (m.totalEarned >= 5000) codes.push("coins_5000");
  if (m.srsAccuracyPct !== undefined && m.srsAccuracyPct >= 90)
    codes.push("srs_master");
  if (m.spellCorrect >= 5) codes.push("spelling_pro");

  const unlocked: BadgeDef[] = [];
  for (const c of codes) {
    const def = await unlockBadge(c);
    if (def) unlocked.push(def);
  }
  return unlocked;
}