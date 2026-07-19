/**
 * 图书馆精读 · 合并修复补丁:① 多义卡释义写成含两义 ② 全部卡例句去重补新造(不同场景,匹配释义)。
 *
 * 修三个缺陷:
 *  A. 例句=原句(语块全部 + 单词echo)→ 新造不同场景例句(make-examples)。
 *  B. 例句补丁重复(同 term 多次 UPDATE)→ **按 term 去重,一张卡一次 UPDATE**。
 *  C. 跨章去重把多义合并成一张卡,首现义覆盖其余(spring 泉水/跳、in the world 世界上/究竟)
 *     → 多义卡(polysemy.json)释义改成含两义 `[词性]义;[词性]义`,例句给两个短例各对一义。
 *
 * 只 jsonb_set 改 explanation.gloss_cn / example,不动主键、不动读路径。只产 SQL,不落库。
 * 用法:node scripts/library/prewarm-examples.mjs wizard-of-oz
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";

const env = Object.fromEntries(readFileSync(".env", "utf8").split(/\r?\n/).filter((l) => l.includes("=")).map((l) => {
  const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")];
}));
const SUP = env.VITE_SUPABASE_URL, ANON = env.VITE_SUPABASE_PUBLISHABLE_KEY;
const H = { apikey: ANON, Authorization: `Bearer ${ANON}`, "Content-Type": "application/json" };
const MK_URL = `${SUP}/functions/v1/make-examples`;
const AI_BATCH = 30;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9' ]+/g, " ").replace(/\s+/g, " ").trim();
const sqlEsc = (s) => String(s).replace(/'/g, "''");

const key = process.argv[2] || "wizard-of-oz";
const book = JSON.parse(readFileSync(`scripts/library/books/${key}.json`, "utf8"));
const flat = []; for (const ch of book.chapters) for (const p of ch.paragraphs) for (const s of p) flat.push(s.en);
const bookSents = new Set(flat.map((e) => normalize(e)));
const capMid = new Map(), lowMid = new Map();
for (const e of flat) (e.match(/[A-Za-z]+(?:'[A-Za-z]+)?/g) || []).forEach((t, i) => { if (i === 0) return; const lw = t.toLowerCase(); if (/^[A-Z]/.test(t)) capMid.set(lw, 1); else lowMid.set(lw, 1); });
const hasProper = (term) => term.split(/\s+/).some((w) => { const lw = w.replace(/[^a-z]/g, ""); return capMid.has(lw) && !lowMid.has(lw) && lw !== "i"; });
const REJ = existsSync(`scripts/library/books/${key}-chunk-rejects.json`) ? JSON.parse(readFileSync(`scripts/library/books/${key}-chunk-rejects.json`, "utf8")) : {};
const POLY = JSON.parse(readFileSync(`scripts/library/books/${key}-polysemy.json`, "utf8"));

// ---- 收集需补例句的卡(按 term 去重)+ 各自的"意思"(用于造例句) ----
const glossOf = new Map();   // term → 该卡释义(非多义时用)
const isChunk = new Map();

// 语块:全部唯一 term(跨章去重,post-reject),释义取首现
for (let ci = 1; ci <= book.chapters.length; ci++) {
  const p = `scripts/library/books/${key}-chunks-cache/ch${ci}.json`;
  if (!existsSync(p)) continue;
  const rej = new Set((REJ[String(ci)] || []).map((s) => s.toLowerCase()));
  for (const c of JSON.parse(readFileSync(p, "utf8"))) {
    if (hasProper(c.term) || rej.has(c.term.toLowerCase())) continue;
    if (!glossOf.has(c.term)) { glossOf.set(c.term, c.zh || ""); isChunk.set(c.term, true); }
  }
}
// 单词 echo(例句=原句的)
for (let ci = 1; ci <= book.chapters.length; ci++) {
  const p = `scripts/library/books/${key}-defs-cache/ch${ci}.json`;
  if (!existsSync(p)) continue;
  const c = JSON.parse(readFileSync(p, "utf8"));
  for (const w of Object.keys(c)) {
    const ex = normalize(c[w].ex_en || "");
    if (ex && bookSents.has(ex) && !glossOf.has(w)) { glossOf.set(w, c[w].gloss_cn || ""); isChunk.set(w, false); }
  }
}
// 多义卡:全部加入(即使例句不是echo,也要换成两义例句)
for (const term of Object.keys(POLY)) { if (!glossOf.has(term)) { glossOf.set(term, ""); isChunk.set(term, POLY[term].kind === "chunk"); } }

// ---- 造例句(make-examples);多义 term 造两条(各对一义),其余造一条 ----
const EXC = `scripts/library/books/${key}-examples-cache`; mkdirSync(EXC, { recursive: true });
const cachePath = `${EXC}/byterm.json`;
const cache = existsSync(cachePath) ? JSON.parse(readFileSync(cachePath, "utf8")) : {};
const items = []; // {slot, term, meaning}
for (const term of glossOf.keys()) {
  if (POLY[term]) POLY[term].senses.forEach((s, i) => items.push({ slot: `${term}#${i}`, term, meaning: s.meaning }));
  else items.push({ slot: term, term, meaning: glossOf.get(term) });
}
const todo = items.filter((it) => !cache[it.slot]);

async function run() {
  let calls = 0;
  for (let i = 0; i < todo.length; i += AI_BATCH) {
    const batch = todo.slice(i, i + AI_BATCH);
    const r = await fetch(MK_URL, { method: "POST", headers: H, body: JSON.stringify({ items: batch.map((b) => ({ term: b.term, meaning: b.meaning })) }) });
    calls++;
    if (!r.ok) { console.log(`  ❌ HTTP ${r.status}`); continue; }
    const { results, error } = await r.json();
    if (error) { console.log(`  ⚠️ ${error}`); continue; }
    // make-examples 按 index 返回;逐条对回 batch
    for (const g of results || []) { const b = batch[(Number(g.index) || 0) - 1]; if (b && g.en) cache[b.slot] = { en: g.en, cn: g.cn || "" }; }
    writeFileSync(cachePath, JSON.stringify(cache, null, 2));
    console.log(`  ✓ ${Math.min(i + AI_BATCH, todo.length)}/${todo.length}`);
    if (i + AI_BATCH < todo.length) await sleep(1200);
  }

  // ---- 组装补丁 SQL ----
  const glossUpdates = [], exampleUpdates = [], reviewPoly = [];
  for (const term of Object.keys(POLY)) {
    const norm = normalize(term);
    glossUpdates.push(`UPDATE public.phrase_explanations SET explanation = jsonb_set(explanation, '{gloss_cn}', '${sqlEsc(JSON.stringify(POLY[term].gloss))}'::jsonb, true), updated_at = now() WHERE normalized = '${sqlEsc(norm)}' AND target_lang = 'read-v1';`);
    reviewPoly.push({ term, gloss: POLY[term].gloss });
  }
  const reviewEx = [];
  for (const term of glossOf.keys()) {
    let ex;
    if (POLY[term]) {
      const a = cache[`${term}#0`], b = cache[`${term}#1`];
      if (!a || !b) continue;
      ex = { en: `${a.en} / ${b.en}`, cn: `${a.cn} / ${b.cn}` };
    } else { ex = cache[term]; if (!ex) continue; }
    const norm = normalize(term);
    exampleUpdates.push(`UPDATE public.phrase_explanations SET explanation = jsonb_set(explanation, '{example}', '${sqlEsc(JSON.stringify(ex))}'::jsonb, true), updated_at = now() WHERE normalized = '${sqlEsc(norm)}' AND target_lang = 'read-v1';`);
    reviewEx.push({ term, poly: !!POLY[term], en: ex.en, cn: ex.cn });
  }

  const sql = `-- 图书馆精读 · 合并修复补丁:${book.title}
-- ① 多义卡释义含两义(${glossUpdates.length} 张)② 全部卡例句去重补新造(${exampleUpdates.length} 张,按term去重)。
-- 只 jsonb_set 改 gloss_cn / example,不动主键/读路径。幂等。⚠️ 旧 library-examples-*-all.sql 作废别跑。
BEGIN;
-- 多义释义补丁
${glossUpdates.join("\n")}
-- 例句补丁(去重,匹配释义,新造不同场景)
${exampleUpdates.join("\n")}
COMMIT;
`;
  writeFileSync(`SQLAA/library-fix-${key}.sql`, sql);

  const esc = (s) => String(s ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
  let md = `# 图书馆精读 · 合并修复待审 · ${book.title}

> ① 多义卡释义含两义 ② 例句去重+新造不同场景+匹配释义。未落库。**旧 examples all.sql 作废。**

## 一、多义卡释义(${reviewPoly.length} 张:单词17 + 语块? ── 逐条审)
| term | 新释义(含两义) |
|---|---|
${reviewPoly.map((r) => `| **${esc(r.term)}** | ${esc(r.gloss)} |`).join("\n")}

## 二、多义卡的两义例句抽样
| term | 两义例句(各对一义) |
|---|---|
${reviewEx.filter((r) => r.poly).map((r) => `| **${esc(r.term)}** | ${esc(r.en)} — ${esc(r.cn)} |`).join("\n")}

## 三、单义卡例句抽样(前20)
| term | 新例句 |
|---|---|
${reviewEx.filter((r) => !r.poly).slice(0, 20).map((r) => `| ${esc(r.term)} | ${esc(r.en)} — ${esc(r.cn)} |`).join("\n")}

## 四、统计
- 多义释义补丁:${glossUpdates.length} · 例句补丁(去重):${exampleUpdates.length} · make-examples 调用:${calls}
`;
  mkdirSync("REVIEWAA/图书馆词表", { recursive: true });
  writeFileSync(`REVIEWAA/图书馆词表/${key}-fix-review.md`, md);
  console.log(`\n✓ SQLAA/library-fix-${key}.sql(释义 ${glossUpdates.length} + 例句 ${exampleUpdates.length})`);
  console.log(`✓ REVIEWAA/图书馆词表/${key}-fix-review.md;make-examples 调用 ${calls}`);
}
run();
