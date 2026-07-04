// 逐题解释 md → perq SQL(payload.explanation_cn 增量更新,按 qid)。
// 源格式每行: - qid: `uuid` | 解释：<text>
// 幂等:payload = payload || jsonb_build_object('explanation_cn', <text>),重跑安全,不动其它字段。
// 用法: node scripts/american/gen-perq-from-md.mjs <src.md> <out.sql>
import { readFileSync, writeFileSync } from "node:fs";

const [src, out] = process.argv.slice(2);
if (!src || !out) { console.error("用法: gen-perq-from-md.mjs <src.md> <out.sql>"); process.exit(1); }
const text = readFileSync(src, "utf8");

const sq = (s) => "'" + String(s).replace(/'/g, "''") + "'";
const rows = [];
const re = /qid:\s*`([0-9a-f-]{36})`\s*\|\s*解释[：:]\s*(.+?)\s*$/gim;
let m;
while ((m = re.exec(text)) !== null) {
  rows.push({ qid: m[1], exp: m[2].trim() });
}
if (!rows.length) { console.error("没解析到任何 qid|解释 行"); process.exit(1); }

// 去重(同 qid 取最后一次)
const byQid = new Map();
for (const r of rows) byQid.set(r.qid, r.exp);
const uniq = [...byQid.entries()];

const lines = [
  `-- 逐题解释 perq(生成器 gen-perq-from-md.mjs 产出,勿手改;源 ${src})`,
  `-- 幂等:payload || explanation_cn,只补该字段,不动 stem/options/answer_index。按 qid 精确更新。`,
  `-- 共 ${uniq.length} 题。Aaron service role 跑。`,
  "BEGIN;",
];
for (const [qid, exp] of uniq) {
  lines.push(`UPDATE public.american_questions SET payload = payload || jsonb_build_object('explanation_cn', ${sq(exp)}) WHERE id = '${qid}';`);
}
// 改后核对:这批 qid 里带 explanation_cn 的数量(应 = uniq.length)
const idList = uniq.map(([q]) => `'${q}'`).join(",");
lines.push(`SELECT '带解释的题数(应 ${uniq.length})' AS label, count(*) AS n FROM public.american_questions WHERE id IN (${idList}) AND payload ? 'explanation_cn';`);
lines.push("COMMIT;", "");

writeFileSync(out, lines.join("\n"), "utf8");
console.log(`解析 ${rows.length} 行 → 去重 ${uniq.length} 题 → 写出 ${out}`);
