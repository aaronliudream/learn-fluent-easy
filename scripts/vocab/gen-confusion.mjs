/**
 * C 段:辨析组 —— vocab_confusion_groups + vocab_confusion_members
 *
 * ══ 组从哪来:用我们自己的数据,不凭空造 ══
 *
 * 判据是**第一义项撞车** —— 一批词在我们库里的中文释义第一义完全相同,
 * 那在学生眼里就是"这几个词中文一样,到底差在哪"。这正是辨析卡要回答的问题。
 * 实测 4471 词里有 545 组这样的簇(1284 词),而且质量很高:
 *   「嘲笑」← mock / ridicule / scoff / deride / jeer
 *   「过时的」← obsolete / dated / outdated / antiquated / outmoded
 *
 * ⚠️ **拼写形近这条信号被弃用了**,尽管它能凑出 1606 对。
 *    实测产出是 context/contend、context/convex、voter/vowel、ethnic/ethics ——
 *    这些不构成真实混淆,只是共享前缀。英文的编辑距离与"学生会不会搞混"
 *    几乎不相关(中文母语者不靠字形记英文单词)。凑数据量很容易,
 *    但每一组假辨析都在浪费学生的注意力。
 *
 * 闸门(c1-c6):
 *   c1 组内词性一致  实测「谴责」组里 condemnation 是名词、其余是动词 ——
 *                    名词和动词放一张辨析卡上,"差别"会变成词性差别而不是语义差别
 *   c2 组大小 2-5
 *   c3 title_zh ≤6 字,不含标点
 *   c4 feel_zh ≤10 字且**组内互异** —— 全写一样等于没辨析
 *   c5 contrast_hint ≤20 字,非空
 *   c6 成员必须来自本组(模型不许换词/加词)
 *
 * 用法:
 *   node scripts/vocab/gen-confusion.mjs --limit=6 --no-emit
 *   node scripts/vocab/gen-confusion.mjs
 *
 * ⚠️ 只读 + 产出文件,绝不写库。SQL 交 Aaron 跑。
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SPEC } from './spec.mjs';
import {
  arg, flag, callJson, pool, generateWithGates,
  loadCache, saveCache, loadWordPool, q, writeSql, writeReview,
} from './llm.mjs';

const BANK = arg('bank', 'toefl');
const LIMIT = Number(arg('limit', '0')) || Infinity;
const CONCURRENCY = Number(arg('concurrency', '4'));
const MODEL = arg('model', 'gpt-4o');      // 语义辨析是判断题,用强模型
const NO_EMIT = flag('no-emit');
const EMIT_ONLY = flag('emit-only');
const CACHE_FILE = `${BANK}-confusion.json`;

const MAX_TITLE = 6, MAX_FEEL = 10, MAX_HINT = 20;
const primaryPos = w => String(w.pos || '').split('/')[0].trim();

/**
 * 英美拼写变体判定(c7)。
 *
 * ⚠️ 由来:Aaron 审 C 段时抓到「endeavor / endeavour」被圈进同一辨析组 ——
 *    但那是**同一个词的两种拼法**,不是两个词。辨析卡的前提是"这几个词不一样",
 *    拼写变体放进去,学生会以为它们有语义区别,而它们没有。
 *    这比漏掉一组更坏:它教了一个不存在的差别。
 *
 * 覆盖常见的六类对应:
 *   -our/-or(colour/color)  -ise/-ize(realise/realize)
 *   -re/-er(centre/center)  -ce/-se(defence/defense)
 *   -ogue/-og(catalogue/catalog)  双写 l(travelled/traveled)
 */
export function sameSpellingVariant(a, b) {
  const x = String(a).toLowerCase(), y = String(b).toLowerCase();
  if (x === y) return true;
  const norm = s => s
    .replace(/our\b/g, 'or')
    .replace(/ise\b/g, 'ize').replace(/isation\b/g, 'ization')
    .replace(/([bcdfghjklmnpqrstvwxz])re\b/g, '$1er')
    .replace(/ence\b/g, 'ense').replace(/ce\b/g, 'se')
    .replace(/ogue\b/g, 'og')
    .replace(/ll(ed|ing|er|or)\b/g, 'l$1')
    .replace(/ae|oe/g, 'e');
  return norm(x) === norm(y);
}

