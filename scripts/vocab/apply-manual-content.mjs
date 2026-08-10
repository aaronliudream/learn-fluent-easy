/**
 * 把 `data/content-manual.json` 里**人工撰写**的词条合并进 `<bank>-content.json`。
 *
 * ── 为什么需要这个通道 ─────────────────────────────────────────────
 * 2026-08-10 重跑收尾时剩 3 个词,模型连续三轮都爬不出同一个陷阱:
 *   · mustard —— 芥末的常识定义几乎必然想写 "made from ground mustard seeds",
 *     每次都撞 g12 循环定义;
 *   · morality —— 搭配每次都写成 moral values / moral standards,
 *     用同根派生词冒充搭配,撞 g7 + g13。
 * 继续烧 API 不会有新结果(已经带着定向提示打过三轮),所以手写这两条。
 *
 * ── 铁律:手写 ≠ 免检 ─────────────────────────────────────────────
 * 合并前**照样跑 runAllGates**,一条不过就整个中止、不写盘。
 * 手写的目的是绕开"模型写不出来",不是绕开"内容标准"。
 * 合并进去的词会带 `_manual: true`,送审件里单独标出来给 Aaron 重点看。
 *
 * ⚠️ 只写本地 JSON,不碰数据库、不出 SQL。SQL 仍由 generate-content.mjs 统一出。
 *
 * 用法:node scripts/vocab/apply-manual-content.mjs [--dry-run]
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runAllGates, ngrams } from './gates.mjs';
import { loadEnv } from './env.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(HERE, 'data');
const GEN = path.join(DATA, 'generated');
const DRY = process.argv.includes('--dry-run');

const manual = JSON.parse(readFileSync(path.join(DATA, 'content-manual.json'), 'utf8'));
const env = loadEnv(process.cwd(), { quiet: true });
const U = env.VITE_SUPABASE_URL, K = env.VITE_SUPABASE_PUBLISHABLE_KEY;

/* freq_rank / cefr / word_id 一律**从库里取**,不在手写文件里重抄一遍 ——
   抄一遍就多一个会和库不一致的地方。 */
async function fetchWord(headword) {
  const r = await fetch(
    `${U}/rest/v1/vocab_words?select=id,headword,pos,freq_rank,def_zh&headword=eq.${encodeURIComponent(headword)}`,
    { headers: { apikey: K, Authorization: `Bearer ${K}` } });
  const rows = await r.json();
  return Array.isArray(rows) ? rows[0] : null;
}

function cefrFor(r) {
  const n = r ?? Number.MAX_SAFE_INTEGER;
  return n <= 1500 ? 'A2' : n <= 4000 ? 'B1' : n <= 10000 ? 'B2' : 'C1';
}

let wrote = 0, blocked = 0;
const byBank = {};

for (const [headword, m] of Object.entries(manual)) {
  if (headword.startsWith('_')) continue;
  const bank = m.bank;
  if (!bank) { console.error(`✗ ${headword}:没写 bank`); blocked++; continue; }

  const row = await fetchWord(headword);
  if (!row) { console.error(`✗ ${headword}:库里没有这个词`); blocked++; continue; }
  if (row.def_zh) { console.log(`⊘ ${headword}:库里**已经有释义**了,跳过(别覆盖别人写的)`); continue; }

  const contentPath = path.join(GEN, `${bank}-content.json`);
  const results = existsSync(contentPath) ? JSON.parse(readFileSync(contentPath, 'utf8')) : {};
  const inflectPath = path.join(DATA, `${bank}-inflections.json`);
  const inflect = existsSync(inflectPath) ? JSON.parse(readFileSync(inflectPath, 'utf8')) : {};

  /* g4 全局去重:拿本库已有内容当语料,和正式生成走同一条路 */
  const corpus = [];
  for (const rec of Object.values(results)) for (const ex of rec.examples || []) corpus.push(ngrams(ex.sentence));

  const cefr = cefrFor(row.freq_rank);
  const payload = { ipa: m.ipa, def_zh: m.def_zh, def_en: m.def_en, examples: m.examples };
  const fails = runAllGates({ ...row, cefr }, payload, corpus, inflect, { useTierLength: true });

  if (fails.length) {
    console.error(`✗ ${headword}(${cefr})**手写的也没过闸**,不写盘:`);
    for (const f of fails) console.error(`     ${f}`);
    blocked++; continue;
  }

  results[headword.toLowerCase()] = {
    word_id: row.id, headword: row.headword, pos: row.pos,
    freq_rank: row.freq_rank, cefr, ...payload,
    _manual: true, _why: m._why,
  };
  if (!DRY) writeFileSync(contentPath, JSON.stringify(results, null, 2), 'utf8');
  byBank[bank] = (byBank[bank] || 0) + 1;
  wrote++;
  console.log(`✓ ${headword}(${cefr}, ${bank})过闸并合并`);
}

console.log(`\n合计:合并 ${wrote} 词${Object.keys(byBank).length ? `(${Object.entries(byBank).map(([b, n]) => `${b} ${n}`).join(' · ')})` : ''} · 被闸门拦下 ${blocked}`);
if (DRY) console.log('⚠️ --dry-run:没有写盘。');
process.exit(blocked ? 1 : 0);
