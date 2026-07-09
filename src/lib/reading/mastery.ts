import {
  recordMastery,
  loadMastery,
  MasteryRow,
} from "@/lib/masteryProgress";

// 阅读中心掌握度:复用 mastery_progress(星级/百分比/遗忘曲线),无 edge function。
// module 用独立命名空间 "reading_center",不与 junior_reading / gaokao_reading 混。
// 决策见 docs/reading/DECISIONS.md D4。
export const READING_MASTERY_MODULE = "reading_center";

/** 提交一篇结果 → 更新阅读中心掌握度。itemId = reading_library.id。 */
export function recordReadingMastery(itemId: string, pct: number) {
  return recordMastery({ module: READING_MASTERY_MODULE, itemId, pct });
}

/** 拉取阅读中心全部掌握度 → Map<passageId, row>。 */
export function loadReadingMastery(): Promise<Record<string, MasteryRow>> {
  return loadMastery(READING_MASTERY_MODULE);
}
