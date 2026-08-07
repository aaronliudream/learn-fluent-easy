/**
 * J 段 · 场景串记 30 → vocab_scene_packs / vocab_scene_items
 *
 * 一个生活场景串起 8–15 个词/搭配/词块,按**事情发生的叙事顺序**排列,
 * 末尾用两篇短文(完整版 150–200 词 / 速览版 80–100 词)把链上的词全部串进去。
 *
 * ══════ 第八条 · 假设差异表(全文见 REVIEWAA/vocab_scene_packs_kickoff.md)══════
 *   条目间无关系      → 链上 8–15 节点**有先后**,顺序本身是内容 → 新增全序闸 j3
 *   产出以词计长度    → 还有两篇短文                          → 长度闸分三档 j6
 *   例句一对一含说法  → **一篇文 × 15 个词**,一对多            → j4 复用 textmatch,阈值 0.8
 *   内容自足          → 在库词必挂 word_id                     → 新增挂靠闸 j9
 *   一次成文          → 速览版是完整版的机器压缩,只审完整版   → j5 与 j4 不同尺
 *   格式无约束        → 明确禁 em-dash                         → 字符闸 j7
 * ⚠️ 覆盖假设:生活高频词(cart/shipping/refund)**不在托福 4470 词表内** ——
 *    word_id 挂不上是词表边界,不是内容缺陷,挂靠率不作质量指标。
 * ⚠️ 模型即判据:全段固定 gpt-4o。
 *
 *   node scripts/vocab/gen-scenes.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { callJson, pool, q, writeSql, writeReview } from './llm.mjs';
import { contains, hitRatio, sqlHitRatioBelow, articleMismatches } from './textmatch.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, 'data', 'generated', 'scenes.json');
const TOPICS = JSON.parse(readFileSync(path.join(HERE, 'data', 'scene-topics.json'), 'utf8')).topics;

/* ── 规格常量:判据一律引用这里(第四条)── */
const SPEC_J = {
  items: [8, 15],
  kinds: ['word', 'collocation', 'chunk', 'contrast'],   // DDL CHECK
  contrastPairs: [0, 2],   // 下限 0:Aaron 原则③ —— 宁可没有 contrast,不要放低价值对比
  prosCons: 3,
  essayFullWords: [150, 200],
  essayShortWords: [80, 100],
  chainInFull: 0.8,     // j4 硬闸:完整版须含链上 ≥80% 节点
  chainInShort: 0.5,    // j5 压缩件,门槛低于完整版
  structures: ['essay', 'experience'],
};

/* 在库词索引:用于 j9 挂 word_id(headword → 只判在不在,不做质量判据) */
const contentPath = path.join(HERE, 'data', 'generated', 'toefl-content.json');
const INBANK = new Set(existsSync(contentPath)
  ? Object.values(JSON.parse(readFileSync(contentPath, 'utf8'))).map(w => String(w.headword).toLowerCase())
  : []);

/* ══════════ 机器闸 j1–j9 ══════════ */
const wc = s => String(s ?? '').trim().split(/\s+/).filter(Boolean).length;
const EM_DASH = /[—–]|--/;

