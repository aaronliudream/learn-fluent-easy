/**
 * def_zh 精准重修 —— **只改中文释义,别的一个字段都不碰**。
 *
 * 起因:全量 198 词跑完后,def_zh 是 198/198 全双义项、单义项 0 个。
 *       统计上不可能 —— 模型把 prompt 里的"1-2 个义项"理解成了"总是给 2 个",
 *       于是出现 currently「目前；现在」、hypothesis「假设；假说」、
 *       alliance「联盟；联合」这类同义堆砌。
 *       这个问题机器闸门兜不住(判断两个中文词是否同义要语义知识,不是正则能做的),
 *       所以只能重新生成释义本身。
 *
 * 为什么不整批重跑:例句/搭配/音标 Aaron 已经审过了,重跑会全部变掉,
 *       等于把已验收的东西推翻重审。这里只重修释义,例句原样保留。
 *
 * ⚠️ 写回时逐字段赋值,只动 def_zh。不做整对象替换,避免顺手改掉别的。
 *
 * 用法:
 *   node scripts/vocab/repair-defzh.mjs --bank=toefl --dry-run   # 只看会改哪些,不调 API
 *   node scripts/vocab/repair-defzh.mjs --bank=toefl             # 实修 + 出 diff 报告
 *
 * 产出:REVIEWAA/vocab_<bank>_defzh_repair_diff.md(全部变更 旧→新 + 统计)
 *
 * ⚠️ 只读库 + 改本地 JSON + 产出文件,绝不写库。
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv, requireKeys } from './env.mjs';
import { defZhShapeProblem } from './gates.mjs';
import { DEF_ZH_RULE } from './prompt-rules.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..', '..');
const GEN = path.join(HERE, 'data', 'generated');

const arg = (k, d) => process.argv.find(a => a.startsWith(`--${k}=`))?.split('=').slice(1).join('=') ?? d;
const BANK = arg('bank', 'toefl');
const MODEL = arg('model', 'gpt-4o-mini');
const CONCURRENCY = Number(arg('concurrency', '4'));
const DRY = process.argv.includes('--dry-run');
/** 双义占比超这个数就报警(裁决里定的 40%)。 */
const ALARM_RATIO = Number(arg('alarm', '0.4'));

const ENV = loadEnv(REPO);

/* ⚠️ DEF_ZH_RULE 从 ./prompt-rules.mjs 引入,**不在本文件另存一份**。
 * 之前这里有一份自己的副本,和生成器那份是两套 —— 改了一边忘另一边就会漂移。 */

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['def_zh', 'sense_count', 'justification'],
  properties: {
    def_zh: { type: 'string' },
    sense_count: { type: 'integer', enum: [1, 2] },
    // 给了 2 个义项就必须说明两义为何本质不同;给 1 个填 "single"。
    justification: { type: 'string' },
  },
};

async function repairOne(w) {
  requireKeys(ENV, ['OPENAI_API_KEY']);
  const ctx = w.examples.map((e, i) => `  ${i + 1}. [${e.collocation}] ${e.sentence}`).join('\n');
  const user = `Word: "${w.headword}"${w.pos ? ` (${w.pos})` : ''}
English definition: ${w.def_en}
How it is actually used on this card:
${ctx}

${DEF_ZH_RULE}`;

  for (let backoff = 0; backoff < 5; backoff++) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ENV.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: MODEL, temperature: 0.2,
        messages: [
          { role: 'system', content: '你为中国学习者写英语词汇卡的中文释义。只输出 JSON。' },
          { role: 'user', content: user },
        ],
        response_format: { type: 'json_schema', json_schema: { name: 'def_zh', strict: true, schema: SCHEMA } },
      }),
    });
    if (res.status === 429 || res.status >= 500) {
      await new Promise(r => setTimeout(r, 2000 * 2 ** backoff));
      continue;
    }
    if (!res.ok) throw new Error(`OpenAI HTTP ${res.status}`);
    const data = await res.json();
    return JSON.parse(data.choices[0].message.content);
  }
  throw new Error('连续限流,放弃');
}

/** 机械校验 = 共用的 defZhShapeProblem(句号/长度/义项数/解释性标记词)
 *  + 自洽性检查(声称几个义项就得有几段)。
 *  ⚠️ 判据只此一份,放在 gates.mjs;这里不再另写一套,免得两边漂移。 */
function shapeOk(r) {
  if (defZhShapeProblem(r.def_zh)) return false;
  const parts = String(r.def_zh).split('；');
  return r.sense_count === 1 ? parts.length === 1 : parts.length === 2;
}

