import grade4 from "@/data/primaryHub/grade4.json";
import type { GameWord } from "./types";

type RawVocab = { en: string; cn: string; emoji?: string; phonetic?: string; type?: string };

// 收集四年级全部可用单词（剔除 phonics，按 id 去重）
let _all: GameWord[] | null = null;
export function getAllGrade4Words(): GameWord[] {
  if (_all) return _all;
  const course = (grade4 as any).grade4;
  const out: GameWord[] = [];
  const seen = new Set<string>();
  const sems: Array<[string, 1 | 2]> = [
    ["grade4_volume1", 1],
    ["grade4_volume2", 2],
  ];
  for (const [semId, volume] of sems) {
    const units = course?.semesters?.[semId]?.units ?? [];
    for (const u of units) {
      for (const v of (u.vocabulary ?? []) as RawVocab[]) {
        if (v.type === "phonics") continue;
        const id = v.en.toLowerCase().trim();
        if (!id || seen.has(id)) continue;
        seen.add(id);
        out.push({
          id,
          en: v.en,
          cn: v.cn,
          emoji: v.emoji,
          phonetic: v.phonetic,
          unitId: u.id,
          volume,
          type: v.type,
        });
      }
    }
  }
  _all = out;
  return out;
}

// 配对游戏用：全部
export function getMatchPool(): GameWord[] {
  return getAllGrade4Words();
}

// 街机类（rain/whack/spell）用：仅单个单词
export function getArcadePool(): GameWord[] {
  return getAllGrade4Words().filter((w) => !/[\s']/.test(w.en));
}
