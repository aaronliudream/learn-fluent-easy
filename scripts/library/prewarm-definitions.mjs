/**
 * 图书馆精读 · 单词轻词义预生成 v2(带语境)。
 *
 * ⚠️ 修设计缺陷:释义(zh)一律由 AI 结合【出处句】生成,不再抄 junior_vocab 通用释义
 *   (通用释义不看语境 → sweep/country/bank 这类多义常见词给错义,误导孩子)。
 *   音标(ipa)、词性(pos)仍可用 junior_vocab(不随语境变);专名跳过;虚词走内置表。
 *
 * 分档:① 专名跳过 ② 虚词内置表(无语境歧义)③ 其余内容词 → define-words(传出处句)。
 * 去重优化:同一词跨章只生成一次(取首次出现章的语境);缓存每章 AI 输出 → 重跑0调用。
 * 落库:read-v1 upsert **覆盖**旧的词表档释义。
 *
 * 用法:
 *   node scripts/library/prewarm-definitions.mjs wizard-of-oz 1        # 单章
 *   node scripts/library/prewarm-definitions.mjs wizard-of-oz --all    # 全书:每章review + 合并SQL
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env", "utf8").split(/\r?\n/).filter((l) => l.includes("=")).map((l) => {
    const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")];
  }));
const SUP = env.VITE_SUPABASE_URL, ANON = env.VITE_SUPABASE_PUBLISHABLE_KEY;
const H = { apikey: ANON, Authorization: `Bearer ${ANON}`, "Content-Type": "application/json" };
const DEFINE_URL = `${SUP}/functions/v1/define-words`;
const TARGET_LANG = "read-v1", AI_BATCH = 30;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const key = process.argv[2], arg = process.argv[3];
if (!key || !arg) { console.error("用法: node scripts/library/prewarm-definitions.mjs <book_key> <chapter|--all>"); process.exit(1); }

const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9' ]+/g, " ").replace(/\s+/g, " ").trim();
const sqlEsc = (s) => String(s).replace(/'/g, "''");
const tap = (sentence) => {
  const parts = sentence.replace(/<[^>]*>/g, "").split(/(\s+|[.,!?;:"'()\-—…])/g).filter((p) => p !== "");
  const out = []; for (const p of parts) if (/^[A-Za-z][A-Za-z'\-]*$/.test(p)) out.push(p.toLowerCase());
  return out;
};
const GRAMMAR = {
  the:["art.","那/这个"], a:["art.","一个"], an:["art.","一个"], of:["prep.","……的"], to:["prep.","到;向"],
  in:["prep.","在……里"], on:["prep.","在……上"], at:["prep.","在(某处/时)"], and:["conj.","和;而且"], or:["conj.","或者"],
  but:["conj.","但是"], for:["prep.","为了;给"], with:["prep.","和;用"], as:["prep.","作为;像"], by:["prep.","通过;在旁"],
  from:["prep.","从"], this:["pron.","这个"], that:["pron.","那个"], these:["pron.","这些"], those:["pron.","那些"],
  is:["v.","是"], are:["v.","是"], was:["v.","是(过去)"], were:["v.","是(过去)"], be:["v.","是"], been:["v.","是(过去分词)"],
  am:["v.","是"], he:["pron.","他"], she:["pron.","她"], it:["pron.","它"], they:["pron.","他们"], we:["pron.","我们"],
  you:["pron.","你/你们"], his:["pron.","他的"], her:["pron.","她的;她"], its:["pron.","它的"], their:["pron.","他们的"],
  our:["pron.","我们的"], your:["pron.","你的"], not:["adv.","不"], no:["adv.","不;没有"], do:["v.","做(助动)"],
  does:["v.","做(助动)"], did:["v.","做(过去/助动)"], has:["v.","有"], have:["v.","有"], had:["v.","有(过去)"],
  will:["v.","将;会"], would:["v.","将;会"], can:["v.","能"], could:["v.","能"], so:["adv.","所以;这么"], if:["conj.","如果"],
  then:["adv.","然后"], than:["conj.","比"], there:["adv.","那里"], here:["adv.","这里"], where:["adv.","哪里"],
  when:["adv.","当……时"], who:["pron.","谁"], what:["pron.","什么"], which:["pron.","哪个"], how:["adv.","怎样"],
  why:["adv.","为什么"], all:["adj.","所有的"], any:["adj.","任何的"], some:["adj.","一些"],
};

const book = JSON.parse(readFileSync(`scripts/library/books/${key}.json`, "utf8"));
const flat = []; let seq = 0;
for (const ch of book.chapters) for (const p of ch.paragraphs) for (const s of p) { seq += 1; flat.push({ seq, ci: ch.idx, en: s.en }); }

const capMid = new Map(), lowMid = new Map();
for (const s of flat) (s.en.match(/[A-Za-z]+(?:'[A-Za-z]+)?/g) || []).forEach((t, i) => {
  if (i === 0) return; const lw = t.toLowerCase();
  if (/^[A-Z]/.test(t)) capMid.set(lw, 1); else lowMid.set(lw, 1);
});
const isProper = (lw) => capMid.has(lw) && !lowMid.has(lw) && lw !== "i";

/** 某章:内容词(去重,非专名非虚词)→ 首次出处句(该章内首现)。 */
function chapterContent(ci) {
  const firstCtx = new Map();
  for (const s of flat) if (s.ci === ci) for (const w of tap(s.en)) {
    if (w.length < 2 && w !== "a") continue;
    if (isProper(w) || GRAMMAR[w]) continue;
    if (!firstCtx.has(w)) firstCtx.set(w, s.en);
  }
  return firstCtx; // Map word → context sentence
}

