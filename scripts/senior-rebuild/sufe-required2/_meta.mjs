// 上外版(sufe)必修二 单元元数据。结构以上外课本为准:4 单元,每单元 Reading A+B / Vocab Focus / Grammar in Use。
// publisher='sufe';grammar code 前缀 s2(sufe必修二)防 sufe 内部跨册撞码((publisher,code) 唯一,已与人教隔离)。
export const VOL = 'required2', GRADE = 10;
export const PUBLISHER = 'sufe';
export const CODE_PREFIX = 's2';
export const BOOK_CN = '上外版必修第二册';
export const META = {
  u1: {
    unit: 'U1', title: 'Nature', cn: '自然', emoji: '🌿',
    theme: 'Nature', topic_cn: 'Nature',
    grammarTitle: '定语从句1(who/whom/that/which/whose)',
    grammarCodes: ['u1.01', 'u1.02', 'u1.03'],
  },
  u2: {
    unit: 'U2', title: 'Animals', cn: '动物', emoji: '🐾',
    theme: 'Animals', topic_cn: 'Animals',
    grammarTitle: '定语从句2(when/where/why · 介词+which)',
    grammarCodes: ['u2.01', 'u2.02', 'u2.03'],
  },
  u3: {
    unit: 'U3', title: 'Food', cn: '食物', emoji: '🍽️',
    theme: 'Food', topic_cn: 'Food',
    grammarTitle: '-ing/-ed 形式1(作定语 attributives)',
    grammarCodes: ['u3.01', 'u3.02', 'u3.03'],
  },
  u4: {
    unit: 'U4', title: 'Sports', cn: '运动', emoji: '⚽',
    theme: 'Sports', topic_cn: 'Sports',
    grammarTitle: '-ing/-ed 形式2(作状语 adverbials)',
    grammarCodes: ['u4.01', 'u4.02', 'u4.03'],
  },
};
