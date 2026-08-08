/**
 * 口腔侧剖图 —— 音标卡的主视觉。
 *
 * ⚠️ 这张图的**唯一判据**:没学过音标的人看一眼,能说出"舌头放在哪"。
 *    所以是示意图不是解剖图 —— 该夸张的地方一定要夸张
 *    (/θ/ 的舌尖必须**明显伸出齿外**,画得"解剖学正确"反而看不出来)。
 *
 * ⚠️ **48 个音共用这一张底图,只换舌头形状 + 高亮部位**(Aaron 定的做法)。
 *    所以底图(唇/齿/硬腭/软腭/鼻腔/咽腔)在这里画死,
 *    每个音只提供 `tongue`(舌头路径)和 `highlight`(高亮哪几个部位)。
 *    新增音标时只写这两样,不要再画一张新底图 —— 底图一变,
 *    48 张图之间就没法互相对照了,而"对照"正是学音标的关键动作。
 *
 * 朝向:**面朝右**,右侧是嘴唇开口,左侧是喉咙。
 * 坐标系 200×170。
 */
import { cn } from "@/lib/utils";

/** 可高亮的部位 —— 与 `PART_LABEL` 一一对应。 */
export type MouthPart = "lips" | "upperTeeth" | "lowerTeeth" | "tongueTip" | "tongueBody" | "velum";

export type MouthConfig = {
  /** 舌头形状(SVG path,坐标系 200×170)。 */
  tongue: string;
  /** 高亮部位:会被染成强调色并加粗 */
  highlight: MouthPart[];
  /** 气流箭头:从哪里出来。null = 不画(如 /l/ 气流走两侧,侧剖图上画不出来) */
  airflow?: "mouth" | "nose" | null;
  /** 声带振动(浊音)——画在喉咙位置的波纹 */
  voiced?: boolean;
  /** 舌尖是否接触(接触点画一个小圆点,表示"这里碰上了") */
  contactAt?: { x: number; y: number } | null;
};

const ACCENT = "#E24B4A";      // 高亮色:醒目的红,与页面身份色(青)拉开
const INK = "#334155";         // 底图线条
const SOFT = "#CBD5E1";        // 次要结构

export default function MouthDiagram({ config, className }: { config: MouthConfig; className?: string }) {
  const on = (p: MouthPart) => config.highlight.includes(p);
  const stroke = (p: MouthPart) => (on(p) ? ACCENT : INK);
  const width = (p: MouthPart) => (on(p) ? 4 : 2);

  return (
    <svg viewBox="0 0 200 170" className={cn("w-full", className)} role="img"
      aria-label="口腔侧剖示意图:显示发这个音时舌头、嘴唇和牙齿的位置">
      {/* 面部轮廓(极简):鼻尖 → 上唇 → 下唇 → 下巴 */}
      <path d="M188 34 L172 52 L176 58" fill="none" stroke={SOFT} strokeWidth="2" strokeLinecap="round" />
      <path d="M170 118 L182 138" fill="none" stroke={SOFT} strokeWidth="2" strokeLinecap="round" />

      {/* 鼻腔 */}
      <path d="M60 30 Q110 18 168 34 L168 44 Q110 32 66 44 Z" fill="#F1F5F9" stroke={SOFT} strokeWidth="1.5" />
      <text x="96" y="28" fontSize="9" fill="#94A3B8">鼻腔</text>

      {/* 硬腭(口腔顶) + 软腭(可抬起挡住鼻腔) */}
      <path d="M166 60 Q120 46 84 52" fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M84 52 Q66 56 58 74" fill="none" stroke={stroke("velum")} strokeWidth={width("velum")} strokeLinecap="round" />

      {/* 咽腔 / 喉咙 */}
      <path d="M58 74 L54 130" fill="none" stroke={SOFT} strokeWidth="2" strokeLinecap="round" />
      <path d="M92 150 Q70 146 60 132" fill="none" stroke={SOFT} strokeWidth="2" strokeLinecap="round" />

      {/* 上下唇 */}
      <path d="M170 56 Q180 66 172 76" fill="none" stroke={stroke("lips")} strokeWidth={width("lips")} strokeLinecap="round" />
      <path d="M172 100 Q182 110 170 118" fill="none" stroke={stroke("lips")} strokeWidth={width("lips")} strokeLinecap="round" />

      {/* 上齿 / 下齿 */}
      <path d="M162 62 L162 76" stroke={stroke("upperTeeth")} strokeWidth={width("upperTeeth") + 2} strokeLinecap="round" />
      <path d="M162 98 L162 110" stroke={stroke("lowerTeeth")} strokeWidth={width("lowerTeeth") + 2} strokeLinecap="round" />

      {/* 舌头:每个音只换这一条 path */}
      <path d={config.tongue}
        fill={on("tongueBody") || on("tongueTip") ? "#FCA5A5" : "#E2E8F0"}
        stroke={on("tongueBody") || on("tongueTip") ? ACCENT : INK}
        strokeWidth={on("tongueBody") || on("tongueTip") ? 3 : 2}
        strokeLinejoin="round" />
      <text x="96" y="140" fontSize="9" fill={on("tongueBody") || on("tongueTip") ? ACCENT : "#94A3B8"}>舌</text>

      {/* 接触点:告诉学习者"这里碰上了" */}
      {config.contactAt && (
        <circle cx={config.contactAt.x} cy={config.contactAt.y} r="5"
          fill="none" stroke={ACCENT} strokeWidth="2.5" strokeDasharray="3 2" />
      )}

      {/* 气流 */}
      {config.airflow === "mouth" && (
        <>
          <path d="M150 88 L190 86" fill="none" stroke="#0EA5E9" strokeWidth="2.5"
            strokeLinecap="round" markerEnd="url(#arrow)" />
          <text x="150" y="80" fontSize="9" fill="#0EA5E9">气流</text>
        </>
      )}
      {config.airflow === "nose" && (
        <>
          <path d="M120 36 L186 30" fill="none" stroke="#0EA5E9" strokeWidth="2.5"
            strokeLinecap="round" markerEnd="url(#arrow)" />
          <text x="126" y="50" fontSize="9" fill="#0EA5E9">气流走鼻腔</text>
        </>
      )}

      {/* 声带振动(浊音) */}
      {config.voiced && (
        <>
          <path d="M46 128 q4 -5 8 0 q4 5 8 0" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" />
          <path d="M46 136 q4 -5 8 0 q4 5 8 0" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" />
          <text x="20" y="152" fontSize="9" fill="#16A34A">声带振动</text>
        </>
      )}

      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="#0EA5E9" />
        </marker>
      </defs>
    </svg>
  );
}

