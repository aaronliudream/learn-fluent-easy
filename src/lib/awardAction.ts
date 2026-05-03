import { supabase } from "@/integrations/supabase/client";
import { awardCoins } from "@/lib/coins";
import { addPendingSeed } from "@/lib/currencies";

/**
 * 全站行为奖励统一入口 — Single source of truth for "do X → get Y coins/XP".
 *
 * Looks up the reward config in `action_rewards` (action_code → coins_base, xp_base,
 * flash_chance, daily_cap, cooldown_seconds) and dispatches:
 *  - coin grant via the existing `award_learning_coins` RPC (which already enforces
 *    the daily 500-coin cap and source tagging),
 *  - flash bonus via the random `flash_chance`,
 *  - 12 hr de-dupe at the action_code level using localStorage so kids can't farm
 *    the same trigger by reloading.
 *
 * Designed to replace ad-hoc `awardCoins(N, '...')` calls scattered across modules.
 * Future: pet XP / quest progress can be added here without touching call sites.
 */

export type ActionResult = {
  ok: boolean;
  coins: number;
  flash: boolean;
  reason?: "unknown_action" | "cooldown" | "inactive" | "no_user" | "rpc_error";
};

const COOLDOWN_KEY = (code: string) => `aa:cd:${code}`;

function withinCooldown(code: string, seconds: number): boolean {
  if (!seconds) return false;
  try {
    const last = Number(localStorage.getItem(COOLDOWN_KEY(code)) || 0);
    return Date.now() - last < seconds * 1000;
  } catch { return false; }
}

function markCooldown(code: string) {
  try { localStorage.setItem(COOLDOWN_KEY(code), String(Date.now())); } catch { /* ignore */ }
}

export async function awardAction(code: string): Promise<ActionResult> {
  const { data: u } = await supabase.auth.getUser();
  if (!u?.user) return { ok: false, coins: 0, flash: false, reason: "no_user" };

  const { data: cfg, error } = await supabase
    .from("action_rewards")
    .select("action_code,coins_base,xp_base,flash_chance,cooldown_seconds,is_active")
    .eq("action_code", code)
    .maybeSingle();
  if (error || !cfg) return { ok: false, coins: 0, flash: false, reason: "unknown_action" };
  if (!cfg.is_active) return { ok: false, coins: 0, flash: false, reason: "inactive" };
  if (withinCooldown(code, cfg.cooldown_seconds || 0)) return { ok: false, coins: 0, flash: false, reason: "cooldown" };

  const flash = Math.random() < Number(cfg.flash_chance || 0);
  const flashBonus = flash ? 3 + Math.floor(Math.random() * 8) : 0;
  const total = (cfg.coins_base || 0) + flashBonus;

  if (total <= 0) {
    markCooldown(code);
    return { ok: true, coins: 0, flash };
  }
  const r = await awardCoins(total, `act:${code}`);
  markCooldown(code);
  if (!r) return { ok: false, coins: 0, flash, reason: "rpc_error" };
  // 延迟满足：同时把"种子"丢进 24h 消化队列（不立即可花）。
  // 即时金币系统照旧运作以保证现有 UI 兼容；新货币（seeds/starlight/crystals）走单独通道。
  if (r.awarded > 0) {
    void addPendingSeed(r.awarded, `act:${code}`);
  }
  return { ok: true, coins: r.awarded, flash };
}