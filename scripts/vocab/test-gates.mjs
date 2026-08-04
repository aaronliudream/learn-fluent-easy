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
  g5_mutualExclusive, g6_intraWordSimilarity,
  g7_collocationContainsWord, g8_zhPunctuation, g9_distinctOpeners,
  runAllGates,
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
// ↓ 2026-08-03 试跑 defense 实际踩到:连字符复合词被粘成一个词,合法用法被误杀
ok('连字符复合词 self-defense 算命中 defense',
  g1_targetPresent('She claimed her actions were justified as self-defense during the trial.', 'defense', {}) === null);
ok('连字符复合词 well-being 算命中 being',
  g1_targetPresent('The programme measures student well-being across twelve different schools.', 'being', {}) === null);
ok('斜杠分隔 and/or 也切得开',
  g1_targetPresent('Applicants may submit transcripts and/or letters before the stated deadline.', 'or', {}) === null);
ok('连字符切开后仍不误判(band 不算 abandon)',
  g1_targetPresent('The brass-band concert lasted almost three whole hours downtown.', 'abandon', {}) !== null);

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

/* ── g7 搭配必须含目标词 ── */
process.stdout.write('g7 搭配必须真是搭配\n');
const col = c => ({ collocation: c, scene: 'news', sentence: 'x', translation_zh: 'x。' });
ok('含目标词放行', g7_collocationContainsWord([col('defense strategy'), col('national defense'), col('self-defense')], 'defense', {}) === null);
ok('同义词冒充搭配被拦(attorney→lawyer)', g7_collocationContainsWord([col('lawyer')], 'attorney', {}) !== null);
ok('连字符搭配 self-defense 算含', g7_collocationContainsWord([col('self-defense')], 'defense', {}) === null);
ok('屈折形搭配 participants in a study 算含', g7_collocationContainsWord([col('participants in a study')], 'participant', {}) === null);
// ↓ 2026-08-03 全量跑实战踩到:inflationary 是 inflation 的派生形容词,被误判成同义词
ok('派生形搭配 inflationary pressures 算含 inflation',
  g7_collocationContainsWord([col('inflationary pressures')], 'inflation', {}) === null);
ok('派生形 governmental 算含 government',
  g7_collocationContainsWord([col('governmental agency')], 'government', {}) === null);
ok('shipwright 不算含 wright(后缀不是派生,是另一个词)',
  g7_collocationContainsWord([col('shipwright')], 'wright', {}) !== null);
ok('派生形句子 inflationary 也让 g1 放行',
  g1_targetPresent('Inflationary pressures forced many companies to raise their prices.', 'inflation', {}) === null);
ok('短词不因前缀过度放行(band 不算命中 bandit)',
  g1_targetPresent('The bandit escaped into the hills before dawn broke.', 'band', {}) !== null);
ok('介词搭配 concerned about 算含', g7_collocationContainsWord([col('concerned about')], 'concerned', {}) === null);

/* ── g8 中文标点 ── */
process.stdout.write('g8 中文译文标点\n');
const tr = t => ({ collocation: 'c', scene: 'news', sentence: 'x', translation_zh: t });
ok('全角句号放行', g8_zhPunctuation([tr('这是一个句子。')]) === null);
ok('全角问号/叹号放行', g8_zhPunctuation([tr('真的吗？'), tr('太好了！')]) === null);
ok('半角句号收尾被拦', g8_zhPunctuation([tr('律师工作很长时间.')]) !== null);
ok('无句末标点被拦', g8_zhPunctuation([tr('这是一个句子')]) !== null);
ok('中文里混半角逗号被拦', g8_zhPunctuation([tr('他来了,她走了。')]) !== null);
ok('数字小数点不误伤', g8_zhPunctuation([tr('增长了 3.14 个百分点。')]) === null);
ok('译文为空被拦', g8_zhPunctuation([tr('  ')]) !== null);

/* ── g9 首词互异 ── */
process.stdout.write('g9 三句首词互异\n');
const sen = s => ({ collocation: 'c', scene: 'news', sentence: s, translation_zh: 'x。' });
ok('首词全异放行', g9_distinctOpeners([sen('Many citizens are worried'), sen('Concerned parents attend'), sen('She learned quickly')]) === null);
ok('试跑实例:两句都以 Concerned 开头被拦',
  g9_distinctOpeners([sen('Many citizens are concerned about pollution'), sen('Concerned parents often attend school meetings'), sen('Concerned citizens organized a rally')]) !== null);
ok('三句都以 The 开头被拦', g9_distinctOpeners([sen('The city fell'), sen('The team won'), sen('The dog ran')]) !== null);
ok('大小写不同仍算同形', g9_distinctOpeners([sen('The city fell'), sen('the team won'), sen('A dog ran')]) !== null);

/* ── runAllGates 端到端 ── */
process.stdout.write('runAllGates 端到端\n');
const goodWord = { headword: 'abandon', freq_rank: 2182 };
const goodPayload = {
  ipa: '/əˈbændən/', def_zh: '放弃;抛弃', def_en: 'to leave someone or something permanently',
  examples: [
    { collocation: 'abandon a plan', scene: 'news', sentence: 'The city abandoned its plan to widen the busy road', translation_zh: '该市放弃了拓宽这条繁忙道路的计划。' },
    { collocation: 'abandon a child', scene: 'health', sentence: 'Nobody should abandon a child in such freezing winter weather', translation_zh: '任何人都不该在如此严寒的冬天遗弃孩子。' },
    { collocation: 'abandon ship', scene: 'travel', sentence: 'Sailors abandoned ship minutes before the hull broke apart', translation_zh: '船体断裂前几分钟，水手们弃船而逃。' },
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
