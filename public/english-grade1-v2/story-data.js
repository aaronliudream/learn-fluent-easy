/* ============================================================
 * 故事 + 儿歌 · 输入层数据
 *
 * 故事（4-6 句小故事，配 emoji 序列）:
 *   - id, title, title_cn, emojis, lines (每句 emoji + 英文 + 中文)
 *
 * 儿歌（押韵/节奏感强）:
 *   - id, title, title_cn, lines (每行)
 * ============================================================ */

const STORIES = [
  {
    id: 'st01', title: 'The Big Apple', title_cn: '大苹果',
    lines: [
      { emoji: '🍎', en: 'Look! A big apple.',    cn: '看！一个大苹果。' },
      { emoji: '🐭', en: 'A small mouse comes.',  cn: '一只小老鼠来了。' },
      { emoji: '🐭🍎', en: 'The mouse wants the apple.', cn: '老鼠想要苹果。' },
      { emoji: '🐱',  en: 'A cat sees the mouse.',cn: '一只猫看见老鼠。' },
      { emoji: '🏃🐭',en: 'The mouse runs fast!', cn: '老鼠快跑！' },
      { emoji: '🍎',  en: 'The apple is safe.',   cn: '苹果安全了。' },
    ]
  },
  {
    id: 'st02', title: 'Lily and Her Cat', title_cn: 'Lily 和她的猫',
    lines: [
      { emoji: '👧',   en: 'Lily is a girl.',           cn: 'Lily 是一个女孩。' },
      { emoji: '🐱',   en: 'She has a cat.',            cn: '她有一只猫。' },
      { emoji: '🐱🥛', en: 'The cat likes milk.',       cn: '猫喜欢牛奶。' },
      { emoji: '👧🐱', en: 'Lily and the cat play.',    cn: 'Lily 和猫一起玩。' },
      { emoji: '😊',   en: 'They are very happy.',      cn: '他们非常开心。' },
    ]
  },
  {
    id: 'st03', title: 'A Sunny Day at the Park', title_cn: '公园里晴朗的一天',
    lines: [
      { emoji: '☀️',   en: 'It is a sunny day.',        cn: '今天是晴天。' },
      { emoji: '🏞️👦', en: 'Tom goes to the park.',     cn: 'Tom 去公园。' },
      { emoji: '🐶',   en: 'He sees a dog.',            cn: '他看见一只狗。' },
      { emoji: '🐦',   en: 'He sees a bird.',           cn: '他看见一只鸟。' },
      { emoji: '🌷',   en: 'He sees many flowers.',     cn: '他看见很多花。' },
      { emoji: '😄',   en: 'Tom is so happy.',          cn: 'Tom 非常开心。' },
    ]
  },
  {
    id: 'st04', title: 'Three Little Pigs', title_cn: '三只小猪',
    lines: [
      { emoji: '🐷🐷🐷', en: 'There are three little pigs.', cn: '有三只小猪。' },
      { emoji: '🏠',     en: 'They have a small home.',     cn: '他们有一个小家。' },
      { emoji: '🐺',     en: 'A big wolf comes.',           cn: '一只大灰狼来了。' },
      { emoji: '🐷🚪',   en: 'The pigs close the door.',    cn: '小猪们关上门。' },
      { emoji: '🐺❌',   en: 'The wolf cannot come in.',    cn: '狼进不来。' },
      { emoji: '🐷😊',   en: 'The pigs are safe.',          cn: '小猪们安全了。' },
    ]
  },
  {
    id: 'st05', title: 'My First Day', title_cn: '第一天',
    lines: [
      { emoji: '📅',     en: 'Today is a new day.',          cn: '今天是新的一天。' },
      { emoji: '🎒👧',   en: 'Lily has a new bag.',          cn: 'Lily 有一个新书包。' },
      { emoji: '🏫',     en: 'She goes to school.',          cn: '她去上学。' },
      { emoji: '👩‍🏫',   en: 'The teacher is nice.',         cn: '老师人很好。' },
      { emoji: '👫',     en: 'She has new friends.',         cn: '她有了新朋友。' },
      { emoji: '😄',     en: 'Lily loves school!',           cn: 'Lily 爱学校！' },
    ]
  },
  {
    id: 'st06', title: 'The Lost Cat', title_cn: '走丢的猫',
    lines: [
      { emoji: '🐱❓',   en: 'Where is my cat?',             cn: '我的猫在哪里？' },
      { emoji: '🛏️',    en: 'Not under the bed.',           cn: '床下没有。' },
      { emoji: '🪑',    en: 'Not under the desk.',          cn: '桌下没有。' },
      { emoji: '🌳🐱',   en: 'Look! It is in the tree!',     cn: '看！它在树上！' },
      { emoji: '👧🐱',   en: 'I get my cat back.',           cn: '我把猫找回来了。' },
      { emoji: '🥰',     en: 'I love my cat.',               cn: '我爱我的猫。' },
    ]
  },
  {
    id: 'st07', title: 'The Brave Bird', title_cn: '勇敢的小鸟',
    lines: [
      { emoji: '🐦',     en: 'A small bird wants to fly.',   cn: '一只小鸟想飞。' },
      { emoji: '🌳',     en: 'It stands on a tree.',         cn: '它站在树上。' },
      { emoji: '😨',     en: 'It is a little scared.',       cn: '它有点害怕。' },
      { emoji: '💪',     en: 'But it is brave.',             cn: '但它很勇敢。' },
      { emoji: '🐦💨',   en: 'It jumps and flies!',          cn: '它跳起来飞了！' },
      { emoji: '🌤️',    en: 'It is so happy in the sky.',   cn: '它在天上好开心。' },
    ]
  },
  {
    id: 'st08', title: 'Mom Makes a Cake', title_cn: '妈妈做蛋糕',
    lines: [
      { emoji: '👩',     en: 'Mom is in the kitchen.',       cn: '妈妈在厨房。' },
      { emoji: '🥚🥛',   en: 'She has eggs and milk.',       cn: '她有鸡蛋和牛奶。' },
      { emoji: '🍰',     en: 'She makes a big cake.',        cn: '她做了一个大蛋糕。' },
      { emoji: '👃👃',   en: 'It smells so good!',           cn: '闻起来真香！' },
      { emoji: '😋',     en: 'I eat the cake. Yum!',         cn: '我吃了蛋糕。真好吃！' },
      { emoji: '❤️👩',   en: 'Thank you, mom!',              cn: '谢谢妈妈！' },
    ]
  },
];

