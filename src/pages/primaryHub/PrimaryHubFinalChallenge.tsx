/**
 * 《英语闯关》四年级最终关 — Phase 1 占位页面
 *
 * 当前状态：PR #71a 视觉资源迁入。仅渲染 Rex 吉祥物 + 欢迎文字，
 * 用于验证 fc-* tokens / animations 已正确接入。
 * 后续 #71b/#71c 会扩展为关卡菜单 + 题型路由。
 */

import RexMascot from "@/components/primaryHub/finalChallenge/RexMascot";

export default function PrimaryHubFinalChallenge() {
  return (
    <div
      style={{
        minHeight: "100vh",
        padding: 24,
        textAlign: "center",
        background: "linear-gradient(180deg, var(--fc-paper) 0%, var(--fc-paper-warm) 100%)",
      }}
    >
      <h1
        style={{
          fontSize: 28,
          fontWeight: 800,
          color: "var(--fc-ink)",
          marginBottom: 24,
        }}
      >
        《英语闯关》四年级最终关
      </h1>
      <RexMascot mood="happy" message="欢迎来到英语闯关！" size="lg" />
      <p style={{ marginTop: 24, color: "var(--fc-ink-soft)", fontSize: 14 }}>
        Phase 1 开发中…
      </p>
    </div>
  );
}
