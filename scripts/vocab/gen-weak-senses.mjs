/**
 * 弱信号义项补全 · 试点 100 条。
 *
 * ══ 与强信号的关键差异(假设差异表,Aaron 批准的七条)══
 * 1. **增量修改已上线内容**,不是生成新内容 —— 改坏就是线上事故
 * 2. **必须能回滚** —— 出件时一并产出反向还原 SQL
 * 3. **对照件逐条,不抽样** —— 抽 30 条过了不代表其余安全
 * 4. 分批只为控风险,不为配平
 * 5. **before 取不可变基线**(第三条规矩)—— sense_fix 就栽在读当前值
 * 6. **不用"部分接受"** —— D 段那招是往空表里加,这里边跑边写会留下
 *    "改了一半"的中间态且没有干净回滚点。整批过审后一次性入库。
 * 7. 边界样本刻意造(预筛脚本已做)
 *
 * ══ prompt 与强信号的差异 ══
 * 强信号问的是"**跨词性**有无值得教的第二义";
 * 弱信号必须问"**同一词性下**,这两个中文说法是否指向学生会遇到的
 * **两种不同用法/语境**" —— 若只是同一用法的不同译法(c 筛的漏网),判 skip。
 * 反例库也换成同词性同义堆砌,不是跨词性幽灵义。
 *
 *   node scripts/vocab/gen-weak-senses.mjs [--limit=100]
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defZhShapeProblem } from './gates.mjs';
import { SPEC } from './spec.mjs';
import { DATA, REPO, arg, flag, callJson, pool, loadCache, saveCache, q, writeSql, writeReview } from './llm.mjs';

const BANK = 'toefl';
const LIMIT = Number(arg('limit', '100'));
const CONCURRENCY = Number(arg('concurrency', '4'));
const PICK_MODEL = arg('pick-model', 'gpt-4o');
const CACHE_FILE = `${BANK}-weak-senses.json`;
const BASELINE = path.join(DATA, `${BANK}-weak-baseline.json`);

const pre = JSON.parse(readFileSync(path.join(DATA, `${BANK}-weak-prescreened.json`), 'utf8'));
const targets = pre.sample.slice(0, LIMIT);

const SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['two_uses', 'second', 'why'],
  properties: {
    two_uses: { type: 'boolean', description: '两个说法指向学生会遇到的两种不同用法/语境时为 true' },
    second: { type: 'string', description: 'two_uses 为 true 时给润色后的第二义(2-8 字);否则空串' },
    why: { type: 'string', description: '一句话理由,≤30 字' },
  },
};

const SYSTEM = 'You are a Chinese-English lexicographer. Answer only with the required JSON. When in doubt, answer two_uses = false.';

function prompt(t) {
  return `目标词:${t.headword}${t.pos ? `  (${t.pos})` : ''}
我们现在的中文释义(第一义,不动):${t.ours}
ECDICT 在**同一词性**下还给了:${t.cand}
完整词典条目:${String(t.ecdict).slice(0, 160)}

只回答一个问题:**「${t.ours}」和「${t.cand}」是不是学生会遇到的两种不同用法/语境?**

⚠️ 注意这里问的**不是**"有没有第二个词性的义" —— 两者词性相同。
   要判的是:**同一个词性下,这两个说法是不是对应两种真的不同的用法**。

判 false(只是同一用法的不同译法)的样子 —— 这是本批最常见的情况:
  currently   目前 / 现在      —— 同一个用法,换个中文说法
  coalition   结合 / 联合      —— 同上
  intervention 插入 / 介入      —— 同上
  transition  转变 / 转换      —— 同上
  melancholy  忧郁 / 悲伤      —— 字面不像,但仍是同一种情绪的两种译法
  ⚠️ 上面这类**字面差得远、其实同义**的最容易误判,要特别小心。

判 true(真的两种用法)的样子:
  cite     引用 / 表彰        —— 学术引用 vs 授予荣誉,两个场景
  attorney 律师 / 代理人      —— 法律职业 vs 委托代理(power of attorney)
  theater  剧院 / 战区        —— 场所 vs 军事用语

自检:**如果两个说法在同一个句子位置可以互换而不改变意思,就是同一用法,判 false。**
⚠️ 拿不准判 false —— 判错的代价是这个词少一个义(维持原状),
   而漏判会把同义堆砌写进**已上线**的内容里。`;
}

const gate = (t, out) => {
  if (!out.two_uses) return [];
  const fails = [];
  const second = String(out.second || '').trim();
  const def = `${t.ours}${SPEC.defZh.sep}${second}`;
  const shape = defZhShapeProblem(def);
  if (shape) fails.push(`w1 ${shape}`);
  if (!second) fails.push('w1 判 true 却没给第二义');
  const core = s => String(s).replace(/[的地得者性]+$/u, '');
  if (second && (core(t.ours).includes(core(second)) || core(second).includes(core(t.ours)))) {
    fails.push(`w2 「${t.ours}」/「${second}」互为子串,是堆砌`);
  }
  /* w3 第二义必须在 ECDICT 里有据 —— 弱信号同样不许发明 */
  if (second && !String(t.ecdict).includes(core(second)) && !core(second).includes(core(t.cand))
      && !String(t.cand).includes(core(second))) {
    fails.push(`w3 第二义「${second}」在词典条目里找不到依据`);
  }
  return fails;
};

