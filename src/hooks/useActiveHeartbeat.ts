import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

/**
 * 有效学习时长心跳
 * - 每 15 秒上报一次，仅当：
 *   1) 页面 visible
 *   2) 最近 60 秒内有用户交互（鼠标/键盘/触摸/滚动）
 * - 自动按当前路径推断学段（primary/junior/gaokao/other）
 */
const TICK_MS = 15_000;
const IDLE_MS = 60_000;

function segFromPath(p: string): "primary" | "junior" | "gaokao" | "other" {
  if (p.startsWith("/primary")) return "primary";
  if (p.startsWith("/junior")) return "junior";
  if (p.startsWith("/gaokao") || p.startsWith("/senior")) return "gaokao";
  return "other";
}

let SESSION_ID: string | null = null;
function getSessionId() {
  if (SESSION_ID) return SESSION_ID;
  try {
    SESSION_ID = sessionStorage.getItem("hb.sid");
    if (!SESSION_ID) {
      SESSION_ID = crypto.randomUUID();
      sessionStorage.setItem("hb.sid", SESSION_ID);
    }
  } catch {
    SESSION_ID = Math.random().toString(36).slice(2);
  }
  return SESSION_ID!;
}

export function useActiveHeartbeat() {
  const loc = useLocation();
  const lastInteract = useRef(Date.now());

  useEffect(() => {
    const bump = () => { lastInteract.current = Date.now(); };
    const evs = ["mousemove", "keydown", "touchstart", "scroll", "click"] as const;
    evs.forEach((e) => window.addEventListener(e, bump, { passive: true }));
    return () => evs.forEach((e) => window.removeEventListener(e, bump));
  }, []);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setInterval(async () => {
      if (cancelled) return;
      if (document.visibilityState !== "visible") return;
      if (Date.now() - lastInteract.current > IDLE_MS) return;
      const { data: u } = await supabase.auth.getUser();
      const uid = u?.user?.id;
      if (!uid) return;
      try {
        await supabase.from("learning_heartbeats").insert({
          user_id: uid,
          segment: segFromPath(loc.pathname),
          path: loc.pathname,
          active_seconds: TICK_MS / 1000,
          session_id: getSessionId(),
        });
      } catch {
        /* ignore */
      }
    }, TICK_MS);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [loc.pathname]);
}

export default useActiveHeartbeat;