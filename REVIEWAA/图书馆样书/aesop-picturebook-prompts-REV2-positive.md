# 伊索绘本 · 正面描述型提示词（REV2）· 先做 ch10 / ch15 / ch19

**日期**：2026-07-26 ｜ **范围**：3 章 9 张 ｜ **方法已换，先验证方法再铺开**

---

## 一、为什么换写法

前两批的失败集中在两点，而且**加了禁止词之后反而更严重**：

| 案例 | 禁止词 | 结果 |
|---|---|---|
| ch10 p3 | `blood, red stains, any red marks` | 血从 4 摊变成 20 摊 |
| ch15 p2 | `a frog with hare ears, any hybrid creature` | 兔耳青蛙从 1 只变 8 只 |

这是扩散模型的常见失效：**负面提示权重弱，而词本身在正向语义里被激活了**。
写 "no blood" 等于把"血"这个概念送进了模型。

**新方法：不提禁止的东西，只穷尽地描述画面里该有什么。** 三个手段：

1. **锁死配色** —— 直接规定画面只能出现哪几种颜色（红色根本不在清单里）
2. **写死数量和位置** —— "恰好 6 只兔子全部在草地上，恰好 5 只青蛙全部在水里，中间隔着岸线"
3. **穷尽式描述** —— 把画面里的东西列全，不给模型留自由发挥的空隙

保留的少量负面词只用于**画风**（`watercolour, 3D render, photorealistic`），不用于内容。

---

## 二、通用块（每张都带）

**风格**
```
bright colourful cartoon illustration for a children's picture book, clean
smooth shapes, bold clear outlines, cheerful colours, soft even shading,
simple uncluttered composition, modern storybook cartoon style
```

**造型**
```
character design is cute and appealing: rounded heads, large round
expressive eyes, short blunt snouts, soft plump rounded bodies, friendly
readable faces
```

**画风负面词（只留这些，内容一律不用负面词）**
```
watercolour, paper texture, 3D render, CGI, photorealistic, sketchy, text,
letters, watermark, signature
```

**规格**：1200×900 严格 4:3，主体居中留 10% 边距

---

## 三、ch10 《狼与羊羔》

**本章配色锁（三页都贴）**
```
COLOUR PALETTE — use only these colours in the whole picture: fresh green
grass, light blue water, warm brown tree trunks and earth, soft grey for
the wolf, pure white for the lamb, pale blue sky. No other colours appear
anywhere.
```

**本章角色（三页都贴）**
```
the wolf: ONE soft grey cartoon wolf with a rounded head, two ears, a bushy
tail, calm amber eyes, sitting or standing on four legs
the lamb: ONE small round white lamb with a fluffy coat, big dark eyes and
four tiny hooves
```

### p1（句1-2）
```
A wide green meadow with a narrow light-blue stream winding through it. The
grey wolf sits on the LEFT bank of the stream, looking across the water. The
white lamb stands on the RIGHT bank, looking back at him. The stream runs
between them for the whole width of the picture. Far away in the background
on the right are three more small white sheep. A few brown tree trunks stand
at the edges. Everything is calm and still.
```

### p2（句3-8）
```
The same meadow and the same light-blue stream. The grey wolf stands on the
LEFT bank with one front paw lifted and his mouth open, talking across the
water. The white lamb stands on the RIGHT bank with its head tilted up and
its mouth open, answering him. The stream runs between them for the whole
width of the picture and neither animal touches the water. Both are drawn
full-length and completely separate from each other.
```

### p3（句9-10）⚠️ 本章关键
```
An empty green meadow with a narrow light-blue stream winding through it.
The picture contains only: green grass, the blue stream, warm brown earth
along the bank, three small tufts of pure white wool lying on the grass, and
a line of grey paw prints pressed into the brown earth leading away from the
bank toward the right edge. A few brown tree trunks stand at the edges under
a pale blue sky. The meadow is completely empty and quiet. Late afternoon
light.
```

> 这一页的清单就是全部内容：**绿草、蓝水、棕土、三缕白毛、一串灰脚印、几根树干、淡蓝天**。
> 配色锁里没有红色，正文里也不提任何红色的东西。

---

## 四、ch15 《兔子与青蛙》

**本章角色（三页都贴）**
```
the hares: brown cartoon hares with long upright ears, white fluffy tails,
plump rounded bodies and big dark eyes — every hare is brown with long ears
the frogs: bright green cartoon frogs with wide mouths, round bulging eyes
on top of the head, smooth green skin and webbed feet — every frog is green,
smooth-headed and completely earless
```

