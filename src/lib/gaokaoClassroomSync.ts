/**
 * 高中课堂同步掌握度 — 按课本单元关卡（localStorage hub 进度）汇总。
 * 与初中 hub 一致：每单元 8 关，完成关数 / 总关数。
 */

import type { GaokaoGradeKey } from "@/components/gaokao/GaokaoGradeFilter";
import {
  getGradeCourse,
  totalStagesForGrade,
  totalUnitsForGrade,
} from "@/lib/gaokaoHub/courseData";
import { getGradeProgress } from "@/lib/gaokaoHub/progress";
import { loadPersist } from "@/lib/gaokaoHub/storage";
import type { GaokaoHubGrade } from "@/lib/gaokaoHub/types";

export type GaokaoClassroomSyncProgress = {
  mastered: number;
  total: number;
  percent: number;
  unitCount: number;
  unitsCompleted: number;
};

const GRADES_BY_KEY: Record<Exclude<GaokaoGradeKey, "all">, GaokaoHubGrade> = {
  g1: 1,
  g2: 2,
  g3: 3,
};

function progressForGrade(grade: GaokaoHubGrade): GaokaoClassroomSyncProgress {
  const state = loadPersist(grade);
  const gp = getGradeProgress(state, grade);
  const course = getGradeCourse(grade);
  let unitsCompleted = 0;
  for (const sem of Object.values(course.semesters)) {
    for (const u of sem.units.filter((x) => x.available)) {
      const done = state.units[u.id]?.completedStages.length ?? 0;
      if (done >= u.stages.length) unitsCompleted += 1;
    }
  }
  return {
    mastered: gp.stageDone,
    total: gp.stageTotal,
    percent: gp.percent,
    unitCount: totalUnitsForGrade(grade),
    unitsCompleted,
  };
}

export function fetchGaokaoClassroomSyncProgress(
  gradeKey: GaokaoGradeKey,
): GaokaoClassroomSyncProgress {
  if (gradeKey === "all") {
    const parts = ([1, 2, 3] as GaokaoHubGrade[]).map(progressForGrade);
    const mastered = parts.reduce((a, p) => a + p.mastered, 0);
    const total = parts.reduce((a, p) => a + p.total, 0);
    const unitCount = parts.reduce((a, p) => a + p.unitCount, 0);
    const unitsCompleted = parts.reduce((a, p) => a + p.unitsCompleted, 0);
    return {
      mastered,
      total,
      percent: total > 0 ? Math.round((mastered / total) * 100) : 0,
      unitCount,
      unitsCompleted,
    };
  }
  return progressForGrade(GRADES_BY_KEY[gradeKey]);
}

export function totalStagesAllGrades(): number {
  return ([1, 2, 3] as GaokaoHubGrade[]).reduce((a, g) => a + totalStagesForGrade(g), 0);
}
