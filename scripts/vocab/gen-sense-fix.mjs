/**
 * def_zh 义项补全(强信号批次)—— 以 ECDICT 为义项基准,给"我们只写了 1 义、
 * 但词典确实分列了 ≥2 个不同词性义"的词补上第二义。
 *
 * ══ 三条不可越界的红线,全部做成机器闸门 ══
 *
 * s1 **第一义项逐字不变**。例句是锚定第一义项生成的,而本轮不重生成例句 ——
 *    第一义一改,三条例句立刻和释义对不上。所以模型的活儿是**加**不是**改**。
 *    这也是"作用面最小化"在这一轮的具体形态。
 * s2 **第二义必须在 ECDICT 里找得到依据**,不许发明。
 *    判据:第二义(剥掉尾部"的/地/者"等)要与某个 ECDICT 义项互为子串。
 *    这是本轮唯一能机械拦住"模型自由发挥"的东西,必须硬。
 * s3 **体裁照旧**:走 defZhShapeProblem(≤2 义、每义 2-8 字、无解释性标记词、
 *    无英文字母),阈值全部取自 spec.mjs。
 *
 * "没有值得教的第二义"是**合法答案**(Aaron 裁决)。ECDICT 的词性标注有噪声:
 *   participant 标 a. 有份的、vaccine 标 a. 疫苗的、shrimp 标 vi. 捕小虾 ——
 *   这些第二词性不是该教给学生的常用义,照抄进来反而是退步。
 * 所以 schema 里有 `skip` 字段,模型判 skip 时不产出任何改动。
 *
 * ⚠️ 只读 + 产出文件,绝不写库。SQL 交 Aaron 跑。
 * ⚠️ 对照件的"改前"取自不可变基线快照(规矩 c),重跑多少次都是同一个历史值。
 *
 *   node scripts/vocab/gen-sense-fix.mjs --limit=10 --no-emit   # 试跑
 *   node scripts/vocab/gen-sense-fix.mjs                        # 全量 + 出件
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defZhShapeProblem } from './gates.mjs';
import { SPEC } from './spec.mjs';
import {
  DATA, GEN, arg, flag, callJson, pool, generateWithGates,
  loadCache, saveCache, loadWordPool, q, writeSql, writeReview,
} from './llm.mjs';

const BANK = arg('bank', 'toefl');
const LIMIT = Number(arg('limit', '0')) || Infinity;
const CONCURRENCY = Number(arg('concurrency', '4'));
const NO_EMIT = flag('no-emit');
const EMIT_ONLY = flag('emit-only');
const CACHE_FILE = `${BANK}-sense-fix.json`;
const BASELINE = path.join(DATA, `${BANK}-sense-fix-baseline.json`);

const HERE = path.dirname(fileURLToPath(import.meta.url));
const GAP = path.join(DATA, `${BANK}-sense-gap.json`);

/** 剥掉词尾的语法性字,用于 s2 的子串比对(「沉没的」↔「沉没」要能对上)。 */
const core = s => String(s).replace(/[的地得者性]+$/u, '').trim();

/**
 * s2:第二义必须在 ECDICT 里找得到依据。
 * 互为子串即可 —— 「使沉没」vs「沉没」、「慢性病患者」vs「患者」都算有据。
 */
function backedByDict(sense, ecdictGlosses) {
  const a = core(sense);
  if (a.length < 2) return false;
  return ecdictGlosses.some(g => {
    const b = core(g);
    return b.length >= 2 && (b.includes(a) || a.includes(b));
  });
}

export function gateSenseFix(word, out, ecdictGlosses) {
  const fails = [];
  if (out.skip) return fails;                       // 判"无值得教的第二义",合法

  const def = String(out.def_zh || '').trim();
  const shape = defZhShapeProblem(def);
  if (shape) fails.push(`s3 ${shape}`);

  const parts = def.split(SPEC.defZh.sep).map(s => s.trim()).filter(Boolean);
  const oldFirst = String(word.def_zh).split(SPEC.defZh.sep)[0].trim();

  // s1 第一义项逐字不变 —— 例句锚定它,本轮不重生成例句
  if (parts[0] !== oldFirst) {
    fails.push(`s1 第一义项被改了:「${oldFirst}」→「${parts[0]}」(例句锚定第一义,不许动)`);
  }
  if (parts.length < 2) {
    fails.push('s1 没有补出第二义 —— 补不出来应该返回 skip,而不是原样返回');
  }
  // s2 第二义必须有词典依据
  if (parts[1] && !backedByDict(parts[1], ecdictGlosses)) {
    fails.push(`s2 第二义「${parts[1]}」在 ECDICT 义项里找不到依据,不许发明`);
  }
  // 两义不得互为子串(那是同义堆砌的最明显形态)
  if (parts[1] && (core(parts[0]).includes(core(parts[1])) || core(parts[1]).includes(core(parts[0])))) {
    fails.push(`s2 两个义项互为子串:「${parts[0]}」/「${parts[1]}」,是同义堆砌`);
  }
  return fails;
}

