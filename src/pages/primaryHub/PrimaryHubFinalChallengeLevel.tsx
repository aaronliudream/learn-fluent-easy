/**
 * 《英语闯关》关卡播放页 — Phase 1 PR #71c 占位
 *
 * 具体题型 UI 由 PR #71d ~ #71i 各自填充。本页面只读 :levelId 并显示
 * "开发中" + 返回入口。
 */

import { useNavigate, useParams } from "react-router-dom";
import { usePrimaryHub } from "@/lib/primaryHub/context";

export default function PrimaryHubFinalChallengeLevel() {
  const { levelId } = useParams<{ levelId: string }>();
  const { grade } = usePrimaryHub();
  const navigate = useNavigate();
  const back = () => navigate(`/primary/hub/${grade}/final-challenge`);

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "20px 16px 80px",
        background: "linear-gradient(180deg, var(--fc-paper) 0%, var(--fc-paper-warm) 100%)",
      }}
    >
      <button
        type="button"
        onClick={back}
        style={{
          background: "transparent",
          border: "none",
          color: "var(--fc-ink-soft)",
          fontSize: 14,
          fontWeight: 600,
          cursor: "pointer",
          padding: 0,
        }}
      >
        ← 返回关卡地图
      </button>
      <div style={{ textAlign: "center", marginTop: 80 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--fc-ink)" }}>
          关 {levelId}
        </h1>
        <p style={{ marginTop: 16, color: "var(--fc-ink-soft)", fontSize: 14 }}>
          开发中…
        </p>
      </div>
    </div>
  );
}
