/**
 * 出「挂词库」SQL —— 把教材缺口批挂进 zhongkao / gaokao。
 *
 * ⚠️ 挂载规则不是猜的,是**拿库里已挂好的 991 批反解出来的**:
 *      全部 991 挂 gaokao;其中 663 挂 zhongkao。
 *      而这 991 里 junior_vocab 最低年级 ≤9 的正好 663 个 —— 数对上了才敢照做。
 *      规则 = 「≤9 进中考 + 全部进高考」。
 *
 * ⚠️ 必须在**内容 SQL 之后**跑。先挂后灌的话,词会在还没有释义时出现在词表里,
 *    用户点开是一张空卡 —— 这正是 emit-textbook-word-sql 里不顺手挂载的原因。
 *
 * ⚠️ 斜杠变体(be ready ← be/get ready)在 junior_vocab 里查不到,
 *    要按**原始条目**取年级,不然全落到默认档、错挂成高中。
 *
 * 用法:node scripts/vocab/emit-textbook-mount-sql.mjs --bank=textbookslots
 * 产出:SQLAA/vocab_<bank>_mount.sql
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv, requireKeys } from './env.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..', '..');
const GEN = path.join(HERE, 'data', 'generated');
const arg = (k, d) => process.argv.find(a => a.startsWith(`--${k}=`))?.split('=').slice(1).join('=') ?? d;
const BANK = arg('bank', 'textbook');

const RESULTS = path.join(GEN, `${BANK}-content.json`);
if (!existsSync(RESULTS)) { console.error(`x 没有 ${RESULTS}`); process.exit(2); }
const words = Object.values(JSON.parse(readFileSync(RESULTS, 'utf8')))
  .filter(w => w.def_zh && Array.isArray(w.examples) && w.examples.length === 3)
  .map(w => String(w.headword).toLowerCase());

const ENV = loadEnv(REPO, { quiet: true });
requireKeys(ENV, ['VITE_SUPABASE_URL', 'VITE_SUPABASE_PUBLISHABLE_KEY']);
const H = { apikey: ENV.VITE_SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${ENV.VITE_SUPABASE_PUBLISHABLE_KEY}` };
const rows = [];
for (let f = 0; ; f += 1000) {
  const r = await fetch(`${ENV.VITE_SUPABASE_URL}/rest/v1/junior_vocab?select=word,grade&offset=${f}&limit=1000`, { headers: H });
  if (!r.ok) { console.error(`x junior_vocab ${r.status}`); process.exit(2); }
  const j = await r.json(); rows.push(...j); if (j.length < 1000) break;
}
const grades = new Map();
for (const r of rows) {
  if (r.grade < 7 || r.grade > 12) continue;
  const w = String(r.word).trim().toLowerCase();
  grades.set(w, Math.min(grades.get(w) ?? 99, r.grade));
}
const expand = s => {
  let out = [[]];
  for (const tok of s.split(/\s+/)) {
    out = tok.includes('/') ? out.flatMap(o => tok.split('/').map(a => [...o, a])) : out.map(o => [...o, tok]);
  }
  return out.map(o => o.join(' '));
};
const gradeOf = w => {
  if (grades.has(w)) return grades.get(w);
  for (const [orig, g] of grades) if (orig.includes('/') && expand(orig).includes(w)) return g;
  return null;   /* ⚠️ 查不到是**第三态**,不能当成"高中" —— 单独打印,人工看 */
};

const junior = [], senior = [], unknown = [];
for (const w of words) {
  const g = gradeOf(w);
  if (g === null) unknown.push(w);
  else if (g <= 9) junior.push(w); else senior.push(w);
}

