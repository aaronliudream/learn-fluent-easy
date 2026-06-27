import { readFileSync, writeFileSync } from 'node:fs';
const Y = 'src/data/gaokaoHub/year1.json';
const y = JSON.parse(readFileSync(Y, 'utf8'));
const u = y.year1.semesters.gk_required1.units[3]; // gk1_required1_u4 = U3(Sports)
if (u.unitKey !== 'U3') throw new Error('unit[3] 不是 U3: ' + u.unitKey);
const vf = JSON.parse(readFileSync('scripts/senior-rebuild/required1-u3/required1-u3-vocab.json', 'utf8'));
const fr = JSON.parse(readFileSync('scripts/senior-rebuild/required1-u3/required1-u3-finalreading.json', 'utf8')).finalReading;
const emojiFor = p => /adj/.test(p) ? '🔤' : /v/.test(p) ? '🏃' : /n/.test(p) ? '📦' : '📘';

u.title = 'Sports and Fitness';
u.cn = '运动与健康';
u.emoji = '⚽';
u.vocabulary = vf.words.map(w => ({ en: w.word, cn: (w.meaning_cn || '').split(/[；;]/)[0], emoji: emojiFor(w.pos) }));

u.listeningQuestions = [
  { audio: 'I go to the gym three times a week.', opts: ['我每周去三次健身房。', '我从不去健身房。', '健身房离我家很远。', '我一年去一次健身房。'], answer: 0 },
  { audio: 'She won a gold medal at the Olympics.', opts: ['她在奥运会上赢得一枚金牌。', '她错过了奥运会。', '她没有得奖。', '她只是观众。'], answer: 0 },
  { audio: 'Lang Ping never lost heart when the team faced difficulties.', opts: ['球队遇到困难时郎平从不气馁。', '郎平很快就放弃了。', '球队从没遇到困难。', '郎平离开了球队。'], answer: 0 },
  { audio: 'A good player should never pretend to fall down.', opts: ['好球员绝不该假装摔倒。', '球员应该经常假摔。', '假摔能帮球队赢。', '裁判看不出假摔。'], answer: 0 },
  { audio: 'Jogging is good for your health and clears your mind.', opts: ['慢跑有益健康,还能让头脑清醒。', '慢跑很危险。', '慢跑浪费时间。', '慢跑只适合运动员。'], answer: 0 },
  { audio: 'Our team will compete in the final this Saturday.', opts: ['我们队本周六将参加决赛。', '我们队已经被淘汰了。', '决赛取消了。', '我们队不想参赛。'], answer: 0 },
];

u.quizQuestions = [
  { q: '「健身房」对应的英文单词是？', opts: ['gym', 'medal', 'track', 'diet'], answer: 0, point: '词汇', dim: 'vocab' },
  { q: '「冠军」对应的英文单词是？', opts: ['champion', 'athlete', 'captain', 'audience'], answer: 0, point: '词汇', dim: 'vocab' },
  { q: 'determination 的中文意思是？', opts: ['决心;毅力', '失败', '观众', '压力'], answer: 0, point: '词汇', dim: 'vocab' },
  { q: 'graceful 的中文意思是？', opts: ['优美的;优雅的', '苗条的', '强壮的', '受伤的'], answer: 0, point: '词汇', dim: 'vocab' },
  { q: '"You play badminton every Friday, ____?"', opts: ['don\'t you', 'aren\'t you', 'do you', 'didn\'t you'], answer: 0, point: '语法', dim: 'grammar' },
  { q: '"She is a great athlete, ____?"', opts: ['isn\'t she', 'doesn\'t she', 'is she', 'wasn\'t she'], answer: 0, point: '语法', dim: 'grammar' },
  { q: '"Let\'s go to the basketball game, ____?"', opts: ['shall we', 'will we', 'shall you', 'do we'], answer: 0, point: '语法', dim: 'grammar' },
  { q: '"They won the match yesterday, ____?"', opts: ['didn\'t they', 'don\'t they', 'weren\'t they', 'didn\'t he'], answer: 0, point: '语法', dim: 'grammar' },
  { q: '🔊 听句子,选出与它相符的一项', opts: ['她在奥运会上赢得一枚金牌。', '她错过了比赛。', '她没有得奖。', '她是观众。'], answer: 0, audio: 'She won a gold medal at the Olympics.', point: '听力', dim: 'listening' },
  { q: '🔊 听句子,选出与它相符的一项', opts: ['我每周去三次健身房。', '我从不锻炼。', '健身房很远。', '我一年去一次。'], answer: 0, audio: 'I go to the gym three times a week.', point: '听力', dim: 'listening' },
];

u.reading = {
  passage: 'As a player, Lang Ping brought honour and glory to her country. As a coach, she led the team to medals at the Olympics. When the team faced difficulties, she did not lose heart.',
  passageCn: '运动传奇课文见阅读关(郎平/乔丹等)。',
  questions: [{ q: 'What did Lang Ping do as a coach?', opts: ['She led the team to Olympic medals.', 'She gave up the team.', 'She only played games.', 'She left the country.'], answer: 0 }],
};
u.writing = {
  prompt: 'Write a page in a wellness book about a positive change in your exercise or eating (about 80 words).',
  promptCn: '为健康手册写一页,描述你在运动或饮食上的一个积极改变(约80词)。',
  sampleWords: ['fitness', 'diet', 'jog', 'instead of', 'rather than', 'positive', 'healthier', 'stress', 'exercise', 'strength'],
};
u.dialogues = [{
  title: 'Inviting a Friend to a Match',
  lines: [
    { role: 'A', text: 'Did you hear there\'s a soccer game this weekend?', cn: '你听说这周末有场足球赛吗?' },
    { role: 'B', text: 'Really? I\'d love to come along!', cn: '真的吗?我很想一起去!' },
    { role: 'A', text: 'Great. Let\'s meet at the stadium gate at two thirty.', cn: '太好了,我们两点半在体育场门口见。' },
  ],
}];
u.finalReading = fr;

// 9关:确保有完形关(照 U2 同款补 s5c)。
const st = u.stages;
const vs = st.find(s => s.type === 'vocab'); if (vs) vs.subtitle = u.vocabulary.length + '个教材词汇';
if (!st.some(s => s.type === 'cloze')) {
  const ri = st.findIndex(s => s.type === 'reading');
  st.splice(ri + 1, 0, { id: 's5c', title: '完形填空', subtitle: '语境填词', icon: '✍️', type: 'cloze', time: '8分钟' });
}

u.grammarTitle = '反意疑问句(Tag Questions)';
u.grammarCode = null;
u.grammarCodes = ['u3.01', 'u3.02', 'u3.03'];
u.available = true;

writeFileSync(Y, JSON.stringify(y, null, 2) + '\n');
console.log('U3 接hub完成: vocab', u.vocabulary.length, '| listenQ', u.listeningQuestions.length,
  '| stages', u.stages.length, '(' + u.stages.map(s => s.type).join('>') + ')',
  '| finalReading', !!u.finalReading, '| grammarTitle', u.grammarTitle, '| grammarCodes', JSON.stringify(u.grammarCodes), '| available', u.available);
