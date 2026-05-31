/**
 * 关卡入口 — 大卡片版 (替代插画地图)
 *
 * 设计:每关一张整行高条目卡片(≈80px 高)——
 *   - 左侧大 emoji 图标(糖果色圆底)
 *   - 中间关名(大字)+ 第 N 关(小字)
 *   - 右侧状态:completed → ⭐×stars / current → ▶ / locked → 🔒
 *   - 每关一种"糖果色"主题(按 levelId 取),locked 统一柔灰
 *   - 点击有轻微弹跳(复用 fc-btn-press),手机单列、好点不挤
 *
 * 纯展示层:不改关卡数据/路由/进度,只画入口。icon 由调用方按题型注入到
 * LevelData.icon;color 在这里按 levelId 取。
 */

import type { LevelData } from "@/components/primaryHub/finalChallenge/LevelMap";

interface Candy {
  badge: string;
  bg: string;
  border: string;
}

/** 10 关糖果色(柔和、明亮、孩子向),按 levelId 取。 */
const CANDY: Record<number, Candy> = {
  1: { badge: "#FF6B6B", bg: "#FFECEC", border: "#FFC9C9" }, // 珊瑚红
  2: { badge: "#FF9F45", bg: "#FFF1E2", border: "#FFD9B0" }, // 橙
  3: { badge: "#EAA81E", bg: "#FFF6DC", border: "#FFE39A" }, // 琥珀黄
  4: { badge: "#5FBF5F", bg: "#E9F8E7", border: "#BDE8B8" }, // 草绿
  5: { badge: "#2BBFA3", bg: "#E0F7F1", border: "#A7E6D9" }, // 青绿
  6: { badge: "#4DA8F5", bg: "#E7F3FE", border: "#B5DBF8" }, // 天蓝
  7: { badge: "#6C6BE0", bg: "#ECEBFC", border: "#C7C6F2" }, // 靛蓝
  8: { badge: "#9B6BFF", bg: "#F2E9FF", border: "#D8C2FA" }, // 紫
  9: { badge: "#E156C4", bg: "#FCE8F7", border: "#F3C2E7" }, // 品红
  10: { badge: "#FF6B9D", bg: "#FFE9F1", border: "#FBC2D6" }, // 玫红
};

const GRAY: Candy = { badge: "#BDB7AD", bg: "#F2F0EB", border: "#E1DDD4" };

interface LevelCardsProps {
  levels: LevelData[];
  onLevelClick?: (id: number) => void;
  className?: string;
}

export default function LevelCards({
  levels,
  onLevelClick,
  className = "",
}: LevelCardsProps) {
  return (
    <div
      className={className}
      style={{
        maxWidth: 480,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {levels.map((level) => {
        const isLocked = level.state === "locked";
        const isCompleted = level.state === "completed";
        const isCurrent = level.state === "current";
        const candy = isLocked ? GRAY : (CANDY[level.id] ?? CANDY[10]);
        const stars = level.stars ?? 0;

        return (
          <button
            key={level.id}
            type="button"
            disabled={isLocked}
            onClick={() => !isLocked && onLevelClick?.(level.id)}
            className={isLocked ? undefined : "fc-btn-press"}
            aria-label={`${isLocked ? "未解锁," : isCompleted ? "已通关," : "当前关,"}关 ${level.id} ${level.name}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              width: "100%",
              minHeight: 80,
              padding: "12px 16px",
              borderRadius: "var(--fc-radius-lg)",
              background: candy.bg,
              border: `2px solid ${isCurrent ? candy.badge : candy.border}`,
              boxShadow: isLocked ? "none" : "0 2px 0 rgba(0,0,0,0.05), 0 6px 14px rgba(0,0,0,0.08)",
              cursor: isLocked ? "not-allowed" : "pointer",
              opacity: isLocked ? 0.7 : 1,
              textAlign: "left",
              transition: "transform 150ms, box-shadow 150ms",
            }}
          >
            {/* 左侧大 emoji 圆底 */}
            <span
              aria-hidden
              style={{
                position: "relative",
                flex: "0 0 auto",
                display: "grid",
                placeItems: "center",
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: candy.badge,
                fontSize: 28,
                lineHeight: 1,
                boxShadow: "inset 0 -2px 4px rgba(0,0,0,0.12)",
                filter: isLocked ? "grayscale(0.4)" : "none",
              }}
            >
              {isLocked ? "🔒" : (level.icon ?? "🎯")}
              {/* 通关角标 ⭐ */}
              {isCompleted && (
                <span
                  style={{
                    position: "absolute",
                    top: -6,
                    right: -6,
                    fontSize: 18,
                    filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.3))",
                  }}
                >
                  ⭐
                </span>
              )}
            </span>

            {/* 中间:关名 + 第 N 关 */}
            <span style={{ flex: 1, minWidth: 0 }}>
              <span
                style={{
                  display: "block",
                  fontFamily: "var(--fc-font-display)",
                  fontWeight: 800,
                  fontSize: 19,
                  color: isLocked ? "var(--fc-ink-soft)" : "var(--fc-ink)",
                  lineHeight: 1.2,
                }}
              >
                {level.name}
              </span>
              <span
                style={{
                  display: "block",
                  marginTop: 3,
                  fontSize: 12,
                  fontWeight: 700,
                  color: "var(--fc-ink-mute, #9a948a)",
                }}
              >
                第 {level.id} 关
                {isCurrent && " · 开始挑战"}
              </span>
            </span>

            {/* 右侧状态 */}
            <span
              style={{
                flex: "0 0 auto",
                display: "flex",
                alignItems: "center",
                fontSize: 15,
                lineHeight: 1,
              }}
            >
              {isCompleted ? (
                <span style={{ color: "#FFC93C", letterSpacing: 1, whiteSpace: "nowrap" }}>
                  {"★".repeat(stars)}
                  <span style={{ color: "#D6CFC2" }}>{"★".repeat(Math.max(0, 3 - stars))}</span>
                </span>
              ) : isCurrent ? (
                <span
                  style={{
                    display: "grid",
                    placeItems: "center",
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: candy.badge,
                    color: "white",
                    fontSize: 15,
                    fontWeight: 800,
                  }}
                >
                  ▶
                </span>
              ) : (
                <span aria-hidden style={{ fontSize: 18, opacity: 0.6 }}>
                  🔒
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
