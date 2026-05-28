/**
 * Rex 吉祥物 — 英语闯关产品角色
 *
 * 改编自 hello-there 设计稿,适配当前项目技术栈:
 * - 移除 Framer Motion,改用纯 CSS 动画(类名见 final-challenge-animations.css)
 * - 移除 Next.js 'use client' 指令
 * - 移除 game-store 依赖,改为受控 props
 * - 颜色使用 final-challenge-tokens.css 中的 CSS 变量
 *
 * 使用示例:
 *   <RexMascot mood="excited" message="再来一题!" size="md" />
 *
 * 集成位置:
 *   src/components/primaryHub/finalChallenge/RexMascot.tsx
 */

import React from "react";

export type RexMood =
  | "happy"
  | "excited"
  | "thinking"
  | "encouraging"
  | "celebrating"
  | "sad";

interface RexMascotProps {
  mood: RexMood;
  message?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showMessage?: boolean;
  className?: string;
}

const sizeClasses: Record<NonNullable<RexMascotProps["size"]>, string> = {
  sm: "w-16 h-16",
  md: "w-24 h-24",
  lg: "w-32 h-32",
  xl: "w-48 h-48",
};

// 每种心情的主体颜色(对齐 fc-tokens)
const moodColors: Record<RexMood, string> = {
  happy: "#FF9F43",       // 暖橙
  excited: "#FFC93C",     // 亮黄
  thinking: "#4DB8FF",    // 思考蓝
  encouraging: "#9B6BFF", // 紫(鼓励)
  celebrating: "#FF6B9D", // 粉(庆祝)
  sad: "#A8A199",         // 沉灰
};

// 心情对应的 CSS animation class
const moodAnimClass: Record<RexMood, string> = {
  happy: "fc-rex-happy",
  excited: "fc-rex-excited",
  thinking: "fc-rex-thinking",
  encouraging: "fc-rex-encouraging",
  celebrating: "fc-rex-celebrating",
  sad: "fc-rex-sad",
};

/* ============================================================
 * 表情:眼睛 + 嘴 + 状态装饰
 * ============================================================ */
function RexFace({ mood }: { mood: RexMood }) {
  const eyeStyle: Record<RexMood, { cy: number; rx: number; ry: number }> = {
    happy:       { cy: 35, rx: 8,  ry: 10 },
    excited:     { cy: 32, rx: 10, ry: 12 },
    thinking:    { cy: 38, rx: 6,  ry: 8  },
    encouraging: { cy: 35, rx: 8,  ry: 10 },
    celebrating: { cy: 30, rx: 10, ry: 8  },
    sad:         { cy: 40, rx: 8,  ry: 6  },
  };

  const mouthPaths: Record<RexMood, string> = {
    happy:       "M 30 55 Q 50 70 70 55",
    excited:     "M 25 50 Q 50 75 75 50",
    thinking:    "M 35 60 Q 50 55 65 60",
    encouraging: "M 30 55 Q 50 65 70 55",
    celebrating: "M 20 45 Q 50 80 80 45",
    sad:         "M 35 65 Q 50 55 65 65",
  };

  const e = eyeStyle[mood];
  const hasBlush = mood === "happy" || mood === "excited" || mood === "celebrating";

  return (
    <g>
      {/* 眼睛 */}
      <ellipse cx="35" cy={e.cy} rx={e.rx} ry={e.ry} fill="#2D3436" />
      <ellipse cx="65" cy={e.cy} rx={e.rx} ry={e.ry} fill="#2D3436" />
      {/* 高光 */}
      <circle cx="38" cy={e.cy - 3} r="3" fill="white" />
      <circle cx="68" cy={e.cy - 3} r="3" fill="white" />

      {/* 腮红(快乐心情才有) */}
      {hasBlush && (
        <>
          <ellipse cx="22" cy="50" rx="8" ry="5" fill="#FFB8B8" opacity="0.6" />
          <ellipse cx="78" cy="50" rx="8" ry="5" fill="#FFB8B8" opacity="0.6" />
        </>
      )}

      {/* 嘴(celebrating / excited 内部填红色) */}
      <path
        d={mouthPaths[mood]}
        stroke="#2D3436"
        strokeWidth="4"
        strokeLinecap="round"
        fill={mood === "excited" || mood === "celebrating" ? "#FF6B6B" : "none"}
      />

      {/* thinking:汗滴 */}
      {mood === "thinking" && (
        <path
          d="M 75 25 Q 80 20 78 30 Q 75 35 75 25"
          fill="#74B9FF"
          className="fc-sweat-drop"
        />
      )}

      {/* sad:眼泪 */}
      {mood === "sad" && (
        <>
          <ellipse cx="30" cy="48" rx="3" ry="5" fill="#74B9FF" className="fc-tear-drop" />
          <ellipse
            cx="70" cy="48" rx="3" ry="5" fill="#74B9FF"
            className="fc-tear-drop"
            style={{ animationDelay: "0.3s" }}
          />
        </>
      )}

      {/* celebrating:星星飘 */}
      {mood === "celebrating" && (
        <>
          <text x="5" y="20" fontSize="14" className="fc-celebrate-star">✨</text>
          <text
            x="80" y="15" fontSize="12"
            className="fc-celebrate-star"
            style={{ animationDelay: "0.5s" }}
          >
            ⭐
          </text>
        </>
      )}
    </g>
  );
}

