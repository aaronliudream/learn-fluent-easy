// Phase 4 — Spark voice constants.
// Single source of truth for child-facing copy in primary pages so we
// can keep Spark's tone consistent and tune it without grepping the codebase.
//
// Rule: every CTA/label that the child reads should sound like Spark
// said it, not like the app talking to the child.

export const SPARK_VOICE = {
  // CTAs
  todayAdventure: "陪 Spark 出发",
  tenWordChallenge: "Spark 想考考你这 10 个词",
  retryShort: "Spark 在为你加油,再来一次?",
  retryMid: "再陪 Spark 试一次?",
  startLesson: "和 Spark 一起开始这节课",

  // Result messages — paired with score tier
  resultPerfect: "🌟 你太厉害啦,Spark 都跳起来了!",
  resultGood: "👍 不错哦,Spark 在为你鼓掌!",
  resultRetry: "💪 没事,陪 Spark 再来一次!",

  // Loading / waiting
  preparing: "Spark 正在准备今天的冒险…",
} as const;

/** Pick the right result line by accuracy %. */
export function sparkResultLine(pct: number): string {
  if (pct >= 90) return SPARK_VOICE.resultPerfect;
  if (pct >= 70) return SPARK_VOICE.resultGood;
  return SPARK_VOICE.resultRetry;
}