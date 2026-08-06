/**
 * 义项对账的「同义堆砌」复筛 —— Aaron 指定:nutrient 型打回改单义。
 *
 * 背景:227 条补出的第二义里,有一类过了机器闸门但仍是同义堆砌 ——
 *   nutrient  营养物质；滋养成分     两个词说的是同一件事
 * s2 的"几乎等同"闸只拦得住互为子串那一档(且要求 70% 长度比),
 * 「营养物质」和「滋养成分」不互为子串,机器看不出来。
 *
 * ⚠️ 方向是**只做否决**:判定堆砌 → 退回基线(单义),
 *    也就是回到本轮修改之前的状态。这是安全方向 ——
 *    误判会让一个词少一个义(退回原状),而漏判会让堆砌留在库里。
 *    所以 prompt 里明确"拿不准就判堆砌"。
 *
 * ⚠️ 不改任何第一义,不重生成例句 —— 与本轮既定口径一致。
 *
 *   node scripts/vocab/reject-synonym-pairs.mjs [--dry-run]
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SPEC } from './spec.mjs';
import { DATA, GEN, arg, flag, callJson, pool, loadCache, saveCache, writeReview } from './llm.mjs';

const BANK = arg('bank', 'toefl');
const MODEL = arg('model', 'gpt-4o');
const CONCURRENCY = Number(arg('concurrency', '6'));
const DRY = flag('dry-run');
const CACHE_FILE = `${BANK}-sense-fix.json`;
const JUDGE_FILE = `${BANK}-synonym-judge.json`;
const BASELINE = path.join(DATA, `${BANK}-sense-fix-baseline.json`);

const SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['is_padding', 'why'],
  properties: {
    is_padding: { type: 'boolean', description: '两个义项说的是同一件事(同义堆砌)时为 true' },
    why: { type: 'string', description: '一句话理由,≤25 字' },
  },
};

const SYSTEM = 'You are a Chinese lexicographer. Answer only with the required JSON. When in doubt, answer is_padding = true.';

const prompt = (hw, a, b) => `英文词:${hw}
它的中文释义被写成了两个义项:
  义项一:${a}
  义项二:${b}

判断:这两个义项是**同一个义的两种说法**(同义堆砌),还是**词典会分列的两个不同义**?

判 true(同义堆砌)的样子:
  nutrient   营养物质 / 滋养成分     —— 同一件事换个说法
  currently  目前 / 现在
  alliance   联盟 / 联合
  fraud      欺诈 / 诈骗
判 false(真两义)的样子:
  context    上下文 / 背景           —— 语言环境 vs 事件背景,词典分列
  founder    创始人 / 沉没           —— 名词义 vs 动词义,毫无关系
  chronic    慢性的 / 慢性病患者      —— 形容词 vs 名词,是两个词条
  coverage   保险范围 / 报导范围      —— 两个领域

自检:**把两个义项分别翻回英文,如果落到同一个英文解释上,就是堆砌。**
⚠️ 拿不准就判 true —— 判错的代价只是这个词少一个义(退回原状),
   而漏判会把堆砌留在库里,那是上一轮花了很大力气才清掉的东西。`;

async function main() {
  const cache = loadCache(CACHE_FILE);
  const baseline = existsSync(BASELINE) ? JSON.parse(readFileSync(BASELINE, 'utf8')) : {};
  const judge = loadCache(JUDGE_FILE);

  const changed = Object.entries(cache).filter(([, v]) => !v.skip && v.def_zh);
  const pending = changed.filter(([hw]) => !(hw in judge));
  process.stdout.write(`· 补出第二义的 ${changed.length} 条,待判 ${pending.length}\n`);

  let n = 0;
  await pool(pending, CONCURRENCY, async ([hw, v]) => {
    const parts = String(v.def_zh).split(SPEC.defZh.sep).map(s => s.trim());
    if (parts.length < 2) return;
    const r = await callJson({
      system: SYSTEM, user: prompt(hw, parts[0], parts[1]),
      schemaName: 'synonym_judge', schema: SCHEMA, model: MODEL, temperature: 0,
    }).catch(() => ({ is_padding: true, why: '判定调用失败,按安全方向退回单义' }));
    judge[hw] = r;
    n++;
    if (n % 50 === 0) { saveCache(JUDGE_FILE, judge); process.stdout.write(`  … ${n}/${pending.length}\n`); }
  });
  saveCache(JUDGE_FILE, judge);

  const padded = changed.filter(([hw]) => judge[hw]?.is_padding);
  process.stdout.write(`\n判定同义堆砌:${padded.length} / ${changed.length}(${(padded.length / changed.length * 100).toFixed(1)}%)\n`);
  padded.slice(0, 25).forEach(([hw, v]) => process.stdout.write(`  ✗ ${hw}: ${v.def_zh}   [${judge[hw].why}]\n`));

  if (DRY) return;

  // 打回:退回基线(单义)。⚠️ 不是删掉缓存 —— 删掉下次会重新生成同样的堆砌。
  //     标 skip 表示"这个词判定为没有值得补的第二义",与模型自己判 skip 同一含义。
  for (const [hw] of padded) {
    cache[hw] = { skip: true, def_zh: '', reason: `复筛判定同义堆砌,退回单义:${judge[hw].why}` };
  }
  saveCache(CACHE_FILE, cache);

  writeReview(`vocab_${BANK}_synonym_reject.md`, `# 义项对账 · 同义堆砌复筛(打回清单)

Aaron 指定 nutrient 型打回改单义。对 **${changed.length} 条补出的第二义**逐条复筛,
判定 **${padded.length} 条是同义堆砌**,已退回基线(单义,即本轮修改前的状态)。

## 为什么要单独一轮

s2 那道"几乎等同"闸只拦得住**互为子串**那一档 ——
「营养物质」和「滋养成分」不互为子串,机器看不出来。这是语义判断,只能再问一次模型。

**方向是只做否决**:判定堆砌就退回原状。误判的代价是这个词少一个义(回到本轮之前),
漏判的代价是堆砌留在库里 —— 所以 prompt 明写"拿不准就判堆砌"。

## 打回的 ${padded.length} 条

| 词 | 被打回的写法 | 理由 |
| --- | --- | --- |
${padded.map(([hw, v]) => `| ${hw} | ${v.def_zh} | ${judge[hw].why} |`).join('\n')}

## 留下的 ${changed.length - padded.length} 条

判定为词典会分列的真两义,详见 \`vocab_${BANK}_sense_fix_sample.md\`。
`);
  process.stdout.write(`\n已打回 ${padded.length} 条 → 现存改动 ${changed.length - padded.length} 条\n`);
  process.stdout.write('⚠️ 记得重跑 gen-sense-fix.mjs --emit-only 重出 SQL 与送审件\n');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(e => { process.stderr.write(`\n${e.stack || e.message}\n`); process.exit(1); });
}
