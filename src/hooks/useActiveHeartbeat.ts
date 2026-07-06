import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { isSpeaking } from "@/lib/speak";

/**
 * 有效学习时长心跳
 * - 每 15 秒上报一次，仅当：
 *   1) 页面 visible
 *   2) 最近 60 秒内有用户交互（鼠标/键盘/触摸/滚动）
 * - 自动按当前路径推断学段（primary/junior/gaokao/other）
 */
const TICK_MS = 15_000;
const IDLE_MS = 60_000;

type Segment =
  | "primary" | "junior" | "gaokao"
  | "american" | "systematic"
  | "other";

function segFromPath(p: string): Segment | null {
  if (p.startsWith("/primary")) return "primary";
  if (p.startsWith("/junior")) return "junior";
  if (p.startsWith("/gaokao") || p.startsWith("/senior")) return "gaokao";
  if (p.startsWith("/american")) return "american"; // 原成人系统课程/场景/俚语时长统一归美语课程
  if (p.startsWith("/stage-test")) return "systematic"; // 阶段测(非成人板块,保留)
  // 落地页 / 登录 / 家长中心 / 设置等，不计入学习时长
  return null;
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
      // 活跃判定 = 最近 60s 内有交互 OR 当前正在播放音频（听音/读课文的被动学习也计时）。
      // isSpeaking() 读音频元素实时状态，异常/结束会自动转 false，不会卡住计时。
      if (Date.now() - lastInteract.current > IDLE_MS && !isSpeaking()) return;
      const seg = segFromPath(loc.pathname);
      if (!seg) return;
      const { data: u } = await supabase.auth.getUser();
      const uid = u?.user?.id;
      if (!uid) return;
      try {
        await supabase.from("learning_heartbeats").insert({
          user_id: uid,
          segment: seg,
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