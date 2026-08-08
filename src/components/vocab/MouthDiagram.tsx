/**
 * 口腔侧剖图 —— 音标卡的主视觉。
 *
 * ⚠️ **唯一判据**:没学过音标的人看一眼,能说出"舌头放在哪"。
 *    所以是示意图不是解剖图 —— 该夸张的一定要夸张(/θ/ 的舌尖必须**明显探出齿外**)。
 *
 * ⚠️ 第一版画砸过,教训记在这里,重画时别再犯:
 *    ① **图必须占满一行**。挤在音标大字旁边只有一半宽度时,
 *       所有结构糊成一团,红色舌头看着像一支箭。
 *    ② **必须先有一个读得出的"口腔"**:上颌(硬腭+上齿+上唇)和
 *       下颌(口底+下齿+下唇)要围出一个明确的腔体,舌头才有"放在里面"的参照。
 *       只画几条线加一坨红色,看的人不知道那是嘴。
 *    ③ 舌头要**从后往前**长成舌形(舌根粗、舌尖细),并且**连在口底上**;
 *       悬空的色块不像舌头。
 *    ④ 关键部位除了变色,还要**引一条线标出名字** —— 颜色对没学过的人没有含义。
 *
 * ⚠️ 48 个音**共用这张底图,只换舌形 + 高亮部位**。新增音只写 `tongue` 和 `highlight`,
 *    不要另画底图 —— 底图一变,48 张图之间就没法互相对照,而对照正是学音标的关键动作。
 *
 * 朝向:**面朝右**,右侧是嘴唇开口,左侧是喉咙。坐标系 220×180。
 * 口腔开口(上下齿之间的缝)在 x≈168-196、y≈80-92 一带。
 */
import { cn } from "@/lib/utils";

export type MouthPart = "lips" | "upperTeeth" | "lowerTeeth" | "tongueTip" | "tongueBody" | "velum";

export type MouthConfig = {
  /** 舌头形状(SVG path,坐标系 220×180)。舌根在左、舌尖在右。 */
  tongue: string;
  highlight: MouthPart[];
  airflow?: "mouth" | "nose" | null;
  voiced?: boolean;
  /** 接触点:舌尖真的顶上去的位置,画一个虚线圈 */
  contactAt?: { x: number; y: number } | null;
  /** 引线标注:指着关键部位写字,颜色之外再给一层解释 */
  callout?: { x: number; y: number; tx: number; ty: number; text: string };
};

const ACCENT = "#E24B4A";
const INK = "#475569";
const SOFT = "#CBD5E1";

