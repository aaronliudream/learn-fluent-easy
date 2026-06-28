// 选择性必修二 单元元数据。db id 槽 u1..u5。语法 code 加 e2 前缀防跨册撞全局唯一约束。
// hub 骨架在 year3.json 的 gk_elective2。
export const VOL = 'elective2', GRADE = 11;  // elective2=junior grade11(year2)
export const CODE_PREFIX = 'e2';
export const SEM = 'gk_elective2';
// elective2=junior grade11=year2(语法板块 VOL_GRADE[elective2]=11→year2)。与 elective1 同放 year2。
export const YEARFILE = 'year2';
export const META = {
  u1: {
    unit: 'U1', semIdx: 0, title: 'Science and Scientists', cn: '科学与科学家', emoji: '🔬',
    theme: 'Science and Scientists', topic_cn: 'Science and Scientists',
    grammarTitle: '表语从句(Predicative Clauses)',
    grammarCodes: ['u1.01', 'u1.02', 'u1.03'],
  },
  u2: {
    unit: 'U2', semIdx: 1, title: 'Bridging Cultures', cn: '沟通文化', emoji: '🌉',
    theme: 'Bridging Cultures', topic_cn: 'Bridging Cultures',
    grammarTitle: '名词性从句复习(主语/宾语/表语/同位语从句)',
    grammarCodes: ['u2.01', 'u2.02', 'u2.03'],
  },
  u3: {
    unit: 'U3', semIdx: 2, title: 'Food and Culture', cn: '食物与文化', emoji: '🍲',
    theme: 'Food and Culture', topic_cn: 'Food and Culture',
    grammarTitle: '-ing 形式复习(动名词与现在分词)',
    grammarCodes: ['u3.01', 'u3.02', 'u3.03'],
  },
  u4: {
    unit: 'U4', semIdx: 3, title: 'Journey Across a Vast Land', cn: '穿越辽阔大地', emoji: '🚆',
    theme: 'Journey Across a Vast Land', topic_cn: 'Journey Across a Vast Land',
    grammarTitle: '过去分词与 -ing 形式的对比(done vs doing)',
    grammarCodes: ['u4.01', 'u4.02', 'u4.03'],
  },
  u5: {
    unit: 'U5', semIdx: 4, title: 'First Aid', cn: '急救', emoji: '🩹',
    theme: 'First Aid', topic_cn: 'First Aid',
    grammarTitle: '过去完成时及其被动语态(had done / had been done)',
    grammarCodes: ['u5.01', 'u5.02', 'u5.03'],
  },
};
