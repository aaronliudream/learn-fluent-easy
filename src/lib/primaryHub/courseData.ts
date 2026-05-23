import raw from "@/data/primaryHub/courseData.json";
import type { GradeCourseDef, PrimaryHubGrade, SemesterDef, UnitDef } from "./types";
import { DEFAULT_STAGES } from "./types";

const GRADE_NAMES: Record<PrimaryHubGrade, string> = {
  3: "三年级",
  4: "四年级",
  5: "五年级",
  6: "六年级",
};

function lockedUnits(count: number, prefix: string, titles: Array<[string, string, string]>): UnitDef[] {
  return titles.slice(0, count).map(([title, cn, emoji], i) => ({
    id: `${prefix}_u${i + 1}`,
    num: i + 1,
    title,
    cn,
    emoji,
    available: false,
    vocabulary: [],
    dialogues: [],
    stages: DEFAULT_STAGES,
    quizQuestions: [],
    listeningQuestions: [],
  }));
}

function buildPlaceholderGrade(grade: PrimaryHubGrade): GradeCourseDef {
  const g = `grade${grade}`;
  const unitTitles: Array<[string, string, string]> = [
    ["Unit 1", "第一单元", "📘"],
    ["Unit 2", "第二单元", "📗"],
    ["Unit 3", "第三单元", "📙"],
    ["Unit 4", "第四单元", "📕"],
    ["Unit 5", "第五单元", "📒"],
    ["Unit 6", "第六单元", "📓"],
  ];
  return {
    name: GRADE_NAMES[grade],
    semesters: {
      [`${g}_volume1`]: {
        name: "上册",
        available: false,
        units: lockedUnits(6, `${g}_v1`, unitTitles),
      },
      [`${g}_volume2`]: {
        name: "下册",
        available: false,
        units: lockedUnits(6, `${g}_v2`, unitTitles),
      },
    },
  };
}

const g4 = (raw as { grade4: GradeCourseDef }).grade4;

export const PRIMARY_HUB_COURSES: Record<string, GradeCourseDef> = {
  grade3: buildPlaceholderGrade(3),
  grade4: g4,
  grade5: buildPlaceholderGrade(5),
  grade6: buildPlaceholderGrade(6),
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
