import { supabase } from "@/integrations/supabase/client";

export type GuestMergeDecision = "merged" | "reset";

export async function fetchGuestMergeDecision(
  userId: string,
): Promise<GuestMergeDecision | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("guest_merge_decision")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.warn("[primaryHub] fetch guest_merge_decision failed", error.message);
    return null;
  }
  const v = data?.guest_merge_decision;
  return v === "merged" || v === "reset" ? v : null;
}

export async function setGuestMergeDecision(
  userId: string,
  decision: GuestMergeDecision,
): Promise<void> {
  const { error } = await supabase.from("profiles").upsert(
    { user_id: userId, guest_merge_decision: decision },
    { onConflict: "user_id" },
  );

  if (error) throw new Error(error.message);
}
