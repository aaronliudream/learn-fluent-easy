/**
 * 《英语闯关》关卡配置 — 单一真相源
 *
 * 菜单页 (PrimaryHubFinalChallenge) 与关卡分发器 (PrimaryHubFinalChallengeLevel)
 * 共用这一份配置:
 *   - 菜单页用它生成 10 关地图节点 + 决定 locked/current/completed
 *   - 分发器用 type 字段查 LEVEL_COMPONENT_MAP 找到具体题型组件
 *
 * 加新题型 (#71e ~ #71i) 只改这里 + 在分发器的 LEVEL_COMPONENT_MAP 加一行。
 */

import type { LevelConfig } from "./progress";
import type { FinalChallengeQuestionType } from "./types";

/**
 * 关 1–6 对应 Phase 1 的 6 个题型 (#71b 的 FinalChallengeQuestionType);
 * 关 7–10 留作 Phase 3,type=null 时菜单上锁定显示"敬请期待"。
 */
export const LEVEL_CONFIGS: LevelConfig[] = [
  { id: 1, name: "看图选句", type: "picture_match_sentence" },
  { id: 2, name: "看图选词", type: "picture_match_word" },
  { id: 3, name: "听音辨词", type: "listen_and_choose_word" },
  { id: 4, name: "听句判断", type: "listen_and_judge_picture" },
  { id: 5, name: "找不同类词", type: "odd_one_out" },
  { id: 6, name: "阅读理解", type: "reading_judge_TF" },
  { id: 7, name: "敬请期待", type: null },
  { id: 8, name: "敬请期待", type: null },
  { id: 9, name: "敬请期待", type: null },
  { id: 10, name: "敬请期待", type: null },
];

/** 6 关 × 3 星上限 = 18 (菜单页段位档位算法用)。 */
export const MAX_STARS =
  LEVEL_CONFIGS.filter((c) => c.type !== null).length * 3;

/**
 * 按年级 + 册别返回关卡配置。
 * - 六年级独有第 7 关「情景答语」(dialogue_response)；其余年级第 7 关仍是
 *   "敬请期待" 占位关 (低年级种子里没有 dialogue_response,加了会空关)。
 * - 六下(v2)没有「看图选词」数据,但 listen_and_choose_word 同时含比较级/过去式
 *   两类:把第 2、3 关拆成「听词·比较级」「听词·过去式」(按 vocab 天然互斥),
 *   填满 7 关。其它年级/六上(v1)不受影响。
 */
export function getLevelConfigs(
  grade: number,
  volume?: "v1" | "v2",
): LevelConfig[] {
  if (grade !== 6) return LEVEL_CONFIGS;
  let cfgs: LevelConfig[] = LEVEL_CONFIGS.map((c) =>
    c.id === 7 ? { id: 7, name: "情景答语", type: "dialogue_response" } : c,
  );
  if (volume === "v2") {
    cfgs = cfgs.map((c) => {
      if (c.id === 2)
        return {
          id: 2,
          name: "听词·比较级",
          type: "listen_and_choose_word",
          vocabFilter: "comparative",
        };
      if (c.id === 3)
        return {
          id: 3,
          name: "听词·过去式",
          type: "listen_and_choose_word",
          vocabFilter: "past",
        };
      return c;
    });
  }
  return cfgs;
}

/** 按 levelId 查关卡配置（按年级 + 册别）。 */
export function findLevelConfig(
  levelId: number,
  grade: number,
  volume?: "v1" | "v2",
): LevelConfig | null {
  return getLevelConfigs(grade, volume).find((c) => c.id === levelId) ?? null;
}

/** type 字段缩窄到 FinalChallengeQuestionType (null 表示占位关)。 */
export function getLevelQuestionType(
  cfg: LevelConfig,
): FinalChallengeQuestionType | null {
  return cfg.type as FinalChallengeQuestionType | null;
}
