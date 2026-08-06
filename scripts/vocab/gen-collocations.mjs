/**
 * F 段:高频搭配 —— 写入 vocab_collocations(word_id / collocation / translation_zh / freq_rank)。
 *
 * 与 A 段例句里那 3 条 collocation 的关系:**互补,不重复**。
 * A 段每个词已有 3 条搭配,每条都配了完整例句;F 段再补 5 条**只给搭配 + 中译**,
 * 不配例句 —— 词卡上"这个词常跟什么词一起用"那一栏要铺得开,
 * 3 条不够,但给 8 条都配例句又太重。
 *
 * ⚠️ 已有的 3 条必须喂进 prompt 并做机器闸门,否则模型会把它们原样吐回来 ——
 *    表上有 unique(word_id, collocation),重复的会在入库时炸,
 *    但那时才发现就晚了(SQL 已经交出去了)。
 *
 * 七道闸门(f1-f7),复用 A 段已验证过的分词/同根判定:
 *   f1 含目标词      复用 g7 的口径(认屈折形/派生形/连字符复合词)
 *   f2 不同根同义反复 复用 g13(melodious melodies 那类)
 *   f3 不与已有 3 条重复(大小写 + 空白归一后比对)
 *   f4 组内不重复
 *   f5 是搭配不是句子  2-5 个词、无句号、首字母不大写成句
 *   f6 中译规范      非空、无句末句号(它是短语不是句)、不混半角标点
 *   f7 无 em-dash
 *
 * 用法:
 *   node scripts/vocab/gen-collocations.mjs --limit=10 --no-emit
 *   node scripts/vocab/gen-collocations.mjs
 *
 * ⚠️ 只读 + 产出文件,绝不写库。SQL 交 Aaron 跑。
 */
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { g7_collocationContainsWord, g13_collocationNotSameRoot, g3_noEmDash } from './gates.mjs';
import {
  DATA, arg, flag, callJson, pool, generateWithGates,
  loadCache, saveCache, loadWordPool, q, writeSql, writeReview,
} from './llm.mjs';

const BANK = arg('bank', 'toefl');
const LIMIT = Number(arg('limit', '0')) || Infinity;
const CONCURRENCY = Number(arg('concurrency', '4'));
const MODEL = arg('model', 'gpt-4o-mini');
const PER_WORD = Number(arg('per-word', '5'));
const NO_EMIT = flag('no-emit');
const EMIT_ONLY = flag('emit-only');
const CACHE_FILE = `${BANK}-collocations.json`;

const inflectPath = path.join(DATA, `${BANK}-inflections.json`);
const TABLE = existsSync(inflectPath) ? JSON.parse(readFileSync(inflectPath, 'utf8')) : {};

const norm = s => String(s).toLowerCase().replace(/\s+/g, ' ').trim();
const CJK_THEN_HALF = /[一-鿿][,.!?;:]/;

