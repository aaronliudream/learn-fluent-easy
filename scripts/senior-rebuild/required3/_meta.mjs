// 必修三 单元元数据。db id 槽 u1..u5。语法 code 加 r3 前缀防跨册撞全局唯一约束。
export const VOL = 'required3', GRADE = 10;
export const CODE_PREFIX = 'r3';
export const SEM = 'gk_required3';
// hub 骨架所在的 year 文件。required3=junior grade10=year1(与 required1/2 同册同 grade,语法板块 VOL_GRADE[required3]=10→year1 才找得到单元 id)。
export const YEARFILE = 'year1';
export const META = {
  u1: {
    unit: 'U1', semIdx: 0, title: 'Festivals and Celebrations', cn: '节日与庆典', emoji: '🎉',
    theme: 'Festivals and Celebrations', topic_cn: 'Festivals and Celebrations',
    grammarTitle: '现在分词(V-ing)作表语和定语',
    grammarCodes: ['u1.01', 'u1.02', 'u1.03'],
  },
  u2: {
    unit: 'U2', semIdx: 1, title: 'Morals and Virtues', cn: '道德与美德', emoji: '🕊️',
    theme: 'Morals and Virtues', topic_cn: 'Morals and Virtues',
    grammarTitle: '现在分词(V-ing)作状语',
    grammarCodes: ['u2.01', 'u2.02', 'u2.03'],
  },
  u3: {
    unit: 'U3', semIdx: 2, title: 'Diverse Cultures', cn: '多元文化', emoji: '🌏',
    theme: 'Diverse Cultures', topic_cn: 'Diverse Cultures',
    grammarTitle: '省略(Ellipsis)',
    grammarCodes: ['u3.01', 'u3.02', 'u3.03'],
  },
  u4: {
    unit: 'U4', semIdx: 3, title: 'Space Exploration', cn: '太空探索', emoji: '🚀',
    theme: 'Space Exploration', topic_cn: 'Space Exploration',
    grammarTitle: '不定式(to do)作目的状语/后置定语(in order to · so as to)',
    grammarCodes: ['u4.01', 'u4.02', 'u4.03'],
  },
  u5: {
    unit: 'U5', semIdx: 4, title: 'The Value of Money', cn: '金钱的价值', emoji: '💰',
    theme: 'The Value of Money', topic_cn: 'The Value of Money',
    grammarTitle: '情态动词(modal verbs)+ would 表过去将来',
    grammarCodes: ['u5.01', 'u5.02', 'u5.03'],
  },
};
