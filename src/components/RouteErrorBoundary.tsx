import { Component, ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null; isChunkError: boolean };

// Detect Vite/webpack lazy-chunk load failures. After a deploy the old
// index.html cached in the user's browser still points at hashed chunks
// (e.g. IeltsSpeakingSession-a3f9b2.js) that the CDN no longer serves —
// the import() rejects with one of these messages. We auto-reload to
// pick up the new index.html instead of leaving the user on a white screen.
const isChunkLoadError = (err: unknown): boolean => {
  if (!err) return false;
  const e = err as { name?: string; message?: string };
  const msg = `${e.name || ""} ${e.message || ""}`.toLowerCase();
  return (
    msg.includes("chunkloaderror") ||
    msg.includes("loading chunk") ||
    msg.includes("loading css chunk") ||
    msg.includes("failed to fetch dynamically imported module") ||
    msg.includes("importing a module script failed") ||
    msg.includes("dynamically imported module")
  );
};

// Avoid an infinite reload loop if the chunk is genuinely broken.
const RELOAD_KEY = "__chunk_reload_at__";
const tryAutoReloadOnce = () => {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) || "0");
    if (Date.now() - last < 10_000) return false; // already tried recently
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
    location.reload();
    return true;
  } catch {
    return false;
  }
};

/**
 * Catches render-time errors anywhere inside the route tree so a single
 * misbehaving page (e.g. a third-party SDK that touches navigator.* at
 * module load) cannot blank the entire app. Without this, React 18 unmounts
 * the whole tree on an unhandled error → empty <div id="root">.
 */
export class RouteErrorBoundary extends Component<Props, State> {
  state: State = { error: null, isChunkError: false };

  static getDerivedStateFromError(error: Error): State {
    return { error, isChunkError: isChunkLoadError(error) };
  }

  componentDidCatch(error: Error, info: unknown) {
    // eslint-disable-next-line no-console
    console.error("[RouteErrorBoundary]", error, info);
    if (isChunkLoadError(error)) {
      // Try a one-shot auto-reload — usually enough since CDN now serves
      // the new index.html with up-to-date chunk hashes.
      tryAutoReloadOnce();
    }
  }

  reset = () => this.setState({ error: null, isChunkError: false });

  render() {
    if (!this.state.error) return this.props.children;
    if (this.state.isChunkError) {
      return (
        <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
          <div className="text-5xl">🔄</div>
          <h1 className="text-xl font-bold">应用已更新</h1>
          <p className="text-sm text-muted-foreground">
            检测到新版本，正在为你刷新页面…
          </p>
          <button
            onClick={() => location.reload()}
            className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
          >
            立即刷新
          </button>
        </main>
      );
    }
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="text-5xl">😵</div>
        <h1 className="text-xl font-bold">页面加载出错</h1>
        <p className="text-sm text-muted-foreground">
          这个页面在你的浏览器里遇到了问题。可以刷新重试，或先返回首页。
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => { this.reset(); location.reload(); }}
            className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
          >
            刷新页面
          </button>
          <a
            href="/"
            className="rounded-full border border-border px-4 py-2 text-sm font-bold"
          >
            返回首页
          </a>
        </div>
      </main>
    );
  }
}