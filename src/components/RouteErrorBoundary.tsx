import { T } from "@/i18n/T";import { Component, ReactNode } from "react";
// Detect Vite/webpack lazy-chunk load failures. After a deploy the old
// index.html cached in the user's browser still points at hashed chunks
// (e.g. IeltsSpeakingSession-a3f9b2.js) that the CDN no longer serves —
// the import() rejects with one of these messages. We auto-reload to
// pick up the new index.html instead of leaving the user on a white screen.
// 判定与刷新闸挪到 lib/chunkError.ts:main.tsx 的全局兜底要复用,且那边可单测(不拖 React/supabase)。
import { isChunkLoadError, tryAutoReloadOnce } from "@/lib/chunkError";
import { reportClientError } from "@/lib/clientErrorLog";

// resetKey:换页时自动清掉错误态。没有它,一次崩溃会把错误页粘死到整个会话
// (点导航能改 URL、内容却永远停在 😵),用户只能刷新 —— 正是我们要根治的死页形态之一。
type Props = {children: ReactNode;resetKey?: string;};
type State = {error: Error | null;isChunkError: boolean;};

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

  componentDidUpdate(prev: Props) {
    if (this.state.error && prev.resetKey !== this.props.resetKey) this.reset();
  }

  componentDidCatch(error: Error, info: unknown) {
    // eslint-disable-next-line no-console
    console.error("[RouteErrorBoundary]", error, info);
    reportClientError("react.boundary", `[Route] ${error.message}`, error.stack, {
      componentStack: (info as {componentStack?: string;})?.componentStack?.slice(0, 2000),
      level: "route",
      resetKey: this.props.resetKey,
    });
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
          <h1 className="text-xl font-bold"><T>应用已更新</T></h1>
          <p className="text-sm text-muted-foreground">
            <T>检测到新版本，正在为你刷新页面…</T>
          </p>
          <button
            onClick={() => location.reload()}
            className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
            <T>立即刷新</T>
          
          </button>
        </main>);

    }
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="text-5xl">😵</div>
        <h1 className="text-xl font-bold"><T>页面加载出错</T></h1>
        <p className="text-sm text-muted-foreground">
          <T>这个页面在你的浏览器里遇到了问题。可以刷新重试，或先返回首页。</T>
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => {this.reset();location.reload();}}
            className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
            <T>刷新页面</T>
          
          </button>
          <a
            href="/"
            className="rounded-full border border-border px-4 py-2 text-sm font-bold">
            <T>返回首页</T>
          
          </a>
        </div>
      </main>);

  }
}