const SYSTEM = `You are a Chinese-English lexicographer. Answer only with the required JSON.
You may only choose senses that appear in the provided dictionary entry. Never invent a sense.`;

const SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['skip', 'def_zh', 'reason'],
  properties: {
    skip: { type: 'boolean', description: '词典里没有值得教给学生的第二义时为 true' },
    def_zh: { type: 'string', description: 'skip 为 true 时给空串;否则给「原第一义；新第二义」' },
    reason: { type: 'string', description: '一句话说明为什么这样选(中文,≤30 字)' },
  },
};

function buildPrompt(w, glossesText, notes) {
  const first = String(w.def_zh).split(SPEC.defZh.sep)[0].trim();
  return `目标词:${w.headword}${w.pos ? `  (${w.pos})` : ''}
我们现在的中文释义:${w.def_zh}
ECDICT 词典条目(按词性分列):
${glossesText}

任务:判断这个词是否有**第二个值得教给中国学生的常用义**,如果有就补上。

⚠️ 铁律一:**第一义项「${first}」必须原样保留,一个字都不许改。**
   例句是锚定第一义项写的,本轮不重新生成例句 —— 改了第一义,例句就对不上了。
   输出格式必须是:${first}${SPEC.defZh.sep}<新的第二义>

⚠️ 铁律二:**第二义只能从上面 ECDICT 条目里挑,不许发明。**
   挑最常用的那一个,再润色成 ${SPEC.defZh.minChars}-${SPEC.defZh.maxChars} 字的词典式短语。

⚠️ 铁律三:**没有值得教的第二义就返回 skip = true,这是正确答案,不是失败。**
   ECDICT 的词性标注有噪声,很多"第二词性"不是该教的常用义:
     participant  ECDICT 有 a. 有份的      -> skip(现代英语里几乎不这么用)
     vaccine      ECDICT 有 a. 疫苗的      -> skip(只是名词的定语用法)
     antibiotic   ECDICT 有 a. 抗生的      -> skip
     shrimp       ECDICT 有 vi. 捕小虾     -> skip(生僻)
   该补的样子:
     founder  创始人 -> 创始人${SPEC.defZh.sep}沉没      (n. 创立者 / vt. 使沉没,两个真义)
     ally     盟友   -> 盟友${SPEC.defZh.sep}结盟        (n. 同盟者 / vi. 结盟)
     chronic  慢性的 -> 慢性的${SPEC.defZh.sep}慢性病患者 (a. 慢性的 / n. 慢性病患者)

   判据是"**中国学生学这个词时该不该知道这一义**",不是"标注里有几个词性"。

第二义还必须:
  · 与第一义**真的不同**,不能是近义改写(联盟 vs 联合 ❌)。
  · 不带句号、不写词性缩写、不含英文字母、不写成解释句。
${notes?.length ? `\n上次被机器闸门拒了,原因如下,请针对性修正:\n${notes.map(n => `  · ${n}`).join('\n')}` : ''}`;
}

