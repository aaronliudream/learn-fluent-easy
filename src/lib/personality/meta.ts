/**
 * 性格测评的对外数字 —— 单独一个极小模块。
 *
 * 为什么不直接 import 题库:首页(LandingPage)是**同步加载**的首屏组件,
 * 为了在卡片上写一个「60 题」就把整份题库 + 16 型文案拖进首屏 bundle 不划算。
 * 所以数字放这里,由 __tests__/personality.test.ts 断言它与真实题量一致 ——
 * 「卡片文案里的数字必须有数据兜底」这条规约靠那个断言兜住,不靠记忆。
 */

/** 题目总数。改题库后若与 PERSONALITY_ITEMS.length 不符,单测会红。 */
export const PERSONALITY_ITEM_COUNT = 60;

/** 预估用时(分钟)。按每题约 8 秒估算,取整。 */
export const PERSONALITY_MINUTES = 8;

export const PERSONALITY_PATH = "/personality";
