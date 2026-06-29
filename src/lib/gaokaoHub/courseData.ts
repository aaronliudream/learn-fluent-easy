import type { GaokaoHubGrade, GradeCourseDef, UnitDef } from "./types";
import { DEFAULT_PUBLISHER, type Publisher } from "./publisher";

import year1 from "@/data/gaokaoHub/year1.json";
import year2 from "@/data/gaokaoHub/year2.json";
import year3 from "@/data/gaokaoHub/year3.json";
import sufeCourses from "@/data/gaokaoHub/sufe-courses.json";
import fltrpCourses from "@/data/gaokaoHub/fltrp-courses.json";

const COURSES: Record<GaokaoHubGrade, GradeCourseDef> = {
  1: (year1 as { year1: GradeCourseDef }).year1,
  2: (year2 as { year2: GradeCourseDef }).year2,
  3: (year3 as { year3: GradeCourseDef }).year3,
};

// 上外(sufe)课本同步结构(只含已灌库的 required1/required2;9关全 DB 驱动)。
const SUFE_COURSES = sufeCourses as unknown as Record<GaokaoHubGrade, GradeCourseDef>;
// 外研社(fltrp)全 7 册课本同步结构(9关全 DB 驱动)。
const FLTRP_COURSES = fltrpCourses as unknown as Record<GaokaoHubGrade, GradeCourseDef>;

/** 按 publisher 选课本结构源。pep(默认)→ 人教 year*.json(零回归);sufe → 上外;fltrp → 外研社。 */
function coursesFor(publisher: Publisher = DEFAULT_PUBLISHER): Record<GaokaoHubGrade, GradeCourseDef> {
  if (publisher === "sufe") return SUFE_COURSES;
  if (publisher === "fltrp") return FLTRP_COURSES;
  return COURSES;
}

export function getGradeCourse(grade: GaokaoHubGrade, publisher: Publisher = DEFAULT_PUBLISHER): GradeCourseDef {
  return coursesFor(publisher)[grade];
}

export function semesterIdsForGrade(grade: GaokaoHubGrade, publisher: Publisher = DEFAULT_PUBLISHER): string[] {
  return Object.keys(coursesFor(publisher)[grade].semesters);
}

export function findSemester(
  semesterId: string,
  publisher: Publisher = DEFAULT_PUBLISHER,
): (import("./types").SemesterDef & { id: string }) | null {
  const courses = coursesFor(publisher);
  for (const grade of [1, 2, 3] as GaokaoHubGrade[]) {
    const sem = courses[grade].semesters[semesterId];
    if (sem) return { ...sem, id: semesterId };
  }
  return null;
}

export function findUnit(unitId: string, publisher: Publisher = DEFAULT_PUBLISHER): UnitDef | null {
  const courses = coursesFor(publisher);
  for (const grade of [1, 2, 3] as GaokaoHubGrade[]) {
    for (const sem of Object.values(courses[grade].semesters)) {
      const u = sem.units.find((x) => x.id === unitId);
      if (u) return u;
    }
  }
  return null;
}

export function gradeForUnit(unitId: string, publisher: Publisher = DEFAULT_PUBLISHER): GaokaoHubGrade | null {
  const courses = coursesFor(publisher);
  for (const grade of [1, 2, 3] as GaokaoHubGrade[]) {
    for (const sem of Object.values(courses[grade].semesters)) {
      if (sem.units.some((x) => x.id === unitId)) return grade;
    }
  }
  return null;
}

export function totalStagesForGrade(grade: GaokaoHubGrade, publisher: Publisher = DEFAULT_PUBLISHER): number {
  let n = 0;
  for (const sem of Object.values(coursesFor(publisher)[grade].semesters)) {
    for (const u of sem.units) {
      if (u.available) n += u.stages.length;
    }
  }
  return n;
}

/** 用户可见单元标签:从 unitKey 推(WU=预备单元,U1→Unit 1…),与底层 id 的 num 偏移解绑。 */
export function unitLabel(unit: { unitKey: string }): string {
  return unit.unitKey === "WU" ? "Welcome Unit" : `Unit ${unit.unitKey.replace(/^U/i, "")}`;
}

export function totalUnitsForGrade(grade: GaokaoHubGrade, publisher: Publisher = DEFAULT_PUBLISHER): number {
  let n = 0;
  for (const sem of Object.values(coursesFor(publisher)[grade].semesters)) {
    n += sem.units.filter((u) => u.available).length;
  }
  return n;
}
