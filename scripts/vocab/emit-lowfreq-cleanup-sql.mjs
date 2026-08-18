/**
 * 出「高频词从高阶收费库摘挂载」的清理 SQL —— **只读库 + 出文件,从不写库**。
 *
 * 口径(Aaron 2026-08-17 定):
 *   · ielts 词频 ≤500 的全部(含 best)—— 摘 vocab_word_banks 挂载
 *   · gre   词频 ≤500 的全部(want/school/mean/down 那 15 个)
 *   · **绝不动 vocab_words**。best 摘后变孤儿行,接受 ——
 *     孤儿行无害(millennia 已是此状态),而删词不可逆且零收益。
 *   · 第二刀(500–1000)与免费库不在本次范围。
 *
 * ⚠️ 一个词可能同时被两个库切(even/school/mean/group/hold/issue/guy/control
 *    既在 ielts ≤500 也在 gre ≤500),所以**行数 ≠ 词数**。
 *    孤儿判定必须在**两刀都切完之后**按词算,不能按库分开算。
 *
 * 用法:node scripts/vocab/emit-lowfreq-cleanup-sql.mjs
 * 产出:SQLAA/vocab_cleanup_lowfreq_paid_banks.sql
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv, requireKeys } from './env.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..', '..');
const CUTS = [{ bank: 'ielts', maxFreq: 500 }, { bank: 'gre', maxFreq: 500 }];

const ENV = loadEnv(REPO, { quiet: true });
requireKeys(ENV, ['VITE_SUPABASE_URL', 'VITE_SUPABASE_PUBLISHABLE_KEY']);
const H = { apikey: ENV.VITE_SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${ENV.VITE_SUPABASE_PUBLISHABLE_KEY}` };
async function paged(pathname, params) {
  const out = [];
  for (let off = 0; ; off += 1000) {
    const u = new URL(`${ENV.VITE_SUPABASE_URL}/rest/v1/${pathname}`);
    for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
    u.searchParams.set('offset', String(off)); u.searchParams.set('limit', '1000');
    const r = await fetch(u, { headers: H });
    if (!r.ok) throw new Error(`REST ${pathname} ${r.status}: ${(await r.text()).slice(0, 160)}`);
    const j = await r.json(); out.push(...j); if (j.length < 1000) return out;
  }
}

const banks = await paged('vocab_banks', { select: 'id,code,total_words' });
const words = await paged('vocab_words', { select: 'id,headword,freq_rank' });
const links = await paged('vocab_word_banks', { select: 'word_id,bank_id' });
const bankByCode = new Map(banks.map(b => [b.code, b]));
const wordById = new Map(words.map(w => [w.id, w]));
const banksOfWord = new Map();
const linkCount = {};
for (const l of links) {
  const code = banks.find(b => b.id === l.bank_id)?.code;
  if (!banksOfWord.has(l.word_id)) banksOfWord.set(l.word_id, new Set());
  banksOfWord.get(l.word_id).add(code);
  linkCount[code] = (linkCount[code] || 0) + 1;
}

/* ── 选出要摘的 (库, 词) 对 ── */
const rows = [];
for (const { bank, maxFreq } of CUTS) {
  const b = bankByCode.get(bank);
  if (!b) throw new Error(`没有 code=${bank} 这个库`);
  for (const [id, set] of banksOfWord) {
    if (!set.has(bank)) continue;
    const w = wordById.get(id);
    if (!w || (w.freq_rank ?? Infinity) > maxFreq) continue;
    rows.push({ bank, id, headword: w.headword, freq: w.freq_rank });
  }
}
rows.sort((a, b) => a.bank.localeCompare(b.bank) || a.freq - b.freq);
const perBank = {};
for (const r of rows) perBank[r.bank] = (perBank[r.bank] || 0) + 1;

/* ── 孤儿判定:两刀都切完之后,谁一个库都不剩 ── */
const cutByWord = new Map();
for (const r of rows) {
  if (!cutByWord.has(r.id)) cutByWord.set(r.id, new Set());
  cutByWord.get(r.id).add(r.bank);
}
const orphans = [];
for (const [id, cut] of cutByWord) {
  const remain = [...(banksOfWord.get(id) ?? new Set())].filter(c => !cut.has(c));
  if (!remain.length) orphans.push(wordById.get(id));
}

process.stdout.write(`· 摘挂载 ${rows.length} 行(${Object.entries(perBank).map(([k, v]) => `${k} ${v}`).join(' · ')})· 涉及 ${cutByWord.size} 个词\n`);
process.stdout.write(`· 摘完变孤儿的:${orphans.length} 个 —— ${orphans.map(w => `${w.headword}(${w.freq_rank})`).join(', ') || '无'}\n`);

const q = s => `'${String(s).replace(/'/g, "''")}'`;
const OTHER_BANKS = banks.map(b => b.code).filter(c => !CUTS.some(x => x.bank === c));

