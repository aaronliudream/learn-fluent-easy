/**
 * Batch 2 · 按书掌握率的分母:枚举每本书的 read-v1 核心词/语块数(固定,不随用户收藏变)。
 * phrase_explanations(read-v1)是全局无 book_id → 靠正文归属:
 *   核心词  = 该书正文出现过、且有 read-v1 单词卡(normalized 无空格)的不同词数;
 *   核心语块 = read-v1 语块卡(normalized 含空格)中,短语在该书正文里出现过的条数。
 * 只读(service role 仅诊断)。产出 SQLAA/library-core-counts.sql(ALTER 加两列 + 每书 UPDATE)。
 * 用法:node scripts/library/compute-core-counts.mjs
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

// 与 phrase_explanations 的 normalize 逐字一致
const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9' ]+/g, " ").replace(/\s+/g, " ").trim();

async function pageAll(path) {
  const out = [];
  let offset = 0;
  for (;;) {
    const r = await fetch(`${SUP}/rest/v1/${path}&limit=1000&offset=${offset}`, { headers: H });
    if (!r.ok) throw new Error(`${r.status} ${(await r.text()).slice(0, 200)}`);
    const b = await r.json();
    out.push(...b);
    if (b.length < 1000) break;
    offset += 1000;
  }
  return out;
}

(async () => {
  // 1) read-v1 keys → 词集 / 语块集
  const cards = await pageAll("phrase_explanations?target_lang=eq.read-v1&select=normalized");
  const wordKeys = new Set();
  const chunkKeys = [];
  for (const c of cards) {
    const k = norm(c.normalized);
    if (!k) continue;
    if (k.includes(" ")) chunkKeys.push(k);
    else wordKeys.add(k);
  }
  console.log(`read-v1: ${wordKeys.size} 词卡 / ${chunkKeys.length} 语块卡(全局)`);

  // 2) 每本书
  const books = await pageAll("library_books?select=id,book_key,zh_title");
  const rows = [];
  for (const bk of books) {
    const sents = await pageAll(`library_sentences?book_id=eq.${bk.id}&select=text_en`);
    const tokens = new Set();
    let fulltext = " ";
    for (const s of sents) {
      const n = norm(s.text_en || "");
      if (!n) continue;
      fulltext += n + " ";
      for (const t of n.split(" ")) if (t) tokens.add(t);
    }
    const coreWord = [...wordKeys].filter((w) => tokens.has(w)).length;
    const coreChunk = [...new Set(chunkKeys)].filter((c) => fulltext.includes(` ${c} `)).length;
    rows.push({ id: bk.id, key: bk.book_key, title: bk.zh_title, sents: sents.length, coreWord, coreChunk });
    console.log(`  ${bk.book_key.padEnd(20)} 句${String(sents.length).padStart(5)}  核心词 ${coreWord}  核心语块 ${coreChunk}`);
  }

  // 3) 出 SQL
  let sql = `-- ============================================================================
-- Batch 2 · 按书掌握率分母:library_books 加 core_word_count / core_chunk_count 两列 + 逐书回填。
-- 数值由 scripts/library/compute-core-counts.mjs 枚举(该书正文 ∩ read-v1 卡)。纯追加,幂等。
-- 用途:按书掌握率 = 用户掌握该书词/块数 / 该书核心数(固定分母,只增不减·不惩罚努力)。
-- ============================================================================
BEGIN;

ALTER TABLE public.library_books
  ADD COLUMN IF NOT EXISTS core_word_count  int,
  ADD COLUMN IF NOT EXISTS core_chunk_count int;

`;
  for (const r of rows) {
    sql += `UPDATE public.library_books SET core_word_count=${r.coreWord}, core_chunk_count=${r.coreChunk} WHERE id='${r.id}'; -- ${r.key}\n`;
  }
  sql += `
SELECT book_key, core_word_count, core_chunk_count FROM public.library_books ORDER BY book_key;

COMMIT;
`;
  writeFileSync("SQLAA/library-core-counts.sql", sql);
  console.log("\n✓ SQLAA/library-core-counts.sql");
})();
