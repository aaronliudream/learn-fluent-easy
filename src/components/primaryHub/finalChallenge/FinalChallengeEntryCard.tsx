/**
 * 《英语闯关》入口卡片
 *
 * 出现在 PrimaryHubSemester 的 unit 列表最后(每访问一个学期都展示),
 * 点击跳到 /primary/hub/:grade/final-challenge 关卡地图。
 *
 * 视觉策略:与白底 unit 卡形成对比 ——
 *   - 暖橙→淡紫渐变 + fc-primary 边框 (鲜明但不刺眼)
 *   - 左侧 Rex(excited) 强化产品识别
 *   - 右侧箭头加 fc-breathing 轻微呼吸 (吸引点击但克制)
 *
 * 不做进度门控、不限年级 (按产品决策)。
 * 占位题库还未覆盖的年级,点进去会看到各关卡的"题库暂无内容"友好提示。
 */

import { useNavigate } from "react-router-dom";
import { usePrimaryHub } from "@/lib/primaryHub/context";
import { getGradeCourse } from "@/lib/primaryHub/courseData";
import RexMascot from "@/components/primaryHub/finalChallenge/RexMascot";

export default function FinalChallengeEntryCard({
  volume = "v2",
}: {
  /** 教材册别：v1=上册、v2=下册。决定闯关取哪套题（写入 sessionStorage）。 */
  volume?: "v1" | "v2";
}) {
  const { grade } = usePrimaryHub();
  const navigate = useNavigate();
  const course = getGradeCourse(grade);

  return (
    <button
      type="button"
      onClick={() => {
        sessionStorage.setItem("fc:volume", volume);
        navigate(`/primary/hub/${grade}/final-challenge`); // URL 不变
      }}
      className="fc-btn-press"
      style={{
        display: "block",
        width: "100%",
        textAlign: "left",
        padding: 16,
        borderRadius: "var(--fc-radius-lg)",
        border: "2px solid var(--fc-primary)",
        background:
          "linear-gradient(135deg, var(--fc-primary-bg) 0%, var(--fc-purple-bg) 100%)",
        boxShadow: "var(--fc-shadow-card)",
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {/* Rex 强化产品识别 */}
        <div style={{ flex: "0 0 auto" }}>
          <RexMascot mood="excited" size="sm" showMessage={false} />
        </div>

        {/* 标题 + 副标题 + 数据点 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 2,
            }}
          >
            <span aria-hidden style={{ fontSize: 14 }}>
              🎯
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 0.6,
                color: "var(--fc-primary-dark)",
                textTransform: "uppercase",
              }}
            >
              最终挑战
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
            《英语闯关》{course.name}{volume === "v1" ? "上册" : "下册"}最终关
          </div>
          <div
            style={{
              marginTop: 3,
              fontSize: 12,
              color: "var(--fc-ink-soft)",
              fontWeight: 600,
            }}
          >
            6 关挑战 · 看你能拿几颗星 ⭐
          </div>
        </div>

        {/* 右侧呼吸箭头 */}
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
