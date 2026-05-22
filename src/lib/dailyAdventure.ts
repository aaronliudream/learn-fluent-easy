import { primaryReadingEntryPath } from "@/lib/primaryGrade";

// Daily Adventure — Phase 2 of the Spark world realignment.
//
// What this is: a small, deterministic "today's plan" the child runs
// through in one sitting. We do NOT add new content; we string the
// 4 strongest existing engines into one Spark-narrated flow.
//
// Why so small: shipping a single linear path is the whole point.
// Anything fancier would re-create the menu maze we just deleted.

export type AdventureStepKind = "phonics" | "vocab" | "lesson" | "culture" | "roleplay" | "listening" | "reading" | "game";

export type AdventureStep = {
  kind: AdventureStepKind;
  emoji: string;
  title: string;     // child-facing title
  sparkLine: string; // first-person Spark voice
  cta: string;       // button text
  to: string;        // route to launch
  estMinutes: number;
  /** G2 占位:该模块尚未接入,渲染时显示「准备中」+ G1 回退入口 */
  placeholder?: boolean;
  /** placeholder 时的 G1 回退路径 */
  fallbackTo?: string;
  /** placeholder 时的 G1 回退提示 */
  fallbackLabel?: string;
};

/** Build today's 4-step plan. Pure function — same input, same output today. */
export function buildDailyAdventure(opts: {
  grade: number;
  nextLessonId?: string | null;
  /** 已掌握的 Sight Word 数(用于解锁单词游戏冷启动门控) */
  sightWordsMasteredCount?: number;
}): AdventureStep[] {
  const { grade, nextLessonId, sightWordsMasteredCount = 0 } = opts;
  const gradeQ = grade === 2 ? "?grade=2" : "";

  const steps: AdventureStep[] = [];

  // Step 1 — Spark teaches phonics (NEW).
  steps.push({
    kind: "phonics",
    emoji: "🔤",
    title: grade === 2 ? "和 Spark 学 G2 新音" : "和 Spark 学字母",
    sparkLine: "今天 Spark 想教你一个新字母,我们一起读!",
    cta: "和 Spark 读字母",
    to: `/primary/phonics${gradeQ}`,
    estMinutes: 3,
  });

  // Step 2 — Read words together with Spark.
  steps.push({
    kind: "vocab",
    emoji: "🗣",
    title: "和 Spark 读单词",
    sparkLine: "我想跟你读几个单词,大声读给 Spark 听!",
    cta: "和 Spark 读单词",
    to: `/primary/vocab/${grade}`,
    estMinutes: 3,
  });

  // Step 3 — rotates by day-of-week for Grade 1 so 29 lessons last 60+ days
  // and the new 20 Roleplay scenes get woven into the main path.
  // G2 也轮换,但未接入的模块走 placeholder + G1 fallback。
  const third = getThirdStepContent(grade, new Date(), nextLessonId);
  if (third) steps.push(third);

  // Step 4 — Word Quest 单词奇旅(MVP:仅 G1/G2 接入,基于 Sight Words mastery)
  if (grade === 1 || grade === 2) {
    // 按星期轮换:Tue/Thu/Sat = Word Rush(节奏);其它天 = Word Quest(奇旅)。
    // Rush 门槛 8 词,Quest 门槛 6 词。
    const dow = new Date().getDay(); // 0=Sun..6=Sat
    const isRushDay = dow === 2 || dow === 4 || dow === 6;
    const game = isRushDay ? "rush" : "quest";
    const need = isRushDay ? 8 : 6;
    const ready = sightWordsMasteredCount >= need;
    if (game === "rush") {
      steps.push(
        ready
          ? {
              kind: "game",
              emoji: "⚡",
              title: "和 Spark 玩节奏游戏",
              sparkLine: "今天来 45 秒单词节奏挑战!",
              cta: "开始单词节奏",
              to: `/primary/word-rush?grade=${grade}`,
              estMinutes: 4,
            }
          : {
              kind: "game",
              emoji: "⚡",
              title: "节奏游戏准备中",
              sparkLine: `再学几个单词就能玩节奏啦!现在 ${sightWordsMasteredCount}/${need}`,
              cta: "去学单词",
              to: `/primary/sight-words${gradeQ}`,
              estMinutes: 4,
              placeholder: true,
              fallbackTo: `/primary/sight-words${gradeQ}`,
              fallbackLabel: "先去学几个单词",
            }
      );
    } else {
      steps.push(
        ready
          ? {
              kind: "game",
              emoji: "🎮",
              title: "和 Spark 玩单词游戏",
              sparkLine: "今天我们玩单词奇旅吧,只要 4 分钟!",
              cta: "开始单词奇旅",
              to: `/primary/word-quest?grade=${grade}`,
              estMinutes: 4,
            }
          : {
              kind: "game",
              emoji: "🎮",
              title: "单词游戏准备中",
              sparkLine: `再学几个单词就能玩游戏啦!现在 ${sightWordsMasteredCount}/${need}`,
              cta: "去学单词",
              to: `/primary/sight-words${gradeQ}`,
              estMinutes: 4,
              placeholder: true,
              fallbackTo: `/primary/sight-words${gradeQ}`,
              fallbackLabel: "先去学几个单词",
            }
      );
    }
  }

  // Step 5 — Culture stamp / pet visit (light wind-down).
  steps.push({
    kind: "culture",
    emoji: "🌍",
    title: "Spark 的小发现",
    sparkLine: "学完别走~ 跟 Spark 看看今天的新鲜事吧!",
    cta: "看看新鲜事",
    to: `/primary/culture/${grade}`,
    estMinutes: 2,
  });

  return steps;
}

