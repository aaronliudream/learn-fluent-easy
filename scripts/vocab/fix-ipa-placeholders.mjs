/**
 * 一次性修复:14 条音标里的占位符处理错误。**按 id 锁定,只改 `ipa` 一列**。
 *
 * ⚠️ 红线:不开通用覆盖通道。内容 SQL 里 `AND def_zh IS NULL` 那道护栏是全库
 *    14,776 个词唯一的屏障,一次性修复一律按 id 锁死,作用面锁在这 14 行。
 * ⚠️ 释义和例句 Aaron 已经审过,**一列都不许顺手改**。SQL 里用改前全表快照
 *    证明 headword/def_zh/def_en/pos/audio_url 全都没动、且只有这 14 行的 ipa 变了。
 * ⚠️ 音频不用重烧:词条音频是按 **headword 文本**烧的,与 ipa 无关。
 *
 * 名单来源:scripts/vocab/test-ipa-gate.mjs 的 FIXES —— 那份同时是闸门的已知答案样本,
 * 修正值必须先过 g14 才可能出现在这里(本脚本会再验一遍,不过就不出件)。
 *
 * 用法:node scripts/vocab/fix-ipa-placeholders.mjs [--write-json]
 *   --write-json 顺带把本地 <bank>-content.json 里的同名词条也改掉(不然重新出件会把坏值又灌回去)
 * 产出:SQLAA/vocab_fix_ipa_placeholders.sql
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv, requireKeys } from './env.mjs';
import { g14_ipaNoPlaceholder } from './gates.mjs';
import { FIXES } from './test-ipa-gate.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..', '..');
const GEN = path.join(HERE, 'data', 'generated');
const WRITE_JSON = process.argv.includes('--write-json');

/* ── ① 修正值自己先过闸 ──────────────────────────────────── */
let bad = 0;
for (const [hw, oldIpa, newIpa] of FIXES) {
  if (!g14_ipaNoPlaceholder(oldIpa, hw)) { console.error(`x 坏值居然过闸:${hw} ${oldIpa}`); bad++; }
  const r = g14_ipaNoPlaceholder(newIpa, hw);
  if (r) { console.error(`x 修正值不过闸:${hw} ${newIpa} —— ${r}`); bad++; }
}
if (bad) { console.error('停:名单本身不干净'); process.exit(2); }

