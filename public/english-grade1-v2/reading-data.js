/* ============================================================
 * 分级阅读 30 篇 · 严格控制在 G1 150 词表 + 高频功能词内
 *
 * 难度梯度:
 *   Level 1 (篇 1-10): 4-6 句，30-50 词，单一主题
 *   Level 2 (篇 11-20): 6-10 句，50-100 词，简单情节
 *   Level 3 (篇 21-30): 10-15 句，100-150 词，含对话/简单情绪
 *
 * 每篇结构:
 *   - title: 英文标题
 *   - title_cn: 中文标题
 *   - level: 1-3
 *   - emoji: 主题表情
 *   - paragraphs: ["第一段", "第二段", ...]
 *   - gist: 一句话中文大意
 *   - questions: [{q, options[4], answer}]
 * ============================================================ */

const READING = [
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  Level 1 · 30-50 词，单主题
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'r01', level: 1, emoji: '🐱',
    title: 'My Cat',
    title_cn: '我的猫',
    paragraphs: [
      "I have a cat. My cat is small. My cat is white. I love my cat. My cat likes milk."
    ],
    gist: '我有一只白色的小猫，它喜欢喝牛奶。',
    questions: [
      { q: '猫是什么颜色？', options: ['黑色', '白色', '红色', '黄色'], answer: 1 },
      { q: '猫喜欢什么？', options: ['面包', '水', '牛奶', '果汁'], answer: 2 },
      { q: '猫是大还是小？', options: ['很大', '很小', '不大不小', '不知道'], answer: 1 },
    ]
  },
  {
    id: 'r02', level: 1, emoji: '🍎',
    title: 'Red Apples',
    title_cn: '红苹果',
    paragraphs: [
      "Look! Apples! The apples are red. I like apples. Mom likes apples. We eat apples."
    ],
    gist: '苹果是红色的，我和妈妈都喜欢吃。',
    questions: [
      { q: '苹果是什么颜色？', options: ['绿色', '黄色', '红色', '蓝色'], answer: 2 },
      { q: '谁喜欢苹果？', options: ['只有我', '只有妈妈', '我和妈妈', '爸爸'], answer: 2 },
      { q: '我们用苹果做什么？', options: ['看', '玩', '画', '吃'], answer: 3 },
    ]
  },
  {
    id: 'r03', level: 1, emoji: '☀️',
    title: 'A Sunny Day',
    title_cn: '晴天',
    paragraphs: [
      "Today is sunny. The sky is blue. The sun is yellow. I am happy. I go to the park."
    ],
    gist: '今天天气晴，我很开心地去公园。',
    questions: [
      { q: '天气怎么样？', options: ['下雨', '下雪', '晴天', '刮风'], answer: 2 },
      { q: '天空是什么颜色？', options: ['白色', '蓝色', '灰色', '黑色'], answer: 1 },
      { q: '我去哪里？', options: ['学校', '家', '公园', '商店'], answer: 2 },
    ]
  },
  {
    id: 'r04', level: 1, emoji: '🐶',
    title: 'My Dog Sam',
    title_cn: '我的狗 Sam',
    paragraphs: [
      "This is my dog. His name is Sam. Sam is big. Sam can run fast. I love Sam."
    ],
    gist: '我有一只大狗叫 Sam，它跑得很快。',
    questions: [
      { q: '狗的名字是什么？', options: ['Tom', 'Sam', 'Max', 'Lucky'], answer: 1 },
      { q: '狗大还是小？', options: ['很大', '很小', '中等', '不知道'], answer: 0 },
      { q: '狗会做什么？', options: ['唱歌', '跳舞', '跑得快', '游泳'], answer: 2 },
    ]
  },
  {
    id: 'r05', level: 1, emoji: '🏫',
    title: 'I Go to School',
    title_cn: '我去上学',
    paragraphs: [
      "I am a girl. I am six. I go to school. I have a bag. I have a pen and a book."
    ],
    gist: '我是六岁的女孩，每天去上学。',
    questions: [
      { q: '我是男孩还是女孩？', options: ['男孩', '女孩', '不知道', '宝宝'], answer: 1 },
      { q: '我几岁？', options: ['五岁', '六岁', '七岁', '八岁'], answer: 1 },
      { q: '我有什么？', options: ['只有书', '只有笔', '书包、笔和书', '什么都没有'], answer: 2 },
    ]
  },
  {
    id: 'r06', level: 1, emoji: '👨‍👩‍👧',
    title: 'My Family',
    title_cn: '我的家人',
    paragraphs: [
      "I have a family. I have a mom. I have a dad. I have a sister. We are happy."
    ],
    gist: '我家有妈妈、爸爸、姐妹，我们很幸福。',
    questions: [
      { q: '我家有几个人（包括我）？', options: ['两个', '三个', '四个', '五个'], answer: 2 },
      { q: '我有兄弟还是姐妹？', options: ['兄弟', '姐妹', '都有', '都没有'], answer: 1 },
      { q: '我家人感觉怎么样？', options: ['难过', '生气', '高兴', '累'], answer: 2 },
    ]
  },
  {
    id: 'r07', level: 1, emoji: '🍞',
    title: 'Breakfast',
    title_cn: '早餐',
    paragraphs: [
      "It is morning. I am hungry. I eat bread. I drink milk. The bread is good. I like milk too."
    ],
    gist: '早上我吃面包喝牛奶。',
    questions: [
      { q: '现在是什么时间？', options: ['早上', '中午', '下午', '晚上'], answer: 0 },
      { q: '我吃什么？', options: ['米饭', '面包', '面条', '蛋糕'], answer: 1 },
      { q: '我喝什么？', options: ['水', '茶', '果汁', '牛奶'], answer: 3 },
    ]
  },
  {
    id: 'r08', level: 1, emoji: '🐰',
    title: 'A Cute Rabbit',
    title_cn: '可爱的兔子',
    paragraphs: [
      "Look at the rabbit. It is white. It is small. It has long ears. It is so cute!"
    ],
    gist: '一只白色的小兔子，有长长的耳朵，很可爱。',
    questions: [
      { q: '兔子是什么颜色？', options: ['黑色', '白色', '棕色', '灰色'], answer: 1 },
      { q: '兔子的耳朵怎么样？', options: ['很短', '很长', '没有', '一只'], answer: 1 },
      { q: '兔子大还是小？', options: ['很大', '很小', '中等', '不知道'], answer: 1 },
    ]
  },
  {
    id: 'r09', level: 1, emoji: '🌧️',
    title: 'Rainy Day',
    title_cn: '下雨天',
    paragraphs: [
      "It is raining today. The sky is gray. I stay at home. I read a book. I am okay."
    ],
    gist: '下雨天我在家看书。',
    questions: [
      { q: '今天天气怎么样？', options: ['晴天', '雨天', '雪天', '阴天'], answer: 1 },
      { q: '我去哪里？', options: ['学校', '公园', '商店', '家'], answer: 3 },
      { q: '我做什么？', options: ['看书', '画画', '唱歌', '跳舞'], answer: 0 },
    ]
  },
  {
    id: 'r10', level: 1, emoji: '🎂',
    title: 'My Birthday',
    title_cn: '我的生日',
    paragraphs: [
      "Today is my birthday. I am seven years old. Mom has a cake. The cake is big. Happy birthday to me!"
    ],
    gist: '今天是我七岁生日，妈妈做了一个大蛋糕。',
    questions: [
      { q: '今天是什么日子？', options: ['圣诞节', '新年', '我的生日', '妈妈的生日'], answer: 2 },
      { q: '我几岁了？', options: ['六岁', '七岁', '八岁', '九岁'], answer: 1 },
      { q: '蛋糕怎么样？', options: ['很小', '很大', '很丑', '没有蛋糕'], answer: 1 },
    ]
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  Level 2 · 50-100 词，简单情节
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'r11', level: 2, emoji: '🐶',
    title: "Tom's New Friend",
    title_cn: 'Tom 的新朋友',
    paragraphs: [
      "Tom is a boy. He is six. He has a new friend.",
      "His friend is a dog. The dog is small and brown. The dog has big eyes.",
      "Tom and the dog play in the park. They run fast. Tom is so happy."
    ],
    gist: 'Tom 有一只新朋友——一只棕色的小狗，他们在公园玩。',
    questions: [
      { q: 'Tom 的新朋友是谁？', options: ['一个男孩', '一个女孩', '一只狗', '一只猫'], answer: 2 },
      { q: '那只狗什么样？', options: ['大、黑色', '小、棕色', '小、白色', '大、棕色'], answer: 1 },
      { q: '他们在哪里玩？', options: ['学校', '家', '公园', '商店'], answer: 2 },
    ]
  },
  {
    id: 'r12', level: 2, emoji: '🌷',
    title: 'In the Garden',
    title_cn: '在花园里',
    paragraphs: [
      "I go to the garden with mom. I see many flowers.",
      "Some flowers are red. Some are yellow. Some are pink.",
      "I see a butterfly. The butterfly is on a flower. It is so beautiful!"
    ],
    gist: '我和妈妈去花园，看到很多颜色的花和一只蝴蝶。',
    questions: [
      { q: '我和谁去花园？', options: ['爸爸', '妈妈', '姐妹', '朋友'], answer: 1 },
      { q: '花有几种颜色？', options: ['一种', '两种', '三种', '四种'], answer: 2 },
      { q: '我还看到了什么？', options: ['鸟', '蝴蝶', '兔子', '猫'], answer: 1 },
    ]
  },
  {
    id: 'r13', level: 2, emoji: '🐼',
    title: 'A Day at the Zoo',
    title_cn: '动物园的一天',
    paragraphs: [
      "Today I go to the zoo with my family.",
      "I see a panda. It is black and white. It eats bamboo.",
      "I see a tiger. The tiger is big and orange. I see a monkey too. It is so funny!"
    ],
    gist: '我和家人去动物园，看到了熊猫、老虎和猴子。',
    questions: [
      { q: '熊猫是什么颜色？', options: ['黑白色', '黄色', '棕色', '绿色'], answer: 0 },
      { q: '老虎怎么样？', options: ['小、黑色', '大、橙色', '小、白色', '大、绿色'], answer: 1 },
      { q: '猴子怎么样？', options: ['很可怕', '很搞笑', '很大', '很小'], answer: 1 },
    ]
  },
  {
    id: 'r14', level: 2, emoji: '🍎',
    title: 'I Like Fruit',
    title_cn: '我喜欢水果',
    paragraphs: [
      "I like fruit. I like apples. Apples are red and sweet.",
      "I like bananas. Bananas are yellow and long.",
      "Mom says, \"Fruit is good for you.\" I eat fruit every day."
    ],
    gist: '我喜欢水果，每天都吃，妈妈说水果对身体好。',
    questions: [
      { q: '苹果是什么样？', options: ['红的、甜的', '黄的、酸的', '绿的、苦的', '黑的、咸的'], answer: 0 },
      { q: '香蕉是什么样？', options: ['红的、短的', '黄的、长的', '绿的、长的', '黄的、短的'], answer: 1 },
      { q: '妈妈说什么？', options: ['水果不好吃', '水果太贵', '水果对身体好', '水果太多'], answer: 2 },
    ]
  },
  {
    id: 'r15', level: 2, emoji: '🚗',
    title: 'Going to Grandma',
    title_cn: '去奶奶家',
    paragraphs: [
      "It is Sunday. We go to grandma's home.",
      "We go by car. The car is fast. I see trees and houses.",
      "Grandma is happy to see us. She gives me a big hug. She also gives me a cookie!"
    ],
    gist: '星期天我们开车去奶奶家，奶奶给了我一个大大的拥抱和饼干。',
    questions: [
      { q: '我们怎么去奶奶家？', options: ['走路', '坐公交', '开车', '骑自行车'], answer: 2 },
      { q: '路上看到什么？', options: ['花和草', '树和房子', '动物', '云和星'], answer: 1 },
      { q: '奶奶给我什么？', options: ['苹果', '蛋糕', '拥抱和饼干', '玩具'], answer: 2 },
    ]
  },
  {
    id: 'r16', level: 2, emoji: '🪁',
    title: 'My Kite',
    title_cn: '我的风筝',
    paragraphs: [
      "I have a new kite. The kite is blue. It has stars on it.",
      "Today is windy. Dad and I go to the park.",
      "I run. The kite goes up. It is high in the sky. I am so happy!"
    ],
    gist: '今天有风，我和爸爸去公园放新风筝，风筝飞得很高。',
    questions: [
      { q: '风筝是什么颜色？', options: ['红色', '蓝色', '黄色', '绿色'], answer: 1 },
      { q: '今天天气怎么样？', options: ['下雨', '晴天', '刮风', '下雪'], answer: 2 },
      { q: '风筝飞得怎么样？', options: ['很低', '很高', '掉了', '没飞起来'], answer: 1 },
    ]
  },
  {
    id: 'r17', level: 2, emoji: '🐟',
    title: 'Fish in the Water',
    title_cn: '水里的鱼',
    paragraphs: [
      "I go to the park with mom. I see a small lake.",
      "There are many fish in the water. The fish are red and yellow.",
      "The fish swim fast. I want to be a fish. I want to swim too!"
    ],
    gist: '我在公园看到红色和黄色的鱼游来游去，我也想像鱼一样游泳。',
    questions: [
      { q: '我在哪里看到鱼？', options: ['河里', '海里', '湖里', '游泳池'], answer: 2 },
      { q: '鱼是什么颜色？', options: ['黑白', '红黄', '蓝绿', '只有红色'], answer: 1 },
      { q: '我想做什么？', options: ['抓鱼', '吃鱼', '像鱼一样游泳', '画鱼'], answer: 2 },
    ]
  },
  {
    id: 'r18', level: 2, emoji: '🍰',
    title: "Mom's Cake",
    title_cn: '妈妈的蛋糕',
    paragraphs: [
      "Mom can make a good cake. Today she makes a cake for me.",
      "The cake is big. The cake is sweet. It has fruit on top.",
      "I say, \"Thank you, mom!\" Mom is happy. I love mom's cake!"
    ],
    gist: '妈妈给我做了一个又大又甜的水果蛋糕，我很开心。',
    questions: [
      { q: '妈妈做了什么？', options: ['饼干', '蛋糕', '面包', '面条'], answer: 1 },
      { q: '蛋糕怎么样？', options: ['小而苦', '大而甜', '小而甜', '大而咸'], answer: 1 },
      { q: '蛋糕上有什么？', options: ['水果', '糖', '巧克力', '冰淇淋'], answer: 0 },
    ]
  },
  {
    id: 'r19', level: 2, emoji: '🐦',
    title: 'A Little Bird',
    title_cn: '一只小鸟',
    paragraphs: [
      "I see a little bird in the tree. The bird is yellow.",
      "The bird can sing. It sings every morning.",
      "I open my window. The bird flies into my room. I give it some water. It is my friend."
    ],
    gist: '一只黄色的小鸟会唱歌，它飞进我的房间成了我的朋友。',
    questions: [
      { q: '鸟在哪里？', options: ['地上', '树上', '水里', '草丛'], answer: 1 },
      { q: '鸟是什么颜色？', options: ['黑色', '红色', '黄色', '绿色'], answer: 2 },
      { q: '鸟会做什么？', options: ['说话', '跳舞', '游泳', '唱歌'], answer: 3 },
    ]
  },
  {
    id: 'r20', level: 2, emoji: '🌙',
    title: 'Good Night',
    title_cn: '晚安',
    paragraphs: [
      "It is night. The sky is dark. I see the moon. The moon is white.",
      "I see many stars. They are very small.",
      "Mom says, \"Good night.\" I say, \"Good night, mom.\" I close my eyes. Sweet dreams!"
    ],
    gist: '晚上看到月亮和星星，妈妈和我互道晚安。',
    questions: [
      { q: '现在是什么时间？', options: ['早上', '中午', '下午', '晚上'], answer: 3 },
      { q: '月亮是什么颜色？', options: ['黄色', '白色', '红色', '蓝色'], answer: 1 },
      { q: '星星怎么样？', options: ['很大', '很小', '很多颜色', '看不到'], answer: 1 },
    ]
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  Level 3 · 100-150 词，含对话和情绪
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'r21', level: 3, emoji: '🎒',
    title: 'My First Day at School',
    title_cn: '我上学的第一天',
    paragraphs: [
      "Today is my first day at school. I am six years old. I am happy and a little scared.",
      "I have a new bag. I have a new pen and a new book.",
      "Mom takes me to school. \"Be a good girl,\" she says.",
      "In the class, I see many new friends. The teacher is nice. She says, \"Hello, kids!\"",
      "I say, \"Hello, teacher!\" School is fun!"
    ],
    gist: '我六岁第一天上学，有点紧张但遇到了好老师和新朋友，感觉学校很有趣。',
    questions: [
      { q: '我几岁？', options: ['五岁', '六岁', '七岁', '八岁'], answer: 1 },
      { q: '我感觉怎么样？', options: ['只是害怕', '只是高兴', '高兴又有点害怕', '不在乎'], answer: 2 },
      { q: '老师怎么样？', options: ['不友好', '很凶', '人很好', '太严了'], answer: 2 },
    ]
  },
  {
    id: 'r22', level: 3, emoji: '🦆',
    title: 'The Three Little Ducks',
    title_cn: '三只小鸭子',
    paragraphs: [
      "Mom Duck has three little ducks. The little ducks are yellow.",
      "One day, mom says, \"Let's go to the lake.\" The little ducks are very happy.",
      "They walk to the lake. The lake is big. The water is blue.",
      "The little ducks jump into the water. They can swim! Mom Duck is happy too.",
      "They swim and play. It is a good day."
    ],
    gist: '鸭妈妈带三只黄色小鸭去蓝色的湖游泳，大家都很开心。',
    questions: [
      { q: '鸭妈妈有几只小鸭子？', options: ['两只', '三只', '四只', '五只'], answer: 1 },
      { q: '小鸭子是什么颜色？', options: ['白色', '黄色', '黑色', '棕色'], answer: 1 },
      { q: '他们去哪里？', options: ['公园', '家', '湖', '树林'], answer: 2 },
    ]
  },
  {
    id: 'r23', level: 3, emoji: '🐱',
    title: 'A Cat and a Mouse',
    title_cn: '猫和老鼠',
    paragraphs: [
      "There is a cat. The cat is big and black. The cat is hungry.",
      "There is a mouse too. The mouse is small and gray. The mouse is scared.",
      "The mouse runs fast. The cat runs after the mouse.",
      "The mouse runs into a small hole. The cat cannot go in. The cat is sad.",
      "The mouse says, \"Bye, cat!\" The mouse is safe."
    ],
    gist: '一只大黑猫想抓灰色小老鼠，但老鼠跑进小洞躲起来了。',
    questions: [
      { q: '猫是什么样？', options: ['大、黑色', '小、白色', '大、灰色', '小、黑色'], answer: 0 },
      { q: '猫为什么追老鼠？', options: ['想玩', '生气', '饿了', '害怕'], answer: 2 },
      { q: '老鼠最后怎么样了？', options: ['被吃了', '被抓了', '安全了', '睡着了'], answer: 2 },
    ]
  },
  {
    id: 'r24', level: 3, emoji: '🍎',
    title: "Where's the Apple?",
    title_cn: '苹果在哪里？',
    paragraphs: [
      "Tom has a big red apple. He puts it on the desk.",
      "Tom goes out to play. He comes back. The apple is not there!",
      "Tom looks under the desk. No apple. He looks in the bag. No apple.",
      "He looks at his sister. His sister is eating an apple. \"Sister!\" Tom says.",
      "Sister says, \"Sorry, Tom. Here is one for you too.\" She gives Tom a new apple."
    ],
    gist: 'Tom 的苹果不见了，原来是姐妹吃了，但她又给了 Tom 一个新苹果。',
    questions: [
      { q: 'Tom 把苹果放在哪里？', options: ['椅子上', '床上', '桌子上', '书包里'], answer: 2 },
      { q: '苹果去哪了？', options: ['丢了', '被狗吃了', '姐妹吃了', '掉地上了'], answer: 2 },
      { q: '姐妹怎么做？', options: ['不理 Tom', '还给 Tom', '给 Tom 一个新的', '又拿了一个'], answer: 2 },
    ]
  },
  {
    id: 'r25', level: 3, emoji: '🐢',
    title: 'The Slow Turtle',
    title_cn: '慢慢的乌龟',
    paragraphs: [
      "There is a turtle. The turtle is small. The turtle is slow.",
      "A rabbit sees the turtle. The rabbit says, \"You are so slow! I am fast.\"",
      "The turtle says, \"I am slow but I do not stop. Let's run!\"",
      "The rabbit runs fast. The rabbit is tired. The rabbit sits down.",
      "The turtle walks and walks. The turtle wins! The rabbit is sad. The turtle is happy."
    ],
    gist: '兔子笑乌龟慢，比赛时兔子跑累了停下休息，乌龟一直走，最后乌龟赢了。',
    questions: [
      { q: '乌龟怎么样？', options: ['大、快', '小、慢', '大、慢', '小、快'], answer: 1 },
      { q: '兔子为什么停下来？', options: ['看花', '吃草', '累了', '迷路了'], answer: 2 },
      { q: '谁赢了？', options: ['兔子', '乌龟', '一起赢', '都没赢'], answer: 1 },
    ]
  },
  {
    id: 'r26', level: 3, emoji: '👵',
    title: "Visit Grandma",
    title_cn: '去看奶奶',
    paragraphs: [
      "It is Saturday. Lily and her mom go to see grandma.",
      "Grandma's home is in the country. They go by bus.",
      "Grandma sees Lily. She says, \"My sweet baby! Come in!\" Lily is so happy.",
      "Grandma has a big garden. There are many flowers. There are red, pink and yellow flowers.",
      "Grandma makes cookies. The cookies are sweet. Lily eats four cookies! \"Thank you, grandma!\" she says."
    ],
    gist: '星期六 Lily 和妈妈坐公交车去乡下看奶奶，奶奶的花园里有很多花，还做了甜饼干。',
    questions: [
      { q: '今天是星期几？', options: ['星期五', '星期六', '星期天', '星期一'], answer: 1 },
      { q: '她们怎么去奶奶家？', options: ['开车', '走路', '坐公交', '骑车'], answer: 2 },
      { q: 'Lily 吃了几个饼干？', options: ['两个', '三个', '四个', '五个'], answer: 2 },
    ]
  },
  {
    id: 'r27', level: 3, emoji: '🌧️',
    title: 'Rainy Sunday',
    title_cn: '雨天的星期天',
    paragraphs: [
      "It is Sunday. Tom wants to go to the park. But it is raining.",
      "Tom is sad. \"I want to go out!\" he says.",
      "Mom says, \"It's okay. We can stay at home.\"",
      "Mom and Tom read a book. They draw a picture. They sing a song.",
      "Tom is happy now. \"Mom, I love rainy Sunday too!\" he says."
    ],
    gist: '下雨的星期天 Tom 不能去公园很伤心，但妈妈陪他在家看书画画唱歌，他变开心了。',
    questions: [
      { q: '今天天气怎么样？', options: ['晴天', '雨天', '雪天', '刮风'], answer: 1 },
      { q: 'Tom 一开始什么心情？', options: ['高兴', '生气', '难过', '害怕'], answer: 2 },
      { q: '他们在家做了几件事？', options: ['一件', '两件', '三件', '四件'], answer: 2 },
    ]
  },
  {
    id: 'r28', level: 3, emoji: '🎈',
    title: 'A Red Balloon',
    title_cn: '一个红气球',
    paragraphs: [
      "Mary has a red balloon. The balloon is big and round. Mary loves the balloon.",
      "Mary takes the balloon to the park. She runs and plays.",
      "The wind blows. The balloon goes up! It goes up high!",
      "Mary is sad. She cries. A boy sees her. The boy gives Mary a new balloon. It is yellow.",
      "Mary smiles. \"Thank you!\" she says. \"You are my friend!\""
    ],
    gist: 'Mary 的红气球被风吹走了，一个男孩送她一个黄气球，他们成了朋友。',
    questions: [
      { q: 'Mary 的气球什么颜色？', options: ['黄色', '红色', '蓝色', '粉色'], answer: 1 },
      { q: '气球怎么了？', options: ['破了', '被风吹走', '掉地上', '被抢了'], answer: 1 },
      { q: '男孩做了什么？', options: ['笑话她', '帮她找', '给她新气球', '走开了'], answer: 2 },
    ]
  },
  {
    id: 'r29', level: 3, emoji: '🎄',
    title: 'A Big Surprise',
    title_cn: '一个大惊喜',
    paragraphs: [
      "Today is Tom's birthday. He is seven.",
      "Tom comes home from school. The room is dark.",
      "Tom opens the lights. Surprise! Mom, dad and friends are there. They sing, \"Happy birthday!\"",
      "There is a big cake on the desk. There are seven candles.",
      "Tom blows the candles. He makes a wish. \"This is the best day!\" he says. He is so happy."
    ],
    gist: 'Tom 七岁生日，回家发现妈妈爸爸和朋友给他准备了惊喜派对，他许了愿吹了蜡烛，非常开心。',
    questions: [
      { q: 'Tom 几岁了？', options: ['六岁', '七岁', '八岁', '九岁'], answer: 1 },
      { q: '回家时房间怎么样？', options: ['很亮', '很暗', '空着', '没人'], answer: 1 },
      { q: '蛋糕上有几支蜡烛？', options: ['五支', '六支', '七支', '八支'], answer: 2 },
    ]
  },
  {
    id: 'r30', level: 3, emoji: '🌈',
    title: 'After the Rain',
    title_cn: '雨后',
    paragraphs: [
      "It rains all morning. Lily stays at home. She is bored.",
      "After lunch, the rain stops. Lily looks out of the window.",
      "\"Mom! Mom! Look!\" Lily says. There is a beautiful rainbow in the sky.",
      "The rainbow has many colors. Red, orange, yellow, green, blue, and pink.",
      "\"It's so beautiful!\" Lily says. Mom says, \"Yes, baby. After the rain, we have a rainbow.\" Lily smiles. She is not bored now."
    ],
    gist: '下了一上午雨 Lily 很无聊，雨停后看到美丽的彩虹，妈妈说雨后才有彩虹，Lily 不再无聊了。',
    questions: [
      { q: '上午做了什么？', options: ['出去玩', '在家无聊', '上学', '看书'], answer: 1 },
      { q: 'Lily 在窗外看到什么？', options: ['彩虹', '太阳', '云', '小鸟'], answer: 0 },
      { q: '彩虹有几种颜色？', options: ['三种', '四种', '五种', '六种'], answer: 3 },
    ]
  },
];

window.READING = READING;
