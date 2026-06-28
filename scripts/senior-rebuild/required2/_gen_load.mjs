// 生成必修二某单元灌库 SQL(junior_* 表)。用法: node _gen_load.mjs --unit u1
// 输出 -> SQLAA/required2-<unit>-load.sql + scripts/。自带 count + 分布校验。幂等。
import { readFileSync, writeFileSync } from 'node:fs';
import { VOL, GRADE, META, CODE_PREFIX } from './_meta.mjs';
const PFX = CODE_PREFIX || '';
const px = c => PFX + c;
const U = process.argv[process.argv.indexOf('--unit') + 1];
const m = META[U]; if (!m) throw new Error('未知 unit ' + U);
const UNIT = m.unit;
const DIR = `scripts/senior-rebuild/required2/${U}`;
const LET = ['A', 'B', 'C', 'D'];
const esc = s => String(s).replace(/'/g, "''");
const jb = o => "'" + JSON.stringify(o).replace(/'/g, "''") + "'::jsonb";
const wc = s => String(s).split(/\s+/).filter(Boolean).length;
const rd = f => JSON.parse(readFileSync(`${DIR}/${VOL}-${U}-${f}.json`, 'utf8'));

const vocab = rd('vocab'), grammar = rd('grammar'), reading = rd('reading'),
  cloze = rd('cloze'), listening = rd('listening'), writing = rd('writing'),
  tips = rd('grammar-tips');

let sql = `-- ============================================================\n-- 必修二 ${UNIT}(${m.title})灌库(junior_* 表,volume='${VOL}' unit='${UNIT}' grade=${GRADE})。幂等。\n`;
sql += `-- preflight(grade 7-12 + senior 分类)已随必修一跑过,不必再跑。Aaron service role 跑。\n-- ============================================================\nBEGIN;\n\n`;

// 1) vocab
sql += `-- ===== 1) 词汇 ${vocab.words.length} =====\nDELETE FROM public.junior_vocab WHERE volume='${VOL}' AND unit='${UNIT}';\n`;
vocab.words.forEach((w, i) => {
  const tip = w.note ? (w.note + (w.ipa_us ? `;美音 ${w.ipa_us}` : '')) : (w.ipa_us ? `美音 ${w.ipa_us}` : null);
  sql += `INSERT INTO public.junior_vocab (grade, word, pos, phonetic, meaning_cn, example_en, example_cn, theme, freq_rank, star_level, stage, source_type, volume, unit, phrase_en, tip) VALUES (`
    + `${GRADE}, '${esc(w.word)}', '${esc(w.pos)}', '${esc(w.ipa)}', '${esc(w.meaning_cn)}', ${w.example_en ? `'${esc(w.example_en)}'` : 'NULL'}, ${w.example_cn ? `'${esc(w.example_cn)}'` : 'NULL'}, '${esc(m.theme)}', ${w.freq_rank ?? i + 1}, 0, 'senior', 'wordlist', '${VOL}', '${UNIT}', '${esc(w.phrase_en || '')}', ${tip ? `'${esc(tip)}'` : 'NULL'});\n`;
});

// 2) grammar
sql += `\n-- ===== 2) 语法 ${grammar.points.length}点/${grammar.questions.length}题 =====\n`;
sql += `DELETE FROM public.junior_grammar_questions WHERE point_id IN (SELECT id FROM public.junior_grammar_points WHERE volume='${VOL}' AND unit='${UNIT}');\n`;
sql += `DELETE FROM public.junior_grammar_points WHERE volume='${VOL}' AND unit='${UNIT}';\n`;
const circ = ['①', '②', '③'];
grammar.points.forEach((p, i) => {
  sql += `INSERT INTO public.junior_grammar_points (code, title, cefr, grade, summary, sort_order, volume, unit, category_id, examples, content_depth) VALUES (`
    + `'${esc(px(p.code))}', '${esc(circ[i] + p.point)}', 'A2', ${GRADE}, '${esc('必修二 ' + UNIT + ' — ' + p.overview)}', ${i + 1}, '${VOL}', '${UNIT}', (SELECT id FROM public.junior_grammar_categories WHERE code='senior' LIMIT 1), '[]'::jsonb, 0);\n`;
});
grammar.questions.forEach((q, i) => {
  sql += `INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type) VALUES (`
    + `(SELECT id FROM public.junior_grammar_points WHERE volume='${VOL}' AND unit='${UNIT}' AND code='${esc(px(q.code))}'), `
    + `'${esc(q.stem)}', '${esc(q.options[0])}', '${esc(q.options[1])}', '${esc(q.options[2])}', '${esc(q.options[3])}', '${LET[q.answer_index]}', '${esc(q.explanation)}', 2, ${(i % 20) + 1}, 'mcq');\n`;
});

// 3) reading
sql += `\n-- ===== 3) 阅读 ${reading.passages.length} 篇 =====\nDELETE FROM public.junior_reading WHERE volume='${VOL}' AND unit='${UNIT}';\n`;
reading.passages.forEach(p => {
  const qs = p.questions.map(q => ({ q: q.stem, answer: LET[q.answer_index], options: q.options, explanation: q.explanation }));
  sql += `INSERT INTO public.junior_reading (grade, title, body, topic, word_count, questions, vocab_notes, difficulty, volume, unit) VALUES (`
    + `${GRADE}, '${esc(p.title)}', '${esc(p.body)}', '${esc(p.topic_cn || m.topic_cn)}', ${wc(p.body)}, ${jb(qs)}, ${jb(p.vocab_notes || [])}, 2, '${VOL}', '${UNIT}');\n`;
});

// 4) cloze
sql += `\n-- ===== 4) 完形 ${cloze.passages.length}篇/${cloze.passages.length * 10}空 =====\nDELETE FROM public.junior_cloze WHERE volume='${VOL}' AND unit='${UNIT}';\n`;
cloze.passages.forEach((p, i) => {
  const qs = p.questions.map(q => ({ q: String(q.blank), answer: LET[q.answer_index], options: q.options, explanation: q.explanation }));
  sql += `INSERT INTO public.junior_cloze (grade, volume, unit, title, body, word_count, difficulty, questions, sort_order) VALUES (`
    + `${GRADE}, '${VOL}', '${UNIT}', '${esc(p.title)}', '${esc(p.text)}', ${wc(p.text)}, 2, ${jb(qs)}, ${i + 1});\n`;
});

// 5) listening
sql += `\n-- ===== 5) 听力 ${listening.exercises.length}篇/${listening.exercises.length * 5}题(audio_url 待 TTS) =====\nDELETE FROM public.junior_listening_exercises WHERE volume='${VOL}' AND unit='${UNIT}';\n`;
listening.exercises.forEach(e => {
  const qs = e.questions.map(q => ({ q: q.stem, type: 'choice', answer: LET[q.answer_index], options: q.options }));
  const tr = Array.isArray(e.transcript) ? e.transcript.map(t => typeof t === 'string' ? t : `${t.speaker || ''}: ${t.text}`).join('\n') : e.transcript;
  sql += `INSERT INTO public.junior_listening_exercises (grade, title, topic, difficulty, transcript, translation_cn, speaker, questions, key_vocab, kind, volume, unit) VALUES (`
    + `${GRADE}, '${esc(e.title)}', '必修二 ${UNIT} · ${esc(e.type || '')}', ${e.kind === 'long' ? 3 : 2}, '${esc(tr)}', '${esc(e.translation_cn)}', '${esc(e.speaker || 'us_female')}', ${jb(qs)}, '[]'::jsonb, '${esc(e.kind)}', '${VOL}', '${UNIT}');\n`;
});

// 6) writing
const W = writing;
const rubricText = `【15 分制】A 档(13-15):五要素齐全、组织有条理、语言准确多样;B 档(10-12):要点较全、少量错误;C 档(7-9):要点偏少、句型简单;D 档(0-6):内容不完整、错误多。`;
sql += `\n-- ===== 6) 写作 1篇 =====\nDELETE FROM public.junior_writing_prompts WHERE volume='${VOL}' AND unit='${UNIT}';\n`;
sql += `INSERT INTO public.junior_writing_prompts (grade, topic, title_en, prompt_cn, prompt_en, requirements, min_words, max_words, sample_answer, scoring_rubric, high_sentences, error_pairs, paragraph_template, difficulty, volume, unit) VALUES (`
  + `${GRADE}, '${esc(W.topic)}', '${esc(W.title_en || W.topic)}', '${esc(W.prompt_cn)}', '${esc(W.prompt_en)}', ${jb(W.points || [])}, 70, 100, '${esc(W.model_essay)}', '${esc(rubricText)}', ${jb(W.high_sentences || [])}, ${jb(W.error_pairs || [])}, '${esc(W.paragraph_template || '')}', 2, '${VOL}', '${UNIT}');\n`;

// 7) grammar_tips
sql += `\n-- ===== 7) 语法小知识 =====\nDELETE FROM public.junior_grammar_tips WHERE volume='${VOL}' AND unit='${UNIT}';\n`;
sql += `INSERT INTO public.junior_grammar_tips (grade, volume, unit, content) VALUES (${GRADE}, '${VOL}', '${UNIT}', ${jb(tips.content)});\n`;

sql += `\nCOMMIT;\n\n-- ===== 自带校验 =====\n`;
sql += `SELECT 'vocab' k, count(*) v, ${vocab.words.length} expect FROM public.junior_vocab WHERE volume='${VOL}' AND unit='${UNIT}'\n`;
sql += `UNION ALL SELECT 'grammar_points', count(*), ${grammar.points.length} FROM public.junior_grammar_points WHERE volume='${VOL}' AND unit='${UNIT}'\n`;
sql += `UNION ALL SELECT 'grammar_questions', count(*), ${grammar.questions.length} FROM public.junior_grammar_questions WHERE point_id IN (SELECT id FROM public.junior_grammar_points WHERE volume='${VOL}' AND unit='${UNIT}')\n`;
sql += `UNION ALL SELECT 'reading', count(*), ${reading.passages.length} FROM public.junior_reading WHERE volume='${VOL}' AND unit='${UNIT}'\n`;
sql += `UNION ALL SELECT 'cloze', count(*), ${cloze.passages.length} FROM public.junior_cloze WHERE volume='${VOL}' AND unit='${UNIT}'\n`;
sql += `UNION ALL SELECT 'listening', count(*), ${listening.exercises.length} FROM public.junior_listening_exercises WHERE volume='${VOL}' AND unit='${UNIT}'\n`;
sql += `UNION ALL SELECT 'writing', count(*), 1 FROM public.junior_writing_prompts WHERE volume='${VOL}' AND unit='${UNIT}'\n`;
sql += `UNION ALL SELECT 'grammar_tips', count(*), 1 FROM public.junior_grammar_tips WHERE volume='${VOL}' AND unit='${UNIT}' ORDER BY k;\n`;
sql += `SELECT 'grammar' rel, correct_answer ans, count(*) FROM public.junior_grammar_questions WHERE point_id IN (SELECT id FROM public.junior_grammar_points WHERE volume='${VOL}' AND unit='${UNIT}') GROUP BY 2 ORDER BY 2;\n`;

writeFileSync(`scripts/required2-${U}-load.sql`, sql);
writeFileSync(`SQLAA/required2-${U}-load.sql`, sql);
const ins = (sql.match(/INSERT INTO/g) || []).length;
console.log(`必修二 ${UNIT} 灌库 SQL -> SQLAA/required2-${U}-load.sql`);
console.log(`vocab ${vocab.words.length} | grammar ${grammar.points.length}点/${grammar.questions.length}题 | reading ${reading.passages.length} | cloze ${cloze.passages.length} | listening ${listening.exercises.length} | writing 1 | INSERT ${ins}`);
