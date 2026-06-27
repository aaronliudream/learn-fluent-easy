// 完形答案位置调匀:把每题正确项重排到目标位置(选项集/正确答案不变,仅换 A/B/C/D 位置)。
// 目标序列 [0,2,3,1] 循环 → 60 题精确 15/15/15/15,且非单调 ABCD。
import { readFileSync, writeFileSync } from 'node:fs';
const F = 'C:\\Projects\\learn-fluent-easy\\scripts\\senior-rebuild\\required1-u1\\required1-u1-cloze.json';
const c = JSON.parse(readFileSync(F, 'utf8'));
const PATTERN = [0, 2, 3, 1];
let i = 0;
for (const p of c.passages) {
  for (const q of p.questions) {
    const t = PATTERN[i % 4];
    i++;
    const correct = q.options[q.answer_index];
    const others = q.options.filter((_, j) => j !== q.answer_index); // 保持原相对顺序
    const newOpts = [];
    let oi = 0;
    for (let pos = 0; pos < 4; pos++) newOpts[pos] = pos === t ? correct : others[oi++];
    q.options = newOpts;
    q.answer_index = t;
    q.answer_text = correct; // 不变,确认对齐
  }
}
writeFileSync(F, JSON.stringify(c, null, 2));
// 自审
let e = 0; const dist = [0, 0, 0, 0]; const seen = new Set();
for (const p of c.passages) for (const q of p.questions) {
  if (q.options.length !== 4 || new Set(q.options).size !== 4) e++;
  if (q.options[q.answer_index] !== q.answer_text) e++;
  if (seen.has(q.qid)) e++; seen.add(q.qid);
  dist[q.answer_index]++;
}
console.log('题', seen.size, '| 硬错误', e, '| 答案 A/B/C/D =', dist.join('/'));
console.log(e === 0 ? '✅ 调匀后:答案仍唯一(answer_text==options[idx])、选项无重复、0 错' : '❌ 有错');
