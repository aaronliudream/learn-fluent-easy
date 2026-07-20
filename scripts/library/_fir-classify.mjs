// 分类缺卡词:① lemma 已有卡的规则屈折形(→走词干回退,不造卡) ② 真需造卡 ③ 专名/虚构名 ④ 切分碎片。
import { readFileSync } from "node:fs";
const env = Object.fromEntries(readFileSync(".env.local", "utf8").split(/\r?\n/).filter((l) => l.includes("=")).map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")]; }));
const SUP = "https://degqpiiddkxcuzwombwp.supabase.co", KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const H = { apikey: KEY, Authorization: `Bearer ${KEY}` };

const book = JSON.parse(readFileSync("scripts/library/books/fir-tree.json", "utf8"));
const sents = book.chapters.flatMap((c) => c.paragraphs.flat().map((s) => s.en));
const freq = new Map(), ctx = new Map();
for (const s of sents) for (const raw of s.toLowerCase().match(/[a-z]+(?:'[a-z]+)?/g) || []) {
  const w = raw.replace(/^'+|'+$/g, ""); if (!w) continue;
  freq.set(w, (freq.get(w) || 0) + 1); if (!ctx.has(w)) ctx.set(w, s);
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

// 候选 lemma(规则去屈折)
function lemmas(w) {
  const out = new Set();
  if (w.length > 4 && w.endsWith("ies")) out.add(w.slice(0, -3) + "y");
  if (w.length > 4 && w.endsWith("es")) out.add(w.slice(0, -2));
  if (w.length > 4 && w.endsWith("s")) out.add(w.slice(0, -1));
  if (w.length > 4 && w.endsWith("ed")) { out.add(w.slice(0, -2)); out.add(w.slice(0, -1)); if (w.length > 5) out.add(w.slice(0, -3)); } // want, wanted; also double-cons
  if (w.length > 5 && w.endsWith("ing")) { out.add(w.slice(0, -3)); out.add(w.slice(0, -3) + "e"); }
  if (w.length > 4 && w.endsWith("er")) out.add(w.slice(0, -2)); // taller→tall
  if (w.length > 5 && w.endsWith("est")) out.add(w.slice(0, -3)); // youngest→young
  return [...out].filter((x) => x.length >= 3);
}
const allLem = [...new Set(missing.flatMap(lemmas))];
const lemCarded = await have(allLem);

const ARTIFACT = new Set(["re", "vit", "quirre", "tis"]); // 切分碎片 + 撇号残(tis 另处理)
const PROPER = new Set(["humpy", "dumpy", "ivedy", "avedy", "christmas", "chinese", "sunday"]);

const inflCovered = [], needCard = [], proper = [], artifact = [];
for (const w of missing) {
  if (ARTIFACT.has(w)) { artifact.push(w); continue; }
  if (PROPER.has(w)) { proper.push(w); continue; }
  const lm = lemmas(w).find((x) => lemCarded.has(x));
  if (lm) inflCovered.push(`${w}→${lm}`);
  else needCard.push(w);
}
const byFreq = (a) => a.sort((x, y) => (freq.get(y.split("→")[0]) || 0) - (freq.get(x.split("→")[0]) || 0));
console.log(`缺卡 ${missing.length}:`);
console.log(`\n【① 规则屈折·lemma已有卡→走词干回退(${inflCovered.length})】\n`, byFreq(inflCovered).join("  "));
console.log(`\n【② 真需造卡(${needCard.length})】\n`, byFreq(needCard).map((w) => `${w}·${freq.get(w)}`).join("  "));
console.log(`\n【③ 专名/虚构名(${proper.length})】\n`, proper.join("  "));
console.log(`\n【④ 切分碎片(${artifact.length})】\n`, artifact.join("  "));
