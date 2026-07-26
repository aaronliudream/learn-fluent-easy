/**
 * 统一错题本 user_mistakes「隐藏模块」——**单一来源**。
 *
 * ★为什么单开一个文件★
 * 这份排除清单此前是**手写字面量散落在各查询里**(/mistakes、复习门各抄一份,今日复习漏抄),
 * 已经两次因「加了新模块漏改一处」出事(老师端裸 module 排除集 → 写作错题长期对老师不可见;
 * junior_cloze 整篇行漏进今日复习 → 只有篇名没有答案的残卡)。症状要几周后才在某个页面冒出来。
 * 故:**任何需要隐藏 module 的改动,前端侧改动点只有本文件一处**,查询里禁止再写字面量。
 *
 * ★fail-safe 默认值★
 * 所有查询点默认用 `MISTAKE_HIDDEN_DEFAULT`(三张表的并集)。要放开某一类,必须显式调
 * `hiddenModulesExcept(...)` **并在调用处写明为什么放开**。
 * 这样漏改的后果从「该藏的没藏」(几周后才在某页面冒出来)变成「该显示的没显示」
 * (用户一眼看得见)——默认值站在能被发现的那一侧。
 *
 * ⚠️ SQL/RPC 侧有各自的一份(老师端 get_student_mistakes / get_student_mistake_counts),
 *    两侧无法共享同一符号 → 需要一致性校验兜底,见 supabase/rpc/ 权威定义文件(E 节 + ⑧)。
 */

/**
 * 「薄行」裸模块:edge(record-attempt)对这批 module 无差别写过无 snapshot 的薄行
 * (题干/选项全空),已被 hub_listening / senior_cloze / senior_grammar 等完整快照取代。
 *
 * ⚠️ 精确匹配、绝不用 like —— 必须放行 senior_grammar / gaokao_grammar 等正牌完整错题。
 */
export const MISTAKE_THIN_MODULES = [
  "listening",
  "cloze",
  "vocab",
  "grammar",
  "writing",
  "phonics",
] as const;

/**
 * 「整篇型」模块:一行 = 一整篇(多个小题在 snapshot.questions[] 里),顶层没有 options。
 * 单题渲染器(今日复习/复习门)拿它只能显示一个光秃秃的篇名,答案还是 NULL → 无效复习。
 * 只有 /mistakes 有 RedoPassageModal 能逐题渲染,故那里显式放开。
 *
 * ⏭️ junior_cloze 拆成「一空一条」后应从本列表移除(届时它就是正常单题了)。
 */
export const MISTAKE_PASSAGE_MODULES = ["junior_cloze"] as const;

/**
 * 「已归档」模块:数据模型迁移后留档的老行,不物理删除但对所有用户可见面隐藏。
 * 归档行既不是薄行也不是整篇型,单开一类,别混进上面两张表。
 * ⏭️ junior_cloze 拆条迁移落地时填入 'junior_cloze_archived'。
 */
export const MISTAKE_ARCHIVED_MODULES: readonly string[] = [];

/**
 * **所有查询点的默认排除集** = 三张表的并集。没有特殊理由就用它。
 */
export const MISTAKE_HIDDEN_DEFAULT: readonly string[] = [
  ...MISTAKE_THIN_MODULES,
  ...MISTAKE_PASSAGE_MODULES,
  ...MISTAKE_ARCHIVED_MODULES,
];

/**
 * 从默认排除集里**放开**某几类(即:这些 module 允许出现在结果里)。
 * 调用处必须写注释说明为什么这一页有能力渲染被放开的那一类。
 */
export function hiddenModulesExcept(...allow: readonly (readonly string[])[]): string[] {
  const allowed = new Set(allow.flat());
  return MISTAKE_HIDDEN_DEFAULT.filter((m) => !allowed.has(m));
}

/**
 * 拼 PostgREST `.not("module", "in", …)` 需要的列表串:`(a,b,c)`。
 * 模块名是代码内常量(纯 [a-z_]),不含逗号/括号/引号,无需转义。
 * ⚠️ 传空数组会得到 `()` —— PostgREST 对空 in 列表行为未定义,故调用方必须保证非空;
 *    `MISTAKE_HIDDEN_DEFAULT` 恒非空(THIN 有 6 项),`hiddenModulesExcept` 也不可能清空它。
 */
export function pgInList(modules: readonly string[]): string {
  return `(${modules.join(",")})`;
}