const esc = s => String(s).replace(/'/g, "''");
const list = a => a.map(w => `  ('${esc(w)}')`).join(',\n');
const inGaokao = [...junior, ...senior].sort();
const inZhongkao = [...junior].sort();

const sql = `-- 教材缺口批:挂词库 —— gaokao ${inGaokao.length} 个 / zhongkao ${inZhongkao.length} 个
-- 生成: node scripts/vocab/emit-textbook-mount-sql.mjs --bank=${BANK}
-- ⚠️ 由 Aaron 执行。脚本本身从不写库。
--
-- 规则:junior_vocab 最低年级 ≤9 → zhongkao + gaokao;10–12 → 仅 gaokao。
--   实证来源:库里已挂好的 991 批 = gaokao 991 / zhongkao 663,
--   而那 991 里最低年级 ≤9 的正好 663 —— 数对上才照做的。
-- ⚠️ 顺序:建词条 → 内容 → **本份**。先挂后灌的话用户点开是空卡。
${unknown.length ? `--\n-- ⚠️ 有 ${unknown.length} 个词在 junior_vocab 里查不到年级,**本份没挂**:\n${unknown.map(w => `--    ${w}`).join('\n')}\n` : ''}
BEGIN;

SELECT 'BEFORE' AS stage, b.code, count(*) AS words
  FROM vocab_word_banks wb JOIN vocab_banks b ON b.id = wb.bank_id
 WHERE b.code IN ('zhongkao','gaokao') GROUP BY b.code ORDER BY b.code;

CREATE TEMP TABLE _mount_gaokao(headword text PRIMARY KEY) ON COMMIT DROP;
INSERT INTO _mount_gaokao(headword) VALUES
${list(inGaokao)};

CREATE TEMP TABLE _mount_zhongkao(headword text PRIMARY KEY) ON COMMIT DROP;
INSERT INTO _mount_zhongkao(headword) VALUES
${list(inZhongkao)};

INSERT INTO vocab_word_banks (word_id, bank_id)
SELECT w.id, b.id FROM _mount_gaokao m
  JOIN vocab_words w ON lower(w.headword) = m.headword
  JOIN vocab_banks b ON b.code = 'gaokao'
ON CONFLICT DO NOTHING;

INSERT INTO vocab_word_banks (word_id, bank_id)
SELECT w.id, b.id FROM _mount_zhongkao m
  JOIN vocab_words w ON lower(w.headword) = m.headword
  JOIN vocab_banks b ON b.code = 'zhongkao'
ON CONFLICT DO NOTHING;

SELECT 'AFTER' AS stage, b.code, count(*) AS words
  FROM vocab_word_banks wb JOIN vocab_banks b ON b.id = wb.bank_id
 WHERE b.code IN ('zhongkao','gaokao') GROUP BY b.code ORDER BY b.code;

-- ── 断言:判终态,不判这一次改了多少 ──────────────────────────
DO $gate$
DECLARE v_n int;
BEGIN
  -- ⑴ 临时表非空(空表会让下面每条断言真空通过)
  SELECT count(*) INTO v_n FROM _mount_gaokao;
  IF v_n <> ${inGaokao.length} THEN RAISE EXCEPTION 'gaokao 名单应 ${inGaokao.length} 行,实际 %', v_n; END IF;
  SELECT count(*) INTO v_n FROM _mount_zhongkao;
  IF v_n <> ${inZhongkao.length} THEN RAISE EXCEPTION 'zhongkao 名单应 ${inZhongkao.length} 行,实际 %', v_n; END IF;

  -- ⑵ 名单里每个词都真的在 vocab_words 里(词条 SQL 没跑就会在这里炸)
  SELECT count(*) INTO v_n FROM _mount_gaokao m
   WHERE NOT EXISTS (SELECT 1 FROM vocab_words w WHERE lower(w.headword) = m.headword);
  IF v_n <> 0 THEN RAISE EXCEPTION '有 % 个词还没建词条 —— 先跑 vocab_${BANK}_words.sql', v_n; END IF;

  -- ⑶ 终态:名单里每个词都已挂在对应库上
  SELECT count(*) INTO v_n FROM _mount_gaokao m
    JOIN vocab_words w ON lower(w.headword) = m.headword
   WHERE NOT EXISTS (SELECT 1 FROM vocab_word_banks wb JOIN vocab_banks b ON b.id = wb.bank_id
                      WHERE wb.word_id = w.id AND b.code = 'gaokao');
  IF v_n <> 0 THEN RAISE EXCEPTION '还有 % 个词没挂进 gaokao', v_n; END IF;

  SELECT count(*) INTO v_n FROM _mount_zhongkao m
    JOIN vocab_words w ON lower(w.headword) = m.headword
   WHERE NOT EXISTS (SELECT 1 FROM vocab_word_banks wb JOIN vocab_banks b ON b.id = wb.bank_id
                      WHERE wb.word_id = w.id AND b.code = 'zhongkao');
  IF v_n <> 0 THEN RAISE EXCEPTION '还有 % 个词没挂进 zhongkao', v_n; END IF;

  -- ⑷ 挂进去的词都有释义 —— 空卡是这一步最怕的事故
  SELECT count(*) INTO v_n FROM _mount_gaokao m
    JOIN vocab_words w ON lower(w.headword) = m.headword
   WHERE w.def_zh IS NULL;
  IF v_n <> 0 THEN RAISE EXCEPTION '有 % 个词没有释义就被挂进词库(空卡)—— 先跑内容 SQL', v_n; END IF;
END
$gate$;

COMMIT;
`;

mkdirSync(path.join(REPO, 'SQLAA'), { recursive: true });
const name = `vocab_${BANK}_mount.sql`;
writeFileSync(path.join(REPO, 'SQLAA', name), sql, 'utf8');
console.log(`· 挂载 SQL:gaokao ${inGaokao.length} · zhongkao ${inZhongkao.length}${unknown.length ? ` · 年级查不到 ${unknown.length}(未挂:${unknown.join(', ')})` : ''} → SQLAA/${name}`);
