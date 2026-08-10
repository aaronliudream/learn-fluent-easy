/**
 * 计分与结果推导。
 *
 * ═══ 计分口径(为什么这么算)═══════════════════════════════════════
 *
 * ① **反向题翻转**:key=-1 的题作答 x 记为 6-x。翻转后每题都变成
 *    「分数越高越靠 A 极」。
 *
 * ② **POMP 分(Percent Of Maximum Possible)**:原始分落在 [12,60],
 *    换算成 0-100 的百分位置 = (raw-12)/48×100。50 = 正中间。
 *    ⚠️ 这**不是**人群百分位 —— 我们没有中国人群常模,不能假装有。
 *    它只回答「你在这条量表上离中点多远」,页面上也是这么写的。
 *
 * ③ **倾向清晰度 clarity = |POMP-50|×2**(0-100)。MBTI 官方叫
 *    preference clarity index,意思是「这个字母有多站得住」,
 *    而不是「你这个特质有多强」。< 20 的字母基本是抛硬币,必须标出来。
 *
 * ④ **平局规则**:POMP 恰为 50 时判给 I / N / F / P。这跟 MBTI 官方
 *    的平局归属规则一致(归给报告率较低的一极),同时会被 clarity=0 标成
 *    「几乎在正中间」,不会让用户误以为测出了确定结果。
 *
 * ⑤ **作答质量三个探针**(不拦人,只如实告知):
 *    - 直线作答:某个选项占比 ≥ 80%
 *    - 前后不一致:同一量表的正向题均分 与 反向题(翻转后)均分 差距过大 →
 *      要么在乱点,要么有默认赞同倾向,量表分不可信
 *    - 过快:平均每题 < 1.5 秒,来不及读题
 */

import {
  PERSONALITY_ITEMS,
  SCALE_ORDER,
  SCALE_POLES,
  type PersonalityItem,
  type ScaleId,
} from "./items";

export type Answers = Record<string, number>;

export type ScaleResult = {
  scale: ScaleId;
  /** 原始分 12-60(反向题已翻转,越高越靠 A 极) */
  raw: number;
  /** 0-100,50 = 正中间 */
  pomp: number;
  /** 判定出的字母 */
  letter: string;
  /** 另一极的字母 */
  otherLetter: string;
  /** 倾向清晰度 0-100 */
  clarity: number;
  /** clarity < 20 → 这个字母不稳,重测很可能翻面 */
  borderline: boolean;
};

export type BigFiveScore = {
  key: "O" | "C" | "E" | "A" | "N";
  /** 0-100 POMP */
  score: number;
  label: { zh: string; en: string };
  /** 高分端一句话 */
  high: { zh: string; en: string };
  /** 低分端一句话 */
  low: { zh: string; en: string };
};

export type QualityFlags = {
  straightLining: boolean;
  /** 0-4,越大越不一致 */
  inconsistency: number;
  inconsistent: boolean;
  tooFast: boolean;
  /** 平均每题秒数,没记时间则为 null */
  secondsPerItem: number | null;
  any: boolean;
};

export type PersonalityResult = {
  /** 四字母,如 "ESTJ" */
  type: string;
  /** 带情绪后缀,如 "ESTJ-A" */
  code: string;
  scales: Record<ScaleId, ScaleResult>;
  bigFive: BigFiveScore[];
  /** 荣格功能序(由四字母按标准规则推出,非另行测量) */
  functionStack: string[];
  quality: QualityFlags;
  answeredCount: number;
  completedAt: number;
};

const ITEM_BY_ID = new Map(PERSONALITY_ITEMS.map((i) => [i.id, i]));

/** 反向题翻转后的得分(1-5)。 */
export function keyedValue(item: PersonalityItem, value: number): number {
  return item.key === 1 ? value : 6 - value;
}

function itemsOf(scale: ScaleId): PersonalityItem[] {
  return PERSONALITY_ITEMS.filter((i) => i.scale === scale);
}

