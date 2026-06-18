// 由 phrase JSON 生成幂等 UPDATE SQL,按 word_id 精确回填 junior_vocab.phrase_en。
// 用法: node scripts/gen-phrase-update.mjs <input.json> <output.sql>
//   默认: scripts/_phrase_8A_U1.json → scripts/phrase-8A-U1-update.sql
import fs from "node:fs";
const IN = process.argv[2] || "scripts/_phrase_8A_U1.json";
const OUT = process.argv[3] || "scripts/phrase-8A-U1-update.sql";
const rows = JSON.parse(fs.readFileSync(IN, "utf8"));
const sq = (s) => String(s).replace(/'/g, "''");

// 校验:phrase 不该是整句(无句末标点),不该含 sb/sth 占位,长度合理
const warn = [];
for (const r of rows) {
  const p = r.phrase_en.trim();
  if (/[.?!]$/.test(p)) warn.push(`${r.word}: 句末标点(疑似整句) "${p}"`);
  if (/\b(sb|sth)\b/i.test(p)) warn.push(`${r.word}: 含 sb/sth 占位 "${p}"`);
  if (p.split(/\s+/).length > 6) warn.push(`${r.word}: 超 6 词(疑似句) "${p}"`);
}
if (warn.length) { console.error("⚠️ 质量告警:\n  " + warn.join("\n  ")); }

let out =
  "-- 8A U1 试点:回填 junior_vocab.phrase_en(英文短语/语块)。幂等:按 word_id 精确 UPDATE,可重跑。\n" +
  "-- 前置:必须先跑 ALTER TABLE ... ADD COLUMN phrase_en text;\n\n";
for (const r of rows) {
  out += `UPDATE public.junior_vocab SET phrase_en = '${sq(r.phrase_en.trim())}' WHERE word_id = '${sq(r.word_id)}';\n`;
}
out += `\n-- 校验:本单元已回填条数(应 = ${rows.length})\n`;
out += `SELECT count(*) FILTER (WHERE phrase_en IS NOT NULL) AS filled, count(*) AS total\n`;
out += `FROM public.junior_vocab WHERE grade = 8 AND volume = '8A' AND unit = 'U1';\n`;
fs.writeFileSync(OUT, out);
console.log(`生成 ${rows.length} 条 UPDATE → ${OUT}` + (warn.length ? `  (${warn.length} 条质量告警)` : "  (无告警)"));
