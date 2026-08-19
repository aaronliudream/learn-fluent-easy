/**
 * 槽位短语(sb. / sth. / one's / oneself)闸门的**已知答案样本**。
 *
 * Aaron 2026-08-18 点名的四条是硬判据 —— 点不中任何一个,判据就是坏的,
 * 别看总数好不好看:
 *     drive sb. crazy + "It drives me crazy."          → 必须放行
 *     try one's best  + "She tried her best."          → 必须放行
 *     drive sb. crazy + "He drives a car."             → 必须拦下
 *     try one's best  + "I tried the new restaurant."  → 必须拦下
 *
 * ⚠️ 槽位是**精确匹配,不是放宽**。松成"含这几个实词就算"的话,
 *    `fro` 那种病句会重演 —— 而这次是 50 个词。所以真阴性比真阳性更要紧。
 *
 * 用法:node scripts/vocab/test-phrase-slots.mjs   末行 GATE_VERDICT
 */
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { g1_targetPresent, g7_collocationContainsWord } from './gates.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
/* 用**流水线真的会读的那张表**;没有就用 ECDICT 现拼一份等价的。
   ⚠️ 拿测试自己搭的表跑,证明的是"表对了闸门就对",证明不了流水线那份建对了。 */
const T = path.join(HERE, 'data', 'textbook-slots-inflections.json');
const EXP = path.join(HERE, 'data', 'ecdict-exchange.json');
let TABLE = {};
if (existsSync(T)) { TABLE = JSON.parse(readFileSync(T, 'utf8')); console.log(`表:${path.basename(T)}(${Object.keys(TABLE).length} key)\n`); }
else if (existsSync(EXP)) {
  const EX = JSON.parse(readFileSync(EXP, 'utf8'));
  for (const w of ['drive', 'try', 'lend', 'take', 'make', 'put', 'keep', 'go', 'come', 'give', 'do', 'be', 'have', 'pull', 'break']) if (EX[w]) TABLE[w] = EX[w];
  console.log(`表:ecdict-exchange 现拼(${Object.keys(TABLE).length} key)—— 正式表还没建\n`);
}

const g1 = (s, hw) => g1_targetPresent(s, hw, TABLE) === null;
const g7 = (c, hw) => g7_collocationContainsWord(
  [{ collocation: c, sentence: 'x', translation_zh: '。', scene: 'work' }], hw, TABLE) === null;

/* [短语, 文本, 期望放行?, 说明] */
const CASES = [
  // ── Aaron 点名的四条 ────────────────────────────────────────
  ['drive sb. crazy', 'It drives me crazy when people talk loudly.', true, '★ 槽位=me,首词屈折 drives'],
  ["try one's best", 'She tried her best to finish the work on time.', true, '★ 物主槽位=her,过去式 tried'],
  ['drive sb. crazy', 'He drives a car to work every single morning.', false, '★ 有 drives 但没有 crazy'],
  ["try one's best", 'I tried the new restaurant near the train station.', false, '★ 有 tried 但没有 best'],

  // ── 真阳性:槽位的正常填法 ──────────────────────────────────
  ['drive sb. crazy', 'The constant noise drove my little brother crazy.', true, '槽位吃 3 个 token'],
  ['lend sb a hand', 'Could you lend your neighbour a hand this weekend?', true, 'sb + 冠词直接量 a'],
  ["make one's own decision", 'Teenagers should make their own decision about hobbies.', true, '物主=their'],
  ["put oneself in sb's shoes", 'Try to put yourself in his shoes before judging.', true, '反身 + 物主两个槽位'],
  ["take sb's temperature", "The nurse took the child's temperature twice this morning.", true, "物主槽位吃「限定词 + 名词's」两个 token"],

  // ── 真阴性:必须拦下 ────────────────────────────────────────
  ["try one's best", 'She tried best to finish the work on time.', false, '物主槽位空缺,不能当没有'],
  ["try one's best", 'She tried the best restaurant in the whole city.', false, 'the 不是物主限定词'],
  ['drive sb. crazy', 'Crazy drivers make me nervous on the highway.', false, '词序不对'],
  ['lend sb a hand', 'He lent a hand to the new student yesterday.', false, 'sb 槽位空缺(lend a hand 是另一个说法)'],
  ["put oneself in sb's shoes", 'Put the shoes in the box by the door.', false, '两个槽位都没填'],
  ['drive sb. crazy', 'The noise drives everyone in the whole building completely crazy.', false, '槽位超过 3 个 token,上界必须有'],
];

let pass = 0, fail = 0, starFail = 0;
console.log('══ g1(句中是否含完整短语)══');
for (const [hw, text, want, why] of CASES) {
  const got = g1(text, hw);
  const ok = got === want;
  ok ? pass++ : (fail++, why.startsWith('★') && starFail++);
  console.log(`  ${ok ? '✓' : '✗'} ${want ? '应放行' : '应拦下'}  ${hw.padEnd(26)} ${ok ? '' : `**判成${got ? '放行' : '拦下'}** `}${why}`);
}

console.log('\n══ g7(搭配是否含完整短语)══');
for (const [hw, col, want] of [
  ['drive sb. crazy', 'drives me crazy', true],
  ['drive sb. crazy', 'drives a car', false],
  ["try one's best", 'tried her best', true],
  ["try one's best", 'tried the best', false],
]) {
  const got = g7(col, hw);
  const ok = got === want;
  ok ? pass++ : fail++;
  console.log(`  ${ok ? '✓' : '✗'} ${want ? '应放行' : '应拦下'}  ${hw.padEnd(26)} "${col}"`);
}

console.log(`\n通过 ${pass} · 失败 ${fail}${starFail ? ` · **其中 Aaron 点名的四条挂了 ${starFail} 条**` : ''}`);
console.log(`GATE_VERDICT ${fail === 0 ? 'PASS' : 'FAIL'}`);
process.exit(fail === 0 ? 0 : 1);
