// Phase 3 — In-process Spark feedback.
// Every answer in a primary module should make Spark visibly react,
// and occasional wrong answers should trigger a first-person Spark
// pep-talk so the child never feels alone.
//
// Why a wrapper, not a direct petReact call: we want one place to
// tune frequency / copy without touching every quiz screen.

import { toast } from "sonner";
import { petReact, notifyWrong } from "@/lib/coins";

const WRONG_LINES = [
  "没事!Spark 也在学呢,我们再来一次?",
  "差一点点~ 我陪你再试,好不好?",
  "我在你身边,慢慢来,不着急!",
  "答错了我也喜欢你,继续陪我学吧!",
  "Spark 觉得你已经很棒啦,再来一题?",
];
const CORRECT_LINES = [
  "你答对啦,我都为你跳起来了!",
  "好厉害!Spark 又学到一点啦~",
  "和你一起学好开心呀!",
];

function pick<T>(xs: T[]): T {
  return xs[Math.floor(Math.random() * xs.length)];
}

/**
 * Call when the child answers correctly.
 * Always fires the floating reaction; occasionally surfaces a Spark line.
 */
export function sparkOnCorrect(streak = 0) {
  petReact("correct", { coins: 0 });
  // Long streak deserves a verbal cheer — ~ every 5th right in a row.
  if (streak > 0 && streak % 5 === 0) {
    toast(`🦊 ${pick(CORRECT_LINES)}`, { duration: 1600 });
  }
}

/**
 * Call when the child answers wrong.
 * Always fires the wrong reaction; ~1/3 of the time also pops a
 * first-person pep-talk so the moment doesn't feel punitive.
 */
export function sparkOnWrong() {
  notifyWrong();
  if (Math.random() < 0.34) {
    toast(`🦊 ${pick(WRONG_LINES)}`, { duration: 2200 });
  }
}

/** Convenience for graders that already compute a boolean. */
export function sparkOnAnswer(isCorrect: boolean, streak = 0) {
  if (isCorrect) sparkOnCorrect(streak);
  else sparkOnWrong();
}