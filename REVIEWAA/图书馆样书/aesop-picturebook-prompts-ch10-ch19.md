# 伊索绘本 ch10–ch19 · 生图提示词总表

**日期**：2026-07-26 ｜ **画风基准**：卡通彩色（ch8 起）｜ **共 30 张（10 章 × 3 页）**

已上线 ch1–ch9（27 张）。本文档覆盖接下来 10 章。

---

## 一、通用块（每一张都要带上）

### 风格锁

```
bright colourful cartoon illustration for a children's picture book,
clean smooth shapes, bold clear outlines, cheerful saturated colours,
soft even shading, warm friendly lighting, modern storybook cartoon style
```

### 造型锁

```
IMPORTANT — character design is cute and appealing: rounded heads, large
round expressive eyes, short blunt snouts, soft plump rounded bodies,
small neat paws, friendly readable facial expressions
```

### 通用禁止

```
watercolour texture, paper grain, paint washes, sketchy brush strokes,
realistic animal anatomy, pointed sharp snout, beady eyes, visible sharp
teeth, scraggly fur, wildlife illustration, scientific illustration,
creepy, ugly, grimy, dark or gloomy mood, gore, blood, wounds,
3D render, CGI, photorealistic, any text or letters or watermark
```

### 技术规格

- **1200×900，严格 4:3**（容器写死 4:3 + `object-cover`，比例不符会被裁）
- 主体居中，四周留约 10% 安全边距
- 画面内不得出现任何文字、字母、水印
- 命名 `aesop_ch{NN}_p1.jpg` / `p2` / `p3`，放 `scripts\library\illustrations-in\aesop\`

### ⏱️ 时序铁律（已踩三次）

**每页画的必须正好是这页文字讲的那一刻**，不能提前也不能滞后。

- ch3 曾画成狐狸**够到**葡萄 → 寓意反转
- ch2 曾图整体**慢一拍**（文字写"被网困住吼叫"却画成大笑）
- ch9 曾图**快半拍**（奶酪已在半空，可"奶酪掉了"是下一页的文字）

---

## 二、角色册（复用，保持全书一致）

| 角色 | 描述 | 出处 |
|---|---|---|
| 狐狸 | `slender orange-red fox, white chest and throat, black stockings on all four legs, bushy tail with a white tip, amber eyes` | ch3 定稿 |
| 老鼠 | `small round grey mice, big round eyes, short blunt noses, large pink inner ears, tiny pink paws, long pink tails` | ch2/ch8 定稿 |
| 乌鸦 | `glossy black crow with a stout beak and bright eyes` | ch9 定稿 |
| 农人 | `plain country clothing in muted earth tones, brown tunic and cap, kind ordinary face, not a caricature` | ch5/ch7 定稿 |

新角色在各章内首次出现时定义，之后同章三页保持一致。

---

## 三、逐章提示词

---

### ch10 《狼与羊羔》 The Wolf and the Lamb — 10 句 → **2 / 6 / 2**

| 页 | 句 | 内容 |
|---|---|---|
| p1 | 1–2 | 狼撞见离群羊羔，不想毫无理由下手，去找借口 |
| p2 | 3–8 | 三轮指控与反驳（去年侮辱／吃我草／喝我水） |
| p3 | 9–10 | 「反正我不会为这个饿着肚子」，有没有理由都一样 |

**⚠️ 全书年龄适宜性最吃紧的一章。** 原文句 10 明写 `He sprang on the lamb and ate it`。
**第 3 页采用「空镜」处理**（沿用 ch5 空鹅窝的成功打法）。若你想改成「定格在扑击前」，
把 p3 换成备选方案即可 —— 但那仍会呈现"步步逼近、小羊无路可退"的压迫感，不推荐。

**本章角色**
```
the wolf: a large grey cartoon wolf with a rounded head, thick fur, amber
eyes — stern and sly, NOT monstrous or frightening
the lamb: a very small fluffy white lamb with big innocent dark eyes,
soft rounded body, tiny hooves
```

**p1**
```
A clear shallow stream running through a green meadow. On one bank a large
grey wolf stands still, looking across the water at a very small fluffy
white lamb on the opposite bank. The lamb has strayed from its flock, which
is visible far away in the background. The wolf's expression is calculating
and sly, as if searching for an excuse rather than simply attacking. There
is a clear stretch of water between them.
```
**禁止**：`the wolf touching or lunging at the lamb, the wolf baring teeth, snarling, the lamb bleeding or injured, the wolf on the same bank as the lamb, any predatory pounce, blood`

**p2**
```
The same stream. The wolf leans forward from his bank with one paw raised,
mouth open in accusation, brows drawn down. Across the water the little
lamb stands its ground, head tilted up, mouth open in earnest reply, one
tiny hoof lifted as if explaining. The two are clearly arguing across the
water. The stream still separates them completely.
```
**禁止**：`the wolf crossing the stream, the wolf touching the lamb, physical contact of any kind, bared fangs, the lamb crying or terrified, blood`

**p3 —— 空镜（推荐方案）**
```
The same stretch of stream bank, now completely empty. No animals are
present. On the trodden grass by the water there are a few small tufts of
white wool and a line of wolf paw prints leading away from the bank into
the distance. Late afternoon light, quiet and still, muted colours.
```
**禁止**：`the wolf, the lamb, any animal at all, any body or remains, blood, red stains, torn flesh, bones, a chase or struggle, any text`

> 🔴 **这一页的意义是"结束了"，靠空和痕迹说话。画面里不能有任何动物。**

**p3 备选（若你选「定格在扑击前」）**
```
The wolf has crossed to the lamb's bank and takes one step forward, head
lowered. The little lamb backs away to the very edge of the bank, nowhere
left to go. The moment is frozen BEFORE any contact — the wolf has not
touched the lamb.
```
**额外禁止**：`any contact between wolf and lamb, the wolf pouncing or leaping, open jaws near the lamb, blood`

---

### ch11 《败家子与燕子》 The Spendthrift and the Swallow — 4 句 → **1 / 1 / 2**

| 页 | 句 | 内容 |
|---|---|---|
| p1 | 1 | 花光了钱、只剩身上衣服的人，早春晴日看见一只燕子 |
| p2 | 2 | 认定夏天到了，把外套卖了 |
| p3 | 3–4 | 霜冻来了，燕子冻死，他自己也冻得发抖 |

**⚠️ 第 3 页有一只死去的燕子。** 处理方式：**远景小景、不特写、不表现死状细节**，
画面重心放在冻得发抖的人身上。

**本章角色**
```
the spendthrift: a thin young man in a worn shirt and patched trousers,
no coat, tousled hair, an easily-pleased optimistic face
the swallow: a small blue-and-white swallow with a forked tail
```

**p1**
```
A bright early-spring morning on a village street. A thin young man in a
worn shirt and an old coat looks up with a delighted grin at a single
swallow flying across the clear blue sky above the rooftops. Bare trees are
just beginning to bud. He looks convinced that summer has arrived.
```
**禁止**：`snow, frost, winter, many birds, the man wealthy or well dressed, any text`

**p2**
```
A village market stall. The same young man hands over his old coat to a
stallholder and receives a few small coins in return, looking pleased with
his own cleverness. He now stands in only his shirt. The sky above is still
bright and spring-like.
```
**禁止**：`snow, frost, the man looking cold or regretful, the man keeping the coat, a swallow in the scene, any text`

**p3**
```
The same village street, now covered in a hard white frost under a pale
grey sky. The young man stands in the middle of the road in only his thin
shirt, arms wrapped tightly around himself, hunched and shivering, his face
full of regret. Some distance away on the frosted ground lies a small
swallow, seen from far off, tiny in the frame, simply still. The composition
centres on the shivering man, not on the bird.
```
**禁止**：`a close-up of the bird, the bird large in frame, any detail of injury or decay, blood, the man holding the bird, snow falling heavily, a gloomy horror mood, any text`

---

### ch12 《墨丘利与樵夫》 Mercury and the Woodman — 12 句 → **2 / 5 / 5**

| 页 | 句 | 内容 |
|---|---|---|
| p1 | 1–2 | 斧子脱手掉进河里，樵夫发愁，墨丘利现身 |
| p2 | 3–7 | 金斧、银斧都说不是，第三次才是自己的；诚实获赠三把 |
| p3 | 8–12 | 同伴眼红效仿，抢认金斧，墨丘利连他原来的斧子也不还 |

**本章角色**
```
the honest woodman: a sturdy middle-aged countryman in a plain brown tunic,
open honest face
Mercury: a friendly young god in a short white-and-gold tunic with a small
winged cap and winged sandals, gentle authoritative expression, a soft
golden glow around him
the greedy friend: a wiry younger countryman with a sly narrow-eyed look
```

**p1**
```
A wooded riverbank. A sturdy woodman in a brown tunic stands at the water's
edge looking down at the river in dismay, empty hands open, his axe gone.
A half-cut tree stands beside him. Rising from the water in a soft golden
glow is Mercury, a friendly young god in a short white-and-gold tunic with
a small winged cap, asking what is wrong.
```
**禁止**：`the axe visible in the woodman's hands, gold or silver axes yet, the woodman looking greedy, any text`

