/**
 * I 段第三轮 —— Aaron 2026-08-07 谚语定稿(依据三份独立研究的交叉共识)。
 *   node scripts/vocab/patch-cn-r3.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { callJson, pool } from './llm.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(HERE, 'data', 'generated', 'cn-expressions.json');
const all = JSON.parse(readFileSync(DATA, 'utf8'));
const BASE = JSON.parse(JSON.stringify(all));   // 不可变基线(第三条)

/* 每条:drop = 要删的说法(正则);set = 该语域的定稿说法 */
const RULINGS = {
  '一分耕耘一分收获': {
    drop: [/effort brings reward/i],
    set: [
      { register: 'casual', rendition: 'No pain, no gain', scene_hint: '鼓励别人吃苦才有回报' },
      { register: 'neutral', rendition: 'You reap what you sow', scene_hint: '说付出与回报相称' },
    ],
  },
  '人无远虑,必有近忧': {
    drop: [/trouble comes to those who don't plan ahead/i, /trouble comes to those who/i],
    set: [
      { register: 'casual', rendition: 'Plan ahead or trouble will follow', scene_hint: '提醒朋友早做打算' },
      { register: 'formal', rendition: 'If you fail to plan, you plan to fail', scene_hint: '职场强调规划的重要' },
    ],
  },
  '画蛇添足': {
    drop: [/unnecessary embellishment/i, /add superfluous detail/i],
    set: [
      { register: 'casual', rendition: "You're overdoing it", scene_hint: '劝人别再加东西了' },
      { register: 'neutral', rendition: 'gild the lily', scene_hint: '说多此一举的润色' },
    ],
  },
  '吃一堑,长一智': {
    drop: [/experience is the best teacher/i],
    set: [
      { register: 'casual', rendition: 'Live and learn', scene_hint: '吃亏后自嘲或安慰' },
      { register: 'neutral', rendition: 'Learn from your mistakes', scene_hint: '提醒从失误中吸取教训' },
    ],
  },
};

const need = new Set();
for (const [key, rule] of Object.entries(RULINGS)) {
  /* 条目键可能带/不带标点,按前缀找,别写死 */
  const e = all[key] ?? Object.values(all).find(x =>
    x.cn_phrase.replace(/[,，]/g, '') === key.replace(/[,，]/g, ''));
  if (!e) { console.log('⚠️ 找不到条目:' + key); continue; }

  const before = e.renditions.length;
  e.renditions = e.renditions.filter(r => !rule.drop.some(re => re.test(r.rendition)));
  if (e.renditions.length !== before) console.log(`  ${e.cn_phrase}:删 ${before - e.renditions.length} 档`);

  for (const s of rule.set) {
    const slot = e.renditions.find(r => r.register === s.register);
    if (slot) {
      if (slot.rendition === s.rendition) continue;
      console.log(`  ${e.cn_phrase} ${s.register}:「${slot.rendition}」→「${s.rendition}」`);
      Object.assign(slot, s, { example_en: '', example_zh: '' });
    } else {
      console.log(`  ${e.cn_phrase} ${s.register}:新增「${s.rendition}」`);
      e.renditions.push({ ...s, sort_order: 0, example_en: '', example_zh: '' });
    }
  }
  /* 语域顺序固定 casual → neutral → formal,再重编 sort_order */
  const ORDER = { casual: 1, neutral: 2, formal: 3 };
  e.renditions.sort((a, b) => ORDER[a.register] - ORDER[b.register]);
  e.renditions.forEach((r, i) => { r.sort_order = i + 1; });
  need.add(e.cn_phrase);
}

/* ── 重生成缺例句的说法 ── */
const slots = [...need].flatMap(p => all[p].renditions.filter(r => !r.example_en).map(r => ({ e: all[p], r })));
console.log(`\n待补例句 ${slots.length} 条`);
const SCHEMA = {
  type: 'object', additionalProperties: false, required: ['example_en', 'example_zh'],
  properties: { example_en: { type: 'string' }, example_zh: { type: 'string' } },
};
await pool(slots, 3, async ({ e, r }) => {
  const res = await callJson({
    system: '你为中文谚语的英文说法配例句。英文例句必须原样包含给定说法(动词可随时态变形),6-16 词,场景具体。'
      + '中文例句写两句式:先是英文例句的自然中译并打句号,再让谚语单独成一句点题。'
      + '谚语在整条中文例句里**只许出现一次**。中文例句里不许有英文字母。',
    user: `谚语:${e.cn_phrase}\n英文说法(须原样出现在英文例句里):${r.rendition}\n场合:${r.scene_hint}`,
    schemaName: 'ex', schema: SCHEMA, model: 'gpt-4o', temperature: 0.4, maxTokens: 600,
  });
  if (res) { r.example_en = res.example_en; r.example_zh = res.example_zh; }
  else console.log('⚠️ 未回填:' + e.cn_phrase + ' / ' + r.rendition);
});

writeFileSync(DATA, JSON.stringify(all, null, 2), 'utf8');

/* ── 改动对照(before 取自不可变基线)── */
const rows = [];
for (const p of need) {
  const b = BASE[p], a = all[p];
  const bs = b.renditions.map(r => `${r.register}=${r.rendition}`);
  const as = a.renditions.map(r => `${r.register}=${r.rendition}`);
  for (const x of bs) if (!as.includes(x)) rows.push({ p, before: x, after: '(删除)' });
  for (const x of as) if (!bs.includes(x)) rows.push({ p, before: '(新增/改写)', after: x });
}
console.log(`\n改动 ${rows.length} 处;before==after 的 ${rows.filter(r => r.before === r.after).length} 处(必须为 0)`);
for (const r of rows) console.log(`  ${r.p}:${r.before}  →  ${r.after}`);
writeFileSync(path.join(HERE, 'data', 'generated', 'cn-expressions-diff-r3.json'), JSON.stringify(rows, null, 2), 'utf8');
