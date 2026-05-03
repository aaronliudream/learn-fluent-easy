import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * 三种货币系统（延迟满足设计）：
 *  - seeds 🌱  学习产出，24h 消化后才到账，只能喂宠物 / 商店购物
 *  - starlight ⭐ 连续学习奖励（每周/连击），可解锁场景
 *  - crystals 💎 完成长期里程碑（如读完一本书）才能拿，买稀有道具
 *
 * 工程上：金币产出先落入 pending_seeds（24h 消化），再由 settle_matured_seeds
 * RPC 自动结算到 user_currencies.seeds。前端任何时候读余额前都先 settle 一下。
 */

export type CurrencyState = {
  seeds: number;
  starlight: number;
  crystals: number;
  pending: number;     // 还在消化中的种子总量
  loading: boolean;
};

const ZERO: CurrencyState = { seeds: 0, starlight: 0, crystals: 0, pending: 0, loading: true };

/** 直接调一次结算 + 返回最新余额 */
export async function settleAndFetchCurrencies(): Promise<Omit<CurrencyState, "loading">> {
  const { data: u } = await supabase.auth.getUser();
  if (!u?.user) return { seeds: 0, starlight: 0, crystals: 0, pending: 0 };
  const { data, error } = await supabase.rpc("settle_matured_seeds");
  if (error || !data) return { seeds: 0, starlight: 0, crystals: 0, pending: 0 };
  const row: any = Array.isArray(data) ? data[0] : data;
  return {
    seeds: row?.seeds ?? 0,
    starlight: row?.starlight ?? 0,
    crystals: row?.crystals ?? 0,
    pending: row?.pending ?? 0,
  };
}

/** 把一笔学习奖励放入 24h 消化队列（不立即到账）。 */
export async function addPendingSeed(amount: number, source: string): Promise<boolean> {
  if (!amount || amount <= 0) return false;
  // 单笔最多 50（防刷分），超出由调用方决定是否合并
  const safe = Math.min(50, Math.floor(amount));
  const { error } = await supabase.rpc("add_pending_seed", { _amount: safe, _source: source });
  if (error) { console.warn("[seeds] pending failed", error); return false; }
  // 通知 UI 触发"消化动画"
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("seed:digest", { detail: { amount: safe, source } }));
  }
  return true;
}

/** 加入心愿单（48h 冷静期） */
export async function wishlistAdd(kind: string, itemId: string): Promise<boolean> {
  const { error } = await supabase.rpc("wishlist_add", { _kind: kind, _item_id: itemId });
  if (error) { console.warn("[wishlist] add failed", error); return false; }
  return true;
}

export type WishlistRow = {
  id: string;
  item_kind: string;
  item_id: string;
  added_at: string;
  cooldown_until: string;
  purchased_at: string | null;
  removed_at: string | null;
};

export async function fetchWishlist(): Promise<WishlistRow[]> {
  const { data: u } = await supabase.auth.getUser();
  if (!u?.user) return [];
  const { data } = await supabase
    .from("wishlist")
    .select("*")
    .is("purchased_at", null)
    .is("removed_at", null)
    .order("added_at", { ascending: false });
  return (data ?? []) as WishlistRow[];
}

export async function wishlistRemove(id: string) {
  await supabase.from("wishlist").update({ removed_at: new Date().toISOString() }).eq("id", id);
}

/** Hook：自动结算 + 订阅余额变化 */
export function useCurrencies(refreshKey: number = 0): CurrencyState & { refresh: () => Promise<void> } {
  const [state, setState] = useState<CurrencyState>(ZERO);
  const refresh = useCallback(async () => {
    const r = await settleAndFetchCurrencies();
    setState({ ...r, loading: false });
  }, []);
  useEffect(() => { refresh(); }, [refresh, refreshKey]);
  // 监听 seed:digest 完成后再次刷新（5 秒后只更新 pending）
  useEffect(() => {
    const onDigest = () => { setTimeout(refresh, 800); };
    window.addEventListener("seed:digest", onDigest);
    return () => window.removeEventListener("seed:digest", onDigest);
  }, [refresh]);
  return { ...state, refresh };
}