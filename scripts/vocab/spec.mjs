/**
 * 内容规格的**单一事实源**。
 *
 * ══ 为什么必须有这个文件(第四条规矩) ══
 *
 * 闸门的判据和 prompt 里写给模型的规格,如果各写各的数,就一定会漂。
 * 同一个错已经犯了两次:
 *   ① def_zh:prompt 写"每义项 2-8 个汉字",闸门却放到 12 ——
 *      中间 9-12 这一档整个漏网,honor「尊敬或对成就或品质的认可」
 *      这种解释句大摇大摆过闸。
 *   ② 反义词:prompt 写"只给单个英文词",b1 的正则却把空格放进了字符集 ——
 *      gush → "hold back" 这种短语过闸。
 * 还有一处**已经漂了但没造成后果**的:generate-content 的注释写
 *   "B2 10-16 / C1 12-20",而常量是 B2 [9,16] / C1 [10,20] ——
 *   注释在撒谎,读代码的人(包括我)会按注释去理解。
 *
 * 规矩:**闸门判据与 prompt 文案都必须从这里取数,禁止任何一侧写字面量。**
 * 改规格只改这个文件,两侧自动同步;做不到自动同步的,就不算单一事实源。
 */

export const SPEC = {
  /** 中文释义 */
  defZh: {
    maxSenses: 2,          // 最多几个义项
    minChars: 2,           // 单个义项的汉字数下限
    maxChars: 8,           // 上限。⚠️ 这个数就是闸门阈值,别再另写一个
    sep: '；',             // 义项分隔符(全角分号)
  },
  /** 英文释义 */
  defEn: {
    maxWords: 15,
  },
  /** 例句 */
  example: {
    perWord: 3,
    /** 按 CEFR 档的词数区间。⚠️ 只对新生成生效,回溯复检用 legacy。 */
    lengthByTier: { A2: [8, 12], B1: [8, 14], B2: [9, 16], C1: [10, 20] },
    legacyLength: [8, 16],
  },
  /** 去重阈值 */
  dedup: {
    globalMax: 0.5,        // g4:与历史语料 4-gram 重合率上限
    intraWordMax: 0.3,     // g6:同词三句两两重合率上限
  },
  /** B 段 反义词 */
  antonyms: {
    max: 3,
    minChars: 2,
    maxChars: 20,
    allowSpace: false,     // ⚠️ b1 的正则必须照这个来,别再自己决定
  },
};

/** "8-12" 这样的区间文案,给 prompt 用。 */
export const fmtRange = ([lo, hi]) => `${lo}-${hi}`;

/** "A2 8-12 / B1 8-14 / B2 9-16 / C1 10-20",给 prompt 和文档用,永不手写。 */
export const tierRangeText = () =>
  Object.entries(SPEC.example.lengthByTier).map(([t, r]) => `${t} ${fmtRange(r)}`).join(' / ');

/** 反义词形态正则,由 SPEC 推出来 —— 闸门和 prompt 共用同一个判据。 */
export const antonymShapeRe = () => {
  const { minChars, maxChars, allowSpace } = SPEC.antonyms;
  const cls = allowSpace ? "A-Za-z'\\- " : "A-Za-z'\\-";
  return new RegExp(`^[A-Za-z][${cls}]{${minChars - 1},${maxChars - 1}}$`);
};
