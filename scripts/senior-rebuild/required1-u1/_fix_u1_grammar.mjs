// U1 语法三合一修复:① 清12术语题→换12新应用题 ② 剥36"选出"前缀 ③ 全60题确定性打散→15/15/15/15。
// 产出:scripts/required1-u1-grammar-fix.sql(id键UPDATE,幂等:设固定值)+ 同步源文件 + 重导 docs/junior/u1-live/u1-grammar.json。
import { readFileSync, writeFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
const env = Object.fromEntries(readFileSync('.env', 'utf8').split(/\r?\n/).filter(l => l.includes('=')).map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const sb = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY);
const DIR = 'scripts/senior-rebuild/required1-u1/';
const L = ['A', 'B', 'C', 'D'];
const esc = s => String(s).replace(/'/g, "''");
const PREFIX = /^选出[^：:]*[：:]\s*/;
const isTerm = s => /下列哪一?项是.*短语|下列哪一?项不是.*短语/.test(s || '');

// 确定性洗牌(LCG)
function lcgShuffle(arr, seed) { let s = seed >>> 0; const r = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; }
function targets(n, seed) { const t = []; for (let i = 0; i < n; i++) t.push(i % 4); return lcgShuffle(t, seed); }
// 把 correctText 放到目标位,其余按原序填 → {opts, ansIdx}
function place(opts, correctText, want) { const others = opts.filter(o => o !== correctText); const out = []; let oi = 0; for (let p = 0; p < opts.length; p++) out[p] = (p === want) ? correctText : others[oi++]; return { opts: out, ansIdx: want }; }

const NEW = JSON.parse(readFileSync(DIR + 'u1-grammar-new12.json', 'utf8')).new_questions;

// 拉库
const { data: pts } = await sb.from('junior_grammar_points').select('id,code,sort_order').eq('volume', 'required1').eq('unit', 'U1').order('sort_order');
const codeOfPoint = Object.fromEntries(pts.map(p => [p.id, p.code]));
const { data: gq } = await sb.from('junior_grammar_questions').select('id,point_id,sort_order,stem,option_a,option_b,option_c,option_d,correct_answer,explanation').in('point_id', pts.map(p => p.id)).order('sort_order');

// 按点分组,构建 final(每点20题:应用题剥前缀保留 + 术语题换成新题)
const finalByPoint = {}; // code -> [{id, stem, opts, correctText, expl}]
const newQueue = {}; for (const c in NEW) newQueue[c] = NEW[c].slice();
for (const p of pts) finalByPoint[p.code] = [];
for (const q of gq) {
  const code = codeOfPoint[q.point_id];
  const opts0 = [q.option_a, q.option_b, q.option_c, q.option_d];
  if (isTerm(q.stem)) {
    const nq = newQueue[code].shift();
    if (!nq) throw new Error('新题不够:' + code);
    finalByPoint[code].push({ id: q.id, stem: nq.stem, opts: nq.options.slice(), correctText: nq.answer_text, expl: nq.explanation });
  } else {
    const ci = L.indexOf(String(q.correct_answer).trim().toUpperCase());
    finalByPoint[code].push({ id: q.id, stem: q.stem.replace(PREFIX, ''), opts: opts0, correctText: opts0[ci >= 0 ? ci : 0], expl: q.explanation });
  }
}
// 校验新题用尽
for (const c in newQueue) if (newQueue[c].length) throw new Error('新题剩余未用:' + c + ' ' + newQueue[c].length);

// 每点打散(5/5/5/5)
const SEED = { 'r1u1.01': 1101, 'r1u1.02': 2202, 'r1u1.03': 3303 };
for (const code in finalByPoint) {
  const list = finalByPoint[code];
  const tg = targets(list.length, SEED[code]);
  list.forEach((q, i) => { const want = Math.min(tg[i], q.opts.length - 1); const r = place(q.opts, q.correctText, want); q.opts = r.opts; q.ansIdx = r.ansIdx; });
}

// 分布统计
const dist = [0, 0, 0, 0]; Object.values(finalByPoint).flat().forEach(q => dist[q.ansIdx]++);

// 生成 SQL(id 键 UPDATE)
let sql = `-- 必修一 U1 语法三合一修复:清术语换新题 + 剥"选出"前缀 + 打散答案→${dist.map((n,i)=>L[i]+':'+n).join(' ')}。
-- id 键 UPDATE,设固定值=幂等。Aaron service role 跑。共 ${gq.length} 条。
BEGIN;
`;
for (const code in finalByPoint) for (const q of finalByPoint[code]) {
  sql += `UPDATE public.junior_grammar_questions SET stem='${esc(q.stem)}', option_a='${esc(q.opts[0])}', option_b='${esc(q.opts[1])}', option_c='${esc(q.opts[2])}', option_d='${esc(q.opts[3])}', correct_answer='${L[q.ansIdx]}', explanation='${esc(q.expl)}', question_type='mcq' WHERE id='${q.id}';\n`;
}
sql += `COMMIT;
-- 校验
SELECT correct_answer, count(*) FROM public.junior_grammar_questions WHERE point_id IN (SELECT id FROM public.junior_grammar_points WHERE volume='required1' AND unit='U1') GROUP BY correct_answer ORDER BY correct_answer;
SELECT count(*) AS prefixed FROM public.junior_grammar_questions WHERE point_id IN (SELECT id FROM public.junior_grammar_points WHERE volume='required1' AND unit='U1') AND stem ~ '^选出';
SELECT count(*) AS terminology FROM public.junior_grammar_questions WHERE point_id IN (SELECT id FROM public.junior_grammar_points WHERE volume='required1' AND unit='U1') AND stem ~ '下列哪一';
`;
writeFileSync('scripts/required1-u1-grammar-fix.sql', sql);

// 同步源文件 required1-u1-grammar.json
const src = JSON.parse(readFileSync(DIR + 'required1-u1-grammar.json', 'utf8'));
const newQs = [];
for (const p of pts) {
  finalByPoint[p.code].forEach((q, i) => newQs.push({ qid: `${p.code}.q${i + 1}`, volume: 'required1', unit: 'U1', point: src.points?.find(x => x.code === p.code)?.point || p.code, code: p.code, stem: q.stem, options: q.opts, answer_index: q.ansIdx, answer_text: q.opts[q.ansIdx], explanation: q.expl }));
}
src.questions = newQs;
writeFileSync(DIR + 'required1-u1-grammar.json', JSON.stringify(src, null, 2) + '\n');

// 重导 docs/junior/u1-live/u1-grammar.json
const exp = { point_count: pts.length, total_questions: newQs.length, answer_dist: dist.map((n, i) => L[i] + ':' + n).join(' '), points: pts.map(p => ({ code: p.code, question_count: finalByPoint[p.code].length, all_application: true, questions: finalByPoint[p.code].map(q => ({ stem: q.stem, options: q.opts, answer_index: q.ansIdx, answer_text: q.opts[q.ansIdx], explanation: q.expl })) })) };
writeFileSync('docs/junior/u1-live/u1-grammar.json', JSON.stringify(exp, null, 2) + '\n');

console.log('✅ 三合一完成');
console.log('SQL → scripts/required1-u1-grammar-fix.sql (', gq.length, '条 UPDATE)');
console.log('答案分布:', dist.map((n, i) => L[i] + ':' + n).join(' '));
console.log('各点:', pts.map(p => p.code + '=' + finalByPoint[p.code].length).join(' '));
console.log('源文件 + docs/junior/u1-live/u1-grammar.json 已同步重导');
