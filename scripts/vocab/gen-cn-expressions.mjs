/**
 * I 段 · 中文高频表达 50 条 → vocab_cn_expressions / vocab_cn_renditions
 *
 * ══════════ 第八条:假设差异表(原形态 = A/D/H 段,新形态 = I 段)══════════
 *
 * | 前面各段的隐含假设            | I 段的实际形态                      | 闸门要怎么改 |
 * | --- | --- | --- |
 * | 起点是英文词/词块,中文是产出 | **起点是中文,英文是产出**(方向反转) | 超纲/词表类闸门全部失效,一律不搬 |
 * | 一个条目一条正确答案          | **一条中文对 2–3 个英文说法,都对**  | 去重闸不能跨说法比,只能同表达内比 |
 * | 陷阱 = 字面义背离(H 段)      | 陷阱 = **中式英语**(逐字硬翻)      | h5 那种"含字面/实为"的形式判据不适用 |
 * | 例句用来展示词的用法          | 例句必须**同时含中文表达和英文说法** | 新增双向包含闸(i5/i6),这是本段最强的形式判据 |
 * | 枚举值靠我记忆               | **DDL 三条 CHECK 约束是硬边界**     | i1/i2/i3 直接引用勘验到的约束,不自写 |
 *
 * ⚠️ 覆盖范围也是假设(第八条补充):ECDICT / toefl 词表**对本段完全无用** ——
 *    中文表达不在任何英文词表里。本段没有权威数据源可挂,判据只能靠形式闸 + 人审。
 *
 * ⚠️ 模型即判据(第八条补充):全段固定 gpt-4o,不中途换 mini。
 *
 * ══════════ 硬约束(勘验自 DDL,非记忆)══════════
 *   vocab_cn_expressions.category  CHECK ∈ {daily, proverb}
 *   vocab_cn_renditions.register   CHECK ∈ {casual, neutral, formal}
 *   vocab_cn_renditions.sort_order CHECK 1..3  → **每条表达最多 3 个说法**
 *   renditions.expression_id FK ON DELETE CASCADE(终态 SQL 只需删父表)
 *   NOT NULL:cn_phrase / register / scene_hint / example_en / example_zh / sort_order
 *
 *   node scripts/vocab/gen-cn-expressions.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { callJson, pool, q, writeSql, writeReview } from './llm.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, 'data', 'generated', 'cn-expressions.json');

/* ── 规格常量:第四条,判据一律引用这里,禁止在闸门里手写数字 ── */
const SPEC_I = {
  target: 50,
  category: ['daily', 'proverb'],            // DDL CHECK
  register: ['casual', 'neutral', 'formal'], // DDL CHECK
  renditions: [2, 3],                        // DDL sort_order CHECK 1..3;下限 2 是本段规格
  /* ⚠️ 按类别分档,不是一把尺 —— 谚语的对应说法天然更长
     (a proverb maps to a whole clause: "better to see once than hear a hundred times")。
     第八条同款坑:D 段也踩过"词块用词汇级句长"。 */
  renditionWords: { daily: [1, 6], proverb: [1, 10] },
  exampleWords: [6, 16],
  cnPhraseChars: [2, 10],
  cnNoteChars: [0, 20],
  sceneHintChars: [4, 16],
};

const CATEGORIES = [
  { key: 'daily',   n: 38, desc: '日常口语高频表达(不是成语)' },
  { key: 'proverb', n: 12, desc: '汉语谚语/俗语' },
];

/* ══════════ 机器闸 i1–i9 ══════════ */
const words = s => String(s).trim().split(/\s+/).filter(Boolean).length;
const chars = s => [...String(s ?? '').trim()].length;
/** 中文表达的"词核":去掉可替换成分(某人/某事/…)后用于例句包含判定 */
const cnCore = s => String(s).replace(/[某人某事某物…\.·、,，。!!??\s]/g, '');

/** 词核的字**按序出现**即算命中(不要求连续)。
 *  ⚠️ 中文表达在真实句子里必然被插入成分:「你有空吗」→「你这周六有空吗」。
 *     要求连续包含 = 只接受把表达原样贴进例句,那正是我们不想要的假例句。 */
function cnSubseq(hay, needle) {
  let i = 0;
  for (const ch of hay) if (ch === needle[i]) i++;
  return i >= needle.length;
}

