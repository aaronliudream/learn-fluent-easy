import { supabase } from "@/integrations/supabase/client";

export async function pingPresence(grade?: string, page?: string) {
  try {
    await supabase.rpc("presence_ping", { _grade: grade ?? null, _page: page ?? null });
  } catch {}
}

export async function getOnlineCount(grade?: string): Promise<number> {
  const { data } = await supabase.rpc("online_count", { _grade: grade ?? null });
  return (data as number) ?? 0;
}

export async function postActivity(kind: string, emoji: string, message: string, meta: any = {}) {
  try {
    await supabase.rpc("post_activity", { _kind: kind, _emoji: emoji, _message: message, _meta: meta });
  } catch {}
}

export async function ensureSocialDefaults(grade?: string) {
  const { data: u } = await supabase.auth.getUser();
  if (!u?.user) return;
  await supabase.from("user_social_settings").upsert(
    { user_id: u.user.id, social_visible: true, grade_band: grade ?? null },
    { onConflict: "user_id" }
  );
}

/** Use in any page to keep presence alive */
export function usePresenceTicker(grade?: string, page?: string) {
  if (typeof window === "undefined") return;
  // fire-and-forget, no React import needed by caller for one-shot
  pingPresence(grade, page);
}