function gateOne(p) {
  const f = [];
  const items = Array.isArray(p.items) ? p.items : [];

  // j1 节点数
  if (items.length < SPEC_J.items[0] || items.length > SPEC_J.items[1])
    f.push(`j1 节点 ${items.length} 个,规格 ${SPEC_J.items.join('-')}`);

  // j2 kind 取值 —— 引用 DDL CHECK
  for (const it of items)
    if (!SPEC_J.kinds.includes(it.kind))
      f.push(`j2 kind「${it.kind}」不在 DDL CHECK ${SPEC_J.kinds.join('/')} 内`);

  // j3 叙事顺序必须是全序:1..n 连续、不重复
  const orders = items.map(it => it.sort_order).sort((a, b) => a - b);
  if (orders.some((v, i) => v !== i + 1))
    f.push(`j3 sort_order 不是 1..${items.length} 的全序:[${orders.join(',')}]`);

  // j8 双语齐全
  for (const it of items) {
    if (!String(it.text_en || '').trim()) f.push(`j8 节点缺英文:${JSON.stringify(it)}`);
    if (!String(it.text_zh || '').trim()) f.push(`j8 节点「${it.text_en}」缺中文`);
    if (/[一-龥]/.test(it.text_en)) f.push(`j8 节点英文「${it.text_en}」混入汉字`);
    /* ⚠️ contrast 型豁免:同义辨析的中文栏**必须**点名两个英文词
       (「deductible 指自付部分,premium 是保费」)—— 那正是它的设计。
       这条闸是从 I 段搬来的,搬的时候没验这条假设在 J 段成不成立(第八条)。 */
    if (it.kind !== 'contrast' && /[a-zA-Z]{3,}/.test(it.text_zh))
      f.push(`j8 节点中文「${it.text_zh}」混入英文`);
  }
  for (const k of ['essay_full_en', 'essay_full_zh', 'essay_short_en', 'essay_short_zh'])
    if (!String(p[k] || '').trim()) f.push(`j8 缺 ${k}`);

  // j6 长度分档
  const fw = wc(p.essay_full_en), sw = wc(p.essay_short_en);
  if (fw < SPEC_J.essayFullWords[0] || fw > SPEC_J.essayFullWords[1])
    f.push(`j6 完整版 ${fw} 词,规格 ${SPEC_J.essayFullWords.join('-')}`);
  if (sw < SPEC_J.essayShortWords[0] || sw > SPEC_J.essayShortWords[1])
    f.push(`j6 速览版 ${sw} 词,规格 ${SPEC_J.essayShortWords.join('-')}`);

  // j7 禁 em-dash
  for (const k of ['essay_full_en', 'essay_full_zh', 'essay_short_en', 'essay_short_zh'])
    if (EM_DASH.test(String(p[k] || ''))) f.push(`j7 ${k} 出现 em-dash`);
  for (const it of items)
    if (EM_DASH.test(it.text_en)) f.push(`j7 节点「${it.text_en}」出现 em-dash`);

  /* j4 硬闸:完整版短文须含链上 ≥80% 的节点。
     ⚠️ 一对多 —— 每个节点单独判"是否出现在这篇文里",再看命中比例。
        判据复用 textmatch(与 DB validate 同一实现),不另写。 */
  const chain = items.filter(it => it.kind !== 'contrast');
  const inFull = chain.filter(it => contains(it.text_en, p.essay_full_en)).length;
  const rFull = chain.length ? inFull / chain.length : 1;
  if (rFull < SPEC_J.chainInFull)
    f.push(`j4 完整版只含链上 ${inFull}/${chain.length}(${(rFull * 100).toFixed(0)}%),需 ≥${SPEC_J.chainInFull * 100}%`
      + `;缺:${chain.filter(it => !contains(it.text_en, p.essay_full_en)).map(it => it.text_en).join('、')}`);

  // j5 速览版覆盖(门槛低于完整版)
  const inShort = chain.filter(it => contains(it.text_en, p.essay_short_en)).length;
  const rShort = chain.length ? inShort / chain.length : 1;
  if (rShort < SPEC_J.chainInShort)
    f.push(`j5 速览版只含链上 ${inShort}/${chain.length}(${(rShort * 100).toFixed(0)}%),需 ≥${SPEC_J.chainInShort * 100}%`);

  // j9 在库词必挂 word_id(此处只判"该挂没挂",挂靠率不作质量指标)
  for (const it of items) {
    if (it.kind !== 'word') continue;
    const hw = String(it.text_en).toLowerCase().trim();
    if (INBANK.has(hw) && !it.headword_ref)
      f.push(`j9 在库词「${it.text_en}」没有标出 headword_ref,无法挂 word_id`);
  }

  /* j10 美式英语闸(Aaron 原则②)。⚠️ 这是停用词表不是形式判据 ——
     '英式感'没有可机械化的形式特征,只能拿实际打回过的那批兜底 + 人审收口(第九条)。 */
  const BRITISH = [
    ['sit the exam', 'take the exam'], ['past papers', 'practice tests'],
    ['\\bCVs?\\b', 'resume'], ['green channel', '美国无此制度'], ['red channel', '美国无此制度'],
    ['\\bflats?\\b', 'apartment'], ['\\bqueue', 'line'], ['neighbour', 'neighbor'],
    ['\\bpetrol\\b', 'gas'], ['\\benrol\\b', 'enroll'], ['\\btimetable\\b', 'schedule'],
    ['\\bthe bill\\b', 'the check'], ['\\brevise for\\b', 'study for'], ['\\bmobile phone\\b', 'cell phone'],
  ];
  const hay = [p.essay_full_en, p.essay_short_en, ...items.map(i => i.text_en)].join(' | ');
  for (const [br, us] of BRITISH)
    if (new RegExp(br, 'i').test(hay))
      f.push(`j10 出现英式表达 /${br}/,应为美式「${us}」`);

  /* j11 冠词错配(Aaron 2026-08-07 新增)—— 批量替换 flat→apartment 留下 7 处 'a apartment'。
     判据按读音,不按拼写(a university / an hour),实现在 textmatch.mjs 共用。 */
  for (const k of ['essay_full_en', 'essay_short_en'])
    for (const bad of articleMismatches(p[k])) f.push(`j11 ${k} 冠词错配「${bad}」`);
  for (const it of items)
    for (const bad of articleMismatches(it.text_en)) f.push(`j11 节点冠词错配「${bad}」`);

  // 同义弹药 / 正反面
  const contrastN = items.filter(it => it.kind === 'contrast').length;
  if (contrastN < SPEC_J.contrastPairs[0] || contrastN > SPEC_J.contrastPairs[1])
    f.push(`同义弹药 ${contrastN} 组,规格 ${SPEC_J.contrastPairs.join('-')}`);
  if ((p.benefits ?? []).length !== SPEC_J.prosCons) f.push(`benefits 需 ${SPEC_J.prosCons} 条,实为 ${(p.benefits ?? []).length}`);
  if ((p.drawbacks ?? []).length !== SPEC_J.prosCons) f.push(`drawbacks 需 ${SPEC_J.prosCons} 条,实为 ${(p.drawbacks ?? []).length}`);
  for (const x of [...(p.benefits ?? []), ...(p.drawbacks ?? [])])
    if (/[一-龥]/.test(x)) f.push(`benefits/drawbacks 须一律英文,「${x}」是中文`);

  return f;
}

