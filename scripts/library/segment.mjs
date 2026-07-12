/**
 * 图书馆:清洗好的英文正文 → 分段分句的书 JSON 骨架。
 * v1 样书已手工 authored;此脚本是 v2「PDF 导入」管线的前置件(简单规则分句 + 人工校对)。
 *
 * 规则:
 *  · 章:以 "## 章标题" 行分隔(无标记 → 全文一章 idx=1)。
 *  · 段:章内空行分隔。
 *  · 句:句末 .!? 切分,守卫常见缩写(Mr. U.S. e.g. 等)与小数点,避免误切。
 * 产物:scripts/library/books/<key>.draft.json —— cn 全为 null,交 translate.mjs 配中文,人工校对后再 build-seed。
 *
 * 用法:node scripts/library/segment.mjs <raw.txt> <book_key>
 */
import { readFileSync, writeFileSync } from "node:fs";

const [, , rawPath, key] = process.argv;
if (!rawPath || !key) {
  console.error("用法: node scripts/library/segment.mjs <raw.txt> <book_key>");
  process.exit(1);
}

const ABBR = ["Mr", "Mrs", "Ms", "Dr", "St", "Prof", "Sr", "Jr", "vs", "etc", "e.g", "i.e", "U.S", "U.K", "a.m", "p.m", "No", "Fig"];

/**
 * 对话回接:引号内的 ?/! 会被误当句末,把对话标签(said/asked/cried…)切成小写开头的碎句。
 * 规则:
 *  1) 任何「小写字母开头」的段 = 被切开的对话标签/续句 → 接回上一句。
 *     (干净英文里句子恒以大写或引号开头;小写开头必是误切。这一条覆盖 said X. / she asked. 等。)
 *  2) 标签接回后,若紧跟一个「自己没有对话标签」的续引号("B."),一并并入 → "A?" said X. "B." 视为一句。
 *     若续引号自己带标签("B!" said Y.),说明是另一说话人 → 不并,留作独立句。
 */
function rejoinDialogue(parts) {
  // 纯引号句:以双引号包裹、后面只跟句末标点,自身不带对话标签(如 "Nobody knows.")。
  // 用双引号判定(不含单引号),避免把 "Let's ..." 里的撇号误当引号。
  const isBareQuote = (s) => /^["“][^"”]*["”][.!?]*$/.test(s);
  const out = [];
  for (let i = 0; i < parts.length; i++) {
    const seg = parts[i];
    if (out.length && /^[a-z]/.test(seg)) {
      out[out.length - 1] += " " + seg; // 小写标签/续句接回上一句
      // "A?" said X. "B." → 一句:仅当续引号是"纯引号"(自己不带标签→非另一说话人)才并入。
      // "B!" said Y.(自带标签)不是纯引号 → 不并,留作独立句。
      const nxt = parts[i + 1];
      if (nxt && isBareQuote(nxt)) {
        out[out.length - 1] += " " + nxt;
        i++;
      }
      continue;
    }
    out.push(seg);
  }
  return out;
}

function splitSentences(paragraph) {
  let t = paragraph.replace(/\s+/g, " ").trim();
  for (const a of ABBR) t = t.replace(new RegExp(`\\b${a.replace(/\./g, "\\.")}\\.`, "g"), (m) => m.replace(/\./g, "§"));
  t = t.replace(/(\d)\.(\d)/g, "$1§$2"); // 小数点
  const parts = (t.match(/[^.!?]+[.!?]+["'”’)\]]?|\S[^.!?]*$/g) || [t])
    .map((s) => s.replace(/§/g, ".").trim())
    .filter(Boolean);
  return rejoinDialogue(parts);
}

const raw = readFileSync(rawPath, "utf8");
const blocks = raw.split(/\r?\n(?=##\s)/); // 每个 "## " 前切开
const chapters = [];
let idx = 0;
for (const block of blocks) {
  const m = block.match(/^##\s*(.+)/);
  const title_en = m ? m[1].trim() : "";
  const body = m ? block.slice(block.indexOf("\n") + 1) : block;
  const paras = body.split(/\r?\n\s*\r?\n/).map((p) => p.trim()).filter(Boolean);
  const paragraphs = paras.map((p) => splitSentences(p).map((en) => ({ en, cn: null })));
  if (paragraphs.length) chapters.push({ idx: ++idx, title_en, title_zh: "", paragraphs });
}

const draft = {
  book_key: key,
  title: "",
  zh_title: "",
  author: "",
  age_band: "青少年",
  age_range: "",
  cover: { c1: "#334155", c2: "#0f172a" },
  intro_en: "",
  intro_zh: "",
  copyright_note: "",
  is_published: false,
  chapters,
};

const out = `scripts/library/books/${key}.draft.json`;
writeFileSync(out, JSON.stringify(draft, null, 2));
const nSent = chapters.reduce((a, c) => a + c.paragraphs.reduce((x, p) => x + p.length, 0), 0);
console.log(`✓ ${out} — ${chapters.length} 章 / ${nSent} 句(cn 待填;下一步 translate.mjs + 人工校对 + 补书元数据)`);