async function main() {
  const cache = loadCache(CACHE_FILE);
  /* 基线快照(第三条规矩):首次处理时记下原值,此后永不覆盖。
   * ⚠️ sense_fix 就栽在读当前值 —— 重跑时当前值已是改后值,对照件静默失效。 */
  const baseline = existsSync(BASELINE) ? JSON.parse(readFileSync(BASELINE, 'utf8')) : {};
  let grew = false;
  for (const t of targets) if (!(t.headword in baseline)) { baseline[t.headword] = t.ours; grew = true; }
  if (grew) writeFileSync(BASELINE, JSON.stringify(baseline, null, 2), 'utf8');

  const pending = targets.filter(t => !(t.headword in cache));
  process.stdout.write(`· 试点 ${targets.length} 条,待办 ${pending.length}\n`);

  let yes = 0, no = 0, bad = 0, n = 0;
  await pool(pending, CONCURRENCY, async (t) => {
    let out = null;
    for (let a = 1; a <= 3 && !out; a++) {
      try {
        const r = await callJson({ system: SYSTEM, user: prompt(t), schemaName: 'weak_sense', schema: SCHEMA, model: PICK_MODEL, temperature: 0 });
        const f = gate(t, r);
        if (!f.length) out = r;
        else if (a === 3) { bad++; process.stdout.write(`  ✗ ${t.headword}: ${f[0]}\n`); }
      } catch (e) { if (a === 3) { bad++; process.stdout.write(`  ✗ ${t.headword}: ${e.message.slice(0, 60)}\n`); } }
    }
    if (out) { cache[t.headword] = out; out.two_uses ? yes++ : no++; }
    if (++n % 25 === 0) saveCache(CACHE_FILE, cache);
  });
  saveCache(CACHE_FILE, cache);
  process.stdout.write(`\n判两义 ${yes} · 判 skip ${no} · 失败 ${bad}\n`);
  emit(targets, cache, baseline);
}