/** 组来源:第一义项完全相同的簇,2-5 词,且**主词性一致**。 */
export function buildClusters(words) {
  const by = new Map();
  for (const w of words) {
    const k = String(w.def_zh).split(SPEC.defZh.sep)[0].trim();
    if (!by.has(k)) by.set(k, []);
    by.get(k).push(w);
  }
  const out = [];
  for (const [sense, members] of by) {
    if (members.length < 2) continue;
    // c1:按主词性再分一次 —— 名词和动词不能同卡
    const byPos = new Map();
    for (const w of members) {
      const p = primaryPos(w) || '?';
      if (!byPos.has(p)) byPos.set(p, []);
      byPos.get(p).push(w);
    }
    for (const [pos, group] of byPos) {
      /* c7:同组内**拼写变体只留一个**(留先出现的,通常是美式)。
       * endeavor/endeavour 不是两个词,放进辨析卡等于教一个不存在的差别。 */
      const kept = [];
      for (const w of group) {
        if (kept.some(k => sameSpellingVariant(k.headword, w.headword))) continue;
        kept.push(w);
      }
      if (kept.length < 2 || kept.length > 5) continue;
      out.push({ group_key: `${BANK}:${sense}:${pos}`, sense, pos, members: kept });
    }
  }
  return out.sort((a, b) => b.members.length - a.members.length);
}

export function gateConfusion(cluster, out) {
  const fails = [];
  const title = String(out.title_zh || '').trim();
  if (!title) fails.push('c3 title_zh 为空');
  else if ([...title].length > MAX_TITLE) fails.push(`c3 title_zh「${title}」${[...title].length} 字,上限 ${MAX_TITLE}`);
  else if (/[。，、；：！？.,;:!?]/.test(title)) fails.push(`c3 title_zh「${title}」含标点`);

  const rows = Array.isArray(out.members) ? out.members : [];
  if (rows.length !== cluster.members.length) {
    fails.push(`c6 成员数 ${rows.length},应为 ${cluster.members.length}`);
    return fails;
  }
  const want = new Set(cluster.members.map(m => m.headword.toLowerCase()));
  const feels = new Set();
  rows.forEach((r, i) => {
    const hw = String(r.headword || '').trim().toLowerCase();
    if (!want.has(hw)) { fails.push(`c6 第${i + 1}个成员「${r.headword}」不在本组里,不许换词`); return; }
    const feel = String(r.feel_zh || '').trim();
    const hint = String(r.contrast_hint || '').trim();
    if (!feel) fails.push(`c4 ${hw} 的 feel_zh 为空`);
    else {
      if ([...feel].length > MAX_FEEL) fails.push(`c4 ${hw} 的 feel_zh「${feel}」${[...feel].length} 字,上限 ${MAX_FEEL}`);
      if (feels.has(feel)) fails.push(`c4 feel_zh「${feel}」组内重复 —— 全写一样等于没辨析`);
      feels.add(feel);
    }
    if (!hint) fails.push(`c5 ${hw} 的 contrast_hint 为空`);
    else if ([...hint].length > MAX_HINT) fails.push(`c5 ${hw} 的 contrast_hint ${[...hint].length} 字,上限 ${MAX_HINT}`);
    if (/[A-Za-z]/.test(feel)) fails.push(`c4 ${hw} 的 feel_zh 混了英文字母`);
  });
  return fails;
}

const SYSTEM = `You are a Chinese-English lexicographer writing word-discrimination cards for Chinese TOEFL students.
Answer only with the required JSON. Write in Chinese.`;

const SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['title_zh', 'members'],
  properties: {
    title_zh: { type: 'string', description: `辨析组标题,≤${MAX_TITLE} 字,如「说的方式」` },
    members: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        required: ['headword', 'feel_zh', 'contrast_hint'],
        properties: {
          headword: { type: 'string' },
          feel_zh: { type: 'string', description: `这个词的独有语感,≤${MAX_FEEL} 字,组内必须互不相同` },
          contrast_hint: { type: 'string', description: `什么时候用它、和别的有什么不同,≤${MAX_HINT} 字` },
        },
      },
    },
  },
};

