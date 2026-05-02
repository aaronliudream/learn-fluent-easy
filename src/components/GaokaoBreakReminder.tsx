import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const ACTIVE_MS = 45 * 60 * 1000; // 45 minutes of active use
const BREAK_MS = 15 * 60 * 1000; // 15 minute break
const IDLE_MS = 60 * 1000; // pause counter after 60s without activity

function fmt(ms: number) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

/**
 * Tracks active usage time on /gaokao* routes only.
 * Active = mouse move/click/key/scroll/touch within last IDLE_MS, page visible, route is /gaokao*.
 * After ACTIVE_MS active time, shows a 15-min break modal with a countdown.
 * User can force-close via the close button.
 */
export function GaokaoBreakReminder() {
  const location = useLocation();
  const onGaokao = location.pathname.startsWith("/gaokao");

  const [showBreak, setShowBreak] = useState(false);
  const [breakRemaining, setBreakRemaining] = useState(BREAK_MS);

  const activeMsRef = useRef(0);
  const lastActivityRef = useRef(Date.now());
  const lastTickRef = useRef(Date.now());
  const onGaokaoRef = useRef(onGaokao);
  const showBreakRef = useRef(false);

  useEffect(() => {
    onGaokaoRef.current = onGaokao;
    // reset activity stamp when entering Gaokao
    if (onGaokao) {
      lastActivityRef.current = Date.now();
      lastTickRef.current = Date.now();
    }
  }, [onGaokao]);

  useEffect(() => {
    showBreakRef.current = showBreak;
  }, [showBreak]);

  // Activity listeners (global, but only count when on /gaokao*)
  useEffect(() => {
    const mark = () => {
      lastActivityRef.current = Date.now();
    };
    const events: (keyof WindowEventMap)[] = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];
    events.forEach((e) => window.addEventListener(e, mark, { passive: true }));
    const onVis = () => {
      if (document.visibilityState === "visible") {
        lastActivityRef.current = Date.now();
        lastTickRef.current = Date.now();
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      events.forEach((e) => window.removeEventListener(e, mark));
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  // Active-time accumulator
  useEffect(() => {
    const id = window.setInterval(() => {
      const now = Date.now();
      const dt = now - lastTickRef.current;
      lastTickRef.current = now;

      if (showBreakRef.current) return; // freeze counter while break modal open
      if (!onGaokaoRef.current) return;
      if (document.visibilityState !== "visible") return;
      const idle = now - lastActivityRef.current;
      if (idle > IDLE_MS) return;

      activeMsRef.current += dt;
      if (activeMsRef.current >= ACTIVE_MS) {
        activeMsRef.current = 0;
        setBreakRemaining(BREAK_MS);
        setShowBreak(true);
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  // Break countdown
  useEffect(() => {
    if (!showBreak) return;
    const start = Date.now();
    const id = window.setInterval(() => {
      const left = BREAK_MS - (Date.now() - start);
      if (left <= 0) {
        setBreakRemaining(0);
        setShowBreak(false);
        lastActivityRef.current = Date.now();
        lastTickRef.current = Date.now();
      } else {
        setBreakRemaining(left);
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [showBreak]);

  const close = () => {
    setShowBreak(false);
    lastActivityRef.current = Date.now();
    lastTickRef.current = Date.now();
  };

  return (
    <Dialog open={showBreak} onOpenChange={(o) => { if (!o) close(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">该休息一下啦 👀</DialogTitle>
          <DialogDescription className="text-base pt-2">
            你已经连续学习 45 分钟了。请休息 15 分钟，让眼睛和身体放松一下：
          </DialogDescription>
        </DialogHeader>
        <ul className="space-y-2 text-sm text-foreground/90 pl-1">
          <li>• 看向 6 米外的远方，放松眼睛 20 秒</li>
          <li>• 起身伸伸胳膊、转转脖子和肩膀</li>
          <li>• 做几个深蹲或原地走动</li>
          <li>• 喝口水，深呼吸几次</li>
        </ul>
        <div className="mt-4 rounded-xl bg-primary/10 border border-primary/20 p-4 text-center">
          <div className="text-xs text-muted-foreground mb-1">休息倒计时</div>
          <div className="text-4xl font-bold tabular-nums text-primary">
            {fmt(breakRemaining)}
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={close}>关闭</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default GaokaoBreakReminder;