**p2**
```
The same riverbank. Mercury stands in the shallows holding up a gleaming
GOLDEN axe in one hand and a shining SILVER axe in the other, offering them
to the woodman. The woodman shakes his head with both palms raised in
polite refusal, his own plain wooden-handled iron axe lying on the bank
beside him. His expression is honest and a little embarrassed. Mercury looks
warmly impressed.
```
**禁止**：`the woodman reaching for the gold or silver axe, the woodman looking tempted or greedy, Mercury looking angry, any text`

**p3**
```
The same riverbank, a different day. A wiry younger countryman with a sly
face lunges forward with both hands outstretched toward a golden axe that
Mercury is holding up out of his reach. Mercury has turned his face away in
clear distaste and is drawing the axe back. The greedy man's own plain axe
is nowhere to be seen — only the river behind him. He looks desperate and
grasping.
```
**禁止**：`the greedy man receiving or holding the golden axe, Mercury smiling at him, the greedy man's own axe being returned, violence, any text`

---

### ch13 《乌鸦与水罐》 The Crow and the Pitcher — 3 句 → **1 / 1 / 1**

| 页 | 句 | 内容 |
|---|---|---|
| p1 | 1 | 口渴的乌鸦找到水罐，水太浅，嘴怎么伸都够不着 |
| p2 | 2 | 眼看要在水跟前渴死 |
| p3 | 3 | 一颗颗投石子，水位升高，终于喝到 |

