// 7B U1 (g7v2_u1 Animal Friends) 词汇关：去 emoji + 加 language chunks（每词3条）
import fs from "node:fs";

const FILE = "src/data/juniorHub/grade7.json";
const UNIT_ID = "g7v2_u1";

// key = 词条 en，value = 3 条 {en, cn}（短语为主，含1条整句）
const CHUNKS = {
  "fox": [
    { en: "a red fox", cn: "一只红狐狸" },
    { en: "a clever fox", cn: "一只聪明的狐狸" },
    { en: "see a fox in the forest", cn: "在森林里看到狐狸" },
  ],
  "giraffe": [
    { en: "a tall giraffe", cn: "一只高高的长颈鹿" },
    { en: "feed the giraffe", cn: "喂长颈鹿" },
    { en: "The giraffe has a long neck.", cn: "长颈鹿有长长的脖子。" },
  ],
  "eagle": [
    { en: "a big eagle", cn: "一只大鹰" },
    { en: "watch the eagle", cn: "观察那只鹰" },
    { en: "The eagle flies high.", cn: "鹰飞得很高。" },
  ],
  "wolf": [
    { en: "a grey wolf", cn: "一只灰狼" },
    { en: "a pack of wolves", cn: "一群狼" },
    { en: "The wolf lives in the forest.", cn: "狼住在森林里。" },
  ],
  "penguin": [
    { en: "a cute penguin", cn: "一只可爱的企鹅" },
    { en: "penguins on the ice", cn: "冰上的企鹅" },
    { en: "Penguins can't fly.", cn: "企鹅不会飞。" },
  ],
  "care": [
    { en: "care for animals", cn: "照顾动物" },
    { en: "take care of pets", cn: "照看宠物" },
    { en: "I don't care.", cn: "我不在乎。" },
  ],
  "sandwich": [
    { en: "a chicken sandwich", cn: "一个鸡肉三明治" },
    { en: "make a sandwich", cn: "做一个三明治" },
    { en: "eat a sandwich for lunch", cn: "午餐吃三明治" },
  ],
  "snake": [
    { en: "a long snake", cn: "一条长蛇" },
    { en: "a green snake", cn: "一条绿蛇" },
    { en: "The snake looks scary.", cn: "这条蛇看起来吓人。" },
  ],
  "scary": [
    { en: "a scary animal", cn: "一只吓人的动物" },
    { en: "look scary", cn: "看起来吓人" },
    { en: "The film is scary.", cn: "这部电影很吓人。" },
  ],
  "neck": [
    { en: "a long neck", cn: "长长的脖子" },
    { en: "around my neck", cn: "在我脖子上" },
    { en: "The giraffe has a long neck.", cn: "长颈鹿脖子很长。" },
  ],
  "guess": [
    { en: "Guess what!", cn: "猜猜看!" },
    { en: "guess the answer", cn: "猜答案" },
    { en: "I guess so.", cn: "我想是吧。" },
  ],
  "shark": [
    { en: "a big shark", cn: "一条大鲨鱼" },
    { en: "a dangerous shark", cn: "一条危险的鲨鱼" },
    { en: "Sharks live in the sea.", cn: "鲨鱼生活在海里。" },
  ],
  "whale": [
    { en: "a huge whale", cn: "一头巨大的鲸" },
    { en: "whales in the ocean", cn: "海洋里的鲸" },
    { en: "The whale is very big.", cn: "鲸鱼非常大。" },
  ],
  "huge": [
    { en: "a huge animal", cn: "一只巨大的动物" },
    { en: "a huge house", cn: "一座大房子" },
    { en: "The whale is huge.", cn: "鲸鱼非常大。" },
  ],
  "dangerous": [
    { en: "a dangerous animal", cn: "一只危险的动物" },
    { en: "It's dangerous to play with snakes.", cn: "玩蛇很危险。" },
    { en: "Sharks can be dangerous.", cn: "鲨鱼可能很危险。" },
  ],
  "save": [
    { en: "save the animals", cn: "拯救动物" },
    { en: "save money", cn: "存钱" },
    { en: "save my life", cn: "救我的命" },
  ],
  "luck": [
    { en: "Good luck!", cn: "祝你好运!" },
    { en: "bring good luck", cn: "带来好运" },
    { en: "with a bit of luck", cn: "运气好的话" },
  ],
  "pick": [
    { en: "pick up the box", cn: "捡起盒子" },
    { en: "pick a flower", cn: "摘一朵花" },
    { en: "pick it up", cn: "把它捡起来" },
  ],
  "carry": [
    { en: "carry a bag", cn: "提着一个包" },
    { en: "carry the baby", cn: "抱着婴儿" },
    { en: "carry it home", cn: "把它拿回家" },
  ],
  "playful": [
    { en: "a playful dog", cn: "一只爱玩的狗" },
    { en: "playful and friendly", cn: "爱玩又友好" },
    { en: "The cat is playful.", cn: "这只猫很爱玩。" },
  ],
  "swimmer": [
    { en: "a good swimmer", cn: "一名游泳健将" },
    { en: "a fast swimmer", cn: "游得快的人" },
    { en: "Fish are good swimmers.", cn: "鱼很会游泳。" },
  ],
  "culture": [
    { en: "Chinese culture", cn: "中国文化" },
    { en: "learn about culture", cn: "了解文化" },
    { en: "food culture", cn: "饮食文化" },
  ],
  "however": [
    { en: "However, I like it.", cn: "不过,我喜欢它。" },
    { en: "It's small. However, it's strong.", cn: "它很小,然而很强壮。" },
    { en: "However, we won the game.", cn: "然而,我们赢了比赛。" },
  ],
  "danger": [
    { en: "in danger", cn: "处于危险中" },
    { en: "out of danger", cn: "脱离危险" },
    { en: "Some animals are in danger.", cn: "一些动物处于危险中。" },
  ],
  "forest": [
    { en: "in the forest", cn: "在森林里" },
    { en: "a big forest", cn: "一片大森林" },
    { en: "Many animals live in the forest.", cn: "许多动物住在森林里。" },
  ],
  "kill": [
    { en: "kill animals", cn: "杀害动物" },
    { en: "Don't kill them.", cn: "别杀它们。" },
    { en: "kill the plant", cn: "弄死植物" },
  ],
  "friendly": [
    { en: "a friendly dog", cn: "一只友好的狗" },
    { en: "be friendly to others", cn: "对别人友好" },
    { en: "friendly and kind", cn: "友好又善良" },
  ],
  "quite": [
    { en: "quite big", cn: "相当大" },
    { en: "quite a lot", cn: "相当多" },
    { en: "It's quite cold today.", cn: "今天相当冷。" },
  ],
  "blind": [
    { en: "a blind man", cn: "一个盲人" },
    { en: "go blind", cn: "失明" },
    { en: "help blind people", cn: "帮助盲人" },
  ],
  "hearing": [
    { en: "good hearing", cn: "听觉好" },
    { en: "lose one's hearing", cn: "失去听力" },
    { en: "Dogs have good hearing.", cn: "狗的听觉很好。" },
  ],
};

const json = JSON.parse(fs.readFileSync(FILE, "utf8"));
const unit = json.grade7.semesters.grade7_volume2.units.find((u) => u.id === UNIT_ID);
if (!unit) throw new Error("unit not found: " + UNIT_ID);

const missing = [];
unit.vocabulary = unit.vocabulary.map((v) => {
  const chunks = CHUNKS[v.en];
  if (!chunks) missing.push(v.en);
  const { emoji, ...rest } = v; // 去 emoji
  return chunks ? { ...rest, chunks } : rest;
});

if (missing.length) {
  console.error("⚠️ 缺 chunks 的词:", missing.join(", "));
  process.exit(1);
}

fs.writeFileSync(FILE, JSON.stringify(json, null, 2) + "\n", "utf8");
console.log(`✅ ${UNIT_ID}: ${unit.vocabulary.length} 词全部去 emoji + 加 chunks`);
