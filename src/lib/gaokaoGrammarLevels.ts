/**
 * Shared 5-level grammar mastery config (高中 / 初中共用逻辑).
 * Level 1 选择题 → 5 造句/写作；过关：≥minQ 题且正确率 ≥ threshold。
 */

export type GaokaoGrammarLevelKey =
  | "mcq"
  | "fill"
  | "correction"
  | "transform"
  | "translation";

export type GaokaoLevelConfig = {
  id: number;
  key: GaokaoGrammarLevelKey;
  name: string;
  emoji: string;
  skillFocusCn: string;
  minQ: number;
  maxQ: number;
  threshold: number;
};

/** User spec: ≥4 questions, ≥75% to pass levels 1–4; level 5 may require full accuracy. */
export const GAOKAO_GRAMMAR_LEVELS: GaokaoLevelConfig[] = [
  {
    id: 1,
    key: "mcq",
    name: "选择题",
    emoji: "🎯",
    skillFocusCn: "识别 · 选出符合教材例句的语法形式",
    minQ: 4,
    maxQ: 8,
    threshold: 0.75,
  },
  {
    id: 2,
    key: "fill",
    name: "填空题",
    emoji: "✏️",
    skillFocusCn: "回忆 · 补全教材中的关键词",
    minQ: 4,
    maxQ: 8,
    threshold: 0.75,
  },
  {
    id: 3,
    key: "correction",
    name: "改错题",
    emoji: "🔧",
    skillFocusCn: "纠错 · 改正句中语法错误",
    minQ: 4,
    maxQ: 6,
    threshold: 0.75,
  },
  {
    id: 4,
    key: "transform",
    name: "句型转换",
    emoji: "🔄",
    skillFocusCn: "转换 · 按提示改写句子",
    minQ: 4,
    maxQ: 6,
    threshold: 0.75,
  },
  {
    id: 5,
    key: "translation",
    name: "造句 / 写作",
    emoji: "✍️",
    skillFocusCn: "产出 · 根据中文写出完整英文句",
    minQ: 4,
    maxQ: 6,
    threshold: 0.75,
  },
];
