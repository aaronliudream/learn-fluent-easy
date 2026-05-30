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
  // ↓ Phase 2: 三/五/六年级全部 34 个单元接入游戏化(已核对:已发布、7 关、含终极挑战 Boss)
  // 三年级(12)
  "g3v1_u1", // 三上 Unit 1 Hello!
  "g3v1_u2", // 三上 Unit 2 Colours
  "g3v1_u3", // 三上 Unit 3 Look at me!
  "g3v1_u4", // 三上 Unit 4 We love animals
  "g3v1_u5", // 三上 Unit 5 Let's eat!
  "g3v1_u6", // 三上 Unit 6 Happy birthday!
  "g3v2_u1", // 三下 Unit 1 Welcome back
  "g3v2_u2", // 三下 Unit 2 My family
  "g3v2_u3", // 三下 Unit 3 At the zoo
  "g3v2_u4", // 三下 Unit 4 Where is my car?
  "g3v2_u5", // 三下 Unit 5 Do you like pears?
  "g3v2_u6", // 三下 Unit 6 How many?
  // 五年级(12)
  "g5v1_u1", // 五上 Unit 1 What's he like?
  "g5v1_u2", // 五上 Unit 2 My week
  "g5v1_u3", // 五上 Unit 3 What would you like?
  "g5v1_u4", // 五上 Unit 4 What can you do?
  "g5v1_u5", // 五上 Unit 5 There is a big bed
  "g5v1_u6", // 五上 Unit 6 In a nature park
  "g5v2_u1", // 五下 Unit 1 When is Easter?
  "g5v2_u2", // 五下 Unit 2 My favourite season
  "g5v2_u3", // 五下 Unit 3 My school calendar
  "g5v2_u4", // 五下 Unit 4 Shopping
  "g5v2_u5", // 五下 Unit 5 Whose dog is it?
  "g5v2_u6", // 五下 Unit 6 Work quietly!
  // 六年级(10;六下只有 4 个单元)
  "g6v1_u1", // 六上 Unit 1 How can I get there?
  "g6v1_u2", // 六上 Unit 2 Ways to go to school
  "g6v1_u3", // 六上 Unit 3 My weekend plan
  "g6v1_u4", // 六上 Unit 4 I have a pen pal
  "g6v1_u5", // 六上 Unit 5 What does he do?
  "g6v1_u6", // 六上 Unit 6 How do you feel?
  "g6v2_u1", // 六下 Unit 1 How tall are you?
  "g6v2_u2", // 六下 Unit 2 Last weekend
  "g6v2_u3", // 六下 Unit 3 Where did you go?
  "g6v2_u4", // 六下 Unit 4 Then and now
]);

export function isGamifiedUnit(unitId: string | undefined | null): boolean {
  return !!unitId && GAMIFIED_UNIT_IDS.has(unitId);
}
