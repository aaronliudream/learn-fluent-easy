// 上外版(sufe)必修一 单元元数据。结构以上外课本为准:4 单元,每单元 Reading A+B / Vocab Focus / Grammar in Use。
// publisher='sufe';grammar code 前缀 s1(sufe必修一)防 sufe 内部跨册撞码((publisher,code) 唯一,已与人教隔离)。
export const VOL = 'required1', GRADE = 10;
export const PUBLISHER = 'sufe';
export const CODE_PREFIX = 's1';
export const BOOK_CN = '上外版必修第一册';
export const META = {
  u1: {
    unit: 'U1', title: 'School Life', cn: '学校生活', emoji: '🏫',
    theme: 'School Life', topic_cn: 'School Life',
    grammarTitle: '时态(复习 + 过去将来时)',
    grammarCodes: ['u1.01', 'u1.02', 'u1.03'],
  },
  u2: {
    unit: 'U2', title: 'Language and Culture', cn: '语言与文化', emoji: '🗣️',
    theme: 'Language and Culture', topic_cn: 'Language and Culture',
    grammarTitle: '基本句型(Basic Sentence Patterns)',
    grammarCodes: ['u2.01', 'u2.02', 'u2.03'],
  },
  u3: {
    unit: 'U3', title: 'Travel', cn: '旅行', emoji: '✈️',
    theme: 'Travel', topic_cn: 'Travel',
    grammarTitle: '状语从句复习(Adverbial Clauses)',
    grammarCodes: ['u3.01', 'u3.02', 'u3.03'],
  },
  u4: {
    unit: 'U4', title: 'Customs and Traditions', cn: '习俗与传统', emoji: '🎎',
    theme: 'Customs and Traditions', topic_cn: 'Customs and Traditions',
    grammarTitle: '被动语态复习(+ 现在进行被动 + 现在完成被动)',
    grammarCodes: ['u4.01', 'u4.02', 'u4.03'],
  },
};
