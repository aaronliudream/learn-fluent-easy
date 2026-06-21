// 给 g9 U1 的 29 词补 phrase_en(原创真实搭配),写回源 json + 生成幂等 UPDATE SQL。
import { readFileSync, writeFileSync, copyFileSync } from 'node:fs';
const DIR = 'C:\\Projects\\learn-fluent-easy\\scripts\\g9\\u1\\';
const VJSON = DIR + 'g9-u1-vocab.json';

// 原创真实搭配(对齐 8 年级 phrase_en 风格:简短地道搭配)
const CHUNKS = {
  textbook: 'open your textbook',
  conversation: 'have a conversation',
  aloud: 'read aloud in class',
  pronunciation: 'improve your pronunciation',
  sentence: 'make a sentence',
  patient: 'be patient with others',
  expression: 'a useful expression',
  discover: 'discover a secret',
  secret: 'keep a secret',
  grammar: 'English grammar',
  repeat: 'repeat the new words',
  note: 'take notes in class',
  pronounce: 'pronounce the word',
  increase: 'increase your vocabulary',
  partner: 'work with a partner',
  physics: 'a physics class',
  chemistry: 'a chemistry teacher',
  born: 'be born in 2010',
  create: 'create a story',
  speed: 'reading speed',
  ability: 'the ability to learn',
  active: 'be active in class',
  brain: 'use your brain',
  connect: 'connect words with pictures',
  review: 'review your lessons',
  knowledge: 'gain knowledge',
  wisely: 'use time wisely',
  memorize: 'memorize new words',
  attention: 'pay attention to the teacher',
};

const vocab = JSON.parse(readFileSync(VJSON, 'utf8'));
let miss = 0;
for (const w of vocab.words) {
  const c = CHUNKS[w.word];
  if (!c) { console.log('⚠️ 缺搭配:', w.word); miss++; continue; }
  w.phrase_en = c;
}
writeFileSync(VJSON, JSON.stringify(vocab, null, 2));

const esc = (s) => String(s).replace(/'/g, "''");
let sql = `-- g9 U1 词汇 phrase_en(language chunk)回填。幂等:按 lower(word) 匹配,可重复跑。\n`;
for (const w of vocab.words) {
  if (!CHUNKS[w.word]) continue;
  sql += `UPDATE public.junior_vocab SET phrase_en='${esc(CHUNKS[w.word])}' WHERE volume='g9' AND unit='U1' AND lower(word)=lower('${esc(w.word)}');\n`;
}
sql += `\n-- count 校验(预期 29)\nSELECT count(*) AS with_chunk FROM public.junior_vocab WHERE volume='g9' AND unit='U1' AND phrase_en IS NOT NULL AND phrase_en<>'';\n`;
const OUT = DIR + 'g9-u1-chunk-update.sql';
writeFileSync(OUT, sql);
copyFileSync(OUT, 'C:\\Projects\\learn-fluent-easy\\scripts\\g9-u1-chunk-update.sql');
console.log('源 json 已补 phrase_en:', vocab.words.length, '词 | 缺搭配:', miss);
console.log('SQL ->', OUT);
console.log('SQL 副本 -> scripts\\g9-u1-chunk-update.sql');
