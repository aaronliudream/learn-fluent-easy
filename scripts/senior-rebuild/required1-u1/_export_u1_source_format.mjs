// 重导 U1 库数据 → docs/junior/u1-live/ 用"源格式字段名"(ipa/phrases/options/answer_index/explanation),便于逐题审。
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
const env = Object.fromEntries(readFileSync('.env', 'utf8').split(/\r?\n/).filter(l => l.includes('=')).map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const sb = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY);
const VOL = 'required1', UNIT = 'U1', GRADE = 10, OUT = 'docs/junior/u1-live';
mkdirSync(OUT, { recursive: true });
const W = (n, o) => writeFileSync(`${OUT}/${n}.json`, JSON.stringify(o, null, 2) + '\n');
const L = ['A', 'B', 'C', 'D'];
const idxOf = (ans, opts) => { const s = String(ans ?? '').trim().toUpperCase(); const li = L.indexOf(s); if (li >= 0) return li; const t = opts.findIndex(o => String(o).trim() === String(ans).trim()); return t >= 0 ? t : 0; };

// 1) 词汇(phonetic→ipa;附 phrases 短语清单)
const { data: vrows } = await sb.from('junior_vocab').select('word,phonetic,pos,meaning_cn,example_en,example_cn,phrase_en,freq_rank').eq('grade', GRADE).eq('volume', VOL).eq('unit', UNIT).order('freq_rank');
const words = vrows.map(r => ({ word: r.word, ipa: r.phonetic, pos: r.pos, meaning_cn: r.meaning_cn, phrase_en: r.phrase_en, example_en: r.example_en, example_cn: r.example_cn, freq_rank: r.freq_rank }));
W('u1-vocab', { count: words.length, phrases: vrows.map(r => r.phrase_en).filter(Boolean), words });

// 2) 语法(option_a..d→options[];correct_answer→answer_index)
const { data: pts } = await sb.from('junior_grammar_points').select('id,code,title,summary,sort_order').eq('volume', VOL).eq('unit', UNIT).order('sort_order');
const points = [];
for (const p of pts) {
  const { data: qs } = await sb.from('junior_grammar_questions').select('stem,option_a,option_b,option_c,option_d,correct_answer,explanation,difficulty,sort_order').eq('point_id', p.id).order('sort_order');
  points.push({
    code: p.code, title: p.title, summary: p.summary, question_count: qs.length,
    questions: qs.map(q => { const opts = [q.option_a, q.option_b, q.option_c, q.option_d].filter(o => o != null); const ai = idxOf(q.correct_answer, opts); return { stem: q.stem, options: opts, answer_index: ai, answer_text: opts[ai], explanation: q.explanation }; }),
  });
}
W('u1-grammar', { point_count: pts.length, total_questions: points.reduce((a, p) => a + p.question_count, 0), points });

// 3) 阅读 4) 完形 5) 听力:questions jsonb 里 answer 是字母 → 转 options/answer_index
const remap = arr => (Array.isArray(arr) ? arr : []).map(q => { const opts = Array.isArray(q.options) ? q.options : []; const ai = idxOf(q.answer, opts); return { stem: q.q ?? q.stem, options: opts, answer_index: ai, answer_text: opts[ai], explanation: q.explanation }; });

const { data: reading } = await sb.from('junior_reading').select('title,topic,word_count,vocab_notes,questions,body').eq('grade', GRADE).eq('volume', VOL).eq('unit', UNIT);
W('u1-reading', { passage_count: reading.length, total_questions: reading.reduce((a, r) => a + (r.questions?.length || 0), 0), passages: reading.map(r => ({ title: r.title, topic: r.topic, word_count: r.word_count, vocab_notes: r.vocab_notes, body: r.body, questions: remap(r.questions) })) });

const { data: cloze } = await sb.from('junior_cloze').select('title,word_count,questions,body,sort_order').eq('grade', GRADE).eq('volume', VOL).eq('unit', UNIT).order('sort_order');
W('u1-cloze', { passage_count: cloze.length, total_blanks: cloze.reduce((a, c) => a + (c.questions?.length || 0), 0), passages: cloze.map(c => ({ title: c.title, word_count: c.word_count, body: c.body, blanks: remap(c.questions) })) });

const { data: listen } = await sb.from('junior_listening_exercises').select('title,topic,kind,speaker,transcript,translation_cn,questions,audio_url').eq('grade', GRADE).eq('volume', VOL).eq('unit', UNIT);
W('u1-listening', { exercise_count: listen.length, total_questions: listen.reduce((a, e) => a + (e.questions?.length || 0), 0), with_audio: listen.filter(e => e.audio_url).length, exercises: listen.map(e => ({ title: e.title, kind: e.kind, speaker: e.speaker, transcript: e.transcript, translation_cn: e.translation_cn, audio_url: e.audio_url, questions: remap(e.questions) })) });

const { data: writing } = await sb.from('junior_writing_prompts').select('topic,title_en,prompt_cn,prompt_en,requirements,min_words,max_words,sample_answer,high_sentences,error_pairs,scoring_rubric').eq('grade', GRADE).eq('volume', VOL).eq('unit', UNIT);
W('u1-writing', { prompt_count: writing.length, prompts: writing });

console.log('重导(源格式)→ docs/junior/u1-live/');
console.log('词汇', words.length, '| ipa非空', words.filter(w => w.ipa).length, '| phrase非空', words.filter(w => w.phrase_en).length);
console.log('语法', pts.length, '点/', points.reduce((a, p) => a + p.question_count, 0), '题 | options/answer 已转源格式');
console.log('阅读', reading.length, '篇 | 完形', cloze.length, '篇 | 听力', listen.length, '篇 | 写作', writing.length);