// junior/primary 只取 ipa/pos(不取释义)。
async function fetchDictIpaPos(words) {
  const map = new Map(); const uniq = [...new Set(words)]; const CH = 90;
  for (let i = 0; i < uniq.length; i += CH) {
    const inList = uniq.slice(i, i + CH).map((w) => `"${w.replace(/"/g, "")}"`).join(",");
    for (const [tbl, ipaCol] of [["junior_vocab", "phonetic"], ["primary_vocab", "ipa"]]) {
      try {
        const r = await fetch(`${SUP}/rest/v1/${tbl}?select=word,pos,${ipaCol}&order=grade.asc&word=in.(${encodeURIComponent(inList)})`, { headers: H });
        for (const row of (await r.json()) || []) {
          const w = String(row.word).toLowerCase();
          if (!map.has(w)) map.set(w, { pos: row.pos || "", ipa: row[ipaCol] || "" });
        }
      } catch { /* ignore */ }
    }
  }
  return map;
}

async function defineWords(items) {
  const r = await fetch(DEFINE_URL, { method: "POST", headers: H, body: JSON.stringify({ words: items }) });
  if (!r.ok) { console.log(`  ❌ define-words HTTP ${r.status}`); return []; }
  const { results, error } = await r.json();
  if (error) { console.log(`  ⚠️ ${error}`); return []; }
  return results || [];
}

const CACHE_DIR = `scripts/library/books/${key}-defs-cache`;
mkdirSync(CACHE_DIR, { recursive: true });

/** 生成某章【新词】的 AI 结果(带语境),用缓存;返回 Map word→{pos,ipa,gloss_cn,ex_en,ex_cn}。 */
async function genChapter(ci, newWords, ctx) {
  const cachePath = `${CACHE_DIR}/ch${ci}.json`;
  const cache = existsSync(cachePath) ? JSON.parse(readFileSync(cachePath, "utf8")) : {};
  const todo = newWords.filter((w) => !cache[w]);
  let calls = 0;
  for (let i = 0; i < todo.length; i += AI_BATCH) {
    const batch = todo.slice(i, i + AI_BATCH).map((w) => ({ word: w, context: ctx.get(w) || "" }));
    const res = await defineWords(batch); calls++;
    for (const g of res) {
      const w = (g.word || "").toLowerCase();
      if (!newWords.includes(w)) continue;
      cache[w] = { pos: g.pos || "", ipa: g.ipa || "", gloss_cn: g.gloss_cn || "", ex_en: g.example_en || "", ex_cn: g.example_cn || "" };
    }
    writeFileSync(cachePath, JSON.stringify(cache, null, 2));
    if (i + AI_BATCH < todo.length) await sleep(1200);
  }
  return { cache, calls };
}