/** Day-of-week rotation for Grade 1's Step 3.
 *  Mon/Thu = Lesson, Tue/Fri = Roleplay, Wed/Sun = Listening, Sat = Reading. */
function getThirdStepContent(
  grade: number,
  date: Date,
  nextLessonId?: string | null
): AdventureStep | null {
  // G1/G2 已下线 — isG2 永远为 false。保留命名仅为兼容下方分支。
  const isG2 = false;
  const gradeQ = "";
  const lessonStep: AdventureStep | null = nextLessonId
    ? {
        kind: "lesson",
        emoji: "📚",
        title: "今天的一节课",
        sparkLine: "我准备好啦,我们开始今天这节课吧!",
        cta: "开始今天这节课",
        to: `/primary/lesson/${nextLessonId}`,
        estMinutes: 8,
      }
    : null;

  const roleplayStep: AdventureStep = {
    kind: "roleplay",
    emoji: "🎭",
    title: "和 Spark 演一段",
    sparkLine: "今天我们演个小故事吧,说说生活里的话!",
    cta: "去演一段",
    to: `/primary/roleplays${gradeQ}`,
    estMinutes: 5,
  };

  const listeningStep: AdventureStep = {
    kind: "listening",
    emoji: "🎧",
    title: isG2 ? "听 G2 新对话" : "听 Spark 聊天",
    sparkLine: "今天 Spark 要和小伙伴聊天啦,你来听听!",
    cta: "和 Spark 听聊天",
    to: `/primary/listening${gradeQ}`,
    estMinutes: 5,
  };

  const readingStep: AdventureStep = {
    kind: "reading",
    emoji: "📖",
    title: "和 Spark 读绘本",
    sparkLine: "今天 Spark 想和你一起读一本小绘本!",
    cta: "去读绘本",
    to: primaryReadingEntryPath(grade),
    estMinutes: 4,
  };

  // G1/G2 已下线，原 g2LessonStep 与 isG2 分支整体移除。
  const dow = date.getDay(); // 0=Sun ... 6=Sat

  // Sat(6) → Reading (storybooks)
  if (dow === 6) return readingStep;
  // Wed(3), Sun(0) → Listening
  if (dow === 0 || dow === 3) return listeningStep;
  // Tue(2), Fri(5) → Roleplay
  if (dow === 2 || dow === 5) return roleplayStep;
  // Mon(1), Thu(4) → Lesson; fall back to roleplay if no lesson yet
  return lessonStep ?? roleplayStep;
}

// ─── Per-day completion bookkeeping (localStorage) ────────────────────
// We mark a step "done" when the child taps "我做完了 ✓" after returning.
// Honest > magical: we never auto-complete a step the child didn't confirm.

function dayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function storageKey(): string {
  return `spark.adventure.${dayKey()}`;
}

export function loadAdventureProgress(): Record<string, true> {
  try {
    const raw = localStorage.getItem(storageKey());
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function markStepDone(kind: AdventureStepKind) {
  try {
    const cur = loadAdventureProgress();
    cur[kind] = true;
    localStorage.setItem(storageKey(), JSON.stringify(cur));
  } catch { /* noop */ }
}

export function isAdventureComplete(steps: AdventureStep[]): boolean {
  const p = loadAdventureProgress();
  return steps.every((s) => p[s.kind]);
}

const CELEBRATED_KEY = "spark.adventure.celebrated";
/** Returns true the first time the adventure completes today, false after. */
export function takeCelebrationOnce(): boolean {
  try {
    const today = dayKey();
    const last = localStorage.getItem(CELEBRATED_KEY);
    if (last === today) return false;
    localStorage.setItem(CELEBRATED_KEY, today);
    return true;
  } catch {
    return true;
  }
}