/**
 * 词汇板块视觉常量 —— 全部取自 docs/vocab-bank/VOCAB_DESIGN_SPEC.md,此处是唯一实现。
 *
 * ⚠️ 两条硬规矩,改之前先回去读 spec:
 *  ① **一屏只允许一处渐变,且只能是主 CTA**。渐变 token 只有 GRAD_CTA 一个,
 *     其它任何地方都用白卡 + 细边。不要为了"好看"再加第二处。
 *  ② 身份色只做**标识**(色条/细边/统计环主色),不做大面积背景填充。
 */

/** 词库身份色。key 对应 vocab_banks.code。 */
export const BANK_COLORS: Record<string, string> = {
  zhongkao: "#EF9F27",
  gaokao: "#E24B4A",
  ket_pet: "#D4537E",
  cet4: "#378ADD",
  cet6: "#185FA5",
  kaoyan: "#534AB7",
  ielts: "#1D9E75",
  toefl: "#0C447C",
  nce: "#D85A30",
  gre: "#5F5E5A",
  gmat: "#3B6D11",
};

/**
 * 场景串记的身份色 —— 它不是词库(不在 vocab_banks 里),所以单列一个常量。
 * ⚠️ 选青色是为了和上面 11 个词库色都拉开距离:场景串记横跨所有词库,
 *    借用任何一个库的颜色都会让用户以为它属于那个库。
 */
export const SCENE_COLOR = "#0E8388";

/** 取身份色;未知 code 回落中性灰(不抛错,新词库上线时页面不该崩)。 */
export function bankColor(code: string | null | undefined): string {
  return BANK_COLORS[String(code || "")] || "#64748B";
}

/**
 * 全屏唯一渐变位:主 CTA。
 * ⚠️ 不要写成 --grad-brand —— 全站现有品牌渐变是紫→品红→珊瑚,
 *    覆盖它会波及所有板块。词汇板块的橙是本板块专属 token。
 */
export const GRAD_CTA = "linear-gradient(135deg, #F5A524 0%, #EF7C1B 55%, #E2600F 100%)";
export const CTA_SHADOW = "0 6px 20px hsl(24 90% 45% / 0.25)";

/**
 * 字体栈。统计数字必须 tabular-nums —— 否则 count-up 过程中数字宽度跳变,整行左右抖。
 * 这两个栈里的首选字体(Manrope / Source Serif 4)未必装得到,
 * 后面的回退项保证没有它们时排版也不塌。
 */
export const FONT_STAT = '"Manrope", "DIN Alternate", "DIN Condensed", ui-sans-serif, system-ui, sans-serif';
export const FONT_SERIF = '"Source Serif 4", "Source Serif Pro", "Fraunces", Georgia, "Songti SC", serif';

/** 统计双视图偏好。默认圆环;读到非法值一律回落 ring。 */
export const STATS_VIEW_KEY = "vocab_stats_view";
export type StatsView = "ring" | "bar";
export function readStatsView(): StatsView {
  try {
    return localStorage.getItem(STATS_VIEW_KEY) === "bar" ? "bar" : "ring";
  } catch {
    return "ring"; // 隐私模式下 localStorage 会抛,不能让它冒到渲染层
  }
}
export function writeStatsView(v: StatsView) {
  try { localStorage.setItem(STATS_VIEW_KEY, v); } catch { /* 存不了就算了,不影响使用 */ }
}

/**
 * 身份色**向白混色**得到的浅色。`toWhite` 0→原色,1→纯白。
 *
 * ⚠️ 要浅色一律用它,**不要用 opacity / 十六进制 alpha**。
 *    身份色多是深色(托福 #0C447C 是深海军蓝),掉透明度之后色相基本没了:
 *    8% 的深蓝叠在暖白底 #FAF7F2 上算出来是 rgb(231,228,229) —— 肉眼就是灰,
 *    "染上了身份色"这件事用户根本看不到。混色则保住色相:同样的浅,一眼能看出是蓝的。
 * ⚠️ 认不出的色值原样返回,不抛错 —— 新词库上线时页面不该因为一个色值崩掉。
 */
export function tintToWhite(hex: string, toWhite: number): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || "").trim());
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const mix = (c: number) => Math.round(c + (255 - c) * toWhite);
  return `rgb(${mix((n >> 16) & 255)}, ${mix((n >> 8) & 255)}, ${mix(n & 255)})`;
}

/**
 * 中心页当前选中的词库(下拉记忆)。存 code 不存 id ——
 * code 稳定、可读,而且万一那个库下线了,回落逻辑按 code 找不到就取第一个可用库。
 */
const SELECTED_BANK_KEY = "vocab_selected_bank";
export function readSelectedBank(): string | null {
  try { return localStorage.getItem(SELECTED_BANK_KEY); } catch { return null; }
}
export function writeSelectedBank(code: string) {
  try { localStorage.setItem(SELECTED_BANK_KEY, code); } catch { /* 隐私模式:记不住就每次默认库 */ }
}

/** 里程碑档位(spec 第 5 节:仅这些点位放 confetti)。PR-6 用,这里先作单一事实来源。 */
export const MILESTONES = [1600, 3500, 4500, 5500, 8000, 10000];
