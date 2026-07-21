// 28 张回读不通旧全局卡的修正核查:现全局卡 + fir-tree ctx + 另四本出现(判 B改全局 / A按书退回)。
import { readFileSync, writeFileSync } from "node:fs";
const env = Object.fromEntries(readFileSync(".env.local", "utf8").split(/\r?\n/).filter((l) => l.includes("=")).map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")]; }));
const SUP = "https://degqpiiddkxcuzwombwp.supabase.co", KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const H = { apikey: KEY, Authorization: `Bearer ${KEY}` };

const WORDS = ["withered","hang","squeak","star","sheer","trunks","sprung","spring","nurse","plant","plunder","troop","state","matter","rest","court","over","bend","fixed","beat","sing","word","assert","care","after","upright","peeping","kissed"];

const BOOKS = { "fir-tree":"fir-tree", "oz":"wizard-of-oz", "robinson":"robinson-crusoe", "tom":"tom-sawyer", "aesop":"aesop-easy-readers" };
const sents = {};
for (const [k, f] of Object.entries(BOOKS)) {
  const b = JSON.parse(readFileSync(`scripts/library/books/${f}.json`, "utf8"));
  // 结构差异:有的 paragraphs[][]{en}, 有的 chapters[].paragraphs
  const arr = [];
  for (const ch of b.chapters || []) for (const p of ch.paragraphs || []) for (const s of (Array.isArray(p) ? p : p.items || [])) if (s && s.en) arr.push(s.en);
  sents[k] = arr;
}
// 分词法找含某词的句子(避 \b)
const has = (sentence, w) => sentence.toLowerCase().replace(/[^a-z']+/g, " ").split(/\s+/).includes(w);
const occ = (bk, w) => sents[bk].filter((s) => has(s, w));

async function cards(list) {
  const m = {};
  const inL = list.map(encodeURIComponent).join(",");
  const r = await (await fetch(`${SUP}/rest/v1/phrase_explanations?target_lang=eq.read-v1&normalized=in.(${inL})&select=normalized,explanation`, { headers: H })).json();
  for (const c of r) m[c.normalized] = c.explanation;
  return m;
}
const C = await cards(WORDS);

let out = `# fir-tree 28 张旧全局卡修正核查(B改全局/A按书) · ${WORDS.length} 词\n\n`;
out += `逐张:现全局卡 → fir-tree 出处 → 另四本(Oz/Robinson/Tom/Aesop)出现数+例句(判是否依赖旧义)。\n\n`;
for (const w of WORDS) {
  const e = C[w] || {};
  out += `\n## ${w}  [现全局: ${e.pos || "?"}] ${e.gloss_cn || "(无卡?)"}\n`;
  const ft = occ("fir-tree", w);
  out += `- **fir-tree**(${ft.length}处): ${ft.slice(0, 2).map((s) => s.trim().slice(0, 100)).join("  //  ") || "(surface未直接命中,可能屈折)"}\n`;
  for (const bk of ["oz", "robinson", "tom", "aesop"]) {
    const o = occ(bk, w);
    out += `- ${bk}(${o.length}处)${o.length ? ": " + o.slice(0, 2).map((s) => s.trim().slice(0, 90)).join("  //  ") : ""}\n`;
  }
}
writeFileSync("scripts/library/books/_fir-global-fix-audit.md", out);
console.log(`✓ scripts/library/books/_fir-global-fix-audit.md (${WORDS.length} 词)`);
// 顺带报每词四本总出现,便于判影响面
console.log("\n词 · fir-tree · oz · rob · tom · aesop:");
for (const w of WORDS) console.log(`  ${w.padEnd(10)} ${["fir-tree","oz","robinson","tom","aesop"].map((bk)=>occ(bk,w).length).join(" · ")}`);
