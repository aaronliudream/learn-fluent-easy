/**
 * def_zh 义项覆盖度对账 —— 以 ECDICT 为义项基准,找出"我们只给了 1 义、
 * 但词典里确实有 2+ 个不同义项"的词。
 *
 * 背景:压"同义堆砌"那一轮(双义占比 100% → 32%)矫枉过正,
 * 把一部分**真多义词**也压成了单义。Aaron 真机点名。
 *
 * ⚠️ 这个脚本**只统计、只出清单,不改任何内容、不调 API**。
 *    先报量级再动手 —— 上一轮就是没先看清量级就开跑,才把好数据改坏的。
 *
 * ══ 什么算"不同义项" ══
 *
 * ECDICT 的 translation 形如:
 *   "n. 同等的人, 匹敌, 贵族\nvi. 凝视, 盯着看\n[计] 对等"
 *   · 用**字面的 \n**(两个字符)分块,每块以词性缩写打头
 *   · 块内用逗号分隔的是**同一词性下的多个中文说法**
 *
 * 两个口径分开报,因为它们的可信度差很多:
 *   【强信号】跨词性 —— ECDICT 有 ≥2 个**不同词性块**,我们只给 1 义。
 *             n. 和 v. 一定是两个义项,词典必然分列,几乎不会误判。
 *   【弱信号】同词性内 —— 首个词性块里有 ≥2 个逗号分隔项,我们只给 1 义。
 *             ⚠️ 这一路**不可直接采信**:「覆盖的范围, 保险总额」是真两义,
 *                但「放弃, 抛弃」就是同义堆砌 —— 正是上一轮要清掉的东西。
 *                所以弱信号只用来估上限,真要动必须逐条过人/过模型。
 *
 * [计]/[医]/[网络] 这类领域标记块一律不计 —— 它们是专业域补充,不是常用义。
 *
 *   node scripts/vocab/audit-sense-coverage.mjs [--bank=toefl]
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..', '..');
const arg = (k, d) => process.argv.find(a => a.startsWith(`--${k}=`))?.split('=').slice(1).join('=') ?? d;
const BANK = arg('bank', 'toefl');

const SRC = path.join(tmpdir(), 'ecdict-source', 'ecdict.csv');
if (!existsSync(SRC)) {
  process.stderr.write(`找不到 ${SRC}。先跑 ingest 或手动下载 ecdict.csv。\n`);
  process.exit(1);
}

/** 极简 CSV 前缀解析(与 gen-antonyms 同一套,支持引号包裹与 "" 转义)。 */
function parseCsvPrefix(line, n) {
  const out = [];
  let i = 0;
  while (out.length < n && i <= line.length) {
    if (line[i] === '"') {
      let s = ''; i++;
      while (i < line.length) {
        if (line[i] === '"' && line[i + 1] === '"') { s += '"'; i += 2; continue; }
        if (line[i] === '"') { i++; break; }
        s += line[i++];
      }
      out.push(s); if (line[i] === ',') i++;
    } else {
      const j = line.indexOf(',', i);
      if (j === -1) { out.push(line.slice(i)); break; }
      out.push(line.slice(i, j)); i = j + 1;
    }
  }
  return out;
}

const POS_HEAD = /^(vt|vi|adj|adv|prep|conj|pron|int|num|art|aux|ad|n|v|a)\.\s*/;
const DOMAIN_TAG = /^\[[^\]]+\]/;                 // [计] [医] [网络] …

/** 把 ECDICT translation 切成词性块。返回 [{pos, glosses:[…]}]。 */
function parseSenses(translation) {
  const raw = String(translation || '');
  // ⚠️ 分隔符是**字面的两个字符 \n**,不是真换行(CSV 里原样存的转义序列)
  const blocks = raw.split(/\\n|\n/).map(s => s.trim()).filter(Boolean);
  const out = [];
  for (const b of blocks) {
    if (DOMAIN_TAG.test(b)) continue;             // 领域标记块不算常用义
    const m = b.match(POS_HEAD);
    if (!m) continue;
    const body = b.slice(m[0].length).trim();
    if (!body) continue;
    const glosses = body.split(/[,，、;；]/).map(s => s.trim()).filter(Boolean);
    if (glosses.length) out.push({ pos: m[1], glosses });
  }
  return out;
}

