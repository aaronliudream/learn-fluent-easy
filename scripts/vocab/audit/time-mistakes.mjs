/**
 * 错题本「开始闯关」计时 —— 用户视角,不看代码看秒表。
 *
 * 量三段:
 *   ① 打开 /vocab/mistakes → 「开始闯关」按钮出现
 *   ② 按钮出现后**立刻点** → 第一道题出现(用户最真实的操作:一看到就点)
 *   ③ 页面数据全部就绪(网络静默)所需时间
 * 并统计整轮打了多少次 PostgREST 请求、其中 vocab_words 分片几次。
 *
 * ⚠️ 「按钮出现就点」这一步是关键:`startRound` 在词池没到位时是**静默 return**,
 *    点了什么都不发生 —— 这正是用户"连点好几下"的由来。
 *    量"等页面彻底静默再点"会把这个问题整个错过。
 *
 * 用法:BASE=... EMAIL=... PASS=... [VBP=...] node scripts/vocab/audit/time-mistakes.mjs
 */
import { chromium } from "playwright";
import { loadEnv } from "../env.mjs";

const env = loadEnv(process.cwd(), { quiet: true });
const U = env.VITE_SUPABASE_URL, K = env.VITE_SUPABASE_PUBLISHABLE_KEY;
const BASE = (process.env.BASE || "http://localhost:4173").replace(/\/$/, "");
const { EMAIL, PASS, VBP } = process.env;

const r = await fetch(`${U}/auth/v1/token?grant_type=password`, {
  method: "POST", headers: { apikey: K, "Content-Type": "application/json" },
  body: JSON.stringify({ email: EMAIL, password: PASS }),
});
const s = await r.json();
if (!s?.access_token) { console.error("✗ 登录失败,整轮作废"); process.exit(1); }

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 375, height: 667 }, ...(VBP ? { extraHTTPHeaders: { "x-vercel-protection-bypass": VBP } } : {}) });
const page = await ctx.newPage();

const reqs = [];
page.on("request", q => { if (q.url().includes("/rest/v1/")) reqs.push({ url: q.url(), t: Date.now() }); });

await page.goto(BASE, { waitUntil: "commit", timeout: 120000 });
await page.evaluate(([k, sess]) => localStorage.setItem(k, JSON.stringify(sess)),
  [`sb-${new URL(U).hostname.split(".")[0]}-auth-token`, s]);

reqs.length = 0;
const t0 = Date.now();
await page.goto(BASE + "/vocab/mistakes", { waitUntil: "commit", timeout: 120000 });

/* ① 按钮出现 */
const btn = page.getByRole("button", { name: /开始闯关|继续闯关|正在出题/ }).first();
await btn.waitFor({ state: "visible", timeout: 60000 }).catch(() => {});
const tBtn = Date.now() - t0;

/* ② 立刻点 —— 模拟用户"一看到就点" */
const tClick = Date.now();
await btn.click({ timeout: 20000 }).catch(e => console.log("点击失败:", String(e).slice(0, 80)));

/* 第一道题出现 = 页面上出现「第 N 题」或四个选项按钮 */
let tQ = null, clicks = 1;
for (let i = 0; i < 120; i++) {
  const has = await page.evaluate(() => {
    const btns = [...document.querySelectorAll("button")]
      .filter(el => el.offsetHeight >= 50 && el.parentElement
        && [...el.parentElement.children].filter(c => c.tagName === "BUTTON").length === 4);
    return btns.length === 4;
  });
  if (has) { tQ = Date.now() - tClick; break; }
  /* 每 2 秒补点一次 —— 真实用户就是这么干的,顺便验证"连点会不会出问题" */
  if (i > 0 && i % 20 === 0) { await btn.click({ timeout: 5000 }).catch(() => {}); clicks++; }
  await page.waitForTimeout(100);
}

await page.waitForLoadState("networkidle", { timeout: 120000 }).catch(() => {});
const tIdle = Date.now() - t0;

const wordsReqs = reqs.filter(q => q.url.includes("vocab_words"));
console.log(`\n══ 错题本「开始闯关」计时(SE 375×667,${EMAIL})══`);
console.log(`① 打开页面 → 按钮出现          ${tBtn} ms`);
console.log(`② 按钮一出现就点 → 第一道题出现  ${tQ === null ? "**120 秒内没出题**" : tQ + " ms"}(期间补点 ${clicks - 1} 次)`);
console.log(`③ 页面网络彻底静默              ${tIdle} ms`);
console.log(`\nPostgREST 请求总数 ${reqs.length} · 其中 vocab_words ${wordsReqs.length} 次`);
if (wordsReqs.length > 3) console.log(`  ⚠️ vocab_words 打了 ${wordsReqs.length} 次 —— 典型的"按 id 分片拉整库"形态`);
await b.close();
