import grade3 from "@/data/primaryHub/grade3.json";
import grade4 from "@/data/primaryHub/grade4.json";
import grade5 from "@/data/primaryHub/grade5.json";
import grade6 from "@/data/primaryHub/grade6.json";
import type { GradeCourseDef, PrimaryHubGrade, SemesterDef, UnitDef } from "./types";

export const PRIMARY_HUB_COURSES: Record<string, GradeCourseDef> = {
  grade3: (grade3 as { grade3: GradeCourseDef }).grade3,
  grade4: (grade4 as { grade4: GradeCourseDef }).grade4,
  grade5: (grade5 as { grade5: GradeCourseDef }).grade5,
  grade6: (grade6 as { grade6: GradeCourseDef }).grade6,
};

export function gradeKey(grade: PrimaryHubGrade): string {
  return `grade${grade}`;
}

export function semesterIdsForGrade(grade: PrimaryHubGrade): [string, string] {
  const g = gradeKey(grade);
  return [`${g}_volume1`, `${g}_volume2`];
}

export function findSemester(semesterId: string): (SemesterDef & { id: string }) | null {
  for (const course of Object.values(PRIMARY_HUB_COURSES)) {
    const sem = course.semesters[semesterId];
    if (sem) return { ...sem, id: semesterId };
  }
  return null;
}

export function findUnit(unitId: string): UnitDef | null {
  for (const course of Object.values(PRIMARY_HUB_COURSES)) {
    for (const sem of Object.values(course.semesters)) {
      const u = sem.units.find((x) => x.id === unitId);
      if (u) return u;
    }
  }
  return null;
}

export function getGradeCourse(grade: PrimaryHubGrade): GradeCourseDef {
  return PRIMARY_HUB_COURSES[gradeKey(grade)];
}
