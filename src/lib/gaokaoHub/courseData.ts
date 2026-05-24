import type { GaokaoHubGrade, GradeCourseDef, UnitDef } from "./types";

import year1 from "@/data/gaokaoHub/year1.json";
import year2 from "@/data/gaokaoHub/year2.json";
import year3 from "@/data/gaokaoHub/year3.json";

const COURSES: Record<GaokaoHubGrade, GradeCourseDef> = {
  1: (year1 as { year1: GradeCourseDef }).year1,
  2: (year2 as { year2: GradeCourseDef }).year2,
  3: (year3 as { year3: GradeCourseDef }).year3,
};

export function getGradeCourse(grade: GaokaoHubGrade): GradeCourseDef {
  return COURSES[grade];
}

export function semesterIdsForGrade(grade: GaokaoHubGrade): string[] {
  return Object.keys(COURSES[grade].semesters);
}

export function findSemester(semesterId: string): (import("./types").SemesterDef & { id: string }) | null {
  for (const grade of [1, 2, 3] as GaokaoHubGrade[]) {
    const sem = COURSES[grade].semesters[semesterId];
    if (sem) return { ...sem, id: semesterId };
  }
  return null;
}

export function findUnit(unitId: string): UnitDef | null {
  for (const grade of [1, 2, 3] as GaokaoHubGrade[]) {
    for (const sem of Object.values(COURSES[grade].semesters)) {
      const u = sem.units.find((x) => x.id === unitId);
      if (u) return u;
    }
  }
  return null;
}

export function gradeForUnit(unitId: string): GaokaoHubGrade | null {
  for (const grade of [1, 2, 3] as GaokaoHubGrade[]) {
    for (const sem of Object.values(COURSES[grade].semesters)) {
      if (sem.units.some((x) => x.id === unitId)) return grade;
    }
  }
  return null;
}

export function totalStagesForGrade(grade: GaokaoHubGrade): number {
  let n = 0;
  for (const sem of Object.values(COURSES[grade].semesters)) {
    for (const u of sem.units) {
      if (u.available) n += u.stages.length;
    }
  }
  return n;
}

export function totalUnitsForGrade(grade: GaokaoHubGrade): number {
  let n = 0;
  for (const sem of Object.values(COURSES[grade].semesters)) {
    n += sem.units.filter((u) => u.available).length;
  }
  return n;
}
