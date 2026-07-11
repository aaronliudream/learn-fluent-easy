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

function splitSentences(paragraph) {
  let t = paragraph.replace(/\s+/g, " ").trim();
  for (const a of ABBR) t = t.replace(new RegExp(`\\b${a.replace(/\./g, "\\.")}\\.`, "g"), (m) => m.replace(/\./g, "§"));
  t = t.replace(/(\d)\.(\d)/g, "$1§$2"); // 小数点
  const parts = t.match(/[^.!?]+[.!?]+["'”’)\]]?|\S[^.!?]*$/g) || [t];
  return parts.map((s) => s.replace(/§/g, ".").trim()).filter(Boolean);
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
