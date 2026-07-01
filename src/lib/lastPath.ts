// 「切走切回退回首页」第1层修复:记住最后所在页 + standalone/主屏冷启动时恢复。
// 只存/读一个路径,不碰做题组件的 state、不碰做题逻辑、不碰进度存储。

const KEY = "bme_last_path_v1";
const MAX_AGE_MS = 12 * 60 * 60 * 1000; // 12 小时内才恢复,超时按正常首页

// 哪些路径不该被记住/恢复(避免循环跳转 & 无意义恢复)。
function isRestorable(path: string): boolean {
  if (!path || !path.startsWith("/")) return false;
  if (path === "/") return false; // 首页本身
  if (path.startsWith("/auth")) return false; // 登录页
  if (path.startsWith("/~oauth")) return false; // OAuth 回调
  return true;
}

/** 每次路由变化时调用:把当前完整 path(含 query)+ 时间戳存起来。 */
export function saveLastPath(path: string): void {
  if (typeof window === "undefined") return;
  if (!isRestorable(path)) return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ path, ts: Date.now() }));
  } catch {
    /* 忽略配额/隐私模式错误 */
  }
}

/** 冷启动时调用:返回可恢复的 lastPath(12h 内、可恢复),否则 null。 */
export function readLastPath(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { path?: unknown; ts?: unknown };
    const path = parsed?.path;
    const ts = parsed?.ts;
    if (typeof path !== "string" || typeof ts !== "number") return null;
    if (Date.now() - ts > MAX_AGE_MS) return null;
    if (!isRestorable(path)) return null;
    return path;
  } catch {
    return null;
  }
}
