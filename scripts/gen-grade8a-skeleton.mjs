// 八上(8A)骨架重建:旧版10单元 → 2024新版8单元(空骨架, available:false)
// schema 对齐【七年级 grade7.json】新版结构:含 bigQuestion / pronunciation /
// contentStatus,vocab 用 {en,cn,chunks[3]},writing 用四屏富对象。
// 八下(volume2)一行不动。用法: node scripts/gen-grade8a-skeleton.mjs
import fs from "node:fs";

const PATH = "src/data/juniorHub/grade8.json";
const raw = fs.readFileSync(PATH, "utf8");
const root = JSON.parse(raw);

// 新版八上 8 单元元数据(title/cn/bigQuestion/pronunciation/grammarTitle 取自 docs/grade8-2024-structure.md)
const UNITS = [
  { num: 1, title: "Happy Holiday",              cn: "快乐假期",       emoji: "🏖️", bq: "What makes a great holiday?",        pron: "/iː/ /ɪ/ /i/ /e/ /æ/;节奏 rhythm",            grammar: "不定代词与一般过去时" },
  { num: 2, title: "Home Sweet Home",            cn: "温馨的家",       emoji: "🏠", bq: "What does home mean to you?",        pron: "/ɔː/ /ɒ/ /uː/ /ʊ/ /ɑː/ /ʌ/;意群停顿",         grammar: "Can/Could 礼貌请求与许可" },
  { num: 3, title: "Same or Different?",         cn: "相同还是不同",   emoji: "🆚", bq: "How do we compare with each other?", pron: "/ɜː/ /ə/;语调",                              grammar: "形容词比较级" },
  { num: 4, title: "Amazing Plants and Animals", cn: "神奇的动植物",   emoji: "🌱", bq: "What makes plants and animals amazing?", pron: "双元音 + 辅音连缀;句子重音",                grammar: "形容词最高级" },
  { num: 5, title: "What a Delicious Meal!",      cn: "多么美味的一餐", emoji: "🍽️", bq: "Why do we learn to cook?",           pron: "/əʊ/ /aʊ/ /ɪə/ /eə/ /ʊə/ + 连缀;语调停顿",   grammar: "感叹句与可数/不可数名词" },
  { num: 6, title: "When Tomorrow Comes",        cn: "当明天来临",     emoji: "🔮", bq: "What will the future look like?",    pron: "/h/ /w/ /θ/ /ð/ /k/ /kw/ /ʃ/ /ʒ/;弱读",      grammar: "be going to 与不定式作宾语" },
  { num: 7, title: "Plan for Yourself",          cn: "为自己制订计划", emoji: "📅", bq: "Why do we need plans?",              pron: "/n/ /ŋ/ /tʃ/ /dʒ/ /f/ /r/;语调",             grammar: "一般将来时 will" },
  { num: 8, title: "Let's Communicate!",         cn: "让我们沟通",     emoji: "💬", bq: "What makes good communication?",     pron: "辅音连缀收尾;发音复习",                       grammar: "零条件句与第一条件句" },
];

// 8 关固定模板;grammar 关 subtitle 用本单元语法名
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

// 字段顺序严格对齐七年级 unit
const buildUnit = (m) => ({
  id: `g8v1_u${m.num}`,
  num: m.num,
  unitKey: `U${m.num}`,
  book: "8A",
  title: m.title,
  cn: m.cn,
  emoji: m.emoji,
  available: false,                       // 骨架阶段锁住,逐单元填充后再开
  bigQuestion: m.bq,
  pronunciation: m.pron,
  contentStatus: "TODO_待真题填充",
  vocabulary: [],                         // {en, cn, chunks:[{en,cn}×3]}
  dialogues: [],
  stages: stages(m.grammar),
  grammarTitle: m.grammar,
  grammarCode: `g8a-u${m.num}-TODO`,      // 占位,见"需新建/重挂语法点清单"
  grammarQuiz: [],                        // {q, opts, answer, point, dim:"grammar"}
  reading: { passage: "", passageCn: "", questions: [] }, // questions: {q,opts,answer,point,dim:"reading"}
  writing: {                              // 四屏写作富对象(对齐七年级)
    topic: "",
    prompt: "",
    promptCn: "",
    opener: "",
    sampleWords: [],
    cards: [],                            // {key, labelCn, hint}
    templates: { l1: [], l2: [], l3: [] },
    connectors: [],
    minWords: 0,
  },
  quizQuestions: [],                      // {q, opts, answer, point, dim}
  listeningQuestions: [],                 // {audio, opts, answer}
});

const before = root.grade8.semesters.grade8_volume1.units.length;
root.grade8.semesters.grade8_volume1.units = UNITS.map(buildUnit);
const after = root.grade8.semesters.grade8_volume1.units.length;

const out = JSON.stringify(root, null, 2).replace(/\n/g, "\r\n");
fs.writeFileSync(PATH, out, "utf8");
console.log(`八上单元: ${before} → ${after}(grade7 schema 空骨架, available:false, contentStatus=TODO)`);
console.log("八下(volume2)未触碰。");
