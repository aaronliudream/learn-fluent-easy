import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
const env = Object.fromEntries(readFileSync('.env', 'utf8').split(/\r?\n/).filter(l => l.includes('=')).map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const sb = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY);
const out = (...a) => console.log(...a);

out('===== 问题1: junior_vocab g9/U1 全部行(word/meaning_cn/phonetic/phrase_en/example_en) =====');
{
  const { data } = await sb.from('junior_vocab').select('word,meaning_cn,phonetic,phrase_en,example_en,example_cn,word_id')
    .eq('volume', 'g9').eq('unit', 'U1').order('word_id');
  out('行数:', (data ?? []).length);
  for (const r of data ?? []) out(`  ${(r.word||'').padEnd(16)} | ${r.meaning_cn||''} | ph=${r.phonetic||'∅'} | phrase=${r.phrase_en||'∅'} | ex=${r.example_en||'∅'}`);
}

out('\n===== 问题2: 8年级 junior_vocab(8A/U1)chunk 字段格式 (前10) =====');
{
  const { data } = await sb.from('junior_vocab').select('word,meaning_cn,phrase_en,example_en,example_cn')
    .eq('volume', '8A').eq('unit', 'U1').limit(10);
  for (const r of data ?? []) out(`  ${(r.word||'').padEnd(14)} | phrase_en=${JSON.stringify(r.phrase_en)} | example_en=${JSON.stringify(r.example_en)} | example_cn=${JSON.stringify(r.example_cn)}`);
  // 统计 8A/U1 有 phrase_en 的比例
  const { data: all } = await sb.from('junior_vocab').select('phrase_en,example_en').eq('volume','8A').eq('unit','U1');
  const withPhrase = (all??[]).filter(r=>r.phrase_en && r.phrase_en.trim()).length;
  const withEx = (all??[]).filter(r=>r.example_en && r.example_en.trim()).length;
  out(`  8A/U1 共 ${(all??[]).length} 词 | 有 phrase_en: ${withPhrase} | 有 example_en: ${withEx}`);
}

out('\n===== 问题3: junior_reading 行数对比 =====');
for (const v of ['g9', '8A']) {
  const { data } = await sb.from('junior_reading').select('title').eq('volume', v).eq('unit', 'U1');
  out(`  ${v}/U1: ${(data ?? []).length} 篇`);
  if (v === 'g9') for (const r of data ?? []) out(`     - ${r.title}`);
}
process.exit(0);
