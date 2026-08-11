/**
 * 跨库重复句实测 —— **只查不改**。
 *
 * ── 为什么要查 ────────────────────────────────────────────────
 * g4 的设计是"全局累积去重,跨批次、跨词库都算"(gates.mjs 原注释),
 * 但代码一直只从**当前库**的 content JSON 载语料。也就是说
 * **跨库那一半从来没生效过** —— 每开一个新库,去重都从零开始。
 * 2026-08-10 已修(改成载入所有 <bank>-content.json),但**存量内容是在漏的状态下生成的**。
 *
 * 这个脚本回答的就是一个问题:**那个洞到底漏进来多少重复句?**
 * 在拿到这个数之前,"要不要回头修存量"是没法判断的。
 *
 * 判据与 g4 完全一致:两句 4-gram 重合率 > 50%(用 gates.mjs 的同一套函数,不另写)。
 * ⚠️ 只比**不同词库之间**的句子 —— 同库内部当初是真判过的,不是这次要查的问题。
 *
 * 用法:node scripts/vocab/audit/cross-bank-dedup.mjs
 * 末行 GATE_VERDICT;别用管道取退出码。
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { ngrams, overlapRatio } from "../gates.mjs";
import { SPEC } from "../spec.mjs";

const GEN = path.join(process.cwd(), "scripts", "vocab", "data", "generated");
const THRESHOLD = SPEC.dedup.globalMax;

/* 收句子:每条记 (库, 词, 原文, 4-gram 集合) */
const sents = [];
for (const f of readdirSync(GEN).sort()) {
  if (!f.endsWith("-content.json") || f.includes("trial")) continue;
  const bank = f.replace("-content.json", "");
  const j = JSON.parse(readFileSync(path.join(GEN, f), "utf8"));
  for (const rec of Object.values(j)) {
    for (const ex of rec.examples || []) {
      sents.push({ bank, word: rec.headword, s: ex.sentence, g: ngrams(ex.sentence) });
    }
  }
}
const byBank = {};
for (const x of sents) byBank[x.bank] = (byBank[x.bank] || 0) + 1;
console.log("句子总数:", sents.length, "|", Object.entries(byBank).map(([k, v]) => `${k} ${v}`).join(" · "));
console.log(`判据:与**其他词库**的句子 4-gram 重合 > ${THRESHOLD * 100}%(与 g4 同一套函数)\n`);

/* 倒排索引:4-gram → 句子下标。不建索引的话 3 万句两两比是 4.5 亿次,跑不动。 */
const index = new Map();
sents.forEach((x, i) => {
  for (const g of x.g) {
    let arr = index.get(g);
    if (!arr) index.set(g, arr = []);
    arr.push(i);
  }
});

const hits = [];
const exact = [];
const seenPair = new Set();
sents.forEach((a, i) => {
  if (!a.g.size) return;
  const cand = new Set();
  for (const g of a.g) for (const j of index.get(g) || []) {
    if (j !== i && sents[j].bank !== a.bank) cand.add(j);
  }
  for (const j of cand) {
    const key = i < j ? `${i}:${j}` : `${j}:${i}`;
    if (seenPair.has(key)) continue;
    seenPair.add(key);
    const b = sents[j];
    const r = Math.max(overlapRatio(a.g, b.g), overlapRatio(b.g, a.g));
    if (r > THRESHOLD) {
      (a.s === b.s ? exact : hits).push({ r, a, b });
    }
  }
});

hits.sort((x, y) => y.r - x.r);

/* ⚠️ **同一个词在两个库各生成过一份的,不算用户能看见的重复。**
 *    vocab_words 是全局唯一一张表,一个词只有一套例句;
 *    delta 出 SQL 时跨库重复词是"先到先得留一份"的,两份不可能都进库。
 *    所以 cet4/fight ↔ cet6/fight 这种只是本地 JSON 里的冗余,用户看不到。
 *    真正会让用户在**两个不同的词**下读到几乎一样的句子的,是 word 不同的那些对。 */
const sameWord = [...exact, ...hits].filter(h => h.a.word.toLowerCase() === h.b.word.toLowerCase());
const exactUser = exact.filter(h => h.a.word.toLowerCase() !== h.b.word.toLowerCase());
const hitsUser = hits.filter(h => h.a.word.toLowerCase() !== h.b.word.toLowerCase());

console.log(`完全相同的句子(跨库):${exact.length} 对`);
console.log(`重合 > ${THRESHOLD * 100}% 但不完全相同:${hits.length} 对`);
console.log(`其中**同一个词的两份**(只有一份进库,用户看不到):${sameWord.length} 对`);
const total = exactUser.length + hitsUser.length;
console.log(`→ **用户真能撞见的跨词重复:${total} 对**(完全相同 ${exactUser.length} · 近似 ${hitsUser.length})`);
console.log(`   占全部句子的 ${(total * 2 / sents.length * 100).toFixed(2)}%\n`);
exact.length = 0; exact.push(...exactUser);
hits.length = 0; hits.push(...hitsUser);

for (const h of exact.slice(0, 10)) {
  console.log(`【完全相同】${h.a.bank}/${h.a.word} ↔ ${h.b.bank}/${h.b.word}`);
  console.log(`   ${h.a.s}`);
}
for (const h of hits.slice(0, 15)) {
  console.log(`【${(h.r * 100).toFixed(0)}%】${h.a.bank}/${h.a.word} ↔ ${h.b.bank}/${h.b.word}`);
  console.log(`   A: ${h.a.s}`);
  console.log(`   B: ${h.b.s}`);
}

/* ⚠️ 这里**不给 PASS/FAIL 的价值判断** —— 多少算"可以接受"是内容决策,不是机器判据。
   脚本只负责把数字摆出来。 */
console.log(`\nGATE_VERDICT REPORTED total=${total} exact=${exact.length}`);
