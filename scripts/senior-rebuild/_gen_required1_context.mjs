// 生成必修一情景闯关题(context_questions, grade=10):用 junior_vocab 真实例句挖空。Aaron 跑产出的 SQL。
import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync } from 'node:fs';
const env = Object.fromEntries(readFileSync('.env', 'utf8').split(/\r?\n/).filter(l => l.includes('=')).map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const sb = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY);
const esc = s => String(s).replace(/'/g, "''");

const all = [];
for (let f = 0; f < 3000; f += 1000) {
  const { data } = await sb.from('junior_vocab').select('word,pos,example_en,unit').eq('volume', 'required1').range(f, f + 999);
  if (!data || !data.length) break;
  all.push(...data);
  if (data.length < 1000) break;
}
const words = all.filter(w => w.example_en && w.example_en.trim());
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

let sql = '-- 必修一 情景闯关题(context_questions, grade=10),由 junior_vocab 真实例句挖空生成。Aaron 跑。\n';
sql += '-- ContextQuiz 高中按 grade=10 + volume 读;写 volume/unit 防必修一/二/三串库。幂等(只删本册)。\nBEGIN;\n';
sql += "DELETE FROM public.context_questions WHERE grade=10 AND volume='required1';\n";
for (const r of rows) {
  sql += `INSERT INTO public.context_questions (grade, volume, unit, word, sentence, options, answer) VALUES (10, 'required1', '${esc(r.unit)}', '${esc(r.word)}', '${esc(r.sentence)}', '${esc(JSON.stringify(r.options))}'::jsonb, '${esc(r.answer)}');\n`;
}
sql += "\nCOMMIT;\nSELECT count(*) AS context_q_required1 FROM public.context_questions WHERE grade=10 AND volume='required1';\n";
writeFileSync('SQLAA/required1-context-questions-load.sql', sql);
console.log('生成情景题:', rows.length, '| 跳过(例句无干净词形或干扰项不足):', skip, '| -> SQLAA/required1-context-questions-load.sql');
// 自检:每题选项含答案、4选项、无重复
let bad = 0;
for (const r of rows) { if (!r.options.includes(r.answer) || r.options.length !== 4 || new Set(r.options).size !== 4 || !r.sentence.includes('___')) bad++; }
console.log('自检坏题:', bad);
