/**
 * 语义校验闸门 g10 + g11 —— 机器闸门查不了的那两件事,交给一次校验调用。
 *
 *   g10 例句义项一致:三条例句用的必须是 def_zh 里给出的义项。
 *       实测漏网样例:romance 释义"浪漫;爱情关系",例3 却是 `romance language`
 *       (罗曼语族)—— 完全另一个义项;disposition 释义"性情;倾向",
 *       例2 是 `disposition of assets`(资产处置)。
 *       g5 只管三条搭配/场景互不相同,没有任何机器闸门要求例句演示所定义的义项。
 *
 *   g11 译文忠实:译文不得增译(加原文没有的内容)或漏译。
 *       实测漏网样例:`A packed audience attended the concert last night.`
 *       译成"昨晚,观众席座无虚席,**演唱会非常成功**"—— 后半句英文里没有。
 *       ⚠️ 长度比那版零成本代理指标**实测失败**(见 gates.mjs 里
 *          g11_lengthRatioDiagnostic 的注释:假阳 2 个、真阳 0 个),故改用校验调用。
 *
 * 两项合并进**同一次调用**,所以 g11 的边际成本是零。
 *
 * 用法:
 *   node scripts/vocab/verify-content.mjs --bank=toefl                # 回溯复检全部
 *   node scripts/vocab/verify-content.mjs --bank=toefl --file=<路径>  # 检指定 JSON
 *   node scripts/vocab/verify-content.mjs --bank=toefl --limit=20     # 只检前 N 个
 *
 * 产出:data/verify-report.json + 控制台摘要。**本脚本不改内容**,只报告。
 *      修复由 repair-examples.mjs 按报告定点重修。
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv, requireKeys } from './env.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..', '..');
const DATA = path.join(HERE, 'data');
const GEN = path.join(DATA, 'generated');

const arg = (k, d) => process.argv.find(a => a.startsWith(`--${k}=`))?.split('=').slice(1).join('=') ?? d;
const BANK = arg('bank', 'toefl');
const LIMIT = Number(arg('limit', '0'));
const FILE = arg('file', '');
const MODEL = arg('model', 'gpt-4o-mini');
const CONCURRENCY = Number(arg('concurrency', '4'));

const ENV = loadEnv(REPO);

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['checks'],
  properties: {
    checks: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['index', 'sentence_quote', 'sense_matches', 'sense_problem', 'translation_faithful', 'translation_problem'],
        properties: {
          index: { type: 'integer' },
          /* ⚠️ 必须让模型把它正在判的那句原文抄回来。
           * 实测 index 不可靠:romance 的问题出在例3(romance language / 罗曼语族),
           * 模型却报成 index 1;disposition 的问题在例2(资产处置),也报成 index 1。
           * 按 index 定点重修会改错句子,所以改成按原文匹配,index 只作参考。 */
          sentence_quote: { type: 'string' },
          // g10
          sense_matches: { type: 'boolean' },
          sense_problem: { type: 'string' },
          // g11
          translation_faithful: { type: 'boolean' },
          translation_problem: { type: 'string' },
        },
      },
    },
  },
};

function buildPrompt(w) {
  const lines = w.examples.map((e, i) =>
    `${i + 1}. EN: ${e.sentence}\n   ZH: ${e.translation_zh}\n   collocation: ${e.collocation}`).join('\n');
  return `Word: "${w.headword}"
Chinese definition given on the card (def_zh): ${w.def_zh}
English definition: ${w.def_en}

Examples:
${lines}

For EACH of the 3 examples, judge two things independently and strictly.
sentence_quote: copy the EN sentence you are judging VERBATIM. This is used to align your
answer to the right example, so it must match one of the three sentences above exactly.


A) sense_matches: Does the sentence use "${w.headword}" in a sense that is actually
   covered by the def_zh above?
   Answer false if the sentence uses a DIFFERENT sense that def_zh does not mention.
   Real failures to catch:
     - def_zh "浪漫；爱情关系" but sentence uses "romance language" (Romance = 罗曼语族,
       a language family - a completely different sense) -> false
     - def_zh "性情；倾向" but sentence uses "disposition of assets" (资产处置) -> false
   If the sense is covered by def_zh, answer true.
   sense_problem: if false, say in Chinese which sense the sentence actually uses; else "".

B) translation_faithful: Does the Chinese translation say exactly what the English says,
   with nothing ADDED and nothing DROPPED?
   Real failure to catch:
     - EN "A packed audience attended the concert last night."
       ZH "昨晚，观众席座无虚席，演唱会非常成功。"
       -> false, because "演唱会非常成功" (the concert was very successful) is NOT in the English.
   Natural, idiomatic rewording is fine. Only flag ADDED or DROPPED meaning.
   translation_problem: if false, name the added/dropped part in Chinese; else "".

Be strict but do not invent problems. Most examples are fine.`;
}

