// 多义卡检测器:扫同词既在名词位(前接 the/a/my.. 或后接 of)又在动词位(前接情态/助动/let/主语)≥2次 → 高危多词性。
import { readFileSync } from "node:fs";
const book = JSON.parse(readFileSync("scripts/library/books/fir-tree.json", "utf8"));
const sents = book.chapters.flatMap((c) => c.paragraphs.flat().map((s) => s.en));

const DET = new Set(["the", "a", "an", "his", "her", "its", "their", "my", "your", "this", "that", "these", "those", "each", "every", "no", "some", "any", "one", "two", "many", "such", "large", "little", "great", "old", "young", "whole"]);
const VERBCUE = new Set(["to", "will", "would", "shall", "should", "can", "could", "may", "might", "must", "do", "does", "did", "let", "not", "never", "would", "i", "he", "she", "they", "we", "you", "who", "and"]);
const FUNC = new Set(["the", "a", "an", "and", "or", "but", "of", "to", "in", "on", "at", "for", "with", "as", "by", "from", "it", "he", "she", "they", "we", "you", "i", "his", "her", "its", "their", "my", "was", "were", "is", "are", "be", "been", "had", "has", "have", "not", "so", "that", "this", "which", "who", "what", "when", "then", "there", "here", "him", "them", "up", "out", "off", "all", "no", "one", "would", "could", "should"]);

const nounPos = new Map(), verbPos = new Map();
for (const s of sents) {
  const toks = (s.toLowerCase().match(/[a-z]+(?:'[a-z]+)?/g) || []);
  for (let i = 0; i < toks.length; i++) {
    const w = toks[i]; if (w.length < 3 || FUNC.has(w)) continue;
    const prev = toks[i - 1], next = toks[i + 1];
    if ((prev && DET.has(prev)) || next === "of") nounPos.set(w, (nounPos.get(w) || 0) + 1);
    if (prev && VERBCUE.has(prev)) verbPos.set(w, (verbPos.get(w) || 0) + 1);
  }
}
const hot = [];
for (const w of new Set([...nounPos.keys(), ...verbPos.keys()])) {
  const n = nounPos.get(w) || 0, v = verbPos.get(w) || 0;
  if (n >= 2 && v >= 2) hot.push([w, n, v]);
}
hot.sort((a, b) => (b[1] + b[2]) - (a[1] + a[2]));
console.log(`高危多词性候选(名词位≥2 且 动词位≥2):${hot.length}`);
for (const [w, n, v] of hot) console.log(`  ${w.padEnd(12)} 名词位${n} / 动词位${v}`);
if (!hot.length) console.log("  (无 —— 短篇,词多为单词性,Layer⑦ 空)");