async function main() {
  const p = path.join(GEN, `${BANK}-content.json`);
  if (!existsSync(p)) throw new Error(`找不到 ${p}`);
  const data = JSON.parse(readFileSync(p, 'utf8'));
  const list = Object.values(data);

  /* 基线永远取**最早那份备份**。第二轮修复时若拿当前状态当基线,
   * diff 报告会把第一轮已经改好的变更全丢掉,统计也会失真。 */
  const backupPath = p.replace(/\.json$/, '.before-defzh-repair.json');
  const baseline = existsSync(backupPath)
    ? Object.values(JSON.parse(readFileSync(backupPath, 'utf8')))
    : list;
  const before = baseline.map(w => ({ headword: w.headword, def_zh: w.def_zh }));
  const dbl = before.filter(w => w.def_zh.includes('；')).length;
  process.stdout.write(`· 修复前:${list.length} 词,双义 ${dbl}(${(dbl / list.length * 100).toFixed(1)}%),单义 ${list.length - dbl}\n`);

  if (DRY) { process.stdout.write('  (--dry-run:未调用 API)\n'); return; }

  // --report-only:不调 API,只按当前 JSON 重出 diff 报告(改了报告模板时用)
  if (process.argv.includes('--report-only')) {
    const baseMap0 = new Map(before.map(b => [b.headword, b.def_zh]));
    const ch = list.filter(w => baseMap0.get(w.headword) !== undefined && baseMap0.get(w.headword) !== w.def_zh)
      .map(w => ({ headword: w.headword, old: baseMap0.get(w.headword), next: w.def_zh, senses: w.def_zh.includes('；') ? 2 : 1, why: '(见上轮记录)' }));
    const dbl0 = list.filter(w => w.def_zh.includes('；')).length;
    const ratio0 = dbl0 / list.length;
    writeDiff(before, list, ch, ratio0, ratio0 > ALARM_RATIO);
    process.stdout.write(`· --report-only:仅重出报告(双义 ${dbl0},占比 ${(ratio0 * 100).toFixed(1)}%)\n`);
    return;
  }

  // 改之前先备份,出事能原样回滚。⚠️ 已存在就不覆盖,保住最初那份基线。
  if (!existsSync(backupPath)) copyFileSync(p, backupPath);

  const changes = [];
  // --only=double:只重修当前仍是双义的词(第二轮定点清理用,不重烧已经改好的)
  const ONLY = arg('only', '');
  /* malformed:释义被写成了解释句而不是词典式短语。
   * ⚠️ 这批是本脚本第一轮自己搞出来的回归 —— 第一轮的 shapeOk 只查分号个数,
   *    没查"是不是句子",于是 attorney 从「律师；代理人」被改成
   *    「在法律事务中代表他人的人。」,反而更差。第二轮 --only=double 又只挑
   *    还带分号的,这些没分号的漏网。判据与 shapeOk 一致:含句号 或 单段 >12 字。 */
  const isMalformed = s => !!defZhShapeProblem(s);
  const queue = ONLY === 'double' ? list.filter(w => w.def_zh.includes('；'))
    : ONLY === 'malformed' ? list.filter(w => isMalformed(w.def_zh))
      : [...list];
  if (ONLY) process.stdout.write(`· --only=${ONLY}:本轮只处理 ${queue.length} 词\n`);
  let done = 0;
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
    while (queue.length) {
      const w = queue.shift();
      const old = w.def_zh;
      try {
        let r = null;
        for (let attempt = 1; attempt <= 3; attempt++) {
          r = await repairOne(w);
          if (shapeOk(r)) break;
          r = null;
        }
        if (!r) { process.stdout.write(`  ! ${w.headword} 形状校验三次不过,保留原释义\n`); continue; }
        if (r.def_zh !== old) {
          // ⚠️ 只赋这一个字段
          w.def_zh = r.def_zh;
          changes.push({ headword: w.headword, old, next: r.def_zh, senses: r.sense_count, why: r.justification });
        }
      } catch (e) {
        process.stdout.write(`  ✗ ${w.headword}: ${e.message}\n`);
      }
      done++;
      if (done % 25 === 0) process.stdout.write(`  … ${done}/${list.length}\n`);
      writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
    }
  }));

  writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');

  const after = Object.values(data);
  /* 变更表用「最初基线 vs 最终状态」重算,而不是只用本轮累计的 changes ——
   * 分两轮修的时候,只报本轮会漏掉第一轮的变更。 */
  const baseMap = new Map(before.map(b => [b.headword, b.def_zh]));
  const whyMap = new Map(changes.map(c => [c.headword, c]));
  const allChanges = after
    .filter(w => baseMap.get(w.headword) !== undefined && baseMap.get(w.headword) !== w.def_zh)
    .map(w => ({
      headword: w.headword,
      old: baseMap.get(w.headword),
      next: w.def_zh,
      senses: w.def_zh.includes('；') ? 2 : 1,
      why: whyMap.get(w.headword)?.why || '(上一轮修复,本轮未重跑)',
    }));

  const dblAfter = after.filter(w => w.def_zh.includes('；')).length;
  const ratio = dblAfter / after.length;
  process.stdout.write(`\n· 修复后:双义 ${dblAfter}(${(ratio * 100).toFixed(1)}%),单义 ${after.length - dblAfter},累计改动 ${allChanges.length} 个\n`);
  changes.length = 0; changes.push(...allChanges);

  const alarm = ratio > ALARM_RATIO;
  if (alarm) process.stdout.write(`\n🚨 双义占比 ${(ratio * 100).toFixed(1)}% 仍高于 ${(ALARM_RATIO * 100)}% 阈值,需要人工判断\n`);

  writeDiff(before, after, changes, ratio, alarm);
}

