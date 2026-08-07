/**
 * I 段第二轮修订 —— Aaron 2026-08-07 复审裁决。
 *   node scripts/vocab/patch-cn-r2.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { callJson, pool } from './llm.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(HERE, 'data', 'generated', 'cn-expressions.json');
const all = JSON.parse(readFileSync(DATA, 'utf8'));
const BASE = JSON.parse(JSON.stringify(all));   // 不可变基线(第三条)
const need = new Set();

/* ── ① 🚨 补回核心示范条目(上一轮漏生成,而我在送审件里写了"必须包含")── */
all['此地无银三百两'] = {
  cn_phrase: '此地无银三百两', cn_note: '', category: 'proverb',
  renditions: [
    { rendition: "That's a dead giveaway.", register: 'casual', scene_hint: '说对方反而露馅了', sort_order: 1, example_en: '', example_zh: '' },
    { rendition: 'The more you deny it, the more suspicious you look.', register: 'neutral', scene_hint: '提醒对方越辩解越可疑', sort_order: 2, example_en: '', example_zh: '' },
    { rendition: "You're protesting too much.", register: 'formal', scene_hint: '正式场合点破过度辩白', sort_order: 3, example_en: '', example_zh: '' },
  ],
};
need.add('此地无银三百两');

/* ── ② 谚语必修 2 条 ── */
// 井底之蛙:A frog in a well 是直译不是英语说法
{
  const e = all['井底之蛙'];
  if (e) {
    const r = e.renditions.find(x => /frog in a well/i.test(x.rendition));
    if (r) { r.rendition = 'He has a narrow view of the world'; r.scene_hint = '说某人见识狭隘'; r.example_en = ''; r.example_zh = ''; need.add('井底之蛙'); }
  }
}
// 三思而后行 casual 与 人无远虑 neutral 语义撞车
{
  const e = all['三思而后行'];
  if (e) {
    const i = e.renditions.findIndex(x => /safe than sorry/i.test(x.rendition));
    if (i >= 0) { e.renditions.splice(i, 1); e.renditions.forEach((r, k) => { r.sort_order = k + 1; }); need.add('三思而后行'); }
  }
  const f = all['人无远虑'] ?? all['人无远虑,必有近忧'] ?? Object.values(all).find(x => x.cn_phrase.startsWith('人无远虑'));
  if (f) {
    const r = f.renditions.find(x => /look before you leap/i.test(x.rendition));
    if (r) { r.rendition = "Trouble comes to those who don't plan ahead"; r.scene_hint = '劝人早做打算'; r.example_en = ''; r.example_zh = ''; need.add(f.cn_phrase); }
  }
}

/* ── ③ 日常 formal 档 10 处 + 我不太确定 ── */
const FORMAL = {
  '我想也是': "That's my read too",
  '我很期待': "I'm very much looking forward to it",
  '那不关我的事': "I'd rather not get involved",
  '我得走了': "I'm afraid I need to head out",
  '随便你': 'Whatever works for you',
  '我来帮你': 'Happy to help',
  '真好吃': 'This is excellent',
  '我很抱歉': 'Please accept my apologies',
  '我需要帮助': 'Could I get some help with this?',
  '我在想': "I'm giving it some thought",
  '我不太确定': "I'm not certain",
};
for (const [phrase, to] of Object.entries(FORMAL)) {
  const e = all[phrase];
  if (!e) { console.log('⚠️ 找不到条目:' + phrase); continue; }
  const r = e.renditions.find(x => x.register === 'formal');
  if (!r) { console.log('⚠️ ' + phrase + ' 没有 formal 档'); continue; }
  if (r.rendition === to) continue;
  r.rendition = to; r.example_en = ''; r.example_zh = ''; need.add(phrase);
}

/* ── ④ 我很着急:整条删除(中文多义,英文说法只覆盖"担心"一支)── */
if (all['我很着急']) { delete all['我很着急']; console.log('删除「我很着急」(中文多义,anxious/concerned 只覆盖担心义)'); }

