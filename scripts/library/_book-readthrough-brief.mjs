// 某书回读扫描简报:本书词型 → 现全局 read-v1 卡(28修正后现值) + 真 ctx,排已有按书覆盖。分批供子代理判回读。
// 用法:node scripts/library/_book-readthrough-brief.mjs <book_json_key> <book_key> [batches]
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const [, , JSONKEY, BOOKKEY, BN] = process.argv;
if (!JSONKEY || !BOOKKEY) { console.error("用法: <json_key> <book_key> [batches]"); process.exit(1); }
const BATCHES = Number(BN) || 1;
const env = Object.fromEntries(readFileSync(".env.local", "utf8").split(/\r?\n/).filter((l) => l.includes("=")).map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")]; }));
const SUP = "https://degqpiiddkxcuzwombwp.supabase.co", KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const H = { apikey: KEY, Authorization: `Bearer ${KEY}` };

const b = JSON.parse(readFileSync(`scripts/library/books/${JSONKEY}.json`, "utf8"));
const sents = [];
for (const ch of b.chapters || []) for (const p of ch.paragraphs || []) for (const s of (Array.isArray(p) ? p : p.items || [])) if (s && s.en) sents.push(s.en);
const freq = new Map(), ctxs = new Map();
for (const s of sents) for (const raw of s.toLowerCase().match(/[a-z]+(?:'[a-z]+)?/g) || []) {
  const w = raw.replace(/^'+|'+$/g, ""); if (!w) continue;
  freq.set(w, (freq.get(w) || 0) + 1);
  if (!ctxs.has(w)) ctxs.set(w, []);
  const arr = ctxs.get(w); if (arr.length < 2 && !arr.includes(s)) arr.push(s);
}
const types = [...freq.keys()];

async function fetchCards(list) {
  const m = {};
  for (let i = 0; i < list.length; i += 60) {
    const inL = list.slice(i, i + 60).map(encodeURIComponent).join(",");
    const r = await (await fetch(`${SUP}/rest/v1/phrase_explanations?target_lang=eq.read-v1&normalized=in.(${inL})&select=normalized,pos:explanation->>pos,gloss:explanation->>gloss_cn`, { headers: H })).json();
    for (const c of r) m[c.normalized] = c;
  }
  return m;
}
const cards = await fetchCards(types);
// 已有按书覆盖(排除,已按书处理)
const ov = new Set((await (await fetch(`${SUP}/rest/v1/library_word_senses?book_key=eq.${BOOKKEY}&select=normalized`, { headers: H })).json()).map((x) => x.normalized));

// 已修/已审定的全局词(跨书排除,避免重复标)
let fixed = new Set();
try { fixed = new Set(readFileSync("scripts/library/books/readthrough/_global-fixed.txt", "utf8").split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith("#"))); } catch { /* 无则不排 */ }
// 只审【有全局卡 且 未被本书覆盖 且 未在全局已处理清单】的词
const targets = types.filter((w) => cards[w] && !ov.has(w) && !fixed.has(w)).sort((a, b) => (freq.get(b) - freq.get(a)) || a.localeCompare(b));
mkdirSync(`scripts/library/books/readthrough/${BOOKKEY}`, { recursive: true });
const per = Math.ceil(targets.length / BATCHES);
for (let bi = 0; bi < BATCHES; bi++) {
  const batch = targets.slice(bi * per, (bi + 1) * per);
  let md = `# ${BOOKKEY} 回读扫描 · 批${bi + 1}(${batch.length}词)\n\n`;
  md += `判据:拿【现全局义】回读该词在本书出处句——读者按此义读那一处**读不通**才标(withered=使羞愧 vs "withered and yellow" 不通→标)。**不标"义可更丰富/还有别义没写"**(无底洞)。屈折形若 lemma 义盖得住就不标。\n\n`;
  for (const w of batch) {
    md += `## ${w} | 现全局: [${cards[w].pos || "?"}] ${cards[w].gloss}\n`;
    for (const c of ctxs.get(w)) md += `  - ${c.trim().slice(0, 140)}\n`;
    md += "\n";
  }
  writeFileSync(`scripts/library/books/readthrough/${BOOKKEY}/batch${bi + 1}.md`, md);
}
console.log(`✓ ${BOOKKEY}: ${targets.length} 词(有全局卡·排${ov.size}覆盖)分 ${BATCHES} 批 → readthrough/${BOOKKEY}/batch{1-${BATCHES}}.md`);
console.log(`  (本书词型 ${types.length}·无卡 ${types.length - Object.keys(cards).length})`);
