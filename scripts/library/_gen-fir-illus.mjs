// 枞树插图提示词(短篇:1 封面 + 10 场景,均匀铺满全故事)。
// 出 books/fir-tree-illustration-prompts.md(发 AI)+ illus-data/fir-tree/_manifest.json(回图后 process 用)。
import { writeFileSync, mkdirSync } from "node:fs";

const STYLE = "Watercolor children's storybook illustration, 16:9 landscape, at least 1280x720, soft hand-painted washes with visible paper texture, warm inviting light, gentle and painterly (not photographic). Cohesive storybook series style. No text, no words, no letters, no signature anywhere in the image.";

// 主角分阶段设定(每张都注入,保证同一棵树)
const FIR = "The fir tree is a slender Northern-European spruce with rich blue-green needles, given gentle expressive character but NO cartoon face (keep it a real, poignant little tree). Period setting: 19th-century Denmark.";
const STAGE = {
  sapling: "At this point the fir is a SMALL young sapling, only knee-to-waist high.",
  grown: "At this point the fir has grown into a shapely young tree, about chest-to-head high.",
  decorated: "At this point the SAME fir stands upright indoors, adorned with gilded apples and walnuts, little colored-paper nets of sugarplums, blue-and-white candle tapers among the branches, and a big gold tinsel star at the very top.",
  withered: "At this point the SAME fir is dried brown and yellow, its needles falling.",
};

const scenes = [
  { ch: 1, k: 1, seq: 4, slug: "summer-children", stage: "sapling",
    scene: "In a sunny summer clearing of a Northern-European wood, the small young fir grows among tall pines and firs. Nearby, two or three cottage children in simple 19th-century peasant clothes sit on the grass threading wild strawberries onto a straw, a full pitcher of berries beside them. Dappled golden sunlight, soft fresh-green summer palette.",
    alt: "小枞树在夏日林间空地上,附近孩子在草地上用麦秆串野草莓" },
  { ch: 1, k: 2, seq: 12, slug: "winter-hare", stage: "sapling",
    scene: "Winter in the same wood: snow lies glittering on the ground, the little fir stands among big snow-dusted pines, and a brown hare leaps through the air right over the top of the little fir. Crisp pale-blue and white winter palette, low golden afternoon light.",
    alt: "冬天雪地里,一只野兔从小枞树头顶跳过去" },
  { ch: 1, k: 3, seq: 17, slug: "woodcutters", stage: "grown",
    scene: "Autumn in the wood: woodcutters in 19th-century clothes have felled the tallest trees; two great bare trunks with branches lopped off are being loaded onto a wooden cart, a heavy horse ready to drag them away between the trees. The young fir stands to one side as if trembling at the sight. Muted autumn golds and browns.",
    alt: "秋天伐木人砍倒大树装上马车,小枞树在一旁发抖地看着" },
  { ch: 1, k: 4, seq: 22, slug: "stork-ships", stage: "grown",
    scene: "Spring morning at the edge of the wood: a tall white stork stands before the young fir, its head tilted as if speaking to the tree. Far away across a distant sea on the horizon, sailing ships with tall bare masts glide by. Fresh green and soft sky-blue palette, faint red morning clouds.",
    alt: "春天清晨,一只鹳鸟对着小枞树说话,远处海上帆船的桅杆" },
  { ch: 2, k: 1, seq: 31, slug: "sparrows-window", stage: "grown",
    scene: "A little flock of sparrows perches on the fir's branches, chattering to it. In the background below stands a town cottage with a warm glowing window, through which a brightly decorated, candle-lit Christmas tree can be glimpsed. Twilight blue outside against warm golden window-light.",
    alt: "麻雀停在枞树枝上说话,背景小镇窗内透出点着蜡烛的圣诞树" },
  { ch: 2, k: 2, seq: 49, slug: "into-parlour", stage: "grown",
    scene: "Inside a grand 19th-century drawing-room, two servants in rich livery carry the freshly cut young fir in through the door. A white porcelain stove, two large Chinese vases with lions on the lids, silken sofas and easy-chairs, tables of picture-books and toys, a gaily-colored carpet. Warm candlelit interior, rich reds and golds.",
    alt: "两个穿号衣的仆人把枞树抬进豪华客厅,白瓷炉和中国花瓶" },
  { ch: 2, k: 3, seq: 57, slug: "decorating", stage: "decorated",
    scene: "The young fir stands upright in the drawing-room while young ladies decorate it: gilded apples and walnuts hang from the boughs, little colored-paper nets full of sugarplums, blue-and-white candle tapers among the needles, and a large gold tinsel star being fixed at the very top. The tree glows with anticipation. Warm festive palette.",
    alt: "小姐们给客厅里的枞树挂镀金苹果、糖果网兜和蜡烛,顶上安金星" },
  { ch: 3, k: 1, seq: 74, slug: "christmas-eve", stage: "decorated",
    scene: "Christmas evening: the fully lit fir tree blazes with dozens of small candle flames. A troop of excited children in fine clothes dance and rush around it, pulling presents from the branches, some boughs bending and cracking under their hands. Joyful warm golden glow, festive reds and greens.",
    alt: "圣诞夜,点满蜡烛的枞树旁孩子们又跳又闹地抢礼物" },
  { ch: 4, k: 1, seq: 108, slug: "loft-mice", stage: "grown",
    scene: "A dark, dim attic loft: the fir, pushed aside and forgotten in a shadowy corner beside big wooden trunks, catches a single faint shaft of light. Two little grey mice peep from a hole and snuff among its lower branches. Muted browns and greys with one warm highlight, a lonely quiet mood.",
    alt: "昏暗阁楼角落里被遗忘的枞树,两只小老鼠在枝间嗅探" },
  { ch: 5, k: 1, seq: 148, slug: "withered-star", stage: "withered",
    scene: "A spring courtyard beside a blossoming garden: the fir now lies withered brown and yellow on its side in a corner among weeds and nettles, the gold tinsel star still glinting on top. A small child in 19th-century clothes has just run up and torn off the golden star, holding it high. Fresh roses and linden blossom bright behind — a bittersweet contrast between the blooming garden and the dried-out tree.",
    alt: "春天院子角落里,枯黄的枞树躺在杂草中,一个小孩扯下顶上的金星" },
];

