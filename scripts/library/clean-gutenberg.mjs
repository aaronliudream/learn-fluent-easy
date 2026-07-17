/**
 * 图书馆:Project Gutenberg 纯文本(TXT)清洗 → 分章标记正文,供 segment.mjs 消费。
 * 只处理 Gutenberg TXT(不是 PDF)。产物是 "## 章标题" 标记的干净正文。
 *
 * 做的事:
 *  1. 只取 "*** START OF THE PROJECT GUTENBERG EBOOK ... ***" 与 "*** END ... ***" 之间。
 *  2. 丢弃正文前的前言/目录/题献/题图:从第一处「章头」起才是故事正文。
 *     Gutenberg 正文里章头是两行:"Chapter I"(单独一行)+ 下一非空行为章标题;
 *     目录里则是 "Chapter I. The Cyclone"(带句点、标题同行)—— 据此区分,丢掉目录。
 *  3. 每个章头 → "## <章标题>"(segment.mjs 据 ## 顺序赋 chapter_idx=1..N 真实章号)。
 *  4. 去 [Illustration] / [Illustration: ...] 行;折叠 3+ 连续空行为 1 个空行。
 *
 * 用法:node scripts/library/clean-gutenberg.mjs <in.txt> <out.txt>
 */
import { readFileSync, writeFileSync } from "node:fs";

const [, , inPath, outPath, ...flags] = process.argv;
// --numbered:章头是「CHAPTER <罗马>」但无独立标题行(如 Tom Sawyer),标题记 "Chapter N"、正文首行不被吞。
const NUMBERED = flags.includes("--numbered");
if (!inPath || !outPath) {
  console.error("用法: node scripts/library/clean-gutenberg.mjs <in.txt> <out.txt> [--numbered]");
  process.exit(1);
}

const raw = readFileSync(inPath, "utf8");
let lines = raw.split(/\r?\n/);

// 1) 取 START/END 之间
const startIdx = lines.findIndex((l) => /\*\*\*\s*START OF (THE|THIS) PROJECT GUTENBERG/i.test(l));
const endIdx = lines.findIndex((l) => /\*\*\*\s*END OF (THE|THIS) PROJECT GUTENBERG/i.test(l));
if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
  console.error("找不到 Gutenberg START/END 标记,请人工确认文件。");
  process.exit(1);
}
lines = lines.slice(startIdx + 1, endIdx);

// 2) 正文起点 = 第一处「单独成行的章头」(^Chapter <roman>$),之前全是前言/目录/题献
const CH_HEAD = /^\s*Chapter\s+([IVXLCDM]+)\s*$/i;
const ROMAN = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
function romanToArabic(r) {
  const s = r.toUpperCase();
  let n = 0;
  for (let i = 0; i < s.length; i++) {
    const cur = ROMAN[s[i]], nxt = ROMAN[s[i + 1]] || 0;
    n += cur < nxt ? -cur : cur;
  }
  return n;
}
const bodyStart = lines.findIndex((l) => CH_HEAD.test(l));
if (bodyStart === -1) {
  console.error("找不到正文章头(^Chapter <罗马数字>$)。这本书的章头格式可能不同,先停下报你。");
  process.exit(1);
}
lines = lines.slice(bodyStart);

// 3) 逐行转换:章头两行 → "## 标题";去 [Illustration]
const out = [];
let chapters = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (/^\s*\[Illustration/i.test(line)) continue; // 去题图
  const m = line.match(CH_HEAD);
  if (m) {
    chapters += 1;
    if (NUMBERED) {
      // 无独立标题:标题记 "Chapter N",正文首行不吞(下一行照常进正文)。
      out.push("", `## Chapter ${romanToArabic(m[1])}`, "");
      continue;
    }
    // 有独立标题:下一非空行 = 章标题,吞掉它。
    let j = i + 1;
    while (j < lines.length && lines[j].trim() === "") j++;
    const title = (lines[j] ?? "").trim();
    out.push("", `## ${title}`, "");
    i = j; // 跳过标题行
    continue;
  }
  out.push(line);
}

// 4) 折叠多余空行
let text = out.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";

writeFileSync(outPath, text);
console.log(`✓ ${outPath} — ${chapters} 章;${text.length} 字符(原 ${raw.length})`);
