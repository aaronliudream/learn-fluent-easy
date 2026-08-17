/**
 * ECDICT 的 `tag` 列到底有哪些取值、各多少词 —— **只读**。
 *
 * 由来:做 ket_pet / gmat 之前要确认"ECDICT 里真的没有对应标签",
 * 而不是凭印象说没有。之前用 `split(',')` 数过一次,被引号包裹的字段切碎了,
 * 数出一堆 "the"/"and" 之类的假标签 —— 那次的结论不能用。
 * 这次用与 ingest 同一套引号感知的 CSV 解析。
 *
 * 用法:node scripts/vocab/audit/ecdict-tags.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const CACHE = path.join(tmpdir(), "ecdict-source", "ecdict.csv");
if (!existsSync(CACHE)) { console.error(`✗ 没有 ${CACHE},先跑一次 ingest-toefl.mjs 让它下载`); process.exit(2); }

/* 与 ingest-toefl.mjs 逐字同一套解析(标准双引号转义) */
function* parseCsv(text) {
  let i = 0, field = "", row = [], inQ = false;
  const n = text.length;
  while (i < n) {
    const c = text[i];
    if (inQ) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i += 2; continue; } inQ = false; i++; continue; }
      field += c; i++; continue;
    }
    if (c === '"') { inQ = true; i++; continue; }
    if (c === ",") { row.push(field); field = ""; i++; continue; }
    if (c === "\r") { i++; continue; }
    if (c === "\n") { row.push(field); yield row; row = []; field = ""; i++; continue; }
    field += c; i++;
  }
  if (field.length || row.length) { row.push(field); yield row; }
}

const rows = parseCsv(readFileSync(CACHE, "utf8"));
const header = rows.next().value;
const ti = header.indexOf("tag");
if (ti < 0) { console.error("✗ 没有 tag 列"); process.exit(2); }

const count = new Map();
let total = 0, tagged = 0;
for (const r of rows) {
  total++;
  const tags = (r[ti] || "").split(/\s+/).filter(Boolean);
  if (tags.length) tagged++;
  for (const t of tags) count.set(t, (count.get(t) || 0) + 1);
}

console.log(`ECDICT 总行数 ${total} · 带 tag 的 ${tagged}\n`);
console.log("标签一览(按词数):");
for (const [t, n] of [...count].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${t.padEnd(10)} ${String(n).padStart(6)}`);
}

/* 我们九个库要的标签,逐个报有没有 */
const NEED = { zhongkao: "zk", gaokao: "gk", kaoyan: "ky", cet4: "cet4", cet6: "cet6", toefl: "toefl", ielts: "ielts", gre: "gre", ket_pet: "(无)", gmat: "(无)" };
console.log("\n我们的词库 → ECDICT 标签:");
for (const [bank, tag] of Object.entries(NEED)) {
  const n = count.get(tag);
  console.log(`  ${bank.padEnd(10)} tag=${String(tag).padEnd(8)} ${n ? `${n} 词 ✓` : "**ECDICT 里没有这个标签**"}`);
}
