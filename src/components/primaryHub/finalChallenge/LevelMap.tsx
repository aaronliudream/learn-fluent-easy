/**
 * 关卡地图 — 插画背景 + 10 个关卡节点（绝对定位百分比）
 *
 * 设计思路:
 *   - 背景图由 AI 生成的插画提供 (草地 + S 形小路 + 树丛 + 终点旗帜)
 *     图片本身已经画好云、太阳、虚线路径,组件里不再用 SVG 重画
 *   - 节点用 absolute + 百分比定位,无论容器多宽都能贴在小路上
 *   - 三态视觉:
 *       completed → 彩色实心 + 顶部星数
 *       current   → 彩色实心 + 数字 + 呼吸光圈
 *       locked    → 灰色 + 🔒
 *   - 节点外圈白描边 + drop-shadow,压在插画上不糊
 */

import React from "react";
import bgUrl from "@/assets/finalChallenge/level-map-bg.png";

export type LevelState = "locked" | "current" | "completed";

export interface LevelData {
  id: number;
  name: string;
  state: LevelState;
  /** 0-3 颗星 (completed 时显示) */
  stars?: number;
}

interface LevelMapProps {
  levels: LevelData[];
  onLevelClick?: (id: number) => void;
  className?: string;
}

/**
 * 10 个关卡在插画上的中心点位置 (左上为 0,0 / 右下为 100,100)。
 * 沿 S 形小路从底部关 1 到顶部关 10。如需微调,只动这一组数字。
 */
const NODE_POSITIONS: ReadonlyArray<{ x: number; y: number }> = [
  { x: 52, y: 92 }, // 关 1 (底部起点)
  { x: 62, y: 83 }, // 关 2
  { x: 48, y: 74 }, // 关 3
  { x: 38, y: 66 }, // 关 4
  { x: 46, y: 57 }, // 关 5
  { x: 56, y: 49 }, // 关 6
  { x: 50, y: 40 }, // 关 7
  { x: 42, y: 32 }, // 关 8
  { x: 48, y: 24 }, // 关 9
  { x: 51, y: 16 }, // 关 10 (终点旗帜下方)
];

/** 每关一个主题色 (让地图有"段位旅程"感)。locked 用统一灰色覆盖。 */
const NODE_COLORS = [
  "#6BD968", // 1 绿
  "#4DB8FF", // 2 蓝
  "#9B6BFF", // 3 紫
  "#FF6B9D", // 4 粉
  "#FF6B35", // 5 主橙
  "#3FB23C", // 6 深绿
  "#5C5BD8", // 7 靛
  "#E85D1A", // 8 深橙
  "#FFA51A", // 9 金
  "#FFC93C", // 10 终点黄
];

const NODE_DIAMETER = 44; // px;白描边后视觉直径,够大不会糊在插画上

export default function LevelMap({
  levels,
  onLevelClick,
  className = "",
}: LevelMapProps) {
  // 截取或补全到 10 关
  const items = levels.slice(0, 10);
  while (items.length < 10) {
    items.push({
      id: items.length + 1,
      name: "敬请期待",
      state: "locked",
    });
  }

  return (
    <div
      className={`relative mx-auto ${className}`}
      style={{
        maxWidth: 480,
        aspectRatio: "9 / 16",
        backgroundImage: `url(${bgUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        borderRadius: "var(--fc-radius-lg)",
        overflow: "hidden",
      }}
    >
      {/* 10 个关卡节点 */}
      {items.map((level, idx) => {
        const pos = NODE_POSITIONS[idx];
        const isLocked = level.state === "locked";
        const isCurrent = level.state === "current";
        const isCompleted = level.state === "completed";
        const baseColor = isLocked ? "#A8A199" : NODE_COLORS[idx];
        const interactive = !isLocked;

        return (
          <button
            key={level.id}
            type="button"
            disabled={isLocked}
            onClick={() => interactive && onLevelClick?.(level.id)}
            aria-label={`${isLocked ? "未解锁:" : ""} 关 ${level.id} ${level.name}`}
            style={{
              position: "absolute",
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: "translate(-50%, -50%)",
              width: NODE_DIAMETER,
              height: NODE_DIAMETER,
              padding: 0,
              border: "none",
              background: "transparent",
              cursor: interactive ? "pointer" : "not-allowed",
            }}
          >
            {/* 呼吸光圈 (current 才有) */}
            {isCurrent && (
              <span
                className="fc-breathing"
                aria-hidden
                style={{
                  position: "absolute",
                  inset: -6,
                  borderRadius: "50%",
                  background: baseColor,
                  opacity: 0.28,
                  pointerEvents: "none",
                }}
              />
            )}

            {/* 节点主体 (白描边 + 投影,确保压在插画上立体可读) */}
            <span
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                background: baseColor,
                border: "3px solid white",
                boxShadow:
                  "0 2px 0 rgba(0,0,0,0.18), 0 6px 12px rgba(0,0,0,0.25)",
                display: "grid",
                placeItems: "center",
                fontFamily: "var(--fc-font-display)",
                fontWeight: 900,
                fontSize: 18,
                color: "white",
                textShadow: "0 1px 2px rgba(0,0,0,0.25)",
                userSelect: "none",
              }}
            >
              {isLocked ? "🔒" : level.id}
            </span>

            {/* completed 关的星数 (节点上方) */}
            {isCompleted && typeof level.stars === "number" && level.stars > 0 && (
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  left: "50%",
                  bottom: "calc(100% + 2px)",
                  transform: "translateX(-50%)",
                  fontSize: 12,
                  color: "#FFC93C",
                  textShadow: "0 1px 2px rgba(0,0,0,0.4)",
                  lineHeight: 1,
                  whiteSpace: "nowrap",
                  pointerEvents: "none",
                }}
              >
                {"★".repeat(level.stars)}
              </span>
            )}
          </button>
        );
      })}

      {/* 当前关名提示 (底部居中药丸) */}
      {(() => {
        const current = items.find((l) => l.state === "current");
        if (!current) return null;
        return (
          <div
            className="fc-fade-in-up"
            style={{
              position: "absolute",
              left: "50%",
              bottom: 12,
              transform: "translateX(-50%)",
              padding: "8px 16px",
              borderRadius: 9999,
              background: "white",
              boxShadow: "var(--fc-shadow-card)",
              fontWeight: 800,
              fontSize: 13,
              color: "var(--fc-ink)",
              whiteSpace: "nowrap",
              pointerEvents: "none",
            }}
          >
            👉 关 {current.id}:{current.name}
          </div>
        );
      })()}
    </div>
  );
}
