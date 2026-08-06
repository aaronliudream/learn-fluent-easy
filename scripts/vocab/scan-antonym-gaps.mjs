/**
 * 反义词漏配的**同型排查** —— 只查不改、只报不跑(Aaron 指定)。
 *
 * 由来:Aaron 审 B 段送审件时,在"判空"栏抓到两处漏网 ——
 *   microscopic → macroscopic、synthesize → analyze。
 * 漏配方向是安全的(宁缺勿错),但同型漏网可能还有,先查清量级。
 *
 * ⚠️ 这个脚本只能查**形态成对**的那一类:
 *      micro/macro、under/over、sub/super、pre/post、hyper/hypo、
 *      以及 un-/in-/im-/dis-/non- 否定前缀。
 *    microscopic → macroscopic 属于这一类,能查到。
 *
 * ⚠️ **synthesize → analyze 这一类查不到** —— 它不是形态对立,是**语义对立**,
 *    两个词长得毫无关系。要覆盖那一类只能再跑一遍模型语义判定,
 *    那是另一笔账,不在本脚本范围内。这一点必须说清楚,
 *    否则"排查完了"会被理解成"这类漏网都清干净了"。
 *
 *   node scripts/vocab/scan-antonym-gaps.mjs
 */
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(HERE, 'data');
const arg = (k, d) => process.argv.find(a => a.startsWith(`--${k}=`))?.split('=').slice(1).join('=') ?? d;
const BANK = arg('bank', 'toefl');

const pool = Object.values(JSON.parse(readFileSync(path.join(DATA, 'generated', `${BANK}-content.json`), 'utf8')));
const cache = JSON.parse(readFileSync(path.join(DATA, 'generated', `${BANK}-antonyms.json`), 'utf8'));
const idxPath = path.join(DATA, 'ecdict-index.json');
const ecdict = existsSync(idxPath) ? JSON.parse(readFileSync(idxPath, 'utf8')) : null;
if (!ecdict) { process.stderr.write('需要 ECDICT 索引:node scripts/vocab/gen-antonyms.mjs --build-index\n'); process.exit(1); }

const inPool = new Set(pool.map(w => w.headword.toLowerCase()));
/** 判空的词(模型说没有反义词),外加压根没生成出来的 */
const empties = pool.filter(w => !(cache[w.headword]?.length));

/** 前缀互换对。左右都试。 */
const SWAPS = [
  ['micro', 'macro'], ['under', 'over'], ['sub', 'super'], ['pre', 'post'],
  ['hyper', 'hypo'], ['intra', 'inter'], ['endo', 'exo'], ['mini', 'maxi'],
  ['in', 'ex'], ['im', 'ex'], ['up', 'down'], ['fore', 'hind'],
];
/** 否定前缀 —— 加上去或去掉都算候选 */
const NEG = ['un', 'in', 'im', 'il', 'ir', 'dis', 'non', 'anti', 'de'];

function candidatesFor(hw) {
  const w = hw.toLowerCase();
  const out = new Set();
  for (const [a, b] of SWAPS) {
    if (w.startsWith(a) && w.length > a.length + 3) out.add(b + w.slice(a.length));
    if (w.startsWith(b) && w.length > b.length + 3) out.add(a + w.slice(b.length));
  }
  for (const n of NEG) {
    if (w.startsWith(n) && w.length > n.length + 3) out.add(w.slice(n.length));   // 去否定前缀
    else out.add(n + w);                                                          // 加否定前缀
  }
  out.delete(w);
  return [...out];
}

const hits = [];
for (const w of empties) {
  for (const c of candidatesFor(w.headword)) {
    if (!(c in ecdict)) continue;                 // 必须是真词
    hits.push({ headword: w.headword, def_zh: w.def_zh, candidate: c, inPool: inPool.has(c) });
    break;                                        // 一个词只报最先命中的一个候选
  }
}

const inPoolHits = hits.filter(h => h.inPool);
process.stdout.write(`
════ 反义词漏配 · 形态同型排查(只查不改)════
判空的词                 ${empties.length}
形态上找得到对立词的      ${hits.length}
  其中对立词也在本词库    ${inPoolHits.length}  ← 这批最像真漏配

⚠️ 只覆盖"形态成对"这一类。synthesize → analyze 那种**语义对立**查不到,
   两个词长得毫无关系;要覆盖得再跑一遍模型语义判定,不在本脚本范围。
`);

process.stdout.write('\n对立词也在本词库的(全部列出,最多 40):\n');
inPoolHits.slice(0, 40).forEach(h => process.stdout.write(`  ${h.headword.padEnd(18)} 「${h.def_zh}」  候选反义词: ${h.candidate}\n`));

process.stdout.write('\n对立词只在 ECDICT、不在本词库的(抽 15,优先级低):\n');
hits.filter(h => !h.inPool).slice(0, 15).forEach(h => process.stdout.write(`  ${h.headword.padEnd(18)} 「${h.def_zh}」  候选: ${h.candidate}\n`));
