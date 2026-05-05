import { supabase } from "@/integrations/supabase/client";

const KEY = "bme_card_guest_token";

/** Stable per-browser token used to attach guest card attempts so they can be claimed after sign-up. */
export function getGuestCardToken(): string {
  try {
    let t = localStorage.getItem(KEY);
    if (!t) {
      t = `g_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(KEY, t);
    }
    return t;
  } catch {
    return `g_${Math.random().toString(36).slice(2, 12)}`;
  }
}

/** Called once after sign-up / sign-in: hand all guest card attempts to the now-logged-in user. */
export async function claimGuestCardAttempts(): Promise<number> {
  try {
    const t = localStorage.getItem(KEY);
    if (!t) return 0;
    const { data, error } = await supabase.rpc("claim_guest_card_attempts", { _token: t });
    if (error) {
      console.warn("[cardGuest] claim failed", error);
      return 0;
    }
    const n = typeof data === "number" ? data : Number(data) || 0;
    return n;
  } catch (e) {
    console.warn("[cardGuest] exception", e);
    return 0;
  }
}