export function gateCollocations(word, list, existing) {
  const fails = [];
  if (!Array.isArray(list) || !list.length) return ['f4 没有产出搭配'];

  const have = new Set(existing.map(norm));
  const seen = new Set();

  // f1 / f2 复用 A 段闸门 —— 它们吃的是 {collocation} 形状的数组
  const asExamples = list.map(x => ({ collocation: x.collocation }));
  const g7 = g7_collocationContainsWord(asExamples, word.headword, TABLE);
  if (g7) fails.push(`f1 ${g7}`);
  const g13 = g13_collocationNotSameRoot(asExamples, word.headword, TABLE);
  if (g13) fails.push(`f2 ${g13}`);

  list.forEach((x, i) => {
    const c = String(x.collocation || '').trim();
    const t = String(x.translation_zh || '').trim();
    const n = norm(c);

    if (have.has(n)) fails.push(`f3 第${i + 1}条「${c}」与已有例句搭配重复`);
    if (seen.has(n)) fails.push(`f4 第${i + 1}条「${c}」组内重复`);
    seen.add(n);

    const wc = c.split(/\s+/).filter(Boolean).length;
    if (wc < 2 || wc > 5) fails.push(`f5 第${i + 1}条「${c}」${wc} 个词,搭配应为 2-5 词`);
    if (/[.!?]$/.test(c)) fails.push(`f5 第${i + 1}条「${c}」带句末标点,那是句子不是搭配`);

    if (!t) fails.push(`f6 第${i + 1}条中译为空`);
    else {
      // ⚠️ 搭配的中译是**短语**,不该有句末句号 —— 这与 A 段例句译文(要求句号)相反,
      //    别照抄 g8。照抄的话会把「提出请求」判成"缺句号"。
      if (/[。！？.]$/.test(t)) fails.push(`f6 第${i + 1}条中译「${t}」带句末句号,搭配译文是短语`);
      if (CJK_THEN_HALF.test(t)) fails.push(`f6 第${i + 1}条中译「${t}」中文里混了半角标点`);
      if (/[A-Za-z]/.test(t)) fails.push(`f6 第${i + 1}条中译「${t}」混了英文字母`);
    }
    const dash = g3_noEmDash(c, t);
    if (dash) fails.push(`f7 第${i + 1}条 ${dash}`);
  });

  /* f9 派生形不得占多数。
   * 实测:context 的五条里三条是「contextual factors / information / understanding」——
   * 那是 **contextual 的搭配,不是 context 的**。g7 放行派生形是为了
   * inflation → inflationary pressures 那种确有其事的情况,但那应该是少数。
   * 判据:用**屈折形以外的派生形**的条目,不得超过总数的 1/3。 */
  const hw = word.headword.toLowerCase();
  const infl = new Set([hw, hw + 's', hw + 'es', hw + 'ed', hw + 'ing', hw + 'd']);
  const derived = list.filter(x => {
    const toks = String(x.collocation).toLowerCase().split(/[\s-]+/).map(t => t.replace(/[^a-z]/g, ''));
    return !toks.some(t => infl.has(t));
  });
  if (derived.length * 3 > list.length) {
    fails.push(`f9 ${derived.length}/${list.length} 条用的是派生形不是目标词本身(如 context → contextual),派生形不得超过 1/3`);
  }
  return fails;
}

/**
 * 句式单一度 —— **警告,不是闸门**。
 *
 * ⚠️ 曾经把它做成硬闸,失败率立刻 25%,而失败的两个是:
 *      voter → voter turnout / voter registration / voter fraud
 *      grab  → grab a bite / grab attention / grab a chance
 *    这两个词的高频搭配**天然就集中在一个句式上**(名词作定语 / 动词带宾语),
 *    模型没偷懒,是语言本身如此。
 *    而 attorney 那次「全是 X attorney」确实是偷懒。
 *    **机器分不清这两者** —— 判据一样,结论相反。
 *    所以降级成统计量,在送审件里列出来给人看,不拦生成。
 *    prompt 里那条"句式要有变化"保留,实测对 attorney 有效。
 */
export function monotonous(word, list) {
  if (!Array.isArray(list) || list.length < 4) return false;
  const hw = word.headword.toLowerCase().slice(0, 4);
  const pos = list.map(x => {
    const toks = String(x.collocation).toLowerCase().split(/\s+/).filter(Boolean);
    const at = toks.findIndex(tk => tk.replace(/[^a-z-]/g, '').startsWith(hw));
    return at <= 0 ? 'head' : (at >= toks.length - 1 ? 'tail' : 'mid');
  });
  return new Set(pos).size === 1;
}

const SYSTEM = `You are a lexicographer building an English-Chinese vocabulary app for Chinese TOEFL students.
Answer only with the required JSON. Give real, high-frequency collocations, not invented ones.`;

const SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['collocations'],
  properties: {
    collocations: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        required: ['collocation', 'translation_zh'],
        properties: {
          collocation: { type: 'string', description: '2-5 个词的英文搭配,必须含目标词' },
          translation_zh: { type: 'string', description: '中文译文,短语不是句子,不加句号' },
        },
      },
    },
  },
};

