import { supabase } from "@/integrations/supabase/client";

export type AttemptStage = "primary" | "junior" | "senior";
export type AttemptModule =
  | "vocab"
  | "grammar"
  | "reading"
  | "writing"
  | "listening"
  | "cloze"
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
 */
export async function recordAttempt(input: AttemptInput): Promise<AttemptResult> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { success: false, reason: "not_signed_in" };

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