const COVER_FILE = "fir-tree-cover.jpg";
const COVER = `Children's storybook watercolor cover illustration, vertical 3:4 portrait, at least 1200x1600, soft hand-painted watercolor with visible paper texture, warm and inviting, same watercolor family as the chapter illustrations.
TITLE: at the top, the English title "THE FIR TREE" in an ornate GOLD decorative serif typeface with delicate flourishes, elegant and legible even at thumbnail size, with a subtle dark outline. Place the whole title within the upper vertical band between 15% and 33% of the height (NOT touching the top edge, pulled slightly toward the middle), ~10% clear margin left and right. No other text. No Chinese characters.
SCENE (lower two-thirds): a single slender young fir tree with rich blue-green needles standing in a quiet Northern-European wood clearing; a soft dusting of snow, tall pines behind; one small gold star glimmering in the twilight sky just above the tree's top (echoing the story's tinsel star); a brown hare half-hidden at the edge.
COLOR: one dominant key — deep twilight forest greens and soft blue snow, with a single warm gold accent from the star; leave open painted sky at the top for the title. NO border, no frame. Exact 3:4 vertical, at least 1200px wide.`;

let out = `# 枞树 The Fir Tree · 图书馆插图作图提示词(1 封面 + 10 场景)

> 短篇,10 张场景图均匀铺满全故事(幼苗→成材→圣诞树→枯黄,同一棵树)。
> 把下面每个代码块喂给 AI 作图工具,**每张用它上方的文件名保存**,全部放同一文件夹,再把文件夹路径发我。
> 硬要求:封面 = 竖版 3:4(≥1200 宽,带金标题);场景图 = 横版 16:9(≥1280 宽,**画面内不要任何文字**)。同一水彩画风、同一棵枞树。

---

## 封面(3:4 · 唯一带标题)

**保存为 \`${COVER_FILE}\`**

\`\`\`
${COVER}
\`\`\`

---
`;

const manifest = [];
const CHZH = { 1: "林中的小枞树", 2: "他向往的荣光", 3: "最光辉的一夜", 4: "被遗忘在阁楼", 5: "一切都过去了" };
let lastCh = 0;
for (const s of scenes) {
  if (s.ch !== lastCh) { out += `\n## 第 ${s.ch} 章 · ${CHZH[s.ch]}\n`; lastCh = s.ch; }
  const file = `ch${s.ch}-${s.k}-${s.slug}.jpg`;
  const prompt = [STYLE, FIR, STAGE[s.stage], `SCENE: ${s.scene}`].join("\n");
  out += `\n**保存为 \`${file}\`** (锚 seq ${s.seq})\n\n\`\`\`\n${prompt}\n\`\`\`\n`;
  manifest.push({ file, chapter: s.ch, k: s.k, seq: s.seq, slug: s.slug, alt: s.alt });
}

mkdirSync("scripts/library/books/illus-data/fir-tree", { recursive: true });
writeFileSync("scripts/library/books/fir-tree-illustration-prompts.md", out);
writeFileSync("scripts/library/books/illus-data/fir-tree/_manifest.json", JSON.stringify({ cover: COVER_FILE, images: manifest }, null, 1));
console.log(`✓ 1 封面 + ${manifest.length} 场景 → books/fir-tree-illustration-prompts.md + illus-data/fir-tree/_manifest.json`);
