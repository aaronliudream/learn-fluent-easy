import { useEffect, useRef } from "react";
import { addStudyMinutes } from "@/lib/guestProgress";

/**
 * 学习时长埋点:统计用户停留在做题区(hub 等)的「可见活跃时长」,
 * 页面隐藏/卸载时结算 → addStudyMinutes()(登录用户写 learning_events,游客写本地)。
 * 只数 document 可见的时间(切到后台/锁屏自动暂停),是对"学习分钟数"的稳健近似。
 * 纯加法埋点,不碰任何做题逻辑/正确性。
 */
export function useStudySession() {
  const activeMsRef = useRef(0);
  const startedAtRef = useRef<number | null>(null);

  useEffect(() => {
    const begin = () => {
      if (startedAtRef.current == null) startedAtRef.current = Date.now();
    };
    const pause = () => {
      if (startedAtRef.current != null) {
        activeMsRef.current += Date.now() - startedAtRef.current;
        startedAtRef.current = null;
      }
    };
    const flush = () => {
      pause();
      const mins = activeMsRef.current / 60000;
      if (mins >= 0.5) {
        addStudyMinutes(mins); // 至少 30 秒才计入
        activeMsRef.current = 0;
      }
    };
    const onVisibility = () => {
      if (document.hidden) pause();
      else begin();
    };

    if (!document.hidden) begin();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flush);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, []);
}
