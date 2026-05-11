// G2 Lesson UI 阶段 1:把 30 节课分成 5 章节(冒险地图)。
// lesson_id 用 g2_lXX 这种短 id;真实 lesson_key 通过 idx 反查 aiLessonsG2.json。

export type G2Chapter = {
  id: number;
  title_cn: string;
  emoji: string;
  lesson_ids: string[]; // 6 节,形如 g2_l01
  badge_emoji: string;
  badge_name: string;
  narrative: string;
};

export const G2_CHAPTERS: G2Chapter[] = [
  {
    id: 1,
    title_cn: "你好,新世界",
    emoji: "📅",
    lesson_ids: ["g2_l01", "g2_l02", "g2_l03", "g2_l04", "g2_l05", "g2_l06"],
    badge_emoji: "🏘️",
    badge_name: "时光镇居民",
    narrative: "Spark 邀请你探索基础生活",
  },
  {
    id: 2,
    title_cn: "我的家人",
    emoji: "🏠",
    lesson_ids: ["g2_l11", "g2_l13", "g2_l14", "g2_l15", "g2_l16", "g2_l25"],
    badge_emoji: "❤️",
    badge_name: "家庭守护者",
    narrative: "Spark 想了解你的家",
  },
  {
    id: 3,
    title_cn: "校园冒险",
    emoji: "🏫",
    lesson_ids: ["g2_l12", "g2_l19", "g2_l20", "g2_l07", "g2_l08", "g2_l27"],
    badge_emoji: "🎒",
    badge_name: "学校达人",
    narrative: "Spark 想看你的学校",
  },
  {
    id: 4,
    title_cn: "大世界",
    emoji: "🌍",
    lesson_ids: ["g2_l17", "g2_l18", "g2_l09", "g2_l10", "g2_l21", "g2_l22"],
    badge_emoji: "🗺️",
    badge_name: "世界探险家",
    narrative: "Spark 带你走出家门",
  },
  {
    id: 5,
    title_cn: "彩虹与节日",
    emoji: "🎉",
    lesson_ids: ["g2_l23", "g2_l24", "g2_l26", "g2_l28", "g2_l29", "g2_l30"],
    badge_emoji: "🌈",
    badge_name: "彩虹守护者",
    narrative: "庆祝学习成果",
  },
];

/** g2_lXX → 1..30 */
export function lessonIdToIdx(lessonId: string): number {
  const m = lessonId.match(/g2_l(\d+)/);
  return m ? Number(m[1]) : 0;
}

export function getChapterByLessonId(lessonId: string): G2Chapter | undefined {
  return G2_CHAPTERS.find((c) => c.lesson_ids.includes(lessonId));
}

/** 章节是否解锁:第 1 章默认解锁,后续章节需上一章全部完成。 */
export function isChapterUnlocked(
  chapter: G2Chapter,
  completedLessonIds: Set<string>
): boolean {
  if (chapter.id === 1) return true;
  const prev = G2_CHAPTERS[chapter.id - 2];
  if (!prev) return true;
  return prev.lesson_ids.every((id) => completedLessonIds.has(id));
}

/** 章节是否已完成 */
export function isChapterCompleted(
  chapter: G2Chapter,
  completedLessonIds: Set<string>
): boolean {
  return chapter.lesson_ids.every((id) => completedLessonIds.has(id));
}

/** 章节内某站点是否解锁:章内首节默认开,其它依赖前一节完成。 */
export function isLessonUnlocked(
  chapter: G2Chapter,
  lessonIndex: number,
  completedLessonIds: Set<string>
): boolean {
  if (!isChapterUnlocked(chapter, completedLessonIds)) return false;
  if (lessonIndex === 0) return true;
  const prevId = chapter.lesson_ids[lessonIndex - 1];
  return completedLessonIds.has(prevId);
}

/** 找到当前应该展开的章节(第一个未完成且已解锁的章节) */
export function getCurrentChapter(completedLessonIds: Set<string>): G2Chapter {
  for (const c of G2_CHAPTERS) {
    if (!isChapterCompleted(c, completedLessonIds)) return c;
  }
  return G2_CHAPTERS[G2_CHAPTERS.length - 1];
}

export const SPARK_LINES = [
  "嘿!Spark 今天好想和你一起冒险!",
  "你回来啦!Spark 想念你!",
  "今天 Spark 给你准备了新故事!",
  "我们继续探险吧!",
  "你最近真厉害,我都跟不上了!",
];

export function pickSparkLine(): string {
  return SPARK_LINES[Math.floor(Math.random() * SPARK_LINES.length)];
}