const content = JSON.parse(readFileSync(path.join(HERE, 'data', 'generated', `${BANK}-content.json`), 'utf8'));
const ours = Object.values(content);
const want = new Map(ours.map(w => [w.headword.toLowerCase(), w]));

process.stdout.write(`· 扫 ECDICT 取 ${want.size} 个词的 translation…\n`);
const dict = new Map();
let head = true;
for (const line of readFileSync(SRC, 'utf8').split('\n')) {
  if (head) { head = false; continue; }
  if (!line) continue;
  const comma = line.indexOf(',');
  if (comma === -1) continue;
  const w = line.slice(0, comma).trim().toLowerCase();
  if (!want.has(w) || dict.has(w)) continue;
  const cells = parseCsvPrefix(line, 4);
  dict.set(w, String(cells[3] || ''));
}

const missing = [...want.keys()].filter(k => !dict.has(k));
const rows = [];
let ourSingle = 0, ourDouble = 0;
for (const w of ours) {
  const key = w.headword.toLowerCase();
  const tr = dict.get(key);
  const senses = parseSenses(tr);
  const ourN = String(w.def_zh).split('；').filter(s => s.trim()).length;
  if (ourN === 1) ourSingle++; else ourDouble++;
  const posBlocks = senses.length;
  const firstGlosses = senses[0]?.glosses.length ?? 0;
  rows.push({
    headword: w.headword, pos: w.pos, def_zh: w.def_zh, ourN,
    posBlocks, firstGlosses,
    ecdict: senses.map(s => `${s.pos}. ${s.glosses.slice(0, 4).join('，')}`).join(' | '),
    hasDict: !!tr,
  });
}

const strong = rows.filter(r => r.hasDict && r.ourN === 1 && r.posBlocks >= 2);
const weak = rows.filter(r => r.hasDict && r.ourN === 1 && r.posBlocks < 2 && r.firstGlosses >= 2);

process.stdout.write(`
════════ def_zh 义项覆盖度对账 ════════
全库                    ${rows.length} 词
  我们给 1 义            ${ourSingle}(${(ourSingle / rows.length * 100).toFixed(1)}%)
  我们给 2 义            ${ourDouble}(${(ourDouble / rows.length * 100).toFixed(1)}%)
ECDICT 查得到            ${rows.length - missing.length}${missing.length ? `(查不到 ${missing.length},下面两档都不计这些词)` : ''}

【强信号】我们 1 义,ECDICT 有 ≥2 个不同词性块   ${strong.length} 词
【弱信号】我们 1 义,ECDICT 同词性下 ≥2 个说法   ${weak.length} 词
          ⚠️ 弱信号里混着大量同义堆砌(正是上一轮清掉的),不可直接采信

强信号 + 弱信号 = ${strong.length + weak.length} 词(这是**上限**,不是待修数)
`);

process.stdout.write('\n强信号抽样(前 20):\n');
strong.slice(0, 20).forEach(r => process.stdout.write(`  ${r.headword.padEnd(16)} 我们「${r.def_zh}」  ECDICT: ${r.ecdict.slice(0, 70)}\n`));
process.stdout.write('\n弱信号抽样(前 12,看看有多少是同义堆砌):\n');
weak.slice(0, 12).forEach(r => process.stdout.write(`  ${r.headword.padEnd(16)} 我们「${r.def_zh}」  ECDICT: ${r.ecdict.slice(0, 70)}\n`));

writeFileSync(path.join(HERE, 'data', `${BANK}-sense-gap.json`),
  JSON.stringify({ strong, weak, missing }, null, 2), 'utf8');
process.stdout.write(`\n→ 清单落 scripts/vocab/data/${BANK}-sense-gap.json(strong ${strong.length} / weak ${weak.length})\n`);
