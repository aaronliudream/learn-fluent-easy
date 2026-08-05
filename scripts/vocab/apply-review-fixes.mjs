/**
 * 2026-08-05 Aaron 审 16 词抽样后的定点修复。
 *
 * 作用面最小化(规矩):每条只改**被点名的那一个字段/那一条例句**,
 * 同词的其它例句原样不动。改前改后全部落 REVIEWAA 对照件。
 *
 *   node scripts/vocab/apply-review-fixes.mjs [--dry-run]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runAllGates, g13_collocationNotSameRoot, ngrams } from './gates.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DRY = process.argv.includes('--dry-run');
const CONTENT = path.join(HERE, 'data', 'generated', 'toefl-content.json');
const MANUAL = path.join(HERE, 'data', 'defzh-manual-bulk.json');

/* ① def_zh 误译:Aaron 指出 softwood「软木」是错的 —— 软木 = cork(栓皮栎树皮),
 *    softwood 指针叶树材。三条译文里的「软木」是同一个错的传播,一并改。 */
const DEF_FIX = [{
  headword: 'softwood',
  after: '软材；针叶材',
  reason: 'Aaron 指出:软木=cork,与 softwood 不是一回事',
  translations: [
    '建筑公司经常使用针叶材木料来建造住宅。',
    '研究人员已确定几种适合可持续林业实践的针叶树种。',
    '你可以在当地商店找到各种针叶材制品，如家具和地板。',
  ],
}];

/* ② g13 同根搭配:全量回扫 4471 词只有这 3 条。每条只换违规的那一条例句。 */
const G13_FIX = [
  {
    headword: 'immunity', index: 0,
    collocation: 'build immunity',
    sentence: 'Regular exposure to mild germs helps children build immunity against common infections.',
    translation_zh: '经常接触轻微病菌有助于儿童建立对常见感染的免疫力。',
  },
  {
    headword: 'dissenter', index: 2,
    collocation: 'a lone dissenter',
    sentence: 'The film portrays a lone dissenter who challenged societal norms through his bold art.',
    translation_zh: '这部影片刻画了一位通过大胆艺术挑战社会规范的孤立持不同政见者。',
  },
  {
    headword: 'melodious', index: 2,
    collocation: 'a melodious tune',
    sentence: 'The teacher played a melodious tune to help students relax before the difficult exam.',
    translation_zh: '老师播放了一段悦耳的曲子，帮助学生在考试前放松。',
  },
];

const data = JSON.parse(readFileSync(CONTENT, 'utf8'));
const find = hw => data[hw] || Object.values(data).find(w => w.headword === hw);
const diffs = [];

for (const f of DEF_FIX) {
  const w = find(f.headword);
  diffs.push({ headword: f.headword, field: 'def_zh', before: w.def_zh, after: f.after, reason: f.reason });
  w.def_zh = f.after;
  f.translations.forEach((t, i) => {
    diffs.push({ headword: f.headword, field: `例${i + 1}.translation_zh`, before: w.examples[i].translation_zh, after: t, reason: '同一误译的传播' });
    w.examples[i].translation_zh = t;
  });
}

for (const f of G13_FIX) {
  const w = find(f.headword);
  const ex = w.examples[f.index];
  diffs.push({
    headword: f.headword, field: `例${f.index + 1}`, reason: 'g13 搭配与目标词同根,同义反复',
    before: `${ex.collocation} | ${ex.sentence}`,
    after: `${f.collocation} | ${f.sentence}`,
  });
  ex.collocation = f.collocation;
  ex.sentence = f.sentence;
  ex.translation_zh = f.translation_zh;
}

/* 验收:改完的词重跑全部闸门(按档句长口径,与生成期一致),
 * 且 g4 全局去重要拿**其余 4468 词**当比对面 —— 只测自己等于没测。 */
const touched = new Set([...DEF_FIX, ...G13_FIX].map(f => f.headword));
const corpus = [];
for (const w of Object.values(data)) {
  if (touched.has(w.headword)) continue;
  for (const e of w.examples) corpus.push(ngrams(e.sentence));
}
let bad = 0;
for (const hw of touched) {
  const w = find(hw);
  const fails = runAllGates(w, w, corpus, {}, { useTierLength: true });
  const g13 = g13_collocationNotSameRoot(w.examples, w.headword, {});
  if (g13) fails.push(g13);
  if (fails.length) { bad++; process.stdout.write(`✗ ${hw}: ${fails.join(' / ')}\n`); }
  else process.stdout.write(`✓ ${hw} 全闸门通过(含 g13)\n`);
}

if (!DRY) {
  writeFileSync(CONTENT, JSON.stringify(data, null, 2), 'utf8');
  const manual = JSON.parse(readFileSync(MANUAL, 'utf8'));
  manual.words.push(...diffs.filter(d => d.field === 'def_zh').map(d => ({ headword: d.headword, before: d.before, after: d.after, reason: d.reason })));
  writeFileSync(MANUAL, JSON.stringify(manual, null, 2), 'utf8');

  const md = [
    '# 2026-08-05 审后定点修复对照件',
    '',
    'Aaron 审 16 词抽样的两条必修,加 g13 新闸门全量回扫的结果。',
    '每条只改被点名的字段,同词其它例句原样不动。',
    '',
    '| 词 | 字段 | 改前 | 改后 | 缘由 |',
    '| --- | --- | --- | --- | --- |',
    ...diffs.map(d => `| ${d.headword} | ${d.field} | ${d.before.replace(/\|/g, '\\|')} | **${d.after.replace(/\|/g, '\\|')}** | ${d.reason} |`),
    '',
    `合计 ${diffs.length} 处。改后这 ${touched.size} 个词重跑全部机器闸门(按档句长 + g13):${bad === 0 ? '全过' : `${bad} 词未过`}。`,
  ].join('\n');
  writeFileSync(path.join(HERE, '..', '..', 'REVIEWAA', 'vocab_toefl_review_fixes_20260805.md'), md, 'utf8');
  process.stdout.write(`\n已写回 ${diffs.length} 处,对照件 REVIEWAA/vocab_toefl_review_fixes_20260805.md\n`);
}
process.exit(bad === 0 ? 0 : 1);
