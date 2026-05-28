/**
 * 关卡地图 — 蜿蜒小径 + 10 个关卡节点
 *
 * 集成位置:src/components/primaryHub/finalChallenge/LevelMap.tsx
 *
 * 设计:
 *   - SVG path 蜿蜒连接 10 个关卡
 *   - 关卡节点支持 3 种状态:locked / current / completed
 *   - 当前推荐关有呼吸动画
 *   - 完成关显示星数
 *
 * 使用示例:
 *   <LevelMap levels={[
 *     { id: 1, name: "看图选句", state: "completed", stars: 3 },
 *     { id: 2, name: "看图选词", state: "completed", stars: 2 },
 *     { id: 3, name: "听音辨词", state: "current" },
 *     { id: 4, name: "听句判断", state: "locked" },
 *     // ... 共 10 关
 *   ]}
 *   onLevelClick={(id) => navigate(`/level/${id}`)}
 *   />
 */

import React from "react";

export type LevelState = "locked" | "current" | "completed";

export interface LevelData {
  id: number;
  name: string;
  state: LevelState;
  stars?: number; // 0-3
}

interface LevelMapProps {
  levels: LevelData[];
  onLevelClick?: (id: number) => void;
  className?: string;
}

/* 10 个关卡节点的位置(viewBox: 100 x 200,从下往上画) */
const NODE_POSITIONS = [
  { x: 20, y: 185 }, // 关 1(地图底部 / 起点)
  { x: 70, y: 165 },
  { x: 25, y: 140 },
  { x: 75, y: 115 },
  { x: 30, y: 90 },
  { x: 65, y: 70 },
  { x: 20, y: 55 },
  { x: 75, y: 38 },
  { x: 35, y: 22 },
  { x: 60, y: 10 }, // 关 10(地图顶部 / 终点)
];

/* 每关一个不同的主题颜色(让地图有"段位旅程"感) */
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

/* 计算蜿蜒路径(贝塞尔连接所有节点) */
function buildPath(): string {
  const pts = NODE_POSITIONS;
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const curr = pts[i];
    // 简单 S 曲线:控制点在两点之间垂直方向偏移
    const cx1 = prev.x;
    const cy1 = (prev.y + curr.y) / 2;
    const cx2 = curr.x;
    const cy2 = (prev.y + curr.y) / 2;
    d += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${curr.x} ${curr.y}`;
  }
  return d;
}

const PATH_D = buildPath();

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
      className={`relative w-full ${className}`}
      style={{
        background: "linear-gradient(180deg, #E0F2FE 0%, #FEF3C7 60%, #DBEAFE 100%)",
        borderRadius: "var(--fc-radius-lg)",
        padding: "16px",
        overflow: "hidden",
      }}
    >
      {/* 装饰:云朵 */}
      <div className="absolute pointer-events-none" style={{ inset: 0 }}>
        <div
          className="absolute fc-float"
          style={{
            top: "10%",
            left: "10%",
            width: 60,
            height: 24,
            background: "white",
            borderRadius: "9999px",
            opacity: 0.7,
            animationDelay: "0s",
          }}
        />
        <div
          className="absolute fc-float"
          style={{
            top: "5%",
            right: "15%",
            width: 80,
            height: 28,
            background: "white",
            borderRadius: "9999px",
            opacity: 0.6,
            animationDelay: "1s",
          }}
        />
        {/* 太阳 */}
        <div
          className="absolute fc-sparkle"
          style={{
            top: "12%",
            right: "8%",
            width: 40,
            height: 40,
            background: "radial-gradient(circle, #FFC93C 0%, #FFA51A 70%, transparent 80%)",
            borderRadius: "9999px",
            opacity: 1,
          }}
        />
      </div>

      <svg
        viewBox="0 0 100 200"
        preserveAspectRatio="xMidYMid meet"
        className="w-full relative"
        style={{ aspectRatio: "100/200", maxHeight: "70vh" }}
      >
        {/* 蜿蜒小径(底色) */}
        <path
          d={PATH_D}
          fill="none"
          stroke="#FFF8E7"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray="0 0"
          opacity="0.8"
        />
        {/* 蜿蜒小径(虚线纹理) */}
        <path
          d={PATH_D}
          fill="none"
          stroke="#D4A574"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="3 3"
          opacity="0.6"
        />

        {/* 10 个关卡节点 */}
        {items.map((level, idx) => {
          const pos = NODE_POSITIONS[idx];
          const isLocked = level.state === "locked";
          const isCurrent = level.state === "current";
          const isCompleted = level.state === "completed";
          const baseColor = isLocked ? "#C5BFB3" : NODE_COLORS[idx];

          return (
            <g
              key={level.id}
              transform={`translate(${pos.x}, ${pos.y})`}
              style={{ cursor: isLocked ? "not-allowed" : "pointer" }}
              onClick={() => !isLocked && onLevelClick?.(level.id)}
            >
              {/* 当前推荐:呼吸光圈 */}
              {isCurrent && (
                <circle r="9" fill={baseColor} opacity="0.3" className="fc-breathing" />
              )}

              {/* 节点主体 */}
              <circle
                r="6"
                fill={baseColor}
                stroke="white"
                strokeWidth="1.2"
                style={{
                  filter: isLocked
                    ? "none"
                    : `drop-shadow(0 1.5px 0 rgba(0,0,0,0.2))`,
                }}
              />

              {/* 关卡编号 */}
              <text
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="6"
                fontWeight="900"
                fill="white"
                style={{ pointerEvents: "none", fontFamily: "Fredoka, sans-serif" }}
              >
                {isLocked ? "🔒" : level.id}
              </text>

              {/* 完成关的星数(右上角) */}
              {isCompleted && typeof level.stars === "number" && (
                <text
                  x="8"
                  y="-5"
                  fontSize="3.5"
                  fill="#FFC93C"
                  style={{
                    filter: "drop-shadow(0 0 2px rgba(255, 201, 60, 0.6))",
                  }}
                >
                  {"★".repeat(level.stars)}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* 当前关名提示(底部) */}
      {(() => {
        const current = items.find((l) => l.state === "current");
        if (!current) return null;
        return (
          <div
            className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full fc-fade-in-up"
            style={{
              background: "white",
              boxShadow: "var(--fc-shadow-card)",
              fontWeight: 800,
              fontSize: 13,
              color: "var(--fc-ink)",
            }}
          >
            👉 关 {current.id}:{current.name}
          </div>
        );
      })()}
    </div>
  );
}