function emit(targets, cache, baseline) {
  const changed = targets.filter(t => cache[t.headword]?.two_uses);
  const skipped = targets.filter(t => cache[t.headword] && !cache[t.headword].two_uses);
  const bad = changed.filter(t => gate(t, cache[t.headword]).length);
  process.stdout.write(`\n出件前全量复检:${changed.length} 条改动,不合格 ${bad.length}\n`);
  if (bad.length) { process.stdout.write('⚠️ 不出 SQL\n'); process.exitCode = 1; return; }

  /* 对照自检(第三条):改前==改后必须 0 行 */
  const stale = changed.filter(t => baseline[t.headword] === `${t.ours}${SPEC.defZh.sep}${cache[t.headword].second}`);

  const vals = changed.map(t => `  (${q(t.headword.toLowerCase())}, ${q(`${baseline[t.headword]}${SPEC.defZh.sep}${cache[t.headword].second}`)})`).join(',\n');
  writeSql(`vocab_${BANK}_weak_senses_pilot.sql`, `-- 弱信号义项补全 · 试点 —— ${changed.length} 词补出第二义
-- 预筛:1290 → 462(字集重合 211 / 互为子串 2 / 英文释义反查 615),试点抽 ${targets.length} 条。
-- ⚠️ **改的是已上线内容**。跑之前请确认已保留 vocab_${BANK}_weak_senses_rollback.sql。
-- ⚠️ 第一义逐字不变(例句锚定它,不重生成例句)。
-- 由 Aaron 执行。

BEGIN;

UPDATE vocab_words w SET def_zh = v.def_zh, updated_at = now()
  FROM (VALUES
${vals}
  ) AS v(headword, def_zh)
 WHERE lower(w.headword) = v.headword;

-- ── count-validate:三行都必须是 t,否则 ROLLBACK ──
SELECT '本批 ${changed.length} 词逐词与产出一致' AS expect,
       NOT EXISTS (
         SELECT 1 FROM (VALUES
${changed.map(t => `           (${q(t.headword.toLowerCase())}, ${q(`${baseline[t.headword]}${SPEC.defZh.sep}${cache[t.headword].second}`)})`).join(',\n')}
         ) AS v(headword, def_zh)
         JOIN vocab_words w ON lower(w.headword) = v.headword
         WHERE w.def_zh IS DISTINCT FROM v.def_zh
       ) AS ok
UNION ALL
SELECT '本批没把任何词的 def_zh 弄丢',
       NOT EXISTS (SELECT 1 FROM vocab_words
                    WHERE lower(headword) IN (${changed.map(t => q(t.headword.toLowerCase())).join(', ')})
                      AND def_zh IS NULL)
UNION ALL
SELECT '没有义项超 ${SPEC.defZh.maxChars} 字',
       NOT EXISTS (
         SELECT 1 FROM vocab_words, unnest(string_to_array(def_zh, '${SPEC.defZh.sep}')) AS seg
          WHERE def_zh IS NOT NULL AND char_length(btrim(seg)) > ${SPEC.defZh.maxChars}
       );

COMMIT;
`);

  /* 反向还原 SQL —— 差异表第 2 条要求。改的是已上线内容,必须能退回。 */
  writeSql(`vocab_${BANK}_weak_senses_rollback.sql`, `-- 弱信号试点 · **反向还原** —— 把这 ${changed.length} 词退回基线值
-- ⚠️ 只在试点出问题时跑。值取自不可变基线快照,不是当前值。
-- 由 Aaron 执行。

BEGIN;

UPDATE vocab_words w SET def_zh = v.def_zh, updated_at = now()
  FROM (VALUES
${changed.map(t => `  (${q(t.headword.toLowerCase())}, ${q(baseline[t.headword])})`).join(',\n')}
  ) AS v(headword, def_zh)
 WHERE lower(w.headword) = v.headword;

SELECT '已全部退回基线(单义)' AS expect,
       NOT EXISTS (SELECT 1 FROM vocab_words
                    WHERE lower(headword) IN (${changed.map(t => q(t.headword.toLowerCase())).join(', ')})
                      AND def_zh LIKE '%${SPEC.defZh.sep}%') AS ok;

COMMIT;
`);

  writeReview(`vocab_${BANK}_weak_senses_pilot.md`, `# 弱信号义项补全 · 试点对照件(${targets.length} 条)

预筛 **1290 → 462**(字集重合 211 / 互为子串 2 / **英文释义反查 615**),从 462 中抽 ${targets.length} 条试点。

**判两义 ${changed.length} 条 · 判 skip ${skipped.length} 条**。放行标准:打回率 ≤15% 才放量剩余 362。

对照自检:改前 == 改后的行 ${stale.length} 行${stale.length ? ' ⚠️' : '(硬性要求为 0)'}。
「改前」取自不可变基线 \`${BANK}-weak-baseline.json\`,不是当前值(第三条规矩)。

⚠️ 改的是**已上线内容**,反向还原 SQL 已一并产出(\`vocab_${BANK}_weak_senses_rollback.sql\`)。

## 一、判两义,建议改(${changed.length} 条)—— 请逐条裁

| 词 | 词性 | 改前 | 改后 | 模型理由 | 边界类 |
| --- | --- | --- | --- | --- | --- |
${changed.map(t => `| ${t.headword} | ${t.pos ?? ''} | ${baseline[t.headword]} | **${baseline[t.headword]}${SPEC.defZh.sep}${cache[t.headword].second}** | ${cache[t.headword].why} | ${t.boundary ?? ''} |`).join('\n')}

## 二、判 skip,不动(${skipped.length} 条)

这一栏是风险面:该补的被跳过,统计上看不出来。

| 词 | 现值 | 词典另一说法 | 模型理由 |
| --- | --- | --- | --- |
${skipped.map(t => `| ${t.headword} | ${t.ours} | ${t.cand} | ${cache[t.headword].why} |`).join('\n')}
`);
  process.stdout.write(`\nWEAK_PILOT_VERDICT: ${bad.length === 0 && stale.length === 0 ? 'PASS' : 'FAIL'}\n`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(e => { process.stderr.write(`\n${e.stack || e.message}\n`); process.exit(1); });
}
