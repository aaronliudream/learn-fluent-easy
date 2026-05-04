import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "funnel_session_id";

function getSessionId(): string {
  try {
    let sid = localStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = crypto.randomUUID();
      localStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  } catch {
    return "anon";
  }
}

export async function trackFunnel(
  eventName: string,
  step?: string,
  metadata: Record<string, unknown> = {}
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("funnel_events").insert({
      event_name: eventName,
      step: step ?? null,
      user_id: user?.id ?? null,
      session_id: getSessionId(),
      metadata: metadata as never,
      page_path: typeof window !== "undefined" ? window.location.pathname : null,
      referrer: typeof document !== "undefined" ? document.referrer || null : null,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
    });
  } catch (e) {
    // best-effort, never break UX
    console.warn("[funnel] failed", e);
  }
}