/* ============================================================
 * 主组件
 * ============================================================ */
export default function RexMascot({
  mood,
  message,
  size = "md",
  showMessage = true,
  className = "",
}: RexMascotProps) {
  const color = moodColors[mood];

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {/* Rex 角色 */}
      <div
        className={`relative ${sizeClasses[size]} ${moodAnimClass[mood]}`}
        style={{ willChange: "transform" }}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-lg"
          aria-label={`Rex ${mood}`}
          role="img"
        >
          {/* 身体 */}
          <ellipse cx="50" cy="70" rx="35" ry="25" fill={color} />
          {/* 头 */}
          <circle cx="50" cy="45" r="35" fill={color} />
          {/* 肚子 */}
          <ellipse cx="50" cy="72" rx="25" ry="18" fill="#FFF5E6" />
          {/* 背刺 */}
          <path
            d="M 30 15 L 35 5 L 40 15 M 45 12 L 50 0 L 55 12 M 60 15 L 65 5 L 70 15"
            fill={color}
            stroke={color}
            strokeWidth="2"
          />
          {/* 小手臂 */}
          <ellipse cx="20" cy="65" rx="8" ry="5" fill={color} transform="rotate(-30 20 65)" />
          <ellipse cx="80" cy="65" rx="8" ry="5" fill={color} transform="rotate(30 80 65)" />
          {/* 脚 */}
          <ellipse cx="35" cy="92" rx="12" ry="6" fill={color} />
          <ellipse cx="65" cy="92" rx="12" ry="6" fill={color} />
          {/* 尾巴 */}
          <path d="M 85 70 Q 100 60 95 75 Q 90 80 85 75" fill={color} />
          {/* 表情 */}
          <RexFace mood={mood} />
        </svg>
      </div>

      {/* 对话气泡 */}
      {showMessage && message && (
        <div
          key={message}
          className="relative bg-white rounded-2xl px-4 py-2 max-w-[200px] fc-fade-in-up fc-shadow-card"
          style={{ border: "2px solid var(--fc-border-soft)" }}
        >
          {/* 气泡小尾巴 */}
          <div
            className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45"
            style={{
              borderLeft: "2px solid var(--fc-border-soft)",
              borderTop: "2px solid var(--fc-border-soft)",
            }}
          />
          <p className="text-sm font-medium text-center relative z-10"
             style={{ color: "var(--fc-ink)" }}>
            {message}
          </p>
        </div>
      )}
    </div>
  );
}
