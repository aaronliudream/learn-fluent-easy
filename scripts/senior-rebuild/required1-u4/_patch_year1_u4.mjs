import { readFileSync, writeFileSync } from 'node:fs';
const Y = 'src/data/gaokaoHub/year1.json';
const y = JSON.parse(readFileSync(Y, 'utf8'));
const u = y.year1.semesters.gk_required1.units[4]; // gk1_required1_u5 = U4(Natural Disasters)
if (u.unitKey !== 'U4') throw new Error('unit[4] 不是 U4: ' + u.unitKey);
const vf = JSON.parse(readFileSync('scripts/senior-rebuild/required1-u4/required1-u4-vocab.json', 'utf8'));
const fr = JSON.parse(readFileSync('scripts/senior-rebuild/required1-u4/required1-u4-finalreading.json', 'utf8')).finalReading;
const emojiFor = p => /adj/.test(p) ? '🔤' : /v/.test(p) ? '🏃' : /n/.test(p) ? '📦' : '📘';

u.title = 'Natural Disasters';
u.cn = '自然灾害';
u.emoji = '🌋';
u.vocabulary = vf.words.map(w => ({ en: w.word, cn: (w.meaning_cn || '').split(/[；;]/)[0], emoji: emojiFor(w.pos) }));

u.listeningQuestions = [
  { audio: 'A strong earthquake hit the city early this morning.', opts: ['今天清晨一场强震袭击了城市。', '城市今天很平静。', '地震发生在去年。', '没有人受伤。'], answer: 0 },
  { audio: 'Rescue workers dug out the people who were trapped.', opts: ['救援人员把被困的人挖了出来。', '人们自己走了出来。', '没有人被困。', '救援队还没到。'], answer: 0 },
  { audio: 'Keep an emergency kit with water, food and a first aid kit.', opts: ['备好装有水、食物和急救箱的应急包。', '应急包里只放玩具。', '不需要任何准备。', '把食物丢掉。'], answer: 0 },
  { audio: 'During an earthquake, the most important thing is to stay calm.', opts: ['地震时最重要的是保持镇静。', '地震时应该大喊大叫。', '地震不危险。', '地震时要立刻睡觉。'], answer: 0 },
  { audio: 'Foreign aid was organised, but damaged roads made delivery hard.', opts: ['组织了外国援助,但受损道路使运送困难。', '没有任何援助。', '道路完好无损。', '物资很快送到。'], answer: 0 },
  { audio: 'With great effort, a new city was built upon the ruins.', opts: ['凭着巨大努力,一座新城在废墟上建起。', '城市被永远废弃。', '没有人重建。', '废墟无法清理。'], answer: 0 },
];

u.quizQuestions = [
  { q: '「海啸」对应的英文单词是？', opts: ['tsunami', 'drought', 'shelter', 'wisdom'], answer: 0, point: '词汇', dim: 'vocab' },
  { q: '「废墟」对应的英文单词是？', opts: ['ruins', 'bricks', 'waves', 'effort'], answer: 0, point: '词汇', dim: 'vocab' },
  { q: 'evacuate 的中文意思是？', opts: ['疏散;撤离', '摧毁', '埋葬', '呼吸'], answer: 0, point: '词汇', dim: 'vocab' },
  { q: 'magnitude 的中文意思是？', opts: ['(地震)震级', '避难所', '台风', '智慧'], answer: 0, point: '词汇', dim: 'vocab' },
  { q: '"The people ____ lived near the river were warned." (指人作主语)', opts: ['who', 'which', 'whom', 'whose'], answer: 0, point: '语法', dim: 'grammar' },
  { q: '"Everything ____ stood in the city was destroyed." (不定代词后)', opts: ['that', 'which', 'who', 'whom'], answer: 0, point: '语法', dim: 'grammar' },
  { q: '"Survivors ____ homes were destroyed got shelter." (表所属)', opts: ['whose', 'who', 'which', 'that'], answer: 0, point: '语法', dim: 'grammar' },
  { q: '"The doctor with ____ he worked died in the quake." (介词后指人)', opts: ['whom', 'who', 'which', 'that'], answer: 0, point: '语法', dim: 'grammar' },
  { q: '🔊 听句子,选出与它相符的一项', opts: ['今天清晨一场强震袭击了城市。', '城市很平静。', '地震在去年。', '无人受伤。'], answer: 0, audio: 'A strong earthquake hit the city early this morning.', point: '听力', dim: 'listening' },
  { q: '🔊 听句子,选出与它相符的一项', opts: ['地震时最重要的是保持镇静。', '应该大喊。', '地震不危险。', '要立刻睡觉。'], answer: 0, audio: 'During an earthquake, the most important thing is to stay calm.', point: '听力', dim: 'listening' },
];

u.reading = {
  passage: 'At 3:42 a.m. on 28 July 1976, everything in Tangshan began to shake. In less than one minute, a large city lay in ruins. But hope was not lost, and a new city later rose from the ruins.',
  passageCn: '唐山大地震课文见阅读关(地震/预兆/海啸/重建)。',
  questions: [{ q: 'How long did it take the city to lie in ruins?', opts: ['Less than a minute.', 'A whole day.', 'A week.', 'A month.'], answer: 0 }],
};
u.writing = {
  prompt: 'Write a summary (about 80 words) of a news report about a natural disaster.',
  promptCn: '为一则自然灾害新闻写一篇约80词的摘要(时间地点+灾难/主要影响/救援援助,转述不照抄)。',
  sampleWords: ['earthquake', 'tsunami', 'magnitude', 'affect', 'sweep away', 'aid', 'deliver', 'survivor', 'damage', 'rescue'],
};
u.dialogues = [{
  title: 'An Earthquake News Report',
  lines: [
    { role: 'A', text: 'What can you tell us about the disaster?', cn: '关于这场灾难你能告诉我们什么?' },
    { role: 'B', text: 'A strong earthquake hit the city early this morning.', cn: '今天清晨一场强震袭击了城市。' },
    { role: 'A', text: 'What do the survivors need most?', cn: '幸存者最需要什么?' },
    { role: 'B', text: 'They need clean water, food and shelter right now.', cn: '他们现在需要干净的水、食物和避难所。' },
  ],
}];
u.finalReading = fr;

const st = u.stages;
const vs = st.find(s => s.type === 'vocab'); if (vs) vs.subtitle = u.vocabulary.length + '个教材词汇';
if (!st.some(s => s.type === 'cloze')) {
  const ri = st.findIndex(s => s.type === 'reading');
  st.splice(ri + 1, 0, { id: 's5c', title: '完形填空', subtitle: '语境填词', icon: '✍️', type: 'cloze', time: '8分钟' });
}

u.grammarTitle = '限制性定语从句:关系代词 that / which / who / whom / whose';
u.grammarCode = null;
u.grammarCodes = ['u4.01', 'u4.02', 'u4.03'];
u.available = true;

writeFileSync(Y, JSON.stringify(y, null, 2) + '\n');
console.log('U4 接hub完成: vocab', u.vocabulary.length, '| listenQ', u.listeningQuestions.length,
  '| stages', u.stages.length, '(' + u.stages.map(s => s.type).join('>') + ')',
  '| finalReading', !!u.finalReading, '| grammarTitle', u.grammarTitle, '| grammarCodes', JSON.stringify(u.grammarCodes), '| available', u.available);
