// 填充八上 U2–U8 内容(subagent 授权,真词表+语块,答案打散)。
// 用法: node scripts/gen-g8a-u2to8-content.mjs
import fs from "node:fs";
const PATH = "src/data/juniorHub/grade8.json";
const root = JSON.parse(fs.readFileSync(PATH, "utf8"));
const byId = Object.fromEntries(root.grade8.semesters.grade8_volume1.units.map((u) => [u.id, u]));

const C = {
  g8v1_u2: {
    vocabulary: [
      { en: "bedroom", cn: "卧室", chunks: [{ en: "a tidy bedroom", cn: "整洁的卧室" }, { en: "clean my bedroom", cn: "打扫我的卧室" }, { en: "share a bedroom", cn: "合住一间卧室" }] },
      { en: "living room", cn: "客厅", chunks: [{ en: "sit in the living room", cn: "坐在客厅里" }, { en: "a cosy living room", cn: "舒适的客厅" }, { en: "decorate the living room", cn: "装饰客厅" }] },
      { en: "balcony", cn: "阳台", chunks: [{ en: "on the balcony", cn: "在阳台上" }, { en: "a small balcony", cn: "一个小阳台" }, { en: "water plants on the balcony", cn: "在阳台上浇花" }] },
      { en: "apartment", cn: "公寓套房", chunks: [{ en: "a new apartment", cn: "一套新公寓" }, { en: "move into the apartment", cn: "搬进公寓" }, { en: "live in an apartment", cn: "住在公寓里" }] },
      { en: "pack", cn: "打包；收拾", chunks: [{ en: "pack a bag", cn: "收拾一个包" }, { en: "pack up the boxes", cn: "把箱子打包" }, { en: "pack my clothes", cn: "收拾我的衣服" }] },
      { en: "sort", cn: "把……分类；整理", chunks: [{ en: "sort the books", cn: "整理书籍" }, { en: "sort out the room", cn: "整理房间" }, { en: "sort old toys", cn: "分类旧玩具" }] },
      { en: "invite", cn: "邀请", chunks: [{ en: "invite friends home", cn: "邀请朋友回家" }, { en: "invite her to dinner", cn: "邀请她吃晚饭" }, { en: "invite the neighbours", cn: "邀请邻居" }] },
      { en: "borrow", cn: "借", chunks: [{ en: "borrow a book", cn: "借一本书" }, { en: "borrow money", cn: "借钱" }, { en: "borrow it from him", cn: "向他借" }] },
      { en: "decorate", cn: "装饰；装潢", chunks: [{ en: "decorate the wall", cn: "装饰墙面" }, { en: "decorate with posters", cn: "用海报装饰" }, { en: "decorate the house", cn: "装饰房子" }] },
      { en: "poster", cn: "海报", chunks: [{ en: "put up a poster", cn: "贴一张海报" }, { en: "a colourful poster", cn: "一张彩色海报" }, { en: "a movie poster", cn: "一张电影海报" }] },
      { en: "add", cn: "添加；加", chunks: [{ en: "add some colour", cn: "加点颜色" }, { en: "add sugar to tea", cn: "往茶里加糖" }, { en: "add a few photos", cn: "加几张照片" }] },
      { en: "plate", cn: "盘子；碟子", chunks: [{ en: "a clean plate", cn: "一个干净的盘子" }, { en: "wash the plates", cn: "洗盘子" }, { en: "a plate of biscuits", cn: "一盘饼干" }] },
    ],
    reading: { passage: "My family just moved into a new apartment, and we are making it our home. \"Could you help me pack these books?\" Mum asked me on the first morning. I sorted them and put them on the shelf. \"Can I decorate my bedroom?\" I asked. \"Of course you can,\" she said with a smile. I put up a big poster and added some photos to the wall. My little sister wanted to help too. \"Could I water the plants on the balcony?\" she asked. Mum nodded. In the evening, we invited our new neighbours to dinner. \"Can I borrow some plates?\" Mum asked them kindly. Soon our living room was full of warm voices. Home is not just a place. Home is the people we love.", passageCn: "我们一家刚刚搬进一套新公寓，正在把它变成我们的家。第一天早上，妈妈问我：“你能帮我把这些书打包吗？”我把书整理好放到书架上。我问：“我可以装饰我的卧室吗？”她笑着说：“当然可以。”我贴了一张大海报，又往墙上加了一些照片。我的小妹妹也想帮忙。她问：“我可以给阳台上的植物浇水吗？”妈妈点了点头。傍晚，我们邀请了新邻居来吃晚饭。妈妈客气地问他们：“我可以借几个盘子吗？”很快，我们的客厅里就充满了温暖的话语。家不只是一个地方，家是我们所爱的人。", questions: [{ q: "Why did the family move?", opts: ["They moved into a new apartment.", "They went on a holiday.", "They visited their grandparents.", "They sold their old books."], answer: 0, point: "细节理解", dim: "reading" }, { q: "What did the writer do to decorate the bedroom?", opts: ["Washed the plates.", "Put up a poster and added photos.", "Watered the plants.", "Cooked dinner."], answer: 1, point: "细节理解", dim: "reading" }, { q: "What does the writer mainly want to say at the end?", opts: ["A new apartment is expensive.", "Decorating a room is hard work.", "Home is about the people we love.", "Neighbours should share plates."], answer: 2, point: "推理判断", dim: "reading" }] },
    grammarQuiz: [{ q: "\"___ you pass me the glue, please?\" — Sure, here you are.", opts: ["Must", "Could", "Should", "Need"], answer: 1, point: "Could 礼貌请求", dim: "grammar" }, { q: "\"Can I borrow your scissors?\" — \"Yes, ___.\"", opts: ["you can", "you must", "you need", "you should"], answer: 0, point: "Can 许可应答", dim: "grammar" }, { q: "\"Could I ___ a poster on the wall?\" Mum said it was fine.", opts: ["putting", "to put", "put", "puts"], answer: 2, point: "情态动词后接动词原形", dim: "grammar" }, { q: "Choose the most polite way to ask a stranger for help.", opts: ["Give me a hand!", "Could you help me, please?", "You help me now.", "Help me!"], answer: 1, point: "Could 比 Can 更礼貌", dim: "grammar" }, { q: "\"Can I water the plants?\" — \"No, you ___. They were watered already.\"", opts: ["can't", "must", "need", "do"], answer: 0, point: "Can 否定许可", dim: "grammar" }],
    listeningQuestions: [{ audio: "Could you help me pack up these boxes, please?", opts: ["He is asking for help to pack boxes.", "He is buying new boxes.", "He is throwing the boxes away.", "He is counting the boxes."], answer: 0 }, { audio: "Can I decorate my bedroom with these posters?", opts: ["She wants to sell the posters.", "She is asking permission to decorate her bedroom.", "She is cleaning the posters.", "She is reading the posters."], answer: 1 }, { audio: "We invited our new neighbours to dinner last night.", opts: ["The neighbours moved away.", "They cooked dinner alone.", "They asked the neighbours to come for dinner.", "The dinner was cancelled."], answer: 2 }, { audio: "Could I borrow a few plates for the party?", opts: ["He is washing the plates.", "He is buying plates.", "He is breaking the plates.", "He is asking to borrow some plates."], answer: 3 }, { audio: "Can you put the books on the balcony, please?", opts: ["He wants the books put on the balcony.", "He is reading on the balcony.", "He is painting the balcony.", "He is sleeping on the balcony."], answer: 0 }, { audio: "Could you add some flowers to the living room?", opts: ["The living room is too small.", "She wants flowers added to the living room.", "She is moving out of the living room.", "She is cleaning the floor."], answer: 1 }],
    quizQuestions: [{ q: "「balcony」的意思是？", opts: ["卧室", "阳台", "客厅", "公寓"], answer: 1, point: "词汇", dim: "vocab" }, { q: "「invite」的意思是？", opts: ["邀请", "整理", "借", "打包"], answer: 0, point: "词汇", dim: "vocab" }, { q: "\"___ I use your glue for a minute?\" — Of course.", opts: ["Could", "Will", "Shall", "Would"], answer: 0, point: "Could 礼貌请求", dim: "grammar" }, { q: "「decorate」的意思是？", opts: ["借", "分类", "装饰", "添加"], answer: 2, point: "词汇", dim: "vocab" }, { q: "「borrow」的意思是？", opts: ["邀请", "装饰", "打包", "借"], answer: 3, point: "词汇", dim: "vocab" }, { q: "\"Can you ___ me a hand with the cleaning?\"", opts: ["give", "gives", "giving", "to give"], answer: 0, point: "情态动词后接动词原形", dim: "grammar" }, { q: "「sort」的意思是？", opts: ["公寓", "盘子", "把……分类", "海报"], answer: 2, point: "词汇", dim: "vocab" }, { q: "\"Could I ___ the plants?\" — Yes, please do.", opts: ["watered", "to water", "watering", "water"], answer: 3, point: "情态动词后接动词原形", dim: "grammar" }],
    writing: { topic: "Home Sweet Home", prompt: "Write about how you help at home and how you make your home nice. Use Can/Could to ask for permission or help politely.", promptCn: "写一写你在家里如何帮忙以及如何把家布置得温馨。请用 Can/Could 来礼貌地请求帮助或许可。", opener: "My home is a sweet place, and I always try to help.", sampleWords: ["bedroom", "living room", "balcony", "decorate", "poster", "invite", "borrow", "pack"], cards: [{ key: "help", labelCn: "你做的家务", hint: "如 pack up books, sort old toys" }, { key: "decorate", labelCn: "你怎样布置房间", hint: "如 put up a poster, add some photos" }, { key: "ask", labelCn: "礼貌请求帮助", hint: "如 Could you help me...?" }], templates: { l1: ["I often {help} at home.", "I like my {decorate}.", "\"Could you help me?\" I ask.", "My home is sweet."], l2: ["After school, I usually {help} to make my home tidy.", "I love to {decorate} my room to make it nice.", "I always say, \"{ask}\" when I need help.", "I feel happy and warm at home."], l3: ["When I get home, I {help} so that everyone can relax in a clean house.", "To make my bedroom cosy, I {decorate} it with the things I love.", "I ask politely, \"{ask}\", because good manners matter at home.", "For me, home is not just a place but the people I love."] }, connectors: ["first", "then", "after that", "finally", "because", "so"], minWords: 40 },
  },
};

// U3..U8 内容从同目录 JSON 文件读取(由后续 Write 落盘),避免单脚本过长
for (const n of [3, 4, 5, 6, 7, 8]) {
  const f = `scripts/_g8a_u${n}.json`;
  if (fs.existsSync(f)) C[`g8v1_u${n}`] = JSON.parse(fs.readFileSync(f, "utf8"));
}

let done = [];
for (const [id, c] of Object.entries(C)) {
  const u = byId[id];
  if (!u) continue;
  u.vocabulary = c.vocabulary;
  u.reading = c.reading;
  u.grammarQuiz = c.grammarQuiz;
  u.listeningQuestions = c.listeningQuestions;
  u.quizQuestions = c.quizQuestions;
  u.writing = c.writing;
  u.available = true;
  u.contentStatus = "TODO_待真题填充";
  done.push(`${id}(v${u.vocabulary.length}/r${u.reading.questions.length}/g${u.grammarQuiz.length}/l${u.listeningQuestions.length}/q${u.quizQuestions.length})`);
}
fs.writeFileSync(PATH, JSON.stringify(root, null, 2).replace(/\n/g, "\r\n"), "utf8");
console.log("填充:", done.join("  "));
