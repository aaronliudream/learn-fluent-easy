/**
 * 出「def_zh 用逗号当分隔符」的待裁决清单。
 *
 * 由来:Aaron 查 monochrome「单色，单色图像」时暴露的系统性问题 ——
 * 规格里义项分隔符只能是全角分号,但有 43 条用了逗号/顿号,
 * 于是闸门把它们看成**一个**长义项,≤2 义项那条约束形同虚设。
 *
 *   node scripts/vocab/emit-comma-list.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SPEC } from './spec.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..', '..');
const BANK = process.argv.find(a => a.startsWith('--bank='))?.split('=')[1] ?? 'toefl';

const all = Object.values(JSON.parse(
  readFileSync(path.join(HERE, 'data', 'generated', `${BANK}-content.json`), 'utf8')));
const comma = all.filter(w => /[，,、]/.test(w.def_zh));

const lines = [
  `# def_zh 逗号分隔符 · 待裁决清单(${comma.length} 条)`,
  '',
  '## 为什么单独一份',
  '',
  `这 ${comma.length} 条用**逗号/顿号**当义项分隔符,而规格里分隔符只能是全角分号「${SPEC.defZh.sep}」。`,
  '后果不是排版问题,是**绕过了体裁闸**:',
  '',
  '- 「单色，单色图像」在闸门眼里是**一个** 7 字义项 → ≤2 义项那条约束形同虚设',
  '- 双义统计把它们算成单义 → 之前报的双义占比偏低',
  '- 前端 `optionText` 只按「；」切 → 英汉选择题的选项里会整个显示「推，挤」',
  '',
  '闸门已修(逗号一律拒,`defZhShapeProblem` 新增判据)。**存量这些条目要你裁**:',
  '多数看着是同义堆砌(推/挤、拖/拉、抛弃/放弃),按上一轮的尺子应该只留第一个;',
  '但也有 `lug 搬运；拖，拉`、`quail 鹌鹑；胆怯，畏惧` 这种**分号逗号混用**的,',
  '第二义内部又用逗号并列,处理方式不同,单独标出来了。',
  '',
  '| 词 | 现值 | 类型 | 建议(仅供参考,以你裁决为准) |',
  '| --- | --- | --- | --- |',
];
for (const w of comma) {
  const mixed = w.def_zh.includes(SPEC.defZh.sep);
  const first = w.def_zh.split(/[；，,、]/)[0].trim();
  lines.push(`| ${w.headword} | ${w.def_zh} | ${mixed ? '分号逗号混用' : '纯逗号'} | ${mixed ? '需逐条看:第二义内部并列' : `只留「${first}」`} |`);
}
writeFileSync(path.join(REPO, 'REVIEWAA', `vocab_${BANK}_defzh_comma_list.md`), lines.join('\n'), 'utf8');
process.stdout.write(`→ REVIEWAA/vocab_${BANK}_defzh_comma_list.md(${comma.length} 条,其中混用 ${comma.filter(w => w.def_zh.includes(SPEC.defZh.sep)).length} 条)\n`);
