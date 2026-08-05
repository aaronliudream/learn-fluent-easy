import { SPEC } from './spec.mjs';

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
/**
 * 功能词(连词/介词/副词)的 collocation 与例句规格。
 *
 * 由来:nonetheless 的三条 collocation 被写成了整句
 *   "nonetheless, the research shows significant results."
 * —— 那不是搭配,是例句复制。而且例3
 *   "Feeling exhausted, I decided to go out; nonetheless, I went for a walk."
 * 前后没有任何转折(出门和散步是同一件事),逻辑是假的。
 * 同批的 amid 则是正确示范:amid protests / amid uncertainty / amid chaos。
 *
 * 实词靠"动词+名词"式搭配,功能词没有这种搭配,只有**用法模式**,
 * 所以单独给一套规格,按 pos 触发。
 */
export const FUNCTION_WORD_RULE = `⚠️ 这是一个功能词(连词/介词/副词)。功能词没有实词那种"动词+名词"搭配,
所以 collocation 字段要给**简短的用法模式**,不是整句:
  · 长度 2-5 个词,禁止写成完整句子,禁止带句号。
  · 正例(amid, prep.):  "amid protests" / "amid uncertainty" / "amid chaos"
  · 正例(nonetheless):  "..., nonetheless, ..." / "nonetheless, + 主句" / "小句; nonetheless"
  · 反例(必须避免):     "nonetheless, the research shows significant results." ❌ 这是句子不是模式

例句的逻辑必须真实成立:
  · 转折连词(nonetheless / however / although / whereas)的例句,
    前后两半必须**真的构成转折** —— 前半是不利/相反条件,后半是仍然发生的结果。
  · 反例:"Feeling exhausted, I decided to go out; nonetheless, I went for a walk." ❌
    (出门和散步是同一件事,没有任何转折,逻辑是假的)
  · 正例:"The data contained clear errors; nonetheless, the conclusion held up." ✅
  · 介词(amid / despite / beyond)的例句,须体现该介词真实的语义关系(伴随、让步、方位等)。`;

export const DEF_ZH_RULE = `默认给 1 个义项。仅当两个义项差异大到词典会分列义项时才给 ${SPEC.defZh.maxSenses} 个,用全角分号 "${SPEC.defZh.sep}" 分隔。

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

⚠️ 删同义堆砌之前,先检查有没有**被漏掉的真义项** —— 别把"两个近义词"直接砍成一个,
   而要问"这个词是不是还有另一个真正不同的常用义没写进来"。
   范例:compensation 原本写「补偿；赔偿」(两个近义词,是同义堆砌),
   但正确做法不是砍成「补偿」,而是补上被漏掉的真义项 ->「补偿；薪酬」
   (赔偿性补偿 vs 薪酬报酬,是词典分列的两个义项)。
   先补真义,补不出来再降为单义。

⚠️ **多词性词:两个义项要分属不同词性,不要两个都落在同一个词性上。**
   由来:usher 标着 n./v.,给出来的是「引导；接待」—— 两个都是动词义,
   名词的"引座员"整个丢了。学生查这个词看不到它能当名词用。
   正例:usher (n./v.)   -> 引座员；引导    ✅  NOT 引导；接待 ❌
        founder (n./v.) -> 创始人；沉没    ✅  NOT 创始人 ❌(动词义缺席)
        honor (n./v.)   -> 荣誉；尊敬      ✅
   ⚠️ 但**不许为了凑词性硬编义项**。词性标注本身有噪声,shrimp 标成 n./v.、
      vaccine 标成 n./adj.,这些词根本没有第二个词性的常用义 ——
      那就老实只给一个义项。判据是"词典里真的分列吗",不是"标注里有几个词性"。

⚠️ 最容易搞错的一点:def_zh 要的是**这个英文词的中文对应词**,
   不是"把英文释义翻译成中文"。实测 76/198 都栽在这里 ——
   模型把 def_en 译成中文当 def_zh 交上来,于是全是解释句。
   对照(左边是错的译释义,右边是对的给对应词):
     ethnic        ❌ 与特定种族或文化群体相关的   ✅ 种族的；民族的
     regulatory    ❌ 与控制某事的规则或法律相关的  ✅ 监管的
     congressional ❌ 与立法机构相关的            ✅ 国会的
     integrity     ❌ 诚实和拥有强烈道德原则的品质  ✅ 正直；诚信
     awareness     ❌ 对某种情况或事实的知识或感知  ✅ 意识；认识
     attorney      ❌ 在法律事务中代表他人的人。    ✅ 律师
     accounting    ❌ 会计是记录财务交易的过程。    ✅ 会计
   问自己:"中国学生查词典会看到的那个词是什么" —— 写那个,不要写定义。

⚠️ 禁止使用这些**解释性标记词** —— 出现任何一个就说明你在写解释而不是释义,会被机器打回:
   某物 / 某人 / 某事 / 某种 / 的行为 / 的状态 / 的人 / 的过程 / 的性质 / 的能力 /
   的东西 / 的事物 / 的方式 / 相关的 / 有关的 / 一种 / 一组 / 一系列 / 一个 /
   通常 / 尤其 / 特别是 / 例如 / 是指 / 指的是 / 用于
   对照(左错右对):
     colonial   ❌ 与殖民地相关的        ✅ 殖民的；殖民地的
     minimize   ❌ 将某物尽可能缩小      ✅ 使最小化；尽量减少
     survivor   ❌ 在某个事件后仍然存活的人 ✅ 幸存者
     dealer     ❌ 买卖商品或服务的人     ✅ 经销商；商人
     mechanism  ❌ 实现某种目标的系统或过程 ✅ 机制；机构

⚠️ **中文释义里绝不允许出现英文字母。**
   想不出中文对应词就给最接近的中文,**不要把原词或屈折形抄进来充数**。
   实测反例:inappropriate → 「不当的， inappropriate 的」❌(应为「不当的」)
             resemblance   → 「相似；相 resemblance」❌(应为「相似；相像」)
             stagger       → 「摇晃； staggered 也指错开」❌(应为「摇晃；错开」)

格式硬要求(实测踩过的坑,必须遵守):
  · 每个义项 ${SPEC.defZh.minChars}-${SPEC.defZh.maxChars} 个汉字的**词典式短语**,不是句子。
  · 禁止写成解释句、禁止举例、禁止加句号。
  · 反例:entity -> "一个作为特定和独立单位存在的事物；法律实体、商业实体…都可视为实体。" ❌
    正例:entity -> "实体" ✅
  · 分号只能用来分隔两个义项,不能出现在解释性文字里。
不要写词性缩写,只写释义本身。`;

/**
 * 是否功能词(触发 FUNCTION_WORD_RULE)。
 * ⚠️ 要求**每一个词性段**都是功能类,不能只要"含 adv." 就算 ——
 *    否则 stark(adj./adv.)、well(n./v./adj./adv./int.)这种实词
 *    也会被套上"没有动名搭配"的规格,反而把好搭配判错。
 *    nonetheless(conj./adv.)、amid(prep.)才是真功能词。
 */
const FUNCTION_POS = new Set(['conj.', 'prep.', 'adv.', 'int.', 'pron.', 'aux.', 'art.']);
export function isFunctionWord(pos) {
  const parts = String(pos || '').split('/').map(s => s.trim()).filter(Boolean);
  return parts.length > 0 && parts.every(p => FUNCTION_POS.has(p));
}
