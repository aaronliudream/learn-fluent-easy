// 八下(8B)骨架重建:旧版10单元 → 2024新版8单元(空骨架, available:false, grade7 schema)
// 八上(volume1)一行不动。用法: node scripts/gen-grade8b-skeleton.mjs
import fs from "node:fs";
const PATH = "src/data/juniorHub/grade8.json";
const root = JSON.parse(fs.readFileSync(PATH, "utf8"));

const UNITS = [
  { num: 1, title: "Time to Relax",          cn: "放松时光",   emoji: "🎈", bq: "Why are free-time activities important?",            grammar: "不定式作状语与宾补" },
  { num: 2, title: "Stay Healthy",           cn: "保持健康",   emoji: "💪", bq: "How do we take care of ourselves?",                  grammar: "情态动词 should/could 建议;反身代词" },
  { num: 3, title: "Growing Up",             cn: "成长",       emoji: "🌟", bq: "How do we deal with our emotions?",                  grammar: "连词 although / until / so that" },
  { num: 4, title: "The Wonders of Nature",  cn: "自然奇观",   emoji: "🏔️", bq: "How do we connect with nature?",                    grammar: "比较级/最高级复习;大数字" },
  { num: 5, title: "Nature's Temper",        cn: "大自然的脾气", emoji: "🌪️", bq: "How do natural disasters affect our lives?",        grammar: "过去进行时" },
  { num: 6, title: "A Good Read",            cn: "好书共读",   emoji: "📚", bq: "Why should we read great books?",                    grammar: "连词 so…that / unless / as soon as" },
  { num: 7, title: "Crossing Cultures",      cn: "跨越文化",   emoji: "🌍", bq: "How do we communicate with people from different cultures?", grammar: "现在完成时(already/yet/never/ever/just)" },
  { num: 8, title: "Making a Difference",    cn: "做出改变",   emoji: "🤝", bq: "Why should we help others?",                         grammar: "现在完成时(since/for)" },
];

const stages = (grammar) => [
  { id: "s1", title: "核心词汇", subtitle: "教材核心词",   icon: "📚", type: "vocab",      time: "8分钟" },
  { id: "s2", title: "听音辨词", subtitle: "听力辨词",     icon: "🎧", type: "listenWord", time: "6分钟" },
  { id: "s3", title: "词义配对", subtitle: "巩固记忆",     icon: "🎮", type: "match",      time: "5分钟" },
  { id: "s4", title: "语法专项", subtitle: grammar,        icon: "🧩", type: "grammar",    time: "12分钟" },
  { id: "s5", title: "课文阅读", subtitle: "阅读理解",     icon: "📖", type: "reading",    time: "8分钟" },
  { id: "s6", title: "听力短文", subtitle: "听音答题",     icon: "👂", type: "listening",  time: "8分钟" },
  { id: "s7", title: "写作练习", subtitle: "本单元句型",   icon: "✍️", type: "writing",    time: "10分钟" },
  { id: "s8", title: "单元通关", subtitle: "综合检测",     icon: "🏆", type: "finalQuiz",  time: "12分钟" },
];

const buildUnit = (m) => ({
  id: `g8v2_u${m.num}`, num: m.num, unitKey: `U${m.num}`, book: "8B",
  title: m.title, cn: m.cn, emoji: m.emoji, available: false,
  bigQuestion: m.bq, pronunciation: "语音语调专项", contentStatus: "TODO_待真题填充",
  vocabulary: [], dialogues: [], stages: stages(m.grammar),
  grammarTitle: m.grammar, grammarCode: `g8b-u${m.num}-TODO`, grammarQuiz: [],
  reading: { passage: "", passageCn: "", questions: [] },
  writing: { topic: "", prompt: "", promptCn: "", opener: "", sampleWords: [], cards: [], templates: { l1: [], l2: [], l3: [] }, connectors: [], minWords: 0 },
  quizQuestions: [], listeningQuestions: [],
});

const before = root.grade8.semesters.grade8_volume2.units.length;
root.grade8.semesters.grade8_volume2.units = UNITS.map(buildUnit);
fs.writeFileSync(PATH, JSON.stringify(root, null, 2).replace(/\n/g, "\r\n"), "utf8");
console.log(`八下单元: ${before} → ${root.grade8.semesters.grade8_volume2.units.length}(grade7 schema 空骨架, available:false)`);
console.log("八上(volume1)未触碰。");
