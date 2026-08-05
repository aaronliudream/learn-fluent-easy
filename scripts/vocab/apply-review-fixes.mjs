/**
 * 2026-08-05 Aaron 审 16 词抽样后的定点修复。
 *
 * 作用面最小化(规矩):每条只改**被点名的那一个字段/那一条例句**,
 * 同词的其它例句原样不动。改前改后全部落 REVIEWAA 对照件。
 *
 *   node scripts/vocab/apply-review-fixes.mjs [--dry-run]
 *
 * ══ 对照件的"改前"必须取自不可变基线,不能取"运行那一刻的当前值" ══
 *
 * 踩过的坑(2026-08-05,Aaron 审对照件时发现):第一版把 before 写成
 * `w.def_zh`(赋值前读一次),看起来没错 —— 单次运行确实对。
 * 但这脚本被**跑了第二次**(为了追加 8 条新修复),第二次运行时
 * softwood 和 3 条 g13 例句**已经是改后的值**了,于是 before 读到的就是 after,
 * 对照件里 7 行 before==after,人眼审核完全失效 —— 而它静默通过,没有任何告警。
 *
 * 根因不是"读早了读晚了",是**用可变的当前状态充当历史事实**。
 * 修法:基线快照 data/review-fix-baseline.json,某个字段第一次被修复时
 * 记下原值,**此后永不覆盖**。重跑多少次,before 都是同一个历史值。
 *
 * 配套自检(硬性):对照件里 before==after 的行数必须为 0。
 * 违反时该行标 ⚠ 并使脚本以非零码退出 —— 绝不静默通过。
 * 这条是"重修脚本最小作用面 + 双轨验收"规矩的配套条款:
 * 双轨里的"人眼对照"那一轨,前提是对照件本身是真的。
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runAllGates, g13_collocationNotSameRoot, ngrams } from './gates.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DRY = process.argv.includes('--dry-run');
const CONTENT = path.join(HERE, 'data', 'generated', 'toefl-content.json');
const MANUAL = path.join(HERE, 'data', 'defzh-manual-bulk.json');
const BASELINE = path.join(HERE, 'data', 'review-fix-baseline.json');

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


/* ③ 体裁阈值从 12 收紧到 8(规格本来就是 2-8 字)后新暴露的 8 条。
 *    全是"没踩标记词也没句号,但确实是解释句"的漏网型,人工按词典体裁定稿。 */
const LONG_FIX = [
  { headword: 'honor',      after: '荣誉；尊敬' },
  { headword: 'proceeding', after: '诉讼程序；进程' },
  { headword: 'diagnose',   after: '诊断' },
  { headword: 'precede',    after: '先于；居先' },
  { headword: 'codify',     after: '编纂；法典化' },
  { headword: 'baste',      after: '涂油汁；粗缝' },
  { headword: 'covetous',   after: '贪婪的；觊觎的' },
  { headword: 'equivocate', after: '模棱两可；含糊其辞' },
];

const data = JSON.parse(readFileSync(CONTENT, 'utf8'));
const find = hw => data[hw] || Object.values(data).find(w => w.headword === hw);
const diffs = [];

/* 基线快照:key 形如 "softwood|def_zh"。第一次见到某个 key 才写入,之后只读。
 * 这就是"改前"的唯一来源 —— 当前值只用于**首次**建档。 */
const baseline = existsSync(BASELINE) ? JSON.parse(readFileSync(BASELINE, 'utf8')) : {};
let baselineGrew = false;
function beforeOf(key, currentValue) {
  if (!(key in baseline)) { baseline[key] = currentValue; baselineGrew = true; }
  return baseline[key];
}
/** 登记一处改动。before 一律从基线取,绝不用当前值。 */
function record(headword, field, key, currentValue, after, reason) {
  diffs.push({ headword, field, before: beforeOf(key, currentValue), after, reason });
}

for (const f of DEF_FIX) {
  const w = find(f.headword);
  record(f.headword, 'def_zh', `${f.headword}|def_zh`, w.def_zh, f.after, f.reason);
  w.def_zh = f.after;
  f.translations.forEach((t, i) => {
    record(f.headword, `例${i + 1}.translation_zh`, `${f.headword}|ex${i + 1}.translation_zh`,
      w.examples[i].translation_zh, t, '同一误译的传播');
    w.examples[i].translation_zh = t;
  });
}

for (const f of LONG_FIX) {
  const w = find(f.headword);
  record(f.headword, 'def_zh', `${f.headword}|def_zh`, w.def_zh, f.after, '义项超 8 字,是解释句不是释义');
  w.def_zh = f.after;
}

