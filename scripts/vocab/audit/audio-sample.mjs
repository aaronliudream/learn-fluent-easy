/* 第三节⑥:音频链路抽样 50 条 HEAD */
import { loadEnv } from '../env.mjs';
const env = loadEnv(process.cwd(), { quiet: true });
const U = env.VITE_SUPABASE_URL, K = env.VITE_SUPABASE_PUBLISHABLE_KEY;
const H = { apikey:K, Authorization:`Bearer ${K}` };
const q = async p => (await fetch(`${U}/rest/v1/${p}`, { headers:H })).json();
const src = [
  ['vocab_words', await q('vocab_words?select=headword,audio_url&audio_url=not.is.null&limit=8')],
  ['vocab_examples', await q('vocab_examples?select=id,audio_url&audio_url=not.is.null&limit=4')],
  ['vocab_collocations', await q('vocab_collocations?select=collocation,audio_url&audio_url=not.is.null&limit=4')],
  ['vocab_chunks', await q('vocab_chunks?select=chunk,audio_url&audio_url=not.is.null&limit=3')],
  ['vocab_scene_items', await q('vocab_scene_items?select=text_en,audio_url&audio_url=not.is.null&limit=3')],
];
let ok=0, bad=[];
for (const [t, rows] of src) for (const r of rows) {
  try {
    const res = await fetch(r.audio_url, { method:'GET', headers:{ Range:'bytes=0-1' } });
    const len = res.headers.get('content-range')?.split('/')[1] ?? res.headers.get('content-length');
    if (res.ok && Number(len) > 0) ok++;
    else bad.push(`${t} ${r.headword||r.collocation||r.chunk||r.text_en||r.id} HTTP${res.status} len=${len}`);
  } catch(e){ bad.push(`${t} ${r.headword||r.id} 取不到: ${String(e).slice(0,50)}`); }
}
console.log(`音频抽样 ${ok+bad.length} 条 · 正常 ${ok} · 异常 ${bad.length}`);
bad.slice(0,10).forEach(x=>console.log('  ✗ '+x));
