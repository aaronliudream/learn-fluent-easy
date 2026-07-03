// 验证 american_* 表落库计数(anon key,只读)。用法: node scripts/american/verify-db.mjs
import fs from "node:fs";

const env = fs.readFileSync(".env", "utf8");
const clean = (s) => s?.trim().replace(/^["']|["']$/g, "");
const get = (k) => clean(env.split("\n").find((l) => l.startsWith(k + "="))?.slice(k.length + 1));
const URL = get("VITE_SUPABASE_URL");
const KEY = get("VITE_SUPABASE_PUBLISHABLE_KEY");

async function count(table) {
  const r = await fetch(`${URL}/rest/v1/${table}?select=*`, {
    method: "HEAD",
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, Prefer: "count=exact", Range: "0-0" },
  });
  return Number(r.headers.get("content-range")?.split("/")[1] ?? "?");
}

async function perUnit(table, col = "grade") {
  const r = await fetch(`${URL}/rest/v1/${table}?select=${col}`, {
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
  });
  const rows = await r.json();
  const m = {};
  for (const x of rows) m[x[col]] = (m[x[col]] ?? 0) + 1;
  return m;
}

const tables = [
  "american_lessons",
  "american_sentences",
  "american_words",
  "american_grammar_points",
  "american_amencontrast",
  "american_questions",
];
console.log("表落库计数:");
for (const t of tables) console.log(`  ${t.padEnd(26)} ${await count(t)}`);

// 分页拉全表(REST 默认 1000 行上限,必须翻页)
async function fetchAll(table, select) {
  const out = [];
  for (let from = 0; ; from += 1000) {
    const r = await fetch(`${URL}/rest/v1/${table}?select=${select}`, {
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, Range: `${from}-${from + 999}` },
    });
    const rows = await r.json();
    out.push(...rows);
    if (rows.length < 1000) break;
  }
  return out;
}

const unitOf = (lid) => Math.ceil(Number(String(lid).match(/am1_l(\d+)/)?.[1]) / 6);

for (const [table, sel] of [["american_questions", "lesson_id"], ["american_words", "lesson_id"], ["american_amencontrast", "lesson_id"]]) {
  const rows = await fetchAll(table, sel);
  const by = {};
  for (const x of rows) { const u = unitOf(x.lesson_id); by[u] = (by[u] ?? 0) + 1; }
  console.log(`\n每单元 ${table}:`);
  for (const u of Object.keys(by).sort((a, b) => a - b)) console.log(`  单元${u}  ${by[u]}`);
  console.log(`  合计  ${rows.length}`);
}
