/* ============================================================
 * 英语小冒险·一年级 v2 · 完整核心数据库
 *
 * 内容覆盖（全面对标人教 PEP / 外研社一年级起点）:
 * - 字母:    26
 * - 单词:    150 (12 个 unit)
 * - 句型:    50  (问候/介绍/课堂/感受/年龄/喜好/能力/天气/时间)
 * - 听力:    30 段对话
 * - 拼读:    50 个 CVC 词 (短元音 + 长元音 + 二合元音)
 * ============================================================ */

const LETTERS = [
  { letter: 'A', words: ['apple', 'ant'], emoji: '🍎' },
  { letter: 'B', words: ['ball', 'banana'], emoji: '⚽' },
  { letter: 'C', words: ['cat', 'cake'], emoji: '🐱' },
  { letter: 'D', words: ['dog', 'duck'], emoji: '🐶' },
  { letter: 'E', words: ['egg', 'elephant'], emoji: '🥚' },
  { letter: 'F', words: ['fish', 'fan'], emoji: '🐟' },
  { letter: 'G', words: ['girl', 'goat'], emoji: '👧' },
  { letter: 'H', words: ['hat', 'hand'], emoji: '🎩' },
  { letter: 'I', words: ['ice', 'ink'], emoji: '🧊' },
  { letter: 'J', words: ['juice', 'jump'], emoji: '🧃' },
  { letter: 'K', words: ['king', 'kite'], emoji: '👑' },
  { letter: 'L', words: ['lion', 'leg'], emoji: '🦁' },
  { letter: 'M', words: ['mom', 'milk'], emoji: '👩' },
  { letter: 'N', words: ['nose', 'nine'], emoji: '👃' },
  { letter: 'O', words: ['orange', 'ox'], emoji: '🍊' },
  { letter: 'P', words: ['pig', 'pen'], emoji: '🐷' },
  { letter: 'Q', words: ['queen', 'quiet'], emoji: '👸' },
  { letter: 'R', words: ['rabbit', 'red'], emoji: '🐰' },
  { letter: 'S', words: ['sun', 'sister'], emoji: '☀️' },
  { letter: 'T', words: ['tiger', 'tree'], emoji: '🐯' },
  { letter: 'U', words: ['umbrella', 'up'], emoji: '☂️' },
  { letter: 'V', words: ['van', 'violet'], emoji: '🚐' },
  { letter: 'W', words: ['water', 'window'], emoji: '💧' },
  { letter: 'X', words: ['box', 'fox'], emoji: '📦' },
  { letter: 'Y', words: ['yellow', 'yes'], emoji: '💛' },
  { letter: 'Z', words: ['zoo', 'zebra'], emoji: '🦓' },
];

