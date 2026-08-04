/**
 * 按 verify-report.json 定点重修例句(g10 义项不符 / g11 译文不忠实)。
 *
 * 只重造**例句三条**(以及 def_en,若它循环定义)。
 * **def_zh 保持不动** —— 那一轮已经单独修过并经人工复核,这里不许再动它,
 * 否则又要重审一遍。重造例句时把已定稿的 def_zh 当作约束喂进去:
 * "三条例句必须都用这个释义给出的义项"。
 *
 * ⚠️ 句长用存量口径 8-16,不用按档区间。batch1 的 594 条句子都是 8-16 生成的,
 *    这里只是补几条,跟着走才一致;按档区间对**未来批次**生效。
 *
 * 用法:
 *   node scripts/vocab/repair-examples.mjs --bank=toefl            # 按报告修
 *   node scripts/vocab/repair-examples.mjs --bank=toefl --dry-run  # 只列要修哪些
 *
 * ⚠️ 只改本地 JSON,绝不写库。
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SCENES, runAllGates, ngrams } from './gates.mjs';
import { loadEnv, requireKeys } from './env.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..', '..');
const DATA = path.join(HERE, 'data');
const GEN = path.join(DATA, 'generated');

const arg = (k, d) => process.argv.find(a => a.startsWith(`--${k}=`))?.split('=').slice(1).join('=') ?? d;
const BANK = arg('bank', 'toefl');
const MODEL = arg('model', 'gpt-4o-mini');
const CONCURRENCY = Number(arg('concurrency', '3'));
const MAX_ATTEMPTS = 3;
const DRY = process.argv.includes('--dry-run');

const ENV = loadEnv(REPO);

const SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['def_en', 'examples'],
  properties: {
    def_en: { type: 'string' },
    examples: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        required: ['collocation', 'scene', 'sentence', 'translation_zh'],
        properties: {
          collocation: { type: 'string' },
          scene: { type: 'string', enum: SCENES },
          sentence: { type: 'string' },
          translation_zh: { type: 'string' },
        },
      },
    },
  },
};

function buildPrompt(w, problems, notes) {
  const retry = notes?.length
    ? `\n\nYOUR PREVIOUS ATTEMPT WAS REJECTED:\n${notes.map(f => `- ${f}`).join('\n')}\nRegenerate all three examples.`
    : '';
  return `Word: "${w.headword}"${w.pos ? `  (${w.pos})` : ''}
中文释义 def_zh (FIXED - do not change, and every example must use THIS sense): ${w.def_zh}

The existing examples for this word were REJECTED by an audit for these reasons:
${problems.map(p => `- ${p}`).join('\n')}

Rewrite def_en and all 3 examples, fixing those problems.

HARD requirements:
1. def_en: English definition, AT MOST 15 words. NEVER contain "${w.headword}" or a form of it.
2. examples: EXACTLY 3, each anchoring ONE high-frequency collocation, ordered most->least frequent.
   - ⚠️ All three sentences MUST use the sense given in def_zh above ("${w.def_zh}").
     Do NOT drift to another sense of the word.
   - The 3 collocations must differ; each MUST contain "${w.headword}" or a form of it
     (a synonym is not a collocation).
   - scene: one of ${SCENES.join(', ')}; all three DIFFERENT.
   - sentence: 8 to 16 words. The three sentences must each START WITH A DIFFERENT WORD.
   - translation_zh: 忠实翻译, 不许增译或漏译, 标点全部全角(句末"。", 停顿"，")。
   - Never use an em-dash or en-dash anywhere.${retry}`;
}

async function callModel(w, problems, notes) {
  requireKeys(ENV, ['OPENAI_API_KEY']);
  for (let b = 0; b < 5; b++) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ENV.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: MODEL, temperature: 0.7,
        messages: [
          { role: 'system', content: 'You write vocabulary study cards. Return ONLY JSON.' },
          { role: 'user', content: buildPrompt(w, problems, notes) },
        ],
        response_format: { type: 'json_schema', json_schema: { name: 'card', strict: true, schema: SCHEMA } },
      }),
    });
    if (res.status === 429 || res.status >= 500) { await new Promise(r => setTimeout(r, 2000 * 2 ** b)); continue; }
    if (!res.ok) throw new Error(`OpenAI HTTP ${res.status}`);
    return JSON.parse((await res.json()).choices[0].message.content);
  }
  throw new Error('连续限流');
}

async function main() {
  const reportPath = path.join(DATA, 'verify-report.json');
  if (!existsSync(reportPath)) throw new Error('先跑 verify-content.mjs 出报告');
  const report = JSON.parse(readFileSync(reportPath, 'utf8'));

  const p = path.join(GEN, `${BANK}-content.json`);
  const data = JSON.parse(readFileSync(p, 'utf8'));
  const table = JSON.parse(readFileSync(path.join(DATA, `${BANK}-inflections.json`), 'utf8'));

  // 按词归拢问题描述
  const byWord = new Map();
  const push = (h, s) => { if (!byWord.has(h)) byWord.set(h, []); byWord.get(h).push(s); };
  for (const h of report.g10) push(h.headword, `例${h.index}「${h.sentence}」义项跑偏:${h.problem}`);
  for (const h of report.g11) push(h.headword, `例${h.index} 译文不忠实:${h.problem}(原文「${h.sentence}」译文「${h.translation_zh}」)`);

  const targets = [...byWord.keys()].filter(h => data[h]);
  process.stdout.write(`· 待定点重修 ${targets.length} 词(g10 ${report.g10.length} 条 + g11 ${report.g11.length} 条)\n`);
  if (DRY) { targets.forEach(h => process.stdout.write(`  ${h}: ${byWord.get(h).join(' | ')}\n`)); return; }

  // 全局语料(排除被修词自身的旧句,否则新句会跟自己的旧句撞 g4)
  const corpusOf = (skip) => Object.values(data)
    .filter(w => w.headword !== skip)
    .flatMap(w => w.examples.map(e => ngrams(e.sentence)));

  const queue = [...targets];
  let ok = 0, ko = 0;
  const failed = [];
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
    while (queue.length) {
      const h = queue.shift();
      const w = data[h];
      let notes = null, saved = false;
      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        let r;
        try { r = await callModel(w, byWord.get(h), notes); }
        catch (e) { notes = [`API 错误:${e.message}`]; continue; }
        // 机器闸门:句长走存量口径(不传 useTierLength)
        const fails = runAllGates(w, { ...r, def_zh: w.def_zh }, corpusOf(h), table);
        if (!fails.length) {
          w.examples = r.examples;      // 只改例句
          w.def_en = r.def_en;          // 和 def_en(可能原本循环定义)
          w._repaired = 'g10/g11';
          ok++; saved = true;
          process.stdout.write(`  ✓ ${h}(第${attempt}次)\n`);
          break;
        }
        notes = fails;
        process.stdout.write(`  ↻ ${h} 第${attempt}次被闸门拦下:${fails[0]}\n`);
      }
      if (!saved) { ko++; failed.push(h); process.stdout.write(`  ✗✗ ${h} 三次未过闸,保留原例句\n`); }
      writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
    }
  }));

  writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
  process.stdout.write(`\n· 重修完成:成功 ${ok} · 失败 ${ko}${failed.length ? '(' + failed.join(', ') + ')' : ''}\n`);
  process.stdout.write(`· 下一步:重跑 verify-content.mjs 确认 g10/g11 命中归零\n`);
}

main().catch(e => { process.stderr.write(`✗ ${e.stack || e.message}\n`); process.exit(1); });
