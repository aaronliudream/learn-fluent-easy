import { readFileSync, writeFileSync } from 'node:fs';
const Y = 'src/data/gaokaoHub/year1.json';
const y = JSON.parse(readFileSync(Y, 'utf8'));
const u = y.year1.semesters.gk_required1.units[5]; // gk1_required1_u6 = U5(Languages Around the World)
if (u.unitKey !== 'U5') throw new Error('unit[5] 不是 U5: ' + u.unitKey);
const vf = JSON.parse(readFileSync('scripts/senior-rebuild/required1-u5/required1-u5-vocab.json', 'utf8'));
const fr = JSON.parse(readFileSync('scripts/senior-rebuild/required1-u5/required1-u5-finalreading.json', 'utf8')).finalReading;
const emojiFor = p => /adj/.test(p) ? '🔤' : /v/.test(p) ? '🏃' : /n/.test(p) ? '📦' : '📘';

u.title = 'Languages Around the World';
u.cn = '世界语言';
u.emoji = '🗣️';
u.vocabulary = vf.words.map(w => ({ en: w.word, cn: (w.meaning_cn || '').split(/[；;]/)[0], emoji: emojiFor(w.pos) }));

u.listeningQuestions = [
  { audio: 'Chinese and English have the most native speakers in the world.', opts: ['汉语和英语是世界上母语者最多的语言。', '法语母语者最多。', '世界只有两种语言。', '没人说英语。'], answer: 0 },
  { audio: 'Written Chinese dates back thousands of years to symbols carved on bones.', opts: ['汉字可追溯到数千年前刻在骨头上的符号。', '汉字是去年发明的。', '汉字从不变化。', '汉字写在纸上很晚才出现。'], answer: 0 },
  { audio: 'No matter what dialect people speak, they can read the same characters.', opts: ['不论说什么方言,人们都能读同样的字。', '不同方言无法书写。', '汉字每个地区都不同。', '只有学者能读汉字。'], answer: 0 },
  { audio: 'Learning a foreign language opens a door to a new way of thinking.', opts: ['学外语会打开通往新思维方式的大门。', '学外语没有用。', '外语太难学不会。', '只有出国才能学外语。'], answer: 0 },
  { audio: 'In British English, pants means underwear, not trousers.', opts: ['在英式英语里 pants 指内裤,不是裤子。', '英美英语完全一样。', 'pants 在哪都指裤子。', '没有英美差异。'], answer: 0 },
  { audio: 'Listening to English radio every day helps me get used to the speed.', opts: ['每天听英语广播帮我习惯语速。', '听广播没有帮助。', '我从不练听力。', '广播让我更困惑。'], answer: 0 },
];

u.quizQuestions = [
  { q: '「书法」对应的英文单词是？', opts: ['calligraphy', 'dynasty', 'dialect', 'civilisation'], answer: 0, point: '词汇', dim: 'vocab' },
  { q: '「文字;符号」对应的英文单词是？', opts: ['character', 'tongue', 'system', 'factor'], answer: 0, point: '词汇', dim: 'vocab' },
  { q: 'despite 的中文意思是？', opts: ['尽管;即使', '欣赏', '雕刻', '统一'], answer: 0, point: '词汇', dim: 'vocab' },
  { q: 'appreciate 的中文意思是？', opts: ['欣赏;重视', '方言', '态度', '差距'], answer: 0, point: '词汇', dim: 'vocab' },
  { q: '"I remember the day ____ I first wrote a character." (时间先行词)', opts: ['when', 'which', 'where', 'that'], answer: 0, point: '语法', dim: 'grammar' },
  { q: '"This is the country ____ many languages are spoken." (地点先行词)', opts: ['where', 'which', 'when', 'that'], answer: 0, point: '语法', dim: 'grammar' },
  { q: '"There are many reasons ____ people learn a language." (原因)', opts: ['why', 'which', 'where', 'when'], answer: 0, point: '语法', dim: 'grammar' },
  { q: '"The bones on ____ symbols were carved are very old." (介词后指物)', opts: ['which', 'that', 'when', 'where'], answer: 0, point: '语法', dim: 'grammar' },
  { q: '🔊 听句子,选出与它相符的一项', opts: ['汉语和英语是世界上母语者最多的语言。', '法语最多。', '只有两种语言。', '没人说英语。'], answer: 0, audio: 'Chinese and English have the most native speakers in the world.', point: '听力', dim: 'listening' },
  { q: '🔊 听句子,选出与它相符的一项', opts: ['学外语会打开通往新思维方式的大门。', '学外语没用。', '外语太难。', '只有出国才能学。'], answer: 0, audio: 'Learning a foreign language opens a door to a new way of thinking.', point: '听力', dim: 'listening' },
];

u.reading = {
  passage: 'China is known for its ancient civilisation, which has continued into modern times. One of the main reasons is the Chinese writing system, by which the present is connected with the past.',
  passageCn: '汉字书写系统课文见阅读关(汉字系统/书法/学外语等)。',
  questions: [{ q: 'What connects China\'s present with its past?', opts: ['The Chinese writing system.', 'Modern films.', 'Foreign trade.', 'The weather.'], answer: 0 }],
};
u.writing = {
  prompt: 'Write a blog (about 80 words) about a problem you have in learning English and how to solve it.',
  promptCn: '写一篇约80词的英语学习博客:描述一个学英语的困难 + 解决方法 + 鼓励同学。',
  sampleWords: ['problem', 'trouble', 'listening', 'native speaker', 'advice', 'improve', 'record', 'compare', 'confident', 'give up'],
};
u.dialogues = [{
  title: 'Which Language to Learn',
  lines: [
    { role: 'A', text: 'What foreign language do you want to study?', cn: '你想学哪门外语?' },
    { role: 'B', text: 'I really want to study French. I think it sounds beautiful.', cn: '我很想学法语,觉得它很好听。' },
    { role: 'A', text: 'Do you want to go to France one day?', cn: '你想有一天去法国吗?' },
    { role: 'B', text: 'Yes, and French is used by many international organisations.', cn: '是的,而且许多国际组织都用法语。' },
  ],
}];
u.finalReading = fr;

const st = u.stages;
const vs = st.find(s => s.type === 'vocab'); if (vs) vs.subtitle = u.vocabulary.length + '个教材词汇';
if (!st.some(s => s.type === 'cloze')) {
  const ri = st.findIndex(s => s.type === 'reading');
  st.splice(ri + 1, 0, { id: 's5c', title: '完形填空', subtitle: '语境填词', icon: '✍️', type: 'cloze', time: '8分钟' });
}

u.grammarTitle = '限制性定语从句:关系副词 when / where / why';
u.grammarCode = null;
u.grammarCodes = ['u5.01', 'u5.02', 'u5.03'];
u.available = true;

writeFileSync(Y, JSON.stringify(y, null, 2) + '\n');
console.log('U5 接hub完成: vocab', u.vocabulary.length, '| listenQ', u.listeningQuestions.length,
  '| stages', u.stages.length, '(' + u.stages.map(s => s.type).join('>') + ')',
  '| finalReading', !!u.finalReading, '| grammarTitle', u.grammarTitle, '| grammarCodes', JSON.stringify(u.grammarCodes), '| available', u.available);