// ============================================================
// 150 个核心词（大幅扩充原 100 词）
// ============================================================
const VOCAB = [
  // ─── Unit 1: 问候与介绍 (8) ───
  { id: 'w001', word: 'hello',  cn: '你好',   emoji: '👋', unit: 1 },
  { id: 'w002', word: 'hi',     cn: '嗨',     emoji: '🙋', unit: 1 },
  { id: 'w003', word: 'bye',    cn: '再见',   emoji: '👋', unit: 1 },
  { id: 'w004', word: 'I',      cn: '我',     emoji: '🙋', unit: 1 },
  { id: 'w005', word: 'you',    cn: '你',     emoji: '👉', unit: 1 },
  { id: 'w006', word: 'name',   cn: '名字',   emoji: '📛', unit: 1 },
  { id: 'w007', word: 'yes',    cn: '是的',   emoji: '✅', unit: 1 },
  { id: 'w008', word: 'no',     cn: '不',     emoji: '❌', unit: 1 },

  // ─── Unit 2: 数字 1-12 (12) ───
  { id: 'w009', word: 'one',    cn: '一',     emoji: '1️⃣', unit: 2 },
  { id: 'w010', word: 'two',    cn: '二',     emoji: '2️⃣', unit: 2 },
  { id: 'w011', word: 'three',  cn: '三',     emoji: '3️⃣', unit: 2 },
  { id: 'w012', word: 'four',   cn: '四',     emoji: '4️⃣', unit: 2 },
  { id: 'w013', word: 'five',   cn: '五',     emoji: '5️⃣', unit: 2 },
  { id: 'w014', word: 'six',    cn: '六',     emoji: '6️⃣', unit: 2 },
  { id: 'w015', word: 'seven',  cn: '七',     emoji: '7️⃣', unit: 2 },
  { id: 'w016', word: 'eight',  cn: '八',     emoji: '8️⃣', unit: 2 },
  { id: 'w017', word: 'nine',   cn: '九',     emoji: '9️⃣', unit: 2 },
  { id: 'w018', word: 'ten',    cn: '十',     emoji: '🔟', unit: 2 },
  { id: 'w019', word: 'eleven', cn: '十一',   emoji: '🔢', unit: 2 },
  { id: 'w020', word: 'twelve', cn: '十二',   emoji: '🔢', unit: 2 },

  // ─── Unit 3: 颜色 (8) ───
  { id: 'w021', word: 'red',    cn: '红色',   emoji: '🔴', unit: 3 },
  { id: 'w022', word: 'blue',   cn: '蓝色',   emoji: '🔵', unit: 3 },
  { id: 'w023', word: 'yellow', cn: '黄色',   emoji: '🟡', unit: 3 },
  { id: 'w024', word: 'green',  cn: '绿色',   emoji: '🟢', unit: 3 },
  { id: 'w025', word: 'black',  cn: '黑色',   emoji: '⚫', unit: 3 },
  { id: 'w026', word: 'white',  cn: '白色',   emoji: '⚪', unit: 3 },
  { id: 'w027', word: 'pink',   cn: '粉色',   emoji: '🌸', unit: 3 },
  { id: 'w028', word: 'orange', cn: '橙色',   emoji: '🟠', unit: 3 },

  // ─── Unit 4: 动物 (15) ───
  { id: 'w029', word: 'cat',    cn: '猫',     emoji: '🐱', unit: 4 },
  { id: 'w030', word: 'dog',    cn: '狗',     emoji: '🐶', unit: 4 },
  { id: 'w031', word: 'pig',    cn: '猪',     emoji: '🐷', unit: 4 },
  { id: 'w032', word: 'duck',   cn: '鸭',     emoji: '🦆', unit: 4 },
  { id: 'w033', word: 'bird',   cn: '鸟',     emoji: '🐦', unit: 4 },
  { id: 'w034', word: 'fish',   cn: '鱼',     emoji: '🐟', unit: 4 },
  { id: 'w035', word: 'rabbit', cn: '兔子',   emoji: '🐰', unit: 4 },
  { id: 'w036', word: 'panda',  cn: '熊猫',   emoji: '🐼', unit: 4 },
  { id: 'w037', word: 'tiger',  cn: '老虎',   emoji: '🐯', unit: 4 },
  { id: 'w038', word: 'lion',   cn: '狮子',   emoji: '🦁', unit: 4 },
  { id: 'w039', word: 'elephant',cn:'大象',   emoji: '🐘', unit: 4 },
  { id: 'w040', word: 'monkey', cn: '猴子',   emoji: '🐵', unit: 4 },
  { id: 'w041', word: 'cow',    cn: '奶牛',   emoji: '🐄', unit: 4 },
  { id: 'w042', word: 'horse',  cn: '马',     emoji: '🐴', unit: 4 },
  { id: 'w043', word: 'sheep',  cn: '羊',     emoji: '🐑', unit: 4 },

  // ─── Unit 5: 食物饮料 (15) ───
  { id: 'w044', word: 'apple',  cn: '苹果',   emoji: '🍎', unit: 5 },
  { id: 'w045', word: 'banana', cn: '香蕉',   emoji: '🍌', unit: 5 },
  { id: 'w046', word: 'pear',   cn: '梨',     emoji: '🍐', unit: 5 },
  { id: 'w047', word: 'cake',   cn: '蛋糕',   emoji: '🍰', unit: 5 },
  { id: 'w048', word: 'bread',  cn: '面包',   emoji: '🍞', unit: 5 },
  { id: 'w049', word: 'rice',   cn: '米饭',   emoji: '🍚', unit: 5 },
  { id: 'w050', word: 'milk',   cn: '牛奶',   emoji: '🥛', unit: 5 },
  { id: 'w051', word: 'water',  cn: '水',     emoji: '💧', unit: 5 },
  { id: 'w052', word: 'juice',  cn: '果汁',   emoji: '🧃', unit: 5 },
  { id: 'w053', word: 'egg',    cn: '鸡蛋',   emoji: '🥚', unit: 5 },
  { id: 'w054', word: 'noodle', cn: '面条',   emoji: '🍜', unit: 5 },
  { id: 'w055', word: 'fruit',  cn: '水果',   emoji: '🍓', unit: 5 },
  { id: 'w056', word: 'tea',    cn: '茶',     emoji: '🍵', unit: 5 },
  { id: 'w057', word: 'cookie', cn: '饼干',   emoji: '🍪', unit: 5 },
  { id: 'w058', word: 'candy',  cn: '糖果',   emoji: '🍬', unit: 5 },

  // ─── Unit 6: 家庭 (8) ───
  { id: 'w059', word: 'mom',    cn: '妈妈',   emoji: '👩', unit: 6 },
  { id: 'w060', word: 'dad',    cn: '爸爸',   emoji: '👨', unit: 6 },
  { id: 'w061', word: 'sister', cn: '姐妹',   emoji: '👧', unit: 6 },
  { id: 'w062', word: 'brother',cn: '兄弟',   emoji: '👦', unit: 6 },
  { id: 'w063', word: 'family', cn: '家',     emoji: '👨‍👩‍👧', unit: 6 },
  { id: 'w064', word: 'baby',   cn: '宝宝',   emoji: '👶', unit: 6 },
  { id: 'w065', word: 'grandma',cn: '奶奶',   emoji: '👵', unit: 6 },
  { id: 'w066', word: 'grandpa',cn: '爷爷',   emoji: '👴', unit: 6 },

  // ─── Unit 7: 学习用品 (10) ───
  { id: 'w067', word: 'pen',    cn: '钢笔',   emoji: '🖊️', unit: 7 },
  { id: 'w068', word: 'pencil', cn: '铅笔',   emoji: '✏️', unit: 7 },
  { id: 'w069', word: 'book',   cn: '书',     emoji: '📚', unit: 7 },
  { id: 'w070', word: 'bag',    cn: '书包',   emoji: '🎒', unit: 7 },
  { id: 'w071', word: 'ruler',  cn: '尺子',   emoji: '📏', unit: 7 },
  { id: 'w072', word: 'eraser', cn: '橡皮',   emoji: '🩹', unit: 7 },
  { id: 'w073', word: 'desk',   cn: '书桌',   emoji: '🪑', unit: 7 },
  { id: 'w074', word: 'school', cn: '学校',   emoji: '🏫', unit: 7 },
  { id: 'w075', word: 'class',  cn: '班级',   emoji: '🎓', unit: 7 },
  { id: 'w076', word: 'crayon', cn: '蜡笔',   emoji: '🖍️', unit: 7 },

  // ─── Unit 8: 身体 (10) ───
  { id: 'w077', word: 'head',   cn: '头',     emoji: '😊', unit: 8 },
  { id: 'w078', word: 'eye',    cn: '眼睛',   emoji: '👁️', unit: 8 },
  { id: 'w079', word: 'ear',    cn: '耳朵',   emoji: '👂', unit: 8 },
  { id: 'w080', word: 'nose',   cn: '鼻子',   emoji: '👃', unit: 8 },
  { id: 'w081', word: 'mouth',  cn: '嘴巴',   emoji: '👄', unit: 8 },
  { id: 'w082', word: 'hand',   cn: '手',     emoji: '✋', unit: 8 },
  { id: 'w083', word: 'foot',   cn: '脚',     emoji: '🦶', unit: 8 },
  { id: 'w084', word: 'face',   cn: '脸',     emoji: '😀', unit: 8 },
  { id: 'w085', word: 'arm',    cn: '胳膊',   emoji: '💪', unit: 8 },
  { id: 'w086', word: 'leg',    cn: '腿',     emoji: '🦵', unit: 8 },

  // ─── Unit 9: 玩具与日常 (10) ───
  { id: 'w087', word: 'ball',   cn: '球',     emoji: '⚽', unit: 9 },
  { id: 'w088', word: 'doll',   cn: '娃娃',   emoji: '🪆', unit: 9 },
  { id: 'w089', word: 'kite',   cn: '风筝',   emoji: '🪁', unit: 9 },
  { id: 'w090', word: 'car',    cn: '小汽车', emoji: '🚗', unit: 9 },
  { id: 'w091', word: 'bus',    cn: '公交车', emoji: '🚌', unit: 9 },
  { id: 'w092', word: 'bike',   cn: '自行车', emoji: '🚲', unit: 9 },
  { id: 'w093', word: 'boat',   cn: '小船',   emoji: '⛵', unit: 9 },
  { id: 'w094', word: 'train',  cn: '火车',   emoji: '🚂', unit: 9 },
  { id: 'w095', word: 'plane',  cn: '飞机',   emoji: '✈️', unit: 9 },
  { id: 'w096', word: 'toy',    cn: '玩具',   emoji: '🧸', unit: 9 },

  // ─── Unit 10: 自然 (10) ───
  { id: 'w097', word: 'sun',    cn: '太阳',   emoji: '☀️', unit: 10 },
  { id: 'w098', word: 'moon',   cn: '月亮',   emoji: '🌙', unit: 10 },
  { id: 'w099', word: 'star',   cn: '星星',   emoji: '⭐', unit: 10 },
  { id: 'w100', word: 'tree',   cn: '树',     emoji: '🌳', unit: 10 },
  { id: 'w101', word: 'flower', cn: '花',     emoji: '🌷', unit: 10 },
  { id: 'w102', word: 'sky',    cn: '天空',   emoji: '🌤️', unit: 10 },
  { id: 'w103', word: 'rain',   cn: '雨',     emoji: '🌧️', unit: 10 },
  { id: 'w104', word: 'snow',   cn: '雪',     emoji: '❄️', unit: 10 },
  { id: 'w105', word: 'cloud',  cn: '云',     emoji: '☁️', unit: 10 },
  { id: 'w106', word: 'wind',   cn: '风',     emoji: '💨', unit: 10 },

  // ─── Unit 11: 简单动作 (12) ───
  { id: 'w107', word: 'go',     cn: '去',     emoji: '➡️', unit: 11 },
  { id: 'w108', word: 'come',   cn: '来',     emoji: '⬅️', unit: 11 },
  { id: 'w109', word: 'eat',    cn: '吃',     emoji: '🍽️', unit: 11 },
  { id: 'w110', word: 'drink',  cn: '喝',     emoji: '🥤', unit: 11 },
  { id: 'w111', word: 'run',    cn: '跑',     emoji: '🏃', unit: 11 },
  { id: 'w112', word: 'jump',   cn: '跳',     emoji: '🤸', unit: 11 },
  { id: 'w113', word: 'sit',    cn: '坐',     emoji: '🪑', unit: 11 },
  { id: 'w114', word: 'stand',  cn: '站',     emoji: '🧍', unit: 11 },
  { id: 'w115', word: 'sing',   cn: '唱歌',   emoji: '🎤', unit: 11 },
  { id: 'w116', word: 'play',   cn: '玩',     emoji: '🎮', unit: 11 },
  { id: 'w117', word: 'walk',   cn: '走',     emoji: '🚶', unit: 11 },
  { id: 'w118', word: 'read',   cn: '读',     emoji: '📖', unit: 11 },

  // ─── Unit 12: 形容词 (10) ───
  { id: 'w119', word: 'big',    cn: '大',     emoji: '🐘', unit: 12 },
  { id: 'w120', word: 'small',  cn: '小',     emoji: '🐭', unit: 12 },
  { id: 'w121', word: 'good',   cn: '好',     emoji: '👍', unit: 12 },
  { id: 'w122', word: 'happy',  cn: '高兴',   emoji: '😄', unit: 12 },
  { id: 'w123', word: 'cute',   cn: '可爱',   emoji: '🥰', unit: 12 },
  { id: 'w124', word: 'new',    cn: '新',     emoji: '✨', unit: 12 },
  { id: 'w125', word: 'old',    cn: '旧',     emoji: '📜', unit: 12 },
  { id: 'w126', word: 'hot',    cn: '热',     emoji: '🔥', unit: 12 },
  { id: 'w127', word: 'cold',   cn: '冷',     emoji: '🥶', unit: 12 },
  { id: 'w128', word: 'fast',   cn: '快',     emoji: '💨', unit: 12 },

  // ─── Unit 13: 课堂 / 生活补充 (12) ───
  { id: 'w129', word: 'morning',cn: '早上',   emoji: '🌅', unit: 13 },
  { id: 'w130', word: 'night',  cn: '晚上',   emoji: '🌃', unit: 13 },
  { id: 'w131', word: 'day',    cn: '一天',   emoji: '📅', unit: 13 },
  { id: 'w132', word: 'home',   cn: '家',     emoji: '🏠', unit: 13 },
  { id: 'w133', word: 'park',   cn: '公园',   emoji: '🏞️', unit: 13 },
  { id: 'w134', word: 'shop',   cn: '商店',   emoji: '🏪', unit: 13 },
  { id: 'w135', word: 'friend', cn: '朋友',   emoji: '🤝', unit: 13 },
  { id: 'w136', word: 'teacher',cn: '老师',   emoji: '👩‍🏫', unit: 13 },
  { id: 'w137', word: 'boy',    cn: '男孩',   emoji: '👦', unit: 13 },
  { id: 'w138', word: 'girl',   cn: '女孩',   emoji: '👧', unit: 13 },
  { id: 'w139', word: 'shoe',   cn: '鞋子',   emoji: '👟', unit: 13 },
  { id: 'w140', word: 'hat',    cn: '帽子',   emoji: '🎩', unit: 13 },

  // ─── Unit 14: 高频常用 (10) ───
  { id: 'w141', word: 'this',   cn: '这个',   emoji: '👈', unit: 14 },
  { id: 'w142', word: 'that',   cn: '那个',   emoji: '👉', unit: 14 },
  { id: 'w143', word: 'have',   cn: '有',     emoji: '🤲', unit: 14 },
  { id: 'w144', word: 'like',   cn: '喜欢',   emoji: '❤️', unit: 14 },
  { id: 'w145', word: 'see',    cn: '看见',   emoji: '👀', unit: 14 },
  { id: 'w146', word: 'look',   cn: '看',     emoji: '🔍', unit: 14 },
  { id: 'w147', word: 'thank',  cn: '谢谢',   emoji: '🙏', unit: 14 },
  { id: 'w148', word: 'please', cn: '请',     emoji: '🤲', unit: 14 },
  { id: 'w149', word: 'sorry',  cn: '对不起', emoji: '🥺', unit: 14 },
  { id: 'w150', word: 'okay',   cn: '好的',   emoji: '👌', unit: 14 },
];