/** 英文说法是否出现在例句里,**容忍首词屈折**。
 *  ⚠️ "stand out like a sore thumb" 在例句里是 "stood out like a sore thumb" ——
 *     整体动词短语的首词必然随时态变形。D 段踩过同一个坑(come across → came)。 */
function renditionInExample(rendition, exampleEn) {
  const ex = String(exampleEn).toLowerCase().replace(/[.,!?;:"']/g, ' ');
  const parts = String(rendition).toLowerCase()
    .replace(/\bsth\b|\bsb\b|\bsomeone\b|\bsomething\b|\.\.\./g, ' ')
    .replace(/[.,!?;:"']/g, ' ').split(/\s+/).filter(Boolean);
  if (!parts.length) return true;
  const tail = parts.slice(1).filter(w => w.length > 2);
  // 首词只比词干(允许 -s/-ed/-ing/不规则:取前 3 字母)
  const headOk = ex.split(/\s+/).some(w => w.slice(0, 3) === parts[0].slice(0, 3));
  const tailOk = tail.every(w => ex.includes(w));
  return headOk && tailOk;
}

function gateOne(e, seenRend) {
  const f = [];
  // i1 类别 —— 引用 DDL CHECK
  if (!SPEC_I.category.includes(e.category))
    f.push(`i1 category「${e.category}」不在 DDL CHECK ${SPEC_I.category.join('/')} 内`);
  // i7 中文表达本身
  if (chars(e.cn_phrase) < SPEC_I.cnPhraseChars[0] || chars(e.cn_phrase) > SPEC_I.cnPhraseChars[1])
    f.push(`i7 cn_phrase「${e.cn_phrase}」${chars(e.cn_phrase)} 字,超出 ${SPEC_I.cnPhraseChars.join('-')}`);
  if (/[a-zA-Z]/.test(e.cn_phrase))
    f.push(`i7 cn_phrase「${e.cn_phrase}」混入了英文字母`);
  if (e.cn_note && chars(e.cn_note) > SPEC_I.cnNoteChars[1])
    f.push(`i7 cn_note「${e.cn_note}」${chars(e.cn_note)} 字,超 ${SPEC_I.cnNoteChars[1]}`);

  const rs = Array.isArray(e.renditions) ? e.renditions : [];
  // ⚠️ 归一化必须**先于**判定(G 段踩过:闸门跑在归一化之前,18 个词白卡)
  rs.forEach((r, i) => { r.sort_order = i + 1; });
  // i3 说法条数 —— 上限来自 DDL sort_order CHECK
  if (rs.length < SPEC_I.renditions[0] || rs.length > SPEC_I.renditions[1])
    f.push(`i3 说法 ${rs.length} 个,规格 ${SPEC_I.renditions.join('-')}(上限是 DDL sort_order CHECK)`);

  // i2 语域:必须齐全且**互不相同** —— 一条中文配三个同语域说法,教学价值为零
  const regs = rs.map(r => r.register);
  for (const r of regs)
    if (!SPEC_I.register.includes(r))
      f.push(`i2 register「${r}」不在 DDL CHECK ${SPEC_I.register.join('/')} 内`);
  if (new Set(regs).size !== regs.length)
    f.push(`i2 语域重复(${regs.join('/')})—— 同一条中文的多个说法必须分属不同语域`);

  for (const [i, r] of rs.entries()) {
    const tag = `「${r.rendition}」`;
    // i4 英文说法本身
    const w = words(r.rendition);
    const RW = SPEC_I.renditionWords[e.category] ?? SPEC_I.renditionWords.daily;
    if (w < RW[0] || w > RW[1])
      f.push(`i4 说法${tag} ${w} 词,超出 ${e.category} 档的 ${RW.join('-')}`);
    if (/[一-龥]/.test(r.rendition))
      f.push(`i4 说法${tag} 混入了汉字`);
    // i8 场景提示:必须是"什么场合用",不是复述释义
    if (chars(r.scene_hint) < SPEC_I.sceneHintChars[0] || chars(r.scene_hint) > SPEC_I.sceneHintChars[1])
      f.push(`i8 scene_hint「${r.scene_hint}」${chars(r.scene_hint)} 字,超出 ${SPEC_I.sceneHintChars.join('-')}`);
    if (/[a-zA-Z]/.test(r.scene_hint))
      f.push(`i8 scene_hint「${r.scene_hint}」混入英文`);

    // ── i5/i6 双向包含:本段最强的形式判据 ──
    // i5 英文例句必须**真的含这个说法**,否则例句和说法各说各话
    if (!renditionInExample(r.rendition, r.example_en))
      f.push(`i5 例句「${r.example_en}」不含说法${tag}`);
    const ew = words(r.example_en);
    if (ew < SPEC_I.exampleWords[0] || ew > SPEC_I.exampleWords[1])
      f.push(`i5 例句${tag} ${ew} 词,超出 ${SPEC_I.exampleWords.join('-')}`);
    // i6 中文例句必须含这条中文表达 —— 证明例句确实在演示它,而非另起炉灶
    if (!cnSubseq(cnCore(r.example_zh), cnCore(e.cn_phrase)))
      f.push(`i6 中文例句「${r.example_zh}」不含表达「${e.cn_phrase}」`);
    if (/[a-zA-Z]/.test(r.example_zh))
      f.push(`i6 中文例句${tag} 混入英文`);
    if (r.sort_order !== i + 1)
      f.push(`i3 sort_order 应为 ${i + 1},实为 ${r.sort_order}`);
  }

  // i9 全局去重:同一个英文说法不得在两条中文表达下重复出现
  for (const r of rs) {
    const k = r.rendition.toLowerCase().replace(/[^a-z ]/g, '').trim();
    if (seenRend.has(k) && seenRend.get(k) !== e.cn_phrase)
      f.push(`i9 说法「${r.rendition}」与「${seenRend.get(k)}」重复`);
  }
  return f;
}

/* ══════════ 生成 ══════════ */
const SYSTEM = `你是为中国英语学习者编写「中译英说法库」的资深编者。

任务:给出一条**中文高频表达**,以及 2–3 个**地道英文说法**。

铁律:
1. 英文说法必须是**母语者真会说的话**,不是逐字硬翻。这一栏的全部价值就在于
   替学生挡掉中式英语 —— 若某个说法是把中文一个字一个字换成英文,直接不要。
2. 2–3 个说法**必须分属不同语域**:casual(朋友之间)/ neutral(一般场合)/
   formal(正式书面或对上级)。语域相同的说法没有教学价值。
3. scene_hint 用中文写「**什么场合用这一说法**」(4–16 字),
   不要复述它的意思 —— 意思学生已经知道了,他不知道的是什么时候能用。
4. 每个说法配一条英文例句 + 对应中文例句。
   **英文例句必须包含该说法**(动词可随时态变形);
   **中文例句必须包含该中文表达**(中间可插入成分,如「你有空吗」→「你这周六有空吗」)。
5. 例句 6–16 词,场景具体,不要教科书腔。
7. sort_order 从 1 开始编号。
6. cn_note 可选,≤20 字,只在该表达有歧义或使用限制时才写。`;

const SCHEMA = {
  type: 'object', additionalProperties: false, required: ['items'],
  properties: {
    items: {
      type: 'array', items: {
        type: 'object', additionalProperties: false,
        required: ['cn_phrase', 'cn_note', 'category', 'renditions'],
        properties: {
          cn_phrase: { type: 'string' },
          cn_note: { type: 'string' },
          category: { type: 'string', enum: SPEC_I.category },
          renditions: {
            type: 'array', items: {
              type: 'object', additionalProperties: false,
              required: ['rendition', 'register', 'scene_hint', 'example_en', 'example_zh', 'sort_order'],
              properties: {
                rendition: { type: 'string' },
                register: { type: 'string', enum: SPEC_I.register },
                scene_hint: { type: 'string' },
                example_en: { type: 'string' },
                example_zh: { type: 'string' },
                sort_order: { type: 'integer' },
              },
            },
          },
        },
      },
    },
  },
};

async function main() {
  const accepted = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : {};
  const seenRend = new Map();
  for (const e of Object.values(accepted))
    for (const r of e.renditions) seenRend.set(r.rendition.toLowerCase().replace(/[^a-z ]/g, '').trim(), e.cn_phrase);

  for (let round = 1; round <= 4; round++) {
    const need = CATEGORIES.map(c => ({
      ...c, miss: c.n - Object.values(accepted).filter(e => e.category === c.key).length,
    })).filter(c => c.miss > 0);
    if (!need.length) break;

    const out = [];
    await pool(need, 2, async (c) => {
      const have = Object.values(accepted).filter(e => e.category === c.key).map(e => e.cn_phrase);
      const res = await callJson({
        system: SYSTEM,
        user: `请给出 ${c.miss + 2} 条**${c.desc}**。\n`
          + (have.length ? `已有(不要重复):${have.join('、')}\n` : '')
          + `category 一律填 "${c.key}"。每条 2–3 个说法,语域必须互不相同。`,
        schemaName: 'cn_expressions', schema: SCHEMA,
        model: 'gpt-4o', temperature: 0.7, maxTokens: 8000,
      });
      out.push(...(res?.items ?? []));
    });

    let ok = 0, bad = 0;
    for (const item of out) {
      if (!item?.cn_phrase || accepted[item.cn_phrase]) continue;
      const fails = gateOne(item, seenRend);
      if (fails.length) { bad++; if (bad <= 3) console.log('  拒 ' + item.cn_phrase + ' — ' + fails[0]); continue; }
      const c = CATEGORIES.find(x => x.key === item.category);
      if (!c || Object.values(accepted).filter(e => e.category === c.key).length >= c.n) continue;
      accepted[item.cn_phrase] = item;
      for (const r of item.renditions)
        seenRend.set(r.rendition.toLowerCase().replace(/[^a-z ]/g, '').trim(), item.cn_phrase);
      ok++;
    }
    writeFileSync(OUT, JSON.stringify(accepted, null, 2), 'utf8');
    console.log(`· 第 ${round} 次:收 ${ok} 拒 ${bad} → ${Object.keys(accepted).length}/${SPEC_I.target}`);
  }

  /* ── 出件前全量复检(第七条:改过闸门就全量回跑)── */
  const all = Object.values(accepted);
  const recheck = new Map();
  let bad = 0;
  for (const e of all) {
    const f = gateOne(e, recheck);
    if (f.length) { bad++; console.log('⚠️ ' + e.cn_phrase + ' — ' + f.join(' | ')); }
    for (const r of e.renditions)
      recheck.set(r.rendition.toLowerCase().replace(/[^a-z ]/g, '').trim(), e.cn_phrase);
  }
  console.log(`\n出件前全量复检:${all.length} 条,不合格 ${bad}`);
  if (bad) { console.log('有不合格,不出件。'); return; }

  emit(all);
}

/* ══════════ 出件:终态写法(第三条增补)══════════ */
function emit(all) {
  const keys = all.map(e => q(e.cn_phrase)).join(', ');
  let sql = `-- I 段 · 中文高频表达 ${all.length} 条(**终态写法,可任意重放**)
--
-- 一条中文 → 2–3 个不同语域的地道英文说法。本段的全部价值是**挡中式英语**。
--
-- ⚠️ 终态:先删掉不在本表内的表达(renditions 靠 FK ON DELETE CASCADE 连带清),
--    再按 cn_phrase 重建。重跑任意次结果不变,不会复活已裁决删除的条目。
-- ⚠️ 硬约束勘验自 DDL(非记忆):category ∈ {daily,proverb} ·
--    register ∈ {casual,neutral,formal} · sort_order CHECK 1..3。
-- ⚠️ 由 Aaron 执行。

BEGIN;

-- ① 终态收敛(renditions 由 FK ON DELETE CASCADE 连带删除)
DELETE FROM vocab_cn_expressions WHERE cn_phrase NOT IN (
  ${keys}
);
DELETE FROM vocab_cn_renditions r
 USING vocab_cn_expressions e
 WHERE r.expression_id = e.id;

-- ② 表达
INSERT INTO vocab_cn_expressions (cn_phrase, cn_note, category, sort_order) VALUES
${all.map((e, i) => `  (${q(e.cn_phrase)}, ${e.cn_note ? q(e.cn_note) : 'NULL'}, ${q(e.category)}, ${i + 1})`).join(',\n')}
ON CONFLICT DO NOTHING;

-- ③ 说法(按 cn_phrase 关联,避免写死 uuid)
INSERT INTO vocab_cn_renditions (expression_id, rendition, register, scene_hint, example_en, example_zh, sort_order)
SELECT e.id, v.rendition, v.register, v.scene_hint, v.example_en, v.example_zh, v.sort_order
  FROM (VALUES
${all.flatMap(e => e.renditions.map(r =>
  `    (${[q(e.cn_phrase), q(r.rendition), q(r.register), q(r.scene_hint), q(r.example_en), q(r.example_zh), r.sort_order].join(', ')})`)).join(',\n')}
  ) AS v(cn_phrase, rendition, register, scene_hint, example_en, example_zh, sort_order)
  JOIN vocab_cn_expressions e ON e.cn_phrase = v.cn_phrase;

-- ── validate:六行都必须是 t(重跑本文件任意次,结果不变)──
SELECT '表达恰 ${all.length} 条' AS expect,
       (SELECT count(*) FROM vocab_cn_expressions) = ${all.length} AS ok
UNION ALL
SELECT '说法恰 ${all.reduce((n, e) => n + e.renditions.length, 0)} 条',
       (SELECT count(*) FROM vocab_cn_renditions) = ${all.reduce((n, e) => n + e.renditions.length, 0)}
UNION ALL
SELECT '每条表达都有 2-3 个说法',
       NOT EXISTS (SELECT 1 FROM vocab_cn_expressions e
                    LEFT JOIN vocab_cn_renditions r ON r.expression_id = e.id
                    GROUP BY e.id HAVING count(r.id) NOT BETWEEN 2 AND 3)
UNION ALL
SELECT '同一表达下语域互不相同',
       NOT EXISTS (SELECT 1 FROM vocab_cn_renditions
                    GROUP BY expression_id, register HAVING count(*) > 1)
UNION ALL
SELECT '英文例句都真的含该说法(抽 sth/sb 后首词)',
       NOT EXISTS (SELECT 1 FROM vocab_cn_renditions
                    WHERE position(lower(split_part(rendition, ' ', 1)) in lower(example_en)) = 0)
UNION ALL
SELECT '无任何 NOT NULL 列为空',
       NOT EXISTS (SELECT 1 FROM vocab_cn_renditions
                    WHERE rendition = '' OR scene_hint = '' OR example_en = '' OR example_zh = '');

COMMIT;
`;
  writeSql('vocab_toefl_cn_expressions.sql', sql);

  const md = `# I 段 · 中文高频表达 ${all.length} 条(全量送审,不抽样)

一条中文 → **2–3 个不同语域**的地道英文说法。本段的全部价值是**替学生挡掉中式英语**。

## 请重点看什么

1. **英文说法是不是母语者真会说的**(而非逐字硬翻)—— 机器闸判不了这一条,只能人审
2. **语域分得对不对** —— casual / neutral / formal 三档,同一条下必须互不相同(i2 已机器卡)
3. **scene_hint 是不是在说"什么场合用"** —— 而不是复述意思。这栏最容易写成废话

## 机器闸已保证的(不必再看)

i1 类别 / i2 语域取值与互异 / i3 条数与 sort_order(**上限 3 来自 DDL CHECK**) /
i4 说法长度与不混汉字 / **i5 英文例句真的含该说法** / **i6 中文例句真的含该表达** /
i7 中文表达与注释长度 / i8 场景提示长度 / i9 说法全局不重复。

**i5+i6 双向包含是本段最强的形式判据** —— 它挡住的是"例句和说法各说各话"这类
看起来完整、实则对不上的产出。

## 全量 ${all.length} 条

${CATEGORIES.map(c => `### ${c.desc}(${all.filter(e => e.category === c.key).length} 条)

${all.filter(e => e.category === c.key).map(e => `**${e.cn_phrase}**${e.cn_note ? `(${e.cn_note})` : ''}

| 语域 | 英文说法 | 什么场合用 | 例句 |
| --- | --- | --- | --- |
${e.renditions.map(r => `| ${r.register} | **${r.rendition}** | ${r.scene_hint} | ${r.example_en}<br>${r.example_zh} |`).join('\n')}
`).join('\n')}`).join('\n')}
`;
  writeReview('vocab_toefl_cn_expressions.md', md);
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) main();
