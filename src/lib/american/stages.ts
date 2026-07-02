/**
 * 美语课程 · 10 关元数据(顺序/名称固定,见 docs/american/美语课程_关卡结构_v1.1.md)。
 * 课文关(1)是本期核心已实现;2–10 组件后续按序落地。
 */
export type AmericanStageDef = {
  stage: number;
  label: string;
  emoji: string;
  /** 已实现交互组件?false = 内容就绪、组件制作中(占位)。 */
  ready: boolean;
};

export const AMERICAN_STAGES: AmericanStageDef[] = [
  { stage: 1, label: "课文学习", emoji: "📖", ready: true },
  { stage: 2, label: "核心词汇", emoji: "🔤", ready: false },
  { stage: 3, label: "听音辨词", emoji: "👂", ready: false },
  { stage: 4, label: "词义配对", emoji: "🃏", ready: false },
  { stage: 5, label: "语法专项", emoji: "🧩", ready: false },
  { stage: 6, label: "美语点睛", emoji: "🇺🇸", ready: false },
  { stage: 7, label: "对话填空", emoji: "✏️", ready: false },
  { stage: 8, label: "听对话答题", emoji: "🎧", ready: false },
  { stage: 9, label: "情景应答", emoji: "💬", ready: false },
  { stage: 10, label: "本课通关", emoji: "🏆", ready: false },
];

export function stageDef(stage: number): AmericanStageDef | undefined {
  return AMERICAN_STAGES.find((s) => s.stage === stage);
}
