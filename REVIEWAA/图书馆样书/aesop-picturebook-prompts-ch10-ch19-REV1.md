# 伊索绘本 ch10–ch19 · 修订版提示词（REV1）

**日期**：2026-07-26 ｜ **针对**：第一批 30 张的验收结果 ｜ **需重出 21 张，可保留 9 张**

第一批优点：**尺寸 30 张全是 1200×900 精确 4:3，零缺失**。问题集中在四类：
生成瑕疵（4 处）、时序/寓意反转（3 处）、角色跨页不一致（3 章）、血（1 处）。

---

## 〇、先看这张表：哪些要重出

| 章 | p1 | p2 | p3 | 说明 |
|---|---|---|---|---|
| ch10 狼与羊羔 | ✅ 保留 | ✅ 保留 | 🔴 重出 | p3 有血 |
| ch11 败家子与燕子 | 🔴 重出 | 🔴 重出 | 🔴 重出 | 三页发色不一，需统一 |
| ch12 墨丘利与樵夫 | 🔴 重出 | 🔴 重出 | 🔴 重出 | 时序 + 银斧 + 角色三个样 |
| ch13 乌鸦与水罐 | 🔴 重出 | 🔴 重出 | 🔴 重出 | p3 重影 + 罐子三页不一 |
| ch14 北风与太阳 | 🔴 重出 | ✅ 保留 | 🔴 重出 | p1 柏油路 / p3 斗篷没脱 |
| ch15 兔子与青蛙 | ✅ 保留 | 🔴 重出 | ✅ 保留 | p2 有兔头蛙身合成怪 |
| ch16 狐狸与鹳 | 🔴 重出 | 🔴 重出 | 🔴 重出 | 容器形制错 + 骨手 + 多余食物 |
| ch17 挤奶女孩 | 🔴 重出 | 🔴 重出 | 🔴 重出 | 发色不一 + 缺新裙子 + p3 表情反了 |
| ch18 海豚鲸小鲱鱼 | 🔴 重出 | 🔴 重出 | ⬜ 未看 | 海豚糊成一堆 + 缺鲸群 + 不像在打 |
| ch19 驴与哈巴狗 | ⬜ 未看 | 🔴 重出 | ✅ 保留 | p2 双头驴。**p3 是全批最佳，务必保留** |

⬜ = 我没打开（同章其他页已需重出，先不占用你的时间）。若重出该章其他页，
建议把未看的那张也一并重出以保证角色一致。

---

## 一、通用块（**每一张**都要带，含本次新增）

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

### 🆕 通用禁止（**新增第一段，这次栽了 4 次**）

```
duplicate subjects, the same character appearing twice, two heads, extra
limbs, extra eyes, merged or fused creatures, hybrid animals, cloned
figures, overlapping bodies blending into each other, deformed anatomy,
skeletal or bony hands, malformed paws,

watercolour texture, paper grain, paint washes, sketchy brush strokes,
realistic animal anatomy, pointed sharp snout, beady eyes, visible sharp
teeth, scraggly fur, wildlife illustration, scientific illustration,
creepy, ugly, grimy, dark or gloomy mood, gore, blood, wounds, red stains,

asphalt road, tarmac, painted road markings, modern vehicles, power lines,
modern clothing, modern buildings,

3D render, CGI, photorealistic, any text or letters or watermark
```

### 技术规格