function buildPrompt(c, notes) {
  return `下面这 ${c.members.length} 个英文词,在我们词库里的中文释义**第一义完全相同**,都是「${c.sense}」,
词性也都是 ${c.pos}。学生看到它们只会觉得"中文一样,到底差在哪"。

${c.members.map(m => `  · ${m.headword}  —— ${m.def_zh}  (${m.def_en})`).join('\n')}

请给这一组写一张辨析卡:
  · title_zh:这组词共同讲的是什么,≤${MAX_TITLE} 字,不带标点。如「说的方式」「限制的程度」。
  · 每个词给 feel_zh(≤${MAX_FEEL} 字)+ contrast_hint(≤${MAX_HINT} 字)。

⚠️ **feel_zh 组内必须互不相同** —— 全写「嘲笑」等于没辨析。要写出各自的独有语感:
   正例(「嘲笑」组):
     mock     语气最中性     / 泛指取笑,不一定恶意
     ridicule 带公开羞辱意味 / 常用于当众贬低
     scoff    带不屑的语气   / 多指嗤之以鼻的态度
     deride   书面且强烈     / 学术与新闻常见
     jeer     指起哄式嘲弄   / 多为人群当场发出
   反例:五个词全写「嘲笑」「取笑」「讥讽」这种同义词轮换 ❌

⚠️ 差别要落在**语义强度 / 语域正式度 / 典型宾语 / 使用场合**上,
   不要写"这个词更常用"这种没有信息量的话。
⚠️ **成员一个都不能换、不能加、不能减**,就用上面给的这 ${c.members.length} 个。
⚠️ 全部用中文,feel_zh 里不许出现英文字母。
${notes?.length ? `\n上次被机器闸门拒了:\n${notes.map(n => `  · ${n}`).join('\n')}` : ''}`;
}

async function main() {
  const words = loadWordPool(BANK);
  const clusters = buildClusters(words);
  const cache = loadCache(CACHE_FILE);
  process.stdout.write(`· 候选辨析组 ${clusters.length} 组 / ${clusters.reduce((n, c) => n + c.members.length, 0)} 词\n`);

  if (!EMIT_ONLY) {
    const byKey = new Map(clusters.map(c => [c.group_key, c]));
    const evicted = [];
    for (const k of Object.keys(cache)) {
      const c = byKey.get(k);
      if (!c) { delete cache[k]; evicted.push(k); continue; }
      if (gateConfusion(c, cache[k]).length) { delete cache[k]; evicted.push(k); }
    }
    if (evicted.length) { process.stdout.write(`· 缓存重验:淘汰 ${evicted.length} 组重生成\n`); saveCache(CACHE_FILE, cache); }

    const pending = clusters.filter(c => !(c.group_key in cache)).slice(0, LIMIT === Infinity ? undefined : LIMIT);
    process.stdout.write(`· 待办 ${pending.length} 组(已缓存 ${Object.keys(cache).length})\n`);

    let ok = 0, failed = 0, n = 0;
    await pool(pending, CONCURRENCY, async (c) => {
      const r = await generateWithGates({
        label: c.group_key,
        build: notes => callJson({
          system: SYSTEM, user: buildPrompt(c, notes),
          schemaName: 'confusion_card', schema: SCHEMA, model: MODEL, temperature: 0.4,
        }),
        gate: out => gateConfusion(c, out),
      });
      n++;
      if (r.ok) { cache[c.group_key] = r.payload; ok++; }
      else { failed++; if (failed <= 30) process.stdout.write(`  ✗ ${c.sense}(${c.pos}): ${r.fails[0]}\n`); }
      if (n % 40 === 0) { saveCache(CACHE_FILE, cache); process.stdout.write(`  … ${n}/${pending.length}(失败 ${failed})\n`); }
    });
    saveCache(CACHE_FILE, cache);
    const rate = n ? (failed / n * 100).toFixed(1) : '0.0';
    process.stdout.write(`\n完成 ${ok} · 失败 ${failed} · 失败率 ${rate}%\n`);
    if (Number(rate) > 5) process.stdout.write('⚠️ 失败率超 5%,按护栏应停下看原因\n');
  }

  if (NO_EMIT) return;
  emit(clusters, cache, words);
}

