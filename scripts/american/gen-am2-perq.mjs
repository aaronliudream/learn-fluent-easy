/**
 * AM2 逐题解释落库生成器 —— 源 md(stage/seq 键 + 定稿解释)→ 现查 DB 映射 qid → perq SQL。
 * 【perq 铁律】现查 DB(非缓存)· 前置 qid 存在性校验 · 头部写命中 N/N + 时间 + 三重校验结果。
 * 三重校验:① (stage,seq)→qid 全命中;② DB 答案词出现在解释中(宽松归一,不命中则 flag);
 *          ③ 情景题(s8/s9/s10 Q5-Q6)解释零语法术语(防串味)。
 * 用法: node scripts/american/gen-am2-perq.mjs <lesson_id> <src.md> <out.sql>
 */
import { readFileSync, writeFileSync } from "node:fs";

const clean = (s) => (s || "").trim().replace(/^["']|["']$/g, "");
let env = ""; for (const f of [".env", ".env.local"]) { try { env += readFileSync(f, "utf8") + "\n"; } catch { /* */ } }
const URL = clean(process.env.VITE_SUPABASE_URL || (env.match(/VITE_SUPABASE_URL\s*=\s*(.+)/) || [])[1]);
const KEY = clean(process.env.VITE_SUPABASE_PUBLISHABLE_KEY || (env.match(/VITE_SUPABASE_(?:ANON|PUBLISHABLE)_KEY\s*=\s*(.+)/) || [])[1]);
const H = { apikey: KEY, Authorization: `Bearer ${KEY}` };
const get = async (p) => (await fetch(`${URL}/rest/v1/${p}`, { headers: H })).json();

const [lid, src, out] = process.argv.slice(2);
if (!lid || !src || !out) { console.error("用法: gen-am2-perq.mjs <lesson_id> <src.md> <out.sql>"); process.exit(1); }

// 解析源:### sN seqM | ans: <answer>  +  后续行=解释
const text = readFileSync(src, "utf8");
const items = [];
const re = /###\s*s(\d+)\s+seq(\d+)\s*\|\s*ans:\s*(.+?)\n([\s\S]*?)(?=\n###\s*s\d+\s+seq|\s*$)/g;
let m;
while ((m = re.exec(text)) !== null) {
  items.push({ stage: +m[1], seq: +m[2], ans: m[3].trim(), exp: m[4].trim() });
}

// 现查 DB
const rows = await get(`american_questions?select=id,stage,seq,qtype,payload&lesson_id=eq.${lid}`);
const key = (st, sq) => `${st}:${sq}`;
const dbMap = new Map(rows.map((r) => [key(r.stage, r.seq), r]));
const answerOf = (p) => (p.answer_text != null ? p.answer_text : (Array.isArray(p.options) && p.answer_index != null ? p.options[p.answer_index] : ""));
const norm = (s) => String(s).toLowerCase().replace(/[\s.,!?"'’—-…()（）。,、!?]/g, "");

// 校验
const flags = { missing: [], ansWord: [], term: [] };
const TERMS = ["主语", "谓语", "宾语", "系动词", "表语", "情态动词", "助动词", "句型", "宾补", "宾语补足语", "时态", "否定句", "疑问句", "主系表", "及物", "不及物", "双宾"];
const scenarioSeqs = new Set(["8:1", "8:2", "8:3", "9:1", "9:2", "9:3", "10:5", "10:6"]);
let hit = 0;
for (const it of items) {
  const r = dbMap.get(key(it.stage, it.seq));
  if (!r) { flags.missing.push(`s${it.stage} seq${it.seq}`); continue; }
  hit++;
  it.qid = r.id;
  const dbAns = answerOf(r.payload);
  // ② 答案词命中(宽松:归一后 DB 答案是解释归一的子串)
  if (!norm(it.exp).includes(norm(dbAns))) flags.ansWord.push(`s${it.stage} seq${it.seq}: DB答案「${dbAns}」未在解释中(宽松)命中`);
  // ③ 情景题防串味
  if (scenarioSeqs.has(key(it.stage, it.seq))) {
    const bad = TERMS.filter((t) => it.exp.includes(t));
    if (bad.length) flags.term.push(`s${it.stage} seq${it.seq}: 情景解释含术语 [${bad.join(",")}]`);
  }
}

// 出 SQL
const sq = (s) => "'" + String(s).replace(/'/g, "''") + "'";
const now = new Date().toISOString();
const lines = [
  `-- AM2 ${lid} 逐题解释 perq + play题干修正(生成器 gen-am2-perq.mjs 产出)`,
  `-- ✅ 现查 DB(非缓存)· (stage,seq)→qid 命中 ${hit}/${items.length} · 生成时间 ${now}`,
  `-- 三重校验:答案词未命中 ${flags.ansWord.length} 处(见下)· 情景串味 ${flags.term.length} 处 · 幂等 payload||explanation_cn`,
  `-- Aaron service role 跑;前 with_expl=0 → 后 ${items.length}。`,
  "BEGIN;",
];
// play 题干修正(s5 seq10)
const play = dbMap.get("5:10");
if (play) lines.push(`UPDATE public.american_questions SET payload = payload || jsonb_build_object('stem', ${sq("哪句的 play 后面没有宾语(动作的对象),意思也完整?")}) WHERE id = '${play.id}';`);
// 42 条解释
for (const it of items) {
  if (!it.qid) continue;
  lines.push(`UPDATE public.american_questions SET payload = payload || jsonb_build_object('explanation_cn', ${sq(it.exp)}) WHERE id = '${it.qid}';`);
}
// 改后核对
lines.push(`SELECT '带解释题数(应 ${items.length})' AS label, count(*) AS n FROM public.american_questions WHERE lesson_id='${lid}' AND payload ? 'explanation_cn';`);
lines.push(`SELECT 'play题现行题干' AS label, payload->>'stem' AS stem FROM public.american_questions WHERE id='${play?.id}';`);
lines.push("COMMIT;", "");
writeFileSync(out, lines.join("\n"), "utf8");

// 报告
console.log(`✅ (stage,seq)→qid 命中 ${hit}/${items.length} · 生成时间 ${now}`);
console.log(`play 题干修正: s5 seq10 → "哪句的 play 后面没有宾语(动作的对象),意思也完整?"`);
if (flags.missing.length) { console.log("❌ 未命中:", flags.missing.join(", ")); process.exit(1); }
console.log(`\n三重校验:`);
console.log(` ② 答案词未命中(宽松,需人工核是否改写措辞):`, flags.ansWord.length ? "\n   " + flags.ansWord.join("\n   ") : "全部命中 ✓");
console.log(` ③ 情景题串味:`, flags.term.length ? "\n   " + flags.term.join("\n   ") : "无术语 ✓");
console.log(`\n写出 ${out}`);