- **1200×900，严格 4:3**（这一条上一批做得很好，保持）
- 主体居中，四周留约 10% 安全边距
- 命名 `aesop_ch{NN}_p{N}.jpg`，放 `scripts\library\illustrations-in\aesop\`

### ⏱️ 时序铁律

**每页画的必须正好是这页文字讲的那一刻**——不能提前，不能滞后，不能把下一页的事画进来。

### 🆕 角色一致铁律

**每一页的提示词里都要原样重复贴该章的角色描述块。** 批量生成时每张图独立起稿，
角色不会自动延续——ch11 主角发色三页三变、ch12 墨丘利三页三个样，都是这么来的。

---

## 二、逐章修订

---

### ch10 《狼与羊羔》 — 只重出 p3

**p1、p2 保留，不要动。**

**p3（空镜）**
```
An empty stretch of green stream bank in a meadow, late afternoon. NO
ANIMALS ANYWHERE in the picture — no wolf, no lamb, no sheep, nothing
alive. On the trodden grass beside the water lie a few small tufts of
white wool, and a line of wolf paw prints leads away from the bank into
the distance. Quiet, still, softly muted colours.
```
**额外禁止（务必原样带上）**
```
blood, red stains, any red marks on the ground or in the water, any animal,
any wolf, any lamb, any sheep, any body or remains, bones, fur with blood,
a struggle, a chase
```

> 🔴 上一版右下角出现了几摊红色。**这一页一滴红都不能有**，也不能出现任何动物。

---

### ch11 《败家子与燕子》 — 三页全重出（统一角色）

**本章角色块（三页都贴）**
```
the same young man in all three pictures: a thin young man with SHORT
DARK-BROWN untidy hair and a friendly open face, wearing a loose cream
linen shirt and brown trousers; in pictures one and two he also wears a
worn brown coat over the shirt
the swallow: a small blue-and-white swallow with a forked tail
```

**p1（句1）**
```
A bright early-spring morning on a village street of old cottages. The
young man, wearing his worn brown coat, looks up with a delighted grin at
a single swallow flying across the clear sky. Bare trees are just
beginning to bud.
```
**额外禁止**：`snow, frost, many birds, the man without his coat`

**p2（句2）**
```
A village market stall. The young man hands his brown coat across to a
stallholder and takes a couple of small copper coins in return, pleased
with himself. He now stands in only his cream linen shirt. Bright
spring sky.
```
**额外禁止**：`the man still wearing the coat, snow or frost, the man bare-chested or in a sleeveless top, gold coins, piles of treasure`

**p3（句3-4）**
```
The same village street under a hard white frost and a pale grey sky. The
young man stands in the road in only his thin cream linen shirt — SHIRT
FULLY ON, sleeves covering his arms — hugging himself tightly, hunched
and shivering, his face full of regret. Some distance away on the frosted
ground lies a small swallow, tiny in the frame, simply still. The
composition centres on the shivering man.
```
**额外禁止**：`the man bare-chested, sleeveless, or half naked, a close-up of the bird, the bird large in frame, any injury or decay, blood, the man holding the bird`

---

### ch12 《墨丘利与樵夫》 — 三页全重出

**本章角色块（三页都贴，上一版三页三个样）**
```
the same Mercury in all three pictures: a friendly ADULT young man with
short brown hair and NO beard, wearing a short white tunic with gold trim,
a small round cap with SMALL WHITE WINGS at the temples, winged sandals,
and a soft golden glow around him
the same honest woodman in pictures one and two: a sturdy middle-aged man
with a full GREY beard, wearing a sleeveless brown tunic and a leather belt
the greedy friend in picture three: a wiry YOUNGER man, clean-shaven, in a
patched grey-brown tunic, with a sly narrow-eyed look
```

**p1（句1-2）— 时序：斧子已在水里，金斧还没出现**
```
A wooded riverbank. The grey-bearded woodman stands at the water's edge
with BOTH HANDS EMPTY and open in dismay, staring down into the river. A
half-cut tree trunk stands beside him with NO axe in it and NO axe
anywhere on the bank. Rising from the water in a soft golden glow,
Mercury appears EMPTY-HANDED and asks what is wrong.
```
**额外禁止（务必原样带上）**
```
a golden axe, a silver axe, any axe visible on the bank, any axe in the
tree stump, any axe in anyone's hands, Mercury holding anything
```

> 🔴 上一版把金斧提前了一整页，岸上还摆着一把斧子——可斧子明明已经掉进水里了。

**p2（句3-7）— 一金一银，形制要分得开**
```
The same riverbank. Mercury stands in the shallow water holding up TWO
DIFFERENT axes — a bright GOLDEN axe in his right hand and a pale SILVER
axe in his left hand, clearly different metals and colours. The
grey-bearded woodman on the bank shakes his head with both palms raised in
polite refusal, honest and a little embarrassed. His own plain
wooden-handled IRON axe floats in the water nearby.
```
**额外禁止**：`two golden axes, two axes of the same colour, the woodman reaching for the gold or silver axe, the woodman looking tempted`

**p3（句8-12）**
```
The same riverbank, another day. The wiry clean-shaven greedy man lunges
forward with both hands outstretched toward a GOLDEN axe that Mercury is
holding up and pulling back out of his reach. Mercury has turned his face
away with clear distaste. The greedy man looks grasping and desperate.
```
**额外禁止**：`the greedy man receiving or holding the golden axe, Mercury smiling at him, any axe being returned to him`

---

### ch13 《乌鸦与水罐》 — 三页全重出（统一罐子）

**本章道具块（三页都贴，上一版三页三个罐子、p3 还出现两只乌鸦）**
```
the same single pitcher in all three pictures: ONE tall terracotta pitcher
with a narrow neck, a rounded body and one curved handle, standing on the
ground
the same single crow in all three pictures: ONE glossy black crow with a
stout dark beak and bright eyes
```

**p1（句1）**
```
A sunny dry yard. ONE crow stands beside ONE tall narrow-necked terracotta
pitcher, pushing her beak DOWN INTO the mouth of the pitcher as far as it
will go. Only a shallow layer of water lies far down at the bottom, well
below her reach. Her posture is straining and frustrated.
```
**额外禁止**：`two crows, two pitchers, more than one bird, more than one vessel, the crow drinking, the water near the top, pebbles`

**p2（句2）**
```
The same yard under a harsh midday sun. ONE crow stands back from THE SAME
single pitcher with her wings DROOPING at her sides and her head lowered,
exhausted and defeated, beak open in thirst. The water is still far down
inside. Dry cracked ground.
```
**额外禁止**：`two crows, two pitchers, wings spread wide, the crow drinking, pebbles, the crow lying down or dead`

**p3（句3）**
```
The same yard. ONE crow drops a small pebble from her beak into the mouth
of THE SAME single pitcher. Several pebbles are already visible inside and
a small pile lies on the ground beside her. The water has RISEN CLOSE TO
THE TOP of the pitcher, within easy reach. The crow looks bright and
purposeful.
```
**额外禁止**：`two crows, two pitchers, a second bird anywhere, the water still low, the pitcher broken or tipped`

---

### ch14 《北风与太阳》 — 重出 p1、p3（p2 保留）

**p1（句1-2）— 换成乡间土路**
```
A winding DIRT COUNTRY TRACK through green fields, seen from a high angle.
In the sky on the left, the North Wind is a cartoon face in swirling
blue-grey clouds with puffed cheeks. On the right, the Sun is a warm
smiling golden face. They look across at each other in friendly rivalry.
Far below on the track, a small traveler in a heavy brown hooded cloak
walks along with a stick.
```
**额外禁止**：`asphalt, tarmac, painted road markings, a paved road, the cloak coming off`

**p3（句6-9）— 斗篷必须完全脱下**
```
The same dirt country track in warm golden sunshine. The Sun beams
overhead. The traveler has taken his heavy brown cloak COMPLETELY OFF —
the cloak is FOLDED OVER ONE ARM and hangs down clearly away from his
body, his shoulders and torso plainly bare of it. He wipes his brow with
the other hand and smiles as he walks on in his shirt. The North Wind has
shrunk to a small sulking cloud in a far corner of the sky.
```
**额外禁止（务必原样带上）**
```
the cloak on his shoulders, the cloak around his body, the cloak worn or
draped over him, the traveler hugging or clutching the cloak, the hood up,
strong wind, asphalt or road markings
```

> 🔴 上一版斗篷还披在身上抱着——这则的全部意义是太阳让他**脱下来**。

---

### ch15 《兔子与青蛙》 — 只重出 p2

**p1、p3 保留，不要动。**

**p2（句3-4）**
```
A grassy pond bank. A group of brown hares runs together across the GRASS
toward the pond, ears back. On the near bank a group of small bright green
frogs is startled and leaps into the water, mid-jump, splashes rising. The
hares are clearly ON THE GRASS, several body-lengths from the water's
edge. Hares and frogs are entirely separate creatures, each drawn complete
and distinct.
```
**额外禁止（务必原样带上）**
```
a hare with frog features, a frog with hare ears, any hybrid or merged
creature, any animal that is part hare and part frog, hares entering the
water, hares jumping into the pond, hares drowning, a despairing mood
```

> 🔴 上一版水里出现了一只"兔耳蛙身"的合成怪。

---

### ch16 《狐狸与鹳》 — 三页全重出

**本章角色/道具块（三页都贴）**
```
the fox: slender orange-red fox, white chest and throat, black stockings on
all four legs, bushy tail with a white tip, amber eyes, NORMAL SOFT PAWS
the stork: a tall white stork with a very long slender orange bill, long
orange legs, big friendly eyes, STANDING ON THE FLOOR beside the table
```

**p1（句1-2）— 必须是又宽又浅的平盘**
```
A small dining table outdoors. On the table are TWO identical WIDE, FLAT,
VERY SHALLOW dishes of soup — like broad saucers, the soup only a thin
layer. The fox laps happily from his, tongue out, enjoying it. The tall
stork stands beside the table and lowers her long slender bill to the
other flat dish, but the bill only touches the flat surface and cannot
scoop anything up. She looks politely frustrated. The fox glances at her
with a sly amused grin. NO OTHER FOOD is on the table.
```
**额外禁止**：`deep bowls, round bowls, cups, a tall vessel, more than two dishes, any other plate of food, fruit, bread, the stork standing on the table, skeletal or bony paws`

**p2（句3）— 必须是细长颈的瓶子，喙伸进去**
```
A table at the stork's home. On the table stands a TALL PITCHER WITH A
LONG, VERY NARROW NECK. The stork stands beside the table and slides her
long slender bill DOWN INSIDE the narrow neck, eating comfortably with a
serene expression. The fox sits opposite, watching the pitcher, beginning
to realise. NO OTHER FOOD is on the table.
```
**额外禁止**：`a wide jug, a wide opening, a flat dish, any other plate or bowl of food, the stork standing on the table, the fox eating, skeletal or bony paws`

**p3（句4）**
```
The same table. The stork eats contentedly, her long bill down inside the
tall narrow-necked pitcher. Beside her the fox sits with his nose almost
touching the narrow opening, his broad muzzle far too wide to fit inside,
his expression hungry and rueful. His front paws are NORMAL SOFT FOX PAWS
resting on the table edge. NOTHING ELSE EDIBLE is anywhere in the picture.
```
**额外禁止（务必原样带上）**
```
skeletal hands, bony fingers, human-like hands, a plate of fruit, any other
food on the table or nearby, the fox eating or drinking, the fox knocking
the pitcher over
```

> 🔴 上一版狐狸的前爪画成了白骨般的手指，桌上还摆着一盘够得着的水果——那盘水果直接
> 拆掉了"饭在眼前一口够不着"。

---

### ch17 《挤奶女孩与奶桶》 — 三页全重出

**本章角色块（三页都贴，上一版发色两变）**
```
the same farm girl in all three pictures: a young girl with SHORT BROWN
HAIR tied in two small side ponytails, wearing a blue dress with a white
apron, carrying a wooden pail
```

**p1（句1）**
```
A DIRT COUNTRY LANE between green fields in the morning. The brown-haired
farm girl walks along with a wooden pail of milk balanced on her head, one
hand steadying it lightly, her eyes dreamy and far away.
```
**额外禁止**：`asphalt, tarmac, road markings, the pail falling, spilled milk, thought bubbles`

**p2（句2-5）— 四个幻想必须齐，最后一个是新裙子**
```
The same dirt lane. The brown-haired girl walks on with the pail on her
head, smiling to herself. Four soft cloud-like thought-bubbles float above
her showing, in order: (1) a wooden churn of yellow BUTTER, (2) a basket
of EGGS, (3) a yard full of fluffy CHICKENS, (4) the girl herself wearing
a PRETTY NEW DRESS at a village fair. The four bubbles show four DIFFERENT
things.
```
**额外禁止（务必原样带上）**
```
two bubbles showing the same thing, a missing dress bubble, fewer than four
bubbles, asphalt or road markings, the pail falling, any text or letters
inside the bubbles
```

**p3（句6-7）— 表情必须是惊愕**
```
The same dirt lane. The brown-haired girl has just tossed her head back
proudly and the wooden pail has tipped OFF HER HEAD and is falling right
beside her, milk pouring out onto the road. Her face is FULL OF SHOCK AND
DISMAY — eyes wide, mouth open in alarm, both hands flying up too late.
The thought-bubbles are breaking apart into faint wisps.
```
**额外禁止（务必原样带上）**
```
the girl smiling, the girl laughing, the girl looking happy or calm, hands
on her hips, the pail far away from her, the pail floating in mid-air away
from her body, the girl injured or crying on the ground, an intact
thought-bubble
```

> 🔴 上一版女孩在笑，桶还悬在离她很远的半空——这是她美梦崩塌的一刻。

---

### ch18 《海豚、鲸与小鲱鱼》 — 重出 p1、p2（p3 未看，建议一并重出）

**本章角色块（三页都贴）**
```
the dolphins: THREE separate sleek grey dolphins, each drawn complete and
clearly apart from the others, with cross expressions
the whales: THREE separate large blue-grey whales, each drawn complete and
clearly apart from the others, with cross expressions
the sprat: one tiny silver fish with big earnest eyes, comically small
```

**p1（句1-2）**
```
An underwater scene in deep blue-green sea. On the left THREE separate
grey dolphins, clearly spaced apart from one another, face off against
THREE separate blue-grey whales on the right, also clearly spaced apart.
Both sides look ANGRY and stubborn — brows drawn down, mouths open
shouting — with churning water, swirls and rising bubbles between them.
Dramatic but cartoonish.
```
**额外禁止（务必原样带上）**
```
animals overlapping or blending into one another, a pile of merged bodies,
partial or cut-off bodies, cloned identical shapes stacked together, only
one whale, smiling or friendly faces, blood, wounds, injured animals
```

**p2（句3）**
```
The same underwater scene. A tiny silver sprat has swum into the gap
between the two sides, fins spread wide and mouth open, earnestly arguing
for peace. He is comically tiny next to the dolphins and whales looming on
either side. Both sides pause and look down at him, still ANGRY and
scowling. Churning water and bubbles remain around them.
```
**额外禁止**：`the two sides smiling or looking friendly, a calm empty background, merged or overlapping bodies, the sprat harmed`

**p3（句4）**
```
The same scene. One dolphin leans down close to the tiny sprat with a
proud, dismissive, scornful expression, speaking down to him, while the
whales behind turn away and square up again. The sprat floats there small
and crestfallen, his peace-making refused. The two sides remain apart.
```
**额外禁止**：`the two sides making peace, the sprat succeeding, the sprat harmed, merged bodies`

---

### ch19 《驴与哈巴狗》 — 只重出 p2（p1 未看，建议核一下角色）

**p3 保留，不要动 —— 那是这一批处理得最好的一张。**

**本章角色块**
```
the donkey: ONE sturdy grey donkey with long ears, big gentle eyes and a
rounded friendly face — ONE HEAD ONLY
the lapdog: a small fluffy white lapdog with a curly tail and a red collar
the master: a comfortable middle-aged countryman in a brown coat
```

**p2（句4-7）**
```
Inside a farmhouse dining room, chaos. ONE grey donkey — a single animal
with ONE HEAD — has burst in with a snapped rope trailing from his neck
and prances awkwardly on his hind legs in a clumsy imitation of a lapdog,
front hooves in the air. The dinner table is knocked over behind him with
plates and bowls tumbling. The master rears back in his chair with both
arms up, his face ALARMED AND STARTLED. The little white lapdog scurries
aside in surprise.
```
**额外禁止（务必原样带上）**
```
two donkeys, two heads, a donkey with more than one head, duplicate
animals, extra ears, the master smiling or laughing, anyone being hurt,
blood or red stains on the floor, servants hitting the donkey, sticks or
clubs in use
```

> 🔴 上一版驴长了两个头，主人还在大笑。

---

## 三、下次的建议

**别再一次出 30 张。** 这批 10 章里 8 章有硬伤，返工量比分批大得多。
前面 ch1–ch9 一章一验，9 章只打回 3 次。

建议**一次出 2–3 章**，我验完再出下一批。

出好放 `scripts\library\illustrations-in\aesop\`，覆盖同名文件即可。
