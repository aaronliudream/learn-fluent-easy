/* 第四节:数据完整性核对 —— 逐表声称数 vs 实际数 */
import { loadEnv } from '../env.mjs';
const env = loadEnv(process.cwd(), { quiet: true });
const U = env.VITE_SUPABASE_URL, K = env.VITE_SUPABASE_PUBLISHABLE_KEY;
const H = { apikey:K, Authorization:`Bearer ${K}` };
const cnt = async p => {
  const r = await fetch(`${U}/rest/v1/${p}${p.includes('?')?'&':'?'}select=*&limit=1`, { headers:{...H,Prefer:'count=exact'} });
  return r.ok ? Number(r.headers.get('content-range')?.split('/')[1] ?? -1) : `✗${r.status}`;
};
const q = async p => (await fetch(`${U}/rest/v1/${p}`, { headers:H })).json();

console.log('## 表行数');
for (const t of ['vocab_words','vocab_examples','vocab_collocations','vocab_chunks',
  'vocab_confusion_groups','vocab_confusion_members','vocab_cn_expressions','vocab_cn_renditions',
  'vocab_scene_packs','vocab_scene_items','vocab_word_banks','vocab_banks','vocab_dictionary']) {
  console.log(`  ${t.padEnd(26)} ${await cnt(t)}`);
}

console.log('\n## vocab_banks.total_words 声称 vs 实际挂载');
const banks = await q('vocab_banks?select=id,code,total_words,is_active&order=code');
for (const b of banks) {
  const n = await cnt(`vocab_word_banks?bank_id=eq.${b.id}`);
  const diff = Number(n) - b.total_words;
  console.log(`  ${b.code.padEnd(10)} 声称 ${String(b.total_words).padStart(5)} · 实际 ${String(n).padStart(5)} · 差 ${diff>0?'+':''}${diff}${b.is_active?'  [active]':''}`);
}

console.log('\n## 应有内容却为空的字段');
const checks = [
  ['vocab_words 无 def_zh', 'vocab_words?def_zh=is.null'],
  ['vocab_words 无 audio_url', 'vocab_words?audio_url=is.null'],
  ['vocab_words 无 ipa', 'vocab_words?ipa=is.null'],
  ['vocab_examples 无 translation_zh', 'vocab_examples?translation_zh=is.null'],
  ['vocab_examples 无 audio_url', 'vocab_examples?audio_url=is.null'],
  ['vocab_collocations 无 translation_zh', 'vocab_collocations?translation_zh=is.null'],
  ['vocab_collocations 无 audio_url', 'vocab_collocations?audio_url=is.null'],
  ['vocab_chunks 无 example_en', 'vocab_chunks?example_en=is.null'],
  ['vocab_chunks 无 audio_url', 'vocab_chunks?audio_url=is.null'],
  ['vocab_cn_renditions 无 audio_url', 'vocab_cn_renditions?audio_url=is.null'],
  ['vocab_cn_renditions 无 example_audio_url', 'vocab_cn_renditions?example_audio_url=is.null'],
  ['vocab_scene_items 无 audio_url', 'vocab_scene_items?audio_url=is.null'],
  ['vocab_scene_packs 无 essay_short_audio_url', 'vocab_scene_packs?essay_short_audio_url=is.null'],
  ['vocab_scene_packs 无 essay_full_audio_url', 'vocab_scene_packs?essay_full_audio_url=is.null'],
];
for (const [name, path] of checks) console.log(`  ${name.padEnd(38)} ${await cnt(path)}`);
