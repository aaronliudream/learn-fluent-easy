import { useEffect } from "react";

/**
 * 阅读防护：
 *  - mode="strict"（默认）：禁右键/复制/选中/拖拽/快捷键 + 切窗遮罩，适合阅读/真题
 *  - mode="soft"：仅禁右键+复制，适合小学/普通题
 */
export default function NoCopyGuard({ mode = "strict" }: { mode?: "soft" | "strict" }) {
  useEffect(() => {
    const stop = (e: Event) => { e.preventDefault(); e.stopPropagation(); return false; };
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && ["c","x","a","s","p","u"].includes(k)) e.preventDefault();
      if (k === "printscreen") e.preventDefault();
    };

    document.addEventListener("contextmenu", stop);
    document.addEventListener("copy", stop);
    document.addEventListener("cut", stop);

    let prevUserSelect = "";
    let blurMask: HTMLDivElement | null = null;
    let onVis: (() => void) | null = null;
    let onBlur: (() => void) | null = null;
    let onFocus: (() => void) | null = null;

    if (mode === "strict") {
      document.addEventListener("dragstart", stop);
      document.addEventListener("selectstart", stop);
      document.addEventListener("keydown", onKey);
      prevUserSelect = document.body.style.userSelect;
      document.body.style.userSelect = "none";
      (document.body.style as any).webkitUserSelect = "none";

      blurMask = document.createElement("div");
      blurMask.style.cssText =
        "position:fixed;inset:0;z-index:99999;background:hsl(var(--background));backdrop-filter:blur(24px);display:none;align-items:center;justify-content:center;font-weight:800;color:hsl(var(--foreground));font-size:14px;text-align:center;padding:24px;";
      blurMask.textContent = "⏸ 阅读已暂停，请回到本窗口继续";
      document.body.appendChild(blurMask);
      onVis = () => { if (blurMask) blurMask.style.display = document.hidden ? "flex" : "none"; };
      onBlur = () => { if (blurMask) blurMask.style.display = "flex"; };
      onFocus = () => { if (blurMask) blurMask.style.display = "none"; };
      document.addEventListener("visibilitychange", onVis);
      window.addEventListener("blur", onBlur);
      window.addEventListener("focus", onFocus);
    }

    return () => {
      document.removeEventListener("contextmenu", stop);
      document.removeEventListener("copy", stop);
      document.removeEventListener("cut", stop);
      if (mode === "strict") {
        document.removeEventListener("dragstart", stop);
        document.removeEventListener("selectstart", stop);
        document.removeEventListener("keydown", onKey);
        if (onVis) document.removeEventListener("visibilitychange", onVis);
        if (onBlur) window.removeEventListener("blur", onBlur);
        if (onFocus) window.removeEventListener("focus", onFocus);
        document.body.style.userSelect = prevUserSelect;
        (document.body.style as any).webkitUserSelect = "";
        blurMask?.remove();
      }
    };
  }, [mode]);
  return null;
}
