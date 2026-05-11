export type Badge = {
  id: string;
  emoji: string;
  name: string;
  desc: string;
  /** lookup: which chapter completion grants this (1..5) or "all" */
  unlock: { kind: "chapter"; id: number } | { kind: "all" };
};

export const BADGES: Badge[] = [
  { id: "chapter_1",  emoji: "🏘️", name: "时光镇居民",   desc: "完成第 1 章 · 时光小镇",   unlock: { kind: "chapter", id: 1 } },
  { id: "chapter_2",  emoji: "❤️", name: "家庭守护者",   desc: "完成第 2 章 · 温暖家园",   unlock: { kind: "chapter", id: 2 } },
  { id: "chapter_3",  emoji: "🎒", name: "学校达人",     desc: "完成第 3 章 · 校园冒险",   unlock: { kind: "chapter", id: 3 } },
  { id: "chapter_4",  emoji: "🗺️", name: "世界探险家",   desc: "完成第 4 章 · 世界探索",   unlock: { kind: "chapter", id: 4 } },
  { id: "chapter_5",  emoji: "🌈", name: "彩虹守护者",   desc: "完成第 5 章 · 自然彩虹",   unlock: { kind: "chapter", id: 5 } },
  { id: "all_complete", emoji: "🚀", name: "Spark 飞行员", desc: "通关全部 30 节",          unlock: { kind: "all" } },
];

export function badgeForChapter(chapterId: number): Badge | undefined {
  return BADGES.find((b) => b.unlock.kind === "chapter" && b.unlock.id === chapterId);
}

export const ALL_COMPLETE_BADGE = BADGES.find((b) => b.unlock.kind === "all")!;