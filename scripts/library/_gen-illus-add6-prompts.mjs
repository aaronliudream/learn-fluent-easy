// 追加插图提示词:读 illus-data/<key>/ch<N>-add6.json,套用与首批完全相同的画风+人物设定,出提示词 md。
// 用法: node scripts/library/_gen-illus-add6-prompts.mjs <book_key>
import { readFileSync, writeFileSync, existsSync } from "node:fs";
const KEY = process.argv[2] || "robinson-crusoe";
const book = JSON.parse(readFileSync(`scripts/library/books/${KEY}.json`, "utf8"));
const titles = book.chapters.map((c, i) => c.title_en || c.title || `Chapter ${i + 1}`);
const STYLE = "Watercolor children's storybook illustration, 16:9 landscape, at least 1280x720, soft hand-painted washes with visible paper texture, warm inviting light, gentle and painterly (not photographic). Cohesive storybook series style. No text, no words, no letters, no signature anywhere in the image.";
const crusoeByChapter = (ch) =>
  ch <= 3 ? "Robinson Crusoe here is a YOUNG Englishman around 1650, clean-shaven or lightly bearded, in plain sailor clothes (NOT yet a castaway, NO goatskin)."
  : ch >= 19 ? "Robinson Crusoe here is back in neat European clothes with a neatly trimmed beard (no longer in goatskin)."
  : "Robinson Crusoe here is a weathered castaway with a full brown beard, wearing a rough goatskin cap and goatskin jacket.";
const FRIDAY = "Friday is a young, athletic islander with short dark hair and a simple goatskin kilt.";
const mentions = (s, names) => new RegExp(`\b(${names.join("|")})\b`, "i").test(s);

let out = `# ${book.zh_title || KEY} · 追加章图提示词(每章 +6,k7–12)\n\n> 直接把每个代码块喂给 AI 作图。每张用其上方文件名保存,存进同一文件夹发我。横版 16:9、≥1280 宽、画面内无任何文字、与首批同一水彩画风同一人物长相。\n`;
let count = 0;
for (let ch = 1; ch <= titles.length; ch++) {
  const f = `scripts/library/books/illus-data/${KEY}/ch${ch}-add6.json`;
  if (!existsSync(f)) continue;
  const data = JSON.parse(readFileSync(f, "utf8"));
  out += `\n## 第 ${ch} 章 · ${titles[ch - 1]}\n`;
  for (const im of (data.images || []).sort((a, b) => a.k - b.k)) {
    const file = `ch${ch}-${im.k}-${im.slug}.jpg`;
    const parts = [STYLE];
    if (mentions(im.scene, ["Robinson", "Crusoe", "he", "his", "him"])) parts.push(crusoeByChapter(ch));
    if (mentions(im.scene, ["Friday"])) parts.push(FRIDAY);
    parts.push(`SCENE: ${im.scene}`);
    out += `\n**保存为 \`${file}\`**\n\n\`\`\`\n${parts.join("\n")}\n\`\`\`\n`;
    count++;
  }
}
writeFileSync(`scripts/library/books/${KEY}-illustration-prompts-add6.md`, out);
console.log(`✓ ${KEY}: 追加 ${count} 条 → scripts/library/books/${KEY}-illustration-prompts-add6.md`);
