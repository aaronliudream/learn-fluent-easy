// 给 必修一 U1 的 44 词补真实例句(地道、用词限 U1+常见词、体现典型用法),写回 vocab.json。
import { readFileSync, writeFileSync } from 'node:fs';
const F = 'C:\\Projects\\learn-fluent-easy\\scripts\\senior-rebuild\\required1-u1\\required1-u1-vocab.json';
const EX = {
  teenage: ['Teenage life is full of new challenges.', '青少年生活充满新挑战。'],
  teenager: ['Most teenagers enjoy joining school clubs.', '大多数青少年喜欢参加学校社团。'],
  ballet: ['She has a ballet class every Friday.', '她每周五有一节芭蕾课。'],
  volunteer: ['I work as a volunteer at the weekend.', '我周末做志愿者。'],
  debate: ['We had a debate about computer games.', '我们就电脑游戏进行了一场辩论。'],
  prefer: ['I prefer reading to watching TV.', '比起看电视，我更喜欢读书。'],
  content: ['The content of this book is very interesting.', '这本书的内容很有趣。'],
  movement: ['The dancers practise new movements every day.', '舞者们每天练习新动作。'],
  greenhouse: ['We grow vegetables in the greenhouse.', '我们在温室里种蔬菜。'],
  suitable: ['This club is suitable for me.', '这个社团适合我。'],
  actually: ['Actually, I agree with you.', '事实上，我同意你。'],
  challenge: ['Senior high school is a big challenge.', '高中是一个巨大的挑战。'],
  title: ['What is the title of the text?', '这篇课文的标题是什么？'],
  topic: ['We talked about an interesting topic in class.', '我们在课上谈论了一个有趣的话题。'],
  freshman: ['He is a freshman at senior high school.', '他是高中一年级新生。'],
  confusing: ['The first week was a little confusing.', '第一周有点令人困惑。'],
  confuse: ["Don't confuse these two words.", '不要把这两个词弄混。'],
  confused: ['I felt confused on my first day.', '第一天我感到困惑。'],
  fluent: ['I hope to be fluent in English.', '我希望英语说得流利。'],
  graduate: ['I will study hard until I graduate.', '我会努力学习直到毕业。'],
  recommend: ['My teacher recommended a good book to me.', '老师给我推荐了一本好书。'],
  advanced: ['She signed up for an advanced English course.', '她报名了一门高级英语课程。'],
  advance: ['Science makes new advances every year.', '科学每年都有新的发展。'],
  literature: ['I really enjoy English literature.', '我很喜欢英语文学。'],
  'extra-curricular': ['He takes part in many extra-curricular activities.', '他参加许多课外活动。'],
  extra: ['The teacher gave us some extra homework.', '老师给我们布置了一些额外的作业。'],
  obviously: ['He was obviously very happy about the news.', '他显然对这个消息很高兴。'],
  quit: ["Don't quit when things get difficult.", '困难的时候不要放弃。'],
  responsible: ['You should be responsible for your own studies.', '你应该对自己的学业负责。'],
  responsibility: ['Looking after a pet is a big responsibility.', '照顾宠物是一项重大的责任。'],
  solution: ['We finally found a good solution to the problem.', '我们最终找到了解决问题的好办法。'],
  schedule: ['I made a study schedule for this week.', '我为这周制定了一份学习计划。'],
  editor: ['She wants to be a magazine editor one day.', '她希望有一天成为杂志编辑。'],
  adventure: ['The summer trip was a great adventure.', '那次暑期旅行是一场了不起的冒险。'],
  youth: ['Music was very important to him in his youth.', '音乐在他青年时期对他很重要。'],
  survival: ['They learned survival skills at the camp.', '他们在营地学习生存技能。'],
  expert: ['My uncle is a computer expert.', '我叔叔是电脑专家。'],
  behaviour: ['Good behaviour is important at school.', '良好的行为在学校很重要。'],
  generation: ['The younger generation loves the Internet.', '年轻一代喜欢互联网。'],
  attract: ['The new club attracted many students.', '新社团吸引了许多学生。'],
  focus: ['You should focus on your studies.', '你应该专注于学业。'],
  addicted: ['Some teenagers are addicted to computer games.', '一些青少年沉迷于电脑游戏。'],
  addict: ['He used to be a computer game addict.', '他曾经是个电脑游戏迷。'],
  adult: ['Every adult was once a child.', '每个成年人都曾是孩子。'],
};
const v = JSON.parse(readFileSync(F, 'utf8'));
let miss = 0;
for (const w of v.words) {
  const e = EX[w.word];
  if (!e) { console.log('⚠️ 缺例句:', w.word); miss++; continue; }
  w.example_en = e[0];
  w.example_cn = e[1];
}
writeFileSync(F, JSON.stringify(v, null, 2));
console.log('已补例句:', v.words.length - miss, '/', v.words.length, '| 缺:', miss);
