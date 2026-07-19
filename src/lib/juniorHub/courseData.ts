import type { GradeCourseDef, JuniorHubGrade, UnitDef } from "./types";
import type { JuniorPublisher } from "./publisher";

import grade7 from "@/data/juniorHub/grade7.json";
import grade8 from "@/data/juniorHub/grade8.json";
import grade9 from "@/data/juniorHub/grade9.json";
// 高中(加法接入):必修=高一(10)、选必=高二(11)、复习=高三(12)。
// 物理沿用 gaokaoHub year1/2/3.json(1:1 映射 grade=hubGrade+9),不迁数据。
import year1 from "@/data/gaokaoHub/year1.json";
import year2 from "@/data/gaokaoHub/year2.json";
import year3 from "@/data/gaokaoHub/year3.json";
// 出版社分叉(上外):共用关卡播放器按 unitId 解析单元时,需能认出 sufe_* 单元(id 全局唯一,
// 人教/初中 id 先在 COURSES 命中,这里只作兜底,绝不影响既有单元)。
import sufeCourses from "@/data/gaokaoHub/sufe-courses.json";
import fltrpCourses from "@/data/gaokaoHub/fltrp-courses.json";
// 初中出版社分叉(外研社 FLTRP):unitId 前缀 wy*(全局唯一),仅在 publisher='fltrp' 入口取用;
// 人教/高中路径先在 COURSES/其它 fork 命中,这里只作兜底。九年级本轮无 JSON → 返回空壳。
import fltrpGrade7 from "@/data/juniorHub/fltrp-grade7.json";
import fltrpGrade8 from "@/data/juniorHub/fltrp-grade8.json";

const ALL_GRADES: JuniorHubGrade[] = [7, 8, 9, 10, 11, 12];

// 初中外研社课本(按年级)。九年级无结构 → getGradeCourse 返回 FLTRP_EMPTY 空壳。
const FLTRP_COURSES: Partial<Record<JuniorHubGrade, GradeCourseDef>> = {
  7: (fltrpGrade7 as { grade7: GradeCourseDef }).grade7,
  8: (fltrpGrade8 as { grade8: GradeCourseDef }).grade8,
};
const FLTRP_EMPTY: GradeCourseDef = { name: "整理中", semesters: {} };
const JUNIOR_FLTRP_COURSES: GradeCourseDef[] = Object.values(FLTRP_COURSES) as GradeCourseDef[];

// 非人教出版社的课本结构(上外 + 高中外研社 + 初中外研社)。按 unitId 兜底查,grade 键无关。
const FORK_COURSES: GradeCourseDef[] = [
  ...Object.values(sufeCourses as unknown as Record<string, GradeCourseDef>),
  ...Object.values(fltrpCourses as unknown as Record<string, GradeCourseDef>),
  ...JUNIOR_FLTRP_COURSES,
];

function findUnitInForks(unitId: string): UnitDef | null {
  for (const course of FORK_COURSES) {
    for (const sem of Object.values(course.semesters)) {
      const u = sem.units.find((x) => x.id === unitId);
      if (u) return u;
    }
  }
  return null;
}

const COURSES: Record<JuniorHubGrade, GradeCourseDef> = {
  7: (grade7 as { grade7: GradeCourseDef }).grade7,
  8: (grade8 as { grade8: GradeCourseDef }).grade8,
  9: (grade9 as { grade9: GradeCourseDef }).grade9,
  10: (year1 as { year1: GradeCourseDef }).year1,
  11: (year2 as { year2: GradeCourseDef }).year2,
  12: (year3 as { year3: GradeCourseDef }).year3,
};

export function getGradeCourse(grade: JuniorHubGrade, publisher: JuniorPublisher = "pep"): GradeCourseDef {
  if (publisher === "fltrp") return FLTRP_COURSES[grade] ?? FLTRP_EMPTY;
  return COURSES[grade];
}

export function semesterIdsForGrade(grade: JuniorHubGrade, publisher: JuniorPublisher = "pep"): string[] {
  return Object.keys(getGradeCourse(grade, publisher).semesters);
}

export function findSemester(semesterId: string): (import("./types").SemesterDef & { id: string }) | null {
  for (const grade of ALL_GRADES) {
    const sem = COURSES[grade].semesters[semesterId];
    if (sem) return { ...sem, id: semesterId };
  }
  // 外研社 semester(id 带 wy_ 前缀,与人教/高中不撞)兜底。
  for (const course of JUNIOR_FLTRP_COURSES) {
    const sem = course.semesters[semesterId];
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
  return findUnitInForks(unitId); // 兜底:上外等出版社单元(id 全局唯一)
}

export function gradeForUnit(unitId: string): JuniorHubGrade | null {
  for (const grade of ALL_GRADES) {
    for (const sem of Object.values(COURSES[grade].semesters)) {
      if (sem.units.some((x) => x.id === unitId)) return grade;
    }
  }
  return null;
}
