// 图书馆点词词典 SQL 生成器:吃 subagent 产的 dict-data/<key>/out/batch*.json,硬校验 + 去重 + 出 SQL + 审稿 md。
// 用法:node scripts/library/_gen-dict-sql.mjs <book_key>
// 卡结构(严格 = read-v1 现有词卡):explanation = { ipa, pos, word, example:{en,cn}, gloss_cn }
// upsert 进 public.phrase_explanations(normalized, target_lang='read-v1')。冷词专用,ON CONFLICT DO UPDATE(我们的手写卡覆盖运行时生成的)。
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from "node:fs";

const KEY = process.argv[2];
if (!KEY) { console.error("用法: node scripts/library/_gen-dict-sql.mjs <book_key> [minBatch]"); process.exit(1); }
// minBatch:只处理 batchNN(NN>=minBatch)。缺口 SQL 单出用(老卡 batch01-19 未补 gloss_en,先只出 batch20+)。
const minBatch = Number(process.argv[3]) || 0;
const GAP = minBatch > 0;
const outDir = `scripts/library/books/dict-data/${KEY}/out`;
if (!existsSync(outDir)) { console.error(`✗ 缺目录 ${outDir}`); process.exit(1); }
const files = readdirSync(outDir)
  .filter((f) => /^batch\d+\.json$/.test(f) && Number(f.match(/\d+/)[0]) >= minBatch)
  .sort();
if (!files.length) { console.error(`✗ ${outDir} 无 batch*.json`); process.exit(1); }

const book = JSON.parse(readFileSync(`scripts/library/books/${KEY}.json`, "utf8"));
const BOOK_ZH = book.zh_title || book.title_zh || KEY;

