/**
 * 图书馆精读 · 语块(chunk)预生成。照 prewarm-definitions.mjs 骨架。
 * 每章送 extract-chunks(严格筛选)→ 校验+去重+自审 → read-v1 卡(点击出卡)+ library_chunks 索引(虚线定位)。
 *
 * 关键设计:
 *  · 缓存原始 AI 输出到 <key>-chunks-cache/chN.json:审后要删某条,直接改 rejects 重跑,不重烧 AI 调用。
 *  · 跨章 read-v1 去重:同一语块(如 look after)多章出现只出一张卡,记所有出处;库里已有的也跳过(省调用/省行)。
 *    extract-chunks 每章各 1 次调用(找本章语块必须做),去重省的是重复的卡与后续重跑。
 *  · rejects(<key>-chunk-rejects.json {"1":["worked hard",...]}):审掉的语块永久排除。
 *  · 专名组合直接丢弃(命门:不许专名当语块)。
 *
 * ⚠️ 只有 anon key,不写库;AI 走已部署的 extract-chunks。内容须先过审再落库。
 * 用法:
 *   node scripts/library/prewarm-chunks.mjs wizard-of-oz 2         # 单章(用/建缓存)
 *   node scripts/library/prewarm-chunks.mjs wizard-of-oz --all     # 全书:每章 review + 合并去重 SQL
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env", "utf8").split(/\r?\n/).filter((l) => l.includes("=")).map((l) => {
    const i = l.indexOf("=");
    return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")];
  }),
);
const SUP = env.VITE_SUPABASE_URL, ANON = env.VITE_SUPABASE_PUBLISHABLE_KEY;
const H = { apikey: ANON, Authorization: `Bearer ${ANON}`, "Content-Type": "application/json" };
const EXTRACT_URL = `${SUP}/functions/v1/extract-chunks`;
const TARGET_LANG = "read-v1";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const key = process.argv[2];
const arg = process.argv[3];
if (!key || !arg) { console.error("用法: node scripts/library/prewarm-chunks.mjs <book_key> <chapter|--all>"); process.exit(1); }

const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9' ]+/g, " ").replace(/\s+/g, " ").trim();
const FUNCTION_WORDS = new Set(
  ("a an the of to in on at by for with as from up down off out over under into onto about away back through around " +
   "after before again no not so and or but if then than run take make get give go come look put keep turn hold set let").split(" "));
const sqlEsc = (s) => String(s).replace(/'/g, "''");

const book = JSON.parse(readFileSync(`scripts/library/books/${key}.json`, "utf8"));
const flat = [];
let seq = 0;
for (const ch of book.chapters) for (const p of ch.paragraphs) for (const s of p) { seq += 1; flat.push({ seq, chapter_idx: ch.idx, en: s.en, cn: s.cn ?? "" }); }
const enBySeq = new Map(flat.map((s) => [s.seq, s.en]));
const cnBySeq = new Map(flat.map((s) => [s.seq, s.cn]));

const capMid = new Map(), lowMid = new Map();
for (const s of flat) (s.en.match(/[A-Za-z]+(?:'[A-Za-z]+)?/g) || []).forEach((t, i) => {
  if (i === 0) return; const lw = t.toLowerCase();
  if (/^[A-Z]/.test(t)) capMid.set(lw, (capMid.get(lw) || 0) + 1); else lowMid.set(lw, (lowMid.get(lw) || 0) + 1);
});
const isProper = (lw) => (capMid.get(lw) || 0) > 0 && (lowMid.get(lw) || 0) === 0 && lw !== "i";
const hasProper = (term) => term.split(/\s+/).some((w) => isProper(w.replace(/[^a-z]/g, "")));
const bookText = flat.map((s) => " " + s.en.toLowerCase() + " ");
const bookOccur = (term) => bookText.filter((t) => t.includes(term)).length;

function auditFlags(term) {
  const words = term.split(/\s+/), flags = [];
  const hasFn = words.some((w) => FUNCTION_WORDS.has(w.replace(/[^a-z]/g, "")));
  if (!hasFn && words.length <= 2) flags.push("可能描述性组合(adv+v/adj)");
  if (/\b(her|his|its|their|him|them)\b/.test(term)) flags.push("含代词/实例化(非原形)");
  return flags;
}

const CACHE_DIR = `scripts/library/books/${key}-chunks-cache`;
mkdirSync(CACHE_DIR, { recursive: true });
const REJECTS_PATH = `scripts/library/books/${key}-chunk-rejects.json`;
const REJECTS = existsSync(REJECTS_PATH) ? JSON.parse(readFileSync(REJECTS_PATH, "utf8")) : {};

async function extractChunks(sents) {
  const r = await fetch(EXTRACT_URL, { method: "POST", headers: H, body: JSON.stringify({ sentences: sents.map((s) => ({ seq: s.seq, en: s.en, cn: s.cn })) }) });
  if (!r.ok) { console.log(`  ❌ HTTP ${r.status}: ${(await r.text()).slice(0, 100)}`); return []; }
  const { chunks, error } = await r.json();
  if (error) { console.log(`  ⚠️ ${error}`); return []; }
  return chunks || [];
}

/** 取某章 merged chunks;有缓存用缓存(不烧 AI),否则调 AI + 缓存。返回 {aiCalled, chunks:[{term,zh,note,seqs}]}。 */
async function getChapterChunks(ci) {
  const cachePath = `${CACHE_DIR}/ch${ci}.json`;
  if (existsSync(cachePath)) return { aiCalled: false, chunks: JSON.parse(readFileSync(cachePath, "utf8")) };
  const sents = flat.filter((s) => s.chapter_idx === ci);
  const raw = await extractChunks(sents);
  const byTerm = new Map();
  for (const c of raw) {
    const t = String(c.term || "").toLowerCase().trim();
    if (!t) continue;
    if (!byTerm.has(t)) byTerm.set(t, { term: t, zh: c.zh, note: c.note, seqs: [] });
    if (!byTerm.get(t).seqs.includes(c.src_seq)) byTerm.get(t).seqs.push(c.src_seq);
  }
  const chunks = [...byTerm.values()];
  writeFileSync(cachePath, JSON.stringify(chunks, null, 2));
  return { aiCalled: true, chunks };
}

