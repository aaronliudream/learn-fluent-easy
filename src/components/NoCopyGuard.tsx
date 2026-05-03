import { useEffect } from "react";

/**
 * 阅读防护：禁右键 / 禁选中 / 禁复制 / 禁拖拽 / 禁常用截屏快捷键 / 离开页面遮罩
 * 仅在挂载期间生效，卸载后自动恢复。
 */
export default function NoCopyGuard() {
  useEffect(() => {
    const stop = (e: Event) => { e.preventDefault(); e.stopPropagation(); return false; };
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      // 复制/剪切/全选/打印/保存/查看源码/PrintScreen
      if (
        (e.ctrlKey || e.metaKey) && ["c","x","a","s","p","u"].includes(k)
      ) { e.preventDefault(); }
      if (k === "printscreen") { e.preventDefault(); }
    };
    document.addEventListener("contextmenu", stop);
    document.addEventListener("copy", stop);
    document.addEventListener("cut", stop);
    document.addEventListener("dragstart", stop);
    document.addEventListener("selectstart", stop);
    document.addEventListener("keydown", onKey);

    // 全局禁选中样式
    const prevUserSelect = document.body.style.userSelect;
    document.body.style.userSelect = "none";
    (document.body.style as any).webkitUserSelect = "none";

    // 离开页面/失焦时短暂遮挡（防"切窗+截屏全屏"）
    const blurMask = document.createElement("div");
    blurMask.style.cssText =
      "position:fixed;inset:0;z-index:99999;background:hsl(var(--background));backdrop-filter:blur(24px);display:none;align-items:center;justify-content:center;font-weight:800;color:hsl(var(--foreground));font-size:14px;text-align:center;padding:24px;";
    blurMask.textContent = "⏸ 阅读已暂停，请回到本窗口继续";
    document.body.appendChild(blurMask);
    const onVis = () => { blurMask.style.display = document.hidden ? "flex" : "none"; };
    const onBlur = () => { blurMask.style.display = "flex"; };
    const onFocus = () => { blurMask.style.display = "none"; };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);

    return () => {
      document.removeEventListener("contextmenu", stop);
      document.removeEventListener("copy", stop);
      document.removeEventListener("cut", stop);
      document.removeEventListener("dragstart", stop);
      document.removeEventListener("selectstart", stop);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      document.body.style.userSelect = prevUserSelect;
      (document.body.style as any).webkitUserSelect = "";
      blurMask.remove();
    };
  }, []);
  return null;
}