export default function MouthDiagram({ config, className }: { config: MouthConfig; className?: string }) {
  const on = (p: MouthPart) => config.highlight.includes(p);
  const tongueHot = on("tongueTip") || on("tongueBody");

  return (
    <svg viewBox="0 0 220 180" className={cn("w-full", className)} role="img"
      aria-label="口腔侧剖示意图:显示发这个音时舌头、牙齿和嘴唇的位置">
      {/* 鼻腔(浅灰,只作方位参照) */}
      <path d="M52 26 Q120 14 196 30 L196 42 Q120 28 58 42 Z" fill="#F8FAFC" stroke={SOFT} strokeWidth="1.5" />
      <text x="96" y="24" fontSize="9" fill="#94A3B8">鼻腔</text>

      {/* ── 上颌:硬腭 → 上齿 → 上唇 ── */}
      <path d="M46 62 Q110 44 164 64 L164 80 L196 74 Q206 66 196 58 L172 52 Q110 34 46 52 Z"
        fill="#FEF2F2" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      {/* 软腭(口腔顶的后半段,可抬起挡鼻腔) */}
      <path d="M46 62 Q38 74 42 92" fill="none"
        stroke={on("velum") ? ACCENT : INK} strokeWidth={on("velum") ? 4 : 2} strokeLinecap="round" />

      {/* ── 下颌:口底 → 下齿 → 下唇 ── */}
      <path d="M46 150 Q110 166 168 140 L168 96 L196 100 Q208 108 196 118 L176 130 Q110 150 46 138 Z"
        fill="#FEF2F2" stroke={INK} strokeWidth="2" strokeLinejoin="round" />

      {/* 上齿 / 下齿:画成看得见的小方块,不是细线 */}
      <rect x="160" y="64" width="9" height="17" rx="2"
        fill={on("upperTeeth") ? ACCENT : "#fff"} stroke={on("upperTeeth") ? ACCENT : INK}
        strokeWidth={on("upperTeeth") ? 3 : 2} />
      <rect x="160" y="93" width="9" height="17" rx="2"
        fill={on("lowerTeeth") ? ACCENT : "#fff"} stroke={on("lowerTeeth") ? ACCENT : INK}
        strokeWidth={on("lowerTeeth") ? 3 : 2} />

      {/* 上唇 / 下唇 */}
      <path d="M196 58 Q210 66 196 74" fill="none"
        stroke={on("lips") ? ACCENT : INK} strokeWidth={on("lips") ? 4 : 2.5} strokeLinecap="round" />
      <path d="M196 100 Q210 109 196 118" fill="none"
        stroke={on("lips") ? ACCENT : INK} strokeWidth={on("lips") ? 4 : 2.5} strokeLinecap="round" />

      {/* 咽腔 */}
      <path d="M42 92 L40 140" fill="none" stroke={SOFT} strokeWidth="2" strokeLinecap="round" />

      {/* ── 舌头:每个音只换这一条 path。舌根在左连着口底,舌尖朝右 ── */}
      <path d={config.tongue}
        fill={tongueHot ? "#F87171" : "#E2E8F0"}
        stroke={tongueHot ? ACCENT : INK}
        strokeWidth={tongueHot ? 3 : 2} strokeLinejoin="round" />

      {/* 接触点:告诉学习者"这里真的顶上去了" */}
      {config.contactAt && (
        <circle cx={config.contactAt.x} cy={config.contactAt.y} r="7"
          fill="none" stroke={ACCENT} strokeWidth="2.5" strokeDasharray="4 3" />
      )}

      {/* 引线标注:颜色之外再写清是哪个部位 */}
      {config.callout && (
        <>
          <line x1={config.callout.x} y1={config.callout.y} x2={config.callout.tx} y2={config.callout.ty}
            stroke={ACCENT} strokeWidth="1.5" strokeDasharray="3 2" />
          <circle cx={config.callout.x} cy={config.callout.y} r="2.5" fill={ACCENT} />
          <text x={config.callout.tx} y={config.callout.ty - 4} fontSize="11" fontWeight="700" fill={ACCENT}
            textAnchor={config.callout.tx > 150 ? "end" : "start"}>
            {config.callout.text}
          </text>
        </>
      )}

      {/* 气流 */}
      {config.airflow === "mouth" && (
        <>
          {/* ⚠️ 气流标签放到嘴外下方,别写在齿缝旁边 —— 那一带已经有牙齿、舌尖和接触圈,
                 文字压上去会把最该看清的部位糊掉(第一版就是这么撞的)。 */}
          <path d="M200 88 L216 88" fill="none" stroke="#0EA5E9" strokeWidth="2.5"
            strokeLinecap="round" markerEnd="url(#mdArrow)" />
          <text x="216" y="72" fontSize="10" fill="#0EA5E9" textAnchor="end">气流</text>
        </>
      )}

      {/* 声带振动(浊音) */}
      {config.voiced && (
        <>
          <path d="M20 118 q5 -6 10 0 q5 6 10 0" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" />
          <path d="M20 128 q5 -6 10 0 q5 6 10 0" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" />
          <text x="6" y="146" fontSize="10" fill="#16A34A">声带振动</text>
        </>
      )}

      <defs>
        <marker id="mdArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="#0EA5E9" />
        </marker>
      </defs>
    </svg>
  );
}

/* ── 8 个最易错音的舌位 ────────────────────────────────────────
 * 中性舌(其余音的参照):舌根 (50,140) → 舌背隆起 → 舌尖 (150,104)
 *   M50 142 C64 118 100 108 146 104 C158 103 160 112 150 118 C110 126 70 134 52 150 Z
 */

const NEUTRAL = "M50 142 C64 118 100 108 146 104 C158 103 160 112 150 118 C110 126 70 134 52 150 Z";

