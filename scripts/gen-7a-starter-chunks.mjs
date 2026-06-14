// 7A Starter SU1-SU3 (g7v1_u1..u3) 词汇关：去 emoji + 加 language chunks（每词3条）
// 收尾七年级整本词汇关。基础字母/问候/课堂过渡单元。
import fs from "node:fs";

const FILE = "src/data/juniorHub/grade7.json";

const DATA = {
  g7v1_u1: {
    "unit": [["a new unit","一个新单元"],["Unit One","第一单元"],["in this unit","在本单元"]],
    "starter": [["the starter unit","起始单元"],["a good starter","一个好的开端"],["Starter One","起始单元一"]],
    "section": [["Section A","A部分"],["the first section","第一部分"],["this section","这一部分"]],
    "greet": [["greet each other","互相问候"],["greet a friend","跟朋友打招呼"],["greet people","问候大家"]],
    "each": [["each student","每个学生"],["each day","每天"],["each of us","我们每个人"]],
    "other": [["the other one","另一个"],["other people","别人"],["each other","互相"]],
    "each other": [["greet each other","互相问候"],["help each other","互相帮助"],["know each other","互相认识"]],
    "everyone": [["Hello, everyone!","大家好!"],["everyone here","这里的每个人"],["Everyone knows it.","人人都知道。"]],
    "start": [["start now","现在开始"],["start a conversation","开始交谈"],["Let's start.","我们开始吧。"]],
    "conversation": [["have a conversation","交谈"],["a short conversation","一段简短的对话"],["start a conversation","开始交谈"]],
    "spell": [["spell the word","拼写单词"],["How do you spell it?","它怎么拼?"],["spell your name","拼写你的名字"]],
    "bell": [["ring the bell","按铃"],["the school bell","上课铃"],["The bell rings.","铃响了。"]],
  },
  g7v1_u2: {
    "bottle": [["a bottle of water","一瓶水"],["an empty bottle","一个空瓶子"],["a water bottle","一个水瓶"]],
    "eraser": [["a new eraser","一块新橡皮"],["use an eraser","用橡皮"],["my eraser","我的橡皮"]],
    "key": [["a door key","一把门钥匙"],["the car key","车钥匙"],["lose the key","丢钥匙"]],
    "thing": [["a good thing","一件好事"],["my things","我的东西"],["the right thing","正确的事"]],
    "need": [["need help","需要帮助"],["need to go","需要走了"],["I need a pen.","我需要一支笔。"]],
    "You're welcome.": [["Thanks! — You're welcome.","谢谢!不客气。"],["You're welcome anytime.","随时欢迎。"],["say \"You're welcome\"","说\"不用谢\""]],
  },
  g7v1_u3: {
    "fun": [["have fun","玩得开心"],["great fun","很有趣"],["It's fun.","真有趣。"]],
    "yard": [["in the yard","在院子里"],["a big yard","一个大院子"],["play in the yard","在院子里玩"]],
    "carrot": [["a fresh carrot","一根新鲜胡萝卜"],["eat a carrot","吃胡萝卜"],["orange carrots","橙色的胡萝卜"]],
    "goose": [["a white goose","一只白鹅"],["a goose by the lake","湖边的鹅"],["feed the goose","喂鹅"]],
    "count": [["count to ten","数到十"],["count the books","数书"],["count again","再数一遍"]],
    "another": [["another one","另一个"],["have another","再来一个"],["another day","改天"]],
    "else": [["anything else","别的什么"],["someone else","别人"],["What else?","还有什么?"]],
    "circle": [["draw a circle","画一个圆"],["circle the answer","圈出答案"],["sit in a circle","围成一圈"]],
    "look at": [["look at me","看着我"],["look at the picture","看图"],["Look at this!","看这个!"]],
  },
};

const json = JSON.parse(fs.readFileSync(FILE, "utf8"));
const units = json.grade7.semesters.grade7_volume1.units;

let totalWords = 0;
const problems = [];
for (const [unitId, map] of Object.entries(DATA)) {
  const unit = units.find((u) => u.id === unitId);
  if (!unit) { problems.push(`unit not found: ${unitId}`); continue; }
  const keys = new Set(Object.keys(map));
  unit.vocabulary = unit.vocabulary.map((v) => {
    const raw = map[v.en];
    keys.delete(v.en);
    const { emoji, ...rest } = v; // 去 emoji
    if (!raw) { problems.push(`${unitId}: 缺 chunks → ${v.en}`); return rest; }
    return { ...rest, chunks: raw.map(([en, cn]) => ({ en, cn })) };
  });
  for (const leftover of keys) problems.push(`${unitId}: 多余 key(无对应词条) → ${leftover}`);
  totalWords += unit.vocabulary.length;
}

if (problems.length) { console.error("⚠️ 问题:\n" + problems.join("\n")); process.exit(1); }

fs.writeFileSync(FILE, JSON.stringify(json, null, 2) + "\n", "utf8");
console.log(`✅ 7A Starter 完成：${Object.keys(DATA).length} 个 unit，共 ${totalWords} 词全部去 emoji + 加 chunks`);
