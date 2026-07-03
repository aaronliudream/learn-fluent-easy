// 课本 PDF 数据导出(anon 只读)。用法: node scripts/american/pdf/export-data.mjs <unit_no|all>
// 输出 scripts/american/pdf/data/unitNN.json —— 每课含 课头/课文/词汇/对照卡(chunk)/语法/题目(按stage)。
// 零改库、零创作;chunk IPA 为库缺字段,由 gen-chunk-ipa 另行补齐后合并。
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const env = fs.readFileSync(".env", "utf8");
const g = (k) => env.split("\n").find((l) => l.startsWith(k + "="))?.slice(k.length + 1).trim().replace(/^["']|["']$/g, "");
const SUP = g("VITE_SUPABASE_URL"), KEY = g("VITE_SUPABASE_PUBLISHABLE_KEY");

async function all(table, query) {
  const out = [];
  for (let from = 0; ; from += 1000) {
    const r = await fetch(`${SUP}/rest/v1/${table}?${query}`, {
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, Range: `${from}-${from + 999}` },
    });
    const rows = await r.json();
    if (!Array.isArray(rows)) throw new Error(table + ": " + JSON.stringify(rows));
    out.push(...rows);
    if (rows.length < 1000) break;
  }
  return out;
}

const arg = process.argv[2] || "1";
const units = arg === "all" ? Array.from({ length: 12 }, (_, i) => i + 1) : [Number(arg)];

const OUT = path.join(ROOT, "scripts/american/pdf/data");
fs.mkdirSync(OUT, { recursive: true });

for (const unit of units) {
  const lessons = (await all("american_lessons", `unit_no=eq.${unit}&order=lesson_no.asc&select=*`));
  const ids = lessons.map((l) => l.id);
  const inList = `in.(${ids.join(",")})`;
  const [sents, words, gps, contrast, qs] = await Promise.all([
    all("american_sentences", `lesson_id=${inList}&order=lesson_id.asc,seq.asc&select=*`),
    all("american_words", `lesson_id=${inList}&order=lesson_id.asc,id.asc&select=*`),
    all("american_grammar_points", `lesson_id=${inList}&order=id.asc&select=*`),
    all("american_amencontrast", `lesson_id=${inList}&order=lesson_id.asc,id.asc&select=*`),
    all("american_questions", `lesson_id=${inList}&order=lesson_id.asc,stage.asc,seq.asc&select=*`),
  ]);
  const by = (rows) => { const m = {}; for (const r of rows) (m[r.lesson_id] ??= []).push(r); return m; };
  const S = by(sents), W = by(words), G = by(gps), C = by(contrast), Q = by(qs);
  const data = {
    unit_no: unit,
    lessons: lessons.map((L) => ({
      ...L,
      sentences: S[L.id] || [],
      words: W[L.id] || [],
      grammar_points: G[L.id] || [],
      contrast: C[L.id] || [],
      questions: Q[L.id] || [],
    })),
  };
  const counts = data.lessons.map((L) => `L${L.lesson_no}:句${L.sentences.length}/词${L.words.length}/卡${L.contrast.length}/语${L.grammar_points.length}/题${L.questions.length}`);
  fs.writeFileSync(path.join(OUT, `unit${String(unit).padStart(2, "0")}.json`), JSON.stringify(data, null, 1), "utf8");
  console.log(`单元${unit}: ${lessons.length}课  ${counts.join("  ")}`);
}
