// 通用图书馆语块生成器:吃 subagent 产的 chunk-data/<key>/ch<N>.json,硬校验 + 跨章去重 + 出 SQL + 审稿 md。
// 用法:node scripts/library/_gen-chunks-sql.mjs <book_key> <chapter>
//   (旧法 `<chapter>` 仍支持 → 默认 tom-sawyer,数据走扁平 chunk-data/ch<N>.json)
// 数据契约(chunk-data/<key>/ch<N>.json):
//   { chapter, chunks:[{head,gloss,ipa,note,literal:[{word,meaning_cn,note_cn?}],ex_en,ex_cn,occ:[[seq,"surface"]],
//                        cardOnly?,key?,exSeq?}], skipped:[...] }
// 规则同 ch1/ch2:例句禁抄原文(硬卡)、surface 逐字连续在出处句(硬卡)、literal 必填、跨章 ch1..N-1 已建卡只补索引。
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";

// 参数弹性:两个参数 = <key> <chapter>;只有一个数字 = 老 Tom 调用法(key=tom-sawyer)。
let KEY, CH;
if (process.argv[3] != null && Number.isNaN(Number(process.argv[2]))) { KEY = process.argv[2]; CH = Number(process.argv[3]); }
else { KEY = "tom-sawyer"; CH = Number(process.argv[2]); }
if (!KEY || !CH || CH < 1) { console.error("用法: node scripts/library/_gen-chunks-sql.mjs <book_key> <chapter>"); process.exit(1); }
// 数据文件:优先书内 scoped 目录 chunk-data/<key>/ch<N>.json;回退扁平(Tom 历史)。
const dataPath = existsSync(`scripts/library/books/chunk-data/${KEY}/ch${CH}.json`)
  ? `scripts/library/books/chunk-data/${KEY}/ch${CH}.json`
  : `scripts/library/books/chunk-data/ch${CH}.json`;
if (!existsSync(dataPath)) { console.error(`✗ 缺数据文件 ${dataPath}`); process.exit(1); }
const data = JSON.parse(readFileSync(dataPath, "utf8"));
const chunks = data.chunks || [];

const book = JSON.parse(readFileSync(`scripts/library/books/${KEY}.json`, "utf8"));
const BOOK_ZH = book.zh_title || book.title_zh || KEY;
const enBySeq = new Map(), cnBySeq = new Map();
let seq = 0;
for (const ch of book.chapters) for (const p of ch.paragraphs) for (const s of p) { seq += 1; enBySeq.set(seq, s.en); cnBySeq.set(seq, s.cn ?? ""); }

