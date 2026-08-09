/**
 * 反馈层首屏判据 —— **答完一题后不滚动能不能看到**
 * 单词 + 音标 + 释义 + 至少第一条例句(含中译)。
 *
 * ⚠️ 判据不是"反馈层高度变小了",是**这四样在折线内**。高度变小但被推下去照样不合格。
 * ⚠️ 折线取 603 不是 667 —— BottomTabBar `fixed bottom-0` 高 64px 盖在内容上。
 * ⚠️ 反馈层挂载时会自己 `scrollIntoView({block:"start"})`,所以量的是**滚完之后**的位置:
 *    先等它滚稳,再取 `getBoundingClientRect()`(视口坐标,不加 scrollY)。
 *
 * ⚠️ 必须用**脏账号**(cc-audit2):零数据账号在错题本闯关里根本进不到题面。
 *
 * 用法:BASE=... EMAIL=... PASS=... [VBP=...] node scripts/vocab/audit/measure-feedback.mjs
 */
import { chromium } from "playwright";
import { loadEnv } from "../env.mjs";

const env = loadEnv(process.cwd(), { quiet: true });
const U = env.VITE_SUPABASE_URL, K = env.VITE_SUPABASE_PUBLISHABLE_KEY;
const BASE = (process.env.BASE || "http://localhost:4173").replace(/\/$/, "");
const { EMAIL, PASS, VBP } = process.env;

const VIEW = { width: 375, height: 667 };
const TABBAR = 64;
const FOLD = VIEW.height - TABBAR;   // 603

const r = await fetch(`${U}/auth/v1/token?grant_type=password`, {
  method: "POST", headers: { apikey: K, "Content-Type": "application/json" },
  body: JSON.stringify({ email: EMAIL, password: PASS }),
});
const s = await r.json();
if (!s?.access_token) { console.error("✗ 登录失败,整轮作废"); process.exit(1); }

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: VIEW, ...(VBP ? { extraHTTPHeaders: { "x-vercel-protection-bypass": VBP } } : {}) });
const page = await ctx.newPage();
await page.goto(BASE, { waitUntil: "commit", timeout: 120000 });
await page.evaluate(([k, sess]) => localStorage.setItem(k, JSON.stringify(sess)),
  [`sb-${new URL(U).hostname.split(".")[0]}-auth-token`, s]);

let ok = true;

for (const [path, name] of [["/vocab/toefl/quiz", "英汉选择"], ["/vocab/toefl/listen", "听音辨义"]]) {
  await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 120000 });
  await page.waitForTimeout(3500);

  /* 选项区:量 2×2 还是单列 —— 按**同一行上有几个按钮**判,不看 class
     (class 判等于把实现抄进探针,改个 class 名探针就静默失效)。 */
  /* ⚠️ 选项按钮要**认准了再点**。第一版用 `button` + 高度过滤,结果 5 个里混进一个
     别的按钮,点了它自然不出反馈层 —— 探针假阴性(已踩四次那一类)。
     现在:先在页面里把选项容器认出来(2×2 网格或 space-y 单列里的直接子 button),
     拿到文案后按文案点。文案是我们自己刚读出来的,不是写死的。 */
  const grid = await page.evaluate(() => {
    const btns = [...document.querySelectorAll("button")]
      .filter(el => el.offsetHeight >= 50 && el.offsetWidth > 80)
      /* 选项按钮的父容器里应当有 4 个兄弟按钮 —— 用这个把"孤零零的大按钮"排除掉 */
      .filter(el => el.parentElement && [...el.parentElement.children].filter(c => c.tagName === "BUTTON").length === 4);
    const tops = btns.map(el => Math.round(el.getBoundingClientRect().top));
    const perRow = new Map();
    tops.forEach(t => perRow.set(t, (perRow.get(t) || 0) + 1));
    const rows = [...perRow.values()];
    return { count: btns.length, maxPerRow: rows.length ? Math.max(...rows) : 0,
             texts: btns.slice(0, 4).map(el => el.textContent.trim().slice(0, 12)),
             minH: btns.length ? Math.min(...btns.map(el => Math.round(el.getBoundingClientRect().height))) : 0 };
  });
  console.log(`\n── ${name} ${path} ──`);
  console.log(`  选项 ${grid.count} 个 · 每行最多 ${grid.maxPerRow} 个 → ${grid.maxPerRow >= 2 ? "2×2 网格" : "单列"}`);
  console.log(`  选项文案 ${JSON.stringify(grid.texts)}`);
  console.log(`  最小按钮高 ${grid.minH}px ${grid.minH >= 44 ? "✓ 触控合规" : "✗ 低于 44px 触控下限"}`);
  if (grid.minH && grid.minH < 44) ok = false;

  /* 答一题 —— 点第一个选项,反馈层随即出现并自动滚到顶 */
  if (!grid.texts.length) { console.log("  ✗ 没认出选项按钮,本轮作废"); ok = false; continue; }
  await page.getByRole("button", { name: grid.texts[0], exact: true }).first()
    .click({ timeout: 20000 }).catch(e => console.log("  点击失败:", String(e).slice(0, 80)));
  await page.waitForTimeout(2500);

  const fb = await page.evaluate(() => {
    const txt = document.body.innerText;
    if (!/答对了|答错了/.test(txt)) return null;
    /* 反馈层 = 含"答对了/答错了"的那张卡 */
    const card = [...document.querySelectorAll("div")]
      .filter(el => /答对了|答错了/.test(el.textContent || "") && el.className.includes("rounded-2xl"))
      .sort((a, c) => a.getBoundingClientRect().height - c.getBoundingClientRect().height)[0];
    if (!card) return null;
    const q = sel => card.querySelector(sel);
    const rect = el => { const r = el.getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom) }; };
    /* 第一条例句块 = ExampleBlock 的第一个 py-2 容器里的中译 <p> */
    const ps = [...card.querySelectorAll("p")].filter(el => el.className.includes("pl-6"));
    return {
      cardH: Math.round(card.getBoundingClientRect().height),
      headword: q("span[style]") ? rect(q("span[style]")) : null,
      firstZh: ps[0] ? { ...rect(ps[0]), text: ps[0].textContent.trim().slice(0, 18) } : null,
      zhCount: ps.length,
    };
  });

  if (!fb) { console.log("  ✗ 没出现反馈层(可能这一题是听写/没答上)"); ok = false; continue; }
  console.log(`  反馈层高 ${fb.cardH}px`);
  console.log(`  单词行     top ${fb.headword?.top} bottom ${fb.headword?.bottom}`);
  console.log(`  第 1 条中译 top ${fb.firstZh?.top} bottom ${fb.firstZh?.bottom} 「${fb.firstZh?.text}」(共 ${fb.zhCount} 条例句)`);
  const pass = fb.firstZh && fb.firstZh.bottom <= FOLD && fb.firstZh.bottom > 0;
  console.log(`  → ${pass ? "✓" : "✗"} 单词+音标+释义+第一条例句(含中译)在折线 ${FOLD} 内`);
  if (!pass) ok = false;
}

await b.close();
console.log(`\nGATE_VERDICT ${ok ? "PASS" : "FAIL"}`);
process.exit(ok ? 0 : 1);
