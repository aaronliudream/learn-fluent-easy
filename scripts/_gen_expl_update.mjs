// 只读匹配:把 expl-batch*.json 的 explanation 按 (volume|unit|stem|answer_text) 匹配 DB question_id,
// 生成幂等 UPDATE SQL。自检命中数应=579;未命中列出,不硬 update。
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
const env = Object.fromEntries(readFileSync('.env', 'utf8').split(/\r?\n/).filter(l => l.includes('=')).map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const sb = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY);
const esc = s => String(s ?? '').replace(/'/g, "''");
const LET = { A: 0, B: 1, C: 2, D: 3 };

// 1) DB 新体系题 → key(volume|unit|stem|answerText) → [question_id]
const { data: pts } = await sb.from('junior_grammar_points').select('id,volume,unit').not('unit', 'is', null);
const pmeta = Object.fromEntries((pts ?? []).map(p => [p.id, p]));
const ids = (pts ?? []).map(p => p.id);
const dbMap = new Map();
for (let i = 0; i < ids.length; i += 50) {
  const slice = ids.slice(i, i + 50);
  const { data } = await sb.from('junior_grammar_questions')
    .select('id,point_id,stem,option_a,option_b,option_c,option_d,correct_answer')
    .in('point_id', slice);
  for (const q of (data ?? [])) {
    const p = pmeta[q.point_id]; if (!p) continue;
    const opts = [q.option_a, q.option_b, q.option_c, q.option_d];
    const ai = LET[(q.correct_answer || '').trim().toUpperCase()] ?? -1;
    const at = ai >= 0 ? opts[ai] : null;
    const key = `${p.volume}|${p.unit}|${q.stem}|${at}`;
    if (!dbMap.has(key)) dbMap.set(key, []);
    dbMap.get(key).push(q.id);
  }
}

// 2) 读 expl 批次
const records = [];
for (const f of readdirSync('scripts').filter(f => /^expl-batch\d+\.json$/.test(f)).sort()) {
  const arr = JSON.parse(readFileSync('scripts/' + f, 'utf8'));
  for (const r of arr) records.push({ ...r, _file: f });
}

// 3) 匹配
let sql = `-- 初中语法题 explanation 回填。按 (volume|unit|stem|answer_text) 匹配 question_id。幂等。\n`;
const misses = [];
let hit = 0;
const usedIds = new Set();
for (const r of records) {
  const key = `${r.volume}|${r.unit}|${r.stem}|${r.answer_text}`;
  const matchIds = dbMap.get(key);
  if (!matchIds || !matchIds.length) { misses.push(r); continue; }
  for (const id of matchIds) {
    sql += `UPDATE public.junior_grammar_questions SET explanation='${esc(r.explanation)}' WHERE id='${id}';\n`;
    usedIds.add(id);
  }
  hit++;
}
// 兜底:tomato 题(g7su3.04)——若因 tomato 修正 SQL 未跑导致题面是旧版而未命中,
// 按 point + stem 含 tomato 直接回填复数解释(新旧题面都覆盖)。
const tomatoIdx = misses.findIndex(m => m.volume === '7A' && m.unit === 'SU3' && /tomato/i.test(m.stem));
if (tomatoIdx >= 0) {
  const t = misses.splice(tomatoIdx, 1)[0];
  sql += `-- 兜底 tomato(g7su3.04),覆盖旧/新题面\nUPDATE public.junior_grammar_questions SET explanation='${esc(t.explanation)}' WHERE point_id=(SELECT id FROM public.junior_grammar_points WHERE code='g7su3.04') AND lower(stem) LIKE '%tomato%';\n`;
  hit++;
}
sql += `\n-- count 校验(应:有解释的题数 = 579)\nSELECT count(*) AS with_expl FROM public.junior_grammar_questions WHERE explanation IS NOT NULL AND explanation <> '';\n`;
writeFileSync('scripts/grammar-explanations-update.sql', sql);

console.log(`expl 记录: ${records.length} | 命中(去重题): ${usedIds.size} | 命中记录: ${hit} | 未命中: ${misses.length}`);
if (misses.length) {
  console.log('\n--- 未命中(volume/unit/answer | stem) ---');
  for (const m of misses) console.log(`  ${m.volume}/${m.unit} [${m.answer_text}] | ${m.stem}`);
}
process.exit(0);