function buildPrompt(w, existing, notes) {
  return `目标词:${w.headword}${w.pos ? `  (${w.pos})` : ''}
中文释义:${w.def_zh}

给出 ${PER_WORD} 条这个词的**高频搭配**,按常用度从高到低排序。

⚠️ 下面这 ${existing.length} 条已经在词卡上了,**一条都不许重复**(换个大小写也算重复):
${existing.map(c => `  · ${c}`).join('\n')}

硬要求:
  · 每条 2-5 个词,**必须含目标词**(屈折形、派生形、连字符复合词都算)。
  · 是**搭配**不是句子:不许带句号、不许写成完整句。
    ✅ "abandon a plan" / "concerned about" / "amid uncertainty"
    ❌ "The city abandoned its plan." ❌ "abandon"(只有一个词,不算搭配)
  · **不许同根同义反复** —— 搭配里除目标词外不能再出现同词根的词。
    ❌ melodious melodies  ❌ conservation to conserve
  · 中译是**短语**,${'不加句末句号'}、不混半角标点、不含英文字母。
    ✅ "放弃计划" / "对…感到担忧"    ❌ "放弃计划。" ❌ "abandon 计划"
  · **句式要有变化,不许 ${PER_WORD} 条一个模子。**
    反例(attorney 实测):corporate attorney / criminal attorney / immigration attorney /
    real estate attorney / personal injury attorney —— 全是「形容词 + attorney」,
    学生看完只知道它前面能加定语。应该混着给:动词搭配、介词搭配、目标词在前/在后都要有。
    ✅ hire an attorney / attorney general / consult an attorney / attorney for the defense
  · **用目标词本身,别滑到派生词上。**
    反例(context 实测):contextual factors / contextual information / contextual understanding
    —— 那是 contextual 的搭配,不是 context 的。派生形最多给 1 条。
  · 必须是英语里**真实高频**的组合,不许为了凑数生造。
    宁可少给几条,也不要编 —— 只给 ${PER_WORD} 条里你有把握的那些。
${notes?.length ? `\n上次被机器闸门拒了,原因如下,请针对性修正:\n${notes.map(n => `  · ${n}`).join('\n')}` : ''}`;
}

async function main() {
  const words = loadWordPool(BANK);
  const cache = loadCache(CACHE_FILE);
  const existingOf = w => w.examples.map(e => e.collocation).filter(Boolean);

  if (!EMIT_ONLY) {
    // 缓存重验(闸门改过后旧缓存必须重新过闸,否则脏数据永远绕过新闸门)
    const byHw = new Map(words.map(w => [w.headword, w]));
    const evicted = [];
    for (const hw of Object.keys(cache)) {
      const w = byHw.get(hw);
      if (!w) continue;
      if (gateCollocations(w, cache[hw], existingOf(w)).length) { delete cache[hw]; evicted.push(hw); }
    }
    if (evicted.length) {
      process.stdout.write(`· 缓存重验:淘汰 ${evicted.length} 条重生成\n`);
      saveCache(CACHE_FILE, cache);
    }

    const pending = words.filter(w => !(w.headword in cache)).slice(0, LIMIT === Infinity ? undefined : LIMIT);
    process.stdout.write(`· 待办 ${pending.length} 词(已缓存 ${Object.keys(cache).length})\n`);

    let ok = 0, failed = 0, n = 0;
    await pool(pending, CONCURRENCY, async (w) => {
      const existing = existingOf(w);
      const r = await generateWithGates({
        label: w.headword,
        build: notes => callJson({
          system: SYSTEM, user: buildPrompt(w, existing, notes),
          schemaName: 'collocations', schema: SCHEMA, model: MODEL, temperature: 0.5,
        }).then(x => x.collocations),
        gate: list => gateCollocations(w, list, existing),
      });
      n++;
      if (r.ok) { cache[w.headword] = r.payload; ok++; }
      else { failed++; if (failed <= 40) process.stdout.write(`  ✗ ${w.headword}: ${r.fails[0]}\n`); }
      if (n % 100 === 0) { saveCache(CACHE_FILE, cache); process.stdout.write(`  … ${n}/${pending.length}(失败 ${failed})\n`); }
    });
    saveCache(CACHE_FILE, cache);
    const rate = n ? (failed / n * 100).toFixed(1) : '0.0';
    process.stdout.write(`\n完成 ${ok} · 失败 ${failed} · 失败率 ${rate}%\n`);
    if (Number(rate) > 5) process.stdout.write('⚠️ 失败率超 5%,按护栏应停下看原因\n');
  }

  if (NO_EMIT) return;
  emit(words, cache, existingOf);
}

