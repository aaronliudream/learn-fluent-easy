// (A) cloze/listening 结构自审 + 答案分布;(B) 探测 junior_* 表真实列(取 g9 U1 样本行的 keys)。
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
const ROOT = 'C:\\Projects\\learn-fluent-easy\\';
const env = Object.fromEntries(readFileSync(ROOT + '.env', 'utf8').split(/\r?\n/).filter(l => l.includes('=')).map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const sb = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY);
const DIR = ROOT + 'scripts\\senior-rebuild\\required1-u1\\';

function auditChoice(file, listName, qPer, expectGroups) {
  const d = JSON.parse(readFileSync(DIR + file, 'utf8'));
  const groups = d[listName];
  let errs = [], dist = [0, 0, 0, 0], nq = 0, qids = new Set();
  for (const g of groups) {
    const qs = g.questions;
    if (qs.length !== qPer) errs.push(`${g.code}: 题数${qs.length}≠${qPer}`);
    for (const q of qs) {
      nq++;
      if (qids.has(q.qid)) errs.push(`${q.qid} 重复`); qids.add(q.qid);
      if (q.options.length !== 4) errs.push(`${q.qid} 选项≠4`);
      if (new Set(q.options).size !== 4) errs.push(`${q.qid} 选项重复`);
      if (q.answer_index < 0 || q.answer_index > 3) errs.push(`${q.qid} idx 越界`);
      if (q.options[q.answer_index] !== q.answer_text) errs.push(`${q.qid} answer_text 不符`);
      dist[q.answer_index]++;
    }
  }
  console.log(`\n[${file}] 组=${groups.length}(期望${expectGroups}) 题=${nq} 硬错误=${errs.length} 答案分布 A/B/C/D=${dist.join('/')}`);
  errs.forEach(e => console.log('  ❌', e));
  return errs.length === 0 && groups.length === expectGroups;
}

const ok1 = auditChoice('required1-u1-cloze.json', 'passages', 10, 6);
const ok2 = auditChoice('required1-u1-listening.json', 'exercises', 5, 6);
console.log(ok1 && ok2 ? '\n✅ cloze + listening 结构 0 错' : '\n❌ 有错需修');

// ---- 探测 junior_* 列 ----
console.log('\n=== junior_* 表列(g9 U1 样本) ===');
for (const t of ['junior_vocab', 'junior_grammar_points', 'junior_grammar_questions', 'junior_reading', 'junior_cloze', 'junior_listening_exercises', 'junior_writing_prompts']) {
  const { data, error } = await sb.from(t).select('*').eq('volume', 'g9').eq('unit', 'U1').limit(1);
  if (error) { console.log(`  ${t}: ERROR ${error.message}`); continue; }
  if (!data || !data.length) { console.log(`  ${t}: (无 g9/U1 行)`); continue; }
  console.log(`  ${t}: ${Object.keys(data[0]).join(', ')}`);
}
process.exit(0);
