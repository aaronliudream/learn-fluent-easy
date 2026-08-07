/**
 * 弱信号 1290 · 机械预筛(三道筛,全部机械可判,不用模型)。
 *
 * 弱信号的判据是「ECDICT 同词性下 ≥2 个说法」,而**同词性下的多个说法
 * 大部分本来就是同义**(currently 现在/当前/一般)。强信号的判据是跨词性,
 * 天然不同义;弱信号没有这个保护 —— 所以先机械压一遍,再交模型和人。
 *
 *   a. 字集重合筛:两说法的**字集重合度 ≥60%** 排除(目前/现在、结合/联合型)
 *   b. 互为子串筛:一方包含另一方排除
 *   c. **英文释义反查筛**(Aaron 裁决,不补外部资源):
 *      两个中文说法各自反查 ECDICT 的 definition 列 —— 若该词性块下
 *      **英文释义只有 1 条**,而中文给了 2+ 个说法,那这些说法就是
 *      同一条英文释义的不同译法,即堆砌。
 *      ⚠️ 直接对应我们定同义堆砌时的原尺子:「翻回英文落到同一解释即堆砌」。
 *      外部同义词林的"同义"标准与词典义项的"同义"不是一回事,以 ECDICT 为准更自洽。
 *
 * 预筛后从剩下的里抽 100 条试点,**刻意包含五类边界样本**(第八条规矩)。
 *
 *   node scripts/vocab/prescreen-weak-senses.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { SPEC } from './spec.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(HERE, 'data');
const BANK = 'toefl';

const gap = JSON.parse(readFileSync(path.join(DATA, `${BANK}-sense-gap.json`), 'utf8'));
const content = JSON.parse(readFileSync(path.join(DATA, 'generated', `${BANK}-content.json`), 'utf8'));
const byHw = new Map(Object.values(content).map(w => [w.headword, w]));

/** 字集重合度:两串共有汉字数 / 较短串的字数。 */
function charOverlap(a, b) {
  const A = new Set([...String(a).replace(/[^一-龥]/g, '')]);
  const B = new Set([...String(b).replace(/[^一-龥]/g, '')]);
  if (!A.size || !B.size) return 0;
  let hit = 0;
  for (const c of A) if (B.has(c)) hit++;
  return hit / Math.min(A.size, B.size);
}

/* c 筛的数据源:ECDICT definition 列(英文释义,按字面 
 分行,行首是词性)。
 * 从 66MB 原表建一次索引,只留本批 1290 词,常驻缓存。 */
const DEF_IDX = path.join(DATA, 'ecdict-definition.json');
function loadDefIndex(wanted) {
  if (existsSync(DEF_IDX)) return JSON.parse(readFileSync(DEF_IDX, 'utf8'));
  const src = path.join(tmpdir(), 'ecdict-source', 'ecdict.csv');
  if (!existsSync(src)) return null;
  const want = new Set(wanted.map(w => w.toLowerCase()));
  const idx = {};
  let head = true;
  for (const line of readFileSync(src, 'utf8').split(String.fromCharCode(10))) {
    if (head) { head = false; continue; }
    if (!line) continue;
    const comma = line.indexOf(',');
    if (comma === -1) continue;
    const w = line.slice(0, comma).trim().toLowerCase();
    if (!want.has(w) || idx[w]) continue;
    const cells = parseCsvPrefix(line, 3);
    idx[w] = String(cells[2] || '');
  }
  writeFileSync(DEF_IDX, JSON.stringify(idx), 'utf8');
  return idx;
}
function parseCsvPrefix(line, n) {
  const out = []; let i = 0;
  while (out.length < n && i <= line.length) {
    if (line[i] === '"') {
      let s2 = ''; i++;
      while (i < line.length) {
        if (line[i] === '"' && line[i + 1] === '"') { s2 += '"'; i += 2; continue; }
        if (line[i] === '"') { i++; break; }
        s2 += line[i++];
      }
      out.push(s2); if (line[i] === ',') i++;
    } else {
      const j = line.indexOf(',', i);
      if (j === -1) { out.push(line.slice(i)); break; }
      out.push(line.slice(i, j)); i = j + 1;
    }
  }
  return out;
}
/** 该词在某词性下有几条**不同的英文释义**。1 条 = 中文的多个说法都是它的译法。 */
function englishSenseCount(defText, pos) {
  const p = String(pos || '').replace(/\.$/, '').toLowerCase();
  // ⚠️ ECDICT 的换行是**字面两字符 \n**,真换行也一起切
  const lines = String(defText).split(/\\n|\n/).map(x => x.trim()).filter(Boolean);
  const hit = lines.filter(l => {
    const m = l.match(/^([a-z]+)\.\s*/);
    if (!m) return !p;
    const tag = m[1] === 'v' || m[1] === 'vt' || m[1] === 'vi' ? 'v'
      : m[1] === 'a' || m[1] === 'adj' ? 'adj' : m[1] === 'ad' || m[1] === 'adv' ? 'adv' : m[1];
    return !p || tag === p;
  });
  return (hit.length ? hit : lines).length;
}
const defIndex = loadDefIndex(gap.weak.map(r => r.headword));