const SONGS = [
  {
    id: 'sg01', title: 'Hello Hello', title_cn: '你好你好',
    lines: [
      'Hello, hello, how are you?',
      'I am fine, how are you?',
      'I am happy, thank you.',
      'Hello, hello, hello!',
    ],
    cn: ['你好你好你好吗？', '我很好，你好吗？', '我很开心，谢谢你。', '你好你好你好！'],
  },
  {
    id: 'sg02', title: 'One Two Three', title_cn: '一二三',
    lines: [
      'One, two, three, four, five.',
      'Six, seven, eight, nine, ten.',
      'I can count, I can count!',
      'One to ten, count again!',
    ],
    cn: ['一二三四五。', '六七八九十。', '我会数我会数！', '从一到十再数一次！'],
  },
  {
    id: 'sg03', title: 'Happy Birthday', title_cn: '生日快乐',
    lines: [
      'Happy birthday to you!',
      'Happy birthday to you!',
      'Happy birthday, happy birthday!',
      'Happy birthday to you!',
    ],
    cn: ['祝你生日快乐！', '祝你生日快乐！', '生日快乐，生日快乐！', '祝你生日快乐！'],
  },
  {
    id: 'sg04', title: 'Twinkle Little Star', title_cn: '一闪一闪小星星',
    lines: [
      'Twinkle, twinkle, little star,',
      'How I wonder what you are!',
      'Up above the world so high,',
      'Like a diamond in the sky.',
    ],
    cn: ['一闪一闪小星星，', '我想知道你是什么？', '高高挂在天空中，', '像天上的钻石。'],
  },
  {
    id: 'sg05', title: 'I Love My Family', title_cn: '我爱我的家人',
    lines: [
      'I love my mom, mom, mom.',
      'I love my dad, dad, dad.',
      'I love my sister, brother too.',
      'I love my family, yes I do!',
    ],
    cn: ['我爱我的妈妈，妈妈，妈妈。', '我爱我的爸爸，爸爸，爸爸。', '我也爱姐妹和兄弟。', '我爱我的家人，是的！'],
  },
];

window.STORIES = STORIES;
window.SONGS = SONGS;
