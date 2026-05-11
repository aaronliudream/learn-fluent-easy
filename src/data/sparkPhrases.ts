export const SPARK_PHRASES = {
  correct: [
    "太棒了!",
    "你真聪明!",
    "我就知道你可以!",
    "完美!",
    "Spark 给你点赞!👍",
  ],
  wrong: [
    "再听一次!",
    "差一点点!",
    "我们一起想想?",
    "提示:再看一次…",
    "下次会更好!",
  ],
  stageComplete: [
    "好棒,这关过啦!",
    "继续加油!",
    "下一关等着你!",
    "你今天状态超好!",
    "✨ Excellent!",
  ],
  lessonComplete: [
    "你又集到 1 个齿轮!🎁",
    "Spark 火箭离起飞更近了!",
    "你真是 Spark 的好伙伴!",
    "再来一节?你今天很厉害!",
    "🌟 完美完成今天的探险!",
  ],
} as const;

export function pickPhrase(type: keyof typeof SPARK_PHRASES): string {
  const phrases = SPARK_PHRASES[type];
  return phrases[Math.floor(Math.random() * phrases.length)];
}