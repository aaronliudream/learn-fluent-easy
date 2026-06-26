import { getGradeCourse, semesterIdsForGrade } from "@/lib/gaokaoHub/courseData";
import type { GaokaoHubGrade } from "@/lib/gaokaoHub/types";

/** year 只作内部元数据 → 软提示(参考非门槛)。必修1/2/3=高一·选必1/2=高二上·选必3/4=高二下。 */
export const YEAR_HINT: Record<string, string> = {
  gk_required1: "建议高一", gk_required2: "建议高一", gk_required3: "建议高一",
  gk_elective1: "建议高二上", gk_elective2: "建议高二上",
  gk_elective3: "建议高二下", gk_elective4: "建议高二下",
};
export const SHORT_NAME: Record<string, string> = {
  gk_required1: "必修一", gk_required2: "必修二", gk_required3: "必修三",
  gk_elective1: "选必一", gk_elective2: "选必二", gk_elective3: "选必三", gk_elective4: "选必四",
};

export type BookMeta = { semId: string; hubGrade: GaokaoHubGrade; name: string; available: boolean; units: number };
export type BookGroupKey = "required" | "elective";

/** 从 hub 课程数据收集 7 册(物理 grade 用于链回原文件,不迁数据)。 */
export function collectBooks(): BookMeta[] {
  const out: BookMeta[] = [];
  for (const g of [1, 2, 3] as GaokaoHubGrade[]) {
    const course = getGradeCourse(g);
    for (const semId of semesterIdsForGrade(g)) {
      const sem = course.semesters[semId];
      if (!sem) continue;
      out.push({
        semId,
        hubGrade: g,
        name: sem.name,
        available: sem.available,
        units: sem.units.filter((u) => u.available).length,
      });
    }
  }
  return out;
}

export function booksOfGroup(group: BookGroupKey): BookMeta[] {
  return collectBooks().filter((b) => b.semId.includes(group));
}

export const GROUP_META: Record<BookGroupKey, { title: string; sub: string; hint: string; icon: string }> = {
  required: { title: "必修", sub: "必修一 · 必修二 · 必修三", hint: "建议高一学完 · 3 册", icon: "gk_required1" },
  elective: { title: "选择性必修", sub: "选必一 · 二 · 三 · 四", hint: "建议高二学完 · 4 册", icon: "gk_elective1" },
};
