/**
 * 把 `data/textbook-manual.json` 里**人工撰写**的词条合并进 `generated/textbook-content.json`。
 *
 * ── 为什么不用 apply-manual-content.mjs ──────────────────────────
 * 那一支会先去库里 `fetchWord(headword)` 拿 word_id / freq_rank,拿不到就报
 * 「库里没有这个词」并跳过。而这一批 991 个词**本来就还不在库里**(Aaron 还没跑建词条 SQL),
 * 所以那条路对它们必然全部跳过。这里改成从 CSV 拿档位,不查库。
 *
 * ── 铁律:手写 ≠ 免检 ────────────────────────────────────────────
 * 合并前**照样跑 runAllGates**,一条不过就整批中止、不写盘。
 * 手写的目的是绕开"模型写不出来",不是绕开"内容标准"。
 *
 * ⚠️ g4 语料要**跨所有词库**,还要**排除这个词自己上一轮的产物** ——
 *    这支脚本是幂等重跑的,不排除的话会拿它跟自己比,报"重合 100%"。
 *
 * 用法:node scripts/vocab/apply-textbook-manual.mjs [--dry-run]
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runAllGates, ngrams } from './gates.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(HERE, 'data');
const GEN = path.join(DATA, 'generated');
const DRY = process.argv.includes('--dry-run');

const manual = JSON.parse(readFileSync(path.join(DATA, 'textbook-manual.json'), 'utf8'));
const inflect = JSON.parse(readFileSync(path.join(DATA, 'textbook-inflections.json'), 'utf8'));
const contentPath = path.join(GEN, 'textbook-content.json');
const results = existsSync(contentPath) ? JSON.parse(readFileSync(contentPath, 'utf8')) : {};

/** CSV 里的 pos —— 手写文件不重抄一遍(抄一遍就多一个会不一致的地方) */
const csvPos = new Map(readFileSync(path.join(DATA, 'textbook.csv'), 'utf8')
  .trim().split(/\r?\n/).slice(1).map(l => { const c = l.split(','); return [c[0], c[1] || null]; }));

let wrote = 0, blocked = 0;
for (const [headword, m] of Object.entries(manual)) {
  if (headword.startsWith('_')) continue;
  if (!csvPos.has(headword)) { console.error(`✗ ${headword}:不在 textbook.csv 里,不该手写它`); blocked++; continue; }

  /* g4 比对面:跨所有库,但排除本词自己 */
  const corpus = [];
  for (const f of readdirSync(GEN)) {
    if (!f.endsWith('-content.json') || f.includes('trial') || f.includes('before-')) continue;
    let j; try { j = JSON.parse(readFileSync(path.join(GEN, f), 'utf8')); } catch { continue; }
    for (const [k, rec] of Object.entries(j)) {
      if (k === headword) continue;
      for (const ex of rec.examples || []) corpus.push(ngrams(ex.sentence));
    }
  }

  const cefr = m.cefr || 'A2';
  const payload = { ipa: m.ipa, def_zh: m.def_zh, def_en: m.def_en, examples: m.examples };
  const fails = runAllGates(
    { headword, pos: csvPos.get(headword), freq_rank: null, cefr },
    payload, corpus, inflect, { useTierLength: true },
  );
  if (fails.length) {
    console.error(`✗ ${headword}(${cefr})**手写的也没过闸**,不写盘:`);
    for (const f of fails) console.error(`     ${f}`);
    blocked++; continue;
  }

  results[headword] = {
    headword, pos: csvPos.get(headword), freq_rank: null, cefr, ...payload,
    _manual: true, _why: m._why,
  };
  wrote++;
  console.log(`✓ ${headword}(${cefr})过闸并合并`);
}

if (!DRY && wrote) writeFileSync(contentPath, JSON.stringify(results, null, 2), 'utf8');
console.log(`\n合计:合并 ${wrote} 词 · 被闸门拦下 ${blocked}${DRY ? '(--dry-run 未写盘)' : ''}`);
console.log(`textbook-content.json 现有 ${Object.keys(results).length} 词`);
process.exit(blocked ? 1 : 0);
