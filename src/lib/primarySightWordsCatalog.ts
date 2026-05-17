import {
  getPepSightWordsForGrade,
  PEP_SIGHT_WORD_GROUPS,
  PEP_SIGHT_WORD_ITEMS,
} from "@/data/pepSightWords";
import type { SightWordGroup, SightWordItem } from "@/data/primarySightWords";
import { getCurrentGrade } from "@/lib/sightWordsGradeGate";

export type SightWordsCatalog = {
  groups: SightWordGroup[];
  items: SightWordItem[];
};

export function resolveSightWordsGrade(gradeParam: string | null): number {
  if (gradeParam === "1") return 1;
  if (gradeParam === "2") return 2;
  if (gradeParam === "3") return 3;
  if (gradeParam === "4") return 4;
  if (gradeParam === "5") return 5;
  if (gradeParam === "6") return 6;
  return getCurrentGrade();
}

/** 人教 PEP 词汇目录（按年级选取上下册） */
export function getSightWordsCatalog(grade: number): SightWordsCatalog {
  return getPepSightWordsForGrade(grade);
}

export function findSightWordItem(wordId: string | undefined): SightWordItem | null {
  if (!wordId) return null;
  return PEP_SIGHT_WORD_ITEMS.find((w) => w.id === wordId) ?? null;
}

export function findSightWordGroup(groupId: string | undefined): SightWordGroup | null {
  if (!groupId) return null;
  return PEP_SIGHT_WORD_GROUPS.find((g) => g.id === groupId) ?? null;
}