// ============================================================
// 50 个常用句型（从 20 扩充）
// ============================================================
const SENTENCES = [
  // ─── 问候 (5) ───
  { id: 's01', en: "Hello!",                       cn: "你好！",          theme: 'greet' },
  { id: 's02', en: "Hi!",                          cn: "嗨！",            theme: 'greet' },
  { id: 's03', en: "Goodbye!",                     cn: "再见！",          theme: 'greet' },
  { id: 's04', en: "Good morning!",                cn: "早上好！",         theme: 'greet' },
  { id: 's05', en: "Good night!",                  cn: "晚安！",          theme: 'greet' },

  // ─── 自我介绍 (5) ───
  { id: 's06', en: "What's your name?",            cn: "你叫什么名字？",   theme: 'intro' },
  { id: 's07', en: "My name is Tom.",              cn: "我叫 Tom。",     theme: 'intro' },
  { id: 's08', en: "I'm Mary.",                    cn: "我是 Mary。",    theme: 'intro' },
  { id: 's09', en: "Nice to meet you.",            cn: "很高兴见到你。",   theme: 'intro' },
  { id: 's10', en: "Me too.",                      cn: "我也是。",        theme: 'intro' },

  // ─── 感受 (5) ───
  { id: 's11', en: "How are you?",                 cn: "你好吗？",        theme: 'feel' },
  { id: 's12', en: "I'm fine, thank you.",         cn: "我很好，谢谢。",   theme: 'feel' },
  { id: 's13', en: "I'm happy.",                   cn: "我很高兴。",      theme: 'feel' },
  { id: 's14', en: "I'm sad.",                     cn: "我很难过。",      theme: 'feel' },
  { id: 's15', en: "I'm tired.",                   cn: "我很累。",        theme: 'feel' },

  // ─── 年龄 (3) ───
  { id: 's16', en: "How old are you?",             cn: "你几岁了？",      theme: 'age' },
  { id: 's17', en: "I'm six.",                     cn: "我六岁。",        theme: 'age' },
  { id: 's18', en: "I'm seven years old.",         cn: "我七岁了。",      theme: 'age' },

  // ─── 指认事物 (5) ───
  { id: 's19', en: "What's this?",                 cn: "这是什么？",      theme: 'point' },
  { id: 's20', en: "It's a cat.",                  cn: "这是一只猫。",     theme: 'point' },
  { id: 's21', en: "What's that?",                 cn: "那是什么？",      theme: 'point' },
  { id: 's22', en: "Look at the bird!",            cn: "看那只鸟！",      theme: 'point' },
  { id: 's23', en: "It's red.",                    cn: "它是红色的。",     theme: 'point' },

  // ─── 喜好 (5) ───
  { id: 's24', en: "I like apples.",               cn: "我喜欢苹果。",     theme: 'like' },
  { id: 's25', en: "Do you like cake?",            cn: "你喜欢蛋糕吗？",   theme: 'like' },
  { id: 's26', en: "Yes, I do.",                   cn: "是的，我喜欢。",   theme: 'like' },
  { id: 's27', en: "No, I don't.",                 cn: "不，我不喜欢。",   theme: 'like' },
  { id: 's28', en: "I love my mom.",               cn: "我爱我妈妈。",     theme: 'like' },

  // ─── 拥有 (4) ───
  { id: 's29', en: "I have a pencil.",             cn: "我有一支铅笔。",   theme: 'have' },
  { id: 's30', en: "Do you have a pen?",           cn: "你有钢笔吗？",     theme: 'have' },
  { id: 's31', en: "I have two cats.",             cn: "我有两只猫。",     theme: 'have' },
  { id: 's32', en: "He has a ball.",               cn: "他有一个球。",     theme: 'have' },

  // ─── 课堂 (5) ───
  { id: 's33', en: "Stand up, please.",            cn: "请站起来。",      theme: 'class' },
  { id: 's34', en: "Sit down, please.",            cn: "请坐下。",        theme: 'class' },
  { id: 's35', en: "Listen to me.",                cn: "听我说。",        theme: 'class' },
  { id: 's36', en: "Open your book.",              cn: "打开你的书。",     theme: 'class' },
  { id: 's37', en: "Look at the board.",           cn: "看黑板。",        theme: 'class' },

  // ─── 礼貌 (4) ───
  { id: 's38', en: "Thank you!",                   cn: "谢谢你！",        theme: 'polite' },
  { id: 's39', en: "You're welcome.",              cn: "不客气。",        theme: 'polite' },
  { id: 's40', en: "I'm sorry.",                   cn: "对不起。",        theme: 'polite' },
  { id: 's41', en: "It's okay.",                   cn: "没关系。",        theme: 'polite' },

  // ─── 能力 (4) ───
  { id: 's42', en: "I can swim.",                  cn: "我会游泳。",      theme: 'can' },
  { id: 's43', en: "Can you sing?",                cn: "你会唱歌吗？",    theme: 'can' },
  { id: 's44', en: "I can run fast.",              cn: "我跑得快。",      theme: 'can' },
  { id: 's45', en: "I can't fly.",                 cn: "我不会飞。",      theme: 'can' },

  // ─── 天气与时间 (5) ───
  { id: 's46', en: "It's sunny today.",            cn: "今天是晴天。",     theme: 'weather' },
  { id: 's47', en: "It's raining.",                cn: "下雨了。",        theme: 'weather' },
  { id: 's48', en: "It's cold.",                   cn: "天冷。",          theme: 'weather' },
  { id: 's49', en: "It's hot.",                    cn: "天热。",          theme: 'weather' },
  { id: 's50', en: "Let's go to school.",          cn: "我们去学校吧。",   theme: 'time' },
];

