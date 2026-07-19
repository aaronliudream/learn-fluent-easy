// 汇编章节插图作图提示词:吃 subagent 产的 illus-data/<key>/ch<N>.json,注入统一画风+分阶段人物设定,
// 出一个可直接发给 AI 作图的 Markdown 提示词文件 + 结构化清单(供回图后写 SQL)。
// 用法:node scripts/library/_gen-illus-prompts.mjs <book_key>
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const KEY = process.argv[2];
if (!KEY) { console.error("用法: node scripts/library/_gen-illus-prompts.mjs <book_key>"); process.exit(1); }
const book = JSON.parse(readFileSync(`scripts/library/books/${KEY}.json`, "utf8"));
const titles = book.chapters.map((c, i) => c.title_en || c.title || `Chapter ${i + 1}`);

// —— 统一画风(每张章图都注入)——
const STYLE = "Watercolor children's storybook illustration, 16:9 landscape, at least 1280x720, soft hand-painted washes with visible paper texture, warm inviting light, gentle and painterly (not photographic). Cohesive storybook series style. No text, no words, no letters, no signature anywhere in the image.";
// —— 分阶段主角外形(按章)——
const crusoeByChapter = (ch) =>
  ch <= 3 ? "Robinson Crusoe here is a YOUNG Englishman around 1650, clean-shaven or lightly bearded, in plain sailor clothes (NOT yet a castaway, NO goatskin)."
  : ch >= 19 ? "Robinson Crusoe here is back in neat European clothes with a neatly trimmed beard (no longer in goatskin)."
  : "Robinson Crusoe here is a weathered castaway with a full brown beard, wearing a rough goatskin cap and goatskin jacket.";
const FRIDAY = "Friday is a young, athletic islander with short dark hair and a simple goatskin kilt.";
const mentions = (s, names) => new RegExp(`\\b(${names.join("|")})\\b`, "i").test(s);

// —— 封面(3:4,唯一带标题的一张)——
const COVER = {
  file: `${KEY}-cover.jpg`,
  prompt: `Children's storybook watercolor cover illustration, vertical 3:4 portrait, at least 1200x1600, soft hand-painted watercolor with visible paper texture, warm and inviting, same watercolor family as the chapter illustrations.
TITLE: at the top, the English title "ROBINSON CRUSOE" in an ornate GOLD decorative serif typeface with delicate flourishes, elegant and legible even at thumbnail size, with a subtle dark outline. Place the whole title within the upper vertical band between 15% and 33% of the height (NOT touching the top edge, pulled slightly toward the middle), ~10% clear margin left and right. No other text. No Chinese characters.
SCENE (lower two-thirds): a bearded castaway, Robinson Crusoe, in a goatskin cap and jacket holding a long musket and a homemade goatskin umbrella, standing on a sunlit tropical beach beside Friday (a young islander in a goatskin kilt); a wooden stockade hut with a palm-leaf roof, a couple of tame goats, a parrot, a dugout canoe on the sand, a single line of footprints; across a turquoise sea a wrecked sailing ship tilts on a reef, palm-covered island headlands on the horizon.
COLOR: one dominant key — tropical ocean teal/turquoise sea and sky with warm golden sand; leave open painted sky at the top for the title. NO border, no frame. Exact 3:4 vertical, at least 1200px wide.`,
};

let out = `# 鲁滨逊漂流记 · 图书馆插图作图提示词(共 1 封面 + ${titles.length}×6 章图)

> 直接把下面每个代码块喂给 AI 作图工具。**每张图用它上方标的文件名保存**,全部存到同一个文件夹,再把文件夹路径发我。
> 硬要求:封面 = **竖版 3:4**(≥1200 宽,带金色标题);章图 = **横版 16:9**(≥1280 宽,**画面内不要任何文字**)。同一水彩画风、同一人物长相,整本才统一。

---

## 封面(3:4 · 唯一带标题)

**保存为 \`${COVER.file}\`**

\`\`\`
${COVER.prompt}
\`\`\`

---
`;

let count = 0;
const manifest = []; // { file, chapter, k, seq, slug, alt }
for (let ch = 1; ch <= titles.length; ch++) {
  const f = `scripts/library/books/illus-data/${KEY}/ch${ch}.json`;
  if (!existsSync(f)) { out += `\n> ⚠️ 缺 ch${ch}.json\n`; continue; }
  const data = JSON.parse(readFileSync(f, "utf8"));
  out += `\n## 第 ${ch} 章 · ${titles[ch - 1]}\n`;
  for (const im of (data.images || []).sort((a, b) => a.k - b.k)) {
    const file = `ch${ch}-${im.k}-${im.slug}.jpg`;
    const parts = [STYLE];
    if (mentions(im.scene, ["Robinson", "Crusoe", "he", "his", "him"])) parts.push(crusoeByChapter(ch));
    if (mentions(im.scene, ["Friday"])) parts.push(FRIDAY);
    parts.push(`SCENE: ${im.scene}`);
    out += `\n**保存为 \`${file}\`**\n\n\`\`\`\n${parts.join("\n")}\n\`\`\`\n`;
    manifest.push({ file, chapter: ch, k: im.k, seq: im.seq, slug: im.slug, alt: im.alt });
    count++;
  }
}

writeFileSync(`scripts/library/books/${KEY}-illustration-prompts.md`, out);
writeFileSync(`scripts/library/books/illus-data/${KEY}/_manifest.json`, JSON.stringify({ cover: COVER.file, images: manifest }, null, 1));
console.log(`✓ ${KEY}: 封面 1 + 章图 ${count} = ${count + 1} 条提示词`);
console.log(`  → scripts/library/books/${KEY}-illustration-prompts.md(发给 AI)`);
console.log(`  → scripts/library/books/illus-data/${KEY}/_manifest.json(回图后写 SQL 用)`);
