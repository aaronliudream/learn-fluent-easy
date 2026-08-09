/**
 * 测验方向硬判据 —— **题干与选项不得同为中文**(Aaron 2026-08-09 立)。
 *
 * 考"会不会说" → 中文题干 + 英文选项;考"看不看得懂" → 英文题干 + 中文选项。
 * 两边都是中文,说明这道题没在考英语。
 *
 * ⚠️ 这道门是**真机跑**不是读代码:出题逻辑散在各页面里,读代码容易漏掉
 *    "题干模板是中文但插值进去的是英文"这种情况。所以直接进页面、点开测验、
 *    把题干和四个选项的**实际文本**取出来判。
 *
 * 判定:一段文本含中日韩字符即视为"中文侧"。题干与全部选项同为中文 → FAIL。
 * ⚠️ 允许"题干中文 + 选项英文"(中文这样说)与"题干英文 + 选项中文"(习语)两种。
 *
 * 用法:BASE=... EMAIL=... PASS=... [VBP=...] node scripts/vocab/audit/quiz-direction.mjs
 */
import { chromium } from "playwright";
import { loadEnv } from "../env.mjs";

const env = loadEnv(process.cwd(), { quiet: true });
const U = env.VITE_SUPABASE_URL, K = env.VITE_SUPABASE_PUBLISHABLE_KEY;
const BASE = (process.env.BASE || "http://localhost:4173").replace(/\/$/, "");
const { EMAIL, PASS, VBP } = process.env;

const CJK = /[㐀-鿿぀-ヿ가-힯]/;

/** 每个用例:进哪一页、点哪个按钮开测验 */
const CASES = [
  { path: "/vocab/chunks", name: "词块测验", tab: "词块" },
  { path: "/vocab/chunks", name: "习语测验", tab: "习语" },
  { path: "/vocab/expressions", name: "中文这样说", tab: null },
];

const r = await fetch(`${U}/auth/v1/token?grant_type=password`, {
  method: "POST", headers: { apikey: K, "Content-Type": "application/json" },
  body: JSON.stringify({ email: EMAIL, password: PASS }),
});
const s = await r.json();
if (!s?.access_token) { console.error("✗ 登录失败,整轮作废"); process.exit(1); }

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, ...(VBP ? { extraHTTPHeaders: { "x-vercel-protection-bypass": VBP } } : {}) });
const page = await ctx.newPage();
await page.goto(BASE, { waitUntil: "commit", timeout: 120000 });
await page.evaluate(([k, sess]) => localStorage.setItem(k, JSON.stringify(sess)),
  [`sb-${new URL(U).hostname.split(".")[0]}-auth-token`, s]);

let ok = true;
for (const c of CASES) {
  await page.goto(BASE + c.path, { waitUntil: "networkidle", timeout: 120000 });
  await page.waitForTimeout(3000);
  if (c.tab) await page.getByRole("button", { name: c.tab, exact: false }).first().click({ timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(800);
  /* ⚠️ 入口按钮统一以「测一测」开头。第一版用 /测验|练一练|开始/ 匹配,
     结果点到了页面顶部的分类标签,取到的"选项"是「词块 100 / 习语 50」——
     探针根本没进测验就报了 FAIL。**报应用坏之前先怀疑探针**(已踩四次)。 */
  await page.getByRole("button", { name: /^测一测/ }).first().click({ timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(2200);
  /* 硬校验:确实进了测验(测验里有「第 N / M 题」这类计数或退出入口) */
  const inQuiz = await page.evaluate(() => /\d+\s*\/\s*\d+/.test(document.body.innerText));
  if (!inQuiz) { console.log(`?  ${"".padEnd(0)}(没进入测验,本条作废)`); }

  const q = await page.evaluate(() => {
    /* 选项 = 同一父节点下 ≥2 个并列 button 且都有文字 */
    const groups = new Map();
    for (const el of document.querySelectorAll("button")) {
      const p = el.parentElement; if (!p) continue;
      const sibs = [...p.children].filter(x => x.tagName === "BUTTON" && (x.textContent || "").trim());
      if (sibs.length >= 2 && sibs.length <= 6) groups.set(p, sibs);
    }
    let best = null;
    for (const [, sibs] of groups) if (!best || sibs.length > best.length) best = sibs;
    if (!best) return null;
    const options = best.map(x => x.textContent.trim());
    /* 题干 = 选项容器之前最近的一段较长文本 */
    const box = best[0].parentElement;
    let stem = "";
    let n = box.previousElementSibling;
    while (n && !stem) { const t = (n.textContent || "").trim(); if (t.length > 1) stem = t; n = n.previousElementSibling; }
    if (!stem && box.parentElement) stem = (box.parentElement.textContent || "").replace(options.join(""), "").trim().slice(0, 120);
    return { stem, options };
  });

  if (!q) { console.log(`?  ${c.name.padEnd(12)} 没找到测验题(入口文案可能变了)`); ok = false; continue; }
  const stemZh = CJK.test(q.stem);
  const optZh = q.options.map(o => CJK.test(o));
  const allOptZh = optZh.every(Boolean);
  const bad = stemZh && allOptZh;
  if (bad) ok = false;
  console.log(`${bad ? "✗" : "✓"} ${c.name.padEnd(12)} 题干${stemZh ? "中文" : "英文"} · 选项${allOptZh ? "全中文" : optZh.some(Boolean) ? "中英混" : "全英文"}`);
  console.log(`     题干:${q.stem.replace(/\s+/g, " ").slice(0, 60)}`);
  console.log(`     选项:${q.options.map(o => o.slice(0, 14)).join(" | ")}`);
  if (bad) console.log(`     ✗ **题干与选项同为中文 —— 这道题没在考英语**`);
}

await b.close();
console.log(`\nGATE_VERDICT ${ok ? "PASS" : "FAIL"}`);
process.exit(ok ? 0 : 1);