**p1**
```
A sunny dry yard. A glossy black crow stands beside a tall narrow clay
pitcher, her beak pushed down into the opening as far as it will go. A
cutaway hint shows only a shallow layer of water far down at the bottom of
the pitcher, well below her reach. Her posture is straining and frustrated.
```
**禁止**：`the crow drinking, the water near the top, pebbles in the scene, the pitcher broken or tipped over, any text`

**p2**
```
The same yard, harsh midday sun. The crow stands back from the pitcher with
her wings drooping and her head lowered, exhausted and defeated, beak open
in thirst. The pitcher sits beside her, the water still far down inside and
out of reach. Dry cracked ground and a very hot, bright sky.
```
**禁止**：`the crow drinking, pebbles in the scene, the crow dead or lying down, the crow tipping the pitcher, any text`

**p3**
```
The same yard. The crow drops a small pebble from her beak into the mouth
of the pitcher. Several pebbles are already inside and a small pile of
pebbles lies on the ground beside her. The water has risen close to the top
of the pitcher and is now within easy reach. The crow looks bright and
purposeful.
```
**禁止**：`the pitcher broken or tipped, the crow using a stick or straw, the water still low, any text`

---

### ch14 《北风与太阳》 The North Wind and the Sun — 9 句 → **2 / 3 / 4**

| 页 | 句 | 内容 |
|---|---|---|
| p1 | 1–2 | 北风与太阳争谁更强，定下比试：谁能让旅人脱下斗篷 |
| p2 | 3–5 | 北风猛吹，旅人反而把斗篷裹得更紧 |
| p3 | 6–9 | 太阳温暖，旅人解开、脱下斗篷，轻松上路 |

**本章角色**
```
the North Wind: a cartoon face formed in swirling blue-grey clouds with
puffed cheeks, cheerful-fierce rather than scary
the Sun: a warm smiling golden sun face in the sky
the traveler: a countryman in a heavy brown hooded cloak, walking with a
stick along a country road
```

