import type { GradeCourseDef, JuniorHubGrade, UnitDef } from "./types";

import grade7 from "@/data/juniorHub/grade7.json";
import grade8 from "@/data/juniorHub/grade8.json";
import grade9 from "@/data/juniorHub/grade9.json";

const COURSES: Record<JuniorHubGrade, GradeCourseDef> = {
  7: (grade7 as { grade7: GradeCourseDef }).grade7,
  8: (grade8 as { grade8: GradeCourseDef }).grade8,
  9: (grade9 as { grade9: GradeCourseDef }).grade9,
};

export function getGradeCourse(grade: JuniorHubGrade): GradeCourseDef {
  return COURSES[grade];
}

export function semesterIdsForGrade(grade: JuniorHubGrade): string[] {
  return Object.keys(COURSES[grade].semesters);
}

export function findSemester(semesterId: string): (import("./types").SemesterDef & { id: string }) | null {
  for (const grade of [7, 8, 9] as JuniorHubGrade[]) {
    const sem = COURSES[grade].semesters[semesterId];
    if (sem) return { ...sem, id: semesterId };
  }
  return null;
}

export function findUnit(unitId: string): UnitDef | null {
  for (const grade of [7, 8, 9] as JuniorHubGrade[]) {
    for (const sem of Object.values(COURSES[grade].semesters)) {
      const u = sem.units.find((x) => x.id === unitId);
      if (u) return u;
    }
  }
  return null;
}

export function gradeForUnit(unitId: string): JuniorHubGrade | null {
  for (const grade of [7, 8, 9] as JuniorHubGrade[]) {
    for (const sem of Object.values(COURSES[grade].semesters)) {
      if (sem.units.some((x) => x.id === unitId)) return grade;
    }
  }
  return null;
}
