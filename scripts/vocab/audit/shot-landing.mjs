/**
 * 首页入口卡截图 —— 手机 + 桌面各一张,并**顺带量实际像素**。
 *
 * ⚠️ 只截图是不够的:本板块栽过两次"截图上看着正常、实际不对"
 *    (四条进度条全停在 3px、100% 的灰条与空轨道同色)。
 *    所以每次都同时打印 getBoundingClientRect / getComputedStyle 的实测值。
 *
 * 用法:
 *   BASE=http://localhost:4173 node scripts/vocab/audit/shot-landing.mjs
 *   打 Vercel preview 要带 VBP=<x-vercel-protection-bypass>(部署保护会 302 到 SSO)
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = (process.env.BASE || "http://localhost:4173").replace(/\/$/, "");
const OUT = process.env.OUT || "shots";
const { VBP } = process.env;
mkdirSync(OUT, { recursive: true });

const VIEWS = [
  { name: "mobile", width: 390, height: 844, dpr: 2 },
  { name: "desktop", width: 1440, height: 900, dpr: 1 },
];

const b = await chromium.launch();
for (const v of VIEWS) {
  const ctx = await b.newContext({
    viewport: { width: v.width, height: v.height },
    deviceScaleFactor: v.dpr,
    ...(VBP ? { extraHTTPHeaders: { "x-vercel-protection-bypass": VBP } } : {}),
  });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle", timeout: 120000 });
  await page.waitForTimeout(2500);

  /* 词汇卡:按链接 href 定位,不按文案 —— 文案正是这次要改的东西,
     用文案当选择器等于"改了就找不到",而"找不到"和"没问题"在输出里长得一样。 */
  const card = page.locator('a[href="/vocab"]').first();
  await card.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);

  const m = await card.evaluate(el => {
    const r = el.getBoundingClientRect();
    const h3 = el.querySelector("h3");
    const hs = h3 ? getComputedStyle(h3) : null;
    const hr = h3 ? h3.getBoundingClientRect() : null;
    const icon = el.querySelector("h3")?.previousElementSibling;
    const ir = icon ? icon.getBoundingClientRect() : null;
    const desc = h3?.nextElementSibling;
    const ds = desc ? getComputedStyle(desc) : null;
    return {
      cardW: Math.round(r.width), cardH: Math.round(r.height),
      title: h3?.textContent ?? "(没找到 h3)",
      titlePx: hs?.fontSize, titleWeight: hs?.fontWeight, titleAlign: hs?.textAlign,
      titleW: hr ? Math.round(hr.width) : null,
      /* 图标中线 vs 标题中线:要求"与标题同一垂直轴",差 ≤1px 才算对齐 */
      iconCx: ir ? Math.round(ir.left + ir.width / 2) : null,
      titleCx: hr ? Math.round(hr.left + hr.width / 2) : null,
      cardCx: Math.round(r.left + r.width / 2),
      descAlign: ds?.textAlign,
      /* 标题有没有被挤到换行:两行的话高度会明显大于 fontSize×1.2 */
      titleH: hr ? Math.round(hr.height) : null,
    };
  });

  console.log(`\n── ${v.name} ${v.width}×${v.height} @${v.dpr}x ──`);
  console.log(`  卡片        ${m.cardW}×${m.cardH}`);
  console.log(`  标题文案    「${m.title}」`);
  console.log(`  标题字号    ${m.titlePx} · 字重 ${m.titleWeight} · text-align ${m.titleAlign}`);
  console.log(`  标题占宽    ${m.titleW}px / 卡宽 ${m.cardW}px · 行高 ${m.titleH}px(单行则 ≈ 字号×1.1)`);
  console.log(`  说明文字    text-align ${m.descAlign}`);
  console.log(`  垂直轴      图标中线 ${m.iconCx} · 标题中线 ${m.titleCx} · 卡片中线 ${m.cardCx}`);
  const axisOk = m.iconCx !== null && Math.abs(m.iconCx - m.titleCx) <= 1 && Math.abs(m.titleCx - m.cardCx) <= 1;
  console.log(`  → ${axisOk ? "✓" : "✗"} 图标/标题/卡片三者同一垂直轴`);

  await page.screenshot({ path: `${OUT}/landing-${v.name}-full.png`, fullPage: false });
  await card.screenshot({ path: `${OUT}/landing-${v.name}-card.png` });
  console.log(`  截图        ${OUT}/landing-${v.name}-full.png · ${OUT}/landing-${v.name}-card.png`);
  await ctx.close();
}
await b.close();
