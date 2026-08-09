/**
 * 「空态 ≠ 失败态」回归探针 —— **把查询打挂,看页面说的是哪句话**。
 *
 * 由来:错题本从 PR-4 上线起一直 400,catch 吞掉后渲染成"错题本是空的",
 * 和真的没错题一模一样,躺了几个月没人发现。修完之后必须有个东西能证明
 * "这次坏了会说人话" —— 不然下一次照样躺。
 *
 * ⚠️ 判据是**两句话不能是同一句**:
 *    失败时必须出现失败文案,且**不能**出现那句空态文案。
 *    只判"有没有失败文案"是不够的 —— 两句同时出现同样会把用户带偏。
 *
 * ⚠️ 必须用**有数据的脏账号**跑(cc-audit2)。零数据账号本来就走空态分支,
 *    空态和失败态长得一样它也照样"通过" —— 体检的最大教训就是这条。
 *
 * 打挂的方式:拦 PostgREST 请求直接回 500(不是 abort)——
 * abort 在部分实现里会被当成"取消"而不是"失败",走不到 catch。
 *
 * 用法:
 *   BASE=http://localhost:5273 EMAIL=... PASS=... node scripts/vocab/audit/fail-states.mjs
 */
import { chromium } from "playwright";
import { loadEnv } from "../env.mjs";

const env = loadEnv(process.cwd(), { quiet: true });
const U = env.VITE_SUPABASE_URL, K = env.VITE_SUPABASE_PUBLISHABLE_KEY;
const BASE = process.env.BASE || "http://localhost:5273";
const { EMAIL, PASS, VBP } = process.env;

if (!EMAIL || !PASS) { console.error("✗ 必须给 EMAIL/PASS(脏账号)。零数据账号跑这个没有意义。"); process.exit(1); }

/** 每个用例:打挂哪些表 → 必须出现哪些话 → 必须**不**出现哪些话 */
const CASES = [
  {
    path: "/vocab", name: "词汇中心",
    kill: ["user_vocab_mastery", "vocab_mistake_book", "vocab_user_stats", "vocab_study_days"],
    want: ["进度没能加载", "没能加载", "这次没能加载出来"],
    forbid: [
      "还没有学习记录",                    // 空态灰字:失败时绝不能说"你还没学过"
      "开始学习后这里会记录你的成长",       // 成长图空态
    ],
  },
  {
    path: "/vocab/toefl", name: "词库页",
    kill: ["user_vocab_mastery"],
    want: ["这次没能加载出来"],
    forbid: ["还没开始学这个词库"],        // 词库页空态提示
  },
];

const r = await fetch(`${U}/auth/v1/token?grant_type=password`, {
  method: "POST", headers: { apikey: K, "Content-Type": "application/json" },
  body: JSON.stringify({ email: EMAIL, password: PASS }),
});
const s = await r.json();
if (!s?.access_token) { console.error("✗ 登录失败,整轮作废:", JSON.stringify(s).slice(0, 200)); process.exit(1); }

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, ...(VBP ? { extraHTTPHeaders: { "x-vercel-protection-bypass": VBP } } : {}) });
const page = await ctx.newPage();
await page.goto(BASE, { waitUntil: "commit", timeout: 120000 });
await page.evaluate(([k, sess]) => localStorage.setItem(k, JSON.stringify(sess)),
  [`sb-${new URL(U).hostname.split(".")[0]}-auth-token`, s]);
/* 一次性提示会挡在主卡上方,量文案时先按"已看过"处理 */
await page.evaluate(() => localStorage.setItem("vocab_today_cta_hinted", "1"));

let ok = true;
for (const c of CASES) {
  await page.route("**/rest/v1/**", route => {
    const u = route.request().url();
    if (c.kill.some(t => u.includes(`/rest/v1/${t}`))) {
      return route.fulfill({ status: 500, contentType: "application/json",
        body: JSON.stringify({ code: "PGRST_TEST", message: "forced failure (fail-states probe)" }) });
    }
    return route.continue();
  });

  await page.goto(BASE + c.path, { waitUntil: "networkidle", timeout: 120000 });
  await page.waitForTimeout(4000);
  const t = await page.evaluate(() => document.body.innerText);

  const missing = c.want.filter(w => !t.includes(w));
  const leaked = c.forbid.filter(w => t.includes(w));
  const pass = !missing.length && !leaked.length;
  ok = pass && ok;
  console.log(`${pass ? "✓" : "✗"} ${c.name.padEnd(6)} ${c.path.padEnd(14)} 打挂 ${c.kill.join("/")}`);
  if (missing.length) console.log(`      缺失败文案: ${missing.join(" · ")}`);
  if (leaked.length) console.log(`      **把失败讲成了空**: ${leaked.join(" · ")}`);

  await page.unroute("**/rest/v1/**");
}

/* 反向一跑:不打挂任何东西,页面必须**没有**失败文案 ——
   否则"失败态"只是恒亮的装饰,证明不了任何事。 */
await page.goto(BASE + "/vocab", { waitUntil: "networkidle", timeout: 120000 });
await page.waitForTimeout(4000);
const normal = await page.evaluate(() => document.body.innerText);
const falseAlarm = ["进度没能加载", "这次没能加载出来", "今日学习没能加载"].filter(w => normal.includes(w));
console.log(`${falseAlarm.length ? "✗" : "✓"} 反向    /vocab          正常态不该出现失败文案`);
if (falseAlarm.length) { console.log(`      误报: ${falseAlarm.join(" · ")}`); ok = false; }

await b.close();
console.log(`\nGATE_VERDICT ${ok ? "PASS" : "FAIL"}`);
process.exit(ok ? 0 : 1);
