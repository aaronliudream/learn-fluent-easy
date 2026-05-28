/**
 * 段位徽章 — 4 档(铜/银/金/彩虹)
 *
 * 集成位置:src/components/primaryHub/finalChallenge/RankBadge.tsx
 *
 * 使用示例:
 *   <RankBadge tier="gold" size="lg" stars={3} />
 *
 * 设计:
 *   - 铜 → 银 → 金 → 彩虹 的金属感升级
 *   - 单关 1/2/3 星可附加显示
 *   - 通关 / 答对 / 解锁 都可复用
 */

import React from "react";

export type RankTier = "bronze" | "silver" | "gold" | "rainbow";

interface RankBadgeProps {
  tier: RankTier;
  /** 单关星数 0-3,可选 */
  stars?: number;
  size?: "sm" | "md" | "lg" | "xl";
  /** 是否解锁时的弹出动画 */
  unlock?: boolean;
  className?: string;
}

const sizePx: Record<NonNullable<RankBadgeProps["size"]>, number> = {
  sm: 48,
  md: 80,
  lg: 120,
  xl: 160,
};

/* 各档段位的渐变色 */
const gradients: Record<RankTier, { from: string; via: string; to: string; ring: string }> = {
  bronze: {
    from: "#E0A064",
    via: "#B8763A",
    to: "#8B5524",
    ring: "#F4C896",
  },
  silver: {
    from: "#DDE5EC",
    via: "#B8C5D0",
    to: "#8896A4",
    ring: "#F0F4F8",
  },
  gold: {
    from: "#FFD86B",
    via: "#FFA51A",
    to: "#E85D1A",
    ring: "#FFF3B8",
  },
  rainbow: {
    from: "#FF6B9D",
    via: "#FFC93C",
    to: "#9B6BFF",
    ring: "#FFFFFF",
  },
};

const tierLabel: Record<RankTier, string> = {
  bronze: "闯关学徒",
  silver: "闯关勇士",
  gold: "闯关高手",
  rainbow: "闯关大师",
};

export default function RankBadge({
  tier,
  stars,
  size = "md",
  unlock = false,
  className = "",
}: RankBadgeProps) {
  const px = sizePx[size];
  const g = gradients[tier];
  const id = `fc-rank-grad-${tier}`;
  const rainbowId = `fc-rank-rainbow-grad`;

  return (
    <div className={`relative inline-block ${className}`} style={{ width: px, height: px }}>
      {/* 光晕(高段位才有) */}
      {(tier === "gold" || tier === "rainbow") && (
        <div
          className="absolute fc-aura-expand pointer-events-none"
          style={{
            inset: -px * 0.15,
            background: `radial-gradient(circle, ${g.from}99, transparent 70%)`,
            borderRadius: "50%",
          }}
        />
      )}

      <svg
        viewBox="0 0 100 100"
        width={px}
        height={px}
        className={`relative ${unlock ? "fc-medal-unlock" : ""}`}
        aria-label={tierLabel[tier]}
        role="img"
      >
        <defs>
          {/* 普通段位:线性渐变 */}
          <linearGradient id={id} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={g.from} />
            <stop offset="60%" stopColor={g.via} />
            <stop offset="100%" stopColor={g.to} />
          </linearGradient>

          {/* 彩虹:多色渐变 */}
          <linearGradient id={rainbowId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6B9D" />
            <stop offset="25%" stopColor="#FFC93C" />
            <stop offset="50%" stopColor="#6BD968" />
            <stop offset="75%" stopColor="#4DB8FF" />
            <stop offset="100%" stopColor="#9B6BFF" />
          </linearGradient>

          {/* 内阴影模拟金属凹凸 */}
          <radialGradient id={`${id}-inner`} cx="50%" cy="35%" r="60%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.5)" />
            <stop offset="60%" stopColor="rgba(255,255,255,0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.2)" />
          </radialGradient>
        </defs>

        {/* 外环(高光) */}
        <circle cx="50" cy="50" r="48" fill="none" stroke={g.ring} strokeWidth="4" />

        {/* 主体圆 */}
        <circle
          cx="50"
          cy="50"
          r="42"
          fill={tier === "rainbow" ? `url(#${rainbowId})` : `url(#${id})`}
        />

        {/* 高光层(金属感) */}
        <circle cx="50" cy="50" r="42" fill={`url(#${id}-inner)`} />

        {/* 中央图标 */}
        <text
          x="50"
          y="65"
          textAnchor="middle"
          fontSize="44"
          style={{ filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.3))" }}
        >
          🏆
        </text>
      </svg>

      {/* 单关星数(右下角小标) */}
      {typeof stars === "number" && stars >= 0 && (
        <div
          className="absolute bottom-0 right-0 flex bg-white rounded-full px-1.5 py-0.5"
          style={{
            boxShadow: "var(--fc-shadow-card)",
            border: "2px solid var(--fc-border-medium)",
          }}
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                fontSize: px * 0.16,
                color: i < stars ? "#FFC93C" : "#D6CFC2",
                lineHeight: 1,
              }}
            >
              ★
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
 * 单关 3 颗星组件(独立使用,无徽章)
 * ============================================================ */

interface StarsRowProps {
  /** 0-3 颗星 */
  count: number;
  size?: number;
  /** 是否依次点亮(动画) */
  animate?: boolean;
  className?: string;
}

export function StarsRow({
  count,
  size = 32,
  animate = false,
  className = "",
}: StarsRowProps) {
  return (
    <div className={`inline-flex gap-1 ${className}`} style={{ lineHeight: 1 }}>
      {[0, 1, 2].map((i) => {
        const filled = i < count;
        return (
          <span
            key={i}
            className={animate && filled ? "fc-star-pop" : ""}
            style={{
              fontSize: size,
              color: filled ? "#FFC93C" : "#D6CFC2",
              animationDelay: animate ? `${i * 0.2}s` : undefined,
              opacity: animate ? 0 : 1,
              animationFillMode: "forwards",
              filter: filled
                ? "drop-shadow(0 2px 4px rgba(255, 201, 60, 0.6))"
                : "none",
            }}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}