function emit(clusters, cache, words) {
  const done = clusters.filter(c => c.group_key in cache);
  const bad = done.filter(c => gateConfusion(c, cache[c.group_key]).length);
  process.stdout.write(`\n出件前全量复检:${done.length} 组,不合格 ${bad.length}\n`);
  if (bad.length) {
    bad.slice(0, 8).forEach(c => process.stdout.write(`  ✗ ${c.sense}: ${gateConfusion(c, cache[c.group_key])[0]}\n`));
    process.stdout.write('⚠️ 有不合格项,不出 SQL\n'); process.exitCode = 1; return;
  }
  const members = done.reduce((n, c) => n + c.members.length, 0);

  const gvals = done.map(c => `  (${q(c.group_key)}, ${q(cache[c.group_key].title_zh)})`).join(',\n');
  const mvals = done.flatMap(c => cache[c.group_key].members.map((m, i) =>
    `  (${q(c.group_key)}, ${q(String(m.headword).toLowerCase())}, ${q(m.feel_zh)}, ${q(m.contrast_hint)}, ${i + 1})`)).join(',\n');

  writeSql(`vocab_${BANK}_confusion.sql`, `-- C 段 辨析组 —— ${done.length} 组 / ${members} 个成员
-- 组的来源:**第一义项撞车 + 主词性一致**的簇(用我们自己的库,不凭空造)。
-- ⚠️ 拼写形近那条信号已弃用 —— 它能凑 1606 对,但产出是 context/contend、voter/vowel,
--    不构成真实混淆,只是共享前缀。
-- 幂等:groups 按 group_key upsert;members 先按 group 清空再插,避免改组后留旧成员。
-- ⚠️ 由 Aaron 执行。

BEGIN;

SELECT 'BEFORE' AS stage,
       (SELECT count(*) FROM vocab_confusion_groups) AS groups,
       (SELECT count(*) FROM vocab_confusion_members) AS members;

INSERT INTO vocab_confusion_groups (group_key, title_zh)
VALUES
${gvals}
ON CONFLICT (group_key) DO UPDATE SET title_zh = EXCLUDED.title_zh;

-- ⚠️ 先删本批组的旧成员再插:组成员可能因重跑而变(词被移出组),
--    只做 upsert 会把被移出的成员永久留在库里。
DELETE FROM vocab_confusion_members m
 USING vocab_confusion_groups g
 WHERE m.group_id = g.id
   AND g.group_key IN (${done.map(c => q(c.group_key)).join(', ')});

INSERT INTO vocab_confusion_members (group_id, word_id, feel_zh, contrast_hint, sort_order)
SELECT g.id, w.id, v.feel_zh, v.contrast_hint, v.sort_order
  FROM (VALUES
${mvals}
  ) AS v(group_key, headword, feel_zh, contrast_hint, sort_order)
  JOIN vocab_confusion_groups g ON g.group_key = v.group_key
  JOIN vocab_words w ON lower(w.headword) = v.headword;

SELECT 'AFTER' AS stage,
       (SELECT count(*) FROM vocab_confusion_groups) AS groups,
       (SELECT count(*) FROM vocab_confusion_members) AS members;

-- ── count-validate:四行都必须是 t,否则 ROLLBACK ──
SELECT '辨析组 = ${done.length}' AS expect,
       (SELECT count(*) FROM vocab_confusion_groups) = ${done.length} AS ok
UNION ALL
SELECT '成员 = ${members}',
       (SELECT count(*) FROM vocab_confusion_members) = ${members}
UNION ALL
SELECT '每组 2-5 个成员',
       NOT EXISTS (
         SELECT 1 FROM vocab_confusion_groups g
          WHERE (SELECT count(*) FROM vocab_confusion_members m WHERE m.group_id = g.id) NOT BETWEEN 2 AND 5
       )
UNION ALL
SELECT '组内 feel_zh 互异',
       NOT EXISTS (
         SELECT group_id FROM vocab_confusion_members
          GROUP BY group_id, feel_zh HAVING count(*) > 1
       );

COMMIT;
`);

  const step = Math.max(1, Math.floor(done.length / 20));
  const sample = done.filter((_, i) => i % step === 0).slice(0, 20);
  writeReview(`vocab_${BANK}_confusion_sample.md`, `# C 段 辨析组 · 送审件

**${done.length} 组 / ${members} 个成员**,机器闸门 c1-c6 全量复检 **0 不合格**。

## 组是怎么圈出来的

判据是**第一义项撞车 + 主词性一致** —— 一批词在我们库里中文释义第一义完全相同,
在学生眼里就是"中文一样,到底差在哪"。这是用我们自己的数据,不是凭空造组。

⚠️ **拼写形近这条信号被我弃用了**,尽管它能凑 1606 对。
实测产出是 \`context/contend\`、\`context/convex\`、\`voter/vowel\`、\`ethnic/ethics\` ——
不构成真实混淆,只是共享前缀。凑数据量容易,但每一组假辨析都在浪费学生注意力。

⚠️ 组内**词性必须一致**:原始簇里「谴责」组混了名词 condemnation 和一堆动词,
已按主词性再切一层 —— 名词和动词同卡,"差别"会变成词性差别而不是语义差别。

## 抽样 ${sample.length} 组

${sample.map(c => `### ${cache[c.group_key].title_zh}　(${c.sense} · ${c.pos})

| 词 | 语感 | 什么时候用 |
| --- | --- | --- |
${cache[c.group_key].members.map(m => `| ${m.headword} | ${m.feel_zh} | ${m.contrast_hint} |`).join('\n')}
`).join('\n')}
`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(e => { process.stderr.write(`\n${e.stack || e.message}\n`); process.exit(1); });
}
