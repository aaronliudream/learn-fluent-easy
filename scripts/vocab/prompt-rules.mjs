/**
 * 生成 prompt 里的共用硬规则。
 *
 * ⚠️ 为什么单独成模块:def_zh 的这条规则同时被
 *   ① generate-content.mjs(新词生成)
 *   ② repair-defzh.mjs(存量释义重修)
 * 使用。写两份必然漂移 —— 修好了重修脚本、忘了改主生成器,下一批又是老毛病。
 */

/**
 * def_zh 义项规则。
 *
 * 由来:第一版 prompt 写的是"覆盖最常用 1-2 个义项",结果 198 词跑出来
 * **198/198 全是双义项、单义项 0 个** —— 模型把"1-2 个"读成了"总是给 2 个",
 * 于是 currently「目前；现在」、hypothesis「假设；假说」、alliance「联盟；联合」
 * 这类同义堆砌大面积出现。这个问题机器闸门兜不住(判断两个中文词是否同义
 * 要语义知识),只能靠 prompt 措辞压住,所以这里用的是强措辞 + 正反例。
 * 换成本规则后重修,双义占比 100% → 32.3%。
 */
export const DEF_ZH_RULE = `默认给 1 个义项。仅当两个义项差异大到词典会分列义项时才给 2 个,用全角分号 "；" 分隔。

正例(真双义,保留两个):
  context  -> 上下文；背景        (语言环境 vs 事件背景,词典分列)
  coverage -> 保险范围；报导范围   (保险 vs 新闻,两个领域)
  defense  -> 防御；辩护          (军事 vs 法律)

反例(单义,绝不许并列近义词):
  currently     -> 目前            ✅  NOT 目前；现在        ❌
  hypothesis    -> 假设            ✅  NOT 假设；假说        ❌
  alliance      -> 联盟            ✅  NOT 联盟；联合        ❌
  administrator -> 管理员          ✅  NOT 管理员；行政人员  ❌
  fraud         -> 欺诈            ✅  NOT 欺诈;诈骗        ❌

If the second candidate is merely a synonym, a rewording, or a stylistic variant
of the first, you MUST output only ONE sense. Most words have only one.

格式硬要求(实测踩过的坑,必须遵守):
  · 每个义项 2-8 个汉字的**词典式短语**,不是句子。
  · 禁止写成解释句、禁止举例、禁止加句号。
  · 反例:entity -> "一个作为特定和独立单位存在的事物；法律实体、商业实体…都可视为实体。" ❌
    正例:entity -> "实体" ✅
  · 分号只能用来分隔两个义项,不能出现在解释性文字里。
不要写词性缩写,只写释义本身。`;
