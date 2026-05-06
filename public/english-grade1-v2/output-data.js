/* ============================================================
 * 输出层数据 · 看图说话 30 + 看图造句 30
 *
 * 看图说话 (speak): 看图 + 中文提示 → 孩子开口说英文
 *   - emoji 多个组合表达场景
 *   - prompt: 中文提示
 *   - sample: 参考答案 (1-2 个简单句)
 *   - level: 1-3 (难度从单句到 2-3 句)
 *
 * 看图造句 (write): 看图 + 模板 → 孩子选词或填空
 *   - template: "I have a ___."
 *   - blanks: [候选词列表]
 *   - answer: 正确答案
 *   - cn: 完整句的中文意思
 * ============================================================ */

const SPEAK_TASKS = [
  // ─── Level 1: 单句描述 (15 个) ───
  { id: 'sp01', level: 1, emoji: '🐱', prompt: '你看到了什么？', sample: 'I see a cat.', cn: '我看见一只猫。' },
  { id: 'sp02', level: 1, emoji: '🍎', prompt: '描述这个水果', sample: 'It is a red apple.', cn: '这是一个红苹果。' },
  { id: 'sp03', level: 1, emoji: '☀️', prompt: '今天天气', sample: 'It is sunny.', cn: '今天是晴天。' },
  { id: 'sp04', level: 1, emoji: '🐶🐱', prompt: '我有什么', sample: 'I have a dog and a cat.', cn: '我有一只狗和一只猫。' },
  { id: 'sp05', level: 1, emoji: '👨‍👩‍👧', prompt: '介绍你的家人', sample: 'I love my family.', cn: '我爱我的家人。' },
  { id: 'sp06', level: 1, emoji: '🍰', prompt: '这是什么', sample: 'It is a big cake.', cn: '这是一个大蛋糕。' },
  { id: 'sp07', level: 1, emoji: '🌧️', prompt: '今天天气', sample: 'It is raining.', cn: '今天下雨了。' },
  { id: 'sp08', level: 1, emoji: '🐦', prompt: '它在做什么', sample: 'The bird is singing.', cn: '小鸟在唱歌。' },
  { id: 'sp09', level: 1, emoji: '🏃', prompt: '我在做什么', sample: 'I can run.', cn: '我会跑步。' },
  { id: 'sp10', level: 1, emoji: '🥛', prompt: '我喜欢什么', sample: 'I like milk.', cn: '我喜欢牛奶。' },
  { id: 'sp11', level: 1, emoji: '🌳', prompt: '描述这棵树', sample: 'The tree is green.', cn: '树是绿色的。' },
  { id: 'sp12', level: 1, emoji: '👋', prompt: '打招呼', sample: 'Hello! Nice to meet you.', cn: '你好！很高兴见到你。' },
  { id: 'sp13', level: 1, emoji: '🐰', prompt: '描述这只兔子', sample: 'The rabbit is small and white.', cn: '兔子又小又白。' },
  { id: 'sp14', level: 1, emoji: '🎒', prompt: '我有什么', sample: 'I have a new bag.', cn: '我有一个新书包。' },
  { id: 'sp15', level: 1, emoji: '🎂', prompt: '今天的特殊日子', sample: 'It is my birthday.', cn: '今天是我的生日。' },

  // ─── Level 2: 2-3 句描述 (15 个) ───
  { id: 'sp16', level: 2, emoji: '🐯', prompt: '描述这只老虎', sample: 'Look at the tiger. It is big and orange. It is in the zoo.', cn: '看那只老虎，它又大又橙。它在动物园里。' },
  { id: 'sp17', level: 2, emoji: '🌷', prompt: '花园里', sample: 'I see many flowers. They are red, yellow and pink. They are beautiful!', cn: '我看见很多花。它们是红的、黄的和粉的。真漂亮！' },
  { id: 'sp18', level: 2, emoji: '🐱🐭', prompt: '猫和老鼠', sample: 'A cat is running. A mouse is running too. The cat wants the mouse.', cn: '一只猫在跑，一只老鼠也在跑。猫想抓老鼠。' },
  { id: 'sp19', level: 2, emoji: '🏫📚', prompt: '上学', sample: 'I go to school. I have a book and a pen. I like school!', cn: '我去上学。我有书和笔。我喜欢学校！' },
  { id: 'sp20', level: 2, emoji: '🎈', prompt: '气球的故事', sample: 'I have a red balloon. It is big. The wind blows. The balloon goes up.', cn: '我有一个红气球。它很大。风一吹，气球飞上天。' },
  { id: 'sp21', level: 2, emoji: '👨🚗', prompt: '爸爸开车', sample: 'My dad has a new car. The car is blue. We go to the park by car.', cn: '我爸爸有一辆新车。车是蓝色的。我们坐车去公园。' },
  { id: 'sp22', level: 2, emoji: '🐱🐶', prompt: '我的宠物', sample: 'I have two pets. I have a cat and a dog. I love them.', cn: '我有两只宠物：一只猫和一只狗。我爱它们。' },
  { id: 'sp23', level: 2, emoji: '🌙⭐', prompt: '夜晚', sample: 'It is night. I see the moon. I see many stars. They are beautiful.', cn: '夜晚到了。我看见月亮。我看见很多星星。真漂亮。' },
  { id: 'sp24', level: 2, emoji: '🍞🥛', prompt: '早餐', sample: 'It is morning. I eat bread. I drink milk. I am happy.', cn: '早上了。我吃面包，喝牛奶，我很开心。' },
  { id: 'sp25', level: 2, emoji: '🪁💨', prompt: '放风筝', sample: 'It is windy. I have a kite. I run and the kite goes up.', cn: '今天有风。我有一个风筝。我一跑，风筝就飞上天。' },
  { id: 'sp26', level: 2, emoji: '🎄🎁', prompt: '节日', sample: 'It is a happy day. I see a big tree. I have a gift. Thank you!', cn: '今天是快乐的一天。我看见一棵大树。我收到礼物。谢谢！' },
  { id: 'sp27', level: 2, emoji: '🐼🎋', prompt: '熊猫', sample: 'Look! A panda. It is black and white. It eats bamboo. It is so cute!', cn: '看！一只熊猫。它是黑白色的。它吃竹子。真可爱！' },
  { id: 'sp28', level: 2, emoji: '👵🍪', prompt: '和奶奶', sample: 'I see my grandma. She gives me a cookie. The cookie is sweet. I love grandma.', cn: '我看见奶奶。她给我一块饼干。饼干很甜。我爱奶奶。' },
  { id: 'sp29', level: 2, emoji: '🌧️🏠', prompt: '雨天在家', sample: 'It is raining. I am at home. I read a book. I am happy.', cn: '下雨了。我在家。我看书。我很开心。' },
  { id: 'sp30', level: 2, emoji: '🐦🌳', prompt: '树上的鸟', sample: 'Look at the tree. There is a bird in the tree. It is yellow. It can sing.', cn: '看那棵树。树上有一只鸟。它是黄色的。它会唱歌。' },
];

