// U1 reading/cloze/listening 答案确定性打散(全A/偏斜 → 均匀)。保留所有字段(q/explanation/type)。
// 产出 scripts/required1-u1-rcl-fix.sql(id键 jsonb UPDATE,设固定值=幂等)+ 重导 docs 三文件。
import { readFileSync, writeFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
const env = Object.fromEntries(readFileSync('.env', 'utf8').split(/\r?\n/).filter(l => l.includes('=')).map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const sb = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY);
const L = ['A', 'B', 'C', 'D'];
const esc = s => String(s).replace(/'/g, "''");
function lcgShuffle(arr, seed) { let s = seed >>> 0; const r = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; }
function targets(n, seed) { const t = []; for (let i = 0; i < n; i++) t.push(i % 4); return lcgShuffle(t, seed); }

async function fixRelation(table, seed) {
  const { data: rows } = await sb.from(table).select('id,questions').eq('grade', 10).eq('volume', 'required1').eq('unit', 'U1').order('id');
  // 展平(带 row 归属)
  const flat = [];
  rows.forEach(r => (Array.isArray(r.questions) ? r.questions : []).forEach((q, qi) => flat.push({ rid: r.id, qi, q })));
  const tg = targets(flat.length, seed);
  const distBefore = [0, 0, 0, 0], distAfter = [0, 0, 0, 0];
  // 重排
  const byRow = {};
  flat.forEach((item, k) => {
    const q = item.q;
    const opts = Array.isArray(q.options) ? q.options : [];
    const ci = L.indexOf(String(q.answer).trim().toUpperCase());
    distBefore[ci >= 0 ? ci : 0]++;
    const correctText = opts[ci >= 0 ? ci : 0];
    const want = Math.min(tg[k], opts.length - 1);
    const others = opts.filter((_, i) => i !== (ci >= 0 ? ci : 0));
    const out = []; let oi = 0;
    for (let p = 0; p < opts.length; p++) out[p] = (p === want) ? correctText : others[oi++];
    distAfter[want]++;
    const nq = { ...q, options: out, answer: L[want] };
    (byRow[item.rid] = byRow[item.rid] || {});
    byRow[item.rid][item.qi] = nq;
  });
  // 重建每行 questions(按 qi 顺序)
  let sql = '';
  const rebuiltRows = [];
  for (const r of rows) {
    const orig = Array.isArray(r.questions) ? r.questions : [];
    const rebuilt = orig.map((q, qi) => byRow[r.id]?.[qi] ?? q);
    sql += `UPDATE public.${table} SET questions='${esc(JSON.stringify(rebuilt))}'::jsonb WHERE id='${r.id}';\n`;
    rebuiltRows.push({ id: r.id, questions: rebuilt });
  }
  return { sql, rebuiltRows, distBefore: distBefore.map((n, i) => L[i] + ':' + n).join(' '), distAfter: distAfter.map((n, i) => L[i] + ':' + n).join(' '), n: flat.length };
}

const rd = await fixRelation('junior_reading', 7001);
const cz = await fixRelation('junior_cloze', 7002);
const ls = await fixRelation('junior_listening_exercises', 7003);

let sql = `-- 必修一 U1 reading/cloze/listening 答案确定性打散(全A/偏斜→均匀)。id键 jsonb UPDATE,设固定值=幂等。Aaron 跑。
BEGIN;
-- 阅读 ${rd.n}题:${rd.distBefore} → ${rd.distAfter}
${rd.sql}-- 完形 ${cz.n}空:${cz.distBefore} → ${cz.distAfter}
${cz.sql}-- 听力 ${ls.n}题:${ls.distBefore} → ${ls.distAfter}
${ls.sql}COMMIT;
`;
writeFileSync('scripts/required1-u1-rcl-fix.sql', sql);
console.log('SQL → scripts/required1-u1-rcl-fix.sql');
console.log('阅读:', rd.distBefore, '→', rd.distAfter);
console.log('完形:', cz.distBefore, '→', cz.distAfter);
console.log('听力:', ls.distBefore, '→', ls.distAfter);
