/**
 * 「我的数据」四宫格改一行 —— **实测像素**,不看截图也不靠估。
 *
 * ── 为什么是组件级而不是整页 ────────────────────────────────────
 * 这四张卡只在**登录态**渲染(未登录走的是"登录后查看"那一支),
 * 而本机没有测试账号的 EMAIL/PASS,登录不了,量不到整页。
 * 所以这里退一步:**把 Cell 的真实 class 原样搬到一张静态页上量**。
 * 用的是 `npm run build` 出来的**真 CSS**,真浏览器排版,所以卡片高度是真的;
 * ⚠️ 但它**不能**证明面板在页面里的整体位置/滚动表现 —— 那部分我没验,汇报里要说。
 *
 * 判据:一行版单格高度必须明显小于两行版;4 列变体是否溢出也一并量了(回答"能不能再窄")。
 *
 * 用法:npm run build 之后 node scripts/vocab/audit/measure-mydata.mjs
 * 末行 GATE_VERDICT;别用管道取退出码。
 */
import { chromium } from "playwright";
import { readdirSync, writeFileSync, unlinkSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const DIST = path.join(process.cwd(), "dist");
const css = readdirSync(path.join(DIST, "assets")).find(f => f.startsWith("index-") && f.endsWith(".css"));
if (!css) { console.error("✗ dist/assets 里没找到 index-*.css,先跑 npm run build"); process.exit(2); }

/* 两版 Cell 的 class 必须与 MyDataPanel.tsx 里**逐字一致**,
   否则量的是另一个东西(这类"探针和被测对象漂移"已经踩过)。 */
const OLD_CELL = (label, value, unit) => `
  <div class="rounded-xl bg-slate-50/70 px-3.5 py-3">
    <div class="text-[12px] text-slate-500">${label}</div>
    <div class="mt-0.5 flex items-baseline gap-1">
      <span class="text-[24px] font-bold leading-none" style="font-variant-numeric:tabular-nums">${value}</span>
      <span class="text-[12px] text-slate-400">${unit}</span>
    </div>
  </div>`;

const NEW_CELL = (label, value, unit) => `
  <div class="flex items-baseline justify-between gap-2 rounded-xl bg-slate-50/70 px-3.5 py-2.5">
    <span class="shrink-0 text-[12px] text-slate-500">${label}</span>
    <span class="flex min-w-0 items-baseline gap-0.5">
      <span class="truncate text-[18px] font-bold leading-none" style="font-variant-numeric:tabular-nums">${value}</span>
      <span class="shrink-0 text-[11px] text-slate-400">${unit}</span>
    </span>
  </div>`;

/* 真实数据形态:最长的是"累计时长"(可能是 3 位数 + 小时) */
const DATA = [["累计学习", "302", "词"], ["累计掌握", "128", "词"], ["累计时长", "12.5", "小时"], ["积分", "1860", "分"]];
const grid = (cell, cols) =>
  `<div class="grid grid-cols-${cols} gap-3" data-probe="grid">${DATA.map(d => cell(...d)).join("")}</div>`;

const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="./assets/${css}"></head>
<body style="margin:0">
  <div style="width:375px">
    <div style="padding:20px" data-case="old2">${grid(OLD_CELL, 2)}</div>
    <div style="padding:20px" data-case="new2">${grid(NEW_CELL, 2)}</div>
    <div style="padding:20px" data-case="new4">${grid(NEW_CELL, 4)}</div>
  </div>
</body></html>`;

const file = path.join(DIST, "__measure-mydata.html");
writeFileSync(file, html, "utf8");

const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 375, height: 900 } });
await page.goto(pathToFileURL(file).href, { waitUntil: "load" });
await page.waitForTimeout(400);

const out = await page.evaluate(() => {
  const res = {};
  for (const box of document.querySelectorAll("[data-case]")) {
    const g = box.querySelector("[data-probe='grid']");
    const cells = [...g.children];
    const first = cells[0].getBoundingClientRect();
    /* 溢出判定:内容宽度超过可视宽度 = 挤不下(4 列变体就靠这条判) */
    const overflow = cells.some(c => c.scrollWidth > c.clientWidth + 1);
    res[box.dataset.case] = {
      gridH: Math.round(g.getBoundingClientRect().height),
      cellH: Math.round(first.height),
      cellW: Math.round(first.width),
      overflow,
    };
  }
  return res;
});
await b.close();
unlinkSync(file);

const { old2, new2, new4 } = out;
console.log(`视口 375px · 用 dist/assets/${css} 的真 CSS\n`);
console.log(`两行版(现状) 2 列:单格 ${old2.cellW}×${old2.cellH}px · 四宫格整体高 ${old2.gridH}px`);
console.log(`一行版(改后) 2 列:单格 ${new2.cellW}×${new2.cellH}px · 四宫格整体高 ${new2.gridH}px`);
console.log(`  → 单格矮 ${old2.cellH - new2.cellH}px,整块省 ${old2.gridH - new2.gridH}px\n`);
console.log(`一行版 4 列(试"能不能再窄"):单格 ${new4.cellW}×${new4.cellH}px · 内容溢出 ${new4.overflow ? "**是**" : "否"}`);

const shorter = new2.gridH < old2.gridH;
if (!shorter) console.log("\n✗ 改后没有变矮 —— 这次改动没达到目的");
console.log(`\nGATE_VERDICT ${shorter ? "PASS" : "FAIL"}`);
process.exit(shorter ? 0 : 1);
