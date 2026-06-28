// 接 hub: 把某单元写进 year1.json 的 gk_elective4.units[semIdx]。用法: node _patch_year1.mjs --unit u1
import { readFileSync, writeFileSync } from 'node:fs';
import { VOL, META, CODE_PREFIX, SEM, YEARFILE } from './_meta.mjs';
const PFX = CODE_PREFIX || '';
const U = process.argv[process.argv.indexOf('--unit') + 1];
const m = META[U]; if (!m) throw new Error('未知 unit ' + U);
const DIR = `scripts/senior-rebuild/elective4/${U}`;
const Y = `src/data/gaokaoHub/${YEARFILE}.json`;
const y = JSON.parse(readFileSync(Y, 'utf8'));
const u = y[YEARFILE].semesters[SEM].units[m.semIdx];
if (u.unitKey !== m.unit) throw new Error(`units[${m.semIdx}] 不是 ${m.unit}: ${u.unitKey}`);

const vf = JSON.parse(readFileSync(`${DIR}/${VOL}-${U}-vocab.json`, 'utf8'));
const fr = JSON.parse(readFileSync(`${DIR}/${VOL}-${U}-finalreading.json`, 'utf8')).finalReading;
const hub = JSON.parse(readFileSync(`${DIR}/${VOL}-${U}-hub.json`, 'utf8'));
const emojiFor = p => /adj/.test(p) ? '🔤' : /v/.test(p) ? '🏃' : /n/.test(p) ? '📦' : '📘';

u.title = m.title;
u.cn = m.cn;
u.emoji = m.emoji;
u.vocabulary = vf.words.map(w => ({ en: w.word, cn: (w.meaning_cn || '').split(/[；;]/)[0], emoji: emojiFor(w.pos) }));
u.listeningQuestions = hub.listeningQuestions;
u.quizQuestions = hub.quizQuestions;
u.reading = hub.reading;
u.writing = hub.writing;
u.dialogues = hub.dialogues;
u.finalReading = fr;

const st = u.stages;
const vs = st.find(s => s.type === 'vocab'); if (vs) vs.subtitle = u.vocabulary.length + '个教材词汇';
if (!st.some(s => s.type === 'cloze')) {
  const ri = st.findIndex(s => s.type === 'reading');
  st.splice(ri + 1, 0, { id: 's5c', title: '完形填空', subtitle: '语境填词', icon: '✍️', type: 'cloze', time: '8分钟' });
}
u.grammarTitle = m.grammarTitle;
u.grammarCode = null;
u.grammarCodes = m.grammarCodes.map(c => PFX + c);
u.available = true;

writeFileSync(Y, JSON.stringify(y, null, 2) + '\n');
console.log(`${m.unit} 接hub: vocab ${u.vocabulary.length} | listenQ ${u.listeningQuestions.length} | quizQ ${u.quizQuestions.length} | stages ${u.stages.length}(${u.stages.map(s => s.type).join('>')}) | finalReading ${!!u.finalReading} | grammarCodes ${JSON.stringify(u.grammarCodes)} | available ${u.available}`);
