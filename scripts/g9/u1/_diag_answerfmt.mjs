import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
const env = Object.fromEntries(readFileSync('C:\\Projects\\learn-fluent-easy\\.env', 'utf8').split(/\r?\n/).filter(l => l.includes('=')).map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const sb = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY);
const out = (...a) => console.log(...a);

out('=== 8年级 junior_cloze 样本(任意g8;无g8则任意)questions[0..1] ===');
{
  let { data } = await sb.from('junior_cloze').select('volume,unit,title,questions').eq('grade', 8).limit(1);
  if (!data || !data.length) ({ data } = await sb.from('junior_cloze').select('volume,unit,title,questions').limit(1));
  const r = data[0];
  out(`  [${r.volume}/${r.unit}] ${r.title}`);
  for (const q of (r.questions || []).slice(0, 2)) out('   q=', JSON.stringify(q));
}
out('\n=== 8年级 junior_listening_exercises 样本(8A/U1)questions[0..1] ===');
{
  const { data } = await sb.from('junior_listening_exercises').select('volume,unit,title,questions').eq('volume', '8A').eq('unit', 'U1').limit(1);
  const r = data[0];
  out(`  [${r.volume}/${r.unit}] ${r.title}`);
  for (const q of (r.questions || []).slice(0, 2)) out('   q=', JSON.stringify(q));
}
process.exit(0);
