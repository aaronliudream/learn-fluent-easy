/**
 * 掌握度查询的真实测 —— 复现 useSemesterMastery 的查询,证明「渲染条件能满足」。
 *
 * 起因:#258 上线后册页没有掌握度行,而 smoke 门是绿的 —— 因为 smoke 只验证页面不崩,
 * 不验证某一行是否真的渲染出来。根因是 publisher 没过 dbPublisherFor:
 * URL 层 pep/fltrp,DB 列存的是 junior/junior_fltrp,直接 .eq 永远查不到行。
 *
 * 本脚本按 hook 的口径逐单元算 total(词汇数 + 语法题数)。
 * total > 0 = 那张卡会渲染掌握度行(mastered 需登录,这里用 anon 只验 total)。
 */
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const env = Object.fromEntries(readFileSync('.env', 'utf8').split(/\r?\n/).filter(l => l.includes('=')).map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const sb = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY);

const arg = (k, d) => (process.argv.find(a => a.startsWith(`--${k}=`))?.split('=')[1]) ?? d;
const FILE = arg('file', 'src/data/juniorHub/grade7.json');
const SEM = arg('sem', 'grade7_volume1');
const GRADE = Number(arg('grade', '7'));
const DBPUB = arg('dbpub', 'junior');   // ← 修复后应传的 DB 层值

const course = Object.values(JSON.parse(readFileSync(FILE, 'utf8')))[0];
const units = course.semesters[SEM]?.units ?? [];
console.log(`${FILE} · ${SEM} · grade=${GRADE} · dbPublisher=${DBPUB} · 单元 ${units.length} 个\n`);

const books = [...new Set(units.map(u => u.book))];
const byUnitWords = {};
for (const book of books) {
  let q = sb.from('junior_vocab').select('id,unit').eq('grade', GRADE).eq('volume', book);
  if (DBPUB) q = q.eq('publisher', DBPUB);
  const { data, error } = await q;
  if (error) { console.log('  vocab 查询失败:', error.message); break; }
  for (const r of data ?? []) {
    const u = units.find(x => x.book === book && x.unitKey === r.unit);
    if (u) (byUnitWords[u.id] ||= []).push(r.id);
  }
}

const codeToUnit = {};
for (const u of units) for (const c of (u.grammarCodes ?? [])) codeToUnit[c] = u.id;
const byUnitQ = {};
const allCodes = Object.keys(codeToUnit);
if (allCodes.length) {
  let pq = sb.from('junior_grammar_points').select('id,code').in('code', allCodes);
  if (DBPUB) pq = pq.eq('publisher', DBPUB);
  const { data: pts } = await pq;
  const pointToUnit = {};
  for (const p of pts ?? []) if (codeToUnit[p.code]) pointToUnit[p.id] = codeToUnit[p.code];
  const ids = Object.keys(pointToUnit);
  for (let i = 0; i < ids.length; i += 100) {
    const { data } = await sb.from('junior_grammar_questions').select('id,point_id').in('point_id', ids.slice(i, i + 100));
    for (const q of data ?? []) if (pointToUnit[q.point_id]) (byUnitQ[pointToUnit[q.point_id]] ||= []).push(q.id);
  }
}

let renderable = 0;
console.log('单元        词汇  语法题  total  会渲染掌握度行?');
for (const u of units) {
  const w = (byUnitWords[u.id] ?? []).length;
  const g = (byUnitQ[u.id] ?? []).length;
  const total = w + g;
  if (total > 0) renderable++;
  console.log(`${String(u.id).padEnd(11)} ${String(w).padStart(4)} ${String(g).padStart(6)} ${String(total).padStart(6)}  ${total > 0 ? '✓ 是' : '✗ 否'}`);
}
console.log(`\nVERIFY_VERDICT: ${renderable === units.length && units.length > 0 ? 'PASS' : 'FAIL'}(${renderable}/${units.length} 个单元 total>0)`);
process.exit(renderable === units.length && units.length > 0 ? 0 : 1);