function writeDiff(before, after, changes, ratio, alarm) {
  const beforeDbl = before.filter(w => w.def_zh.includes('；')).length;
  const afterDbl = after.filter(w => w.def_zh.includes('；')).length;

  const md = `# def_zh 精准重修 · 变更对照

> 只重修中文释义。**例句、搭配、音标、def_en、scene 一律未动** —— 你已经审过的那部分内容原样保留。
> 原始数据已备份在 \`scripts/vocab/data/generated/${BANK}-content.before-defzh-repair.json\`。

## 统计

| 指标 | 修复前 | 修复后 |
| --- | ---: | ---: |
| 总词数 | ${before.length} | ${after.length} |
| **单义项** | ${before.length - beforeDbl} | **${after.length - afterDbl}** |
| **双义项** | ${beforeDbl} | **${afterDbl}** |
| 双义占比 | ${(beforeDbl / before.length * 100).toFixed(1)}% | **${(ratio * 100).toFixed(1)}%** |
| 实际改动 | — | **${changes.length}** 个 |

${alarm
      ? `## 🚨 报警:双义占比 ${(ratio * 100).toFixed(1)}%,仍高于 40% 阈值\n\n强措辞没能把比例压下来,建议人工过一遍下面的双义词,或者再收紧一档。`
      : `## ✅ 双义占比 ${(ratio * 100).toFixed(1)}%,在 40% 阈值内\n\n分布已回到合理区间 —— 大多数词本来就只有一个常用义。`}

## 修复后仍为双义的全部 ${afterDbl} 个词(逐个可否决)

⚠️ 这里列的是**最终状态下所有双义词**,不只是本轮改过的 —— 只列改过的会漏掉
"三次形状校验不过、保留原释义"的那些,而它们恰恰最可能仍是同义堆砌。

| 词 | 释义 | 来源 | 模型给的理由 |
| --- | --- | --- | --- |
${after.filter(w => w.def_zh.includes('；')).map(w => {
        const c = changes.find(x => x.headword === w.headword);
        return `| ${w.headword} | ${w.def_zh} | ${c ? '已重修' : '**保留原值**'} | ${c ? c.why : '(重修未通过形状校验,保留原释义 —— 请重点看这些)'} |`;
      }).join('\n')}

## 全部变更(${changes.length} 个)

| # | 词 | 旧 | → | 新 |
| ---: | --- | --- | :-: | --- |
${changes.map((c, i) => `| ${i + 1} | ${c.headword} | ${c.old} | → | **${c.next}** |`).join('\n')}

## 未改动的词

共 ${after.length - changes.length} 个,模型复核后认为原释义已经正确,原样保留。
`;
  const out = path.join(REPO, 'REVIEWAA', `vocab_${BANK}_defzh_repair_diff.md`);
  mkdirSync(path.dirname(out), { recursive: true });
  writeFileSync(out, md, 'utf8');
  process.stdout.write(`· 变更对照 → REVIEWAA/vocab_${BANK}_defzh_repair_diff.md\n`);
}

main().catch(e => { process.stderr.write(`✗ ${e.stack || e.message}\n`); process.exit(1); });
