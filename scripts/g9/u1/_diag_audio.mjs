import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
const env = Object.fromEntries(readFileSync('C:\\Projects\\learn-fluent-easy\\.env', 'utf8').split(/\r?\n/).filter(l => l.includes('=')).map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const sb = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY);
const out = (...a) => console.log(...a);

out('=== junior_listening_exercises audio_url 填充率(按 volume) ===');
const { data } = await sb.from('junior_listening_exercises').select('volume,unit,title,audio_url,duration_sec');
const byVol = {};
for (const r of data ?? []) {
  const v = r.volume ?? '∅';
  (byVol[v] ??= { n: 0, withUrl: 0 });
  byVol[v].n++;
  if (r.audio_url && String(r.audio_url).trim()) byVol[v].withUrl++;
}
for (const v of Object.keys(byVol).sort()) out(`  ${v}: ${byVol[v].withUrl}/${byVol[v].n} 有 audio_url`);

out('\n=== g9/U1 两条听力 audio_url 明细 ===');
for (const r of (data ?? []).filter(r => r.volume === 'g9' && r.unit === 'U1'))
  out(`  [${r.title}] audio_url=${r.audio_url ?? 'NULL'} | duration_sec=${r.duration_sec ?? 'NULL'}`);

out('\n=== 8A/U1 听力 audio_url 明细 ===');
for (const r of (data ?? []).filter(r => r.volume === '8A' && r.unit === 'U1'))
  out(`  [${r.title}] audio_url=${r.audio_url ?? 'NULL'} | duration_sec=${r.duration_sec ?? 'NULL'}`);
process.exit(0);