// 归一化(= explain-phrase normalize / 收藏键):小写、弯撇号折 ASCII、去非 [a-z0-9' ]、压空白。
const cardNorm = (s) => String(s).toLowerCase().replace(/[’]/g, "'").replace(/[^a-z0-9' ]+/g, " ").replace(/\s+/g, " ").trim();
const sqlEsc = (s) => String(s).replace(/'/g, "''");

// ---- 收集 + 硬校验 ----
const errs = [];
const cards = [];       // {word, normalized, ipa, pos, gloss_cn, ex_en, ex_cn}
const seen = new Set();
let dupN = 0, skippedTotal = 0;
for (const f of files) {
  let data;
  try { data = JSON.parse(readFileSync(`${outDir}/${f}`, "utf8")); }
  catch (e) { errs.push(`${f}: JSON 解析失败 ${e.message}`); continue; }
  skippedTotal += (data.skipped || []).length;
  for (const c of data.cards || []) {
    const w = (c.word || "").trim();
    if (!w) { errs.push(`${f}: 空 word`); continue; }
    for (const k of ["ipa", "pos", "gloss_cn", "gloss_en", "sense_key", "ex_en", "ex_cn"]) {
      if (!c[k] || !String(c[k]).trim()) errs.push(`${f}/${w}: 缺 ${k}`);
    }
    if (/[。.]$/.test(String(c.gloss_cn || "").trim())) errs.push(`${f}/${w}: gloss_cn 末尾带句号`);
    if (/[.]$/.test(String(c.gloss_en || "").trim())) errs.push(`${f}/${w}: gloss_en 末尾带句号`);
    if (c.ex_en && c.gloss_cn && cardNorm(c.ex_en) === cardNorm(w)) errs.push(`${f}/${w}: 例句退化为孤词`);
    const n = cardNorm(w);
    if (!n) { errs.push(`${f}: word "${w}" 归一化后为空`); continue; }
    if (seen.has(n)) { dupN++; continue; }   // 跨批去重(首个胜)
    seen.add(n);
    cards.push({ word: w, normalized: n, ipa: c.ipa, pos: c.pos, gloss_cn: c.gloss_cn, gloss_en: c.gloss_en, sense_key: String(c.sense_key).toLowerCase().trim(), ex_en: c.ex_en, ex_cn: c.ex_cn });
  }
}
if (errs.length) { console.error(`✗ ${KEY} 词卡校验失败 ${errs.length} 处:`); errs.slice(0, 40).forEach((e) => console.error("  " + e)); process.exit(1); }

// ---- 生成 SQL ----
const mkExpl = (c) => ({ ipa: c.ipa, pos: c.pos, word: c.word, example: { en: c.ex_en, cn: c.ex_cn }, gloss_cn: c.gloss_cn, gloss_en: c.gloss_en, sense_key: c.sense_key });
const rows = cards.map((c) => `  ('${sqlEsc(c.word)}', '${sqlEsc(c.normalized)}', 'en', 'read-v1', '${sqlEsc(JSON.stringify(mkExpl(c)))}'::jsonb)`);
const sql = `-- ============================================================================
-- 图书馆点词词典冷词补全 · ${BOOK_ZH}(CC子代理手写·不走AI边缘·待Aaron/Web审后跑)
-- 与 REVIEWAA/图书馆词表/${KEY}-dict-review.md 一致。仅补全局 read-v1 里还没有的冷词。
-- read-v1 词卡 ${rows.length} 张(跨批去重 ${dupN})。normalized 唯一,幂等 upsert(手写卡覆盖运行时生成)。
-- ============================================================================
BEGIN;
SELECT 'before' AS phase,
  (SELECT count(*) FROM public.phrase_explanations WHERE target_lang='read-v1') AS readv1_cards;

INSERT INTO public.phrase_explanations (phrase, normalized, source_lang, target_lang, explanation)
VALUES
${rows.join(",\n")}
ON CONFLICT (normalized, target_lang) DO UPDATE SET phrase=EXCLUDED.phrase, explanation=EXCLUDED.explanation, updated_at=now();

SELECT 'after' AS phase,
  (SELECT count(*) FROM public.phrase_explanations WHERE target_lang='read-v1') AS readv1_cards;
COMMIT;
`;
writeFileSync(`SQLAA/library-dict-${KEY}${GAP ? "-gap" : ""}.sql`, sql);

// ---- 审稿 md ----
const rowsMd = cards.map((c) => `| **${c.word}** | ${c.ipa} | ${c.pos} | ${c.gloss_cn} | ${c.gloss_en} | ${c.sense_key} | ${c.ex_en} | ${c.ex_cn} |`);
const md = `# ${BOOK_ZH} · 点词词典冷词卡 — 待审(${cards.length} 张)

> **CC 子代理手写**(不走 AI 边缘,零配额)。只补全局 read-v1 词典里**还没有**的冷词(书中出现·频次≥2·已滤专名)。判据:太基础的初中词已跳过;每张卡英式音标+书中义+新造例句。
> 产物:\`SQLAA/library-dict-${KEY}.sql\`(${rows.length} 张,幂等 upsert,**未跑**)。审:①该不该收(太基础/专名漏网)②释义贴不贴书中义③音标④例句。

## 自查基线
| 项 | 结果 |
|---|---|
| 缺 ipa/pos/gloss/例句 | **0**(生成器硬卡) |
| 跨批重复 normalized | 去重 ${dupN} |
| 子代理判为太基础/专名而跳过 | ${skippedTotal} 词 |

## 词卡清单(${cards.length} 张)
| 词 | 音标 | 词性 | 释义(书中义) | 英语释义(gloss_en) | sense_key | 例句(新造) | 例句中译 |
|---|---|---|---|---|---|---|---|
${rowsMd.join("\n")}

## 请你审 / 定
1. 边界:有没有太基础该踢的?有没有专名漏网?
2. 释义:贴书里的义没?音标准没?例句简单没、没抄书没?
3. 审过 → Aaron 跑 \`SQLAA/library-dict-${KEY}.sql\`(幂等,无需重部署 edge)→ 书里点这些词秒出卡带音标。

> 边界:只产文件+SQL(Aaron 跑);未落库、未动读路径/收藏。绝不写那三张词汇表。
`;
mkdirSync("REVIEWAA/图书馆词表", { recursive: true });
writeFileSync(`REVIEWAA/图书馆词表/${KEY}-dict${GAP ? "-gap" : ""}-review.md`, md);

console.log(`✓ ${KEY} 词典:${cards.length} 张卡(跨批去重 ${dupN}·跳过 ${skippedTotal})← ${files.length} 批`);
console.log(`  → SQLAA/library-dict-${KEY}${GAP ? "-gap" : ""}.sql + REVIEWAA/图书馆词表/${KEY}-dict${GAP ? "-gap" : ""}-review.md`);
