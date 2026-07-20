// 生成剩余待造卡词的真 ctx 简报(排除样本已做/屈折覆盖/碎片),分批给子代理手写。
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const env = Object.fromEntries(readFileSync(".env.local", "utf8").split(/\r?\n/).filter((l) => l.includes("=")).map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")]; }));
const SUP = "https://degqpiiddkxcuzwombwp.supabase.co", KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const H = { apikey: KEY, Authorization: `Bearer ${KEY}` };

const book = JSON.parse(readFileSync("scripts/library/books/fir-tree.json", "utf8"));
const sents = book.chapters.flatMap((c) => c.paragraphs.flat().map((s) => s.en));
const freq = new Map(), ctxs = new Map();
for (const s of sents) for (const raw of s.toLowerCase().match(/[a-z]+(?:'[a-z]+)?/g) || []) {
  const w = raw.replace(/^'+|'+$/g, ""); if (!w) continue;
  freq.set(w, (freq.get(w) || 0) + 1);
  if (!ctxs.has(w)) ctxs.set(w, []);
  if (ctxs.get(w).length < 2 && !ctxs.get(w).includes(s)) ctxs.get(w).push(s);
}
const types = [...freq.keys()];

async function have(list) {
  const out = new Set();
  for (let i = 0; i < list.length; i += 80) {
    const inList = list.slice(i, i + 80).map(encodeURIComponent).join(",");
    const r = await fetch(`${SUP}/rest/v1/phrase_explanations?target_lang=eq.read-v1&normalized=in.(${inList})&select=normalized`, { headers: H });
    for (const c of await r.json()) out.add(c.normalized);
  }
  return out;
}
const carded = await have(types);
const missing = types.filter((w) => !carded.has(w));
// 屈折覆盖判定(与 _fir-classify 同)
function lemmas(w) {
  const out = new Set();
  if (w.length > 4 && w.endsWith("ies")) out.add(w.slice(0, -3) + "y");
  if (w.length > 4 && w.endsWith("es")) out.add(w.slice(0, -2));
  if (w.length > 4 && w.endsWith("s")) out.add(w.slice(0, -1));
  if (w.length > 4 && w.endsWith("ed")) { out.add(w.slice(0, -2)); out.add(w.slice(0, -1)); if (w.length > 5) out.add(w.slice(0, -3)); }
  if (w.length > 5 && w.endsWith("ing")) { out.add(w.slice(0, -3)); out.add(w.slice(0, -3) + "e"); }
  if (w.length > 4 && w.endsWith("er")) out.add(w.slice(0, -2));
  if (w.length > 5 && w.endsWith("est")) out.add(w.slice(0, -3));
  return [...out].filter((x) => x.length >= 3);
}
const lemCarded = await have([...new Set(missing.flatMap(lemmas))]);
// 手册④陷阱:这些屈折的 lemma 匹配是【错词】,强制真造卡
const FALSE_LEMMA = new Set(["pines", "pitcher"]);
const ARTIFACT = new Set(["re", "quirre", "vit"]);
const SAMPLE_DONE = new Set(["beheld", "tinsel", "larder", "magnificence", "balustrade", "moveth", "wherefore", "tis", "sugarplums", "pith", "pines", "pitcher"]);
const PROPER = new Set(["christmas", "chinese", "sunday", "humpy", "dumpy", "ivedy", "avedy"]);

const need = [];
for (const w of missing) {
  if (ARTIFACT.has(w) || SAMPLE_DONE.has(w)) continue;
  if (PROPER.has(w)) continue; // 专名单列
  if (!FALSE_LEMMA.has(w) && lemmas(w).some((x) => lemCarded.has(x))) continue; // 真屈折覆盖→走回退
  need.push(w);
}
need.sort((a, b) => (freq.get(b) - freq.get(a)) || a.localeCompare(b));
const proper = [...PROPER];

mkdirSync("scripts/library/books/dict-data/fir-tree/in", { recursive: true });
const B = 3, per = Math.ceil(need.length / B);
for (let bi = 0; bi < B; bi++) {
  const batch = need.slice(bi * per, (bi + 1) * per);
  let md = `# 枞树词典 · 生词批${bi + 2}(${batch.length}词)\n\n`;
  for (const w of batch) md += `## ${w}  (×${freq.get(w)})\n${ctxs.get(w).map((s) => "  - " + s).join("\n")}\n\n`;
  writeFileSync(`scripts/library/books/dict-data/fir-tree/in/batch${bi + 2}.md`, md);
}
// 专名批
let pm = `# 枞树词典 · 专名批(${proper.length}词,proper:true)\n\n`;
for (const w of proper) pm += `## ${w}  (×${freq.get(w)})\n${(ctxs.get(w) || []).map((s) => "  - " + s).join("\n")}\n\n`;
writeFileSync(`scripts/library/books/dict-data/fir-tree/in/proper.md`, pm);
console.log(`✓ 待造卡 生词 ${need.length}(分${B}批)+ 专名 ${proper.length}`);
console.log(`生词:`, need.join(" "));
