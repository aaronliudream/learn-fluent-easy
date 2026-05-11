export type SparkMood =
  | "default"
  | "excited"
  | "encouraging"
  | "curious"
  | "celebrating"
  | "thinking";

export const SPARK_MOODS: Record<
  SparkMood,
  { emoji: string; bgClass: string; animClass: string; label: string }
> = {
  default:      { emoji: "🦊",   bgClass: "bg-amber-100  dark:bg-amber-950/40",  animClass: "spark-bob",   label: "default" },
  excited:      { emoji: "🦊✨", bgClass: "bg-yellow-200 dark:bg-yellow-900/40", animClass: "spark-jump",  label: "excited" },
  encouraging:  { emoji: "🦊💪", bgClass: "bg-emerald-100 dark:bg-emerald-950/40", animClass: "spark-pulse", label: "encouraging" },
  curious:      { emoji: "🦊🤔", bgClass: "bg-sky-100   dark:bg-sky-950/40",     animClass: "spark-tilt",  label: "curious" },
  celebrating:  { emoji: "🦊🎉", bgClass: "bg-pink-100  dark:bg-pink-950/40",    animClass: "spark-spin",  label: "celebrating" },
  thinking:     { emoji: "🦊💭", bgClass: "bg-purple-100 dark:bg-purple-950/40", animClass: "spark-bob",   label: "thinking" },
};

/** Time-of-day default greeting (CN). */
export function pickGreetingByTime(now: Date = new Date()): string {
  const h = now.getHours();
  if (h >= 5 && h < 12) return "早上好!今天我们一起冒险吧!";
  if (h >= 12 && h < 14) return "午饭后学一点点,Spark 等你呢~";
  if (h >= 14 && h < 18) return "下午精力满满,来挑战新词!";
  if (h >= 18 && h < 21) return "晚饭后的英语时间,我们出发!";
  return "睡前一节英语,睡得更香哦~";
}