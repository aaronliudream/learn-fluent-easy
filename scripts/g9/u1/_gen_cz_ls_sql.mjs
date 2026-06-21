// 由 cloze/listening json 生成灌库 SQL:先 DELETE 旧 g9/U1 完形听力,再灌新 6+6。输出到 scripts 根。
import { readFileSync, writeFileSync } from 'node:fs';
const DIR = 'C:\\Projects\\learn-fluent-easy\\scripts\\g9\\u1\\';
const cloze = JSON.parse(readFileSync(DIR + 'g9-u1-cloze.json', 'utf8'));
const listening = JSON.parse(readFileSync(DIR + 'g9-u1-listening.json', 'utf8'));
const LET = 'ABCD';
const esc = (s) => String(s).replace(/'/g, "''");
const jb = (o) => "'" + JSON.stringify(o).replace(/'/g, "''") + "'::jsonb";

let sql = `-- 九年级 U1 完形/听力 灌库(返工去重版)。先删旧 g9/U1 再灌新 6+6。volume='g9' unit='U1' grade=9。\nBEGIN;\n\n`;

// ---- 完形 ----
sql += `-- ===== 完形:删旧 → 灌 6 篇(每篇10空) =====\n`;
sql += `DELETE FROM public.junior_cloze WHERE volume='g9' AND unit='U1';\n`;
cloze.passages.forEach((p, i) => {
  const wc = p.text.split(/\s+/).filter(Boolean).length;
  const qs = p.questions.map(q => ({ q: String(q.blank), answer: LET[q.answer_index], options: q.options, explanation: q.explanation }));
  sql += `INSERT INTO public.junior_cloze (id, grade, volume, unit, title, body, word_count, difficulty, questions, sort_order) `
    + `VALUES (gen_random_uuid(), 9, 'g9', 'U1', '${esc(p.title)}', '${esc(p.text)}', ${wc}, 3, ${jb(qs)}, ${i + 1});\n`;
});

// ---- 听力 ----
sql += `\n-- ===== 听力:删旧 → 灌 6 篇(每篇5题) =====\n`;
sql += `DELETE FROM public.junior_listening_exercises WHERE volume='g9' AND unit='U1';\n`;
for (const e of listening.exercises) {
  const tr = e.transcript.join('\n');
  const qs = e.questions.map(q => ({ q: q.stem, type: 'choice', answer: LET[q.answer_index], options: q.options }));
  const diff = e.kind === 'short' ? 2 : 2;
  sql += `INSERT INTO public.junior_listening_exercises (id, grade, title, topic, difficulty, transcript, translation_cn, speaker, questions, key_vocab, kind, volume, unit) `
    + `VALUES (gen_random_uuid(), 9, '${esc(e.title)}', '九上 Unit1 听力·学习方法', ${diff}, '${esc(tr)}', '${esc(e.translation_cn)}', '${esc(e.speaker)}', ${jb(qs)}, '[]'::jsonb, '${esc(e.kind)}', 'g9', 'U1');\n`;
}

sql += `\nCOMMIT;\n\n`;
sql += `-- count 校验(预期 完形6 / 听力6)\n`;
sql += `SELECT 'cloze' k, count(*) v, 6 expect FROM public.junior_cloze WHERE volume='g9' AND unit='U1'\n`;
sql += `UNION ALL SELECT 'listening', count(*), 6 FROM public.junior_listening_exercises WHERE volume='g9' AND unit='U1';\n`;

const OUT = 'C:\\Projects\\learn-fluent-easy\\scripts\\g9-u1-cz-ls-load.sql';
writeFileSync(OUT, sql);
writeFileSync(DIR + 'g9-u1-cz-ls-load.sql', sql);
console.log('SQL 写入:');
console.log('  ', OUT);
console.log('   (副本在规范源 scripts\\g9\\u1\\)');
console.log('完形 INSERT:', cloze.passages.length, '| 听力 INSERT:', listening.exercises.length);
