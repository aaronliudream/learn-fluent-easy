import type { ReactNode } from "react";

/**
 * Big Moon AI 绘本插图 — 手绘分级读物风格（粗黑线、平涂、简洁场景）。
 * 目前 sb1《Spark and the Sun》完整封面 + 6 页内页。
 */

type ArtProps = { className?: string };

const stroke = "#1a1a1a";
const skin = "#c68642";
const sparkOrange = "#f97316";
const grass = "#4ade80";
const sky = "#7dd3fc";

function SvgFrame({ className, children }: ArtProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 400 300"
      className={className}
      role="img"
      aria-hidden
      xmlns="http://www.w3.org/2000/svg">
      {children}
    </svg>
  );
}

/** Spark 简笔角色（正面） */
function SparkFace({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      <ellipse cx="0" cy="8" rx="42" ry="38" fill={sparkOrange} stroke={stroke} strokeWidth="3" />
      <ellipse cx="0" cy="12" rx="28" ry="24" fill="#fdba74" stroke={stroke} strokeWidth="2" />
      <circle cx="-12" cy="4" r="4" fill={stroke} />
      <circle cx="12" cy="4" r="4" fill={stroke} />
      <path d="M -10 18 Q 0 26 10 18" fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M -22 -8 Q -8 -22 8 -8" fill={sparkOrange} stroke={stroke} strokeWidth="2.5" />
      <path d="M 8 -8 Q 22 -22 36 -8" fill={sparkOrange} stroke={stroke} strokeWidth="2.5" />
    </g>
  );
}

function Sun({ cx, cy, r, rays = true }: { cx: number; cy: number; r: number; rays?: boolean }) {
  return (
    <g>
      {rays &&
        [0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <line
            key={deg}
            x1={cx}
            y1={cy}
            x2={cx + Math.cos((deg * Math.PI) / 180) * (r + 22)}
            y2={cy + Math.sin((deg * Math.PI) / 180) * (r + 22)}
            stroke="#fbbf24"
            strokeWidth="4"
            strokeLinecap="round"
          />
        ))}
      <circle cx={cx} cy={cy} r={r} fill="#fde047" stroke={stroke} strokeWidth="3" />
    </g>
  );
}

function Ground() {
  return (
  <>
      <rect x="0" y="220" width="400" height="80" fill={grass} stroke={stroke} strokeWidth="2" />
      <path d="M 0 220 Q 80 210 160 220 T 320 218 T 400 222" fill="none" stroke="#22c55e" strokeWidth="2" />
  </>
  );
}

export function Sb1CoverArt({ className }: ArtProps) {
  return (
    <SvgFrame className={className}>
      <rect width="400" height="300" fill={sky} />
      <Sun cx={300} cy={70} r={42} />
      <Ground />
      <SparkFace x={120} y={130} scale={1.15} />
      <text
        x="200"
        y="42"
        textAnchor="middle"
        fontFamily="Fredoka, 'Comic Sans MS', sans-serif"
        fontSize="28"
        fontWeight="800"
        fill="#dc2626">
        Spark and the Sun
      </text>
    </SvgFrame>
  );
}

export function Sb1Page1Art({ className }: ArtProps) {
  return (
    <SvgFrame className={className}>
      <rect width="400" height="300" fill="#fef9c3" />
      <Ground />
      <SparkFace x={200} y={115} scale={1.2} />
      <path d="M 280 100 L 300 70 L 320 100" fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
    </SvgFrame>
  );
}

export function Sb1Page2Art({ className }: ArtProps) {
  return (
    <SvgFrame className={className}>
      <rect width="400" height="300" fill={sky} />
      <Sun cx={200} cy={55} r={38} />
      <Ground />
      <g transform="translate(200,175)">
        <ellipse cx="0" cy="20" rx="35" ry="30" fill={sparkOrange} stroke={stroke} strokeWidth="2.5" />
        <circle cx="0" cy="0" r="22" fill="#fdba74" stroke={stroke} strokeWidth="2" />
        <circle cx="-8" cy="-2" r="3" fill={stroke} />
        <circle cx="8" cy="-2" r="3" fill={stroke} />
        <path d="M -30 -25 L -15 -45" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
        <path d="M 30 -25 L 45 -45" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
      </g>
    </SvgFrame>
  );
}

export function Sb1Page3Art({ className }: ArtProps) {
  return (
    <SvgFrame className={className}>
      <rect width="400" height="300" fill="#bae6fd" />
      <Sun cx={120} cy={120} r={32} rays={false} />
      <path d="M 80 140 L 120 90 L 160 140 Z" fill="#fde047" stroke={stroke} strokeWidth="2" opacity="0.9" />
      <Ground />
      <SparkFace x={260} y={130} />
      <path d="M 200 80 L 200 50" stroke={stroke} strokeWidth="3" markerEnd="url(#arrow)" />
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill={stroke} />
        </marker>
      </defs>
    </SvgFrame>
  );
}

export function Sb1Page4Art({ className }: ArtProps) {
  return (
    <SvgFrame className={className}>
      <rect width="400" height="300" fill="#fed7aa" />
      <Sun cx={280} cy={60} r={45} />
      <Ground />
      <SparkFace x={130} y={125} />
      <text x="200" y="100" fontSize="36" textAnchor="middle">🔥</text>
    </SvgFrame>
  );
}

export function Sb1Page5Art({ className }: ArtProps) {
  return (
    <SvgFrame className={className}>
      <rect width="400" height="300" fill={sky} />
      <Sun cx={200} cy={65} r={40} />
      <Ground />
      <SparkFace x={200} y={125} scale={1.1} />
      <path d="M 155 155 Q 200 175 245 155" fill="#ef4444" stroke={stroke} strokeWidth="2" />
    </SvgFrame>
  );
}

export function Sb1Page6Art({ className }: ArtProps) {
  return (
    <SvgFrame className={className}>
      <rect width="400" height="300" fill="#c4b5fd" />
      <Sun cx={320} cy={100} r={28} rays={false} />
      <Ground />
      <SparkFace x={140} y={125} />
      <path d="M 90 110 L 70 80 M 110 95 L 95 65" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
    </SvgFrame>
  );
}

const ART_MAP: Record<string, (props: ArtProps) => ReactNode> = {
  "sb1-cover": Sb1CoverArt,
  "sb1-p1": Sb1Page1Art,
  "sb1-p2": Sb1Page2Art,
  "sb1-p3": Sb1Page3Art,
  "sb1-p4": Sb1Page4Art,
  "sb1-p5": Sb1Page5Art,
  "sb1-p6": Sb1Page6Art,
};

export function BigMoonStoryIllustration({ id, className }: { id: string; className?: string }) {
  const Comp = ART_MAP[id];
  if (!Comp) return null;
  return <Comp className={className} />;
}

export function hasBigMoonArt(id: string) {
  return id in ART_MAP;
}

/** public 或 CDN 上的绘本插图路径 */
export function isStoryBookImagePath(ref: string) {
  return ref.startsWith("/") || ref.startsWith("http://") || ref.startsWith("https://");
}
