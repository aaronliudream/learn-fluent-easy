/**
 * 初中《期中/期末综合挑战》入口卡 — Fork 自
 * components/primaryHub/finalChallenge/FinalChallengeEntryCard。
 *
 * 出现在 JuniorHubSemester 的 unit 列表之后。期中(v1)、期末(v2)各一张。
 * 点击写入 sessionStorage fc:jr:volume,再跳关卡菜单(URL 不带册别,菜单据此读)。
 */

import { useNavigate } from "react-router-dom";
import { useJuniorHub } from "@/lib/juniorHub/context";
import RexMascot from "@/components/primaryHub/finalChallenge/RexMascot";

export default function JuniorFinalChallengeEntryCard({
  volume = "v1",
}: {
  /** v1=上册/期中、v2=下册/期末。决定闯关取哪套题(写入 sessionStorage)。 */
  volume?: "v1" | "v2";
}) {
  const { grade } = useJuniorHub();
  const navigate = useNavigate();
  const label = volume === "v2" ? "期末" : "期中";
  const levelCount = volume === "v2" ? 5 : 3;

  return (
    <button
      type="button"
      onClick={() => {
        sessionStorage.setItem("fc:jr:volume", volume);
        navigate(`/junior/hub/${grade}/final-challenge`);
      }}
      className="fc-btn-press"
      style={{
        display: "block",
        width: "100%",
        textAlign: "left",
        padding: 16,
        borderRadius: "var(--fc-radius-lg)",
        border: "2px solid var(--fc-primary)",
        background: "linear-gradient(135deg, var(--fc-primary-bg) 0%, var(--fc-purple-bg) 100%)",
        boxShadow: "var(--fc-shadow-card)",
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ flex: "0 0 auto" }}>
          <RexMascot mood="excited" size="sm" showMessage={false} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
            <span aria-hidden style={{ fontSize: 14 }}>🎯</span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 0.6,
                color: "var(--fc-primary-dark)",
                textTransform: "uppercase",
              }}
            >
              综合挑战
            </span>
          </div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: "var(--fc-ink)",
              fontFamily: "var(--fc-font-display)",
              lineHeight: 1.25,
            }}
          >
            {label}综合卷 · 终极挑战
          </div>
          <div style={{ marginTop: 3, fontSize: 12, color: "var(--fc-ink-soft)", fontWeight: 600 }}>
            {levelCount} 关挑战 · 看你能拿几颗星 ⭐
          </div>
        </div>

        <span
          aria-hidden
          className="fc-breathing"
          style={{
            display: "grid",
            placeItems: "center",
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "var(--fc-primary)",
            color: "white",
            fontSize: 20,
            fontWeight: 800,
            lineHeight: 1,
            flex: "0 0 auto",
          }}
        >
          →
        </span>
      </div>
    </button>
  );
}