function esc(s) { return String(s ?? "").replace(/\|/g, "\\|").replace(/\n/g, " "); }
function chapterReview(ci, cards, ctx) {
  let md = `# 图书馆精读 单词轻词义(带语境)· 待审 · ${book.title} 第 ${ci} 章

> ⚠️ 释义一律由 AI 结合出处句生成(修:不再抄词表通用义,防多义词给错义)。ipa/pos 用 junior_vocab。
> 未落库;target_lang='${TARGET_LANG}'。**重点核对多义词是否符合本句语境**(如 sweep / country / light / spring)。

## 一、统计
- 本章新内容词:**${cards.length}**(去重后;跨章已生成的不重跑)· AI 调用见末尾

## 二、完整清单(词 / 词性 / 音标 / 语境中文释义 / 出处句)
| # | 词 | 词性 | 音标 | 中文(本句语境) | 出处英文原句 |
|---|---|---|---|---|---|
`;
  cards.forEach((c, i) => { md += `| ${i + 1} | **${esc(c.word)}** | ${esc(c.pos)} | ${esc(c.ipa)} | ${esc(c.gloss_cn)} | ${esc((ctx.get(c.word) || "").slice(0, 70))} |\n`; });
  md += `\n## 三、边界\n只产文件+SQL(你跑);未落库、未改收藏/读路径、未合main、未动P0、未碰掌握表。\n`;
  mkdirSync("REVIEWAA/图书馆词表", { recursive: true });
  writeFileSync(`REVIEWAA/图书馆词表/${key}-ch${ci}-defs-review.md`, md);
}

(async () => {
  const chapters = arg === "--all" ? book.chapters.map((c) => c.idx) : [Number(arg)];
  const seen = new Set(); // 跨章去重(本次运行内);不预置库中旧词表档 → 全量覆盖
  let totalCalls = 0, totalCards = 0;
  const rows = [];
  for (const ci of chapters) {
    const ctx = chapterContent(ci);
    const words = [...ctx.keys()];
    const newWords = words.filter((w) => !seen.has(w));
    newWords.forEach((w) => seen.add(w));
    const dict = await fetchDictIpaPos(newWords);
    const { cache, calls } = await genChapter(ci, newWords, ctx);
    totalCalls += calls;
    const cards = [];
    for (const w of newWords) {
      const ai = cache[w]; if (!ai || !ai.gloss_cn) continue; // 无释义跳过
      const d = dict.get(w) || {};
      const card = {
        word: w,
        pos: ai.pos || d.pos || "",     // 词性=AI(带语境!sweep n. vs v. 会变);词表兜底
        ipa: d.ipa || ai.ipa || "",     // 音标=词表优先(真不随语境变);AI 兜底
        gloss_cn: ai.gloss_cn,          // 释义=AI 带语境
        example: ai.ex_en ? { en: ai.ex_en, cn: ai.ex_cn || "" } : null,
        src: "ai-ctx",
      };
      cards.push(card);
      rows.push({ word: w, norm: normalize(w), expl: card });
    }
    totalCards += cards.length;
    chapterReview(ci, cards, ctx);
    console.log(`  ch${ci}: 新词 ${cards.length}(AI 调用 ${calls})`);
  }

  const values = rows.map((r) => `  ('${sqlEsc(r.word)}', '${sqlEsc(r.norm)}', 'en', '${TARGET_LANG}', '${sqlEsc(JSON.stringify(r.expl))}'::jsonb)`).join(",\n");
  const suffix = arg === "--all" ? "all" : `ch${arg}`;
  const sql = `-- 图书馆精读 单词轻词义(带语境)· ${book.title} · ${chapters.length} 章 · ${rows.length} 词(跨章去重)
-- ⚠️ 释义由 AI 结合出处句生成,**覆盖**旧词表档通用义(修多义词给错义的设计缺陷)。幂等 upsert 覆盖。
BEGIN;
INSERT INTO public.phrase_explanations (phrase, normalized, source_lang, target_lang, explanation)
VALUES
${values}
ON CONFLICT (normalized, target_lang) DO UPDATE SET phrase=EXCLUDED.phrase, explanation=EXCLUDED.explanation, updated_at=now();
COMMIT;
`;
  writeFileSync(`SQLAA/library-dict-${key}-${suffix}.sql`, sql);
  console.log(`\n✓ SQLAA/library-dict-${key}-${suffix}.sql — ${rows.length} 词(带语境释义,覆盖旧义)`);
  console.log(`✓ ${chapters.length} 章 review → REVIEWAA/图书馆词表/`);
  console.log(`新词合计 ${totalCards};本次 AI 调用 ${totalCalls}`);
})();
