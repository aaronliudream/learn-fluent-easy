/**
 * 诊断(只读·不改库):为「精选核心词」分母定方案。高频 + 实词 + 排专名 + 有 read-v1 卡。
 * 报不同频次门槛 F 下的词数,让 Aaron 挑一个落在 300–500 的档;语块报频次分布挑 ~100。
 * 用法:node scripts/library/diag-core-words.mjs
 */
import { readFileSync, existsSync } from "node:fs";

function loadEnv() {
  for (const f of [".env", ".env.local"]) {
    if (!existsSync(f)) continue;
    for (const l of readFileSync(f, "utf8").split(/\r?\n/)) {
      if (!l.includes("=") || l.trim().startsWith("#")) continue;
      const i = l.indexOf("=");
      process.env[l.slice(0, i).trim()] = l.slice(i + 1).trim().replace(/^["']|["']$/g, "");
    }
  }
}
loadEnv();
const SUP = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const H = { apikey: KEY, Authorization: `Bearer ${KEY}` };

const FUNC_POS = new Set(["conj", "prep", "art", "pron", "aux", "det", "num", "interj", "int", "particle", "modal"]);
const GRAMMAR_TERMS = new Set(
  ("the a an of to in on at and or but nor for so yet with as by from because although though while since unless " +
    "if then than that this these those is are was were be been being am do does did have has had will would shall " +
    "should can could may might must not no o'clock").split(" "));
const normPos = (p) => String(p || "").split("/")[0].toLowerCase().replace(/[^a-z]/g, "");
const isFunc = (term, pos) => GRAMMAR_TERMS.has(term) || FUNC_POS.has(normPos(pos));

async function pageAll(path) {
  const out = []; let off = 0;
  for (;;) {
    const r = await fetch(`${SUP}/rest/v1/${path}&limit=1000&offset=${off}`, { headers: H });
    if (!r.ok) throw new Error(`${r.status} ${(await r.text()).slice(0, 150)}`);
    const b = await r.json(); out.push(...b);
    if (b.length < 1000) break; off += 1000;
  }
  return out;
}

(async () => {
  const book = JSON.parse(readFileSync("scripts/library/books/wizard-of-oz.json", "utf8"));

  // read-v1 卡:词卡(含 pos,排虚词) / 语块卡
  const cards = await pageAll("phrase_explanations?target_lang=eq.read-v1&select=normalized,explanation");
  const wordPos = new Map(); // key -> pos
  const chunkKeys = new Set();
  for (const c of cards) {
    const k = String(c.normalized).toLowerCase().trim();
    if (!k) continue;
    if (k.includes(" ")) chunkKeys.add(k);
    else wordPos.set(k, c.explanation?.pos || "");
  }

  // 遍历正文:词频 + 是否出现过小写(判专名) + 语块频次
  const freq = new Map();       // lowerkey -> 出现次数
  const hasLower = new Set();   // 出现过小写(非专名信号)
  let fulltext = " ";
  for (const ch of book.chapters) {
    for (const para of ch.paragraphs) {
      for (const s of para) {
        const en = s.en || "";
        fulltext += en.toLowerCase().replace(/[^a-z0-9' ]+/g, " ") + " ";
        // 逐句:句首词首字母大写不算专名信号
        const words = en.split(/\s+/);
        words.forEach((w, i) => {
          const cleaned = w.replace(/^[^A-Za-z']+|[^A-Za-z']+$/g, "");
          if (!cleaned) return;
          const key = cleaned.toLowerCase();
          freq.set(key, (freq.get(key) || 0) + 1);
          const isCap = /^[A-Z]/.test(cleaned);
          if (!isCap) hasLower.add(key);       // 明确小写
          else if (i === 0) { /* 句首大写:无信息,忽略 */ }
          // 句中大写且从未小写 => 专名(下面用 hasLower 判)
        });
      }
    }
  }
  fulltext = fulltext.replace(/\s+/g, " ");

  // 候选核心词:有 read-v1 词卡 + 非虚词 + 非专名(出现过小写)
  const candidates = [];
  for (const [key, pos] of wordPos) {
    if (!freq.has(key)) continue;           // 不在本书
    if (isFunc(key, pos)) continue;          // 虚词
    if (!hasLower.has(key)) continue;        // 从未小写 => 专名,排除
    candidates.push({ key, f: freq.get(key), pos });
  }
  candidates.sort((a, b) => b.f - a.f);

  const chunkFreq = [...chunkKeys].map((c) => ({ c, f: (fulltext.split(` ${c} `).length - 1) })).filter((x) => x.f > 0).sort((a, b) => b.f - a.f);
  const sample = (arr, n) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a.slice(0, n);
  };

  console.log(`本书 read-v1 词卡 ${wordPos.size} · 语块卡 ${chunkKeys.size}`);
  console.log(`实词候选(有卡·非虚词·非专名)共 ${candidates.length} · 语块本书出现 ${chunkFreq.length}\n`);

  console.log("| 门槛 | 词数 | 语块数 |");
  console.log("|---|---|---|");
  for (const F of [5, 8, 10, 15]) {
    const w = candidates.filter((c) => c.f >= F).length;
    const ch = chunkFreq.filter((x) => x.f >= F).length;
    console.log(`| 频次 ≥ ${F} | ${w} | ${ch} |`);
  }

  for (const F of [5, 8, 10, 15]) {
    const pool = candidates.filter((c) => c.f >= F);
    console.log(`\n--- 频次 ≥ ${F}(共 ${pool.length} 词)随机 10 个 ---`);
    console.log("  " + sample(pool, 10).map((c) => `${c.key}(${c.f}, ${c.pos})`).join("  "));
  }
  console.log("\n--- 语块 频次 ≥ 4 随机 10 个 ---");
  console.log("  " + sample(chunkFreq.filter((x) => x.f >= 4), 10).map((x) => `${x.c}(${x.f})`).join(" · "));
  console.log("\n专名排除抽查(应为人名/地名,不进核心):");
  const propers = [...freq.entries()].filter(([k, f]) => !hasLower.has(k) && f >= 8 && wordPos.has(k)).sort((a, b) => b[1] - a[1]).slice(0, 15);
  console.log("  " + propers.map(([k, f]) => `${k}(${f})`).join(" "));
})();