/* ── ② 从库里取 id,并核对改前值确实是那个坏值 ─────────────── */
const ENV = loadEnv(REPO, { quiet: true });
requireKeys(ENV, ['VITE_SUPABASE_URL', 'VITE_SUPABASE_PUBLISHABLE_KEY']);
const H = { apikey: ENV.VITE_SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${ENV.VITE_SUPABASE_PUBLISHABLE_KEY}` };
const rows = [];
for (const [hw, oldIpa, newIpa, why] of FIXES) {
  const r = await fetch(`${ENV.VITE_SUPABASE_URL}/rest/v1/vocab_words?select=id,headword,ipa&headword=eq.${encodeURIComponent(hw)}`, { headers: H });
  if (!r.ok) { console.error(`x 查 ${hw} 失败 ${r.status}`); process.exit(2); }
  const j = await r.json();
  if (j.length !== 1) { console.error(`x ${hw} 在库里有 ${j.length} 行,期望 1 行 —— 停`); process.exit(2); }
  if (j[0].ipa !== oldIpa) {
    /* ⚠️ 库里的值和名单对不上 = 要么改错了行,要么已经被人改过。两种都不能盲目往下走。 */
    console.error(`x ${hw} 库里现在是 "${j[0].ipa}",名单写的是 "${oldIpa}" —— 停`); process.exit(2);
  }
  rows.push({ id: j[0].id, headword: hw, old: oldIpa, new: newIpa, why });
}
console.log(`· 名单 ${rows.length} 条,改前值与库内逐条核对一致`);

/* ── ③ 顺带修本地内容 JSON(否则重新出件会把坏值灌回去)────── */
if (WRITE_JSON) {
  const byHw = new Map(rows.map(r => [r.headword.toLowerCase(), r]));
  for (const f of readdirSync(GEN).filter(x => x.endsWith('-content.json'))) {
    const p = path.join(GEN, f);
    const j = JSON.parse(readFileSync(p, 'utf8'));
    let n = 0;
    for (const [k, w] of Object.entries(j)) {
      const hit = byHw.get(String(w.headword ?? k).toLowerCase());
      if (hit && w.ipa === hit.old) { w.ipa = hit.new; n++; }
    }
    if (n) { writeFileSync(p, JSON.stringify(j, null, 2), 'utf8'); console.log(`· ${f}:改了 ${n} 条 ipa`); }
  }
}

/* ── ④ 出 SQL ────────────────────────────────────────────── */
const esc = s => String(s).replace(/'/g, "''");
const sql = `-- 音标占位符修正 —— ${rows.length} 条,**按 id 锁定,只改 ipa 一列**
-- 生成: node scripts/vocab/fix-ipa-placeholders.mjs
-- ⚠️ 由 Aaron 执行。脚本本身从不写库。
--
-- 规则(定死,写在 gates.mjs 的 g14 注释里):
--   sb / sth / sw / sb's / sth's / oneself → 不念
--   one's                                  → 念作 /wʌnz/
--   括号内可选成分                         → 不念,括号也不出现在音标里
--   斜杠择一                               → 只念第一个
--   do / doing                             → 念(真实词形,同 one's)
--
-- ⚠️ **释义、例句、音频一律不动。** 音频是按 headword 文本烧的,与 ipa 无关,不用重烧。
--    下面用改前全表快照断言:只有这 ${rows.length} 行的 ipa 变了,其余列一列没动。
--
-- 逐条:
${rows.map(r => `--   ${r.headword.padEnd(26)} ${r.old.padEnd(30)} → ${r.new.padEnd(28)} (${r.why})`).join('\n')}

BEGIN;

CREATE TEMP TABLE _fix(id uuid PRIMARY KEY, headword text, old_ipa text, new_ipa text) ON COMMIT DROP;
INSERT INTO _fix(id, headword, old_ipa, new_ipa) VALUES
${rows.map(r => `  ('${r.id}', '${esc(r.headword)}', '${esc(r.old)}', '${esc(r.new)}')`).join(',\n')};

-- 改前快照:证明"只动了 ipa、只动了这几行"唯一靠得住的办法
CREATE TEMP TABLE _before AS
  SELECT id, headword, ipa, def_zh, def_en, pos, audio_url FROM vocab_words;

SELECT 'BEFORE' AS stage, f.headword, w.ipa
  FROM _fix f JOIN vocab_words w ON w.id = f.id ORDER BY f.headword;

UPDATE vocab_words w SET ipa = f.new_ipa, updated_at = now()
  FROM _fix f WHERE w.id = f.id;

SELECT 'AFTER' AS stage, f.headword, w.ipa
  FROM _fix f JOIN vocab_words w ON w.id = f.id ORDER BY f.headword;

DO $gate$
DECLARE v_n int;
BEGIN
  -- ⑴ 名单非空且行数对(空表会让下面每条断言真空通过)
  SELECT count(*) INTO v_n FROM _fix;
  IF v_n <> ${rows.length} THEN RAISE EXCEPTION '名单应 ${rows.length} 行,实际 %', v_n; END IF;

  -- ⑵ 名单里每个 id 都真的在库里(不加这条,id 写错会让后面几条断言真空通过,
  --    只剩 ⑷ 那条数量断言兜底 —— 报错信息会指向完全不相干的地方)
  SELECT count(*) INTO v_n FROM _fix f
   WHERE NOT EXISTS (SELECT 1 FROM vocab_words w WHERE w.id = f.id);
  IF v_n <> 0 THEN RAISE EXCEPTION '名单里有 % 个 id 在库里不存在', v_n; END IF;

  -- ⑶ 改前值必须就是名单里的坏值 —— 对不上就是改错行,或者已经有人改过
  SELECT count(*) INTO v_n FROM _fix f JOIN _before b ON b.id = f.id
   WHERE b.ipa IS DISTINCT FROM f.old_ipa;
  IF v_n <> 0 THEN RAISE EXCEPTION '有 % 行改前值与名单对不上 —— 已回滚', v_n; END IF;

  -- ⑷ 终态:每一行都等于新值(判终态,不判这一次改了多少)
  SELECT count(*) INTO v_n FROM _fix f JOIN vocab_words w ON w.id = f.id
   WHERE w.ipa IS DISTINCT FROM f.new_ipa;
  IF v_n <> 0 THEN RAISE EXCEPTION '有 % 行没改成新值', v_n; END IF;

  -- ⑸ 全库**只有**这 ${rows.length} 行的 ipa 变了
  SELECT count(*) INTO v_n FROM _before b JOIN vocab_words w ON w.id = b.id
   WHERE b.ipa IS DISTINCT FROM w.ipa;
  IF v_n <> ${rows.length} THEN RAISE EXCEPTION '全库有 % 行 ipa 发生变化,应为 ${rows.length}', v_n; END IF;

  -- ⑹ 其余列一列没动(Aaron 已审过的释义/例句/音频)
  SELECT count(*) INTO v_n FROM _before b JOIN vocab_words w ON w.id = b.id
   WHERE b.headword IS DISTINCT FROM w.headword
      OR b.def_zh   IS DISTINCT FROM w.def_zh
      OR b.def_en   IS DISTINCT FROM w.def_en
      OR b.pos      IS DISTINCT FROM w.pos
      OR b.audio_url IS DISTINCT FROM w.audio_url;
  IF v_n <> 0 THEN RAISE EXCEPTION '有 % 行的其它列被改动了 —— 已回滚', v_n; END IF;

  -- ⑺ 没有多出来或少掉的行
  SELECT count(*) INTO v_n FROM vocab_words;
  IF v_n <> (SELECT count(*) FROM _before) THEN RAISE EXCEPTION '词条总数变了 —— 已回滚'; END IF;

  RAISE NOTICE '音标修正 ${rows.length} 条完成;其余列与行数均未变动';
END
$gate$;

COMMIT;
`;
mkdirSync(path.join(REPO, 'SQLAA'), { recursive: true });
const out = path.join(REPO, 'SQLAA', 'vocab_fix_ipa_placeholders.sql');
writeFileSync(out, sql, 'utf8');
console.log(`· 修正 SQL(${rows.length} 条,只改 ipa)→ SQLAA/vocab_fix_ipa_placeholders.sql`);
