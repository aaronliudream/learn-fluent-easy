/**
 * 高中线内容完整度普查 —— 按 publisher × volume 列词汇/语法题/阅读/听力数量。
 * 用途:判断哪些册是满的、哪些是空壳,给选版页副标题文案提供事实依据(别凭记忆)。
 */
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const env = Object.fromEntries(readFileSync('.env', 'utf8').split(/\r?\n/).filter(l => l.includes('=')).map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const sb = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY);

const PUBS = ['pep', 'sufe', 'fltrp'];
const GRADES = [10, 11, 12];

const count = async (table, filters) => {
  let q = sb.from(table).select('id', { count: 'exact', head: true });
  for (const [k, v] of Object.entries(filters)) q = q.eq(k, v);
  const { count: c, error } = await q;
  return error ? `ERR` : (c ?? 0);
};

// 先拿到每家出版社实际存在的 volume 列表(从词汇表取,覆盖面最广)
const rows = [];
for (const pub of PUBS) {
  const vols = new Set();
  for (const g of GRADES) {
    const { data } = await sb.from('junior_vocab').select('volume').eq('publisher', pub).eq('grade', g).limit(1000);
    for (const r of data ?? []) vols.add(`${g}|${r.volume}`);
    const { data: d2 } = await sb.from('junior_reading').select('volume').eq('publisher', pub).eq('grade', g).limit(1000);
    for (const r of d2 ?? []) vols.add(`${g}|${r.volume}`);
  }
  for (const key of [...vols].sort()) {
    const [g, volume] = key.split('|');
    const grade = Number(g);
    const vocab = await count('junior_vocab', { publisher: pub, grade, volume });
    const reading = await count('junior_reading', { publisher: pub, grade, volume });
    const listening = await count('junior_listening_exercises', { publisher: pub, grade, volume });
    // 语法:先取该册的 point,再数题
    const { data: pts } = await sb.from('junior_grammar_points').select('id').eq('publisher', pub).eq('grade', grade).eq('volume', volume);
    let gq = 0;
    const ids = (pts ?? []).map(p => p.id);
    for (let i = 0; i < ids.length; i += 100) {
      const { count: c } = await sb.from('junior_grammar_questions').select('id', { count: 'exact', head: true }).in('point_id', ids.slice(i, i + 100));
      gq += c ?? 0;
    }
    rows.push({ pub, grade, volume, vocab, points: ids.length, gq, reading, listening });
  }
}

console.log('%s %s %s %s %s %s %s',
  'publisher'.padEnd(8), 'grade'.padEnd(5), 'volume'.padEnd(12),
  '词汇'.padStart(6), '语法点/题'.padStart(10), '阅读'.padStart(5), '听力'.padStart(5));
console.log('-'.repeat(72));
let cur = '';
for (const r of rows) {
  if (r.pub !== cur) { console.log(''); cur = r.pub; }
  console.log('%s %s %s %s %s %s %s',
    r.pub.padEnd(8), String(r.grade).padEnd(5), r.volume.padEnd(12),
    String(r.vocab).padStart(6), `${r.points}/${r.gq}`.padStart(10),
    String(r.reading).padStart(5), String(r.listening).padStart(5));
}
const empty = rows.filter(r => r.vocab === 0 && r.gq === 0 && r.reading === 0 && r.listening === 0);
console.log(`\n共 ${rows.length} 册有数据痕迹,其中四项全 0 的空壳 ${empty.length} 册`);
