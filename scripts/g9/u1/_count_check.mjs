import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
const env = Object.fromEntries(readFileSync('.env', 'utf8').split(/\r?\n/).filter(l => l.includes('=')).map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const sb = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY);
async function c(tbl) {
  const { count } = await sb.from(tbl).select('*', { count: 'exact', head: true }).eq('volume', 'g9').eq('unit', 'U1');
  return count ?? 0;
}
// grammar_questions 经 point 关联
const { data: pts } = await sb.from('junior_grammar_points').select('id').eq('volume', 'g9').eq('unit', 'U1');
const pids = (pts ?? []).map(p => p.id);
let gq = 0;
if (pids.length) { const { count } = await sb.from('junior_grammar_questions').select('*', { count: 'exact', head: true }).in('point_id', pids); gq = count ?? 0; }
const rows = [
  ['vocab', await c('junior_vocab'), 29],
  ['grammar_points', pids.length, 3],
  ['grammar_questions', gq, 60],
  ['reading', await c('junior_reading'), 6],
  ['cloze', await c('junior_cloze'), 1],
  ['listening', await c('junior_listening_exercises'), 2],
  ['writing', await c('junior_writing_prompts'), 1],
];
let total = 0, ok = true;
for (const [t, a, e] of rows) { total += a; const m = a === e ? '✅' : '❌'; if (a !== e) ok = false; console.log(`${m} ${t.padEnd(18)} actual=${a}  expected=${e}`); }
console.log(`\n合计 actual=${total} / expected=102  ${ok && total === 102 ? '✅ 全部一致' : '❌ 有出入'}`);
process.exit(0);
