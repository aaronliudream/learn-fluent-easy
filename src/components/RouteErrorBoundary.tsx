import { Component, ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null };

/**
 * Catches render-time errors anywhere inside the route tree so a single
 * misbehaving page (e.g. a third-party SDK that touches navigator.* at
 * module load) cannot blank the entire app. Without this, React 18 unmounts
 * the whole tree on an unhandled error → empty <div id="root">.
 */
export class RouteErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: unknown) {
    // eslint-disable-next-line no-console
    console.error("[RouteErrorBoundary]", error, info);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (!this.state.error) return this.props.children;
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