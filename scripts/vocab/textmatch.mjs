/**
 * 「文本是否包含某说法」的**唯一实现** —— 生成端闸门与 DB 端 validate 共用。
 *
 * ⚠️ 立此模块的缘由(Aaron 2026-08-07):同一个坑跨 D/I 两段栽了四次 ——
 *    首词屈折(came across)、虚位主语(Her birthday escaped my memory)、
 *    物主代词(learn from his mistakes)、**以及 i5 修好了但 SQL 那把尺没跟着改**。
 *    规矩:凡此类判据必须形态归一化后比对,且**生成端与 DB 端共用同一套实现,
 *    不是两份等价代码**。SQL 谓词由 sqlContainsPredicate() 生成,不手写。
 */

/** 不参与命中判定的词:虚位主语 / 代词 / be 动词 / 虚词 / 同族可替换位。 */
export const STOPWORDS = new Set([
  // 虚位主语与指示词(最易变的位置)
  'it', 'that', 'this', 'there', 'these', 'those',
  // 人称与物主代词
  'i', 'you', 'he', 'she', 'we', 'they', 'me', 'him', 'her', 'them', 'us',
  'my', 'your', 'his', 'its', 'our', 'their', 'one', 'ones',
  'yourself', 'himself', 'herself', 'themselves',
  // be 动词(缩写还原后会露出来)
  'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  // 高频虚词
  'a', 'an', 'the', 'to', 'of', 'in', 'on', 'at', 'for', 'and', 'or', 'but',
  'no', 'not', 'so', 'as', 'if', 'do', 'does', 'did',
  // 同族替换位(whatever / wherever / whenever 在真实句子里互换)
  'whatever', 'wherever', 'whenever', 'however',
]);

/** 默认命中率门槛:说法的实义词至少这么多比例出现在文本中。 */
export const HIT_RATIO = 0.6;

/** 归一化:统一弯引号 → 剥缩写尾巴(i'm→i、that's→that)→ 只留字母与空格。 */
export const normalize = s => String(s ?? '').toLowerCase()
  .replace(/[’]/g, "'")
  .replace(/\bsth\b|\bsb\b|\bsomeone\b|\bsomething\b/g, ' ')
  .replace(/'[a-z]+/g, '')
  .replace(/[^a-z ]/g, ' ')
  .replace(/\s+/g, ' ').trim();

/** 说法里参与命中判定的实义词(≤2 字母与停用词一律不参与)。 */
export const contentWords = s =>
  normalize(s).split(' ').filter(w => w.length > 2 && !STOPWORDS.has(w));

/** needle 的实义词有多少比例出现在 haystack 里(0–1);无实义词时视为 1。 */
export function hitRatio(needle, haystack) {
  const need = contentWords(needle);
  if (!need.length) return 1;
  const hay = ' ' + normalize(haystack) + ' ';
  return need.filter(w => hay.includes(w)).length / need.length;
}

/** haystack 是否算包含 needle。 */
export const contains = (needle, haystack, ratio = HIT_RATIO) =>
  hitRatio(needle, haystack) >= ratio;

/** 供 SQL 用的停用词字面量列表 —— **由上面同一份 STOPWORDS 生成**。 */
export const sqlStopwordList = () =>
  [...STOPWORDS].filter(w => w.length > 2)
    .map(w => `'${w.replace(/'/g, "''")}'`).join(', ');

/**
 * 生成 SQL 谓词:`needleExpr` 的实义词命中 `hayExpr` 的比例 < ratio 即为不合格。
 * 与 hitRatio() 是同一条规则的两种执行环境,不是两份实现。
 */
export function sqlHitRatioBelow(needleExpr, hayExpr, ratio = HIT_RATIO) {
  const norm = e => `regexp_replace(regexp_replace(regexp_replace(lower(${e}), '''[a-z]+', '', 'g'), '[^a-z ]', ' ', 'g'), '\\s+', ' ', 'g')`;
  return `(
           SELECT count(*) FILTER (WHERE position(w in ${norm(hayExpr)}) > 0)::numeric
                  / NULLIF(count(*), 0)
             FROM unnest(string_to_array(${norm(needleExpr)}, ' ')) AS w
            WHERE length(w) > 2 AND w NOT IN (${sqlStopwordList()})
         ) < ${ratio}`;
}
