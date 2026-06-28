// 生成上外(sufe)hub 课本结构数据 -> src/data/gaokaoHub/sufe-courses.json
// 形如 { "1": GradeCourseDef, "2": {...空}, "3": {...空} }。只含已灌库(DB有内容)的 required1+required2。
// 9关全部 DB 驱动(按 grade+book+unitKey+publisher),内联只给 writing/finalReading/(hub.json有则补 reading/听力/quiz)。
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const BOOKS = ['required1', 'required2'];
const PREFIX = { required1: 's1', required2: 's2' };
const COURSE_NAME = '高一';

const STD_STAGES = (grammarTitle) => ([
  { id: 's1', title: '核心词汇', subtitle: '教材核心词汇', icon: '📚', type: 'vocab', time: '8分钟' },
  { id: 's2', title: '听音辨词', subtitle: '听力辨词', icon: '🎧', type: 'listenWord', time: '6分钟' },
  { id: 's3', title: '词义配对', subtitle: '巩固记忆', icon: '🎮', type: 'match', time: '5分钟' },
  { id: 's4', title: '语法专项', subtitle: grammarTitle, icon: '🧩', type: 'grammar', time: '12分钟' },
  { id: 's5', title: '课文阅读', subtitle: '阅读理解', icon: '📖', type: 'reading', time: '8分钟' },
  { id: 's5c', title: '完形填空', subtitle: '语境填词', icon: '📝', type: 'cloze', time: '8分钟' },
  { id: 's6', title: '听力短文', subtitle: '听音答题', icon: '👂', type: 'listening', time: '8分钟' },
  { id: 's7', title: '写作练习', subtitle: '本单元句型', icon: '✍️', type: 'writing', time: '10分钟' },
  { id: 's8', title: '单元通关', subtitle: '综合检测', icon: '🏆', type: 'finalQuiz', time: '12分钟' },
]);

const rd = (p) => existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null;
const LETTER = ['A', 'B', 'C', 'D', 'E'];

function buildUnit(vol, ukey, idx, m) {
  const dir = `scripts/senior-rebuild/sufe-${vol}/${ukey}`;
  const hub = rd(`${dir}/${vol}-${ukey}-hub.json`);
  const writingF = rd(`${dir}/${vol}-${ukey}-writing.json`);
  const finalF = rd(`${dir}/${vol}-${ukey}-finalreading.json`);

  // writing 内联(水关 prompt):优先 hub.json,其次 writing 专项文件
  let writing = null;
  if (hub?.writing) writing = { prompt: hub.writing.prompt, promptCn: hub.writing.promptCn, sampleWords: hub.writing.sampleWords || [] };
  else if (writingF) writing = {
    prompt: writingF.prompt_en || writingF.topic || '',
    promptCn: writingF.prompt_cn || '',
    sampleWords: (writingF.scoring?.useful_words || writingF.key_expressions || []).slice(0, 10),
  };

  // finalReading(buildFinalQuiz 优先用):answer index -> letter
  let finalReading;
  const fr = finalF?.finalReading;
  if (fr?.passage && Array.isArray(fr.questions)) {
    finalReading = {
      passage: fr.passage,
      questions: fr.questions.map((q) => ({
        q: q.q, options: q.options,
        answer: typeof q.answer === 'number' ? (LETTER[q.answer] || 'A') : (q.answer || 'A'),
        explanation: q.explanation || '',
      })),
    };
  }

  const unit = {
    id: `sufe_${vol}_${ukey}`,
    num: idx + 1,
    unitKey: m.unit,
    book: vol,
    title: m.title,
    cn: m.cn,
    emoji: m.emoji,
    available: true,
    vocabulary: [],
    dialogues: hub?.dialogues || [],
    stages: STD_STAGES(m.grammarTitle),
    grammarTitle: m.grammarTitle,
    grammarCode: null,
    grammarCodes: m.grammarCodes.map((c) => PREFIX[vol] + c),
    grammarQuiz: [],
    reading: hub?.reading ? { passage: hub.reading.passage, passageCn: hub.reading.passageCn, questions: hub.reading.questions || [] } : null,
    writing,
    quizQuestions: hub?.quizQuestions || [],
    listeningQuestions: hub?.listeningQuestions || [],
  };
  if (finalReading) unit.finalReading = finalReading;
  return unit;
}

const SEM_NAME = { required1: '必修第一册', required2: '必修第二册' };
const semesters = {};
for (const vol of BOOKS) {
  const meta = (await import(`./sufe-${vol}/_meta.mjs`)).META;
  const ukeys = Object.keys(meta); // u1..u4
  const units = ukeys.map((uk, i) => buildUnit(vol, uk, i, meta[uk]));
  semesters[`gk_${vol}`] = { name: SEM_NAME[vol], available: true, units };
}

const out = {
  1: { name: COURSE_NAME, semesters },
  2: { name: '高二', semesters: {} },
  3: { name: '高三', semesters: {} },
};
writeFileSync('src/data/gaokaoHub/sufe-courses.json', JSON.stringify(out, null, 2));
let n = 0; for (const s of Object.values(semesters)) n += s.units.length;
console.log(`sufe-courses.json 写出:${Object.keys(semesters).length} 学期 / ${n} 单元`);
for (const [sid, s] of Object.entries(semesters)) console.log(`  ${sid}: ${s.units.map(u => u.unitKey + ' ' + u.title + ' [' + u.grammarCodes.join(',') + ']').join(' | ')}`);