async function main() {
  if (!existsSync(GAP)) throw new Error(`找不到 ${GAP} —— 先跑 audit-sense-coverage.mjs`);
  const { strong } = JSON.parse(readFileSync(GAP, 'utf8'));
  const words = loadWordPool(BANK);
  const byHw = new Map(words.map(w => [w.headword, w]));
  const cache = loadCache(CACHE_FILE);

  /* 基线快照(规矩 c):第一次处理某个词时记下原值,此后永不覆盖。
   * 不这么做的话,重跑时"改前"会读到已改后的值,对照件静默失效。 */
  const baseline = existsSync(BASELINE) ? JSON.parse(readFileSync(BASELINE, 'utf8')) : {};
  let baselineGrew = false;

  const targets = strong.map(r => ({ ...r, word: byHw.get(r.headword) })).filter(r => r.word);
  for (const t of targets) {
    if (!(t.headword in baseline)) { baseline[t.headword] = t.word.def_zh; baselineGrew = true; }
  }
  if (baselineGrew) writeFileSync(BASELINE, JSON.stringify(baseline, null, 2), 'utf8');

  /** ECDICT 义项文本 + 扁平 gloss 列表(s2 用)。 */
  const glossesOf = r => {
    const blocks = String(r.ecdict).split(' | ');
    return {
      text: blocks.map(b => `  ${b}`).join('\n'),
      flat: blocks.flatMap(b => b.replace(/^[a-z]+\.\s*/, '').split(/[，,、]/).map(s => s.trim()).filter(Boolean)),
    };
  };

  if (!EMIT_ONLY) {
    // 缓存重验:闸门改过之后旧缓存必须重新过闸,否则脏数据永远绕过新闸门
    const evicted = [];
    for (const hw of Object.keys(cache)) {
      const t = targets.find(x => x.headword === hw);
      if (!t) continue;
      const base = { ...t.word, def_zh: baseline[hw] };
      if (gateSenseFix(base, cache[hw], glossesOf(t).flat).length) { delete cache[hw]; evicted.push(hw); }
    }
    if (evicted.length) {
      process.stdout.write(`· 缓存重验:淘汰 ${evicted.length} 条(${evicted.slice(0, 6).join(', ')}${evicted.length > 6 ? '…' : ''})\n`);
      saveCache(CACHE_FILE, cache);
    }

    const pending = targets.filter(t => !(t.headword in cache)).slice(0, LIMIT === Infinity ? undefined : LIMIT);
    process.stdout.write(`· 强信号 ${targets.length} 词,待办 ${pending.length}(已缓存 ${Object.keys(cache).length})\n`);

    let ok = 0, skipped = 0, failed = 0, n = 0;
    await pool(pending, CONCURRENCY, async (t) => {
      const g = glossesOf(t);
      // ⚠️ 判据一律拿**基线值**当"原第一义",不用当前值 —— 重跑时当前值可能已被改过
      const base = { ...t.word, def_zh: baseline[t.headword] };
      const r = await generateWithGates({
        label: t.headword,
        build: notes => callJson({
          system: SYSTEM, user: buildPrompt(base, g.text, notes),
          schemaName: 'sense_fix', schema: SCHEMA, temperature: 0.2,
        }),
        gate: out => gateSenseFix(base, out, g.flat),
      });
      n++;
      if (r.ok) { cache[t.headword] = r.payload; r.payload.skip ? skipped++ : ok++; }
      else { failed++; process.stdout.write(`  ✗ ${t.headword}: ${r.fails.join(' / ')}\n`); }
      if (n % 40 === 0) { saveCache(CACHE_FILE, cache); process.stdout.write(`  … ${n}/${pending.length}\n`); }
    });
    saveCache(CACHE_FILE, cache);
    const rate = n ? (failed / n * 100).toFixed(1) : '0.0';
    process.stdout.write(`\n补出第二义 ${ok} · 判 skip ${skipped} · 失败 ${failed}(${rate}%)\n`);
    if (Number(rate) > 5) process.stdout.write('⚠️ 失败率超 5%,按护栏应停下看原因\n');
  }

  if (NO_EMIT) return;
  emit(targets, cache, baseline, glossesOf);
}