/** 未作答的题按中点 3 计入,保证部分作答也能出分(页面上要求答满才给结果)。 */
function scoreScale(scale: ScaleId, answers: Answers): ScaleResult {
  const items = itemsOf(scale);
  let raw = 0;
  for (const item of items) {
    const v = answers[item.id];
    raw += keyedValue(item, typeof v === "number" ? v : 3);
  }
  const n = items.length;
  const pomp = ((raw - n) / (4 * n)) * 100;
  const poles = SCALE_POLES[scale];
  // 平局(pomp === 50)归 B 极 —— 见文件头 ④
  const isA = pomp > 50;
  return {
    scale,
    raw,
    pomp,
    letter: isA ? poles.a : poles.b,
    otherLetter: isA ? poles.b : poles.a,
    clarity: Math.abs(pomp - 50) * 2,
    borderline: Math.abs(pomp - 50) * 2 < 20,
  };
}

/**
 * 荣格功能序 —— 由四字母按标准规则推出(不是另测的)。
 * 规则:J 型的判断功能(T/F)朝外,P 型的知觉功能(S/N)朝外;
 * E 型主导功能 = 朝外那个,I 型主导功能 = 朝内那个;
 * 第三功能 = 辅助功能的对立功能 + 与辅助相反的态度;
 * 劣势功能 = 主导功能的对立功能 + 相反态度。
 * 例:ESTJ → Te-Si-Ne-Fi;INFP → Fi-Ne-Si-Te。
 */
export function functionStackOf(type: string): string[] {
  const [e, sn, tf, jp] = [type[0], type[1], type[2], type[3]];
  const judging = tf; // T / F
  const perceiving = sn; // S / N
  const opposite: Record<string, string> = { T: "F", F: "T", S: "N", N: "S" };

  // 哪个功能朝外
  const extravertedFn = jp === "J" ? judging : perceiving;
  const introvertedFn = jp === "J" ? perceiving : judging;

  const dominantFn = e === "E" ? extravertedFn : introvertedFn;
  const dominantAtt = e === "E" ? "e" : "i";
  const auxiliaryFn = e === "E" ? introvertedFn : extravertedFn;
  const auxiliaryAtt = e === "E" ? "i" : "e";

  const tertiaryFn = opposite[auxiliaryFn];
  const tertiaryAtt = auxiliaryAtt === "i" ? "e" : "i";
  const inferiorFn = opposite[dominantFn];
  const inferiorAtt = dominantAtt === "e" ? "i" : "e";

  return [
    dominantFn + dominantAtt,
    auxiliaryFn + auxiliaryAtt,
    tertiaryFn + tertiaryAtt,
    inferiorFn + inferiorAtt,
  ];
}

const BIG_FIVE_META: Record<
  BigFiveScore["key"],
  { label: { zh: string; en: string }; high: { zh: string; en: string }; low: { zh: string; en: string } }
> = {
  O: {
    label: { zh: "开放性 Openness", en: "Openness to experience" },
    high: { zh: "爱想象、爱新点子、乐意琢磨抽象的东西", en: "Imaginative, idea-driven, at ease with abstraction" },
    low: { zh: "务实、看重经验、喜欢确定和熟悉的做法", en: "Practical, experience-led, prefers the tried and familiar" },
  },
  C: {
    label: { zh: "尽责性 Conscientiousness", en: "Conscientiousness" },
    high: { zh: "有计划、守时、把事情做完", en: "Organized, punctual, finishes what they start" },
    low: { zh: "灵活随性、临场发挥、不爱被计划绑住", en: "Flexible and spontaneous, dislikes being boxed in by plans" },
  },
  E: {
    label: { zh: "外向性 Extraversion", en: "Extraversion" },
    high: { zh: "主动social、人多时更来劲", en: "Outgoing; energized by people" },
    low: { zh: "安静、独处充电、偏好深交", en: "Quiet; recharges alone; prefers depth over breadth" },
  },
  A: {
    label: { zh: "宜人性 Agreeableness", en: "Agreeableness" },
    high: { zh: "共情、体贴、以和为贵", en: "Empathetic, considerate, harmony-seeking" },
    low: { zh: "直率、就事论事、敢说不中听的话", en: "Blunt, task-focused, willing to say the unwelcome thing" },
  },
  N: {
    label: { zh: "神经质 Neuroticism", en: "Neuroticism" },
    high: { zh: "情绪反应强、容易担心、对负面信号敏感", en: "Emotionally reactive; worries; sensitive to negative signals" },
    low: { zh: "情绪平稳、抗压、不容易被小事牵动", en: "Even-keeled, stress-resilient, not easily rattled" },
  },
};

