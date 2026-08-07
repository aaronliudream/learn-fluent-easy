import { Component, type ReactNode } from "react";
import { reportClientError } from "@/lib/clientErrorLog";
import { isChunkLoadError, tryAutoReloadOnce } from "@/lib/chunkError";

/**
 * 全站最外层兜底(2026-08-05)
 *
 * RouteErrorBoundary 只包住 <Routes>,包不住它外面那一圈:BottomTabBar / UserAvatarMenu /
 * GuestQuotaWall / MistakeReviewGate / ResumeFab / 各 Provider。React 18 对**没有任何边界接住**
 * 的渲染错误的处理是「卸载整棵树」—— 于是 #root 被清空,用户看到的是一个死页,
 * 点什么都没反应(DOM 里已经没有可点的东西了),只有刷新能救。
 *
 * 这一层保证:任何组件崩溃都变成一张**看得见**的错误卡,而不是静默死亡。
 * 同时把堆栈送去 client_errors,下次复现不用再靠猜。
 */

type Props = { children: ReactNode };
type State = { error: Error | null };

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack?: string }) {
    reportClientError("react.boundary", `[App] ${error.message}`, error.stack, {
      componentStack: info?.componentStack?.slice(0, 2000),
      level: "app",
    });
    // 换版导致的 chunk 404 走既有的一次性自愈,和路由级边界同口径。
    if (isChunkLoadError(error)) tryAutoReloadOnce();
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <main
        role="alert"
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          padding: 24,
          textAlign: "center",
          fontFamily: "system-ui, -apple-system, 'PingFang SC', sans-serif",
          background: "#faf8f4",
          color: "#0E2746",
        }}
      >
        {/* 这一层不敢依赖 Tailwind / 主题变量 / i18n:它们本身可能就是崩的那个。全内联样式。 */}
        <div style={{ fontSize: 48, lineHeight: 1 }}>😵</div>
        <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>页面出了点问题</h1>
        <p style={{ fontSize: 14, opacity: 0.7, margin: 0, maxWidth: 360, lineHeight: 1.7 }}>
          刷新一下通常就好了。已经自动记录了错误信息，我们会去修。
        </p>
        <button
          type="button"
          onClick={() => location.reload()}
          style={{
            marginTop: 8,
            border: "none",
            borderRadius: 9999,
            padding: "12px 28px",
            fontSize: 15,
            fontWeight: 700,
            color: "#fff",
            background: "#4F46E5",
            cursor: "pointer",
          }}
        >
          点此刷新
        </button>
        <a href="/" style={{ fontSize: 13, color: "#4F46E5", textDecoration: "none" }}>
          返回首页
        </a>
        <pre
          style={{
            marginTop: 12,
            maxWidth: "min(560px, 92vw)",
            maxHeight: 120,
            overflow: "auto",
            fontSize: 11,
            opacity: 0.45,
            textAlign: "left",
            whiteSpace: "pre-wrap",
          }}
        >
          {this.state.error.message}
        </pre>
      </main>
    );
  }
}

export default AppErrorBoundary;
