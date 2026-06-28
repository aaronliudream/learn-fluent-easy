// 生成选择性必修二情景闯关题(context_questions, grade=10, volume='elective2'):从本地 vocab JSON 真实例句挖空。
// 不依赖 DB(直接读 5 个单元 vocab 文件),与 required1 同算法。Aaron 跑产出 SQL。幂等(只删本册)。
import { readFileSync, writeFileSync } from 'node:fs';
import { VOL, META } from './_meta.mjs';
const esc = s => String(s).replace(/'/g, "''");

const all = [];
for (const u of Object.keys(META)) {
  const m = META[u];
  const vf = JSON.parse(readFileSync(`scripts/senior-rebuild/elective2/${u}/${VOL}-${u}-vocab.json`, 'utf8'));
  vf.words.forEach(w => { if (w.example_en && w.example_en.trim()) all.push({ word: w.word, pos: w.pos, example_en: w.example_en, unit: m.unit }); });
}
const words = all;
const pool = words.map(w => w.word);
const rows = [];
let skip = 0;
for (const w of words) {
  const base = w.word.split('/')[0].trim();
  const reSrc = '\\b' + base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\w*\\b';
  const re = new RegExp(reSrc, 'i');
  const m = w.example_en.match(re);
  if (!m) { skip++; continue; }
  const sentence = w.example_en.replace(re, '___');
  const samePos = words.filter(x => x.word !== w.word && x.pos === w.pos).map(x => x.word);
  const fallback = pool.filter(x => x !== w.word);
  const src = samePos.length >= 3 ? samePos : fallback;
  const picks = [];
  for (let k = 0; picks.length < 3 && k < 300; k++) {
    const idx = (w.word.charCodeAt(0) + k * 7 + w.word.length) % src.length;
    const c = src[idx];
    if (c && c !== w.word && c.split('/')[0].trim() !== base && !picks.includes(c)) picks.push(c.split('/')[0].trim());
  }
  if (picks.length < 3) { skip++; continue; }
  const opts = [base, ...picks].sort((a, b) => ((w.word.charCodeAt(1) || 0) + a.length) % 5 - (((w.word.charCodeAt(1) || 0) + b.length) % 5));
  rows.push({ word: base, sentence, options: opts, answer: base, unit: w.unit });
}

let sql = '-- 选择性必修二 情景闯关题(context_questions, grade=10),由本地 vocab 真实例句挖空生成。Aaron 跑。\n';
sql += '-- ContextQuiz 高中按 grade=10 + volume 读;写 volume/unit 防串库。幂等(只删本册)。\nBEGIN;\n';
sql += "DELETE FROM public.context_questions WHERE volume='elective2';\n";
for (const r of rows) {
  sql += `INSERT INTO public.context_questions (grade, volume, unit, word, sentence, options, answer) VALUES (11, 'elective2', '${esc(r.unit)}', '${esc(r.word)}', '${esc(r.sentence)}', '${esc(JSON.stringify(r.options))}'::jsonb, '${esc(r.answer)}');\n`;
}
sql += "\nCOMMIT;\nSELECT unit, count(*) FROM public.context_questions WHERE volume='elective2' GROUP BY unit ORDER BY unit;\n";
sql += "SELECT count(*) AS context_q_elective2 FROM public.context_questions WHERE volume='elective2';\n";
writeFileSync('SQLAA/elective2-context-questions-load.sql', sql);
console.log('生成情景题:', rows.length, '| 跳过:', skip, '| -> SQLAA/elective2-context-questions-load.sql');
let bad = 0;
for (const r of rows) { if (!r.options.includes(r.answer) || r.options.length !== 4 || new Set(r.options).size !== 4 || !r.sentence.includes('___')) bad++; }
console.log('自检坏题:', bad);
