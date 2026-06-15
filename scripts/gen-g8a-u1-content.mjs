// 填充八上 U1 "Happy Holiday" 完整内容(对齐七年级 schema)
// 词汇取自 2024版八上教材 Unit 1 词表(真实);阅读/语法/听力/写作为授权内容,
// 与七年级 TODO 单元同质。用法: node scripts/gen-g8a-u1-content.mjs
import fs from "node:fs";
const PATH = "src/data/juniorHub/grade8.json";
const root = JSON.parse(fs.readFileSync(PATH, "utf8"));
const u = root.grade8.semesters.grade8_volume1.units.find((x) => x.id === "g8v1_u1");
if (!u) throw new Error("g8v1_u1 not found");

u.vocabulary = [
  { en: "vacation", cn: "假期；度假", chunks: [{ en: "summer vacation", cn: "暑假" }, { en: "go on vacation", cn: "去度假" }, { en: "a long vacation", cn: "漫长的假期" }] },
  { en: "ancient", cn: "古代的；古老的", chunks: [{ en: "an ancient town", cn: "一座古镇" }, { en: "ancient China", cn: "古代中国" }, { en: "an ancient building", cn: "古建筑" }] },
  { en: "landscape", cn: "风景；景色", chunks: [{ en: "a beautiful landscape", cn: "美丽的风景" }, { en: "the mountain landscape", cn: "山间景色" }, { en: "enjoy the landscape", cn: "欣赏风景" }] },
  { en: "fantastic", cn: "极好的；吸引人的", chunks: [{ en: "a fantastic holiday", cn: "极好的假期" }, { en: "look fantastic", cn: "看起来很棒" }, { en: "fantastic news", cn: "好消息" }] },
  { en: "especially", cn: "尤其；特别", chunks: [{ en: "especially in summer", cn: "尤其在夏天" }, { en: "especially the food", cn: "尤其是食物" }, { en: "like it especially", cn: "特别喜欢它" }] },
  { en: "guide", cn: "导游；指南", chunks: [{ en: "a tour guide", cn: "一位导游" }, { en: "a travel guide", cn: "旅行指南" }, { en: "guide the way", cn: "带路" }] },
  { en: "comfortable", cn: "舒适的", chunks: [{ en: "a comfortable bed", cn: "舒适的床" }, { en: "feel comfortable", cn: "感觉舒适" }, { en: "a comfortable hotel", cn: "舒适的旅馆" }] },
  { en: "bored", cn: "厌倦的；烦闷的", chunks: [{ en: "feel bored", cn: "感到厌倦" }, { en: "get bored", cn: "变得无聊" }, { en: "bored at home", cn: "在家无聊" }] },
  { en: "remind", cn: "提醒；使想起", chunks: [{ en: "remind me of", cn: "使我想起" }, { en: "remind sb to do", cn: "提醒某人做某事" }, { en: "remind you", cn: "提醒你" }] },
  { en: "anywhere", cn: "在任何地方", chunks: [{ en: "go anywhere", cn: "去任何地方" }, { en: "anywhere special", cn: "任何特别的地方" }, { en: "not anywhere", cn: "哪儿都不" }] },
  { en: "nothing", cn: "没有任何东西", chunks: [{ en: "nothing special", cn: "没什么特别的" }, { en: "nothing but", cn: "只有；只是" }, { en: "say nothing", cn: "什么也不说" }] },
  { en: "somewhere", cn: "在某处；到某处", chunks: [{ en: "go somewhere", cn: "去某个地方" }, { en: "somewhere quiet", cn: "某个安静的地方" }, { en: "somewhere near", cn: "附近某处" }] },
];

u.reading = {
  passage:
    "Last summer, I had a fantastic vacation with my family. We went to an ancient town in the south of China. The landscape there was beautiful, with green mountains and a quiet river. We didn't go anywhere by car; we just walked everywhere. A friendly guide showed us around and told us many old stories. We stayed in a comfortable little hotel near the river. The food was great, especially the steamed fish. I never felt bored — every day brought something new. On the last evening, I took lots of photos to remind me of this special trip. It was the best holiday I have ever had!",
  passageCn:
    "去年夏天，我和家人度过了一个极好的假期。我们去了中国南方的一座古镇。那里风景优美，有青山和一条静静的河。我们没有坐车去任何地方，只是到处步行。一位友好的导游带我们参观，给我们讲了许多古老的故事。我们住在河边一家舒适的小旅馆里。食物很棒，尤其是清蒸鱼。我从未感到无聊——每天都有新鲜事。最后一晚，我拍了很多照片，好让自己记住这次特别的旅行。这是我度过的最好的假期！",
  questions: [
    { q: "Where did the writer go on vacation?", opts: ["An ancient town in the south of China", "A big modern city", "A faraway island", "His grandparents' home"], answer: 0, point: "细节理解", dim: "reading" },
    { q: "How did they get around in the town?", opts: ["They walked everywhere", "By car", "By bus", "By boat"], answer: 0, point: "细节理解", dim: "reading" },
    { q: "Why did the writer take lots of photos?", opts: ["To remind himself of the special trip", "To sell them", "To send to the guide", "Because he was bored"], answer: 0, point: "推理判断", dim: "reading" },
  ],
};

