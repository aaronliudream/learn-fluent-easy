import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { isChunkLoadError, tryAutoReloadOnce } from "@/lib/chunkError";

/**
 * 换版自愈(手机上最常见的"打开报错、刷一下就好"):
 * 部署一上线,所有 hash 过的 chunk 文件名都变了;手机里还留着旧 index.html 的那个会话
 * 去取旧 hash → 404 → 动态 import 失败。RouteErrorBoundary 只能接住**渲染期**抛出的,
 * 下面两条补住它接不到的:
 *  ① vite:preloadError —— Vite 在 modulepreload / 动态 import 失败时最早触发,连还没进渲染树的都算;
 *  ② unhandledrejection —— 失败发生在事件回调里(点一下才 import 的那种),错误边界永远看不到。
 * 两条都走同一个"10 秒内只自动刷一次"的闸,坏得彻底时不会陷入刷新死循环。
 */
window.addEventListener("vite:preloadError", ((e: Event) => {
  e.preventDefault(); // 别让它变成未捕获错误,交给我们刷新
  tryAutoReloadOnce();
}) as EventListener);

window.addEventListener("unhandledrejection", (e) => {
  if (isChunkLoadError(e.reason)) tryAutoReloadOnce();
});

createRoot(document.getElementById("root")!).render(<App />);
