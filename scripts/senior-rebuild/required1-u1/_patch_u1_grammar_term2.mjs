// 语法补丁2:把12道"成分识别"术语题(答案中文)换成12道新应用题。保留各题原答案位→分布仍15/15/15/15。
// 只 UPDATE 这12行(id键);48道保留题不动。同步源文件 + 重导 docs/junior/u1-live/u1-grammar.json。
import { readFileSync, writeFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
const env = Object.fromEntries(readFileSync('.env', 'utf8').split(/\r?\n/).filter(l => l.includes('=')).map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const sb = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY);
const DIR = 'scripts/senior-rebuild/required1-u1/';
const L = ['A', 'B', 'C', 'D'];
const esc = s => String(s).replace(/'/g, "''");
const hasCN = s => /[一-鿿]/.test(String(s || ''));
const NEW = JSON.parse(readFileSync(DIR + 'u1-grammar-new12b.json', 'utf8')).new_questions;

const { data: pts } = await sb.from('junior_grammar_points').select('id,code,sort_order').eq('volume', 'required1').eq('unit', 'U1').order('sort_order');
const codeOf = Object.fromEntries(pts.map(p => [p.id, p.code]));
const { data: gq } = await sb.from('junior_grammar_questions').select('id,point_id,sort_order,stem,option_a,option_b,option_c,option_d,correct_answer,explanation').in('point_id', pts.map(p => p.id)).order('sort_order');

const newQueue = {}; for (const c in NEW) newQueue[c] = NEW[c].slice();
const updates = []; // {id, stem, opts, ansIdx, expl}
const finalAll = []; // 用于源同步/重导(全60)

for (const q of gq) {
  const code = codeOf[q.point_id];
  const opts0 = [q.option_a, q.option_b, q.option_c, q.option_d];
  const isTerm = opts0.some(hasCN); // 成分识别题:选项是中文术语
  if (isTerm) {
    const nq = newQueue[code].shift();
    if (!nq) throw new Error('新题不够:' + code);
    const pos = L.indexOf(String(q.correct_answer).trim().toUpperCase()); // 保留原答案位
    const want = pos >= 0 ? pos : 0;
    const others = nq.options.filter(o => o !== nq.answer_text);
    const out = []; let oi = 0;
    for (let p = 0; p < 4; p++) out[p] = (p === want) ? nq.answer_text : others[oi++];
    updates.push({ id: q.id, stem: nq.stem, opts: out, ansIdx: want, expl: nq.explanation });
    finalAll.push({ code, ps: q.sort_order, stem: nq.stem, options: out, answer_index: want, answer_text: nq.answer_text, explanation: nq.explanation });
  } else {
    const ci = L.indexOf(String(q.correct_answer).trim().toUpperCase());
    finalAll.push({ code, ps: q.sort_order, stem: q.stem, options: opts0, answer_index: ci >= 0 ? ci : 0, answer_text: opts0[ci >= 0 ? ci : 0], explanation: q.explanation });
  }
}
for (const c in newQueue) if (newQueue[c].length) throw new Error('新题剩余:' + c);

// SQL(仅12行)
let sql = `-- 必修一 U1 语法补丁2:12道"成分识别"术语题→12道新应用题(搭配多样,避开已用)。保留原答案位=分布不变(15/15/15/15)。
-- 只 UPDATE 这12行(id键,幂等设固定值)。Aaron 跑。
BEGIN;
`;
for (const u of updates) sql += `UPDATE public.junior_grammar_questions SET stem='${esc(u.stem)}', option_a='${esc(u.opts[0])}', option_b='${esc(u.opts[1])}', option_c='${esc(u.opts[2])}', option_d='${esc(u.opts[3])}', correct_answer='${L[u.ansIdx]}', explanation='${esc(u.expl)}', question_type='mcq' WHERE id='${u.id}';\n`;
sql += `COMMIT;
-- 校验:分布应仍 15/15/15/15;术语(中文答案/下列哪一/选出前缀)应=0
SELECT correct_answer, count(*) FROM public.junior_grammar_questions WHERE point_id IN (SELECT id FROM public.junior_grammar_points WHERE volume='required1' AND unit='U1') GROUP BY correct_answer ORDER BY correct_answer;
SELECT count(*) AS terminology FROM public.junior_grammar_questions WHERE point_id IN (SELECT id FROM public.junior_grammar_points WHERE volume='required1' AND unit='U1') AND (stem ~ '下列哪一' OR stem ~ '^选出' OR option_a ~ '[一-鿿]' OR option_b ~ '[一-鿿]');
`;
writeFileSync('scripts/required1-u1-grammar-patch2.sql', sql);

// 同步源 + 重导(按 code, sort_order 排)
finalAll.sort((a, b) => (a.code < b.code ? -1 : a.code > b.code ? 1 : a.ps - b.ps));
const src = JSON.parse(readFileSync(DIR + 'required1-u1-grammar.json', 'utf8'));
const byCodeIdx = {};
src.questions = finalAll.map(q => { byCodeIdx[q.code] = (byCodeIdx[q.code] || 0) + 1; return { qid: `${q.code}.q${byCodeIdx[q.code]}`, volume: 'required1', unit: 'U1', code: q.code, stem: q.stem, options: q.options, answer_index: q.answer_index, answer_text: q.answer_text, explanation: q.explanation }; });
writeFileSync(DIR + 'required1-u1-grammar.json', JSON.stringify(src, null, 2) + '\n');

const dist = [0, 0, 0, 0]; finalAll.forEach(q => dist[q.answer_index]++);
const byC = {}; pts.forEach(p => byC[p.code] = finalAll.filter(q => q.code === p.code));
const exp = { point_count: 3, total_questions: 60, answer_dist: dist.map((n, i) => L[i] + ':' + n).join(' '), all_application: true, points: pts.map(p => ({ code: p.code, question_count: byC[p.code].length, questions: byC[p.code].map(q => ({ stem: q.stem, options: q.options, answer_index: q.answer_index, answer_text: q.answer_text, explanation: q.explanation })) })) };
writeFileSync('docs/junior/u1-live/u1-grammar.json', JSON.stringify(exp, null, 2) + '\n');

console.log('补丁2: 替换', updates.length, '道成分识别题 → 新应用题');
console.log('SQL → scripts/required1-u1-grammar-patch2.sql (', updates.length, '行 UPDATE)');
console.log('分布:', dist.map((n, i) => L[i] + ':' + n).join(' '));
console.log('中文答案残留:', finalAll.filter(q => hasCN(q.answer_text)).length, '| 下列哪一:', finalAll.filter(q => /下列哪一/.test(q.stem)).length, '| 选出前缀:', finalAll.filter(q => /^选出/.test(q.stem)).length);
console.log('题干唯一:', new Set(finalAll.map(q => q.stem)).size + '/60');
