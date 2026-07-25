/**
 * 换版自愈的两块公共积木(纯函数 + 一个刷新闸,**不依赖 React / supabase**,便于单测)。
 *
 * 背景:每次部署,所有 hash 过的 chunk 文件名都会变;手机里还留着旧 index.html 的那个会话
 * 去取旧 hash → 404 → 动态 import 失败 → 用户看到"页面加载出错",手动刷一下才好。
 * 消费方:components/RouteErrorBoundary.tsx(渲染期)+ main.tsx(preload / 事件回调里的失败)。
 */

/** 各浏览器对"chunk 取不到"的报法各不相同,少认一条就少一次自动刷新。 */
export const isChunkLoadError = (err: unknown): boolean => {
  if (!err) return false;
  const e = err as { name?: string; message?: string };
  const msg = `${e.name || ""} ${e.message || ""}`.toLowerCase();
  return (
    msg.includes("chunkloaderror") ||
    msg.includes("loading chunk") ||
    msg.includes("loading css chunk") ||
    msg.includes("failed to fetch dynamically imported module") || // Chrome / Edge
    msg.includes("importing a module script failed") || //           Safari 15+
    msg.includes("dynamically imported module") || //                Firefox 及其它变体
    msg.includes("module script failed") ||
    msg.includes("failed to load module") || //                      部分安卓 WebView
    // iOS Safari 取模块失败常常只给 "TypeError: Load failed",没有任何 module 字样 ——
    // 不认它,手机上换版后就会掉进通用 😵 分支、不自动刷新(2026-07-25 实测到的现象)。
    (msg.includes("typeerror") && msg.includes("load failed"))
  );
};

// 真坏掉时别陷入刷新死循环:10 秒内只自动刷一次,之后老实显示错误页让用户自己决定。
const RELOAD_KEY = "__chunk_reload_at__";
export const tryAutoReloadOnce = (): boolean => {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) || "0");
    if (Date.now() - last < 10_000) return false; // 刚刷过,不再刷
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
    location.reload();
    return true;
  } catch {
    return false;
  }
};