for (const f of G13_FIX) {
  const w = find(f.headword);
  const ex = w.examples[f.index];
  record(f.headword, `例${f.index + 1}`, `${f.headword}|ex${f.index + 1}`,
    `${ex.collocation} | ${ex.sentence}`, `${f.collocation} | ${f.sentence}`,
    'g13 搭配与目标词同根,同义反复');
  ex.collocation = f.collocation;
  ex.sentence = f.sentence;
  ex.translation_zh = f.translation_zh;
}

/* 验收:改完的词重跑全部闸门(按档句长口径,与生成期一致),
 * 且 g4 全局去重要拿**其余 4468 词**当比对面 —— 只测自己等于没测。 */
const touched = new Set([...DEF_FIX, ...LONG_FIX, ...G13_FIX].map(f => f.headword));
const corpus = [];
for (const w of Object.values(data)) {
  if (touched.has(w.headword)) continue;
  for (const e of w.examples) corpus.push(ngrams(e.sentence));
}
/* ── 自检①:对照件里 before==after 的行必须为 0 ──
 * 这一条是硬闸不是提示。before==after 意味着这一行**没有对照信息**,
 * 而人眼审核这一轨全靠对照 —— 一行假对照,那一处修改就等于没人看过。
 * 首次建档时(基线里本来没有这个 key)不会触发,因为那时当前值就是原值。 */
const stale = diffs.filter(d => d.before === d.after);

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
  /* 人工改写清单按 headword **upsert**,不是无脑 push。
   * ⚠️ 同一个重跑不安全问题的第二处:原来每跑一次就追加一遍,
   *    跑 4 次 softwood 就在清单里出现 4 遍(实测多出 156 行)。
   *    清单是给 Aaron 逐条审的,重复条目会让"我审过了"这件事失去意义。 */
  const manual = JSON.parse(readFileSync(MANUAL, 'utf8'));
  const byHw = new Map(manual.words.map(w => [w.headword, w]));
  for (const d of diffs.filter(d => d.field === 'def_zh')) {
    byHw.set(d.headword, { headword: d.headword, before: d.before, after: d.after, reason: d.reason });
  }
  manual.words = [...byHw.values()];
  writeFileSync(MANUAL, JSON.stringify(manual, null, 2), 'utf8');

  const md = [
    '# 2026-08-05 审后定点修复对照件',
    '',
    'Aaron 审 16 词抽样的两条必修,加 g13 新闸门全量回扫的结果。',
    '每条只改被点名的字段,同词其它例句原样不动。',
    '',
    '| 词 | 字段 | 改前 | 改后 | 缘由 |',
    '| --- | --- | --- | --- | --- |',
    ...diffs.map(d => {
      const flag = d.before === d.after ? '⚠ ' : '';        // 对照失效的行必须一眼看见
      return `| ${flag}${d.headword} | ${d.field} | ${d.before.replace(/\|/g, '\\|')} | **${d.after.replace(/\|/g, '\\|')}** | ${d.reason} |`;
    }),
    '',
    `合计 ${diffs.length} 处。改后这 ${touched.size} 个词重跑全部机器闸门(按档句长 + g13):${bad === 0 ? '全过' : `${bad} 词未过`}。`,
    `对照自检:改前==改后的行 ${stale.length} 行${stale.length ? ' ⚠ 该行对照失效,不可据此审核' : '(硬性要求为 0)'}。`,
    '',
    '「改前」取自基线快照 `scripts/vocab/data/review-fix-baseline.json`,',
    '不是脚本运行那一刻的当前值 —— 重跑多少次,改前都是同一个历史值。',
  ].join('\n');
  writeFileSync(path.join(HERE, '..', '..', 'REVIEWAA', 'vocab_toefl_review_fixes_20260805.md'), md, 'utf8');
  if (baselineGrew) writeFileSync(BASELINE, JSON.stringify(baseline, null, 2), 'utf8');
  process.stdout.write(`\n已写回 ${diffs.length} 处,对照件 REVIEWAA/vocab_toefl_review_fixes_20260805.md\n`);
}

if (stale.length) {
  process.stdout.write(`\n✗ 对照自检失败:${stale.length} 行 改前==改后,对照失效\n`);
  for (const d of stale) process.stdout.write(`  ⚠ ${d.headword} / ${d.field}\n`);
} else {
  process.stdout.write('✓ 对照自检:改前==改后的行 0 行\n');
}
/* ⚠️ 末行给出可 grep 的判定,别用管道接 grep 取退出码(管道会吞掉退出码)。 */
process.stdout.write(`\nDIFF_VERDICT: ${bad === 0 && stale.length === 0 ? 'PASS' : 'FAIL'}\n`);
process.exit(bad === 0 && stale.length === 0 ? 0 : 1);