function emit(targets, cache, baseline, glossesOf) {
  const changed = targets.filter(t => cache[t.headword] && !cache[t.headword].skip);
  const skipped = targets.filter(t => cache[t.headword]?.skip);

  // 出件前全量复检 —— 生成期过闸 ≠ 现在过闸(闸门可能已改)
  const bad = changed.filter(t => {
    const base = { ...t.word, def_zh: baseline[t.headword] };
    return gateSenseFix(base, cache[t.headword], glossesOf(t).flat).length;
  });
  process.stdout.write(`\n出件前全量复检:${changed.length} 条改动,不合格 ${bad.length}\n`);
  if (bad.length) {
    bad.slice(0, 8).forEach(t => process.stdout.write(`  ✗ ${t.headword}\n`));
    process.stdout.write('⚠️ 有不合格项,不出 SQL\n');
    process.exitCode = 1;
    return;
  }

  // 对照自检(规矩 c):改前==改后的行必须为 0
  const stale = changed.filter(t => baseline[t.headword] === cache[t.headword].def_zh);

  const values = changed.map(t => `  (${q(t.headword.toLowerCase())}, ${q(cache[t.headword].def_zh)})`).join(',\n');
  writeSql(`vocab_${BANK}_sense_fix.sql`, `-- def_zh 义项补全(强信号批次)—— ${changed.length} 词补出第二义
-- 口径:以 ECDICT 为义项基准,只**加**第二义,**第一义项逐字不变**(例句锚定它,本轮不重生成例句)。
-- 另有 ${skipped.length} 词判定"无值得教的第二义",不改。
-- 闸门 s1(第一义不变)/ s2(第二义有词典依据)/ s3(体裁 ≤${SPEC.defZh.maxChars} 字)全量复检 0 不合格。
-- 对照件:REVIEWAA/vocab_${BANK}_sense_fix_sample.md
-- ⚠️ 由 Aaron 执行。

BEGIN;

SELECT 'BEFORE' AS stage,
       count(*) FILTER (WHERE def_zh LIKE '%${SPEC.defZh.sep}%') AS two_sense_words,
       count(*) AS total
  FROM vocab_words WHERE def_zh IS NOT NULL;

UPDATE vocab_words w
   SET def_zh = v.def_zh, updated_at = now()
  FROM (VALUES
${values}
  ) AS v(headword, def_zh)
 WHERE lower(w.headword) = v.headword;

SELECT 'AFTER' AS stage,
       count(*) FILTER (WHERE def_zh LIKE '%${SPEC.defZh.sep}%') AS two_sense_words,
       count(*) AS total
  FROM vocab_words WHERE def_zh IS NOT NULL;

-- ── count-validate:四行都必须是 t,否则 ROLLBACK ──
SELECT '本批 ${changed.length} 词都已是新值' AS expect,
       (SELECT count(*) FROM vocab_words WHERE lower(headword) IN (${changed.map(t => q(t.headword.toLowerCase())).join(', ')})
         AND def_zh LIKE '%${SPEC.defZh.sep}%') = ${changed.length} AS ok
UNION ALL
SELECT '总词数没变(4471)',
       (SELECT count(*) FROM vocab_words WHERE def_zh IS NOT NULL) = 4471
UNION ALL
SELECT '没有义项超 ${SPEC.defZh.maxChars} 字',
       NOT EXISTS (
         SELECT 1 FROM vocab_words, unnest(string_to_array(def_zh, '${SPEC.defZh.sep}')) AS seg
          WHERE def_zh IS NOT NULL AND char_length(trim(seg)) > ${SPEC.defZh.maxChars}
       )
UNION ALL
SELECT '没有义项数超过 ${SPEC.defZh.maxSenses}',
       NOT EXISTS (
         SELECT 1 FROM vocab_words
          WHERE def_zh IS NOT NULL
            AND array_length(string_to_array(def_zh, '${SPEC.defZh.sep}'), 1) > ${SPEC.defZh.maxSenses}
       );

COMMIT;
`);

  const step = Math.max(1, Math.floor(changed.length / 30));
  const sample = changed.filter((_, i) => i % step === 0).slice(0, 30);
  const skipStep = Math.max(1, Math.floor(skipped.length / 12));
  const skipSample = skipped.filter((_, i) => i % skipStep === 0).slice(0, 12);

  writeReview(`vocab_${BANK}_sense_fix_sample.md`, `# def_zh 义项补全(强信号批次)· 送审件

强信号 **${targets.length}** 词(我们 1 义 / ECDICT ≥2 个不同词性块)。
其中 **${changed.length} 词补出第二义**,**${skipped.length} 词判定"无值得教的第二义"不动**。

## 验收口径(替代已作废的 40% 双义哨兵)

| 闸门 | 判据 | 结果 |
| --- | --- | --- |
| s1 | 第一义项逐字不变(例句锚定它,本轮不重生成例句) | 全量复检 0 不合格 |
| s2 | 第二义必须在 ECDICT 义项里找得到依据,不许发明 | 全量复检 0 不合格 |
| s3 | 体裁:≤${SPEC.defZh.maxSenses} 义 / 每义 ${SPEC.defZh.minChars}-${SPEC.defZh.maxChars} 字 / 无解释性标记词 / 无英文字母 | 全量复检 0 不合格 |
| 对照 | 改前 == 改后的行必须为 0 | ${stale.length} 行${stale.length ? ' ⚠️' : ' ✅'} |

## 一、补出第二义(${sample.length} 词抽样)

| 词 | 改前 | 改后 | ECDICT 依据 |
| --- | --- | --- | --- |
${sample.map(t => `| ${t.headword} | ${baseline[t.headword]} | **${cache[t.headword].def_zh}** | ${String(t.ecdict).slice(0, 46)} |`).join('\n')}

## 二、判定"无值得教的第二义"(${skipSample.length} 词抽样)

这一栏才是本轮的风险面 —— 该补的被 skip 掉了,统计上看不出来。

| 词 | 我们的值 | ECDICT 的第二词性 | 模型的理由 |
| --- | --- | --- | --- |
${skipSample.map(t => `| ${t.headword} | ${t.def_zh} | ${String(t.ecdict).split(' | ')[1] ?? ''} | ${cache[t.headword].reason} |`).join('\n')}
`);

  if (stale.length) {
    process.stdout.write(`\n✗ 对照自检失败:${stale.length} 行 改前==改后\n`);
    process.exitCode = 1;
  }
  process.stdout.write(`\nSENSE_FIX_VERDICT: ${bad.length === 0 && stale.length === 0 ? 'PASS' : 'FAIL'}\n`);
}

/* ⚠️ 只在自己是入口时执行 —— 被 import 时必须什么都不做(踩过:import 触发全量真调 API)。 */
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(e => { process.stderr.write(`\n${e.stack || e.message}\n`); process.exit(1); });
}