async function verifyOne(w) {
  requireKeys(ENV, ['OPENAI_API_KEY']);
  for (let backoff = 0; backoff < 5; backoff++) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ENV.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: MODEL, temperature: 0,
        messages: [
          { role: 'system', content: 'You audit vocabulary study cards. Return ONLY JSON.' },
          { role: 'user', content: buildPrompt(w) },
        ],
        response_format: { type: 'json_schema', json_schema: { name: 'verify', strict: true, schema: SCHEMA } },
      }),
    });
    if (res.status === 429 || res.status >= 500) { await new Promise(r => setTimeout(r, 2000 * 2 ** backoff)); continue; }
    if (!res.ok) throw new Error(`OpenAI HTTP ${res.status}`);
    return JSON.parse((await res.json()).choices[0].message.content);
  }
  throw new Error('连续限流,放弃');
}

async function main() {
  const p = FILE || path.join(GEN, `${BANK}-content.json`);
  if (!existsSync(p)) throw new Error(`找不到 ${p}`);
  const data = JSON.parse(readFileSync(p, 'utf8'));
  let list = Object.values(data);
  if (LIMIT) list = list.slice(0, LIMIT);
  process.stdout.write(`· 语义复检 ${list.length} 词(g10 义项一致 + g11 译文忠实,合并为一次调用/词)\n`);

  const g10Hits = [], g11Hits = [];
  const queue = [...list];
  let done = 0;
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
    while (queue.length) {
      const w = queue.shift();
      try {
        const r = await verifyOne(w);
        for (const c of r.checks || []) {
          /* 先按原文匹配定位,匹配不上才退回 index(并标记存疑)。 */
          const norm = s => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          let i = w.examples.findIndex(e => norm(e.sentence) === norm(c.sentence_quote));
          let byQuote = i >= 0;
          if (!byQuote) i = c.index - 1;
          const ex = w.examples[i];
          if (!ex) continue;
          c.index = i + 1;
          if (!byQuote) c.sense_problem = `【定位存疑:原文没对上,按 index 回退】${c.sense_problem}`;
          if (!c.sense_matches) g10Hits.push({ headword: w.headword, index: c.index, def_zh: w.def_zh, sentence: ex.sentence, collocation: ex.collocation, problem: c.sense_problem });
          if (!c.translation_faithful) g11Hits.push({ headword: w.headword, index: c.index, sentence: ex.sentence, translation_zh: ex.translation_zh, problem: c.translation_problem });
        }
      } catch (e) {
        process.stdout.write(`  ✗ ${w.headword}: ${e.message}\n`);
      }
      done++;
      if (done % 25 === 0) process.stdout.write(`  … ${done}/${list.length}\n`);
    }
  }));

  const report = { checked: list.length, g10: g10Hits, g11: g11Hits, at: 'verify-content' };
  writeFileSync(path.join(DATA, 'verify-report.json'), JSON.stringify(report, null, 2), 'utf8');

  process.stdout.write(`\n=== g10 例句义项与 def_zh 不符:${g10Hits.length} 条 ===\n`);
  g10Hits.forEach(h => process.stdout.write(`  ${h.headword} 例${h.index} [${h.collocation}] def_zh=${h.def_zh}\n     ${h.sentence}\n     → ${h.problem}\n`));
  process.stdout.write(`\n=== g11 译文不忠实:${g11Hits.length} 条 ===\n`);
  g11Hits.forEach(h => process.stdout.write(`  ${h.headword} 例${h.index}\n     EN ${h.sentence}\n     ZH ${h.translation_zh}\n     → ${h.problem}\n`));
  process.stdout.write(`\n· 报告 → scripts/vocab/data/verify-report.json\n`);
}

main().catch(e => { process.stderr.write(`✗ ${e.stack || e.message}\n`); process.exit(1); });
