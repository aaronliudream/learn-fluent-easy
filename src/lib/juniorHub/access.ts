import type { JuniorHubGrade } from "./types";

/**
 * 初中各年级开放状态(单一事实来源)。
 * 初一(7)/初二(8)/初三(9)全部开放(对所有用户,与 7/8 同策略)。
 * 高中在路由层用 AdminRoute 锁,不在此列。
 */
export const OPEN_JUNIOR_GRADES: JuniorHubGrade[] = [7, 8, 9];

export function isJuniorGradeOpen(grade: number | null | undefined): boolean {
  if (grade == null) return false;
  return OPEN_JUNIOR_GRADES.includes(grade as JuniorHubGrade);
}
