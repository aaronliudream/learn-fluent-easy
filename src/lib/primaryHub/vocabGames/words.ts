import grade3 from "@/data/primaryHub/grade3.json";
import grade4 from "@/data/primaryHub/grade4.json";
import grade5 from "@/data/primaryHub/grade5.json";
import grade6 from "@/data/primaryHub/grade6.json";
import type { GameWord } from "./types";

type RawVocab = { en: string; cn: string; emoji?: string; phonetic?: string; type?: string };
type Grade = 3 | 4 | 5 | 6;

const GRADE_JSON: Record<Grade, any> = {
  3: (grade3 as any).grade3,
  4: (grade4 as any).grade4,
  5: (grade5 as any).grade5,
  6: (grade6 as any).grade6,
};

const _cache: Partial<Record<Grade, GameWord[]>> = {};

// 收集某年级全部可用单词（剔除 phonics，按 id 去重）
export function getWordsForGrade(grade: Grade): GameWord[] {
  if (_cache[grade]) return _cache[grade]!;
  const course = GRADE_JSON[grade];
  const out: GameWord[] = [];
  const seen = new Set<string>();
  const sems: Array<[string, 1 | 2]> = [
    [`grade${grade}_volume1`, 1],
    [`grade${grade}_volume2`, 2],
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
  _cache[grade] = out;
  return out;
}

/** @deprecated 兼容旧调用，等价 getWordsForGrade(4) */
export function getAllGrade4Words(): GameWord[] {
  return getWordsForGrade(4);
}

// 配对游戏用：全部
export function getMatchPool(grade: Grade): GameWord[] {
  return getWordsForGrade(grade);
}

// 街机类（rain/whack/spell/bubble）用：仅单个单词（去掉带空格/撇号的短语）
export function getArcadePool(grade: Grade): GameWord[] {
  return getWordsForGrade(grade).filter((w) => !/[\s']/.test(w.en));
}
