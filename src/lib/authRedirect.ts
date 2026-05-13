// 在跳转到 /auth 之前保存当前路径，登录成功后自动回到原页面。
// 同时处理 OAuth 返回场景（用户被外部重定向后回到首页）。

const STORAGE_KEY = "bm_auth_redirect";
const MAX_AGE_MS = 60 * 60 * 1000; // 1 小时过期，避免残留旧值

interface StoredRedirect {
  path: string;
  savedAt: number;
}

/** 将当前非 /auth 路径保存到 localStorage（带时间戳）。 */
export function saveRedirectPath(path?: string) {
  try {
    const current = path ?? window.location.pathname + window.location.search;
    if (current.startsWith("/auth")) return;
    const payload: StoredRedirect = { path: current, savedAt: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

/** 读取并消费（删除）保存的 redirect 路径；过期或不存在则返回 null。 */
export function consumeRedirectPath(): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    localStorage.removeItem(STORAGE_KEY);
    const parsed = JSON.parse(raw) as StoredRedirect;
    if (Date.now() - parsed.savedAt > MAX_AGE_MS) return null;
    if (!parsed.path || parsed.path.startsWith("/auth")) return null;
    return parsed.path;
  } catch {
    return null;
  }
}

/** 仅读取，不消费（用于调试或条件判断）。 */
export function peekRedirectPath(): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredRedirect;
    if (Date.now() - parsed.savedAt > MAX_AGE_MS) return null;
    return parsed.path;
  } catch {
    return null;
  }
}
