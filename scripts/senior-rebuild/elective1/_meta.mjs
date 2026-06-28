// 选择性必修一 单元元数据。db id 槽 u1..u5。语法 code 加 e1 前缀防跨册撞全局唯一约束。
// hub 骨架在 year2.json 的 gk_elective1(与 required3 同放 year2)。
export const VOL = 'elective1', GRADE = 10;
export const CODE_PREFIX = 'e1';
export const SEM = 'gk_elective1';
export const YEARFILE = 'year2';
export const META = {
  u1: {
    unit: 'U1', semIdx: 0, title: 'People of Achievement', cn: '杰出人物', emoji: '🏅',
    theme: 'People of Achievement', topic_cn: 'People of Achievement',
    grammarTitle: '非限制性定语从句',
    grammarCodes: ['u1.01', 'u1.02', 'u1.03'],
  },
  u2: {
    unit: 'U2', semIdx: 1, title: 'Looking into the Future', cn: '展望未来', emoji: '🔮',
    theme: 'Looking into the Future', topic_cn: 'Looking into the Future',
    grammarTitle: '将来进行时(will be doing)',
    grammarCodes: ['u2.01', 'u2.02', 'u2.03'],
  },
  u3: {
    unit: 'U3', semIdx: 2, title: 'Fascinating Parks', cn: '迷人的公园', emoji: '🏞️',
    theme: 'Fascinating Parks', topic_cn: 'Fascinating Parks',
    grammarTitle: '主语从句(Subject Clauses)',
    grammarCodes: ['u3.01', 'u3.02', 'u3.03'],
  },
  u4: {
    unit: 'U4', semIdx: 3, title: 'Body Language', cn: '肢体语言', emoji: '🙆',
    theme: 'Body Language', topic_cn: 'Body Language',
    grammarTitle: '动名词(-ing)作宾语和表语',
    grammarCodes: ['u4.01', 'u4.02', 'u4.03'],
  },
  u5: {
    unit: 'U5', semIdx: 4, title: 'Working the Land', cn: '耕耘土地', emoji: '🌾',
    theme: 'Working the Land', topic_cn: 'Working the Land',
    grammarTitle: '动名词(-ing)作主语',
    grammarCodes: ['u5.01', 'u5.02', 'u5.03'],
  },
};
