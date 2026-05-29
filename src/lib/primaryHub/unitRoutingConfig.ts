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
]);

export function isGamifiedUnit(unitId: string | undefined | null): boolean {
  return !!unitId && GAMIFIED_UNIT_IDS.has(unitId);
}