console.log(`需重生成例句:${need.size} 条`);

/* ── ⑤ 重生成受影响条目的例句 ── */
const SYS = `你是为中国英语学习者编写「中译英说法库」的资深编者。
给定一条中文表达和它的英文说法,为**每个说法**配一条英文例句和对应中文例句。
1. **英文例句必须包含该说法**(动词可随时态变形),6–16 词,场景具体。
2. 中文例句:日常表达 → 必须出现该中文表达(中间可插入成分);
   **谚语 → 两句式**:自然中译。+ 谚语单独成句点题。谚语在一条例句里只许出现一次。
3. 中文例句不许有英文字母,英文例句不许有汉字。`;
const SCHEMA = {
  type: 'object', additionalProperties: false, required: ['renditions'],
  properties: {
    renditions: {
      type: 'array', items: {
        type: 'object', additionalProperties: false,
        required: ['rendition', 'example_en', 'example_zh'],
        properties: { rendition: { type: 'string' }, example_en: { type: 'string' }, example_zh: { type: 'string' } },
      },
    },
  },
};
const todo = [...need].map(p => all[p]).filter(Boolean);
await pool(todo, 3, async (e) => {
  const res = await callJson({
    system: SYS,
    user: `中文表达:${e.cn_phrase}\n类别:${e.category}\n`
      + `英文说法:\n${e.renditions.map(r => `  - ${r.rendition}(${r.register},${r.scene_hint})`).join('\n')}\n\n`
      + `为每个说法各配英文例句 + 中文例句,rendition 原样回填。`,
    schemaName: 'cn_examples', schema: SCHEMA, model: 'gpt-4o', temperature: 0.5, maxTokens: 2000,
  });
  for (const g of res?.renditions ?? []) {
    const r = e.renditions.find(x => x.rendition.toLowerCase() === g.rendition.toLowerCase());
    if (r) { r.example_en = g.example_en; r.example_zh = g.example_zh; }
  }
  // 兜底:模型没回填的槽位保留原例句会导致 i5 不过,这里显式暴露
  for (const r of e.renditions) if (!r.example_en) console.log('⚠️ 未回填例句:' + e.cn_phrase + ' / ' + r.rendition);
});

writeFileSync(DATA, JSON.stringify(all, null, 2), 'utf8');

/* ── 改动对照(before 取自不可变基线)── */
const rows = [];
for (const p of new Set([...need, '我很着急'])) {
  const b = BASE[p], a = all[p];
  if (!a) { rows.push({ p, field: '整条', before: '存在', after: '(删除)' }); continue; }
  if (!b) { rows.push({ p, field: '整条', before: '(不存在)', after: '(新增)' }); continue; }
  for (let i = 0; i < Math.max(b.renditions.length, a.renditions.length); i++) {
    const B = b.renditions[i], A = a.renditions[i];
    if (!A) { rows.push({ p, field: 'rendition', before: B.rendition, after: '(删除)' }); continue; }
    if (!B) { rows.push({ p, field: 'rendition', before: '(新增)', after: A.rendition }); continue; }
    if (B.rendition !== A.rendition) rows.push({ p, field: 'rendition', before: B.rendition, after: A.rendition });
  }
}
const same = rows.filter(r => r.before === r.after);
console.log(`\n改动 ${rows.length} 处;before==after 的 ${same.length} 处(必须为 0)`);
writeFileSync(path.join(HERE, 'data', 'generated', 'cn-expressions-diff-r2.json'), JSON.stringify(rows, null, 2), 'utf8');
console.log('总条数:' + Object.keys(all).length + '(谚语 ' + Object.values(all).filter(e => e.category === 'proverb').length + ' + 日常 ' + Object.values(all).filter(e => e.category === 'daily').length + ')');
console.log('此地无银三百两 在库:' + !!all['此地无银三百两']);
