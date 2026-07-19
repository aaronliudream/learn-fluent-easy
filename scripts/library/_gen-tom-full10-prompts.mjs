// Tom 全书统一插图题词:读 illus-data/tom-sawyer/ch<N>-full10.json,注入浓郁暖调无边框水彩+Tom人物设定,出 md。
// 用法: node scripts/library/_gen-tom-full10-prompts.mjs <from> <to>
import { readFileSync, writeFileSync, existsSync } from "node:fs";
const FROM = +(process.argv[2] || 1), TO = +(process.argv[3] || 35);
const book = JSON.parse(readFileSync("scripts/library/books/tom-sawyer.json", "utf8"));
const titles = book.chapters.map((c, i) => c.title_en || c.title || `Chapter ${i + 1}`);
const STYLE = "A wide horizontal 16:9 landscape illustration (much wider than tall, cinematic proportions, 1280x720). Rich warm storybook watercolor with deep saturated earth tones (russet, ochre, warm brown, muted blue), soft golden light and fine painterly detail — warm and full, not pale or sketchy. The painting fills the whole frame corner to corner: no border, no white margin, no frame, no signature, no watermark. Setting: an 1840s Mississippi River town (St. Petersburg). No text or letters in the image.";
const CHARS = [
  [/\bTom\b|\bSawyer\b/, "Tom Sawyer is a lively barefoot boy about twelve, tousled hair, in a straw hat, suspenders over a plain shirt and rolled-up trousers."],
  [/\bHuck|Finn\b/, "Huckleberry Finn is a ragged older boy in oversized cast-off adult clothes, barefoot and unkempt, carefree."],
  [/\bBecky\b|Thatcher/, "Becky Thatcher is a pretty girl about eleven with blonde braids, in a neat summer frock and pinafore."],
  [/\bAunt Polly\b|\bPolly\b/, "Aunt Polly is a kindly elderly woman in spectacles, a lace cap and an apron."],
  [/Injun Joe/, "Injun Joe is a menacing, powerfully built dark-haired man with a grim face, in rough frontier clothes (the villain)."],
  [/Muff Potter|\bPotter\b/, "Muff Potter is a shabby, good-natured old drunkard with a stubbly beard and worn clothes."],
  [/\bSid\b/, "Sid is a prim, neatly dressed younger boy."],
  [/Joe Harper|(?<!Injun )\bJoe\b/, "Joe Harper is a boy Tom's age, a close playmate, plainly dressed (a boy, NOT an adult)."],
];
let out = `# 汤姆·索亚历险记 · 全书统一插图题词(每章10张·k1-10·浓郁暖调无边框水彩)· 第 ${FROM}-${TO} 章\n\n> 直接把每个代码块喂 AI。每张用其上方文件名保存,存进同一文件夹发我。**画风务必一致:浓郁暖调、满幅无边框水彩**(和你已有那批"油画感"的一致);横版16:9、画面内无文字、人物长相前后一致(1840s密西西比小镇)。\n`;
let count = 0;
for (let ch = FROM; ch <= TO; ch++) {
  const f = `scripts/library/books/illus-data/tom-sawyer/ch${ch}-full10.json`;
  if (!existsSync(f)) { out += `\n> ⚠️ 缺 ch${ch}-full10.json\n`; continue; }
  const data = JSON.parse(readFileSync(f, "utf8"));
  out += `\n## 第 ${ch} 章 · ${titles[ch - 1]}\n`;
  for (const im of (data.images || []).sort((a, b) => a.k - b.k)) {
    const file = `ch${ch}-${im.k}-${im.slug}.jpg`;
    const parts = [STYLE];
    for (const [re, note] of CHARS) if (re.test(im.scene)) parts.push(note);
    parts.push(`SCENE: ${im.scene}`);
    out += `\n**保存为 \`${file}\`**\n\n\`\`\`\n${parts.join("\n")}\n\`\`\`\n`;
    count++;
  }
}
writeFileSync(`scripts/library/books/tom-sawyer-illustration-prompts-full10-ch${FROM}-${TO}.md`, out);
console.log(`✓ Tom full10 ch${FROM}-${TO}: ${count} 条 → scripts/library/books/tom-sawyer-illustration-prompts-full10-ch${FROM}-${TO}.md`);
