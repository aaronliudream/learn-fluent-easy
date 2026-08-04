/**
 * 六道闸门的离线单测 —— 不调 API,不连库,纯 fixture。
 * 每道闸门至少一个"该放行"和一个"该拦下"的用例。
 *
 *   node scripts/vocab/test-gates.mjs
 *
 * 退出码 0 = 全绿。⚠️ 别用管道接 grep,管道会吞掉退出码。
 */
import {
  SCENES, words, ngrams, overlapRatio, symmetricOverlap, inflectionsOf,
  g1_targetPresent, g2_length, g3_noEmDash, g4_globalDedup,
  g5_mutualExclusive, g6_intraWordSimilarity, runAllGates,
} from './gates.mjs';

let pass = 0, fail = 0;
const ok = (name, cond, detail = '') => {
  if (cond) { pass++; process.stdout.write(`  ✓ ${name}\n`); }
  else { fail++; process.stdout.write(`  ✗ ${name} ${detail}\n`); }
};

/* ── g1 目标词存在 ── */
process.stdout.write('g1 目标词存在\n');
ok('原形命中', g1_targetPresent('The council will abandon the plan next spring.', 'abandon', {}) === null);
ok('屈折形命中(exchange 表)',
  g1_targetPresent('They abandoned the project after two years.', 'abandon', { abandon: ['abandoned', 'abandoning', 'abandons'] }) === null);
ok('屈折形命中(后缀兜底,表里没有)',
  g1_targetPresent('She is abandoning her old habits this year.', 'abandon', {}) === null);
ok('双写规则 plan→planning', g1_targetPresent('We are planning a much longer trip abroad.', 'plan', {}) === null);
ok('y→ies 规则 study→studies', g1_targetPresent('He studies ancient languages at the city university.', 'study', {}) === null);
ok('缺席被拦下', g1_targetPresent('The council rejected the proposal without any debate.', 'abandon', {}) !== null);
ok('不被子串误判(band 不算 abandon)',
  g1_targetPresent('The band played loudly for almost three whole hours.', 'abandon', {}) !== null);
ok('所有格 word\'s 也算命中', g1_targetPresent('The system\'s design impressed every single reviewer today.', 'system', {}) === null);

/* ── g2 长度 ── */
process.stdout.write('g2 长度 8-16 词\n');
ok('8 词放行', g2_length('One two three four five six seven eight') === null);
ok('16 词放行', g2_length('One two three four five six seven eight nine ten a b c d e f') === null);
ok('7 词拦下', g2_length('One two three four five six seven') !== null);
ok('17 词拦下', g2_length('One two three four five six seven eight nine ten a b c d e f g') !== null);
ok('标点不计入词数', words('Hello, world! This is fine.').length === 5);

/* ── g3 em-dash ── */
process.stdout.write('g3 em-dash\n');
ok('普通句放行', g3_noEmDash('A clean sentence, with commas only.') === null);
ok('em-dash 拦下', g3_noEmDash('A sentence — with an em dash.') !== null);
ok('en-dash 拦下', g3_noEmDash('Pages 10–20 of the report.') !== null);
ok('连字符不误伤', g3_noEmDash('A well-known scholar wrote it.') === null);
ok('译文里的破折号也扫得到', g3_noEmDash('clean english', '中文译文 — 带破折号') !== null);

/* ── g4 全局去重 ── */
process.stdout.write('g4 全局 4-gram 去重\n');
const base = 'Researchers abandon the experiment when the funding runs out completely';
const corpus = [ngrams(base)];
ok('全新句放行', g4_globalDedup('Local officials rejected every proposal submitted by the small committee', corpus) === null);
ok('原样复读拦下', g4_globalDedup(base, corpus) !== null);
ok('换头不换身拦下', g4_globalDedup('Scientists abandon the experiment when the funding runs out completely', corpus) !== null);
ok('空语料放行', g4_globalDedup(base, []) === null);
ok('overlapRatio 自反 = 1', overlapRatio(ngrams(base), ngrams(base)) === 1);

