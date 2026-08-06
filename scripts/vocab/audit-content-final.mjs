/**
 * A 段全量回溯复检 —— 拿**当前终版闸门**重新验一遍已入库的 4471 词。
 *
 * 为什么必须有这个脚本:内容是分批生成的,而闸门在生成过程中改过好几次
 * (B2/C1 句长下限放宽、def_zh 义项上限 12→8、g13 同根搭配新增、
 *  g1 连字符 headword 修复)。**早期批次是拿旧闸门放行的**,
 * 断点续跑又会跳过已缓存的词 —— 不主动回溯,旧规格的内容就永远留在库里。
 *
 * 口径与生成期一致:
 *   · 按档句长(useTierLength: true)
 *   · g4 全局去重用**前缀语料**(第 N 个词只与前 N-1 个比),
 *     这正是生成时的比对面;拿全量语料比会让每句和自己撞,全员误判。
 *   · 传真实屈折表 —— 不传的话 theses/clergymen/fungi/strata 会被误判成"目标词缺席"。
 *
 *   node scripts/vocab/audit-content-final.mjs [--bank=toefl]
 * 退出码 0 = 全绿。末行 AUDIT_VERDICT 便于取判定(别用管道,会吞退出码)。
 */
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  runAllGates, ngrams, defZhShapeProblem, g12_defEnNotCircular,
  g13_collocationNotSameRoot, SCENES,
} from './gates.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const arg = (k, d) => process.argv.find(a => a.startsWith(`--${k}=`))?.split('=').slice(1).join('=') ?? d;
const BANK = arg('bank', 'toefl');

const content = JSON.parse(readFileSync(path.join(HERE, 'data', 'generated', `${BANK}-content.json`), 'utf8'));
const inflectPath = path.join(HERE, 'data', `${BANK}-inflections.json`);
const table = existsSync(inflectPath) ? JSON.parse(readFileSync(inflectPath, 'utf8')) : {};
if (!existsSync(inflectPath)) process.stdout.write('⚠️ 没有屈折表,不规则复数会被误判成"目标词缺席"\n');

const all = Object.values(content);
const running = [];
const buckets = { gate: [], shape: [], circular: [], english: [], g13: [], exCount: [], scene: [] };

for (const w of all) {
  const fails = runAllGates(w, w, running, table, { useTierLength: true });
  if (fails.length) buckets.gate.push(`${w.headword}: ${fails[0]}`);
  for (const e of w.examples) running.push(ngrams(e.sentence));

  const shape = defZhShapeProblem(w.def_zh);
  if (shape) buckets.shape.push(`${w.headword}: ${shape}`);
  const circ = g12_defEnNotCircular(w.def_en, w.headword, table);
  if (circ) buckets.circular.push(`${w.headword}: ${circ}`);
  if (/[A-Za-z]/.test(w.def_zh)) buckets.english.push(`${w.headword}: ${w.def_zh}`);
  const g13 = g13_collocationNotSameRoot(w.examples, w.headword, table);
  if (g13) buckets.g13.push(`${w.headword}: ${g13}`);
  if (w.examples.length !== 3) buckets.exCount.push(`${w.headword}: ${w.examples.length} 条例句`);
  for (const e of w.examples) if (!SCENES.includes(e.scene)) buckets.scene.push(`${w.headword}: scene="${e.scene}"`);
}

const LABELS = {
  gate: 'g1-g9(按档句长 + 前缀语料)',
  shape: 'def_zh 体裁(义项 ≤8 字)',
  circular: 'def_en 循环定义',
  english: 'def_zh 混英文',
  g13: 'g13 搭配同根同义反复',
  exCount: '每词恰好 3 条例句',
  scene: 'scene 在 10 值枚举内',
};

process.stdout.write(`\n════ A 段终版闸门回溯复检 · ${all.length} 词 / ${running.length} 句 ════\n`);
let total = 0;
for (const [k, list] of Object.entries(buckets)) {
  total += list.length;
  process.stdout.write(`${LABELS[k].padEnd(30)} 不合格 ${list.length}\n`);
  list.slice(0, 8).forEach(s => process.stdout.write(`    ✗ ${s}\n`));
}
const dbl = all.filter(w => String(w.def_zh).includes('；')).length;
process.stdout.write(`\n双义占比 ${(dbl / all.length * 100).toFixed(1)}%(仅作观测,不再当验收指标)\n`);
process.stdout.write(`\nAUDIT_VERDICT: ${total === 0 ? 'PASS' : 'FAIL'}(合计不合格 ${total})\n`);
process.exit(total === 0 ? 0 : 1);
