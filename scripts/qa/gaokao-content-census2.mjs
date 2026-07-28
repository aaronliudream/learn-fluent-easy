/** 高中线普查第二层:完形篇数、听力音频缺口、阅读题数、语法题挂点情况。 */
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const env = Object.fromEntries(readFileSync('.env', 'utf8').split(/\r?\n/).filter(l => l.includes('=')).map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const sb = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY);

const PUBS = ['pep', 'sufe', 'fltrp'];
const VOLS = ['required1', 'required2', 'required3', 'elective1', 'elective2', 'elective3', 'elective4'];

const cnt = async (t, f) => {
  let q = sb.from(t).select('id', { count: 'exact', head: true });
  for (const [k, v] of Object.entries(f)) q = v === null ? q.is(k, null) : q.eq(k, v);
  const { count, error } = await q;
  return error ? `ERR(${error.message.slice(0, 30)})` : (count ?? 0);
};

console.log('pub    volume       完形  听力  无音频  阅读  阅读题');
console.log('-'.repeat(58));
const totals = {};
for (const pub of PUBS) {
  totals[pub] = { cloze: 0, listen: 0, noAudio: 0, read: 0, rq: 0 };
  for (const volume of VOLS) {
    const cloze = await cnt('junior_cloze', { publisher: pub, volume });
    const listen = await cnt('junior_listening_exercises', { publisher: pub, volume });
    const noAudio = await cnt('junior_listening_exercises', { publisher: pub, volume, audio_url: null });
    const read = await cnt('junior_reading', { publisher: pub, volume });
    // 阅读题:junior_reading 每行的 questions 是 jsonb 数组,数总题数
    const { data: rrows } = await sb.from('junior_reading').select('questions').eq('publisher', pub).eq('volume', volume);
    const rq = (rrows ?? []).reduce((s, r) => s + (Array.isArray(r.questions) ? r.questions.length : 0), 0);
    for (const [k, v] of Object.entries({ cloze, listen, noAudio, read, rq })) if (typeof v === 'number') totals[pub][k] += v;
    console.log(`${pub.padEnd(6)} ${volume.padEnd(12)} ${String(cloze).padStart(4)} ${String(listen).padStart(5)} ${String(noAudio).padStart(6)} ${String(read).padStart(5)} ${String(rq).padStart(6)}`);
  }
  console.log('');
}
console.log('合计:');
for (const [p, t] of Object.entries(totals)) {
  console.log(`  ${p.padEnd(6)} 完形 ${t.cloze} · 听力 ${t.listen}(缺音频 ${t.noAudio}) · 阅读 ${t.read} 篇/${t.rq} 题`);
}
