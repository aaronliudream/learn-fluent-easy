// U1 grammar 结构自审:60题/3点×20、4选项、answer_index∈0..3、answer_text==options[idx]、
// 选项无重复、qid 唯一、code 与 point 对应。再跑一个"识别题歧义"启发式:
// 对 stem 含"哪一项是X短语"的题,粗判 4 选项里疑似该类短语的数量(>1 则人工复核)。
import { readFileSync } from 'node:fs';
const F = 'C:\\Projects\\learn-fluent-easy\\scripts\\senior-rebuild\\required1-u1\\required1-u1-grammar.json';
const g = JSON.parse(readFileSync(F, 'utf8'));
let errs = [], warns = [];

const codes = new Set(g.points.map(p => p.code));
const codePoint = Object.fromEntries(g.points.map(p => [p.code, p.point]));
const qids = new Set();
const perCode = {};

for (const q of g.questions) {
  const tag = q.qid;
  if (qids.has(q.qid)) errs.push(`${tag}: qid 重复`); qids.add(q.qid);
  perCode[q.code] = (perCode[q.code] || 0) + 1;
  if (!codes.has(q.code)) errs.push(`${tag}: code ${q.code} 不在 points`);
  if (q.point !== codePoint[q.code]) errs.push(`${tag}: point 文案与 code 不符`);
  if (!Array.isArray(q.options) || q.options.length !== 4) errs.push(`${tag}: 选项数≠4`);
  if (new Set(q.options).size !== q.options.length) errs.push(`${tag}: 选项有重复 → ${JSON.stringify(q.options)}`);
  if (typeof q.answer_index !== 'number' || q.answer_index < 0 || q.answer_index > 3) errs.push(`${tag}: answer_index 越界`);
  if (q.options[q.answer_index] !== q.answer_text) errs.push(`${tag}: answer_text 与 options[idx] 不符`);
}

if (g.questions.length !== 60) errs.push(`题数=${g.questions.length}≠60`);
for (const c of codes) if (perCode[c] !== 20) errs.push(`${c} 题数=${perCode[c]}≠20`);

// 歧义启发式:识别短语类型
const isNP = s => /^(a |an |the |my |our |some |most of |this |that )/i.test(s) || /\b(student|teacher|club|language|subject|friends|story|impression|result|lab|team|schedule|reply|leader|lover|worker|start|answer|member|people|life|week|adviser|classmates|literature)\b/i.test(s) && !/^(good|very|quite|too|so|afraid|ready|full|keen|proud|worried|interested|difficult|important|responsible|happy|anxious|patient|fluent|active)\b/i.test(s);
const advHeads = /\b(quickly|soon|well|fast|carefully|often|slowly|politely|hard|now|enough|together|easily|seriously)\b/i;
const isAdvP = s => /^(quite|very|pretty|too|extremely|rather|more|much|right|surprisingly|aloud)\b/i.test(s) && advHeads.test(s) || /^(right now|well enough|on my own|aloud)/i.test(s);
const isAdjP = s => /^(good|very nice|afraid|ready|full|keen|proud|worried|interested|difficult|important|responsible|happy|anxious|patient|fluent|active|so big|too difficult)\b/i.test(s) || /\b(at|of|in|about|to|for)\b/.test(s) && /^(good|afraid|ready|full|keen|proud|worried|interested|responsible|patient|fluent|addicted|attracted)\b/i.test(s);

for (const q of g.questions) {
  const m = q.stem.match(/哪一项(?:不)?是(名词|形容词|副词)短语/);
  if (!m) continue;
  const want = m[1];
  const neg = q.stem.includes('不是');
  const test = want === '名词' ? isNP : want === '形容词' ? isAdjP : isAdvP;
  const hits = q.options.filter(test);
  // 仅作提示:识别题(非"不是")理论上恰好1个目标类型
  if (!neg && hits.length !== 1) warns.push(`${q.qid}: 启发式判到 ${hits.length} 个「${want}短语」(应1) → 人工复核 ${JSON.stringify(q.options)}`);
}

console.log('=== U1 grammar 结构自审 ===');
console.log('题数:', g.questions.length, '| 各点:', JSON.stringify(perCode));
console.log('硬错误:', errs.length);
errs.forEach(e => console.log('  ❌', e));
console.log('歧义启发式提示(需人工眼,不一定是错):', warns.length);
warns.forEach(w => console.log('  ⚠️', w));
console.log(errs.length === 0 ? '\n✅ 结构 0 硬错误' : '\n❌ 有硬错误,需修');
process.exit(0);
