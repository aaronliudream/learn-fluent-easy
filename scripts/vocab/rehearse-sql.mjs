/**
 * 四份 SQL 的**完整彩排** —— 在 pglite 里真的跑一遍,证明断言会执行、也会拦。
 *
 * ⚠️ 这台机器上没有 psql / docker,而"读一遍 SQL 觉得没问题"栽过两次
 *    (空断言 NOT EXISTS 恒真、分片下的全表断言恒 f)。真跑一遍才算数。
 *
 * ⚠️ 变异测试的破坏语句必须打在**本批真有的词**上。第一版拿了 991 批的 look after,
 *    改了 0 行,两条"没拦下"其实是测试自己失效 —— 「拦下了不等于拦对了」的反面。
 *
 * ⚠️ 只证 SQL 本身;库里的真实数据分布证不了。
 *
 * 依赖:pglite 不在仓库依赖里(只有这支用)。跑之前先
 *     npm i --no-save @electric-sql/pglite
 * 用法:node scripts/vocab/rehearse-sql.mjs      末行 GATE_VERDICT
 */
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..', '..');
const R = path.join(REPO, 'SQLAA');
const read = f => readFileSync(`${R}/${f}`, 'utf8');
/* ⚠️ 破坏语句必须打在**本批真有的词**上。第一版拿了 991 批的 look after,
   改了 0 行,两条变异"没拦下"其实是测试自己失效 —— 又是「拦下了不等于拦对了」的反面。 */
const VICTIM = Object.values(JSON.parse(readFileSync(
  path.join(HERE, 'data', 'generated', 'textbookslots-content.json'), 'utf8')))[0].headword.toLowerCase();
const FILES = ['vocab_textbookslots_words.sql', 'vocab_textbookslots_content_batch1.sql',
               'vocab_textbookslots_mount.sql', 'vocab_textbookslots_audio_part1of1.sql'];

const SCHEMA = `
CREATE TABLE vocab_words(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), headword text NOT NULL, pos text,
  ipa text, def_zh text, def_en text, audio_url text, freq_rank int,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now());
CREATE UNIQUE INDEX vocab_words_lower_headword_key ON vocab_words (lower(headword));
CREATE TABLE vocab_examples(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  word_id uuid NOT NULL REFERENCES vocab_words(id) ON DELETE CASCADE,
  sort_order int NOT NULL, collocation text, sentence text, translation_zh text,
  scene text, audio_url text);
CREATE UNIQUE INDEX vocab_examples_word_id_sort_order_key ON vocab_examples(word_id, sort_order);
CREATE TABLE vocab_banks(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), code text UNIQUE NOT NULL);
CREATE TABLE vocab_word_banks(
  word_id uuid NOT NULL REFERENCES vocab_words(id) ON DELETE CASCADE,
  bank_id uuid NOT NULL REFERENCES vocab_banks(id) ON DELETE CASCADE,
  PRIMARY KEY (word_id, bank_id));
INSERT INTO vocab_banks(code) VALUES ('zhongkao'),('gaokao'),('toefl');
`;

async function fresh() { const db = new PGlite(); await db.exec(SCHEMA); return db; }

/* ── ① 正常顺序:四份全绿 ────────────────────────────────── */
{
  const db = await fresh();
  for (const f of FILES) {
    try { await db.exec(read(f)); console.log(`  ✓ ${f}`); }
    catch (e) { console.log(`  ✗ ${f} → ${e.message}`); process.exitCode = 1; }
  }
  const q = async s => (await db.query(s)).rows[0];
  console.log('  库内终态:', JSON.stringify(await q(
    `SELECT (SELECT count(*) FROM vocab_words) w,
            (SELECT count(*) FROM vocab_words WHERE def_zh IS NOT NULL) w_def,
            (SELECT count(*) FROM vocab_words WHERE audio_url IS NOT NULL) w_audio,
            (SELECT count(*) FROM vocab_examples) ex,
            (SELECT count(*) FROM vocab_examples WHERE audio_url IS NOT NULL) ex_audio,
            (SELECT count(*) FROM vocab_word_banks wb JOIN vocab_banks b ON b.id=wb.bank_id WHERE b.code='gaokao') gk,
            (SELECT count(*) FROM vocab_word_banks wb JOIN vocab_banks b ON b.id=wb.bank_id WHERE b.code='zhongkao') zk`)));
  await db.close();
}

/* ── ② 变异测试:每种搞破坏都必须被拦下 ──────────────────── */
const MUT = [
  ['跳过建词条,直接挂载 → 应炸「还没建词条」', async db => {
    await db.exec(read(FILES[1])); await db.exec(read(FILES[2]));
  }],
  ['先挂载后灌内容 → 应炸「空卡」', async db => {
    await db.exec(read(FILES[0])); await db.exec(read(FILES[2]));
  }],
  ['内容 SQL 跑完后偷删一个词的释义再跑挂载 → 应炸「空卡」', async db => {
    await db.exec(read(FILES[0])); await db.exec(read(FILES[1]));
    await db.exec(`UPDATE vocab_words SET def_zh = NULL WHERE lower(headword) = '${VICTIM.replace(/'/g, "''")}';`);
    await db.exec(read(FILES[2]));
  }],
  ['音频 SQL 前把一条例句删掉 → 应炸「例句没回填」', async db => {
    await db.exec(read(FILES[0])); await db.exec(read(FILES[1])); await db.exec(read(FILES[2]));
    await db.exec(`DELETE FROM vocab_examples e USING vocab_words w
                    WHERE e.word_id = w.id AND lower(w.headword) = '${VICTIM.replace(/'/g, "''")}' AND e.sort_order = 1;`);
    await db.exec(read(FILES[3]));
  }],
];
console.log('\n══ 变异测试(每条都必须被拦下)══');
for (const [name, run] of MUT) {
  const db = await fresh();
  let caught = null;
  try { await run(db); } catch (e) { caught = e.message.split('\n')[0]; }
  console.log(`  ${caught ? '✓ 拦下' : '✗ 没拦下'}  ${name}${caught ? `\n           → ${caught.slice(0, 110)}` : ''}`);
  if (!caught) process.exitCode = 1;
  await db.close();
}
console.log(`\nGATE_VERDICT ${process.exitCode ? 'FAIL' : 'PASS'}`);
