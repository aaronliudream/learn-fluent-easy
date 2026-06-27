// 生成 必修一 U4 灌库 SQL(junior_* 表,volume='required1' unit='U2' grade=10)。照 WU/U1 同款列。自带 count 校验。
import { readFileSync, writeFileSync } from 'node:fs';
const DIR = 'scripts/senior-rebuild/required1-u4/';
const VOL = 'required1', UNIT = 'U4', GRADE = 10;
const LET = ['A', 'B', 'C', 'D'];
const esc = s => String(s).replace(/'/g, "''");
const jb = o => "'" + JSON.stringify(o).replace(/'/g, "''") + "'::jsonb";
const wc = s => String(s).split(/\s+/).filter(Boolean).length;
const rd = f => JSON.parse(readFileSync(DIR + f, 'utf8'));

const vocab = rd('required1-u4-vocab.json');
const grammar = rd('required1-u4-grammar.json');
const reading = rd('required1-u4-reading.json');
const cloze = rd('required1-u4-cloze.json');
const listening = rd('required1-u4-listening.json');
const writing = rd('required1-u4-writing.json');

const VNOTES = {
  'rd1': [{ word: 'ruin', cn: '废墟' }, { word: 'crack', cn: '裂缝' }, { word: 'shock', cn: '震惊' }],
  'rd2': [{ word: 'crack', cn: '裂缝' }, { word: 'gas', cn: '气体' }, { word: 'sign', cn: '迹象' }],
  'rd3': [{ word: 'tsunami', cn: '海啸' }, { word: 'magnitude', cn: '震级' }, { word: 'sweep away', cn: '卷走' }],
  'rd4': [{ word: 'shelter', cn: '避难所' }, { word: 'unify', cn: '团结' }, { word: 'revive', cn: '复苏' }],
  'rd5': [{ word: 'emergency', cn: '紧急情况' }, { word: 'whistle', cn: '哨子' }, { word: 'first aid kit', cn: '急救箱' }],
  'rd6': [{ word: 'rescue', cn: '救援' }, { word: 'trap', cn: '困住' }, { word: 'brave', cn: '勇敢的' }],
};
const TOPIC_CN = { 'rd1': '记叙·唐山大地震', 'rd2': '说明·地震预兆', 'rd3': '新闻·亚洲海啸', 'rd4': '记叙·唐山重建', 'rd5': '说明·防灾准备', 'rd6': '记叙·救援者日记' };

let sql = `-- ============================================================\n-- 必修一 U4(Natural Disasters)灌库(junior_* 表,volume='${VOL}' unit='${UNIT}' grade=${GRADE})。幂等。\n`;
sql += `-- preflight(grade 7-12 + senior 分类)已随 U1 跑过,不必再跑。Aaron service role 跑。\n-- ============================================================\nBEGIN;\n\n`;

// 1) vocab
sql += `-- ===== 1) 词汇 ${vocab.words.length} =====\nDELETE FROM public.junior_vocab WHERE volume='${VOL}' AND unit='${UNIT}';\n`;
vocab.words.forEach((w, i) => {
  const tip = w.note ? (w.note + (w.ipa_us ? `;美音 ${w.ipa_us}` : '')) : null;
  sql += `INSERT INTO public.junior_vocab (grade, word, pos, phonetic, meaning_cn, example_en, example_cn, theme, freq_rank, star_level, stage, source_type, volume, unit, phrase_en, tip) VALUES (`
    + `${GRADE}, '${esc(w.word)}', '${esc(w.pos)}', '${esc(w.ipa)}', '${esc(w.meaning_cn)}', ${w.example_en ? `'${esc(w.example_en)}'` : 'NULL'}, ${w.example_cn ? `'${esc(w.example_cn)}'` : 'NULL'}, 'Natural Disasters', ${w.freq_rank ?? i + 1}, 0, 'senior', 'wordlist', '${VOL}', '${UNIT}', '${esc(w.phrase_en)}', ${tip ? `'${esc(tip)}'` : 'NULL'});\n`;
});

// 2) grammar
sql += `\n-- ===== 2) 语法 ${grammar.points.length}点/${grammar.questions.length}题 =====\n`;
sql += `DELETE FROM public.junior_grammar_questions WHERE point_id IN (SELECT id FROM public.junior_grammar_points WHERE volume='${VOL}' AND unit='${UNIT}');\n`;
sql += `DELETE FROM public.junior_grammar_points WHERE volume='${VOL}' AND unit='${UNIT}';\n`;
const circ = ['①', '②', '③'];
grammar.points.forEach((p, i) => {
  sql += `INSERT INTO public.junior_grammar_points (code, title, cefr, grade, summary, sort_order, volume, unit, category_id, examples, content_depth) VALUES (`
    + `'${esc(p.code)}', '${esc(circ[i] + p.point)}', 'A2', ${GRADE}, '${esc('必修一 U4 — ' + p.overview)}', ${i + 1}, '${VOL}', '${UNIT}', (SELECT id FROM public.junior_grammar_categories WHERE code='senior' LIMIT 1), '[]'::jsonb, 0);\n`;
});
grammar.questions.forEach((q, i) => {
  sql += `INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type) VALUES (`
    + `(SELECT id FROM public.junior_grammar_points WHERE volume='${VOL}' AND unit='${UNIT}' AND code='${esc(q.code)}'), `
    + `'${esc(q.stem)}', '${esc(q.options[0])}', '${esc(q.options[1])}', '${esc(q.options[2])}', '${esc(q.options[3])}', '${LET[q.answer_index]}', '${esc(q.explanation)}', 2, ${(i % 20) + 1}, 'mcq');\n`;
});

// 3) reading
sql += `\n-- ===== 3) 阅读 ${reading.passages.length} 篇 =====\nDELETE FROM public.junior_reading WHERE volume='${VOL}' AND unit='${UNIT}';\n`;
reading.passages.forEach(p => {
  const qs = p.questions.map(q => ({ q: q.stem, answer: LET[q.answer_index], options: q.options, explanation: q.explanation }));
  sql += `INSERT INTO public.junior_reading (grade, title, body, topic, word_count, questions, vocab_notes, difficulty, volume, unit) VALUES (`
    + `${GRADE}, '${esc(p.title)}', '${esc(p.body)}', '${esc(TOPIC_CN[p.code] || 'Natural Disasters')}', ${wc(p.body)}, ${jb(qs)}, ${jb(VNOTES[p.code] || [])}, 2, '${VOL}', '${UNIT}');\n`;
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
  const tr = Array.isArray(e.transcript) ? e.transcript.join('\n') : e.transcript;
  sql += `INSERT INTO public.junior_listening_exercises (grade, title, topic, difficulty, transcript, translation_cn, speaker, questions, key_vocab, kind, volume, unit) VALUES (`
    + `${GRADE}, '${esc(e.title)}', '必修一 U4 · ${esc(e.type)}', ${e.kind === 'long' ? 3 : 2}, '${esc(tr)}', '${esc(e.translation_cn)}', '${esc(e.speaker)}', ${jb(qs)}, '[]'::jsonb, '${esc(e.kind)}', '${VOL}', '${UNIT}');\n`;
});

// 6) writing
const W = writing;
const rubricText = `【15 分制】A 档(13-15):五要素齐全、组织有条理、语言准确多样;B 档(10-12):要点较全、少量错误;C 档(7-9):要点偏少、句型简单;D 档(0-6):内容不完整、错误多。`;
const paraTpl = (W.paragraph_template || '');
sql += `\n-- ===== 6) 写作 1篇(旅行邮件) =====\nDELETE FROM public.junior_writing_prompts WHERE volume='${VOL}' AND unit='${UNIT}';\n`;
sql += `INSERT INTO public.junior_writing_prompts (grade, topic, title_en, prompt_cn, prompt_en, requirements, min_words, max_words, sample_answer, scoring_rubric, high_sentences, error_pairs, paragraph_template, difficulty, volume, unit) VALUES (`
  + `${GRADE}, '${esc(W.topic)}', 'A Travel Email', '${esc(W.prompt_cn)}', '${esc(W.prompt_en)}', ${jb(W.points)}, 70, 100, '${esc(W.model_essay)}', '${esc(rubricText)}', ${jb(W.high_sentences || [])}, ${jb(W.error_pairs || [])}, '${esc(paraTpl)}', 2, '${VOL}', '${UNIT}');\n`;

// 7) 语法小知识 grammar_tips(每单元一条,GrammarStage 卡片读它)
const tips = JSON.parse(readFileSync(DIR + 'required1-u4-grammar-tips.json', 'utf8'));
sql += `\n-- ===== 7) 语法小知识 =====\nDELETE FROM public.junior_grammar_tips WHERE volume='${VOL}' AND unit='${UNIT}';\n`;
sql += `INSERT INTO public.junior_grammar_tips (grade, volume, unit, content) VALUES (${GRADE}, '${VOL}', '${UNIT}', ${jb(tips.content)});\n`;

sql += `\nCOMMIT;\n\n-- ===== 自带校验(跑完一眼确认) =====\n`;
sql += `SELECT 'vocab' k, count(*) v, ${vocab.words.length} expect FROM public.junior_vocab WHERE volume='${VOL}' AND unit='${UNIT}'\n`;
sql += `UNION ALL SELECT 'grammar_points', count(*), ${grammar.points.length} FROM public.junior_grammar_points WHERE volume='${VOL}' AND unit='${UNIT}'\n`;
sql += `UNION ALL SELECT 'grammar_questions', count(*), ${grammar.questions.length} FROM public.junior_grammar_questions WHERE point_id IN (SELECT id FROM public.junior_grammar_points WHERE volume='${VOL}' AND unit='${UNIT}')\n`;
sql += `UNION ALL SELECT 'reading', count(*), ${reading.passages.length} FROM public.junior_reading WHERE volume='${VOL}' AND unit='${UNIT}'\n`;
sql += `UNION ALL SELECT 'cloze', count(*), ${cloze.passages.length} FROM public.junior_cloze WHERE volume='${VOL}' AND unit='${UNIT}'\n`;
sql += `UNION ALL SELECT 'listening', count(*), ${listening.exercises.length} FROM public.junior_listening_exercises WHERE volume='${VOL}' AND unit='${UNIT}'\n`;
sql += `UNION ALL SELECT 'writing', count(*), 1 FROM public.junior_writing_prompts WHERE volume='${VOL}' AND unit='${UNIT}'
UNION ALL SELECT 'grammar_tips', count(*), 1 FROM public.junior_grammar_tips WHERE volume='${VOL}' AND unit='${UNIT}' ORDER BY k;\n`;
sql += `-- 分布校验:语法/阅读/完形/听力答案分布(应均匀)\n`;
sql += `SELECT 'grammar' rel, correct_answer ans, count(*) FROM public.junior_grammar_questions WHERE point_id IN (SELECT id FROM public.junior_grammar_points WHERE volume='${VOL}' AND unit='${UNIT}') GROUP BY 2 ORDER BY 2;\n`;

writeFileSync('scripts/required1-u4-load.sql', sql);
writeFileSync('SQLAA/required1-u4-load.sql', sql);
console.log('U2 灌库 SQL -> scripts/ + SQLAA/required1-u4-load.sql');
console.log(`vocab ${vocab.words.length} | grammar ${grammar.points.length}点/${grammar.questions.length}题 | reading ${reading.passages.length} | cloze ${cloze.passages.length} | listening ${listening.exercises.length} | writing 1 | INSERT ${(sql.match(/INSERT INTO/g) || []).length}`);