/* ══════════ 生成 ══════════ */
const STRUCT_DESC = {
  essay: '议论文结构:引入 → 好处三条 → 转折弊端 → 权衡结论',
  experience: '经验分享型结构:引入 → 三个要点 → 常见失误 → 建议',
};

const SYSTEM = `你为中国英语学习者编写「场景串记」内容。

一个生活场景,串起 8–15 个词/搭配/词块,**按事情真实发生的先后顺序排列**,
最后用短文把链上的词全部串进去。学生学完一条链 = 会说一个完整场景。

══════ 三条不可违背的原则(Aaron 2026-08-07 升格为规格)══════

**① 链的判据是「能按真实事件顺序连续讲出来」,不是「相关词的集合」。**
每个节点必须能回答:**身处这个场景时,美国人真的会在这一步说这个吗?**
说不出口、或顺序对不上真实流程的,不要放进链里。
反例:把两条互不相干的平行事故("行李丢了"和"错过火车")塞进同一条链 ——
那不是链,是清单。

**② 全段以美式英语为准。** 凡英式表达一律改美式:
  ❌ sit the exam → ✅ take the exam
  ❌ past papers  → ✅ practice tests / old exams
  ❌ CV           → ✅ resume
  ❌ the bill(餐厅)→ ✅ the check
  ❌ green channel / red channel(英式海关制度,美国根本没有)
流程本身也要是美式的:美国入境是**先取行李再过海关**,不是相反。

**③ contrast 服务于场景,不为凑类型硬塞。**
宁可某个场景一组 contrast 都没有,也不要放低价值对比。
  ❌ tolerate vs endure(学习价值低)
  ❌ the bill vs check(那是英美用词差异,不是辨析)
  ❌ fact-check vs skim(非可比概念)
  ✅ put up with vs file a complaint(忍 vs 走正式流程,真决策点)
  ✅ AI-assisted vs AI-generated(辅助 vs 代写,真争议)

铁律:
1. **顺序就是内容**。sort_order 从 1 开始,按事情发生的次序,不是按重要性。
   例(网络购物):browse → add to cart → place an order → free shipping → track the package → return
2. 节点 kind 四型:
   word(单词)/ collocation(固定搭配)/ chunk(可套用的语块)/ contrast(同义辨析,1–2 组)
   词、搭配、词块要**混编**,不要清一色单词。
3. contrast 型写成「A vs B」,text_zh 说清**什么时候用哪个**,别只给释义。
4. **完整版短文必须把链上每一个节点都用进去**(至少 80%),150–200 词。
5. 速览版 **必须落在 80–100 词之间**,是完整版的压缩,保留主干链词。
   ⚠️ 写完请自己数一遍词数;低于 80 词的会被直接打回,宁可多写两句也不要写短。
6. benefits / drawbacks 各 3 条**英文短语**(不是整句,**一律英文**,不要中文)。
7. **禁止使用破折号(em-dash —— 或 --)**,用逗号或分号。
8. 中文栏不许混英文,英文栏不许混汉字。
9. 单词节点若是常见托福词,把原形写进 headword_ref;不是就留空字符串。`;

const SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['items', 'benefits', 'drawbacks', 'essay_full_en', 'essay_full_zh', 'essay_short_en', 'essay_short_zh'],
  properties: {
    items: {
      type: 'array', items: {
        type: 'object', additionalProperties: false,
        required: ['kind', 'text_en', 'text_zh', 'sort_order', 'headword_ref'],
        properties: {
          kind: { type: 'string', enum: SPEC_J.kinds },
          text_en: { type: 'string' }, text_zh: { type: 'string' },
          sort_order: { type: 'integer' }, headword_ref: { type: 'string' },
        },
      },
    },
    benefits: { type: 'array', items: { type: 'string' } },
    drawbacks: { type: 'array', items: { type: 'string' } },
    essay_full_en: { type: 'string' }, essay_full_zh: { type: 'string' },
    essay_short_en: { type: 'string' }, essay_short_zh: { type: 'string' },
  },
};

async function main() {
  const acc = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : {};

  for (let round = 1; round <= 3; round++) {
    const todo = TOPICS.filter(t => !acc[t.title_zh]);
    if (!todo.length) break;
    console.log(`\n第 ${round} 轮:待生成 ${todo.length} 个场景`);

    await pool(todo, 3, async (t) => {
      const res = await callJson({
        system: SYSTEM,
        user: `场景:${t.title_zh}(${t.theme_en})\n`
          + `链条走向参考(可增补,但顺序逻辑照此):${t.seed}\n`
          + `短文结构:**${STRUCT_DESC[t.structure]}**\n\n`
          + `请给出 **不少于 8 个、不多于 15 个** 节点(含 ${SPEC_J.contrastPairs.join('–')} 组 contrast)、`
          + `benefits/drawbacks 各 3 条短语、完整版短文(150–200 词)与速览版(80–100 词),各配中文。`,
        schemaName: 'scene_pack', schema: SCHEMA,
        model: 'gpt-4o', temperature: 0.6, maxTokens: 4000,
      });
      if (!res) return;
      const pack = { ...t, ...res };
      pack.items.forEach((it, i) => { it.sort_order = i + 1; });   // 归一化先于判定(G 段教训)
      /* headword_ref 是**机械可查**的(单词在不在 4470 词表里),不该让模型填、更不该拿它判死。
         归一化补上,判定只兜模型填错的情况。 */
      for (const it of pack.items) {
        if (it.kind !== 'word') continue;
        const hw = String(it.text_en).toLowerCase().trim();
        if (!it.headword_ref && INBANK.has(hw)) it.headword_ref = hw;
      }
      const fails = gateOne(pack);
      if (fails.length) { console.log(`  拒 ${t.title_zh} — ${fails[0]}`); return; }
      acc[t.title_zh] = pack;
      console.log(`  ✓ ${t.title_zh}(${pack.items.length} 节点,完整版 ${wc(pack.essay_full_en)} 词)`);
    });
    writeFileSync(OUT, JSON.stringify(acc, null, 2), 'utf8');
    console.log(`→ 累计 ${Object.keys(acc).length}/${TOPICS.length}`);
  }

  /* ── 出件前全量复检(第七条)── */
  const all = TOPICS.map(t => acc[t.title_zh]).filter(Boolean);
  let bad = 0;
  for (const p of all) {
    const f = gateOne(p);
    if (f.length) { bad++; console.log(`⚠️ ${p.title_zh} — ${f.join(' | ')}`); }
  }
  console.log(`\n出件前全量复检:${all.length}/${TOPICS.length} 场景,不合格 ${bad}`);
  if (bad || all.length < TOPICS.length) { console.log('未齐或有不合格,不出件。'); return; }
  emit(all);
}