u.grammarQuiz = [
  { q: "I didn't go ___ special during the holiday.", opts: ["anywhere", "somewhere", "everywhere", "nowhere"], answer: 0, point: "不定代词(否定句用 anywhere)", dim: "grammar" },
  { q: "We ___ to an ancient town last summer.", opts: ["went", "go", "goes", "going"], answer: 0, point: "一般过去时", dim: "grammar" },
  { q: "___ tasted good, especially the fish.", opts: ["Everything", "Anything", "Nothing", "Nowhere"], answer: 0, point: "不定代词 everything", dim: "grammar" },
  { q: "Did you meet ___ interesting on your trip?", opts: ["anyone", "someone", "no one", "everyone"], answer: 0, point: "不定代词(疑问句用 anyone)", dim: "grammar" },
  { q: "There was ___ to do, so we stayed in the hotel.", opts: ["nothing", "anything", "everything", "somewhere"], answer: 0, point: "不定代词 nothing", dim: "grammar" },
];

u.listeningQuestions = [
  { audio: "I went to Mount Huangshan with my family.", opts: ["He went to the mountains.", "He went to the beach.", "He stayed at home.", "He went to school."], answer: 0 },
  { audio: "The landscape there was amazing.", opts: ["The scenery was beautiful.", "The food was bad.", "It was raining all day.", "He felt bored."], answer: 0 },
  { audio: "I didn't go anywhere special this holiday.", opts: ["She stayed around home.", "She went abroad.", "She visited a palace.", "She climbed a mountain."], answer: 0 },
  { audio: "We stayed in a comfortable hotel for three days.", opts: ["They stayed in a nice hotel.", "They camped outside.", "They slept on a train.", "They stayed with friends."], answer: 0 },
  { audio: "A guide showed us around the old town.", opts: ["A guide led their tour.", "They got lost.", "They drove a car.", "They read a map."], answer: 0 },
  { audio: "I took many photos to remember the trip.", opts: ["She took lots of photos.", "She bought postcards.", "She wrote a long diary.", "She forgot her camera."], answer: 0 },
];

u.quizQuestions = [
  { q: "「vacation」的意思是？", opts: ["假期", "车站", "导游", "风景"], answer: 0, point: "词汇", dim: "vocab" },
  { q: "「ancient」的意思是？", opts: ["古老的", "舒适的", "厌倦的", "奇怪的"], answer: 0, point: "词汇", dim: "vocab" },
  { q: "「landscape」的意思是？", opts: ["风景", "旅馆", "彩虹", "广场"], answer: 0, point: "词汇", dim: "vocab" },
  { q: "选出过去式：We ___ to the mountains last week.", opts: ["went", "go", "goes", "gone"], answer: 0, point: "一般过去时", dim: "grammar" },
  { q: "I didn't see ___ on the empty street.", opts: ["anyone", "someone", "everyone", "no one"], answer: 0, point: "不定代词", dim: "grammar" },
  { q: "「remind」的意思是？", opts: ["提醒", "遗忘", "到达", "聚会"], answer: 0, point: "词汇", dim: "vocab" },
  { q: "___ special happened — it was a normal day.", opts: ["Nothing", "Anything", "Everywhere", "Someone"], answer: 0, point: "不定代词", dim: "grammar" },
  { q: "「comfortable」的意思是？", opts: ["舒适的", "乏味的", "古老的", "空闲的"], answer: 0, point: "词汇", dim: "vocab" },
];

u.writing = {
  topic: "My Summer Holiday",
  prompt: "Write about a holiday you had. Where did you go? What did you do? Use the simple past tense and indefinite pronouns (something, anywhere, nothing ...).",
  promptCn: "写一写你度过的一个假期。你去了哪里？做了什么？用一般过去时和不定代词（something / anywhere / nothing 等）。",
  opener: "Last summer, I had a great holiday.",
  sampleWords: ["vacation", "ancient", "landscape", "fantastic", "guide", "comfortable", "especially", "remind"],
  cards: [
    { key: "place", labelCn: "你去了哪里", hint: "如 an ancient town" },
    { key: "who", labelCn: "和谁一起", hint: "如 my family" },
    { key: "activity", labelCn: "做了什么", hint: "如 walked, took photos" },
  ],
  templates: {
    l1: ["Last summer, I went to {place}.", "I went there with {who}.", "We {activity}.", "It was a fantastic holiday!"],
    l2: ["Last summer, I had a fantastic vacation in {place}.", "I went there with {who}.", "The landscape was beautiful, and we {activity}.", "I didn't feel bored at all!"],
    l3: ["Last summer, I had one of the best holidays in {place}.", "I travelled there with {who}, and everything was new to me.", "We {activity}, and the food was great, especially the local dishes.", "I took many photos to remind me of this special trip."],
  },
  connectors: ["first", "then", "after that", "especially", "finally"],
  minWords: 40,
};

u.available = true;
u.contentStatus = "TODO_待真题填充";

fs.writeFileSync(PATH, JSON.stringify(root, null, 2).replace(/\n/g, "\r\n"), "utf8");
console.log(`U1 填充完成: vocab=${u.vocabulary.length} reading.q=${u.reading.questions.length} grammarQuiz=${u.grammarQuiz.length} listening=${u.listeningQuestions.length} quiz=${u.quizQuestions.length} available=${u.available}`);