const WRITE_TASKS = [
  // ─── Level 1: 单空填词 (15 个) ───
  { id: 'wr01', level: 1, emoji: '🐱',  template: 'I have a ___.',          options: ['cat', 'apple', 'sun', 'red'],     answer: 0, cn: '我有一只猫。' },
  { id: 'wr02', level: 1, emoji: '🍎',  template: 'The apple is ___.',      options: ['blue', 'red', 'tall', 'cold'],    answer: 1, cn: '苹果是红色的。' },
  { id: 'wr03', level: 1, emoji: '☀️',  template: 'The sun is ___.',        options: ['blue', 'cold', 'yellow', 'small'],answer: 2, cn: '太阳是黄色的。' },
  { id: 'wr04', level: 1, emoji: '🐶',  template: 'The dog can ___.',       options: ['fly', 'run', 'sing', 'read'],     answer: 1, cn: '狗会跑。' },
  { id: 'wr05', level: 1, emoji: '🥛',  template: 'I drink ___.',           options: ['cake', 'milk', 'pen', 'tree'],    answer: 1, cn: '我喝牛奶。' },
  { id: 'wr06', level: 1, emoji: '👋',  template: '___! How are you?',      options: ['Cat', 'Hello', 'Apple', 'Read'],  answer: 1, cn: '你好！你好吗？' },
  { id: 'wr07', level: 1, emoji: '🐦',  template: 'The bird can ___.',      options: ['fly', 'swim', 'eat', 'sit'],      answer: 0, cn: '鸟会飞。' },
  { id: 'wr08', level: 1, emoji: '🐟',  template: 'The fish can ___.',      options: ['fly', 'jump', 'swim', 'sing'],    answer: 2, cn: '鱼会游泳。' },
  { id: 'wr09', level: 1, emoji: '🌧️',  template: 'It is ___ today.',       options: ['hot', 'raining', 'happy', 'big'], answer: 1, cn: '今天下雨了。' },
  { id: 'wr10', level: 1, emoji: '🎒',  template: 'I have a new ___.',      options: ['bag', 'sky', 'rain', 'jump'],     answer: 0, cn: '我有一个新书包。' },
  { id: 'wr11', level: 1, emoji: '👩',  template: 'I love my ___.',         options: ['cup', 'mom', 'fish', 'pen'],      answer: 1, cn: '我爱我妈妈。' },
  { id: 'wr12', level: 1, emoji: '🎂',  template: 'Today is my ___.',       options: ['cat', 'book', 'birthday', 'foot'],answer: 2, cn: '今天是我生日。' },
  { id: 'wr13', level: 1, emoji: '⭐',  template: 'I see a ___ in the sky.',options: ['star', 'fish', 'foot', 'cake'],   answer: 0, cn: '我看见天上有一颗星。' },
  { id: 'wr14', level: 1, emoji: '🚗',  template: 'My dad has a ___.',      options: ['cake', 'car', 'fish', 'tree'],    answer: 1, cn: '我爸爸有一辆车。' },
  { id: 'wr15', level: 1, emoji: '🐼',  template: 'The panda is ___.',      options: ['black and white', 'red', 'fast', 'sad'], answer: 0, cn: '熊猫是黑白色的。' },

  // ─── Level 2: 多空填词或选最佳句 (15 个) ───
  { id: 'wr16', level: 2, emoji: '🐱🐶', template: 'I have a cat ___ a dog.',   options: ['and', 'or', 'but', 'in'],         answer: 0, cn: '我有一只猫和一只狗。' },
  { id: 'wr17', level: 2, emoji: '🍎🍌', template: 'I like apples and ___.',    options: ['cars', 'bananas', 'trees', 'pens'],answer: 1, cn: '我喜欢苹果和香蕉。' },
  { id: 'wr18', level: 2, emoji: '🚶📚', template: 'I go ___ school every day.',options: ['for', 'in', 'to', 'on'],          answer: 2, cn: '我每天去上学。' },
  { id: 'wr19', level: 2, emoji: '☀️🌳', template: 'The sun is ___ the tree.', options: ['under', 'over', 'in', 'happy'],   answer: 1, cn: '太阳在树的上面。' },
  { id: 'wr20', level: 2, emoji: '🐱🥛', template: 'My cat ___ milk.',          options: ['eats', 'reads', 'likes', 'sees'], answer: 2, cn: '我的猫喜欢牛奶。' },
  { id: 'wr21', level: 2, emoji: '👧🎂', template: 'It is my sister\'s ___.',   options: ['bag', 'foot', 'birthday', 'shoe'],answer: 2, cn: '今天是我姐妹的生日。' },
  { id: 'wr22', level: 2, emoji: '🌧️☂️', template: 'Take an umbrella, it is ___.', options: ['hot', 'happy', 'sunny', 'raining'], answer: 3, cn: '带把伞，下雨了。' },
  { id: 'wr23', level: 2, emoji: '🐦🌳', template: 'A bird is ___ the tree.',   options: ['in', 'eat', 'big', 'cold'],       answer: 0, cn: '一只鸟在树里。' },
  { id: 'wr24', level: 2, emoji: '👨‍👩‍👧', template: 'I love my ___ very much.',options: ['box', 'family', 'pen', 'book'],   answer: 1, cn: '我非常爱我的家人。' },
  { id: 'wr25', level: 2, emoji: '🦊📦', template: 'A fox is in the ___.',      options: ['tree', 'box', 'water', 'sky'],    answer: 1, cn: '一只狐狸在盒子里。' },
  { id: 'wr26', level: 2, emoji: '🍰🎂', template: 'The cake is big ___ sweet.',options: ['or', 'and', 'but', 'in'],         answer: 1, cn: '蛋糕又大又甜。' },
  { id: 'wr27', level: 2, emoji: '🐶🐱🐼', template: 'I see ___ animals.',      options: ['one', 'two', 'three', 'four'],    answer: 2, cn: '我看见三只动物。' },
  { id: 'wr28', level: 2, emoji: '🏠🌳', template: 'There is a tree ___ my home.', options: ['near', 'eat', 'sing', 'red'], answer: 0, cn: '我家附近有一棵树。' },
  { id: 'wr29', level: 2, emoji: '👧✏️', template: 'The girl has a ___.',       options: ['fish', 'pencil', 'sun', 'shoe'],  answer: 1, cn: '女孩有一支铅笔。' },
  { id: 'wr30', level: 2, emoji: '🌈',   template: 'A rainbow has many ___.',   options: ['eggs', 'cars', 'colors', 'cakes'],answer: 2, cn: '彩虹有很多颜色。' },
];

window.SPEAK_TASKS = SPEAK_TASKS;
window.WRITE_TASKS = WRITE_TASKS;
