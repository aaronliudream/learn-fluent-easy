// 综合数据修复(对齐8年级):vocab.phrase_en + vocab.freq_rank + reading.vocab_notes。
// 写回源 json + 生成幂等 SQL(按 lower(word)/title 匹配)。
import { readFileSync, writeFileSync, copyFileSync } from 'node:fs';
const DIR = 'C:\\Projects\\learn-fluent-easy\\scripts\\g9\\u1\\';
const VJSON = DIR + 'g9-u1-vocab.json', RJSON = DIR + 'g9-u1-reading.json';
const esc = (s) => String(s).replace(/'/g, "''");
const jb = (o) => "'" + JSON.stringify(o, false ? 0 : undefined).replace(/'/g, "''") + "'::jsonb";

const CHUNKS = {
  textbook:'open your textbook', conversation:'have a conversation', aloud:'read aloud in class',
  pronunciation:'improve your pronunciation', sentence:'make a sentence', patient:'be patient with others',
  expression:'a useful expression', discover:'discover a secret', secret:'keep a secret', grammar:'English grammar',
  repeat:'repeat the new words', note:'take notes in class', pronounce:'pronounce the word',
  increase:'increase your vocabulary', partner:'work with a partner', physics:'a physics class',
  chemistry:'a chemistry teacher', born:'be born in 2010', create:'create a story', speed:'reading speed',
  ability:'the ability to learn', active:'be active in class', brain:'use your brain',
  connect:'connect words with pictures', review:'review your lessons', knowledge:'gain knowledge',
  wisely:'use time wisely', memorize:'memorize new words', attention:'pay attention to the teacher',
};
const VNOTES = {
  'Becoming a Good Learner':[{word:'active',cn:'积极的；主动的'},{word:'patient',cn:'有耐心的'},{word:'connect',cn:'联系；连接'}],
  'Anna and Her Reading Journey':[{word:'hate',cn:'讨厌；厌恶'},{word:'guess',cn:'猜测'},{word:'hobby',cn:'爱好'}],
  'Two Ways to Remember Words':[{word:'repeat',cn:'重复'},{word:'meaning',cn:'含义；意思'},{word:'connected',cn:'相联系的'}],
  'A Letter to a New Classmate':[{word:'mistake',cn:'错误'},{word:'partner',cn:'搭档；同伴'},{word:'progress',cn:'进步'}],
  'The Power of Mistakes':[{word:'mistake',cn:'错误'},{word:'correct',cn:'改正；正确的'},{word:'brave',cn:'勇敢的'}],
  'Learning Beyond the Classroom':[{word:'subtitle',cn:'字幕'},{word:'pronunciation',cn:'发音'},{word:'diary',cn:'日记'}],
};

// 写回源 json
const vocab = JSON.parse(readFileSync(VJSON, 'utf8'));
vocab.words.forEach((w, i) => { w.phrase_en = CHUNKS[w.word]; w.freq_rank = i + 1; });
writeFileSync(VJSON, JSON.stringify(vocab, null, 2));
const reading = JSON.parse(readFileSync(RJSON, 'utf8'));
for (const p of reading.passages) if (VNOTES[p.title]) p.vocab_notes = VNOTES[p.title];
writeFileSync(RJSON, JSON.stringify(reading, null, 2));

// SQL
let sql = `-- g9 U1 数据修复(对齐8年级):vocab.phrase_en + vocab.freq_rank + reading.vocab_notes。幂等。\n\n`;
sql += `-- 1) vocab phrase_en(language chunk)+ freq_rank(展示排序)\n`;
vocab.words.forEach((w, i) => {
  sql += `UPDATE public.junior_vocab SET phrase_en='${esc(CHUNKS[w.word])}', freq_rank=${i + 1} WHERE volume='g9' AND unit='U1' AND lower(word)=lower('${esc(w.word)}');\n`;
});
sql += `\n-- 2) reading vocab_notes(词汇注释)\n`;
for (const p of reading.passages) {
  if (!VNOTES[p.title]) continue;
  sql += `UPDATE public.junior_reading SET vocab_notes=${jb(VNOTES[p.title])} WHERE volume='g9' AND unit='U1' AND title='${esc(p.title)}';\n`;
}
sql += `\n-- count 校验\n`;
sql += `SELECT 'vocab_phrase' k, count(*) v, 29 expect FROM public.junior_vocab WHERE volume='g9' AND unit='U1' AND phrase_en IS NOT NULL AND phrase_en<>''\n`;
sql += `UNION ALL SELECT 'vocab_freq', count(*), 29 FROM public.junior_vocab WHERE volume='g9' AND unit='U1' AND freq_rank IS NOT NULL\n`;
sql += `UNION ALL SELECT 'reading_vnotes', count(*), 6 FROM public.junior_reading WHERE volume='g9' AND unit='U1' AND jsonb_array_length(vocab_notes)>0;\n`;

const OUT = DIR + 'g9-u1-datafix.sql';
writeFileSync(OUT, sql);
copyFileSync(OUT, 'C:\\Projects\\learn-fluent-easy\\scripts\\g9-u1-datafix.sql');
console.log('源 json 已补:vocab phrase_en+freq_rank(29) / reading vocab_notes(6)');
console.log('SQL ->', OUT, '\nSQL 副本 -> scripts\\g9-u1-datafix.sql');