// ============================================================
// 50 个 phonics 词
// ============================================================
const PHONICS = [
  { id: 'p01', word: 'cat', breakdown: ['c', 'a', 't'], emoji: '🐱', sound: 'short-a' },
  { id: 'p02', word: 'bat', breakdown: ['b', 'a', 't'], emoji: '🦇', sound: 'short-a' },
  { id: 'p03', word: 'hat', breakdown: ['h', 'a', 't'], emoji: '🎩', sound: 'short-a' },
  { id: 'p04', word: 'mat', breakdown: ['m', 'a', 't'], emoji: '🟫', sound: 'short-a' },
  { id: 'p05', word: 'rat', breakdown: ['r', 'a', 't'], emoji: '🐀', sound: 'short-a' },
  { id: 'p06', word: 'man', breakdown: ['m', 'a', 'n'], emoji: '👨', sound: 'short-a' },
  { id: 'p07', word: 'pan', breakdown: ['p', 'a', 'n'], emoji: '🍳', sound: 'short-a' },
  { id: 'p08', word: 'fan', breakdown: ['f', 'a', 'n'], emoji: '🪭', sound: 'short-a' },
  { id: 'p09', word: 'bag', breakdown: ['b', 'a', 'g'], emoji: '🎒', sound: 'short-a' },
  { id: 'p10', word: 'dad', breakdown: ['d', 'a', 'd'], emoji: '👨', sound: 'short-a' },
  { id: 'p11', word: 'pen',  breakdown: ['p', 'e', 'n'],  emoji: '🖊️', sound: 'short-e' },
  { id: 'p12', word: 'hen',  breakdown: ['h', 'e', 'n'],  emoji: '🐔', sound: 'short-e' },
  { id: 'p13', word: 'ten',  breakdown: ['t', 'e', 'n'],  emoji: '🔟', sound: 'short-e' },
  { id: 'p14', word: 'red',  breakdown: ['r', 'e', 'd'],  emoji: '🔴', sound: 'short-e' },
  { id: 'p15', word: 'bed',  breakdown: ['b', 'e', 'd'],  emoji: '🛏️', sound: 'short-e' },
  { id: 'p16', word: 'leg',  breakdown: ['l', 'e', 'g'],  emoji: '🦵', sound: 'short-e' },
  { id: 'p17', word: 'egg',  breakdown: ['e', 'g', 'g'],  emoji: '🥚', sound: 'short-e' },
  { id: 'p18', word: 'web',  breakdown: ['w', 'e', 'b'],  emoji: '🕸️', sound: 'short-e' },
  { id: 'p19', word: 'pig',  breakdown: ['p', 'i', 'g'],  emoji: '🐷', sound: 'short-i' },
  { id: 'p20', word: 'big',  breakdown: ['b', 'i', 'g'],  emoji: '🐘', sound: 'short-i' },
  { id: 'p21', word: 'fish', breakdown: ['f', 'i', 'sh'], emoji: '🐟', sound: 'short-i' },
  { id: 'p22', word: 'six',  breakdown: ['s', 'i', 'x'],  emoji: '6️⃣', sound: 'short-i' },
  { id: 'p23', word: 'sit',  breakdown: ['s', 'i', 't'],  emoji: '🪑', sound: 'short-i' },
  { id: 'p24', word: 'lip',  breakdown: ['l', 'i', 'p'],  emoji: '👄', sound: 'short-i' },
  { id: 'p25', word: 'kid',  breakdown: ['k', 'i', 'd'],  emoji: '👦', sound: 'short-i' },
  { id: 'p26', word: 'win',  breakdown: ['w', 'i', 'n'],  emoji: '🏆', sound: 'short-i' },
  { id: 'p27', word: 'dog',  breakdown: ['d', 'o', 'g'],  emoji: '🐶', sound: 'short-o' },
  { id: 'p28', word: 'fox',  breakdown: ['f', 'o', 'x'],  emoji: '🦊', sound: 'short-o' },
  { id: 'p29', word: 'box',  breakdown: ['b', 'o', 'x'],  emoji: '📦', sound: 'short-o' },
  { id: 'p30', word: 'hot',  breakdown: ['h', 'o', 't'],  emoji: '🔥', sound: 'short-o' },
  { id: 'p31', word: 'pot',  breakdown: ['p', 'o', 't'],  emoji: '🍲', sound: 'short-o' },
  { id: 'p32', word: 'top',  breakdown: ['t', 'o', 'p'],  emoji: '🔝', sound: 'short-o' },
  { id: 'p33', word: 'mom',  breakdown: ['m', 'o', 'm'],  emoji: '👩', sound: 'short-o' },
  { id: 'p34', word: 'log',  breakdown: ['l', 'o', 'g'],  emoji: '🪵', sound: 'short-o' },
  { id: 'p35', word: 'sun',  breakdown: ['s', 'u', 'n'],  emoji: '☀️', sound: 'short-u' },
  { id: 'p36', word: 'bus',  breakdown: ['b', 'u', 's'],  emoji: '🚌', sound: 'short-u' },
  { id: 'p37', word: 'cup',  breakdown: ['c', 'u', 'p'],  emoji: '🥤', sound: 'short-u' },
  { id: 'p38', word: 'run',  breakdown: ['r', 'u', 'n'],  emoji: '🏃', sound: 'short-u' },
  { id: 'p39', word: 'fun',  breakdown: ['f', 'u', 'n'],  emoji: '🎉', sound: 'short-u' },
  { id: 'p40', word: 'duck', breakdown: ['d', 'u', 'ck'], emoji: '🦆', sound: 'short-u' },
  { id: 'p41', word: 'mud',  breakdown: ['m', 'u', 'd'],  emoji: '🟫', sound: 'short-u' },
  { id: 'p42', word: 'jump', breakdown: ['j', 'u', 'mp'], emoji: '🤸', sound: 'short-u' },
  { id: 'p43', word: 'cake', breakdown: ['c', 'a', 'ke'], emoji: '🍰', sound: 'long-a' },
  { id: 'p44', word: 'name', breakdown: ['n', 'a', 'me'], emoji: '📛', sound: 'long-a' },
  { id: 'p45', word: 'bike', breakdown: ['b', 'i', 'ke'], emoji: '🚲', sound: 'long-i' },
  { id: 'p46', word: 'kite', breakdown: ['k', 'i', 'te'], emoji: '🪁', sound: 'long-i' },
  { id: 'p47', word: 'nose', breakdown: ['n', 'o', 'se'], emoji: '👃', sound: 'long-o' },
  { id: 'p48', word: 'home', breakdown: ['h', 'o', 'me'], emoji: '🏠', sound: 'long-o' },
  { id: 'p49', word: 'cute', breakdown: ['c', 'u', 'te'], emoji: '🥰', sound: 'long-u' },
  { id: 'p50', word: 'tree', breakdown: ['t', 'r', 'ee'], emoji: '🌳', sound: 'long-e' },
];

