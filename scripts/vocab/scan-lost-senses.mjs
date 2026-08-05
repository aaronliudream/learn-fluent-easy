/**
 * 扫描 def_zh 里**漏掉的真义项**(重修过程中被压掉的第二义)。
 *
 * 背景:第二、三轮 `--only=double` 的目标是清同义堆砌(「目前；现在」这类),
 * 但它把**所有**双义词都重跑了一遍,模型顺手把真双义也压成单义 ——
 * 连 prompt 里白纸黑字列为"保留两个"的 context / coverage / defense 都被压了。
 *
 * ⚠️ v1 的判据是错的,留档警示:v1 把**原值**摆给模型看,问"删掉的那半是不是真义项"。
 *    而原值本来就 100% 是同义堆砌(那正是当初要重修的原因)—— 这是**锚定偏置**,
 *    结果 117 个里 115 个被判"误删",连 alliance「联盟；联合」、
 *    administrator「管理员；行政人员」这些**已裁定该降单义**的也要求补回。
 *
 * v2 改成**独立判断**:不给原值,只给词 + 英文释义 + 例句,问"现释义是否漏了一个
 * **不同领域**的常用义",并强制模型分别写出两义所属领域 —— 领域相同一律不算。
 * 再加一道机械兜底:模型说 lost=true 但两个领域写得一样,直接降为 false。
 *
 * ⚠️ 本脚本**只报告不修改**。修复走独立一轮,改前改后逐条对照过 Aaron 审。
 *
 * 用法:node scripts/vocab/scan-lost-senses.mjs --bank=toefl
 * 产出:REVIEWAA/vocab_<bank>_lost_senses.md + data/lost-senses.json
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv, requireKeys } from './env.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..', '..');
const GEN = path.join(HERE, 'data', 'generated');

const arg = (k, d) => process.argv.find(a => a.startsWith(`--${k}=`))?.split('=').slice(1).join('=') ?? d;
const BANK = arg('bank', 'toefl');
const MODEL = arg('model', 'gpt-4o-mini');
const CONCURRENCY = Number(arg('concurrency', '5'));
const ENV = loadEnv(REPO);

const SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['lost', 'verdict', 'restored_def_zh', 'domain_a', 'domain_b'],
  properties: {
    lost: { type: 'boolean' },
    verdict: { type: 'string' },
    restored_def_zh: { type: 'string' },
    // 两义各自所属领域。两个领域相同 = 同义堆砌,不算双义。
    domain_a: { type: 'string' },
    domain_b: { type: 'string' },
  },
};

async function judge(w, current) {
  requireKeys(ENV, ['OPENAI_API_KEY']);
  const ctx = (w.examples || []).map((e, i) => `  ${i + 1}. ${e.sentence}`).join('\n');
  const user = `英文词:"${w.headword}"${w.pos ? `(${w.pos})` : ''}
英文释义:${w.def_en}
例句:
${ctx}

当前的中文释义是:「${current}」

问:这个释义是否**漏掉了一个真正不同领域的常用义项**?

判定标准(严格执行):
① 两个义项必须分属**不同领域**,词典会把它们分列为两条。
   真双义:defense「防御(军事);辩护(法律)」
           coverage「保险范围(保险);报导范围(新闻)」
           context「上下文(语言);背景(事件)」
② **同义词、近义改写、同一领域的不同说法,一律不算第二义项。**
   不算的例子:alliance「联盟;联合」、administrator「管理员;行政人员」、
   awareness「意识;认识」、allegation「指控;指责」、accounting「会计;会计学」
   —— 这些都是同一领域换个说法,lost 必须为 false。
③ 大多数词只有一个常用义。拿不准就判 false。

domain_a 填现有义项的领域;lost=true 时 domain_b 填第二义的领域(必须与 domain_a 不同),
lost=false 时 domain_b 填 "无"。
restored_def_zh:lost=true 给完整两义(全角分号,每义 2-8 字);lost=false 原样填现值。
verdict 用中文一句话说明理由。`;

  for (let b = 0; b < 5; b++) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ENV.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: MODEL, temperature: 0,
        messages: [
          { role: 'system', content: '你审校英语词汇卡的中文释义。只输出 JSON。' },
          { role: 'user', content: user },
        ],
        response_format: { type: 'json_schema', json_schema: { name: 'lost_sense', strict: true, schema: SCHEMA } },
      }),
    });
    if (res.status === 429 || res.status >= 500) { await new Promise(r => setTimeout(r, 2000 * 2 ** b)); continue; }
    if (!res.ok) throw new Error(`OpenAI HTTP ${res.status}`);
    return JSON.parse((await res.json()).choices[0].message.content);
  }
  throw new Error('连续限流');
}

async function main() {
  const curPath = path.join(GEN, `${BANK}-content.json`);
  const bakPath = path.join(GEN, `${BANK}-content.before-defzh-repair.json`);
  if (!existsSync(curPath)) throw new Error('缺 content JSON');
  const cur = JSON.parse(readFileSync(curPath, 'utf8'));
  const bak = existsSync(bakPath) ? JSON.parse(readFileSync(bakPath, 'utf8')) : {};

  // 候选:当前是单义的词(不再以"原来是不是双义"为条件 —— 原值不可信)
  const cands = Object.keys(cur).filter(k => !(cur[k]?.def_zh || '').includes('；'));
  process.stdout.write(`· 候选(当前单义的词):${cands.length} / ${Object.keys(cur).length}\n`);

  const results = [];
  const queue = [...cands];
  let done = 0;
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
    while (queue.length) {
      const k = queue.shift();
      const current = cur[k].def_zh;
      try {
        const r = await judge(cur[k], current);
        const da = (r.domain_a || '').trim();
        const dbm = (r.domain_b || '').trim();
        // 机械兜底:领域相同/为空,一律不算双义 —— 不完全信模型的自报
        const sameDomain = !dbm || dbm === '无' || dbm === da;
        const lost = r.lost === true && !sameDomain;
        results.push({
          headword: cur[k].headword, original: bak[k]?.def_zh ?? null, current,
          lost, domain_a: da, domain_b: dbm, restored_def_zh: r.restored_def_zh,
          verdict: (r.lost === true && sameDomain)
            ? `模型判误删,但两义同领域(${da}),机械降为不算:${r.verdict}`
            : r.verdict,
        });
      } catch (e) {
        results.push({ headword: cur[k].headword, original: bak[k]?.def_zh ?? null, current, lost: null, verdict: `判定失败:${e.message}`, restored_def_zh: current });
      }
      done++;
      if (done % 30 === 0) process.stdout.write(`  … ${done}/${cands.length}\n`);
    }
  }));

  results.sort((a, b) => a.headword.localeCompare(b.headword));
  const lost = results.filter(r => r.lost === true);
  const ok = results.filter(r => r.lost === false);
  const failed = results.filter(r => r.lost === null);

  mkdirSync(path.join(HERE, 'data'), { recursive: true });
  writeFileSync(path.join(HERE, 'data', 'lost-senses.json'), JSON.stringify({ scanned: cands.length, lost, ok, failed }, null, 2), 'utf8');

  const md = `# def_zh 漏义项扫描 · 全量清单

> **只报告,未修改任何内容。** 修复走独立一轮,改前改后逐条对照过审后才入库。

## 判据(v2,v1 作废)

v1 把**重修前的原值**摆给模型看,问"删掉的那半是不是真义项" —— 而原值本来就 100% 是同义堆砌
(那正是当初要重修的原因)。这是**锚定偏置**:117 个里 115 个被判"误删",
连 \`alliance\`「联盟；联合」、\`administrator\`「管理员；行政人员」这些**已裁定该降单义**的也要求补回。**v1 结论作废。**

v2 改成**独立判断**:不给原值,只给词 + 英文释义 + 例句,问"现释义是否漏了一个**不同领域**的常用义",
并强制模型分别写出两义所属**领域**。再加一道机械兜底:模型说 lost=true 但两个领域写得一样,直接降为 false。

## 结果

| | 数量 |
| --- | ---: |
| 扫描(当前单义的词) | ${results.length} |
| **判定漏义(建议补回)** | **${lost.length}** |
| 判定单义正确 | ${ok.length} |
| 判定失败 | ${failed.length} |

## 漏义清单(${lost.length} 个)—— 这是修复面

| 词 | 现值 | 建议补回 | 领域 A | 领域 B | 理由 |
| --- | --- | --- | --- | --- | --- |
${lost.map(r => `| ${r.headword} | ${r.current} | **${r.restored_def_zh}** | ${r.domain_a} | ${r.domain_b} | ${r.verdict} |`).join('\n') || '| — | | | | | (无) |'}

## 判定单义正确的(抽样 30 条,供反向复核)

| 词 | 现值 | 理由 |
| --- | --- | --- |
${ok.slice(0, 30).map(r => `| ${r.headword} | ${r.current} | ${r.verdict} |`).join('\n')}

> 完整结果见 \`scripts/vocab/data/lost-senses.json\`。
${failed.length ? `\n## 判定失败(${failed.length})\n\n${failed.map(r => `- ${r.headword}:${r.verdict}`).join('\n')}` : ''}
`;
  const out = path.join(REPO, 'REVIEWAA', `vocab_${BANK}_lost_senses.md`);
  mkdirSync(path.dirname(out), { recursive: true });
  writeFileSync(out, md, 'utf8');
  process.stdout.write(`\n· 漏义 ${lost.length} · 单义正确 ${ok.length} · 失败 ${failed.length}\n· 报告 → REVIEWAA/vocab_${BANK}_lost_senses.md\n`);
}

main().catch(e => { process.stderr.write(`✗ ${e.stack || e.message}\n`); process.exit(1); });
