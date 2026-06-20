import type { JuniorHubGrade } from "./types";

/**
 * 初中各年级开放状态(单一事实来源)。
 * 初一(7)/初二(8)开放;初三(9)整理中,仅管理员可访问。
 * 高中在路由层用 AdminRoute 锁,不在此列。
 */
export const OPEN_JUNIOR_GRADES: JuniorHubGrade[] = [7, 8];

export function isJuniorGradeOpen(grade: number | null | undefined): boolean {
  if (grade == null) return false;
  return OPEN_JUNIOR_GRADES.includes(grade as JuniorHubGrade);
}
