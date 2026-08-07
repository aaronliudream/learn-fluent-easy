/**
 * 轻量前端错误上报(2026-08-05 立项)
 *
 * 背景:偶发「页面看得见、鼠标悬停变手型、但全页点不动,只有整页刷新才恢复」。
 * 等待无效 ⇒ 不是加载态。剩两类嫌疑:①残留透明遮罩吃点击 ②JS 运行时崩溃 / 主线程死亡。
 * 靠猜没用 —— 这里把崩溃现场收下来,下次复现能直接看到堆栈。
 *
 * 设计红线:
 *  - 绝不影响业务。任何上报失败(表还没建、离线、被墙)都静默吞掉。
 *  - 不吞 console.error:原样转发给控制台,只是顺手抄一份。
 *  - 有节流:同一条 60s 内只报一次,每会话最多 MAX_PER_SESSION 条,防止错误风暴打爆库。
 *  - 本地环形缓冲:window.__bmErrors() 可在真机控制台直接把最近 20 条打出来截图。
 *
 * 落库:public.client_errors(SQL 见 SQLAA/client_errors_table.sql,须 Aaron 先跑)。
 * 表不存在时 PostgREST 返回 404 → 这里静默丢弃,前端零影响。
 */

export type ClientErrorKind =
  | "window.onerror"
  | "unhandledrejection"
  | "console.error"
  | "react.boundary"
  | "dead-click"
  | "session-death";

export interface ClientErrorRecord {
  kind: ClientErrorKind;
  message: string;
  stack?: string;
  path: string;
  at: string;
  extra?: Record<string, unknown>;
}

const MAX_PER_SESSION = 20;
const DEDUPE_MS = 60_000;
const RING_MAX = 20;

/** 这些"错误"是噪音,报了只会淹没真信号。 */
const IGNORE = [
  "resizeobserver loop", //            浏览器自带的良性告警
  "failed to fetch dynamically imported module", // 换版自愈已单独处理(chunkError.ts)
  "importing a module script failed",
  "loading chunk",
  "non-error promise rejection captured",
];

const ring: ClientErrorRecord[] = [];
const lastSeen = new Map<string, number>();
let sent = 0;
let reporting = false; // 防止上报自身的 console.error 递归

function shouldSkip(message: string): boolean {
  const m = message.toLowerCase();
  return IGNORE.some((s) => m.includes(s));
}

function post(rec: ClientErrorRecord): void {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return;
  // 用裸 fetch 而不是 supabase client:新表不在 stale 的 types.ts 里(见 memory
  // regen-types-ts-backlog),走 client 会引入类型债;这里也不需要鉴权以外的任何能力。
  void fetch(`${url}/rest/v1/client_errors`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: key,
      Authorization: `Bearer ${key}`,
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      kind: rec.kind,
      message: rec.message.slice(0, 2000),
      stack: rec.stack?.slice(0, 4000) ?? null,
      path: rec.path.slice(0, 500),
      user_agent: navigator.userAgent.slice(0, 500),
      extra: rec.extra ?? null,
    }),
    keepalive: true, // 页面正在崩/正在被刷新时也尽量把这条送出去
  }).catch(() => {
    /* 表未建 / 离线 / 被墙 —— 静默,绝不影响业务 */
  });
}

/** 记一条错误:进环形缓冲 + 节流后上报。任何调用方都不需要 try/catch。 */
export function reportClientError(
  kind: ClientErrorKind,
  message: string,
  stack?: string,
  extra?: Record<string, unknown>,
): void {
  try {
    if (!message || shouldSkip(message)) return;

    const rec: ClientErrorRecord = {
      kind,
      message,
      stack,
      path: typeof location === "undefined" ? "" : location.pathname + location.search,
      at: new Date().toISOString(),
      extra,
    };

    ring.push(rec);
    if (ring.length > RING_MAX) ring.shift();

    const sig = `${kind}|${message.slice(0, 200)}`;
    const now = Date.now();
    const prev = lastSeen.get(sig) ?? 0;
    if (now - prev < DEDUPE_MS) return;
    lastSeen.set(sig, now);

    if (sent >= MAX_PER_SESSION) return;
    sent += 1;
    post(rec);
  } catch {
    /* 上报器自己绝不允许抛错 */
  }
}

/** 真机排查用:控制台敲 __bmErrors() 就能把本次会话抓到的错误全打出来截图。 */
export function getClientErrors(): ClientErrorRecord[] {
  return [...ring];
}

let installed = false;

/** 在 main.tsx render 之前调用一次。重复调用无副作用。 */
export function installGlobalErrorCapture(): void {
  if (installed || typeof window === "undefined") return;
  installed = true;

  window.addEventListener("error", (e) => {
    // 资源加载失败(img/script)也会走 error,但没有 error 对象 —— 只收真异常。
    if (!e.error && !e.message) return;
    reportClientError(
      "window.onerror",
      e.error?.message || e.message || "unknown error",
      e.error?.stack,
      { source: e.filename, line: e.lineno, col: e.colno },
    );
  });

  window.addEventListener("unhandledrejection", (e) => {
    const r = e.reason as { message?: string; stack?: string } | string | undefined;
    const message = typeof r === "string" ? r : r?.message || String(r);
    reportClientError("unhandledrejection", message, typeof r === "object" ? r?.stack : undefined);
  });

  // console.error 抄送:很多"看起来没崩、其实已经坏了"的问题只在这里留痕
  // (React 的 key 警告、setState on unmounted、第三方 SDK 的软失败……)。
  const orig = console.error.bind(console);
  console.error = (...args: unknown[]) => {
    orig(...args); // ★ 永远先原样转发,绝不吞
    if (reporting) return;
    reporting = true;
    try {
      const err = args.find((a): a is Error => a instanceof Error);
      const msg = args
        .map((a) => (a instanceof Error ? a.message : typeof a === "string" ? a : safeStringify(a)))
        .join(" ")
        .slice(0, 2000);
      reportClientError("console.error", msg, err?.stack);
    } finally {
      reporting = false;
    }
  };

  (window as unknown as { __bmErrors: () => ClientErrorRecord[] }).__bmErrors = getClientErrors;
}

function safeStringify(v: unknown): string {
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}