// 跨章去重:读 ch1..ch(N-1) 已建卡的 normalized
const priorNorm = new Set();
for (let i = 1; i < CH; i++) {
  const f = `SQLAA/library-chunks-${KEY}-ch${i}.sql`;
  if (!existsSync(f)) continue;
  const sql = readFileSync(f, "utf8");
  const rx = /^\s*\('(?:[^']|'')*',\s*'((?:[^']|'')*)',\s*'en',\s*'read-v1'/gm;
  let m; while ((m = rx.exec(sql))) priorNorm.add(m[1].replace(/''/g, "'"));
}

// 卡键(读取端):折 U+2019→ASCII '、去连字符,同 explain-phrase normalize。用于 card normalized + 去重 + 校验。
const cardNorm = (s) => String(s).toLowerCase().replace(/[’]/g, "'").replace(/[^a-z0-9' ]+/g, " ").replace(/\s+/g, " ").trim();
// 索引词(正文下划线):保连字符、ASCII '→弯撇号(正文用 U+2019),匹配 tokenize 对正文 token 的精确比对。
const idxTerm = (s) => String(s).toLowerCase().replace(/[']/g, "’").replace(/[^a-z0-9’\- ]+/g, " ").replace(/\s+/g, " ").trim();
const normSent = (s) => (s || "").toLowerCase().replace(/[’]/g, "'").replace(/[^a-z0-9' ]+/g, " ").replace(/\s+/g, " ");
const sqlEsc = (s) => String(s).replace(/'/g, "''");

// ---- 硬校验 ----
const errs = [];
for (const c of chunks) {
  const head = c.head || (c.occ?.[0]?.[1]);
  if (!head) { errs.push(`无 head: ${JSON.stringify(c).slice(0,60)}`); continue; }
  if (!c.gloss) errs.push(`${head}: 缺 gloss`);
  if (!Array.isArray(c.literal) || !c.literal.length) errs.push(`${head}: 缺 literal`);
  if (!c.ex_en || !c.ex_cn) errs.push(`${head}: 缺例句`);
  const exSeqs = c.cardOnly ? [c.exSeq] : (c.occ || []).map(([sq]) => sq);
  for (const sq of exSeqs) {
    if (!enBySeq.has(sq)) { errs.push(`${head}: seq ${sq} 不存在`); continue; }
    if (c.ex_en && normSent(c.ex_en) === normSent(enBySeq.get(sq))) errs.push(`${head}: 例句=原文出处句 seq ${sq}`);
  }
  if (!c.cardOnly) for (const [sq, surf] of (c.occ || [])) {
    const sent = normSent(enBySeq.get(sq));
    if (!(` ${sent} `).includes(` ${cardNorm(surf)} `)) errs.push(`${head}: surface "${surf}" 不在 seq ${sq} 正文`);
  }
}
if (errs.length) { console.error(`✗ ch${CH} 校验失败 ${errs.length} 处:`); errs.forEach((e) => console.error("  " + e)); process.exit(1); }

// ---- 生成 SQL ----
const cardRows = [], idxRows = [], auditRows = [];
const seenNorm = new Set();
let dedupCards = 0, cardOnlyN = 0;
for (const c of chunks) {
  const head = c.head || c.occ[0][1];
  const litArr = c.literal.map((l) => l.note_cn ? { word: l.word, meaning_cn: l.meaning_cn, note_cn: l.note_cn } : { word: l.word, meaning_cn: l.meaning_cn });
  const litStr = c.literal.map((l) => `${l.word}=${l.meaning_cn}${l.note_cn ? `(${l.note_cn})` : ""}`).join("; ");
  auditRows.push(`| **${head}**${c.cardOnly ? " ⚠card-only" : ""} | ${c.gloss} | ${c.ex_en} | ${c.ex_cn} | ${litStr} |`);
  const mkExpl = (src_seqs) => ({ word: head, pos: "词块", ipa: c.ipa || "", gloss_cn: c.gloss, example: { en: c.ex_en, cn: c.ex_cn }, note: c.note || "", kind: "chunk", src_seqs, literal: litArr });
  if (c.cardOnly) {
    cardOnlyN++;
    const n = cardNorm(c.key || head);
    if (!seenNorm.has(n) && !priorNorm.has(n)) { seenNorm.add(n); cardRows.push(`  ('${sqlEsc(head)}', '${sqlEsc(n)}', 'en', 'read-v1', '${sqlEsc(JSON.stringify(mkExpl([c.exSeq])))}'::jsonb)`); }
    else if (priorNorm.has(n)) dedupCards++;
    continue;
  }
  const bySurf = new Map(); // cardNorm(卡键) → seqs
  for (const [sq, surf] of c.occ) {
    const cn = cardNorm(surf);
    if (!bySurf.has(cn)) bySurf.set(cn, []);
    bySurf.get(cn).push(sq);
    idxRows.push({ term: idxTerm(surf), seq: sq }); // 索引词保 U+2019/连字符
  }
  for (const [cn, seqs] of bySurf) {
    if (seenNorm.has(cn)) continue;
    seenNorm.add(cn);
    if (priorNorm.has(cn)) { dedupCards++; continue; }
    cardRows.push(`  ('${sqlEsc(head)}', '${sqlEsc(cn)}', 'en', 'read-v1', '${sqlEsc(JSON.stringify(mkExpl(seqs)))}'::jsonb)`);
  }
}
const ix = idxRows.map((r) => `  ((SELECT id FROM public.library_books WHERE book_key='${KEY}'), ${CH}, '${sqlEsc(r.term)}', ${r.seq}, true)`).join(",\n");

const sql = `-- ============================================================================
-- 图书馆精读语块 · ${BOOK_ZH} 第 ${CH} 章(CC亲判·不走Gemini·例句另造·待Aaron/Web审后跑)
-- 与 REVIEWAA/图书馆词表/${KEY}-chunks-ch${CH}-review.md 一致。跨章去重:ch1..${CH-1} 已建卡不重出(仅补索引)。
-- read-v1 卡 ${cardRows.length} 张(去掉已建 ${dedupCards} 张)/ library_chunks 索引 ${idxRows.length} 行。幂等 upsert。
-- ============================================================================
BEGIN;
SELECT 'before' AS phase,
  (SELECT count(*) FROM public.phrase_explanations WHERE target_lang='read-v1' AND explanation->>'kind'='chunk') AS chunk_cards,
  (SELECT count(*) FROM public.library_chunks lc JOIN public.library_books b ON b.id=lc.book_id WHERE b.book_key='${KEY}' AND lc.chapter_idx=${CH}) AS ch_index;

INSERT INTO public.phrase_explanations (phrase, normalized, source_lang, target_lang, explanation)
VALUES
${cardRows.join(",\n")}
ON CONFLICT (normalized, target_lang) DO UPDATE SET phrase=EXCLUDED.phrase, explanation=EXCLUDED.explanation, updated_at=now();

INSERT INTO public.library_chunks (book_id, chapter_idx, term, src_seq, is_published)
VALUES
${ix}
ON CONFLICT (book_id, chapter_idx, term, src_seq) DO NOTHING;

SELECT 'after' AS phase,
  (SELECT count(*) FROM public.phrase_explanations WHERE target_lang='read-v1' AND explanation->>'kind'='chunk') AS chunk_cards,
  (SELECT count(*) FROM public.library_chunks lc JOIN public.library_books b ON b.id=lc.book_id WHERE b.book_key='${KEY}' AND lc.chapter_idx=${CH}) AS ch_index;
COMMIT;
`;
writeFileSync(`SQLAA/library-chunks-${KEY}-ch${CH}.sql`, sql);

// ---- 审稿 md ----
const md = `# ${BOOK_ZH} · 第 ${CH} 章 语块(chunk)候选 — 待审

> **CC 亲判亲抽**(不走 Gemini,配额 429)。判据同 ch1/ch2:可迁移才收、例句另造禁抄原文、逐词 literal、可分式 card-only、跨章去重。
> 产物:\`SQLAA/library-chunks-${KEY}-ch${CH}.sql\`(${chunks.length} 条语块 / ${cardRows.length} 卡 / ${idxRows.length} 索引行,幂等 upsert,**未跑**)。审:①边界(该收/误收)②释义+例句(讲反没/简单没/没抄原文)。

## 自查基线
| 项 | 结果 |
|---|---|
| 例句抄原文 | **0**(生成器硬卡,=原文即报错退出) |
| surface 逐字命中出处句 | **全部通过**(硬卡) |
| 缺 literal / 缺例句 | **0 / 0**(硬卡) |
| 跨章重复卡 | 去重 ${dedupCards} 张(只补索引不重出) · card-only ${cardOnlyN} 条 |

## 一、语块清单(${chunks.length} 条 · 请审边界+释义+例句)
| 语块 | 释义 | 例句(另造·简单) | 例句中译 | 逐词(literal) |
|---|---|---|---|---|
${auditRows.join("\n")}

## 二、我特意没收(边界·供你复核宽没宽/漏没漏)
${(data.skipped || []).map((s) => `- ${s}`).join("\n") || "(subagent 未记)"}

## 三、请你审 / 定
1. 边界:有没有该踢的(普通词组/太基础误收)?"没收"里有没有该捞回的?
2. 释义/例句:讲反没?例句简单没、没抄原文没?可分式 card-only 判断对没?
3. 审过 → Aaron 跑 \`SQLAA/library-chunks-${KEY}-ch${CH}.sql\`(幂等,无需重部署 edge)→ :8080 第 ${CH} 章验珊瑚虚线+逐词节。

> 边界:只产文件+SQL(Aaron 跑);未落库、未改读路径/收藏、未合 main。SQL 只有 Aaron 手动跑。
`;
mkdirSync("REVIEWAA/图书馆词表", { recursive: true });
writeFileSync(`REVIEWAA/图书馆词表/${KEY}-chunks-ch${CH}-review.md`, md);

console.log(`✓ ${KEY} ch${CH}: ${chunks.length} 条 / ${cardRows.length} 卡(去重${dedupCards}) / ${idxRows.length} 索引 / card-only ${cardOnlyN}`);
console.log(`  → SQLAA/library-chunks-${KEY}-ch${CH}.sql + REVIEWAA/图书馆词表/${KEY}-chunks-ch${CH}-review.md`);