const rows = [];
let dropA = 0, dropB = 0, dropC = 0;
for (const r of gap.weak) {
  const w = byHw.get(r.headword);
  if (!w) continue;
  /* ECDICT 首个词性块里的说法(弱信号就是它们之间的差异)。 */
  const glosses = String(r.ecdict).split(' | ')[0].replace(/^[a-z]+\.\s*/, '')
    .split(/[，,、]/).map(s => s.trim()).filter(Boolean);
  if (glosses.length < 2) continue;

  const ours = String(w.def_zh).split(SPEC.defZh.sep)[0].trim();
  /* 候选第二义 = ECDICT 里与我们现值最不同的那一个 */
  const cand = glosses
    .filter(g => g !== ours)
    .sort((x, y) => charOverlap(ours, x) - charOverlap(ours, y))[0];
  if (!cand) continue;

  const ov = charOverlap(ours, cand);
  if (ov >= 0.6) { dropA++; continue; }                                  // a 字集重合
  const core = s => String(s).replace(/[的地得者性]+$/u, '');
  if (core(ours).includes(core(cand)) || core(cand).includes(core(ours))) { dropB++; continue; }  // b 互为子串
  /* c 英文释义反查:该词性下英文释义只有 1 条 → 中文的多个说法是同一义的译法。 */
  if (defIndex) {
    const firstPos = String(r.ecdict).split(' | ')[0].match(/^([a-z]+)\./)?.[1] ?? '';
    const n = englishSenseCount(defIndex[w.headword.toLowerCase()] ?? '', firstPos);
    if (n <= 1) { dropC++; continue; }
  }

  rows.push({ headword: w.headword, pos: w.pos, ours, cand, overlap: Number(ov.toFixed(2)), ecdict: r.ecdict });
}

/* ── 试点抽样:刻意包含五类边界样本 ── */
const pick = new Map();
const take = (label, filter, n) => {
  let c = 0;
  for (const r of rows) {
    if (pick.has(r.headword) || !filter(r)) continue;
    pick.set(r.headword, { ...r, boundary: label }); c++;
    if (c >= n) break;
  }
  return c;
};
const b1 = take('单字义项(A 类不动,验不误改)', r => [...r.ours].length === 1, 8);
const b2 = take('现值 8 字顶格', r => [...r.ours].length >= SPEC.defZh.maxChars, 8);
const b4 = take('候选与现值零重合(最可能是真两义)', r => r.overlap === 0, 8);
const b5 = take('候选重合 0.4-0.59(擦边,最容易误判)', r => r.overlap >= 0.4, 8);
const rest = take('随机补足', () => true, 100 - pick.size);

const sample = [...pick.values()];
writeFileSync(path.join(DATA, `${BANK}-weak-prescreened.json`),
  JSON.stringify({ kept: rows, sample }, null, 2), 'utf8');

process.stdout.write(`
════ 弱信号预筛 ════
原始弱信号            ${gap.weak.length}
  a 字集重合 ≥60% 排除  ${dropA}
  b 互为子串排除        ${dropB}
  c 英文释义反查排除    ${defIndex ? dropC : '⚠️ 跳过 —— 没有 ecdict.csv'}
预筛后剩余            ${rows.length}

试点抽样 ${sample.length} 条,边界覆盖:
  单字义项            ${b1}
  8 字顶格            ${b2}
  零重合              ${b4}
  擦边 0.4-0.59       ${b5}
  随机补足            ${rest}

→ data/${BANK}-weak-prescreened.json
`);