/* ── g5 三句互斥 ── */
process.stdout.write('g5 scene / collocation 互斥\n');
const mk = (c, s) => ({ collocation: c, scene: s, sentence: 'x', translation_zh: 'x' });
ok('三值全异放行', g5_mutualExclusive([mk('a', 'academic'), mk('b', 'news'), mk('c', 'travel')]) === null);
ok('scene 重复拦下', g5_mutualExclusive([mk('a', 'academic'), mk('b', 'academic'), mk('c', 'travel')]) !== null);
ok('collocation 重复拦下', g5_mutualExclusive([mk('a', 'academic'), mk('a', 'news'), mk('c', 'travel')]) !== null);
ok('枚举外的 scene 拦下', g5_mutualExclusive([mk('a', 'sports'), mk('b', 'news'), mk('c', 'travel')]) !== null);
ok('只有 2 句拦下', g5_mutualExclusive([mk('a', 'academic'), mk('b', 'news')]) !== null);
ok('collocation 空值拦下', g5_mutualExclusive([mk('', 'academic'), mk('b', 'news'), mk('c', 'travel')]) !== null);
ok('大小写不同的 collocation 仍算重复',
  g5_mutualExclusive([mk('Take Care', 'academic'), mk('take care', 'news'), mk('c', 'travel')]) !== null);

/* ── g6 同词三句相似度 ── */
process.stdout.write('g6 同词三句相似度\n');
const lazy = [
  { sentence: 'The student will abandon the research project before the winter deadline' },
  { sentence: 'The reporter will abandon the research project before the winter deadline' },
  { sentence: 'Coastal towns abandon old harbours once the fishing industry collapses entirely' },
];
const diverse = [
  { sentence: 'Many families abandon their homes when the river floods every spring' },
  { sentence: 'Scientists rarely abandon a promising line of enquiry without solid evidence' },
  { sentence: 'He abandoned law school and now runs a small bakery downtown' },
];
ok('偷懒句(只换主语)被拦下', g6_intraWordSimilarity(lazy) !== null);
ok('三句真的不同放行', g6_intraWordSimilarity(diverse) === null);
ok('symmetricOverlap 自反 = 1', symmetricOverlap(ngrams(base), ngrams(base)) === 1);

/* ── runAllGates 端到端 ── */
process.stdout.write('runAllGates 端到端\n');
const goodWord = { headword: 'abandon', freq_rank: 2182 };
const goodPayload = {
  ipa: '/əˈbændən/', def_zh: '放弃;抛弃', def_en: 'to leave someone or something permanently',
  examples: [
    { collocation: 'abandon a plan', scene: 'news', sentence: 'The city abandoned its plan to widen the busy road', translation_zh: '该市放弃了拓宽这条繁忙道路的计划。' },
    { collocation: 'abandon a child', scene: 'health', sentence: 'Nobody should abandon a child in such freezing winter weather', translation_zh: '任何人都不该在如此严寒的冬天遗弃孩子。' },
    { collocation: 'abandon ship', scene: 'travel', sentence: 'Sailors abandoned ship minutes before the hull broke apart', translation_zh: '船体断裂前几分钟,水手们弃船而逃。' },
  ],
};
ok('干净样本零失败', runAllGates(goodWord, goodPayload, [], {}).length === 0,
  JSON.stringify(runAllGates(goodWord, goodPayload, [], {})));

const badPayload = JSON.parse(JSON.stringify(goodPayload));
badPayload.examples[1].scene = 'news';                       // g5
badPayload.examples[2].sentence = 'Too short here';           // g2 + g1
badPayload.def_en = 'one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen';
const badFails = runAllGates(goodWord, badPayload, [], {});
ok('脏样本被拦下', badFails.length > 0);
ok('脏样本报出 g5 scene 重复', badFails.some(f => f.includes('g5')));
ok('脏样本报出 g2 长度', badFails.some(f => f.includes('g2')));
ok('脏样本报出 def_en 超 15 词', badFails.some(f => f.includes('def_en')));

ok('SCENES 恰好 10 个', SCENES.length === 10, `实际 ${SCENES.length}`);
ok('inflectionsOf 含原形', inflectionsOf('abandon', {}).has('abandon'));

process.stdout.write(`\nGATE_VERDICT: ${fail === 0 ? 'PASS' : 'FAIL'}  (通过 ${pass} · 失败 ${fail})\n`);
process.exit(fail === 0 ? 0 : 1);
