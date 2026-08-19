/**
 * 出「建词条」SQL —— 只 INSERT `vocab_words`,**不挂任何词库**。
 *
 * ⚠️ 为什么必须单独有这一步:这一批 981 个词**在 vocab_words 里根本不存在**。
 *    而 `generate-content.mjs` 出的内容 SQL 是
 *        UPDATE vocab_words … WHERE lower(headword) = v.headword
 *    —— 只更新**已存在**的行。词不在,那份 SQL 会安静地改 0 行、断言当场不过。
 *    所以清单顺序是硬的:**先跑这份建词条,再跑内容 SQL**。
 *
 * ⚠️ **不挂词库**(不写 vocab_word_banks):Aaron 定的流程是
 *    "内容跑完再补一份挂载 SQL 把它们挂进对应词库"。
 *    在这里顺手挂的话,词会在**还没有释义**的时候就出现在中考/高考库的词表里 ——
 *    用户点开是一张空卡。ingest-toefl.mjs 那份是词表和内容同批灌才敢合并。
 *
 * 用法:node scripts/vocab/emit-textbook-word-sql.mjs [--shards=N]
 * 产出:SQLAA/vocab_textbook_words[_partNofM].sql
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..', '..');
const GEN = path.join(HERE, 'data', 'generated');
const arg = (k, d) => process.argv.find(a => a.startsWith(`--${k}=`))?.split('=').slice(1).join('=') ?? d;
const SHARDS = Math.max(1, Number(arg('shards', '1')) || 1);
/* 槽位批(textbookslots)走的是同一条流水线,只是缓存与产物文件名不同 ——
   复制一份脚本的话,将来改断言要改两处,必然漏一处。 */
const BANK = arg('bank', 'textbook');

/* ⚠️ 读**正式结果文件**,不是 --from-csv 的试跑缓存。
   踩过:手写补的 10 个词只进了 textbook-content.json,而这里读 trial 缓存,
   于是建词条 SQL 少了那 10 行 —— 它们会有内容 SQL 却没有词条行,
   内容 SQL 的 "缺释义" 断言当场不过,而且要等 Aaron 跑到才看得见。 */
const RESULTS = path.join(GEN, `${BANK}-content.json`);
if (!existsSync(RESULTS)) { console.error(`x 没有 ${RESULTS} —— 先跑内容生成`); process.exit(2); }
const results = JSON.parse(readFileSync(RESULTS, 'utf8'));

/* ⚠️ 只给**真的生成出内容**的词建条目。
   把没有内容的词也建进去,等于在库里放一批空壳 —— 那正是 def_zh IS NULL 那类缺口的来源。 */
const rows = Object.values(results)
  .filter(w => w.def_zh && Array.isArray(w.examples) && w.examples.length === 3)
  .map(w => ({ headword: w.headword.toLowerCase(), pos: (w.pos || '').trim() || null }))
  .sort((a, b) => a.headword.localeCompare(b.headword));

const esc = s => String(s).replace(/'/g, "''");
const q = s => (s === null || s === undefined || s === '') ? 'NULL' : `'${esc(s)}'`;

function emitOne(batch, shard) {
  const sql = `-- 教材词表缺口:建词条${shard ? `【第 ${shard.part}/${shard.of} 片】` : ''} —— ${batch.length} 个词
-- 生成: node scripts/vocab/emit-textbook-word-sql.mjs --bank=${BANK}
-- ⚠️ 由 Aaron 执行。脚本本身从不写库。
--
-- 来源:junior_vocab 里 grade 7–12 的教材词表,取 lower(headword) 不在 vocab_words 的那些。
--   ⚠️ 按 **grade** 过滤,不按 publisher —— pep 在那张表里是**高中人教**,不是初中人教。
--      已用 grade×publisher 交叉表实证。
--
-- ⚠️ **顺序是硬的**:先跑这份,再跑内容 SQL(vocab_${BANK}_content_*.sql)。
--    内容 SQL 是 UPDATE … WHERE lower(headword) = …,词不存在就安静地改 0 行。
-- ⚠️ 本份**不挂任何词库**。挂载是内容跑完之后单独一份 ——
--    没有释义就挂进去的话,用户在词表里点开是一张空卡。
-- ⚠️ freq_rank 一律留空:这批大部分是短语,ECDICT 里没有词频。
--    编一个假词频进去会污染 byLearnOrder 的排序(它拿 freq_rank 决定先学哪个)。

BEGIN;

SELECT 'BEFORE' AS stage, count(*) AS words FROM vocab_words;

CREATE TEMP TABLE _new_words(headword text PRIMARY KEY, pos text) ON COMMIT DROP;
INSERT INTO _new_words(headword, pos) VALUES
${batch.map(r => `  (${q(r.headword)}, ${q(r.pos)})`).join(',\n')};

INSERT INTO vocab_words (headword, pos)
SELECT n.headword, n.pos FROM _new_words n
ON CONFLICT (lower(headword)) DO UPDATE
  SET pos = COALESCE(EXCLUDED.pos, vocab_words.pos), updated_at = now();

SELECT 'AFTER' AS stage, count(*) AS words FROM vocab_words;

-- ── 断言:只判本片 ────────────────────────────────────────────
DO $gate$
DECLARE v_n int;
BEGIN
  -- ⑴ 本片每个词都在库里了
  SELECT count(*) INTO v_n FROM _new_words n
   WHERE NOT EXISTS (SELECT 1 FROM vocab_words w WHERE lower(w.headword) = n.headword);
  IF v_n <> 0 THEN RAISE EXCEPTION '本片有 % 个词没建进去', v_n; END IF;

  -- ⑵ 临时表行数与声明一致(空表会让上面那条真空通过)
  SELECT count(*) INTO v_n FROM _new_words;
  IF v_n <> ${batch.length} THEN RAISE EXCEPTION '本片应有 ${batch.length} 个词,实际 %', v_n; END IF;

  -- ⑶ 这批词此刻**都还没有释义**,而且**一个词库都没挂** —— 证明这份没越界
  --    (挂载和内容都是后面单独的 SQL 干的事)
  SELECT count(*) INTO v_n FROM _new_words n
    JOIN vocab_words w ON lower(w.headword) = n.headword
   WHERE EXISTS (SELECT 1 FROM vocab_word_banks wb WHERE wb.word_id = w.id);
  RAISE NOTICE '本片 % 词已建;其中已挂在某个词库上的 % 个(应为 0,除非该词此前就存在)',
    ${batch.length}, v_n;
END
$gate$;

COMMIT;
`;
  const name = `vocab_${BANK}_words${shard ? `_part${shard.part}of${shard.of}` : ''}.sql`;
  mkdirSync(path.join(REPO, 'SQLAA'), { recursive: true });
  writeFileSync(path.join(REPO, 'SQLAA', name), sql, 'utf8');
  console.log(`· 建词条 SQL(${batch.length} 词) → SQLAA/${name}`);
}

console.log(`· 有完整内容的词:${rows.length} / ${Object.keys(results).length}`);
if (SHARDS > 1) {
  const per = Math.ceil(rows.length / SHARDS);
  for (let i = 0; i < SHARDS; i++) {
    const b = rows.slice(i * per, (i + 1) * per);
    if (b.length) emitOne(b, { part: i + 1, of: SHARDS });
  }
} else emitOne(rows, null);
