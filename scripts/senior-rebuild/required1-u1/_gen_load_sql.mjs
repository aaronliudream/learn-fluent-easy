// 生成 必修一 U1 灌库 SQL(灌 junior_* 表,volume='required1' unit='U1' grade=10)。
// 幂等:每表先 DELETE 该 volume/unit 再 INSERT。列名按真实 introspect。
import { readFileSync, writeFileSync } from 'node:fs';
const DIR = 'C:\\Projects\\learn-fluent-easy\\scripts\\senior-rebuild\\required1-u1\\';
const VOL = 'required1', UNIT = 'U1', GRADE = 10;
const LET = ['A', 'B', 'C', 'D'];
const esc = s => String(s).replace(/'/g, "''");
const jb = o => "'" + JSON.stringify(o).replace(/'/g, "''") + "'::jsonb";
const wc = s => s.split(/\s+/).filter(Boolean).length;

const vocab = JSON.parse(readFileSync(DIR + 'required1-u1-vocab.json', 'utf8'));
const grammar = JSON.parse(readFileSync(DIR + 'required1-u1-grammar.json', 'utf8'));
const reading = JSON.parse(readFileSync(DIR + 'required1-u1-reading.json', 'utf8'));
const cloze = JSON.parse(readFileSync(DIR + 'required1-u1-cloze.json', 'utf8'));
const listening = JSON.parse(readFileSync(DIR + 'required1-u1-listening.json', 'utf8'));
const writing = JSON.parse(readFileSync(DIR + 'required1-u1-writing.json', 'utf8'));

// reading 每篇 vocab_notes(必填,g8基线):3 词/篇
const VNOTES = {
  'r1u1.rd1': [{ word: 'freshman', cn: '(高中)一年级新生' }, { word: 'challenge', cn: '挑战' }, { word: 'fluent', cn: '流利的' }],
  'r1u1.rd2': [{ word: 'behaviour', cn: '行为；举止' }, { word: 'addicted', cn: '上瘾的' }, { word: 'focus', cn: '集中(注意力)' }],
  'r1u1.rd3': [{ word: 'suitable', cn: '合适的' }, { word: 'greenhouse', cn: '温室' }, { word: 'debate', cn: '辩论' }],
  'r1u1.rd4': [{ word: 'schedule', cn: '日程安排' }, { word: 'responsible', cn: '负责的' }, { word: 'anxious', cn: '焦虑的' }],
  'r1u1.rd5': [{ word: 'impression', cn: '印象' }, { word: 'concentrate', cn: '集中精力' }, { word: 'confident', cn: '自信的' }],
  'r1u1.rd6': [{ word: 'responsibility', cn: '责任' }, { word: 'generation', cn: '一代人' }, { word: 'mistake', cn: '错误' }],
};
const TOPIC_CN = { 'r1u1.rd1': '记叙·新生挑战', 'r1u1.rd2': '应用·建议信', 'r1u1.rd3': '说明·选社团', 'r1u1.rd4': '说明·时间管理', 'r1u1.rd5': '记叙·开学第一天', 'r1u1.rd6': '议论·成长与责任' };

let sql = `-- ============================================================\n-- 必修一 U1 灌库(junior_* 表,volume='${VOL}' unit='${UNIT}' grade=${GRADE})\n`;
sql += `-- 架构方案B:高中内容复用 junior_* 同构表,volume=book。幂等:先删该 volume/unit 再灌。\n`;
sql += `-- Aaron service role 跑。跑完末尾 count 校验全部应达预期。\n-- ============================================================\nBEGIN;\n\n`;

// ---------- VOCAB ----------
sql += `-- ===== 1) 词汇 ${vocab.words.length} 条 =====\n`;
sql += `DELETE FROM public.junior_vocab WHERE volume='${VOL}' AND unit='${UNIT}';\n`;
vocab.words.forEach((w, i) => {
  const tip = w.note ? (w.note + (w.ipa_us ? `;美音 ${w.ipa_us}` : '')) : null;
  const exEn = w.example_en ? `'${esc(w.example_en)}'` : 'NULL';
  const exCn = w.example_cn ? `'${esc(w.example_cn)}'` : 'NULL';
  sql += `INSERT INTO public.junior_vocab (grade, word, pos, phonetic, meaning_cn, example_en, example_cn, theme, freq_rank, star_level, stage, source_type, volume, unit, phrase_en, tip) VALUES (`
    + `${GRADE}, '${esc(w.word)}', '${esc(w.pos)}', '${esc(w.ipa)}', '${esc(w.meaning_cn)}', ${exEn}, ${exCn}, 'Teenage Life', ${w.freq_rank ?? i + 1}, 0, 'senior', 'wordlist', '${VOL}', '${UNIT}', '${esc(w.phrase_en)}', ${tip ? `'${esc(tip)}'` : 'NULL'});\n`;
});

// ---------- GRAMMAR ----------
sql += `\n-- ===== 2) 语法 ${grammar.points.length} 点 / ${grammar.questions.length} 题 =====\n`;
sql += `DELETE FROM public.junior_grammar_questions WHERE point_id IN (SELECT id FROM public.junior_grammar_points WHERE volume='${VOL}' AND unit='${UNIT}');\n`;
sql += `DELETE FROM public.junior_grammar_points WHERE volume='${VOL}' AND unit='${UNIT}';\n`;
const circ = ['①', '②', '③', '④', '⑤'];
grammar.points.forEach((p, i) => {
  sql += `INSERT INTO public.junior_grammar_points (code, title, cefr, grade, summary, sort_order, volume, unit, category_id, examples, content_depth) VALUES (`
    + `'${esc(p.code)}', '${esc(circ[i] + p.point)}', 'B1', ${GRADE}, '${esc('必修一 U1 — ' + p.overview)}', ${i + 1}, '${VOL}', '${UNIT}', (SELECT id FROM public.junior_grammar_categories WHERE code='senior' LIMIT 1), '[]'::jsonb, 0);\n`;
});
grammar.questions.forEach((q, i) => {
  const code = q.code;
  const sortInPoint = (i % 20) + 1;
  sql += `INSERT INTO public.junior_grammar_questions (point_id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, sort_order, question_type) VALUES (`
    + `(SELECT id FROM public.junior_grammar_points WHERE volume='${VOL}' AND unit='${UNIT}' AND code='${esc(code)}'), `
    + `'${esc(q.stem)}', '${esc(q.options[0])}', '${esc(q.options[1])}', '${esc(q.options[2])}', '${esc(q.options[3])}', '${LET[q.answer_index]}', '${esc(q.explanation)}', 2, ${sortInPoint}, 'mcq');\n`;
});

// ---------- READING ----------
sql += `\n-- ===== 3) 阅读 ${reading.passages.length} 篇 =====\n`;
sql += `DELETE FROM public.junior_reading WHERE volume='${VOL}' AND unit='${UNIT}';\n`;
reading.passages.forEach(p => {
  const qs = p.questions.map(q => ({ q: q.stem, answer: LET[q.answer_index], options: q.options, explanation: q.explanation }));
  sql += `INSERT INTO public.junior_reading (grade, title, body, topic, word_count, questions, vocab_notes, difficulty, volume, unit) VALUES (`
    + `${GRADE}, '${esc(p.title)}', '${esc(p.body)}', '${esc(TOPIC_CN[p.code] || 'Teenage Life')}', ${wc(p.body)}, ${jb(qs)}, ${jb(VNOTES[p.code] || [])}, 3, '${VOL}', '${UNIT}');\n`;
});

// ---------- CLOZE ----------
sql += `\n-- ===== 4) 完形 ${cloze.passages.length} 篇 / ${cloze.passages.length * 10} 空 =====\n`;
sql += `DELETE FROM public.junior_cloze WHERE volume='${VOL}' AND unit='${UNIT}';\n`;
cloze.passages.forEach((p, i) => {
  const qs = p.questions.map(q => ({ q: String(q.blank), answer: LET[q.answer_index], options: q.options, explanation: q.explanation }));
  sql += `INSERT INTO public.junior_cloze (grade, volume, unit, title, body, word_count, difficulty, questions, sort_order) VALUES (`
    + `${GRADE}, '${VOL}', '${UNIT}', '${esc(p.title)}', '${esc(p.text)}', ${wc(p.text)}, 3, ${jb(qs)}, ${i + 1});\n`;
});

// ---------- LISTENING ----------
sql += `\n-- ===== 5) 听力 ${listening.exercises.length} 篇 / ${listening.exercises.length * 5} 题(audio_url 待 TTS 预生成回填) =====\n`;
sql += `DELETE FROM public.junior_listening_exercises WHERE volume='${VOL}' AND unit='${UNIT}';\n`;
listening.exercises.forEach(e => {
  const qs = e.questions.map(q => ({ q: q.stem, type: 'choice', answer: LET[q.answer_index], options: q.options }));
  const tr = e.transcript.join('\n');
  const diff = e.kind === 'long' ? 3 : 2;
  sql += `INSERT INTO public.junior_listening_exercises (grade, title, topic, difficulty, transcript, translation_cn, speaker, questions, key_vocab, kind, volume, unit) VALUES (`
    + `${GRADE}, '${esc(e.title)}', '必修一 U1 · ${esc(e.type)}', ${diff}, '${esc(tr)}', '${esc(e.translation_cn)}', '${esc(e.speaker)}', ${jb(qs)}, '[]'::jsonb, '${esc(e.kind)}', '${VOL}', '${UNIT}');\n`;
});

// ---------- WRITING ----------
const W = writing;
const rubricText = `【15 分制】A 档(13-15):结构完整(称呼/问题/理解/建议+理由/鼓励/落款)、建议≥2 条且有理由、语言准确多样;B 档(10-12):要点较全、少量语言错误;C 档(7-9):建议偏少或缺理由、句型简单、错误较多;D 档(0-6):内容不完整、结构混乱、错误多。`;
const highSent = [
  'You wrote that you spend too much time playing computer games.（你来信说你花太多时间打游戏。）',
  'I understand that you feel worried.（我理解你感到担心。）',
  'I think you should make a daily schedule.（我认为你应该制定每日计划。）',
  'Why not try some new hobbies, such as sports or reading?（何不尝试运动、阅读等新爱好?）',
  'I am sure that if you keep trying, you will manage your time better.（我相信只要坚持,你会把时间管理得更好。）',
];
const errPairs = [
  { wrong: 'I think you should to make a plan.', correct: 'I think you should make a plan.', note: 'should 是情态动词,后接动词原形,不加 to。' },
  { wrong: 'Why not to try a new hobby?', correct: 'Why not try a new hobby?', note: 'Why not 后直接接动词原形。' },
  { wrong: 'I am sure you will manage your time good.', correct: 'I am sure you will manage your time well.', note: '修饰动词 manage 用副词 well,不用形容词 good。' },
];
const paraTpl = `【建议信结构模板】\n称呼:Dear … ,\n第1步 点明问题:You wrote that … \n第2步 表示理解:I understand that you feel … \n第3步 给建议+理由:I think you should … / Why not … ? They can help you … \n第4步 鼓励结尾:I am sure that … \n落款:Best wishes, + 署名`;
sql += `\n-- ===== 6) 写作 1 篇(建议信)+ scoring =====\n`;
sql += `DELETE FROM public.junior_writing_prompts WHERE volume='${VOL}' AND unit='${UNIT}';\n`;
sql += `INSERT INTO public.junior_writing_prompts (grade, topic, title_en, prompt_cn, prompt_en, requirements, min_words, max_words, sample_answer, scoring_rubric, high_sentences, error_pairs, paragraph_template, difficulty, volume, unit) VALUES (`
  + `${GRADE}, '${esc(W.topic)}', 'A Letter of Advice', '${esc(W.prompt_cn)}', '${esc(W.prompt_en)}', ${jb(W.points)}, 70, 100, '${esc(W.model_essay)}', '${esc(rubricText)}', ${jb(highSent)}, ${jb(errPairs)}, '${esc(paraTpl)}', 3, '${VOL}', '${UNIT}');\n`;

sql += `\nCOMMIT;\n\n`;

// ---------- count 校验 ----------
sql += `-- ============================================================\n-- count 校验(预期值)\n-- ============================================================\n`;
sql += `SELECT 'vocab' k, count(*) v, ${vocab.words.length} expect FROM public.junior_vocab WHERE volume='${VOL}' AND unit='${UNIT}'\n`;
sql += `UNION ALL SELECT 'grammar_points', count(*), ${grammar.points.length} FROM public.junior_grammar_points WHERE volume='${VOL}' AND unit='${UNIT}'\n`;
sql += `UNION ALL SELECT 'grammar_questions', count(*), ${grammar.questions.length} FROM public.junior_grammar_questions WHERE point_id IN (SELECT id FROM public.junior_grammar_points WHERE volume='${VOL}' AND unit='${UNIT}')\n`;
sql += `UNION ALL SELECT 'reading', count(*), ${reading.passages.length} FROM public.junior_reading WHERE volume='${VOL}' AND unit='${UNIT}'\n`;
sql += `UNION ALL SELECT 'cloze', count(*), ${cloze.passages.length} FROM public.junior_cloze WHERE volume='${VOL}' AND unit='${UNIT}'\n`;
sql += `UNION ALL SELECT 'listening', count(*), ${listening.exercises.length} FROM public.junior_listening_exercises WHERE volume='${VOL}' AND unit='${UNIT}'\n`;
sql += `UNION ALL SELECT 'writing', count(*), 1 FROM public.junior_writing_prompts WHERE volume='${VOL}' AND unit='${UNIT}'\n`;
sql += `ORDER BY k;\n`;

const OUT = DIR + 'required1-u1-load.sql';
writeFileSync(OUT, sql);
writeFileSync('C:\\Projects\\learn-fluent-easy\\scripts\\required1-u1-load.sql', sql);
console.log('灌库 SQL ->', OUT);
console.log('副本 -> scripts\\required1-u1-load.sql');
console.log(`内容: vocab ${vocab.words.length} | grammar ${grammar.points.length}点/${grammar.questions.length}题 | reading ${reading.passages.length} | cloze ${cloze.passages.length} | listening ${listening.exercises.length} | writing 1`);
