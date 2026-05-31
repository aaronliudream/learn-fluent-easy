/**
 * 《英语闯关》关卡进度管理
 *
 * 用户隔离：复用 spellingStageConfig 的 getStorageScope（同 PR #64 的范式）。
 * 存储结构：单 blob `fc_progress_<scope>_g<grade>` 装 10 关的 progress map，
 *   value = Record<levelId, LevelProgress>。
 */

import { getStorageScope } from "@/lib/primaryHub/spellingStageConfig";
import type { LevelData } from "@/components/primaryHub/finalChallenge/LevelMap";
import type { RankTier } from "@/components/primaryHub/finalChallenge/RankBadge";

export interface LevelProgress {
  levelId: number;
  /** 0–3。等于 0 表示"尝试过但 0 星"，>0 视为已完成。 */
  stars: number;
  attempts: number;
  /** 0–1，本关历史最高正确率。 */
  bestScore: number;
  lastAttemptAt: number;
}

export type ProgressMap = Record<number, LevelProgress>;

const progressKey = (scope: string, grade: number) =>
  `fc_progress_${scope}_g${grade}`;

export function loadAllLevelProgress(
  userId: string | null | undefined,
  grade: number,
): ProgressMap {
  try {
    const raw = localStorage.getItem(progressKey(getStorageScope(userId), grade));
    if (!raw) return {};
    const data = JSON.parse(raw) as unknown;
    if (data && typeof data === "object") return data as ProgressMap;
    return {};
  } catch {
    return {};
  }
}

export function getLevelProgress(
  userId: string | null | undefined,
  grade: number,
  levelId: number,
): LevelProgress | null {
  return loadAllLevelProgress(userId, grade)[levelId] ?? null;
}

export function saveLevelProgress(
  userId: string | null | undefined,
  grade: number,
  p: LevelProgress,
): void {
  try {
    const all = loadAllLevelProgress(userId, grade);
    all[p.levelId] = p;
    localStorage.setItem(
      progressKey(getStorageScope(userId), grade),
      JSON.stringify(all),
    );
  } catch {
    // ignore storage errors
  }
}

/** 菜单页传入的关卡配置：`type === null` 表示"敬请期待"（不可玩）。 */
export interface LevelConfig {
  id: number;
  name: string;
  type: string | null;
  /**
   * 可选：把该关题目再按 vocab_domain 过滤（题目的 vocab_domain 须包含此值）。
   * 用于同一题型按词义域拆成多关，例如六下把「听音辨词」拆成比较级/过去式两关。
   */
  vocabFilter?: string;
}

/**
 * 根据进度 + 关卡配置算出每关在地图上的 UI 状态：
 *   - `type === null`  → 一直 locked（关 7–10 敬请期待）
 *   - `stars > 0`      → completed
 *   - 第一个尚未完成的可玩关 → current
 *   - 其余尚未完成的可玩关 → locked
 */
export function computeLevelStates(
  configs: LevelConfig[],
  progress: ProgressMap,
): LevelData[] {
  let currentAssigned = false;
  return configs.map((cfg) => {
    if (cfg.type === null) {
      return { id: cfg.id, name: cfg.name, state: "locked" as const };
    }
    const p = progress[cfg.id];
    if (p && p.stars > 0) {
      return { id: cfg.id, name: cfg.name, state: "completed" as const, stars: p.stars };
    }
    if (!currentAssigned) {
      currentAssigned = true;
      return { id: cfg.id, name: cfg.name, state: "current" as const };
    }
    return { id: cfg.id, name: cfg.name, state: "locked" as const };
  });
}

/** 总星数（只计可玩关）。 */
export function getTotalStars(
  progress: ProgressMap,
  configs: LevelConfig[],
): number {
  return configs.reduce((sum, cfg) => {
    if (cfg.type === null) return sum;
    return sum + (progress[cfg.id]?.stars ?? 0);
  }, 0);
}

/**
 * 总星数 → 段位徽章档位（6 关 × 3 星 = 18 星上限）：
 *   0–3   bronze   闯关学徒
 *   4–9   silver   闯关勇士
 *  10–15  gold     闯关高手
 *  16–18  rainbow  闯关大师
 */
export function getRankTier(totalStars: number): RankTier {
  if (totalStars >= 16) return "rainbow";
  if (totalStars >= 10) return "gold";
  if (totalStars >= 4) return "silver";
  return "bronze";
}
