/**
 * B 段闸门的离线单测 —— 不调 API,不连库。
 *
 * 回归用例的来源是 2026-08-05 那次**误跑**的失败日志:
 * b6 的词性子闸把一大批**完全正确**的反义词判成"词性不交叠",误杀率 8.8%。
 * 根因是 ECDICT 用 `a.` 标形容词、`ad.` 标副词,而我的解析只认 `adj.`/`adv.` ——
 * 于是 safe 的 "a. 安全的" 被整条丢掉,只剩 "n. 保险箱"。
 * 下面每一条"该放行"都是那次被误杀的真实数据。
 *
 *   node scripts/vocab/test-antonym-gates.mjs
 * 退出码 0 = 全绿。⚠️ 别用管道接 grep(管道吞退出码),末行有 GATE_VERDICT。
 */
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gateAntonyms } from './gen-antonyms.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const IDX = path.join(HERE, 'data', 'ecdict-index.json');
const ecdict = existsSync(IDX) ? JSON.parse(readFileSync(IDX, 'utf8')) : null;

let pass = 0, fail = 0;
const ok = (name, cond, detail = '') => {
  if (cond) { pass++; process.stdout.write(`  ✓ ${name}\n`); }
  else { fail++; process.stdout.write(`  ✗ ${name} ${detail}\n`); }
};
const gate = (hw, pos, list) => gateAntonyms({ headword: hw, pos }, list, ecdict);

if (!ecdict) {
  process.stdout.write('⚠️ 没有 ECDICT 索引,b6 相关用例无法验。先跑:\n');
  process.stdout.write('   node scripts/vocab/gen-antonyms.mjs --build-index\n');
  process.stdout.write('\nGATE_VERDICT: SKIP\n');
  process.exit(1);
}

process.stdout.write('b1-b5 基本形态\n');
ok('空数组放行(多数词没有反义词)', gate('attorney', 'n.', []).length === 0);
ok('正常反义词放行', gate('abundant', 'adj.', ['scarce', 'sparse']).length === 0);
ok('超过 3 个被拦', gate('big', 'adj.', ['small', 'tiny', 'little', 'slight']).some(f => f.startsWith('b4')));
ok('自己不能当自己的反义词', gate('happy', 'adj.', ['happy']).some(f => f.startsWith('b2')));
ok('屈折形被拦', gate('happy', 'adj.', ['happier']).some(f => f.startsWith('b2') || f.startsWith('b3')));
ok('组内重复被拦', gate('big', 'adj.', ['small', 'Small']).some(f => f.startsWith('b5')));
ok('中文被拦', gate('big', 'adj.', ['小的']).some(f => f.startsWith('b1')));
ok('短语被拦(带空格但超长)', gate('outweigh', 'v.', ['be outweighed by something else entirely']).some(f => f.startsWith('b1')));

process.stdout.write('b3 同根 vs 否定前缀\n');
ok('同根被拦(conserve→conservation 型)', gate('conservation', 'n.', ['conservative']).some(f => f.startsWith('b3')));
// 否定前缀反义词是合法的,绝不能被同根闸误伤
ok('appropriate → inappropriate 放行', gate('appropriate', 'adj.', ['inappropriate']).length === 0);
ok('inappropriate → appropriate 放行', gate('inappropriate', 'adj.', ['appropriate']).length === 0);
ok('reversible → irreversible 放行', gate('irreversible', 'adj.', ['reversible']).length === 0);

process.stdout.write('b6 真词判定\n');
ok('生造词被拦(unintimidating)', gate('daunting', 'adj.', ['unintimidating']).some(f => f.includes('不在 ECDICT')));
ok('生造词被拦(non-greasy)', gate('greasy', 'adj.', ['non-greasy']).some(f => f.includes('不在 ECDICT')));

/* ── b6 词性子闸:下面全是那次误跑里**被误杀的真实数据**,必须全部放行 ──
 * 这一组是这个文件存在的主要理由。ECDICT 的 `a.` 一旦漏解析,它们会集体变红。 */
process.stdout.write('b6 词性交叠(2026-08-05 误杀回归组)\n');
const REGRESSIONS = [
  ['vulnerable', 'adj.', ['secure', 'strong']],
  ['toxic', 'adj.', ['safe']],
  ['bizarre', 'adj.', ['normal', 'ordinary']],
  ['incredible', 'adj.', ['ordinary']],
  ['risky', 'adj.', ['safe', 'secure']],
  ['informal', 'adj.', ['formal']],
  ['aged', 'adj.', ['young']],
  ['gigantic', 'adj.', ['small']],
  ['juvenile', 'n./adj.', ['mature']],
  ['stunning', 'adj.', ['ordinary', 'dull']],
  ['shining', 'adj.', ['dull', 'dim', 'dark']],
  ['elusive', 'adj.', ['clear']],
  ['premature', 'adj./n.', ['mature']],
  ['lofty', 'adj.', ['low', 'humble', 'ordinary']],
];
for (const [hw, pos, list] of REGRESSIONS) {
  const f = gate(hw, pos, list);
  ok(`${hw} → ${list.join('/')}`, f.length === 0, f.join(' / '));
}

/* 词性真不交叠的仍要拦下 —— 否则这道闸等于取消 */
process.stdout.write('b6 词性确实不对的仍被拦\n');
ok('fast(adj.) → slowly(adv.) 被拦', gate('fast', 'adj.', ['slowly']).some(f => f.includes('词性')));

process.stdout.write(`\nGATE_VERDICT: ${fail === 0 ? 'PASS' : 'FAIL'}  (通过 ${pass} · 失败 ${fail})\n`);
process.exit(fail === 0 ? 0 : 1);
