/**
 * 初中《期中/期末闯关》关卡配置 —— Fork 自
 * `lib/primaryHub/finalChallenge/levels.ts`。
 *
 * 菜单页 (JuniorHubFinalChallenge) 与关卡分发器 (JuniorHubFinalChallengeLevel)
 * 共用这一份:菜单据此画关卡地图 + 判 locked/current/completed;分发器据 type
 * 查 LEVEL_COMPONENT_MAP 找题型组件,并把关 id/name 注入渲染器 props。
 *
 * 七上期中 (g7v1) — 4 关:
 *   关 1 选词填空 fill_in_choose(单选 + 完形 + 词形变化)
 *   关 2 听力理解 dialogue_response(听整段对话/短文答题)
 *   关 3 句型转换 sentence_transform(读题选改写句,无朗读)
 *   关 4 阅读判断 reading_judge_TF
 *
 * 七下期末 (g7v2) — 5 关:
 *   关 1 选词填空 fill_in_choose
 *   关 2 听音辨词 listen_and_choose_word(emoji 选图)
 *   关 3 听力理解 dialogue_response
 *   关 4 连词成句 sentence_ordering
 *   关 5 阅读判断 reading_judge_TF
 */

import type { LevelConfig } from "@/lib/primaryHub/finalChallenge/progress";
import type { FinalChallengeQuestionType } from "@/lib/primaryHub/finalChallenge/types";

/** 七上期中关卡表(v1,4 关全可玩)。 */
export const LEVEL_CONFIGS_V1: LevelConfig[] = [
  { id: 1, name: "选词填空", type: "fill_in_choose" },
  { id: 2, name: "听力理解", type: "dialogue_response" },
  { id: 3, name: "句型转换", type: "sentence_transform" },
  { id: 4, name: "阅读判断", type: "reading_judge_TF" },
];

/** 七下期末关卡表(v2,5 关全可玩)。 */
export const LEVEL_CONFIGS_V2: LevelConfig[] = [
  { id: 1, name: "选词填空", type: "fill_in_choose" },
  { id: 2, name: "听音辨词", type: "listen_and_choose_word" },
  { id: 3, name: "听力理解", type: "dialogue_response" },
  { id: 4, name: "连词成句", type: "sentence_ordering" },
  { id: 5, name: "阅读判断", type: "reading_judge_TF" },
];

/** 按年级 + 册别返回关卡配置(目前只有 g7;缺失回退 v1)。 */
export function getLevelConfigs(
  _grade: number,
  volume: "v1" | "v2" = "v1",
): LevelConfig[] {
  return volume === "v2" ? LEVEL_CONFIGS_V2 : LEVEL_CONFIGS_V1;
}

/** 某册可玩关 × 3 星上限(菜单段位档位算法用)。 */
export function maxStarsFor(grade: number, volume: "v1" | "v2" = "v1"): number {
  return getLevelConfigs(grade, volume).filter((c) => c.type !== null).length * 3;
}

/** 按 levelId 查关卡配置。 */
export function findLevelConfig(
  levelId: number,
  grade: number,
  volume?: "v1" | "v2",
): LevelConfig | null {
  return getLevelConfigs(grade, volume).find((c) => c.id === levelId) ?? null;
}

/** type 字段缩窄到 FinalChallengeQuestionType(null 表示占位关)。 */
export function getLevelQuestionType(
  cfg: LevelConfig,
): FinalChallengeQuestionType | null {
  return cfg.type as FinalChallengeQuestionType | null;
}

/** 关卡题型 → emoji 图标(菜单大卡片用)。 */
export const LEVEL_TYPE_ICON: Record<string, string> = {
  fill_in_choose: "✏️",
  listen_and_choose_word: "🔊",
  dialogue_response: "🎧",
  sentence_transform: "🔄",
  sentence_ordering: "🧩",
  reading_judge_TF: "📖",
};

/** 取某关的图标 emoji;未知/占位关回退 🎯。 */
export function iconForLevel(cfg: LevelConfig): string {
  return (cfg.type ? LEVEL_TYPE_ICON[cfg.type] : undefined) ?? "🎯";
}
