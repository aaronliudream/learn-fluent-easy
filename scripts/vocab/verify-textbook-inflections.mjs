/**
 * 用**流水线真正读的那份文件**跑已知答案样本 —— `data/textbook-inflections.json`。
 *
 * ⚠️ 为什么单独有这一支:`test-phrase-gate.mjs` 里那张表是测试**自己搭的**
 *    (直接从 ecdict-exchange.json 现拼)。它证明的是"表对了闸门就对",
 *    **证明不了流水线读的那份文件已经建对**。
 *    「拦下了不等于拦对了」的反面同样成立:**放行了也不等于放行对了** ——
 *    要确认放行它的是真实那张表,不是测试脚手架。
 *
 * 判据(Aaron 2026-08-18 点名的四条):
 *   take care of vs "Nurses took care of the patients"   → 必须放行
 *   give up      vs "They gave up the search"            → 必须放行
 *   look after   vs "She looks after her brother"        → 必须放行
 *   take care of vs "He took care, of course, to lock"   → 必须拦下
 *
 * 用法:node scripts/vocab/verify-textbook-inflections.mjs   末行 GATE_VERDICT
 */
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { g1_targetPresent } from './gates.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TABLE_PATH = path.join(HERE, 'data', 'textbook-inflections.json');
const CSV_PATH = path.join(HERE, 'data', 'textbook.csv');

if (!existsSync(TABLE_PATH)) {
  console.error(`x 没有 ${TABLE_PATH} —— 先跑 ingest-textbook.mjs`);
  process.exit(2);
}
/* ⚠️ 就是生成流水线读的那一份,不另外拼 */
const TABLE = JSON.parse(readFileSync(TABLE_PATH, 'utf8'));
const HEADWORDS = new Set(readFileSync(CSV_PATH, 'utf8').trim().split(/\r?\n/).slice(1)
  .map(l => l.split(',')[0]));

console.log(`读的是流水线那份:${path.relative(process.cwd(), TABLE_PATH)}(${Object.keys(TABLE).length} 个 key)\n`);

const CASES = [
  ['take care of', 'Nurses took care of the patients all night long.', true, '不规则过去式 took'],
  ['give up', 'They gave up the search after three long hours.', true, '不规则过去式 gave'],
  ['look after', 'She looks after her little brother every single afternoon.', true, '第三人称单数 looks'],
  ['take care of', 'He took care, of course, to lock the front door.', false, '短语内部被逗号切开,不是这个短语'],
  // 顺带钉住几条不该放行的
  ['look after', 'She looks at the painting for a long time.', false, '只有 look 没有 after'],
  ['take care of', 'Take care when you cross the street.', false, '缺 of,是半截'],
];

let fail = 0;
for (const [hw, text, want, why] of CASES) {
  const inCsv = HEADWORDS.has(hw);
  const got = g1_targetPresent(text, hw, TABLE) === null;
  const ok = got === want;
  if (!ok) fail++;
  console.log(`  ${ok ? '✓' : '✗'} ${want ? '应放行' : '应拦下'}  ${hw.padEnd(14)} ${inCsv ? '' : '⚠️不在本批CSV里 '}${ok ? '' : `**判成${got ? '放行' : '拦下'}** `}${why}`);
}

/* 表本身的体检:短语的组成词到底进去了没有 —— 这才是本次要确认的那件事 */
console.log('\n── 表内容体检(抽查不规则动词) ──');
let missComp = 0;
for (const v of ['take', 'give', 'look', 'come', 'go', 'make', 'get', 'put', 'run', 'break']) {
  const has = !!TABLE[v];
  if (!has) missComp++;
  console.log(`  ${has ? '✓' : '✗'} ${v.padEnd(7)} ${has ? TABLE[v].join(' / ') : '**表里没有**'}`);
}

/* 全量:本批每个短语的每个组成词,只要 ECDICT 有屈折就必须在表里 */
const EX = JSON.parse(readFileSync(path.join(HERE, 'data', 'ecdict-exchange.json'), 'utf8'));
const gaps = [];
for (const hw of HEADWORDS) {
  if (!hw.includes(' ')) continue;
  for (const part of hw.split(/\s+/)) {
    if (EX[part] && !TABLE[part]) gaps.push(`${hw} → ${part}`);
  }
}
console.log(`\n本批 ${[...HEADWORDS].filter(h => h.includes(' ')).length} 个短语的组成词,` +
  `ECDICT 有屈折却没进表的:${gaps.length}${gaps.length ? ' → ' + gaps.slice(0, 10).join(', ') : ''}`);

const ok = fail === 0 && missComp === 0 && gaps.length === 0;
console.log(`\nGATE_VERDICT ${ok ? 'PASS' : 'FAIL'}`);
process.exit(ok ? 0 : 1);
