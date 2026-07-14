/**
 * 首页图书馆板块 · 每书正文总词数(体量提示「1.2 万词」)。预计算落 library_books.word_count。
 * 词数 = 该书 library_sentences 所有 text_en 的英文词数总和。只读诊断,产出 SQL 给 Aaron 跑。
 * 用法:node scripts/library/compute-word-counts.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";

function loadEnv() {
  for (const f of [".env", ".env.local"]) {
    if (!existsSync(f)) continue;
    for (const l of readFileSync(f, "utf8").split(/\r?\n/)) {
      if (!l.includes("=") || l.trim().startsWith("#")) continue;
      const i = l.indexOf("=");
      process.env[l.slice(0, i).trim()] = l.slice(i + 1).trim().replace(/^["']|["']$/g, "");
    }
  }
}
loadEnv();
const SUP = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const H = { apikey: KEY, Authorization: `Bearer ${KEY}` };

async function pageAll(path) {
  const out = []; let off = 0;
  for (;;) {
    const r = await fetch(`${SUP}/rest/v1/${path}&limit=1000&offset=${off}`, { headers: H });
    if (!r.ok) throw new Error(`${r.status} ${(await r.text()).slice(0, 150)}`);
    const b = await r.json(); out.push(...b);
    if (b.length < 1000) break; off += 1000;
  }
  return out;
}
const wordsIn = (s) => (String(s || "").trim().match(/[A-Za-z0-9'’-]+/g) || []).length;

(async () => {
  const books = await pageAll("library_books?select=id,book_key");
  const rows = [];
  for (const bk of books) {
    const sents = await pageAll(`library_sentences?book_id=eq.${bk.id}&select=text_en`);
    const wc = sents.reduce((n, s) => n + wordsIn(s.text_en), 0);
    rows.push({ id: bk.id, key: bk.book_key, wc });
    console.log(`  ${bk.book_key.padEnd(20)} ${wc} 词`);
  }

  let sql = `-- ============================================================================
-- 首页图书馆板块 · 每书正文总词数(体量提示)。library_books 加 word_count 列 + 逐书回填。
-- 数值由 scripts/library/compute-word-counts.mjs 枚举(该书 library_sentences 英文词数总和)。纯追加,幂等。
-- ============================================================================
BEGIN;

ALTER TABLE public.library_books ADD COLUMN IF NOT EXISTS word_count int;

`;
  for (const r of rows) {
    sql += `UPDATE public.library_books SET word_count=${r.wc} WHERE id='${r.id}'; -- ${r.key}\n`;
  }
  sql += `
SELECT book_key, word_count FROM public.library_books ORDER BY book_key;

COMMIT;
`;
  writeFileSync("SQLAA/library-word-counts.sql", sql);
  console.log("\n✓ SQLAA/library-word-counts.sql");
})();
