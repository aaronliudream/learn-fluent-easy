/**
 * 首屏实测 —— 量 `getBoundingClientRect().bottom` 的**真实像素**,不看截图。
 *
 * 由来:词汇板块已经栽过两次"截图上看着正常、实际不对"
 * (四条进度条全停在 3px、100% 的灰条与空轨道同色)。所以判据一律是数字。
 *
 * 判据(IA 重排规格第五节):
 *   iPhone SE 375×667,**登录 / 未登录两种状态**下,首屏都要能完整看到
 *   **词库卡 + 今日学习主卡(含底部动作按钮)**。
 *   数据类模块(学习进度 / 成长图 / 我的数据 / 月历)全部在首屏之外。
 *
 * ⚠️ 折线不是 667 —— 全站 BottomTabBar 是 `fixed bottom-0` 高 4rem(64px),
 *    它盖在内容上。所以真正的可视底边 = 667 - 64 = 603。按 667 判会放过被压住的元素。
 *
 * 用法:
 *   BASE=http://localhost:5273 node scripts/vocab/audit/measure-fold.mjs
 *   加 EMAIL/PASS 则同时量登录态(用脏账号才有意义,零数据账号只走空态分支)。
 *   BASE 指向 Vercel preview 时还要给 VBP=<bypass token>(部署保护)。
 */
import { chromium } from "playwright";
import { loadEnv } from "../env.mjs";

const env = loadEnv(process.cwd(), { quiet: true });
const U = env.VITE_SUPABASE_URL, K = env.VITE_SUPABASE_PUBLISHABLE_KEY;
const BASE = process.env.BASE || "http://localhost:5273";
const { EMAIL, PASS, VBP } = process.env;

const VIEWPORT = { width: 375, height: 667 };
const TABBAR = 64;                       // fixed bottom-0 h-16
const FOLD = VIEWPORT.height - TABBAR;   // 603

/** 页面里按文案找元素,回报它的底边。文案变了要同步改这里。 */
const PROBES = [
  ["场景串记横幅", "a[href='/vocab/scenes']"],
  ["当前词库卡", "[data-probe='bank-card']"],
  ["今日学习主卡", "[data-probe='today-card']"],
  ["主卡动作按钮", "[data-probe='today-cta']"],
  ["其他训练组", "[data-probe='study-modes']"],
  ["学习进度卡", "[data-probe='stats-panel']"],
];

async function measure(page, label) {
  const rows = await page.evaluate(probes => probes.map(([name, sel]) => {
    const el = document.querySelector(sel);
    if (!el) return { name, missing: true };
    const r = el.getBoundingClientRect();
    return { name, top: Math.round(r.top + window.scrollY), bottom: Math.round(r.bottom + window.scrollY), h: Math.round(r.height) };
  }), PROBES);

  /* 把主卡文案原样打出来 —— 光有像素数看不出这一屏是登录态还是空态,
     报告里少了这行就没法自证"量的是哪个世界"。 */
  const cardText = await page.evaluate(() =>
    (document.querySelector("[data-probe='today-card']")?.textContent || "(无主卡)").replace(/\s+/g, " ").trim());

  console.log(`\n── ${label} ──  视口 ${VIEWPORT.width}×${VIEWPORT.height},折线 ${FOLD}(已扣 ${TABBAR}px 底栏)`);
  console.log(`  主卡文案:${cardText}`);
  for (const r of rows) {
    if (r.missing) { console.log(`  ?  ${r.name.padEnd(14)} 未找到`); continue; }
    const inFold = r.bottom <= FOLD;
    console.log(`  ${inFold ? "✓" : "·"}  ${r.name.padEnd(14)} top ${String(r.top).padStart(4)}  bottom ${String(r.bottom).padStart(4)}  高 ${String(r.h).padStart(3)}  ${inFold ? "首屏内" : "折线外"}`);
  }
  const by = Object.fromEntries(rows.filter(r => !r.missing).map(r => [r.name, r]));
  const must = ["当前词库卡", "今日学习主卡", "主卡动作按钮"];
  const bad = must.filter(n => !by[n] || by[n].bottom > FOLD);
  console.log(bad.length ? `  ✗ 首屏判据不通过:${bad.join(" / ")} 掉出折线` : "  ✓ 首屏判据通过:词库卡 + 主卡 + 动作按钮全部可见");
  /* 数据模块必须在折线外 —— 在里面说明又把图表提到主 CTA 之前了 */
  const dataIn = ["学习进度卡"].filter(n => by[n] && by[n].top < FOLD);
  console.log(dataIn.length ? `  ✗ 数据模块进了首屏:${dataIn.join(" / ")}` : "  ✓ 数据模块全部在首屏之外");
  return bad.length === 0 && dataIn.length === 0;
}

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: VIEWPORT, ...(VBP ? { extraHTTPHeaders: { "x-vercel-protection-bypass": VBP } } : {}) });
const page = await ctx.newPage();
let ok = true;

/* ① 未登录 —— 顺便把一次性提示的 localStorage 清干净,量的是**第一次来**的样子 */
await page.goto(`${BASE}/vocab`, { waitUntil: "networkidle", timeout: 120000 });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "networkidle", timeout: 120000 });
await page.waitForTimeout(3500);
ok = await measure(page, "未登录 · 首次进入(含一次性提示)") && ok;

/* 提示点掉之后再量一次 —— 老用户看到的是这个版本 */
await page.evaluate(() => localStorage.setItem("vocab_today_cta_hinted", "1"));
await page.reload({ waitUntil: "networkidle", timeout: 120000 });
await page.waitForTimeout(3500);
ok = await measure(page, "未登录 · 提示已点掉") && ok;

/* ② 登录态(脏账号)。⚠️ 必须硬校验登录成功 —— 上一轮就是没登上却照跑,
      14 条全 ✓ 但那是未登录的世界。 */
if (EMAIL && PASS) {
  const r = await fetch(`${U}/auth/v1/token?grant_type=password`, {
    method: "POST", headers: { apikey: K, "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASS }),
  });
  const s = await r.json();
  if (!s?.access_token) { console.error("\n✗ 登录失败,登录态这一半作废:", JSON.stringify(s).slice(0, 200)); ok = false; }
  else {
    const key = `sb-${new URL(U).hostname.split(".")[0]}-auth-token`;
    await page.evaluate(([k, sess]) => localStorage.setItem(k, JSON.stringify(sess)), [key, s]);
    await page.goto(`${BASE}/vocab`, { waitUntil: "networkidle", timeout: 120000 });
    await page.waitForTimeout(4500);
    /* ⚠️ 判据取「页面上一个"未登录"字样都没有」——
       /vocab 的未登录分支(主卡副标题、空态灰字)必然含这两个字,登录后一处都不含。
       别去匹配某一句具体文案:文案一改探针就静默失效,而"探针没匹配上"和
       "真的登录了"在输出里长得一模一样(Playwright 假阴性已踩过四次)。 */
    const loggedIn = await page.evaluate(() => !document.body.innerText.includes("未登录"));
    if (!loggedIn) { console.error("\n✗ 仍是未登录态 —— 登录态这一半作废"); ok = false; }
    else ok = await measure(page, `登录态 · 脏账号 ${EMAIL}`) && ok;
  }
} else {
  console.log("\n(跳过登录态:没给 EMAIL/PASS。零数据账号只走空态分支,量了也不算数)");
}

await b.close();
console.log(`\nGATE_VERDICT ${ok ? "PASS" : "FAIL"}`);   // 末行给退出码用,别用管道取(管道会吞掉)
process.exit(ok ? 0 : 1);