**p1**
```
A country road seen from above. High in the sky on the left, the North Wind
appears as a cartoon face in swirling blue-grey clouds with puffed cheeks.
On the right, the Sun is a warm smiling golden face. The two look across at
each other in friendly rivalry. Far below on the road, a small traveler in a
heavy brown hooded cloak walks along with a stick, unaware of them.
```
**禁止**：`the cloak coming off, the traveler cold or hot yet, either figure looking evil or frightening, any text`

**p2**
```
The same road. The North Wind blows down with all his force — strong swirling
gusts, bent trees, flying leaves, the traveler's hair whipping. The traveler
grips his cloak with both hands and pulls it TIGHTER around himself, head
down, leaning into the wind. The Sun watches quietly from behind a cloud.
```
**禁止**：`the cloak coming off or blowing away, the traveler letting go, rain or snow, the traveler falling over or hurt, any text`

**p3**
```
The same road, now bathed in warm golden sunshine. The Sun beams brightly
overhead. The traveler has taken his heavy cloak COMPLETELY OFF and carries
it folded over one arm, wiping his brow with the other hand and smiling as
he walks on. The North Wind has shrunk to a small sulking cloud in the far
corner of the sky.
```
**禁止**：`the traveler still wearing the cloak, the cloak on his shoulders, strong wind, the traveler looking cold, any text`

---

### ch15 《兔子与青蛙》 The Hares and the Frogs — 5 句 → **2 / 2 / 1**

| 页 | 句 | 内容 |
|---|---|---|
| p1 | 1–2 | 兔子聚在一起诉苦，四面都是危险 |
| p2 | 3–4 | 一群兔子朝水塘跑去，塘边青蛙受惊纷纷跳进水里 |
| p3 | 5 | 老兔停住：「这儿还有怕我们的东西呢」 |

**⚠️ 原文句 3 是集体自尽的念头。** 画面**只表现"一群兔子朝水塘奔跑"**，
绝不表现投水、溺水、绝望赴死。第 2 页的重心是**青蛙被吓得跳水**这个转折。

**本章角色**
```
the hares: soft brown cartoon hares with long ears, big round worried eyes,
plump rounded bodies
the old hare: a larger grey-brown hare with a calm wise face
the frogs: small bright green cartoon frogs with big round eyes
```

**p1**
```
A grassy clearing at dusk. A group of soft brown hares sits huddled together
in a circle, ears drooping, big round eyes worried, several looking over their
shoulders. The mood is anxious and downcast. In the darker background,
suggested only as distant silhouettes, are the shapes of a dog and a bird of
prey far away on the horizon.
```
**禁止**：`any predator close to the hares, an attack, chasing, injured or dead hares, blood, a pool or water in the scene, any text`

**p2**
```
A grassy pond bank. A crowd of brown hares comes running together toward the
pond, ears back, in a loose bunch. On the near bank a group of small bright
green frogs is startled by the noise and leaps into the water, mid-jump,
splashes rising. The frogs are the focus of the moment. The hares are still
on the grass, several body-lengths from the water's edge.
```
**禁止**：`hares entering the water, hares jumping into the pond, hares drowning or submerged, any hare in distress in water, a sad or despairing mood, any text`

**p3**
```
The same pond bank. A larger grey-brown old hare has stopped short and turned
to face the others with one paw raised, calling out, his expression calm and
dawning with realisation. The other hares have halted around him and are
looking where he points — at the ripples and the last frog disappearing into
the water. The mood has lifted from despair to surprise.
```
**禁止**：`any hare in the water, a despairing mood, the old hare scolding angrily, any text`

---

### ch16 《狐狸与鹳》 The Fox and the Stork — 4 句 → **2 / 1 / 1**

| 页 | 句 | 内容 |
|---|---|---|
| p1 | 1–2 | 狐狸请客只上一道汤，盛在浅平盘里；他舔得香，鹳一口够不着 |
| p2 | 3 | 鹳回请，端出细长颈的瓶子，她的喙轻松伸进去 |
| p3 | 4 | 她吃得很好，狐狸在旁饿着，饭在眼前一口够不着 |

**本章角色**
```
the fox: 见角色册
the stork: a tall white stork with a very long slender orange bill, long
orange legs, big friendly eyes
```

