/**
 * 单元详情页路由分发白名单 — Unit Gamified PR_1
 *
 * 列在 GAMIFIED_UNIT_IDS 里的 unitId 会路由到新的游戏化单元详情页
 * (PrimaryHubUnitGamified); 其余单元继续走老的 PrimaryHubUnit. 加新游戏化
 * unit 时只需要往这个 Set 里加一条字符串.
 *
 * 这是"先试水一个 Unit"策略 (决策1 路由分叉): 老组件零改动, 风险被框在白
 * 名单 unit 里. 试水满意再渐进扩白名单.
 */

/** Unit IDs routed to the new game-ified detail page. */
export const GAMIFIED_UNIT_IDS: ReadonlySet<string> = new Set([
  "g4v1_u1", // 四下 Unit 1 My classroom — PR_1 首批试水
  // ↓ Phase 1: 四年级其余 11 个单元接入游戏化
  "g4v1_u2", // 四上 Unit 2 My schoolbag
  "g4v1_u3", // 四上 Unit 3 My friends
  "g4v1_u4", // 四上 Unit 4 My home
  "g4v1_u5", // 四上 Unit 5 Dinner's ready
  "g4v1_u6", // 四上 Unit 6 Meet my family!
  "g4v2_u1", // 四下 Unit 1 My School
  "g4v2_u2", // 四下 Unit 2 What time is it?
  "g4v2_u3", // 四下 Unit 3 Weather
  "g4v2_u4", // 四下 Unit 4 At the farm
  "g4v2_u5", // 四下 Unit 5 My clothes
  "g4v2_u6", // 四下 Unit 6 Shopping
]);

export function isGamifiedUnit(unitId: string | undefined | null): boolean {
  return !!unitId && GAMIFIED_UNIT_IDS.has(unitId);
}