const sql = `-- 清理:把高频词从**高阶收费库**摘掉挂载
-- 生成: node scripts/vocab/emit-lowfreq-cleanup-sql.mjs
-- ⚠️ 由 Aaron 执行。脚本本身从不写库。
--
-- 病因:词库直接按 ECDICT 的分考试标签灌,而 ECDICT 把 in(频 6)、on(频 17)、
--       as(频 33)也标成了雅思词。流水线 100% 忠实地把它们灌进来了 ——
--       忠实地灌进来一个垃圾判据的输出。收费的雅思库里因此有 160 个词频 ≤500 的词,
--       是 GRE/GMAT(各 15 个)的十倍以上;托福同区间是 0,所以这不是"所有库都这样"。
--
-- 口径:ielts ≤500 全部 ${perBank.ielts} 个 + gre ≤500 全部 ${perBank.gre} 个,共 ${rows.length} 行挂载。
--       ⚠️ 行数 ≠ 词数:${rows.length} 行只涉及 ${cutByWord.size} 个词 ——
--          even/school/mean/group/hold 等同时被两个库切。
--
-- ⚠️ **只删 vocab_word_banks 的挂载行,绝不动 vocab_words。**
--    ${orphans.map(w => w.headword).join('/')} 摘完会变成孤儿行(词还在,任何库都看不到),
--    这是 Aaron 明确接受的:孤儿行无害(millennia 已是此状态),
--    而删词不可逆且零收益 —— 没有收益的不可逆操作不做。
--
-- 影响面(Aaron 已查):涉及 16 行 user_vocab_mastery / 2 个用户 / 1 行错题本 / 0 行 pre_known。
--    摘挂载不删 user_vocab_mastery(它按 word_id 存,与库无关),
--    但词库页的"已学/已掌握"是按库过滤算的,那两个用户的雅思进度数字会变小。

BEGIN;

-- 快照:后面每一条断言都拿它当基准,不写死数字
CREATE TEMP TABLE _before_links(code text PRIMARY KEY, n int) ON COMMIT DROP;
INSERT INTO _before_links
SELECT b.code, count(wb.word_id)::int FROM vocab_banks b
  LEFT JOIN vocab_word_banks wb ON wb.bank_id = b.id GROUP BY b.code;

CREATE TEMP TABLE _before_words(n int) ON COMMIT DROP;
INSERT INTO _before_words SELECT count(*)::int FROM vocab_words;

-- 本次要摘的 (库, 词) 对
CREATE TEMP TABLE _cut(bank_code text, word_id uuid, headword text, freq int) ON COMMIT DROP;
INSERT INTO _cut(bank_code, word_id, headword, freq) VALUES
${rows.map(r => `  (${q(r.bank)}, '${r.id}'::uuid, ${q(r.headword)}, ${r.freq})`).join(',\n')};

-- 本次**真正会被删掉**的那些对(即删除前确实存在的挂载)。
-- ⚠️ 断言必须拿它当基准,不能拿 _cut 的行数:
--    跑第二遍时该删的已经没了,拿 _cut 判就会报"应减少 175 行、实际减少 0"而整笔回滚。
--    判据要判**终态**,不判"这一次删了多少" —— 否则重跑一份已跑过的 SQL 会炸,
--    而重跑本该是安全的(幂等)。
CREATE TEMP TABLE _cut_present(bank_code text, word_id uuid) ON COMMIT DROP;
INSERT INTO _cut_present
SELECT c.bank_code, c.word_id FROM _cut c
  JOIN vocab_banks b ON b.code = c.bank_code
  JOIN vocab_word_banks wb ON wb.bank_id = b.id AND wb.word_id = c.word_id;

SELECT 'BEFORE' AS stage, code, n FROM _before_links ORDER BY n DESC;

-- ── 摘挂载 ───────────────────────────────────────────────────
DELETE FROM vocab_word_banks wb
 USING _cut c, vocab_banks b
 WHERE b.code = c.bank_code AND wb.bank_id = b.id AND wb.word_id = c.word_id;

-- ── 同步 total_words ─────────────────────────────────────────
-- ⚠️ 必须在同一个事务里同步。十个库现在 total_words 与实际挂载数**全部一致**,
--    只删不同步的话,会从"全对"变成"只有雅思/GRE 两个对不上" —— 那比一直不同步更难发现。
UPDATE vocab_banks b
   SET total_words = (SELECT count(*) FROM vocab_word_banks wb WHERE wb.bank_id = b.id)
 WHERE b.code IN (${CUTS.map(c => q(c.bank)).join(', ')});

SELECT 'AFTER' AS stage, b.code, b.total_words,
       (SELECT count(*) FROM vocab_word_banks wb WHERE wb.bank_id = b.id) AS actual_links
  FROM vocab_banks b ORDER BY actual_links DESC;

-- ── 断言:任何一条不成立就整笔回滚 ──────────────────────────
DO $gate$
/* ⚠️ 变量一律加 v_ 前缀。第一版叫 n / expected,与临时表 _before_links 的列 n 撞名,
     plpgsql 报 "column reference \"n\" is ambiguous" 整笔跑不起来 ——
     这种错肉眼审 SQL 看不出来,是 pglite 真跑才炸出来的。 */
DECLARE
  v_n int; v_expected int;
BEGIN
  -- ⑴ 该摘的一条不剩
  SELECT count(*) INTO v_n
    FROM _cut c JOIN vocab_banks b ON b.code = c.bank_code
    JOIN vocab_word_banks wb ON wb.bank_id = b.id AND wb.word_id = c.word_id;
  IF v_n <> 0 THEN RAISE EXCEPTION '还有 % 条该摘的挂载没摘掉', v_n; END IF;

  -- ⑵ 被摘的两个库,减少量正好等于本次行数(多删一条都不行)
${CUTS.map(c => `  SELECT (SELECT n FROM _before_links WHERE code = ${q(c.bank)})
       - (SELECT count(*)::int FROM vocab_word_banks wb JOIN vocab_banks b ON b.id = wb.bank_id WHERE b.code = ${q(c.bank)})
    INTO v_n;
  SELECT count(*)::int INTO v_expected FROM _cut_present WHERE bank_code = ${q(c.bank)};
  IF v_n <> v_expected THEN RAISE EXCEPTION '${c.bank} 应减少 % 行,实际减少 %', v_expected, v_n; END IF;`).join('\n')}

  -- ⑶ 其它八个库的挂载数**一条不少**
  SELECT count(*) INTO v_n FROM _before_links bl
    JOIN vocab_banks b ON b.code = bl.code
   WHERE bl.code NOT IN (${CUTS.map(c => q(c.bank)).join(', ')})
     AND bl.n <> (SELECT count(*)::int FROM vocab_word_banks wb WHERE wb.bank_id = b.id);
  IF v_n <> 0 THEN RAISE EXCEPTION '有 % 个不该动的库挂载数变了', v_n; END IF;

  -- ⑷ vocab_words 计数不变 —— 本次只摘挂载,一个词都不许消失
  SELECT bw.n INTO v_expected FROM _before_words bw;
  SELECT count(*)::int INTO v_n FROM vocab_words;
  IF v_n <> v_expected THEN RAISE EXCEPTION 'vocab_words 从 % 变成了 % —— 本次绝不该动它', v_expected, v_n; END IF;

  -- ⑸ total_words 与实际挂载数**逐库一致**(事务结束时十个库仍须全对)
  SELECT count(*) INTO v_n FROM vocab_banks b
   WHERE coalesce(b.total_words, -1) <> (SELECT count(*)::int FROM vocab_word_banks wb WHERE wb.bank_id = b.id);
  IF v_n <> 0 THEN RAISE EXCEPTION '有 % 个库的 total_words 与实际挂载数对不上', v_n; END IF;

  -- ⑹ 这些词在**别的库**里的挂载还在:摘完之后,只有 ${orphans.length} 个词一个库都不剩
  SELECT count(*) INTO v_n FROM (
    SELECT c.word_id FROM _cut c GROUP BY c.word_id
     HAVING NOT EXISTS (SELECT 1 FROM vocab_word_banks wb WHERE wb.word_id = c.word_id)
  ) t;
  IF v_n <> ${orphans.length} THEN
    RAISE EXCEPTION '摘完后一个库都不剩的词有 % 个,预期正好 ${orphans.length} 个(${orphans.map(w => w.headword).join('/')})', v_n;
  END IF;

  -- ⑺ 具体点名:中考/高考/基础库里那批挂载必须还在
  SELECT count(*) INTO v_n FROM _cut c
   WHERE c.headword <> ${q(orphans[0]?.headword ?? '')}
     AND NOT EXISTS (
       SELECT 1 FROM vocab_word_banks wb JOIN vocab_banks b ON b.id = wb.bank_id
        WHERE wb.word_id = c.word_id AND b.code IN ('zhongkao','gaokao','ket_pet','cet4','cet6','kaoyan','toefl','gmat'));
  IF v_n <> 0 THEN RAISE EXCEPTION '有 % 个词被摘得只剩空壳 —— 它们在初级库里的挂载不见了', v_n; END IF;

  RAISE NOTICE '清理完成:摘 % 行挂载,涉及 % 个词,孤儿 ${orphans.length} 个',
    (SELECT count(*) FROM _cut), (SELECT count(DISTINCT word_id) FROM _cut);
END
$gate$;

COMMIT;
`;

mkdirSync(path.join(REPO, 'SQLAA'), { recursive: true });
const out = path.join(REPO, 'SQLAA', 'vocab_cleanup_lowfreq_paid_banks.sql');
writeFileSync(out, sql, 'utf8');
process.stdout.write(`· SQL → SQLAA/vocab_cleanup_lowfreq_paid_banks.sql\n`);
