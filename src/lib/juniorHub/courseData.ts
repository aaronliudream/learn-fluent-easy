import type { GradeCourseDef, JuniorHubGrade, UnitDef } from "./types";

import grade7 from "@/data/juniorHub/grade7.json";
import grade8 from "@/data/juniorHub/grade8.json";
import grade9 from "@/data/juniorHub/grade9.json";
// 高中(加法接入):必修=高一(10)、选必=高二(11)、复习=高三(12)。
// 物理沿用 gaokaoHub year1/2/3.json(1:1 映射 grade=hubGrade+9),不迁数据。
import year1 from "@/data/gaokaoHub/year1.json";
import year2 from "@/data/gaokaoHub/year2.json";
import year3 from "@/data/gaokaoHub/year3.json";

const ALL_GRADES: JuniorHubGrade[] = [7, 8, 9, 10, 11, 12];

const COURSES: Record<JuniorHubGrade, GradeCourseDef> = {
  7: (grade7 as { grade7: GradeCourseDef }).grade7,
  8: (grade8 as { grade8: GradeCourseDef }).grade8,
  9: (grade9 as { grade9: GradeCourseDef }).grade9,
  10: (year1 as { year1: GradeCourseDef }).year1,
  11: (year2 as { year2: GradeCourseDef }).year2,
  12: (year3 as { year3: GradeCourseDef }).year3,
};

export function getGradeCourse(grade: JuniorHubGrade): GradeCourseDef {
  return COURSES[grade];
}

export function semesterIdsForGrade(grade: JuniorHubGrade): string[] {
  return Object.keys(COURSES[grade].semesters);
}

export function findSemester(semesterId: string): (import("./types").SemesterDef & { id: string }) | null {
  for (const grade of ALL_GRADES) {
    const sem = COURSES[grade].semesters[semesterId];
    if (sem) return { ...sem, id: semesterId };
  }
  return null;
}

export function findUnit(unitId: string): UnitDef | null {
  for (const grade of ALL_GRADES) {
    for (const sem of Object.values(COURSES[grade].semesters)) {
      const u = sem.units.find((x) => x.id === unitId);
      if (u) return u;
    }
  }
  return null;
}

export function gradeForUnit(unitId: string): JuniorHubGrade | null {
  for (const grade of ALL_GRADES) {
    for (const sem of Object.values(COURSES[grade].semesters)) {
      if (sem.units.some((x) => x.id === unitId)) return grade;
    }
  }
  return null;
}
