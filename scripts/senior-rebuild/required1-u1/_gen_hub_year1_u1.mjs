// 用 6 源文件重生成 year1.json 里 必修一 U1 单元的内嵌内容(hub 8 关读这个),替换占位。
// 只改 U1 内容字段,保留 id/num/unitKey/book/title/cn/emoji/available/stages 结构。
// grammarCode=null → 语法关用内嵌 grammarQuiz(技能页改线归 Phase 2)。
import { readFileSync, writeFileSync } from 'node:fs';
const ROOT = 'C:\\Projects\\learn-fluent-easy\\';
const DIR = ROOT + 'scripts\\senior-rebuild\\required1-u1\\';
const vocab = JSON.parse(readFileSync(DIR + 'required1-u1-vocab.json', 'utf8'));
const grammar = JSON.parse(readFileSync(DIR + 'required1-u1-grammar.json', 'utf8'));
const reading = JSON.parse(readFileSync(DIR + 'required1-u1-reading.json', 'utf8'));
const writing = JSON.parse(readFileSync(DIR + 'required1-u1-writing.json', 'utf8'));
const Y = ROOT + 'src\\data\\gaokaoHub\\year1.json';
const y = JSON.parse(readFileSync(Y, 'utf8'));

const EMOJI = {
  teenage: '🧑', teenager: '🧑', ballet: '🩰', volunteer: '🙋', debate: '🗣️', prefer: '❤️', content: '📋',
  movement: '🤸', greenhouse: '🌱', suitable: '✅', actually: '💡', challenge: '⛰️', title: '🔖', topic: '💬',
  freshman: '🆕', confusing: '😵', confuse: '😵', confused: '😕', fluent: '🎤', graduate: '🎓', recommend: '👍',
  advanced: '⬆️', advance: '➡️', literature: '📚', 'extra-curricular': '🎭', extra: '➕', obviously: '👀',
  quit: '🛑', responsible: '🫡', responsibility: '📌', solution: '🔑', schedule: '📅', editor: '✏️',
  adventure: '🗺️', youth: '🌟', survival: '🏕️', expert: '🎯', behaviour: '🚸', generation: '👨‍👩‍👧',
  attract: '🧲', focus: '🔍', addicted: '🎮', addict: '🎮', adult: '🧑‍💼',
};
const shortCn = (m) => m.split(/[（(；;]/)[0].trim();

// vocabulary: {en, cn(短), emoji}
const vocabulary = vocab.words.map(w => ({ en: w.word, cn: shortCn(w.meaning_cn), emoji: EMOJI[w.word] || '📘' }));

// grammarQuiz: 每点 3 应用 + 1 句子成分功能(术语)= 9:3,应用为主;去"选出X短语:"术语化前缀
const cleanStem = (s) => s.replace(/^选出[^：:]*[：:]\s*/, '').replace(/^[“"](.*?)[”"]$/s, '$1');
const pick = (code, qids) => qids.map(id => grammar.questions.find(q => q.code === code && q.qid === id)).filter(Boolean);
const gq = [
  ...pick('r1u1.01', ['r1u1.01.q1', 'r1u1.01.q5', 'r1u1.01.q11', 'r1u1.01.q15']),
  ...pick('r1u1.02', ['r1u1.02.q1', 'r1u1.02.q3', 'r1u1.02.q12', 'r1u1.02.q15']),
  ...pick('r1u1.03', ['r1u1.03.q1', 'r1u1.03.q3', 'r1u1.03.q10', 'r1u1.03.q15']),
].map(q => ({ q: cleanStem(q.stem), opts: q.options, answer: q.answer_index, point: q.point.replace(/ \(.*/, ''), dim: 'grammar' }));

// reading: 主篇 rd1 + 中译 + 该篇 4 题
const rd1 = reading.passages.find(p => p.code === 'r1u1.rd1');
const passageCn = '嗨!我叫 Adam,是一名高一新生。从初中升入高中是个很大的挑战,开学第一周有点令人困惑。首先,我得仔细考虑选哪些课程,学业顾问帮我选了合适的:数学、英语、化学、世界历史和语文。我知道汉语很难,但希望毕业时能说得流利。顾问还建议我报名高级文学,因为我喜欢英语也擅长它。我也得选课外活动:我想加入校足球队,但教练说我踢得不够好。我虽然不开心,但我不会放弃,会自己想办法提高,争取明年进队。于是我改加入了志愿者社团,每周三给社区里无家可归的人发放食物。我知道以后要更努力学习,承担更多责任。不过我很高兴来到这里,会为将来做好准备。';
const readingObj = {
  passage: rd1.body,
  passageCn,
  questions: rd1.questions.map(q => ({ q: q.stem, opts: q.options, answer: q.answer_index, point: '阅读理解', dim: 'reading' })),
};

// listeningQuestions: 6 条「听英文→选中文意思」(hubSpeak 念 audio),答案打散
const listeningQuestions = [
  { audio: 'My first week at senior high was a little confusing.', opts: ['我高中第一周有点令人困惑。', '我高中第一周很无聊。', '我没去上学。', '我第一周就毕业了。'], answer: 0 },
  { audio: 'I prefer reading to playing computer games.', opts: ['我喜欢玩电脑游戏。', '比起玩电脑游戏我更喜欢读书。', '我讨厌读书。', '我两者都不喜欢。'], answer: 1 },
  { audio: 'You should make a schedule to manage your time.', opts: ['你应该多玩游戏。', '时间不重要。', '你应该制定计划来管理时间。', '你不需要计划。'], answer: 2 },
  { audio: "Don't be afraid of making mistakes.", opts: ['错误很可怕。', '不要再犯错。', '别再尝试了。', '不要害怕犯错。'], answer: 3 },
  { audio: 'I joined the volunteer club to help homeless people.', opts: ['我加入志愿者社团帮助无家可归的人。', '我退出了社团。', '我在打篮球。', '我不喜欢帮助别人。'], answer: 0 },
  { audio: 'He is good at maths and science.', opts: ['他讨厌数学。', '他擅长数学和科学。', '他不会科学。', '他喜欢艺术。'], answer: 1 },
];

// quizQuestions: 单元通关 综合 ~10;词汇题守语义对应铁律(同类四选一,标答=释义)
const quizQuestions = [
  { q: '「青少年」对应的英文单词是？', opts: ['adult', 'teenager', 'editor', 'expert'], answer: 1, point: '词汇', dim: 'vocab' },
  { q: '「挑战」对应的英文单词是？', opts: ['topic', 'movement', 'challenge', 'schedule'], answer: 2, point: '词汇', dim: 'vocab' },
  { q: '「流利的」对应的英文单词是？', opts: ['confused', 'suitable', 'advanced', 'fluent'], answer: 3, point: '词汇', dim: 'vocab' },
  { q: '「推荐；建议」对应的英文单词是？', opts: ['recommend', 'quit', 'attract', 'graduate'], answer: 0, point: '词汇', dim: 'vocab' },
  { q: '「负责的」对应的英文单词是？', opts: ['curious', 'responsible', 'obvious', 'suitable'], answer: 1, point: '词汇', dim: 'vocab' },
  { q: 'Many teenagers are ____ computer games.', opts: ['addicted in', 'addicted to', 'addicted with', 'addicted at'], answer: 1, point: '形容词短语', dim: 'grammar' },
  { q: 'The teacher is always ____ his students.', opts: ['patient to', 'patient for', 'patient with', 'patient at'], answer: 2, point: '形容词短语', dim: 'grammar' },
  { q: 'We should respect ____.', opts: ['our debate teacher', 'very polite', 'quite often', 'afraid of failure'], answer: 0, point: '名词短语', dim: 'grammar' },
  { q: "In 'The Freshman Challenge', what did Adam join instead of the football team?", opts: ['A volunteer club', 'The ballet club', 'A debate team', 'A music band'], answer: 0, point: '阅读理解', dim: 'reading' },
  { q: 'What is a good way to manage your time at senior high?', opts: ['Play more games', 'Make a schedule', 'Skip your homework', 'Sleep all day'], answer: 1, point: '阅读理解', dim: 'reading' },
];

// writing
const writingObj = {
  prompt: writing.prompt_en,
  promptCn: writing.prompt_cn,
  sampleWords: writing.scoring?.useful_words ?? [],
};

// ---- 写入 U1 单元 ----
const sem = y.year1.semesters['gk_required1'];
const u1 = sem.units.find(u => u.unitKey === 'U1');
if (!u1) { console.error('找不到 U1 单元'); process.exit(1); }
u1.vocabulary = vocabulary;
u1.grammarTitle = '名词短语 / 形容词短语 / 副词短语';
u1.grammarCode = null;            // 用内嵌 grammarQuiz(技能页/五关改线归 Phase 2)
u1.grammarQuiz = gq;
u1.reading = readingObj;
u1.listeningQuestions = listeningQuestions;
u1.quizQuestions = quizQuestions;
u1.writing = writingObj;
u1.dialogues = [];               // 清占位(hub 不消费 dialogues)
// stages 副标题对齐真内容
const sub = { s1: `${vocabulary.length}个教材词汇`, s4: '名词/形容词/副词短语' };
u1.stages = u1.stages.map(s => sub[s.id] ? { ...s, subtitle: sub[s.id] } : s);

writeFileSync(Y, JSON.stringify(y, null, 2));
console.log('✅ year1.json 必修一 U1 已重生成');
console.log(`  vocab ${vocabulary.length} | grammarQuiz ${gq.length} | reading 1篇+${readingObj.questions.length}题 | listening ${listeningQuestions.length} | finalQuiz ${quizQuestions.length} | writing ✓`);
console.log('  grammarCode → null(用内嵌题) | grammarTitle:', u1.grammarTitle);
