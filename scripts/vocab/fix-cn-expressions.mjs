/**
 * I 段修订 —— 应用 Aaron 2026-08-07 的审核裁决,并按新规格重生成受影响的例句。
 *
 * 做三件事:
 *   ① 按 data/cn-expressions-manual.json 替换谚语说法 / 日常 formal 说法 / 语义错
 *   ② **全部 12 条谚语的中文例句改两句式**(自然中译。+ 谚语单独成句点题。)
 *   ③ 被替换过说法的条目,英文/中文例句一并重生成(i5 双向包含闸要求例句真含说法)
 *
 * ⚠️ 只动被裁决点名的条目 —— 第二条作用面最小化。
 * ⚠️ 模型固定 gpt-4o(第八条补充:换模型 = 换判据)。
 *
 *   node scripts/vocab/fix-cn-expressions.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { callJson, pool } from './llm.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(HERE, 'data', 'generated', 'cn-expressions.json');
const MAN = path.join(HERE, 'data', 'cn-expressions-manual.json');

const all = JSON.parse(readFileSync(DATA, 'utf8'));
const man = JSON.parse(readFileSync(MAN, 'utf8'));
/* 不可变基线(第三条):before 一律取自这份快照,不再回读当前值 */
const BASE = JSON.parse(JSON.stringify(all));

const changed = new Set();

/* ── ① 谚语整条重排说法 ── */
for (const [phrase, ruling] of Object.entries(man)) {
  if (phrase.startsWith('_') || !ruling.renditions) continue;
  const e = all[phrase];
  if (!e) { console.log('⚠️ 找不到 ' + phrase); continue; }
  e.renditions = ruling.renditions.map((r, i) => ({
    ...r, sort_order: i + 1,
    example_en: '', example_zh: '',   // 待 ③ 重生成
  }));
  if (ruling.cn_note) e.cn_note = ruling.cn_note;
  changed.add(phrase);
}

/* ── ② 日常 formal / 语义错:按 rendition 文本定位替换 ── */
for (const [from, to] of man._replace) {
  let hit = 0;
  for (const [phrase, e] of Object.entries(all)) {
    for (const r of e.renditions) {
      if (r.rendition.toLowerCase() !== from.toLowerCase()) continue;
      r.rendition = to; r.example_en = ''; r.example_zh = '';
      changed.add(phrase); hit++;
    }
  }
  if (!hit) console.log('⚠️ 未命中说法:' + from);
}

/* ── ③ 例句直接点名修正 ── */
for (const [phrase, [bad, good]] of Object.entries(man._example_zh_fix ?? {})) {
  const e = all[phrase];
  if (!e) continue;
  for (const r of e.renditions)
    if (r.example_zh.includes(bad.slice(0, 6))) { r.example_zh = good; changed.add(phrase); }
}

/* ── ④ 全部谚语的中文例句改两句式(不论有没有被点名)── */
const proverbs = Object.values(all).filter(e => e.category === 'proverb');
for (const e of proverbs) changed.add(e.cn_phrase);

console.log(`需重生成例句的条目:${changed.size} 条(谚语 ${proverbs.length} + 日常 ${changed.size - proverbs.length})`);

/* ══════════ 重生成例句 ══════════ */
const SYS = `你是为中国英语学习者编写「中译英说法库」的资深编者。
给定一条中文表达和它的若干英文说法,为**每个说法**配一条英文例句和对应中文例句。

铁律:
1. **英文例句必须包含该说法**(动词可随时态变形),6–16 词,场景具体。
2. 中文例句:
   - 日常表达 → 中文例句里必须出现该中文表达(中间可插入成分)。
   - **谚语 → 必须写成严格的两句式**:先是英文例句的自然中译,**打句号**,
     再让谚语**单独成一句**点题,再打句号。
     ✅「他坚持了三年才成功。真是水滴石穿。」
     ✅「销售额突然下降让我们很困惑。不过无风不起浪。」
     ❌「人们都在谈论他的辞职,无风不起浪。」—— 用了逗号,是一句不是两句
     ❌「在中国文化中,有句俗语:唇亡齿寒。」—— 这是介绍谚语,不是用它造例
     ❌「我们这个项目唇亡齿寒」—— 把谚语硬塞进主句,病句
     **两句之间必须是句号,不能是逗号、分号或冒号。**
3. 中文例句里不许出现英文字母;英文例句里不许出现汉字。`;

const SCHEMA = {
  type: 'object', additionalProperties: false, required: ['renditions'],
  properties: {
    renditions: {
      type: 'array', items: {
        type: 'object', additionalProperties: false,
        required: ['rendition', 'example_en', 'example_zh'],
        properties: {
          rendition: { type: 'string' },
          example_en: { type: 'string' },
          example_zh: { type: 'string' },
        },
      },
    },
  },
};

const todo = [...changed].map(p => all[p]).filter(Boolean);
await pool(todo, 3, async (e) => {
  const res = await callJson({
    system: SYS,
    user: `中文表达:${e.cn_phrase}${e.cn_note ? `(注:${e.cn_note})` : ''}\n`
      + `类别:${e.category === 'proverb' ? 'proverb 谚语 —— 中文例句必须两句式' : 'daily 日常表达'}\n`
      + `英文说法:\n${e.renditions.map(r => `  - ${r.rendition}(${r.register},${r.scene_hint})`).join('\n')}\n\n`
      + `为上面每个说法各配一条英文例句 + 中文例句,rendition 原样回填。`,
    schemaName: 'cn_examples', schema: SCHEMA,
    model: 'gpt-4o', temperature: 0.5, maxTokens: 2000,
  });
  for (const got of res?.renditions ?? []) {
    const r = e.renditions.find(x => x.rendition.toLowerCase() === got.rendition.toLowerCase());
    if (!r) continue;
    r.example_en = got.example_en; r.example_zh = got.example_zh;
  }
});

writeFileSync(DATA, JSON.stringify(all, null, 2), 'utf8');

/* ── 改动对照(第三条:before 取自不可变基线)── */
const rows = [];
for (const p of changed) {
  const b = BASE[p], a = all[p];
  if (!b || !a) continue;
  const maxn = Math.max(b.renditions.length, a.renditions.length);
  for (let i = 0; i < maxn; i++) {
    const B = b.renditions[i], A = a.renditions[i];
    if (!A) { rows.push({ p, field: 'rendition', before: B.rendition, after: '(删除)' }); continue; }
    if (!B) { rows.push({ p, field: 'rendition', before: '(新增)', after: A.rendition }); continue; }
    if (B.rendition !== A.rendition) rows.push({ p, field: 'rendition', before: B.rendition, after: A.rendition });
    if (B.register !== A.register) rows.push({ p, field: 'register', before: B.register, after: A.register });
    if (B.example_zh !== A.example_zh) rows.push({ p, field: 'example_zh', before: B.example_zh, after: A.example_zh });
  }
}
const same = rows.filter(r => r.before === r.after);
console.log(`\n改动 ${rows.length} 处;before==after 的 ${same.length} 处(必须是 0,否则对照件又坏了)`);
writeFileSync(path.join(HERE, 'data', 'generated', 'cn-expressions-diff.json'), JSON.stringify(rows, null, 2), 'utf8');
console.log('→ data/generated/cn-expressions-diff.json');
