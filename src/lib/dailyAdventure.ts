// Daily Adventure — Phase 2 of the Spark world realignment.
//
// What this is: a small, deterministic "today's plan" the child runs
// through in one sitting. We do NOT add new content; we string the
// 4 strongest existing engines into one Spark-narrated flow.
//
// Why so small: shipping a single linear path is the whole point.
// Anything fancier would re-create the menu maze we just deleted.

export type AdventureStepKind = "vocab" | "lesson" | "reading" | "culture";

export type AdventureStep = {
  kind: AdventureStepKind;
  emoji: string;
  title: string;     // child-facing title
  sparkLine: string; // first-person Spark voice
  cta: string;       // button text
  to: string;        // route to launch
  estMinutes: number;
};

/** Build today's 4-step plan. Pure function — same input, same output today. */
export function buildDailyAdventure(opts: {
  grade: number;
  nextLessonId?: string | null;
  nextReadingId?: string | null;
}): AdventureStep[] {
  const { grade, nextLessonId, nextReadingId } = opts;

  const steps: AdventureStep[] = [];

  // Step 1 — Spark wants to learn 5 new words with you.
  steps.push({
    kind: "vocab",
    emoji: "🔤",
    title: "Spark 想学 5 个新词",
    sparkLine: "我今天想学 5 个新词,你陪我念好不好?",
    cta: "陪 Spark 念词",
    to: `/primary/vocab/${grade}`,
    estMinutes: 3,
  });

  // Step 2 — A real lesson (the heavy engine).
  if (nextLessonId) {
    steps.push({
      kind: "lesson",
      emoji: "📚",
      title: "今天的一节课",
      sparkLine: "我准备好啦,我们开始今天这节课吧!",
      cta: "开始今天这节课",
      to: `/primary/lesson/${nextLessonId}`,
      estMinutes: 8,
    });
  }

  // Step 3 — Read a short story together.
  steps.push({
    kind: "reading",
    emoji: "📖",
    title: "陪 Spark 读一篇小故事",
    sparkLine: nextReadingId
      ? "我有点想听故事,你读给我听好不好?"
      : "我们去图书馆挑一本喜欢的书,然后回来读吧!",
    cta: "去读故事",
    to: nextReadingId
      ? `/primary/reading/${nextReadingId}`
      : `/primary/reading/grade/${grade}`,
    estMinutes: 5,
  });

  // Step 4 — Culture stamp / pet visit (light wind-down).
  steps.push({
    kind: "culture",
    emoji: "🌍",
    title: "今天的一张文化卡",
    sparkLine: "学完别走~ 我们去看看今天的文化小卡片吧!",
    cta: "看看文化小卡",
    to: `/primary/culture/${grade}`,
    estMinutes: 2,
  });

  return steps;
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