function emit(words, cache, existingOf) {
  const rows = words.filter(w => w.headword in cache);
  // 出件前全量复检 —— 生成期过闸 ≠ 现在过闸
  const bad = rows.filter(w => gateCollocations(w, cache[w.headword], existingOf(w)).length);
  process.stdout.write(`\n出件前全量复检:${rows.length} 词,不合格 ${bad.length}\n`);
  if (bad.length) {
    bad.slice(0, 8).forEach(w => process.stdout.write(`  ✗ ${w.headword}: ${gateCollocations(w, cache[w.headword], existingOf(w))[0]}\n`));
    process.stdout.write('⚠️ 有不合格项,不出 SQL\n');
    process.exitCode = 1;
    return;
  }

  const total = rows.reduce((n, w) => n + cache[w.headword].length, 0);
  const values = rows.flatMap(w => cache[w.headword].map((c, i) =>
    `  (${q(w.headword.toLowerCase())}, ${q(c.collocation)}, ${q(c.translation_zh)}, ${i + 1})`)).join(',\n');

  writeSql(`vocab_${BANK}_collocations.sql`, `-- F 段 高频搭配 —— ${rows.length} 词 / ${total} 条
-- 与 vocab_examples 里那 3 条搭配**互补不重复**(f3 闸门保证,大小写+空白归一后比对)。
-- freq_rank 按模型给的常用度顺序,1 最高。
-- 幂等:ON CONFLICT (word_id, collocation) 更新译文与序号,重复跑不产生重复行。
-- ⚠️ 由 Aaron 执行。

BEGIN;

SELECT 'BEFORE' AS stage, count(*) AS collocations FROM vocab_collocations;

INSERT INTO vocab_collocations (word_id, collocation, translation_zh, freq_rank)
SELECT w.id, v.collocation, v.translation_zh, v.freq_rank
  FROM (VALUES
${values}
  ) AS v(headword, collocation, translation_zh, freq_rank)
  JOIN vocab_words w ON lower(w.headword) = v.headword
ON CONFLICT (word_id, collocation) DO UPDATE
  SET translation_zh = EXCLUDED.translation_zh, freq_rank = EXCLUDED.freq_rank;

SELECT 'AFTER' AS stage, count(*) AS collocations FROM vocab_collocations;

-- ── count-validate:四行都必须是 t,否则 ROLLBACK ──
SELECT '搭配总数 = ${total}' AS expect,
       (SELECT count(*) FROM vocab_collocations) = ${total} AS ok
UNION ALL
SELECT '覆盖 ${rows.length} 个词',
       (SELECT count(DISTINCT word_id) FROM vocab_collocations) = ${rows.length}
UNION ALL
SELECT '没有孤儿搭配(word_id 都挂得上词)',
       NOT EXISTS (SELECT 1 FROM vocab_collocations c LEFT JOIN vocab_words w ON w.id = c.word_id WHERE w.id IS NULL)
UNION ALL
SELECT '没有与例句搭配重复的',
       NOT EXISTS (
         SELECT 1 FROM vocab_collocations c
           JOIN vocab_examples e ON e.word_id = c.word_id
          WHERE lower(btrim(c.collocation)) = lower(btrim(e.collocation))
       );

COMMIT;
`);

  const step = Math.max(1, Math.floor(rows.length / 20));
  const sample = rows.filter((_, i) => i % step === 0).slice(0, 20);
  const mono = rows.filter(w => monotonous(w, cache[w.headword]));
  writeReview(`vocab_${BANK}_collocations_sample.md`, `# F 段 高频搭配 · 送审件

**${rows.length} 词 / ${total} 条**,每词 ${PER_WORD} 条,与例句里已有的 3 条**互补不重复**。
机器闸门 f1-f7 + f9(派生形占比)全量复检 **0 不合格**。

## ⚠️ 句式单一的 ${mono.length} 词(${(mono.length / rows.length * 100).toFixed(1)}%)—— 统计量,不是缺陷

${PER_WORD} 条搭配里目标词位置全相同。**这不一定是问题**:
\`voter turnout / voter registration / voter fraud\` 天然就集中在一个句式上,
而 \`attorney\` 那种「全是 X attorney」才是模型偷懒 —— **机器分不清这两者**,
所以列出来给你看,不拦生成。

${mono.slice(0, 20).map(w => `· ${w.headword}:${cache[w.headword].map(c => c.collocation).join(' / ')}`).join('\n')}

## 抽样 ${sample.length} 词

${sample.map(w => `**${w.headword}**(${w.def_zh})　已有:${existingOf(w).join(' / ')}
| 新搭配 | 中译 |
| --- | --- |
${cache[w.headword].map(c => `| ${c.collocation} | ${c.translation_zh} |`).join('\n')}
`).join('\n')}
`);
}

/* ⚠️ 只在自己是入口时执行(被 import 时必须什么都不做)。 */
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(e => { process.stderr.write(`\n${e.stack || e.message}\n`); process.exit(1); });
}