// ============================================================
// 30 段听力对话（从 10 扩充）
// ============================================================
const DIALOGUES = [
  { id: 'd01', a: { who: 'Tom', text: "Hi! What's your name?" },
    b: { who: 'Mary', text: "My name is Mary." },
    question: '女孩叫什么名字？', options: ['Tom', 'Mary', 'Lily', 'Anna'], answer: 1 },
  { id: 'd02', a: { who: 'Mom', text: "How are you, baby?" },
    b: { who: '宝宝', text: "I'm fine, thank you!" },
    question: '宝宝感觉怎么样？', options: ['不好', '很好', '生气', '想睡觉'], answer: 1 },
  { id: 'd03', a: { who: 'Dad', text: "How old are you?" },
    b: { who: 'Tom', text: "I'm six." },
    question: 'Tom 几岁？', options: ['四岁', '五岁', '六岁', '七岁'], answer: 2 },
  { id: 'd04', a: { who: 'Tom', text: "What's this?" },
    b: { who: 'Mary', text: "It's a cat!" },
    question: '他们在看什么？', options: ['狗', '猫', '兔子', '小鸟'], answer: 1 },
  { id: 'd05', a: { who: '老师', text: "Sit down, please." },
    b: { who: '学生', text: "OK!" },
    question: '老师让学生做什么？', options: ['站起来', '坐下', '出去', '唱歌'], answer: 1 },
  { id: 'd06', a: { who: 'Mary', text: "I like apples!" },
    b: { who: 'Tom', text: "Me too!" },
    question: 'Mary 喜欢什么？', options: ['香蕉', '苹果', '橙子', '梨'], answer: 1 },
  { id: 'd07', a: { who: 'Mom', text: "Look at the bird!" },
    b: { who: '宝宝', text: "Wow! It's blue!" },
    question: '小鸟是什么颜色？', options: ['红色', '黄色', '蓝色', '绿色'], answer: 2 },
  { id: 'd08', a: { who: 'Tom', text: "I have a kite." },
    b: { who: 'Mary', text: "Cool!" },
    question: 'Tom 有什么？', options: ['足球', '风筝', '娃娃', '汽车'], answer: 1 },
  { id: 'd09', a: { who: 'Mary', text: "Goodbye, Tom!" },
    b: { who: 'Tom', text: "Bye!" },
    question: '他们在做什么？', options: ['打招呼', '说再见', '问名字', '吃东西'], answer: 1 },
  { id: 'd10', a: { who: 'Dad', text: "Thank you!" },
    b: { who: 'Tom', text: "You're welcome." },
    question: 'Dad 在表达什么？', options: ['道歉', '感谢', '生气', '高兴'], answer: 1 },

  // ─── 新增对话 d11-d30 ───
  { id: 'd11', a: { who: 'Lily', text: "Good morning!" },
    b: { who: 'Mom', text: "Good morning, sweetheart." },
    question: '现在大概是什么时间？', options: ['早上', '中午', '下午', '晚上'], answer: 0 },
  { id: 'd12', a: { who: 'Tom', text: "Can you swim?" },
    b: { who: 'Mary', text: "Yes, I can!" },
    question: 'Mary 会做什么？', options: ['唱歌', '游泳', '跳舞', '跑步'], answer: 1 },
  { id: 'd13', a: { who: 'Sam', text: "Do you like ice cream?" },
    b: { who: 'Anna', text: "Yes, I love it!" },
    question: 'Anna 对冰淇淋什么态度？', options: ['不喜欢', '一般', '非常喜欢', '不知道'], answer: 2 },
  { id: 'd14', a: { who: 'Dad', text: "Where is your bag?" },
    b: { who: 'Tom', text: "It's on the desk." },
    question: '书包在哪里？', options: ['椅子上', '床上', '桌子上', '地上'], answer: 2 },
  { id: 'd15', a: { who: 'Mom', text: "What color is the sky?" },
    b: { who: 'Lily', text: "It's blue!" },
    question: '天空是什么颜色？', options: ['白色', '蓝色', '灰色', '黑色'], answer: 1 },
  { id: 'd16', a: { who: 'Teacher', text: "Open your book, please." },
    b: { who: 'Students', text: "Okay!" },
    question: '老师让孩子们做什么？', options: ['关上书', '打开书', '放下笔', '站起来'], answer: 1 },
  { id: 'd17', a: { who: 'Tom', text: "I have two cats. How about you?" },
    b: { who: 'Mary', text: "I have one dog." },
    question: 'Mary 有什么宠物？', options: ['两只猫', '一只猫', '一只狗', '没有宠物'], answer: 2 },
  { id: 'd18', a: { who: 'Mom', text: "It's raining. Take your umbrella." },
    b: { who: 'Lily', text: "Okay, mom." },
    question: '今天天气怎么样？', options: ['晴天', '雨天', '雪天', '刮风'], answer: 1 },
  { id: 'd19', a: { who: 'Tom', text: "I'm tired." },
    b: { who: 'Mom', text: "Go to bed, baby." },
    question: '妈妈让 Tom 做什么？', options: ['吃饭', '睡觉', '玩耍', '看书'], answer: 1 },
  { id: 'd20', a: { who: 'Sam', text: "Look! A panda!" },
    b: { who: 'Anna', text: "It's so cute!" },
    question: '他们看到了什么动物？', options: ['老虎', '熊猫', '猴子', '大象'], answer: 1 },
  { id: 'd21', a: { who: 'Dad', text: "What do you want for breakfast?" },
    b: { who: 'Tom', text: "Bread and milk, please." },
    question: 'Tom 早餐想吃什么？', options: ['米饭和水', '面条和茶', '面包和牛奶', '蛋糕和果汁'], answer: 2 },
  { id: 'd22', a: { who: 'Lily', text: "I'm hungry, mom." },
    b: { who: 'Mom', text: "Let's eat some fruit." },
    question: '妈妈建议吃什么？', options: ['糖果', '水果', '面包', '蛋糕'], answer: 1 },
  { id: 'd23', a: { who: 'Tom', text: "Is this your pencil?" },
    b: { who: 'Mary', text: "Yes, it is. Thank you!" },
    question: '铅笔是谁的？', options: ['Tom 的', 'Mary 的', '老师的', '不知道'], answer: 1 },
  { id: 'd24', a: { who: 'Sam', text: "Can you sing a song?" },
    b: { who: 'Anna', text: "No, I can't. But I can dance!" },
    question: 'Anna 会做什么？', options: ['唱歌', '跳舞', '画画', '什么都不会'], answer: 1 },
  { id: 'd25', a: { who: 'Mom', text: "Wash your hands before eating." },
    b: { who: 'Tom', text: "Okay, mom." },
    question: '妈妈让 Tom 做什么？', options: ['洗脸', '洗手', '刷牙', '换衣服'], answer: 1 },
  { id: 'd26', a: { who: 'Lily', text: "Where is my doll?" },
    b: { who: 'Brother', text: "It's under the bed." },
    question: '娃娃在哪里？', options: ['床上', '床下', '桌子上', '椅子上'], answer: 1 },
  { id: 'd27', a: { who: 'Dad', text: "Do you want to go to the park?" },
    b: { who: 'Tom', text: "Yes! Let's go!" },
    question: 'Tom 想去哪里？', options: ['学校', '商店', '公园', '医院'], answer: 2 },
  { id: 'd28', a: { who: 'Tom', text: "I'm sorry, Mary." },
    b: { who: 'Mary', text: "It's okay." },
    question: 'Mary 怎么回答？', options: ['生气', '原谅', '难过', '高兴'], answer: 1 },
  { id: 'd29', a: { who: 'Teacher', text: "How many pencils do you have?" },
    b: { who: 'Tom', text: "I have three pencils." },
    question: 'Tom 有几支铅笔？', options: ['一支', '两支', '三支', '四支'], answer: 2 },
  { id: 'd30', a: { who: 'Lily', text: "Happy birthday, mom!" },
    b: { who: 'Mom', text: "Thank you, sweetie!" },
    question: '今天是什么日子？', options: ['圣诞节', '新年', '妈妈的生日', '爸爸的生日'], answer: 2 },
];

window.LETTERS = LETTERS;
window.VOCAB = VOCAB;
window.SENTENCES = SENTENCES;
window.PHONICS = PHONICS;
window.DIALOGUES = DIALOGUES;
