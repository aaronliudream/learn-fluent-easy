/**
 * 短语词条闸门的**已知答案样本**。改判据先跑它,再看总数(skill 第五节)。
 *
 * 由来:`phrasePresent` 原来要求 token 逐字相同。`inasmuch as` / `to and fro`
 * 没有可屈折成分,所以没暴露;轮到 525 个教材短语(look after / take care of)
 * 会大批误伤,而且是在**烧 API 额度重试三次之后**才看得见。
 *
 * ⚠️ 判据是"允许屈折",**不是"放宽"**:词序不变、成分数不变仍然要卡死。
 *    一旦松成"含这几个词就算",`fro` 那种病句会重演 —— 而这次是几百个。
 *
 * 用法:node scripts/vocab/test-phrase-gate.mjs   末行 GATE_VERDICT
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { g1_targetPresent, g7_collocationContainsWord } from './gates.mjs';

/**
 * ⚠️ 屈折表必须**含短语的每个组成词**,不只是 headword 本身。
 *    第一版这里传 `{}`,take care of / give up 立刻挂 —— took / gave 是不规则形,
 *    后缀规则推不出来,只能靠 ECDICT 的 exchange 表。
 *    而各库的 `<bank>-inflections.json` 是**按 headword 建的**:
 *    `look after` 这个 key 下面不会有 `take` / `give` 的变形。
 *    → 所以给短语批次建表时,必须把每个组成词也塞进去(见 ingest 侧)。
 *    这不是测试的权宜之计,是生产必须做的事;这里用同一份数据模拟。
 */
const HERE = path.dirname(fileURLToPath(import.meta.url));
const EX = JSON.parse(readFileSync(path.join(HERE, 'data', 'ecdict-exchange.json'), 'utf8'));
export function tableForPhrases(phrases) {
  const t = {};
  for (const p of phrases) for (const w of String(p).toLowerCase().split(/\s+/)) {
    if (EX[w]) t[w] = EX[w];
  }
  return t;
}
const TABLE = tableForPhrases(['look after', 'take care of', 'thanks to', 'give up', 'inasmuch as', 'to and fro']);

const g1 = (s, hw, t = TABLE) => g1_targetPresent(s, hw, t) === null;      // true = 放行
const g7 = (c, hw, t = TABLE) =>
  g7_collocationContainsWord([{ collocation: c, sentence: 'x', translation_zh: '。', scene: 'work' }], hw, t) === null;

/* [短语, 文本, 期望放行?, 说明] */
const CASES = [
  // ── 真阳性:必须放行 ────────────────────────────────────────
  ['look after', 'She looks after her little brother every afternoon.', true, '第三人称单数屈折'],
  ['look after', 'He looked after the dog while we were away.', true, '过去式屈折'],
  ['look after', 'Looking after a puppy takes real patience.', true, '现在分词屈折'],
  ['take care of', 'My aunt takes care of three children on weekdays.', true, '多词短语 + 屈折'],
  ['take care of', 'Nurses took care of the patients all night.', true, '过去式'],
  ['thanks to', 'Thanks to the new bridge, the trip takes ten minutes.', true, '不可屈折的短语,原样'],
  ['inasmuch as', 'The plan is risky inasmuch as it relies on one supplier.', true, '老先例不许改坏'],
  ['to and fro', 'The branches were swaying to and fro in the wind.', true, '老先例不许改坏'],
  ['give up', 'They gave up the search after three hours.', true, '不规则过去式(靠后缀兜底之外的表)'],

  // ── 真阴性:必须拦下 ────────────────────────────────────────
  ['look after', 'She looks at the painting for a long time.', false, '只有 look,没有 after'],
  ['look after', 'After the meeting, we took a look at the report.', false, '两个词都在但**词序反了**'],
  ['look after', 'He will look carefully after the equipment.', false, '中间插了词,成分数变了'],
  ['take care of', 'Take care when you cross the street.', false, '缺 of,是半截'],
  ['take care of', 'He took care, of course, to lock the door.', false, '看着像但语义不是这个短语'],
  ['thanks to', 'She said thanks to everyone and left.', true, '⚠️ 字面同形,闸门判不了语义 —— 见下方说明'],
  ['inasmuch as', 'The plan is risky inasmuch it relies on one supplier.', false, '只用半截'],
];

let pass = 0, fail = 0;
console.log('══ g1(句中是否含完整短语)══');
for (const [hw, text, want, why] of CASES) {
  const got = g1(text, hw);
  const ok = got === want;
  ok ? pass++ : fail++;
  console.log(`  ${ok ? '✓' : '✗'} ${want ? '应放行' : '应拦下'}  ${hw.padEnd(14)} ${ok ? '' : '**判成' + (got ? '放行' : '拦下') + '** '}${why}`);
}

console.log('\n══ g7(搭配是否含完整短语)══');
const G7 = [
  ['look after', 'looks after the children', true],
  ['look after', 'looked after carefully', true],
  ['look after', 'look at the sky', false],
  ['take care of', 'takes care of the garden', true],
  ['take care of', 'take care', false],
];
for (const [hw, col, want] of G7) {
  const got = g7(col, hw);
  const ok = got === want;
  ok ? pass++ : fail++;
  console.log(`  ${ok ? '✓' : '✗'} ${want ? '应放行' : '应拦下'}  ${hw.padEnd(14)} "${col}"`);
}

console.log(`
⚠️ 说明:"She said thanks to everyone" 这一条**期望是放行**,不是笔误。
   它和 "Thanks to the new bridge" 字面完全同形,区别在语义(致谢 vs 由于)。
   机器判不了,硬造判据只会误伤真用法 —— 第九条:分不清就别硬判。
   这类要靠送审人眼看,闸门只保证"短语整体出现且词序正确"。`);

console.log(`\n通过 ${pass} · 失败 ${fail}`);
console.log(`GATE_VERDICT ${fail === 0 ? 'PASS' : 'FAIL'}`);
process.exit(fail === 0 ? 0 : 1);