**p1**
```
A cosy little dining table outdoors. The fox laps happily from a WIDE, FLAT,
SHALLOW dish of soup, tongue out, enjoying himself. Across the table the tall
white stork tries to reach the soup in an identical wide flat dish, but her
very long slender bill only touches the flat surface and cannot scoop
anything up. She looks politely frustrated. The fox glances at her with a
sly amused grin.
```
**禁止**：`the stork successfully eating, a tall or narrow vessel, the stork angry or shouting, the fox being polite or apologetic, any text`

**p2**
```
A different table, at the stork's home. The stork stands beside a tall
pitcher with a LONG NARROW NECK and slides her long slender bill easily down
into it, eating comfortably with a serene expression. The fox sits opposite,
watching the pitcher, beginning to realise.
```
**禁止**：`a wide flat dish, the fox eating, the fox reaching into the pitcher, any text`

**p3**
```
The same table. The stork eats contentedly from the tall narrow-necked
pitcher. Beside her the fox sits with his empty bowl-less place, staring at
the pitcher, his nose almost touching the narrow opening but his broad muzzle
far too wide to fit inside. His stomach is visibly empty and his expression is
hungry and rueful. The food is in plain sight and completely out of reach.
```
**禁止**：`the fox eating or drinking any of it, the fox knocking the pitcher over, the fox angry or violent, the stork gloating cruelly, any text`

---

### ch17 《挤奶女孩与奶桶》 The Milkmaid and Her Pail — 7 句 → **1 / 4 / 2**

| 页 | 句 | 内容 |
|---|---|---|
| p1 | 1 | 挤完奶顶桶回家，心思飘了起来 |
| p2 | 2–5 | 幻想链条：奶油→黄油→鸡蛋→小鸡→新裙子→集市上把头一扬 |
| p3 | 6–7 | 她真把头一扬，桶掉了，一切跟着没了 |

**本章角色**
```
the milkmaid: a cheerful young farm girl in a simple blue dress and white
apron, hair tied back, carrying a wooden pail balanced on her head
```

**p1**
```
A country lane between green fields in the morning. A cheerful young farm
girl in a blue dress and white apron walks along with a wooden pail of milk
balanced on her head, one hand steadying it lightly, her eyes dreamy and
far away.
```
**禁止**：`the pail falling or tilting, spilled milk, thought bubbles yet, any text`

**p2**
```
The same lane. The milkmaid walks on with the pail on her head, smiling to
herself. Above and around her, four soft dreamy thought-bubbles float in the
air showing what she imagines, in order: a churn of butter, a basket of eggs,
a yard full of fluffy chickens, and herself in a pretty new dress at a fair.
The bubbles are light and cloud-like, clearly imaginary.
```
**禁止**：`the pail falling, spilled milk, the girl tossing her head, any text or letters inside the bubbles`

**p3**
```
The same lane. The milkmaid has just tossed her head back proudly — and the
wooden pail has tipped off and is falling, milk pouring out in a bright arc
onto the dusty road. Her expression flips to shock and dismay, hands flying
up too late. The dreamy thought-bubbles are breaking apart and fading into
wisps in the air around her.
```
**禁止**：`the girl injured or crying on the ground, the pail intact on her head, an intact thought-bubble, a mean or mocking tone, any text`

---

### ch18 《海豚、鲸与小鲱鱼》 The Dolphins, the Whales, and the Sprat — 4 句 → **2 / 1 / 1**

| 页 | 句 | 内容 |
|---|---|---|
| p1 | 1–2 | 海豚和鲸闹翻打了起来，凶且久，不见尽头 |
| p2 | 3 | 一条小鲱鱼游到两边中间开始讲和 |
| p3 | 4 | 「宁可打到一个不剩，也不要被你这么条小鲱鱼劝下来」 |

**本章角色**
```
the dolphins: sleek grey cartoon dolphins with friendly rounded faces
the whales: large blue-grey cartoon whales with big round eyes
the sprat: a tiny silver fish with big earnest eyes, comically small next
to the others
```

**p1**
```
An underwater scene in blue-green sea. On the left a group of sleek grey
dolphins, on the right a group of large blue-grey whales, facing off in two
lines with churning water and rising bubbles between them. Both sides look
angry and stubborn, mid-quarrel. The confrontation is dramatic but
cartoonish — no injuries anywhere.
```
**禁止**：`blood, wounds, injured or dead animals, gore, genuinely violent impact, a frightening mood, any text`

