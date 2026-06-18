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

// 从 word_id 解析 grade/volume/unit(如 jr-8A-U2-0001 → grade 8, volume 8A, unit U2)。
const m = String(rows[0].word_id).match(/^jr-(\d+)([AB])-(U\d+)-/);
if (!m) { console.error("无法从 word_id 解析单元:", rows[0].word_id); process.exit(1); }
const grade = Number(m[1]);
const volume = `${m[1]}${m[2]}`;
const unit = m[3];

let out =
  `-- ${volume} ${unit}:回填 junior_vocab.phrase_en(英文短语/语块)。幂等:按 word_id 精确 UPDATE,可重跑。\n` +
  "-- 前置:必须先跑 ALTER TABLE ... ADD COLUMN phrase_en text;\n\n";
for (const r of rows) {
  out += `UPDATE public.junior_vocab SET phrase_en = '${sq(r.phrase_en.trim())}' WHERE word_id = '${sq(r.word_id)}';\n`;
}
out += `\n-- 校验:本单元已回填条数(应 = ${rows.length})\n`;
out += `SELECT count(*) FILTER (WHERE phrase_en IS NOT NULL) AS filled, count(*) AS total\n`;
out += `FROM public.junior_vocab WHERE grade = ${grade} AND volume = '${volume}' AND unit = '${unit}';\n`;
fs.writeFileSync(OUT, out);
console.log(`生成 ${rows.length} 条 UPDATE → ${OUT}` + (warn.length ? `  (${warn.length} 条质量告警)` : "  (无告警)"));
