import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type AttemptStage = "primary" | "junior" | "senior";
export type AttemptModule =
  | "vocab"
  | "grammar"
  | "reading"
  | "writing"
  | "listening"
  | "cloze"
  | "speaking"
  | "phonics";

export interface AttemptInput {
  stage: AttemptStage;
  grade: number;
  module: AttemptModule;
  item_type: string;
  item_id: string;
  item_label?: string;
  is_correct: boolean;
  user_answer?: string;
  correct_answer?: string;
  context?: Record<string, unknown>;
}

export interface AttemptResult {
  success: boolean;
  reason?: string;
  new_state?: "master" | "fluent" | "weak" | "none";
  old_state?: string;
  interval_days?: number;
  due_at?: string;
  accuracy?: number;
}

/**
 * Unified router for recording any answer attempt across the app.
 * - Writes to unified_mastery (FSRS-lite)
 * - Auto adds wrong answers to user_mistakes
 * - Smart-invalidates ai_diagnostics cache
 * Always non-throwing — pages should not break if recording fails.
 *
 * NOTE: named recordUnifiedAttempt (not recordAttempt) to avoid clashing with
 * the legacy `recordAttempt` exported from @/lib/gaokaoMastery.
 */
export async function recordUnifiedAttempt(input: AttemptInput): Promise<AttemptResult> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      notifyGuestOnce();
      return { success: false, reason: "not_signed_in" };
    }

    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/record-attempt`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.warn("[recordAttempt] failed", res.status, text);
      return { success: false, reason: `http_${res.status}` };
    }
    return await res.json();
  } catch (e) {
    console.warn("[recordAttempt] error", e);
    return { success: false, reason: "exception" };
  }
}

// Fire a one-time-per-browser-session toast prompting the guest to sign in.
// Each module gets its own key so the prompt can resurface across stages.
let lastNudgeAt = 0;
function notifyGuestOnce() {
  try {
    if (typeof window === "undefined") return;
    const KEY = "guest-record-nudge";
    if (sessionStorage.getItem(KEY)) return;
    // Throttle additionally to one call per 30s as a safety net
    const now = Date.now();
    if (now - lastNudgeAt < 30_000) return;
    lastNudgeAt = now;
    sessionStorage.setItem(KEY, "1");
    toast("登录后才会保存学习进度 ✨", {
      description: "你现在是访客模式，本次答题不会计入掌握度。",
      duration: 7000,
      action: {
        label: "去登录",
        onClick: () => { window.location.href = "/auth"; },
      },
    });
  } catch {
    /* ignore */
  }
}