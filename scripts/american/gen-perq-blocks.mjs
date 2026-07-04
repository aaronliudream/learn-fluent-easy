/**
 * 块格式逐题解释 md → perq SQL(payload.explanation_cn 增量,按 qid)。
 * 【perq 铁律】现查 DB(非缓存)· 前置 qid 存在性全命中校验 · 头写命中 N/N + 时间 + 答案词对账。
 * 源块格式(每 ### 块):  - qid: `uuid`  …任意行…  - 解释：<text>
 * 用法: node scripts/american/gen-perq-blocks.mjs <src.md> <out.sql>
 */
import { readFileSync, writeFileSync } from "node:fs";

const clean = (s) => (s || "").trim().replace(/^["']|["']$/g, "");
let env = ""; for (const f of [".env", ".env.local"]) { try { env += readFileSync(f, "utf8") + "\n"; } catch { /* */ } }
const URL = clean(process.env.VITE_SUPABASE_URL || (env.match(/VITE_SUPABASE_URL\s*=\s*(.+)/) || [])[1]);
const KEY = clean(process.env.VITE_SUPABASE_PUBLISHABLE_KEY || (env.match(/VITE_SUPABASE_(?:ANON|PUBLISHABLE)_KEY\s*=\s*(.+)/) || [])[1]);
const H = { apikey: KEY, Authorization: `Bearer ${KEY}` };
const get = async (p) => (await fetch(`${URL}/rest/v1/${p}`, { headers: H })).json();

const [src, out] = process.argv.slice(2);
if (!src || !out) { console.error("用法: gen-perq-blocks.mjs <src.md> <out.sql>"); process.exit(1); }
const text = readFileSync(src, "utf8");

// 按 ### 块切;每块取 qid + 答案 + 解释
const blocks = text.split(/^###\s+/m).slice(1);
const items = [];
for (const b of blocks) {
  const qid = (b.match(/qid:\s*`([0-9a-f-]{36})`/i) || [])[1];
  const ans = (b.match(/答案:\s*\*\*(.+?)\*\*/) || [])[1];
  const exp = (b.match(/解释[：:]\s*(.+?)\s*$/m) || [])[1];
  if (qid && exp) items.push({ qid, ans: (ans || "").trim(), exp: exp.trim() });
}
if (!items.length) { console.error("没解析到任何块"); process.exit(1); }

// 去重(同 qid 取最后)
const byQid = new Map();
for (const it of items) byQid.set(it.qid, it);
const uniq = [...byQid.values()];

// 现查 DB:这批 qid 是否全部存在(前置校验)
const idList = uniq.map((u) => u.qid).join(",");
const rows = await get(`american_questions?select=id,lesson_id,stage,seq,payload&id=in.(${idList})`);
const dbById = new Map(rows.map((r) => [r.id, r]));
const answerOf = (p) => (p.answer_text != null ? p.answer_text : (Array.isArray(p.options) && p.answer_index != null ? p.options[p.answer_index] : ""));
const norm = (s) => String(s).toLowerCase().replace(/[\s.,!?"'’—\-…()（）。,、！？*]/g, "");

const flags = { missing: [], ansWord: [] };
let hit = 0;
for (const u of uniq) {
  const r = dbById.get(u.qid);
  if (!r) { flags.missing.push(u.qid); continue; }
  hit++;
  const dbAns = answerOf(r.payload);
  // 答案词对账:DB 答案的首个"/"前主体是否落在解释里(宽松归一)
  const core = String(dbAns).split("/")[0];
  if (core && !norm(u.exp).includes(norm(core))) flags.ansWord.push(`${u.qid} (s${r.stage}seq${r.seq}): DB答案「${dbAns}」核心词未在解释命中`);
}

const sq = (s) => "'" + String(s).replace(/'/g, "''") + "'";
const now = new Date().toISOString();
const lines = [
  `-- am1 单元2 关6/8/9 逐题解释 perq(生成器 gen-perq-blocks.mjs 产出,勿手改;源 ${src})`,
  `-- ✅ 现查 DB(非缓存)· qid 命中 ${hit}/${uniq.length} · 生成时间 ${now}`,
  `-- 答案词对账:未命中 ${flags.ansWord.length} 处(见下注释)· 幂等 payload||explanation_cn,按 qid 精确。`,
  `-- Aaron service role 跑。前 with_expl(这批) → 后应 = ${uniq.length}。`,
  "BEGIN;",
];
for (const u of uniq) {
  if (!dbById.has(u.qid)) continue;
  lines.push(`UPDATE public.american_questions SET payload = payload || jsonb_build_object('explanation_cn', ${sq(u.exp)}) WHERE id = '${u.qid}';`);
}
for (const f of flags.ansWord) lines.push(`-- ⚠ ${f}`);
lines.push(`SELECT '这批带解释题数(应 ${uniq.length})' AS label, count(*) AS n FROM public.american_questions WHERE id IN (${uniq.map((u) => `'${u.qid}'`).join(",")}) AND payload ? 'explanation_cn';`);
lines.push("COMMIT;", "");
writeFileSync(out, lines.join("\n"), "utf8");

console.log(`解析 ${items.length} 块 → 去重 ${uniq.length} qid`);
console.log(`✅ qid 现查命中 ${hit}/${uniq.length} · ${now}`);
if (flags.missing.length) { console.log("❌ DB 中不存在(可能手抄错 qid):", flags.missing.join(", ")); process.exit(1); }
console.log("答案词对账:", flags.ansWord.length ? "\n  " + flags.ansWord.join("\n  ") : "全部命中 ✓");
console.log(`写出 ${out}`);
