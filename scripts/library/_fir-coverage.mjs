// 枞树点词词典覆盖分析:抽全书词型 → 查现有 read-v1 卡 → 报 缺卡/已有/专名。
import { readFileSync } from "node:fs";
const env = Object.fromEntries(readFileSync(".env.local", "utf8").split(/\r?\n/).filter((l) => l.includes("=")).map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")]; }));
const SUP = "https://degqpiiddkxcuzwombwp.supabase.co", KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const H = { apikey: KEY, Authorization: `Bearer ${KEY}` };

const book = JSON.parse(readFileSync("scripts/library/books/fir-tree.json", "utf8"));
const sents = book.chapters.flatMap((c) => c.paragraphs.flat().map((s) => s.en));
const full = sents.join(" ");

// 词型:字母序列(连字符/撇号拆开),小写。记频次 + 首现出处句。
const freq = new Map(), firstCtx = new Map(), proper = new Set();
for (const s of sents) {
  // 专名:句中(非句首)大写开头的词
  const words = s.match(/[A-Za-z][A-Za-z'-]*/g) || [];
  words.forEach((w, i) => {
    if (i > 0 && /^[A-Z]/.test(w) && !/^I$|^I'/.test(w)) proper.add(w.replace(/[^A-Za-z]/g, ""));
  });
  for (const raw of s.toLowerCase().match(/[a-z]+(?:'[a-z]+)?/g) || []) {
    const w = raw.replace(/^'+|'+$/g, "");
    if (!w) continue;
    freq.set(w, (freq.get(w) || 0) + 1);
    if (!firstCtx.has(w)) firstCtx.set(w, s);
  }
}
const types = [...freq.keys()].sort();
console.log(`全书:${sents.length} 句 / 词型 ${types.length} 个`);
console.log(`句中大写(疑似专名):`, [...proper].sort().join(", ") || "(无)");

// 批量查 read-v1
async function has(list) {
  const out = new Set();
  for (let i = 0; i < list.length; i += 80) {
    const inList = list.slice(i, i + 80).map(encodeURIComponent).join(",");
    const r = await fetch(`${SUP}/rest/v1/phrase_explanations?target_lang=eq.read-v1&normalized=in.(${inList})&select=normalized`, { headers: H });
    for (const c of await r.json()) out.add(c.normalized);
  }
  return out;
}
const have = await has(types);
const missing = types.filter((w) => !have.has(w));
console.log(`\n已有 read-v1 卡:${have.size} / ${types.length}`);
console.log(`缺卡:${missing.length}`);
// 缺卡按频次
const byFreq = missing.map((w) => [w, freq.get(w)]).sort((a, b) => b[1] - a[1]);
console.log(`\n缺卡词(频次):`);
console.log(byFreq.map(([w, f]) => `${w}·${f}`).join("  "));