/* ══════════ 出件:终态写法 ══════════ */
function emit(all) {
  const keys = all.map(p => q(p.title_zh)).join(', ');
  const itemRows = all.flatMap(p => p.items.map(it =>
    `    (${[q(p.title_zh), q(it.kind), q(it.text_en), q(it.text_zh),
      it.headword_ref && INBANK.has(String(it.headword_ref).toLowerCase()) ? q(String(it.headword_ref).toLowerCase()) : 'NULL',
      it.sort_order].join(', ')})`));

  writeSql('vocab_scene_packs.sql', `-- J 段 · 场景串记 ${all.length} 个(**终态写法,可任意重放**)
--
-- 一个生活场景串起 8-15 个词/搭配/词块(叙事顺序),末尾双档短文把链词全串进去。
-- ⚠️ 终态:先删不在本表内的场景(items 靠 FK ON DELETE CASCADE 连带清),再按 title_zh 重建。
-- ⚠️ is_published 一律 false —— 建完不开灯,待 Aaron 审完再翻。
-- ⚠️ word_id 按 headword 关联 vocab_words;生活高频词多不在托福词表内,挂不上属正常。
-- ⚠️ 由 Aaron 执行。

BEGIN;

DELETE FROM vocab_scene_packs WHERE title_zh NOT IN (
  ${keys}
);

INSERT INTO vocab_scene_packs
  (title_zh, theme_en, essay_short_en, essay_short_zh, essay_full_en, essay_full_zh, sort_order, is_published) VALUES
${all.map((p, i) => `  (${[q(p.title_zh), q(p.theme_en), q(p.essay_short_en), q(p.essay_short_zh),
    q(p.essay_full_en), q(p.essay_full_zh), i + 1, 'false'].join(', ')})`).join(',\n')}
ON CONFLICT (title_zh) DO UPDATE SET
  theme_en = EXCLUDED.theme_en,
  essay_short_en = EXCLUDED.essay_short_en, essay_short_zh = EXCLUDED.essay_short_zh,
  essay_full_en = EXCLUDED.essay_full_en,   essay_full_zh = EXCLUDED.essay_full_zh,
  sort_order = EXCLUDED.sort_order, updated_at = now();

-- 链上节点:整包重建(避免旧节点残留导致 sort_order 冲突)
DELETE FROM vocab_scene_items i
 USING vocab_scene_packs p
 WHERE i.pack_id = p.id AND p.title_zh IN (${keys});

INSERT INTO vocab_scene_items (pack_id, kind, text_en, text_zh, word_id, sort_order)
SELECT p.id, v.kind, v.text_en, v.text_zh, w.id, v.sort_order
  FROM (VALUES
${itemRows.join(',\n')}
  ) AS v(title_zh, kind, text_en, text_zh, headword, sort_order)
  JOIN vocab_scene_packs p ON p.title_zh = v.title_zh
  LEFT JOIN vocab_words w ON lower(w.headword) = v.headword;

-- ── validate:七行都必须是 t ──
SELECT '场景恰 ${all.length} 个' AS expect,
       (SELECT count(*) FROM vocab_scene_packs) = ${all.length} AS ok
UNION ALL
SELECT '节点恰 ${all.reduce((n, p) => n + p.items.length, 0)} 个',
       (SELECT count(*) FROM vocab_scene_items) = ${all.reduce((n, p) => n + p.items.length, 0)}
UNION ALL
SELECT '每个场景 8-15 个节点',
       NOT EXISTS (SELECT 1 FROM vocab_scene_packs p
                    LEFT JOIN vocab_scene_items i ON i.pack_id = p.id
                    GROUP BY p.id HAVING count(i.id) NOT BETWEEN 8 AND 15)
UNION ALL
SELECT '每个场景的 sort_order 是 1..n 全序',
       NOT EXISTS (SELECT 1 FROM vocab_scene_items i
                    GROUP BY i.pack_id
                   HAVING min(i.sort_order) <> 1
                       OR max(i.sort_order) <> count(*)
                       OR count(DISTINCT i.sort_order) <> count(*))
UNION ALL
SELECT '完整版短文含链上 >=80% 节点(与生成端 j4 同一把尺)',
       NOT EXISTS (
         SELECT 1 FROM vocab_scene_packs p
         CROSS JOIN LATERAL (
           SELECT count(*) FILTER (
                    WHERE NOT ${sqlHitRatioBelow('i.text_en', 'p.essay_full_en')}
                  )::numeric / NULLIF(count(*), 0) AS r
             FROM vocab_scene_items i
            WHERE i.pack_id = p.id AND i.kind <> 'contrast'
         ) s
         WHERE s.r < ${SPEC_J.chainInFull}
       )
UNION ALL
SELECT '四篇短文均无 em-dash',
       NOT EXISTS (SELECT 1 FROM vocab_scene_packs
                    WHERE essay_full_en ~ '[—–]' OR essay_full_zh ~ '[—–]'
                       OR essay_short_en ~ '[—–]' OR essay_short_zh ~ '[—–]')
UNION ALL
SELECT '全部未开灯(is_published = false),待审后再翻',
       NOT EXISTS (SELECT 1 FROM vocab_scene_packs WHERE is_published);

COMMIT;
`);

  const attached = all.flatMap(p => p.items).filter(it => it.headword_ref && INBANK.has(String(it.headword_ref).toLowerCase())).length;
  const totalItems = all.reduce((n, p) => n + p.items.length, 0);

  writeReview('vocab_scene_packs.md', `# J 段 · 场景串记 ${all.length} 个(全量送审,不抽样)

一个生活场景串起 8–15 个词/搭配/词块(**按事情发生的叙事顺序**),
末尾双档短文把链上的词全部串进去。学完一条链 = 会说一个完整场景。

## 机器闸已保证的(不必再看)

j1 节点 8–15 · j2 kind 四型(**引用 DDL CHECK**)· j3 sort_order 全序 ·
**j4 完整版含链上 ≥80% 节点(硬闸)** · j5 速览版覆盖 · j6 三档长度 ·
**j7 禁 em-dash** · j8 双语齐全且不串语言 · j9 在库词已标 headword_ref。

j4 与 DB 端 validate **共用 \`textmatch.mjs\` 一份实现**,不是两份等价代码。

## ⚠️ 只能人审的三条(第九条:判不了不硬造)

1. **短文结构是否真按规定走** —— 议论文(引入→好处三条→转折弊端→权衡结论)/
   经验分享型(引入→三要点→常见失误→建议)。每条已标明用的哪种。
2. **叙事顺序是否符合真实生活流程** —— 机器只能验全序,验不了"先后是否合理"。
3. **同义弹药是否真是该场景高频**。

## 挂靠情况(说明,非质量指标)

${attached}/${totalItems} 个节点挂上了 \`word_id\`。
⚠️ **挂靠率低是词表边界问题,不是内容缺陷** —— 生活高频词(cart / shipping / refund)
本就不在托福 4470 词表内,\`word_id\` 因此可空。

---

${all.map((p, i) => `## ${i + 1}. ${p.title_zh}（${p.theme_en}）

**短文结构**:${p.structure === 'essay' ? '议论文(引入→好处三条→转折弊端→权衡结论)' : '**经验分享型**(引入→三要点→常见失误→建议)'}

### 词链（${p.items.length} 节点，叙事顺序）

| # | 类型 | 英文 | 中文 | 挂词卡 |
| --- | --- | --- | --- | --- |
${p.items.map(it => `| ${it.sort_order} | ${it.kind} | ${it.text_en} | ${it.text_zh} | ${it.headword_ref && INBANK.has(String(it.headword_ref).toLowerCase()) ? '✓ ' + it.headword_ref : '—'} |`).join('\n')}

**Benefits**:${(p.benefits ?? []).join(' · ')}
**Drawbacks**:${(p.drawbacks ?? []).join(' · ')}

### 完整版（${wc(p.essay_full_en)} 词）

${p.essay_full_en}

${p.essay_full_zh}

### 速览版（${wc(p.essay_short_en)} 词，完整版的压缩，不必细审）

${p.essay_short_en}
`).join('\n---\n\n')}
`);
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) main();
