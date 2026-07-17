import { readFileSync, writeFileSync } from "node:fs";
const b = JSON.parse(readFileSync("scripts/library/books/tom-sawyer.json", "utf8"));
const sents = [];
for (const c of b.chapters) for (const p of c.paragraphs) for (const s of p) sents.push({ ...s, ch: c.idx });

const AP = "['’]"; // 直/弯撇号都算(Gutenberg 用弯 ’)
const DIAL = new RegExp(
  "\\b(ain" + AP + "t|hain" + AP + "t|warn" + AP + "t|wa" + AP + "n" + AP + "t|gwyne|gwine|reg" + AP + "lar|" +
  "jest|sich|hisself|yourn|hearn|a-[a-z]+in" + AP + "|dey|dat|dah|dese|feared|nuther|orter|" +
  "s" + AP + "pose|" + AP + "bout|" + AP + "nuff|" + AP + "em|by-and-by)\\b", "i");
const SLUR = /\bnigger\b/i;
const INJUN = /\bInjun\b/;

const dial = sents.filter((s) => DIAL.test(s.en));
const slur = sents.filter((s) => SLUR.test(s.en)).length;
const injun = sents.filter((s) => INJUN.test(s.en)).length;

console.log("方言/非标拼写句:", dial.length, "/", sents.length);
console.log("内容敏感 → nigger:", slur, "| Injun:", injun);

const pick = [];
const per = {};
for (const s of dial) { per[s.ch] = (per[s.ch] || 0) + 1; if (per[s.ch] <= 3 && pick.length < 35) pick.push(s); }

let md = "# 汤姆·索亚历险记 · 中译方言 / 敏感内容待审\n\n";
md += "> 机翻已完成(5066 句全配),**Twain 方言 + 时代用语易翻车,以下待 Aaron / Web Claude 抽验,非定稿**。\n\n";
md += "## 一、内容敏感(需你决策,非翻译问题)\n";
md += `- 原著含时代种族用语:\`nigger\` **${slur}** 处、\`Injun\`(如 Injun Joe)**${injun}** 处。\n`;
md += `- 你指示"保留原著力度、不按少儿过滤"——但种族蔑称属**内容轴**、非力度轴。青少年公开书是否原样保留 / 加译注 / 淡化,请你拍板,我不擅自改。\n\n`;
md += `## 二、方言译法抽样(共 ${dial.length} 句命中方言标记;下列 ${pick.length} 句,每章至多 3)\n\n`;
for (const s of pick) {
  md += `- **[第 ${s.ch} 章]** ${s.en}\n  - 机翻:${s.cn}\n`;
}
writeFileSync("REVIEWAA/tom-sawyer-dialect-review.md", md);
console.log("→ REVIEWAA/tom-sawyer-dialect-review.md (" + pick.length + " 句样本)");