**p2**
```
The same underwater scene. A tiny silver sprat has swum right into the gap
between the two sides, fins spread wide, mouth open, earnestly making the
case for peace. He is comically small compared with the dolphins and whales
looming on either side of him. Both sides pause to look down at him.
```
**禁止**：`the sprat being hurt or swallowed, blood, the sprat looking frightened, any text`

**p3**
```
The same scene. One of the dolphins leans down close to the tiny sprat with a
proud dismissive expression, speaking to him, while the whales behind turn
their backs and square up again. The sprat floats there, small and
crestfallen, his peace-making refused. The two sides remain apart and unmoved.
```
**禁止**：`the two sides making peace, the sprat succeeding, the sprat harmed, blood, any text`

---

### ch19 《驴与哈巴狗》 The Donkey and the Lapdog — 9 句 → **3 / 4 / 2**

| 页 | 句 | 内容 |
|---|---|---|
| p1 | 1–3 | 驴有棚有草料，日子不差；哈巴狗是主人的心头肉，被抱在腿上、带好吃的 |
| p2 | 4–7 | 驴干活、越比越不平，挣断缰绳冲进屋学狗撒欢，掀翻桌子，想爬主人腿上 |
| p3 | 8–9 | 仆人把他赶回棚里；「我有正经活干、有自己的棚，却偏想去当哈巴狗」 |

**⚠️ 原文句 8 是仆人用棍棒把驴打得半死。** 第 3 页**只画结果不画殴打**：
驴已回到棚里、灰头土脸；仆人拿着棍子站在远处门口，**不得表现击打动作**。

**本章角色**
```
the donkey: a sturdy grey cartoon donkey with long ears, big gentle eyes,
a rounded friendly face
the lapdog: a small fluffy white lapdog with a curly tail and a red collar
the master: a comfortable middle-aged countryman in a brown coat
```

**p1**
```
A split view of a farmhouse. On the left, inside the warm room, a comfortable
middle-aged master sits in a chair with a small fluffy white lapdog on his
lap, stroking it while it wags its curly tail happily. On the right, outside
in a clean stable, a sturdy grey donkey with long ears stands beside a full
manger of hay and oats, watching the window with a thoughtful look.
```
**禁止**：`the donkey angry or aggressive, the donkey in the house, the dog being mistreated, any violence, any text`

**p2**
```
Inside the farmhouse dining room, chaos. The grey donkey has burst in with a
snapped halter rope trailing from his neck and is prancing awkwardly on his
hind legs in a clumsy imitation of the lapdog, front hooves in the air. The
dinner table has been knocked over behind him, plates and bowls tumbling and
smashing on the floor. The master rears back in his chair with his arms up in
alarm. The little lapdog scurries aside in surprise.
```
**禁止**：`anyone being hurt or bleeding, the donkey crushing the master, servants hitting the donkey, sticks or clubs in use, a frightening mood, any text`

**p3**
```
The stable yard afterwards, in the evening. The grey donkey stands back in
his own stall, head hanging low, ears drooping, dusty and dishevelled, looking
at his full manger of hay with a rueful expression. In the far background, at
the distant farmhouse door, two servants stand holding sticks lowered at their
sides, already turning to go back inside. Nobody is striking anybody. Quiet,
calm, subdued light.
```
**禁止**：`servants hitting or raising sticks at the donkey, the donkey injured wounded or bleeding, the donkey lying down or half dead, any blow in progress, a cruel mood, any text`

---

## 四、待你拍板的一处

**ch10 第 3 页**：默认用**空镜**（岸边几缕羊毛 + 一串狼脚印，无任何动物）。
若你要改成「定格在扑击前」，用文档里给的备选段落替换即可。

其余 9 章的敏感处理（ch11 死燕子远景不特写、ch15 不画投水、ch19 不画殴打）
均已内建在提示词里，无需额外决定。

---

## 五、交付方式

出好后放 `scripts\library\illustrations-in\aesop\`，命名 `aesop_ch{NN}_p{N}.jpg`。
可以一章一章给，也可以攒几章一起给 —— 我按章验收，**任何一张不过，该章整批停，不入库**。
