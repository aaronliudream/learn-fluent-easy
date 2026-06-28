// 外研社(fltrp)必修一 情景闯关题(context_questions, grade=10, volume='required1', publisher='fltrp')。
// 从本地 vocab JSON 真实例句挖空。DELETE 按 publisher+volume(只删 fltrp 本册,不动人教)。
import { readFileSync, writeFileSync } from 'node:fs';
import { VOL, GRADE, META, PUBLISHER } from './_meta.mjs';
const esc = s => String(s).replace(/'/g, "''");
const PUB = PUBLISHER;

const all = [];
for (const u of Object.keys(META)) {
  const m = META[u];
  const vf = JSON.parse(readFileSync(`scripts/senior-rebuild/fltrp-${VOL}/${u}/${VOL}-${u}-vocab.json`, 'utf8'));
  vf.words.forEach(w => { if (w.example_en && w.example_en.trim()) all.push({ word: w.word, pos: w.pos, example_en: w.example_en, unit: m.unit }); });
}
const words = all, pool = words.map(w => w.word), rows = [];
let skip = 0;
for (const w of words) {
  const base = w.word.split('/')[0].trim();
  const re = new RegExp('\\b' + base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\w*\\b', 'i');
  const mm = w.example_en.match(re);
  if (!mm) { skip++; continue; }
  const sentence = w.example_en.replace(re, '___');
  const samePos = words.filter(x => x.word !== w.word && x.pos === w.pos).map(x => x.word);
  const src = samePos.length >= 3 ? samePos : pool.filter(x => x !== w.word);
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

let sql = `-- 外研社(fltrp)必修一 情景闯关题(context_questions, grade=${GRADE}, volume='${VOL}', publisher='${PUB}')。Aaron 跑。幂等(只删 fltrp 本册)。\nBEGIN;\n`;
sql += `DELETE FROM public.context_questions WHERE publisher='${PUB}' AND volume='${VOL}';\n`;
for (const r of rows) {
  sql += `INSERT INTO public.context_questions (grade, volume, unit, word, sentence, options, answer, publisher) VALUES (${GRADE}, '${VOL}', '${esc(r.unit)}', '${esc(r.word)}', '${esc(r.sentence)}', '${esc(JSON.stringify(r.options))}'::jsonb, '${esc(r.answer)}', '${PUB}');\n`;
}
sql += `\nCOMMIT;\nSELECT unit, count(*) FROM public.context_questions WHERE publisher='${PUB}' AND volume='${VOL}' GROUP BY unit ORDER BY unit;\n`;
sql += `SELECT count(*) AS context_q_fltrp_${VOL} FROM public.context_questions WHERE publisher='${PUB}' AND volume='${VOL}';\n`;
writeFileSync(`SQLAA/fltrp-${VOL}-context-questions-load.sql`, sql);
console.log('生成情景题:', rows.length, '| 跳过:', skip, `| -> SQLAA/fltrp-${VOL}-context-questions-load.sql`);
let bad = 0;
for (const r of rows) { if (!r.options.includes(r.answer) || r.options.length !== 4 || new Set(r.options).size !== 4 || !r.sentence.includes('___')) bad++; }
console.log('自检坏题:', bad);
