// 生成外研社(fltrp)hub 课本结构数据 -> src/data/gaokaoHub/fltrp-courses.json
// 形如 { "1": GradeCourseDef, "2": GradeCourseDef, "3": GradeCourseDef }。外研社全 7 册。
// 年级分组(对齐人教):高一=必修1/2/3,高二=选必1/2,高三=选必3/4。
// 9关全部 DB 驱动(按 grade+book+unitKey+publisher),内联只给 writing/finalReading/(hub.json有则补 reading/听力/quiz)。
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

// 每个 grade 含哪些册(顺序 = hub 学期顺序)。
const GRADE_BOOKS = {
  1: ['required1', 'required2', 'required3'],
  2: ['elective1', 'elective2'],
  3: ['elective3', 'elective4'],
};
const GRADE_NAME = { 1: '高一', 2: '高二', 3: '高三' };
const PREFIX = {
  required1: 'f1', required2: 'f2', required3: 'f3',
  elective1: 'fe1', elective2: 'fe2', elective3: 'fe3', elective4: 'fe4',
};
const SEM_NAME = {
  required1: '必修第一册', required2: '必修第二册', required3: '必修第三册',
  elective1: '选择性必修第一册', elective2: '选择性必修第二册',
  elective3: '选择性必修第三册', elective4: '选择性必修第四册',
};

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
  const dir = `scripts/senior-rebuild/fltrp-${vol}/${ukey}`;
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
    id: `fltrp_${vol}_${ukey}`,
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

const out = {};
let total = 0;
for (const grade of [1, 2, 3]) {
  const semesters = {};
  for (const vol of GRADE_BOOKS[grade]) {
    const meta = (await import(`./fltrp-${vol}/_meta.mjs`)).META;
    const ukeys = Object.keys(meta); // u1..u4
    const units = ukeys.map((uk, i) => buildUnit(vol, uk, i, meta[uk]));
    semesters[`gk_${vol}`] = { name: SEM_NAME[vol], available: true, units };
    total += units.length;
  }
  out[grade] = { name: GRADE_NAME[grade], semesters };
}

writeFileSync('src/data/gaokaoHub/fltrp-courses.json', JSON.stringify(out, null, 2));
console.log(`fltrp-courses.json 写出:${total} 单元`);
for (const grade of [1, 2, 3]) {
  for (const [sid, s] of Object.entries(out[grade].semesters)) {
    console.log(`  [G${grade}] ${sid}: ${s.units.map(u => u.unitKey + ' ' + u.title + ' [' + u.grammarCodes.join(',') + ']').join(' | ')}`);
  }
}