### p1（句1-2）
```
A green meadow clearing at dusk under a deep blue evening sky. SIX brown
hares sit close together in a circle on the grass, their long ears drooping
down and their eyes wide and worried. Far away on the horizon behind them
are two tiny dark silhouettes: a dog and a flying bird, both very small and
distant. Nothing else is in the picture.
```

### p2（句3-4）⚠️ 本章关键
```
A green grassy bank on the LEFT and a round light-blue pond on the RIGHT,
with a clear brown earth edge running between them.

On the GRASS, entirely on the left side, SIX brown hares with long upright
ears run together toward the right.

In the WATER, entirely on the right side, FIVE bright green frogs are
jumping in — two in mid-air above the water with small white splashes below
them, three already floating in the pond with only their round heads showing.

Every hare is brown with long ears and stands on grass. Every frog is green
with a smooth round head and is in or above the water. The brown earth edge
separates the two groups completely.
```

> 关键在**位置 + 数量 + 各自的完整描述**：兔子六只全在草地、青蛙五只全在水里，
> 各自的外形分别写死（兔=褐色长耳、蛙=绿色光滑圆头），中间有明确的土坎分界。

### p3（句5）
```
The same green bank and light-blue pond. ONE larger brown hare stands at the
front on the grass with one front paw raised, turned back to face the others
and calling out, his mouth open and his eyes bright. Behind him FIVE brown
hares have stopped running and stand still, looking past him toward the pond.
In the pond on the right, THREE green frogs float with only their round heads
above the water. Everyone is calm.
```

---

## 五、ch19 《驴与哈巴狗》

**本章角色（三页都贴）**
```
the donkey: ONE grey cartoon donkey. It has ONE head, TWO long ears, TWO
big dark eyes, FOUR legs and one dark tail. Its body is soft grey and its
muzzle is pale grey.
the lapdog: ONE small white fluffy dog with a curly tail and a red collar
the master: ONE middle-aged man with short brown hair, wearing a brown coat
and a green shirt
```

### p1（句1-3）
```
A farmhouse scene split in two by a wall running down the middle of the
picture.

On the LEFT, inside a warm room: the master sits on a wooden chair with the
small white dog resting on his lap, one hand stroking its head. Both look
comfortable and happy.

On the RIGHT, outside in a tidy stable: the grey donkey stands beside a
wooden manger full of yellow hay, its head turned toward the window,
thinking.

Simple warm colours: brown wood, yellow hay, grey donkey, white dog.
```

### p2（句4-7）⚠️ 本章关键
```
Inside a farmhouse dining room in the middle of a commotion.

In the CENTRE stands ONE grey donkey — a single animal with ONE head and
TWO long ears. It balances on its TWO BACK LEGS with its TWO FRONT HOOVES
lifted high in the air, copying a dog begging. A short brown rope hangs from
its neck.

BEHIND the donkey a wooden table has been knocked over onto its side. White
plates, bowls and spoons are tumbling through the air and lying scattered
across the floor. A white tablecloth slides off the tipped table.

On the RIGHT the master leans backwards in his chair with BOTH ARMS RAISED
above his head, his eyes wide and his mouth open in alarm.

On the LEFT the small white dog runs away toward the corner, looking back
over its shoulder in surprise.

Colours: brown wood, white crockery, grey donkey, white dog, brown coat.
```

> 上一版把"混乱"整个丢了（桌子没翻、主人叉腰笑）。这一版把**桌子翻倒、碗盘飞散、
> 主人双臂高举后仰、狗躲到角落**逐项写死，同时用"一个头、两只耳朵、两条后腿站立、
> 两只前蹄抬起"把驴的解剖结构说满，堵掉双头。

### p3（句8-9）
```
A quiet stable yard in the evening under a deep blue sky. The grey donkey
stands inside its own wooden stall on the LEFT, its head hanging low and its
two long ears drooping, looking at a wooden manger full of yellow hay. Far
away on the RIGHT, two farm servants in plain tunics stand in a lit doorway,
each holding a wooden stick pointing straight down at their side, already
turning to walk back inside. A wide empty yard of packed earth lies between
the donkey and the doorway. Everything is still and quiet.
```

---

## 六、交付

出好放 `scripts\library\illustrations-in\aesop\`，覆盖同名文件
（`aesop_ch10_p1.jpg` … `aesop_ch19_p3.jpg`）。

**这三章 9 张先出，我逐张验。** 方法验证有效再用同样的写法改写其余 7 章。
