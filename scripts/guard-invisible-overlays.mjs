#!/usr/bin/env node
/**
 * push 前硬卡口:禁止「看不见但吃点击」的全屏拦截层。
 *
 * 立为禁令的背景(2026-08-05,Aaron 提):偶发全页点不动、只有刷新能恢复。
 * 一个 position:fixed + inset:0 + 有 z-index、却完全透明的容器,用户看不见任何提示,
 * 却会吃掉整页每一次点击 —— 这类 bug 从现象上根本无法定位。所以直接从源头禁掉:
 *
 *   任何全屏遮罩必须可见(半透明底色 / backdrop-blur / 渐变都算),
 *   否则必须显式 pointer-events-none(纯装饰层,不拦截)。
 *
 * 例外写法:在该行**上方 3 行内**写注释 `overlay-ok: <理由>`(理由必须写清为什么它不是隐形拦截层)。
 *
 * 用法:npm run check:overlays  (退出码 0 = 通过)
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const SRC = join(ROOT, "src");

/** 判定"这层看得见":有底色/图片/渐变/毛玻璃/边框,或它本身就不拦截点击。 */
const VISIBLE_HINTS = [
  /\bbg-(?!transparent\b)[\w[\]#./%-]+/, //  bg-black/40、bg-card、bg-[#fff]…(bg-transparent 不算)
  /\bbackdrop-(blur|brightness|saturate)/,
  /\bpointer-events-none\b/, //              装饰层,不吃点击
  /\bhidden\b/,
  /\bborder-[lrtb]?\b/,
];

const INLINE_VISIBLE = /background|backdrop-filter|pointer-events\s*:\s*none/;

const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (name === "node_modules" || name === "_archived") continue;
      walk(p);
    } else if (/\.(tsx|ts)$/.test(name)) {
      files.push(p);
    }
  }
})(SRC);

const hits = [];

for (const file of files) {
  const lines = readFileSync(file, "utf8").split(/\r?\n/);
  lines.forEach((line, i) => {
    // 豁免注释允许写在上方 3 行内(JSX 里常常隔着 `return (` 这一行)。
    const near = [lines[i - 3], lines[i - 2], lines[i - 1], line].join("\n");
    if (/overlay-ok:/.test(near)) return;

    // ① Tailwind 写法:className 里同时有 fixed 和 inset-0
    const isTwFullScreen = /\bfixed\b/.test(line) && /\binset-0\b/.test(line);
    // ② 内联样式写法:position:fixed 且 inset:0
    const isInlineFullScreen = /position\s*:\s*fixed/.test(line) && /inset\s*:\s*0/.test(line);

    if (!isTwFullScreen && !isInlineFullScreen) return;

    const visible = isInlineFullScreen
      ? INLINE_VISIBLE.test(line)
      : VISIBLE_HINTS.some((re) => re.test(line));

    if (!visible) {
      hits.push({ file: relative(ROOT, file), line: i + 1, text: line.trim().slice(0, 160) });
    }
  });
}

if (hits.length > 0) {
  console.error(`\n❌ 发现 ${hits.length} 处「隐形全屏遮罩」,禁止 push\n`);
  for (const h of hits) console.error(`   ${h.file}:${h.line}\n     ${h.text}`);
  console.error(
    "\n禁令:全屏遮罩必须可见(半透明底色/毛玻璃),纯装饰层必须写 pointer-events-none。" +
      "\n确实是例外的,在上一行加注释 `overlay-ok: <理由>`。\n",
  );
  process.exit(1);
}

console.log(`✅ 隐形全屏遮罩 = 0(扫描 ${files.length} 个文件)`);
