// 从库导出 必修一 U1(volume='required1' unit='U1' grade=10)实际题目数据 → docs/junior/u1-live/*.json
// 只读(anon)。6 张表各成单个 json,供逐题核对(超纲/坏题/题量/答案唯一)。
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
const env = Object.fromEntries(readFileSync('.env', 'utf8').split(/\r?\n/).filter(l => l.includes('=')).map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const sb = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY);
const VOL = 'required1', UNIT = 'U1', GRADE = 10;
const OUT = 'docs/junior/u1-live';
mkdirSync(OUT, { recursive: true });
const W = (name, obj) => writeFileSync(`${OUT}/${name}.json`, JSON.stringify(obj, null, 2) + '\n');
const LET = ['A', 'B', 'C', 'D'];

// 1) 词汇
const { data: vocab } = await sb.from('junior_vocab')
  .select('word,phonetic,pos,meaning_cn,example_en,example_cn,phrase_en,freq_rank,tip')
  .eq('grade', GRADE).eq('volume', VOL).eq('unit', UNIT).order('freq_rank', { ascending: true });
W('u1-vocab', { count: vocab.length, words: vocab });

// 2) 语法(点 + 题)
const { data: pts } = await sb.from('junior_grammar_points')
  .select('id,code,title,cefr,summary,sort_order').eq('volume', VOL).eq('unit', UNIT).order('sort_order');
const ptOut = [];
for (const p of pts) {
  const { data: qs } = await sb.from('junior_grammar_questions')
    .select('stem,option_a,option_b,option_c,option_d,correct_answer,explanation,difficulty,sort_order')
    .eq('point_id', p.id).order('sort_order');
  ptOut.push({ code: p.code, title: p.title, summary: p.summary, question_count: qs.length, questions: qs });
}
W('u1-grammar', { point_count: pts.length, total_questions: ptOut.reduce((a, p) => a + p.question_count, 0), points: ptOut });

// 3) 阅读
const { data: reading } = await sb.from('junior_reading')
  .select('title,topic,word_count,difficulty,vocab_notes,questions,body')
  .eq('grade', GRADE).eq('volume', VOL).eq('unit', UNIT);
W('u1-reading', { passage_count: reading.length, total_questions: reading.reduce((a, r) => a + (r.questions?.length || 0), 0), passages: reading });

// 4) 完形
const { data: cloze } = await sb.from('junior_cloze')
  .select('title,word_count,difficulty,questions,body,sort_order')
  .eq('grade', GRADE).eq('volume', VOL).eq('unit', UNIT).order('sort_order');
W('u1-cloze', { passage_count: cloze.length, total_blanks: cloze.reduce((a, c) => a + (c.questions?.length || 0), 0), passages: cloze });

// 5) 听力
const { data: listen } = await sb.from('junior_listening_exercises')
  .select('title,topic,kind,difficulty,speaker,transcript,translation_cn,questions,audio_url')
  .eq('grade', GRADE).eq('volume', VOL).eq('unit', UNIT);
W('u1-listening', { exercise_count: listen.length, total_questions: listen.reduce((a, e) => a + (e.questions?.length || 0), 0), with_audio: listen.filter(e => e.audio_url).length, exercises: listen });

// 6) 写作
const { data: writing } = await sb.from('junior_writing_prompts')
  .select('topic,title_en,prompt_cn,prompt_en,requirements,min_words,max_words,sample_answer,high_sentences,error_pairs,scoring_rubric')
  .eq('grade', GRADE).eq('volume', VOL).eq('unit', UNIT);
W('u1-writing', { prompt_count: writing.length, prompts: writing });

// 控制台汇总
console.log('导出 → docs/junior/u1-live/');
console.log('词汇:', vocab.length, '词');
console.log('语法:', pts.length, '点 /', ptOut.reduce((a, p) => a + p.question_count, 0), '题  ' + ptOut.map(p => p.code + '=' + p.question_count).join(' '));
console.log('阅读:', reading.length, '篇 /', reading.reduce((a, r) => a + (r.questions?.length || 0), 0), '题');
console.log('完形:', cloze.length, '篇 /', cloze.reduce((a, c) => a + (c.questions?.length || 0), 0), '空');
console.log('听力:', listen.length, '篇 /', listen.reduce((a, e) => a + (e.questions?.length || 0), 0), '题  audio_url填充', listen.filter(e => e.audio_url).length + '/' + listen.length);
console.log('写作:', writing.length, '篇');
console.log('\n词表(对照真课本查超纲):');
console.log(vocab.map(v => v.word).join(', '));