export const MOUTH: Record<string, MouthConfig> = {
  /** /θ/ 舌尖**探出齿缝**:必须画到明显越过牙齿右边,否则和 /s/ 看着一样 */
  "θ": {
    tongue: "M50 142 C64 118 100 106 150 96 L192 84 L195 93 L156 110 C110 122 70 134 52 150 Z",
    highlight: ["tongueTip", "upperTeeth", "lowerTeeth"],
    airflow: "mouth",
    contactAt: { x: 184, y: 88 },
    callout: { x: 186, y: 88, tx: 150, ty: 42, text: "舌尖伸出齿间" },
  },
  /** /ð/ 舌位与 /θ/ 相同,区别只在声带振动 */
  "ð": {
    tongue: "M50 142 C64 118 100 106 150 96 L192 84 L195 93 L156 110 C110 122 70 134 52 150 Z",
    highlight: ["tongueTip", "upperTeeth", "lowerTeeth"],
    airflow: "mouth", voiced: true,
    contactAt: { x: 184, y: 88 },
    callout: { x: 186, y: 88, tx: 150, ty: 42, text: "舌位同 /θ/,但要出声" },
  },
  /** /r/ 舌尖**后卷且不碰上腭** —— 不接触是关键,所以不画接触圈 */
  "r": {
    tongue: "M50 142 C64 118 96 110 132 100 C150 94 152 78 142 74 C132 74 134 90 124 100 C104 114 70 132 52 150 Z",
    highlight: ["tongueTip", "lips"],
    airflow: "mouth", voiced: true, contactAt: null,
    callout: { x: 143, y: 78, tx: 108, ty: 40, text: "舌尖后卷·不碰上腭" },
  },
  /** /l/ 舌尖**抵住上齿龈** —— 接触圈画出来,与 /r/ 的"不碰"正好对照 */
  "l": {
    tongue: "M50 142 C64 118 100 106 148 88 L160 78 L166 86 L156 100 C112 118 70 134 52 150 Z",
    highlight: ["tongueTip"],
    airflow: null, voiced: true,
    contactAt: { x: 160, y: 82 },
    callout: { x: 160, y: 82, tx: 120, ty: 40, text: "舌尖顶住上齿龈" },
  },
  /** /v/ 上齿咬下唇,舌头不参与 —— 舌头保持中性灰 */
  "v": {
    tongue: NEUTRAL,
    highlight: ["upperTeeth", "lips"],
    airflow: "mouth", voiced: true,
    contactAt: { x: 176, y: 96 },
    callout: { x: 176, y: 96, tx: 214, ty: 140, text: "上齿咬下唇" },
  },
  /** /w/ 双唇**收圆突出**,舌后部抬高 */
  "w": {
    tongue: "M50 130 C70 106 96 100 118 104 C140 108 152 114 150 120 C120 130 74 138 52 150 Z",
    highlight: ["lips", "tongueBody"],
    airflow: "mouth", voiced: true, contactAt: null,
    callout: { x: 202, y: 88, tx: 214, ty: 150, text: "双唇收圆前突" },
  },
  /** /æ/ 下巴下压、舌前部低平 */
  "æ": {
    tongue: "M50 146 C70 134 110 128 152 126 C162 126 164 134 152 140 C112 146 70 150 52 154 Z",
    highlight: ["tongueBody", "lowerTeeth"],
    airflow: "mouth", voiced: true, contactAt: null,
    callout: { x: 110, y: 132, tx: 74, ty: 44, text: "下巴压低·舌前低平" },
  },
  /** /ʌ/ 舌位居中放松 —— 就是那条中性舌,作为其它音的参照 */
  "ʌ": {
    tongue: NEUTRAL,
    highlight: ["tongueBody"],
    airflow: "mouth", voiced: true, contactAt: null,
    callout: { x: 104, y: 114, tx: 70, ty: 46, text: "舌位居中·短促" },
  },
};

export const PART_LABEL: Record<MouthPart, string> = {
  lips: "嘴唇", upperTeeth: "上齿", lowerTeeth: "下齿",
  tongueTip: "舌尖", tongueBody: "舌身", velum: "软腭",
};