/* ── 8 个最易错音的舌位配置 ──────────────────────────────────────
 * 舌头路径都从同一个"中性舌"变形而来,方便互相对照。
 * 中性参考:M64 132 Q100 112 150 112 Q160 118 150 126 Q104 136 68 144 Z
 */

export const MOUTH: Record<string, MouthConfig> = {
  /** /θ/ 舌尖**伸出齿间**——必须画到明显越过牙齿,否则和 /s/ 看着一样 */
  "θ": {
    tongue: "M64 132 Q100 114 152 106 L176 90 L178 98 L156 116 Q104 136 68 144 Z",
    highlight: ["tongueTip", "upperTeeth", "lowerTeeth"],
    airflow: "mouth",
    contactAt: { x: 170, y: 94 },
  },
  /** /ð/ 舌位同 /θ/,区别只在声带振动 —— 所以图几乎一样,靠绿色波纹区分 */
  "ð": {
    tongue: "M64 132 Q100 114 152 106 L176 90 L178 98 L156 116 Q104 136 68 144 Z",
    highlight: ["tongueTip", "upperTeeth", "lowerTeeth"],
    airflow: "mouth",
    voiced: true,
    contactAt: { x: 170, y: 94 },
  },
  /** /r/ 舌尖**后卷且不碰上腭**——不接触是关键,所以不画接触点 */
  "r": {
    tongue: "M64 132 Q98 118 136 106 Q152 96 146 84 Q138 82 134 96 Q126 112 68 144 Z",
    highlight: ["tongueTip", "lips"],
    airflow: "mouth",
    voiced: true,
    contactAt: null,
  },
  /** /l/ 舌尖**抵住上齿龈**——接触点画出来,与 /r/ 的"不碰"形成对比 */
  "l": {
    tongue: "M64 132 Q100 116 150 96 L158 74 L164 78 L158 100 Q106 130 68 144 Z",
    highlight: ["tongueTip"],
    airflow: null,
    voiced: true,
    contactAt: { x: 160, y: 76 },
  },
  /** /v/ 上齿咬下唇,舌头不参与 —— 所以舌头是中性灰,高亮在齿唇 */
  "v": {
    tongue: "M64 132 Q100 112 150 112 Q160 118 150 126 Q104 136 68 144 Z",
    highlight: ["upperTeeth", "lips"],
    airflow: "mouth",
    voiced: true,
    contactAt: { x: 166, y: 96 },
  },
  /** /w/ 双唇**收圆突出**,舌后部抬高 */
  "w": {
    tongue: "M64 120 Q92 100 118 104 Q140 112 150 120 Q140 130 104 136 Q76 140 68 144 Z",
    highlight: ["lips", "tongueBody"],
    airflow: "mouth",
    voiced: true,
    contactAt: null,
  },
  /** /æ/ 下巴下压、舌前部低平 —— 舌头整体压低拉平 */
  "æ": {
    tongue: "M64 138 Q104 128 152 126 Q160 132 150 138 Q104 146 68 150 Z",
    highlight: ["tongueBody", "lowerTeeth"],
    airflow: "mouth",
    voiced: true,
    contactAt: null,
  },
  /** /ʌ/ 舌位居中放松 —— 就是那条"中性舌",作为其它音的参照 */
  "ʌ": {
    tongue: "M64 132 Q100 112 150 112 Q160 118 150 126 Q104 136 68 144 Z",
    highlight: ["tongueBody"],
    airflow: "mouth",
    voiced: true,
    contactAt: null,
  },
};

export const PART_LABEL: Record<MouthPart, string> = {
  lips: "嘴唇",
  upperTeeth: "上齿",
  lowerTeeth: "下齿",
  tongueTip: "舌尖",
  tongueBody: "舌身",
  velum: "软腭",
};