/**
 * 四维 + AT 换算成五因素。
 *
 * ⚠️ 这不是「硬套」:本测的题目主体本来就是 IPIP 的五因素标记词,
 * 只是按荣格四维重新分组呈现。MBTI 与五因素的对应关系
 * (McCrae & Costa, 1989 等多次重复验证)也正好是:
 * E-I↔外向性、S-N↔开放性、T-F↔宜人性、J-P↔尽责性。
 * 唯独神经质在 MBTI 里没有对应维度 —— 那正是本测单列 AT 的原因。
 */
function toBigFive(scales: Record<ScaleId, ScaleResult>): BigFiveScore[] {
  const rows: { key: BigFiveScore["key"]; score: number }[] = [
    { key: "O", score: 100 - scales.SN.pomp }, // 直觉端 = 高开放性
    { key: "C", score: scales.JP.pomp }, // 判断端 = 高尽责性
    { key: "E", score: scales.EI.pomp }, // 外向端 = 高外向性
    { key: "A", score: 100 - scales.TF.pomp }, // 情感端 = 高宜人性
    { key: "N", score: 100 - scales.AT.pomp }, // 起伏端 = 高神经质
  ];
  return rows.map((r) => ({ ...r, ...BIG_FIVE_META[r.key] }));
}

function assessQuality(answers: Answers, elapsedMs: number | null): QualityFlags {
  const values = Object.values(answers).filter((v) => typeof v === "number");
  const n = values.length;

  // ① 直线作答
  const counts = new Map<number, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  const maxShare = n ? Math.max(...counts.values()) / n : 0;
  const straightLining = n >= 20 && maxShare >= 0.8;

  // ② 正向/反向两半的一致性
  let diffSum = 0;
  for (const scale of SCALE_ORDER) {
    const items = itemsOf(scale);
    const pos = items.filter((i) => i.key === 1);
    const neg = items.filter((i) => i.key === -1);
    const mean = (list: PersonalityItem[]) => {
      const vals = list.map((i) => (typeof answers[i.id] === "number" ? keyedValue(i, answers[i.id]) : 3));
      return vals.reduce((a, b) => a + b, 0) / (vals.length || 1);
    };
    diffSum += Math.abs(mean(pos) - mean(neg));
  }
  const inconsistency = diffSum / SCALE_ORDER.length;

  // ③ 速度
  const secondsPerItem = elapsedMs && n ? elapsedMs / 1000 / n : null;

  const inconsistent = inconsistency > 1.2;
  const tooFast = secondsPerItem !== null && secondsPerItem < 1.5;
  return {
    straightLining,
    inconsistency,
    inconsistent,
    tooFast,
    secondsPerItem,
    any: straightLining || inconsistent || tooFast,
  };
}

export function scoreAll(answers: Answers, elapsedMs: number | null = null): PersonalityResult {
  const scales = {
    EI: scoreScale("EI", answers),
    SN: scoreScale("SN", answers),
    TF: scoreScale("TF", answers),
    JP: scoreScale("JP", answers),
    AT: scoreScale("AT", answers),
  } satisfies Record<ScaleId, ScaleResult>;

  const type = scales.EI.letter + scales.SN.letter + scales.TF.letter + scales.JP.letter;
  return {
    type,
    code: `${type}-${scales.AT.letter}`,
    scales,
    bigFive: toBigFive(scales),
    functionStack: functionStackOf(type),
    quality: assessQuality(answers, elapsedMs),
    answeredCount: Object.keys(answers).filter((k) => ITEM_BY_ID.has(k)).length,
    completedAt: Date.now(),
  };
}

/** 清晰度分档,用于结果页文案。 */
export function clarityBand(clarity: number): { zh: string; en: string } {
  if (clarity < 20) return { zh: "几乎在正中间", en: "Right in the middle" };
  if (clarity < 45) return { zh: "略微倾向", en: "Slight preference" };
  if (clarity < 70) return { zh: "明显倾向", en: "Clear preference" };
  return { zh: "非常明确", en: "Very clear preference" };
}

/** 五因素分档,用于 Big Five 面板。 */
export function scoreBand(score: number): { zh: string; en: string } {
  if (score < 20) return { zh: "很低", en: "Very low" };
  if (score < 40) return { zh: "偏低", en: "Low" };
  if (score < 60) return { zh: "中等", en: "Average" };
  if (score < 80) return { zh: "偏高", en: "High" };
  return { zh: "很高", en: "Very high" };
}

export const TOTAL_ITEMS = PERSONALITY_ITEMS.length;
