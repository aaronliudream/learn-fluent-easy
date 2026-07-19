/**
 * Batch 2 · 按书掌握率分母(「精选核心词」)。Aaron 定门槛:词频次≥10、语块频次≥4。
 * 核心词 = 该书正文出现 ≥10 次 · 有 read-v1 单词卡 · 非虚词 · 非专名(专名=正文中从未小写出现)。
 * 核心语块 = read-v1 语块卡(normalized 含空格)在该书正文出现 ≥4 次。
 * 固定分母,不随用户收藏变;只增不减不惩罚努力。只读诊断,产出 SQLAA/library-core-counts.sql。
 * 用法:node scripts/library/compute-core-counts.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const WORD_MIN = 10; // 词频次门槛
const CHUNK_MIN = 4; // 语块频次门槛

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

const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9' ]+/g, " ").replace(/\s+/g, " ").trim();
const FUNC_POS = new Set(["conj", "prep", "art", "pron", "aux", "det", "num", "interj", "int", "particle", "modal"]);
const GRAMMAR_TERMS = new Set(
  ("the a an of to in on at and or but nor for so yet with as by from because although though while since unless " +
    "if then than that this these those is are was were be been being am do does did have has had will would shall " +
    "should can could may might must not no o'clock").split(" "));
const normPos = (p) => String(p || "").split("/")[0].toLowerCase().replace(/[^a-z]/g, "");
const isFunc = (term, pos) => GRAMMAR_TERMS.has(term) || FUNC_POS.has(normPos(pos));

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

(async () => {
  const cards = await pageAll("phrase_explanations?target_lang=eq.read-v1&select=normalized,explanation");
  const wordPos = new Map();
  const chunkKeys = new Set();
  for (const c of cards) {
    const k = String(c.normalized).toLowerCase().trim();
    if (!k) continue;
    if (k.includes(" ")) chunkKeys.add(k);
    else wordPos.set(k, c.explanation?.pos || "");
  }
  console.log(`read-v1: ${wordPos.size} 词卡 / ${chunkKeys.size} 语块卡(门槛:词≥${WORD_MIN} 语块≥${CHUNK_MIN})`);

  const books = await pageAll("library_books?select=id,book_key");
  const rows = [];
  for (const bk of books) {
    const sents = await pageAll(`library_sentences?book_id=eq.${bk.id}&select=text_en`);
    const freq = new Map();
    const hasLower = new Set();
    let fulltext = " ";
    for (const s of sents) {
      const en = s.text_en || "";
      fulltext += norm(en) + " ";
      en.split(/\s+/).forEach((w, i) => {
        const cleaned = w.replace(/^[^A-Za-z']+|[^A-Za-z']+$/g, "");
        if (!cleaned) return;
        const key = cleaned.toLowerCase();
        freq.set(key, (freq.get(key) || 0) + 1);
        if (!/^[A-Z]/.test(cleaned)) hasLower.add(key); // 出现过小写 → 非专名
      });
    }
    fulltext = fulltext.replace(/\s+/g, " ");

    let coreWord = 0;
    for (const [key, pos] of wordPos) {
      if ((freq.get(key) || 0) < WORD_MIN) continue; // 频次门槛
      if (isFunc(key, pos)) continue;                 // 虚词
      if (!hasLower.has(key)) continue;               // 专名
      coreWord++;
    }
    let coreChunk = 0;
    for (const c of chunkKeys) {
      const f = fulltext.split(` ${c} `).length - 1;
      if (f >= CHUNK_MIN) coreChunk++;
    }
    rows.push({ id: bk.id, key: bk.book_key, sents: sents.length, coreWord, coreChunk });
    console.log(`  ${bk.book_key.padEnd(20)} 句${String(sents.length).padStart(5)}  核心词 ${coreWord}  核心语块 ${coreChunk}`);
  }

  let sql = `-- ============================================================================
-- Batch 2 · 按书掌握率「精选核心词」分母:library_books 加 core_word_count / core_chunk_count 两列 + 逐书回填。
-- 门槛(Aaron 定):核心词 = 正文出现≥${WORD_MIN}次·有 read-v1 卡·非虚词·非专名;核心语块 = read-v1 语块卡出现≥${CHUNK_MIN}次。
-- 由 scripts/library/compute-core-counts.mjs 枚举。固定分母·只增不减不惩罚努力。纯追加,幂等。
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