/** 过滤:丢专名 + 丢 rejects。返回保留的。 */
function applyFilters(ci, chunks) {
  const rej = new Set((REJECTS[String(ci)] || []).map((s) => s.toLowerCase()));
  return chunks.filter((c) => !hasProper(c.term) && !rej.has(c.term.toLowerCase()));
}

function chapterReview(ci, kept, dropped) {
  const esc = (s) => String(s ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
  const flagged = kept.map((c) => ({ ...c, flags: auditFlags(c.term) })).filter((c) => c.flags.length);
  let md = `# 图书馆精读语块 · 待审 · ${book.title} 第 ${ci} 章

> 命门=选得准。服务端已校验"逐字出现原句";我另丢弃专名组合、按 rejects 排除已否决项。可疑项见第③节。
> 未落库;target_lang='${TARGET_LANG}' kind=chunk。

## 一、统计
- 保留语块:**${kept.length}**(目标 10–30)· 丢弃(专名/已否决):${dropped}
- 我标记可疑:${flagged.length}(重点审)

## 二、完整清单
| # | 语块 | 中文 | 用法(note) | 出处英文原句 | 全书次数 |
|---|---|---|---|---|---|
`;
  kept.forEach((c, i) => { const s = c.seqs[0]; md += `| ${i + 1} | **${esc(c.term)}** | ${esc(c.zh)} | ${esc(c.note)} | ${esc((enBySeq.get(s) || "").slice(0, 70))} | ${bookOccur(c.term)} |\n`; });
  md += `\n## 三、我标记的可疑项(留/删)\n`;
  if (!flagged.length) md += "(无)\n";
  else { md += `| 语块 | 中文 | 可疑原因 |\n|---|---|---|\n`; flagged.forEach((c) => { md += `| ${esc(c.term)} | ${esc(c.zh)} | ${c.flags.join(" / ")} |\n`; }); }
  md += `\n## 四、边界\n只产文件+SQL(你跑);未落库、未改收藏/读路径、未合main、未动P0。\n`;
  mkdirSync("REVIEWAA/图书馆词表", { recursive: true });
  writeFileSync(`REVIEWAA/图书馆词表/${key}-ch${ci}-chunks-review.md`, md);
  return flagged.length;
}

(async () => {
  const chapters = arg === "--all" ? book.chapters.map((c) => c.idx) : [Number(arg)];
  // 只做【运行内】跨章去重(同语块多章出现出一张卡);不查 DB —— SQL 要自包含+幂等,
  // upsert 本就幂等,查 DB 反而会把已灌的卡从 SQL 里剥掉,产出残缺文件。
  const seen = new Set();

  let aiCalls = 0, keptTotal = 0, flagTotal = 0;
  const readv1 = [];  // 去重后的卡
  const index = [];   // 所有出处
  for (const ci of chapters) {
    const { aiCalled, chunks } = await getChapterChunks(ci);
    if (aiCalled) { aiCalls++; await sleep(1200); }
    const kept = applyFilters(ci, chunks);
    keptTotal += kept.length;
    flagTotal += chapterReview(ci, kept, chunks.length - kept.length);
    for (const c of kept) {
      const norm = normalize(c.term);
      if (!seen.has(norm)) {
        seen.add(norm);
        const src = c.seqs[0];
        readv1.push({ term: c.term, norm, expl: { word: c.term, pos: "词块", ipa: "", gloss_cn: c.zh, example: { en: enBySeq.get(src) || "", cn: cnBySeq.get(src) || "" }, note: c.note, kind: "chunk", src_seqs: c.seqs } });
      }
      for (const sq of c.seqs) index.push({ ci, term: c.term, seq: sq });
    }
    console.log(`  ch${ci}: 保留 ${kept.length}${aiCalled ? " (AI)" : " (缓存)"}`);
  }

  const rv = readv1.map((r) => `  ('${sqlEsc(r.term)}', '${sqlEsc(r.norm)}', 'en', '${TARGET_LANG}', '${sqlEsc(JSON.stringify(r.expl))}'::jsonb)`).join(",\n");
  const ix = index.map((r) => `  ((SELECT id FROM public.library_books WHERE book_key='${key}'), ${r.ci}, '${sqlEsc(r.term)}', ${r.seq}, true)`).join(",\n");
  const suffix = arg === "--all" ? "all" : `ch${arg}`;
  const sql = `-- 图书馆精读语块:${book.title} · ${chapters.length} 章 · read-v1 卡 ${readv1.length} 张(跨章去重)/ library_chunks 索引 ${index.length} 行
-- ① 点语块→read-v1 命中轻卡;② library_chunks→正文虚线。需先建表 library-chunks-ddl.sql。幂等 upsert。内容须过审再落库。

BEGIN;
INSERT INTO public.phrase_explanations (phrase, normalized, source_lang, target_lang, explanation)
VALUES
${rv}
ON CONFLICT (normalized, target_lang) DO UPDATE SET phrase=EXCLUDED.phrase, explanation=EXCLUDED.explanation, updated_at=now();

INSERT INTO public.library_chunks (book_id, chapter_idx, term, src_seq, is_published)
VALUES
${ix}
ON CONFLICT (book_id, chapter_idx, term, src_seq) DO NOTHING;
COMMIT;
`;
  writeFileSync(`SQLAA/library-chunks-${key}-${suffix}.sql`, sql);
  console.log(`\n✓ SQLAA/library-chunks-${key}-${suffix}.sql — read-v1 ${readv1.length} 卡 / index ${index.length} 行`);
  console.log(`✓ ${chapters.length} 章 review → REVIEWAA/图书馆词表/`);
  console.log(`保留语块合计 ${keptTotal};可疑合计 ${flagTotal};本次 AI 调用 ${aiCalls}(其余用缓存)`);
})();
