/**
 * `/vocab` 全路径冒烟 —— **只判三件事:能不能开 / 有没有 4xx / 有没有失败文案**。
 *
 * ── 为什么要有它 ────────────────────────────────────────────────
 * 错题本从 PR-4 上线起一直是「加载失败 · 重试」,躺了几个月。不是因为它难发现,
 * 而是**没有任何一个环节会去打开它**:Aaron 验的是他刚提的需求,我验的是我刚改的文件,
 * 错题本既不在任何一次需求里、也不在任何一次改动里。
 *
 * 这个脚本抓不到细节(它不判内容对不对),但**能抓到"整页打不开"这一类** ——
 * 而错题本正是这一类。两分钟跑完,换的是"每个 PR 至少有人打开过每一页"。
 *
 * ── 两种模式,登录那半**不许静默跳过** ──────────────────────────
 *   · 匿名:永远跑。挡住白屏/路由错/公开数据 4xx。
 *   · 登录:给了 EMAIL/PASS 才跑。**没给就大声说跳过了**,不能让报告看起来是满分。
 * ⚠️ 登录态必须**硬校验**:上一轮就是注入会话没生效却照跑,14 条全 ✓,
 *    但那是未登录的世界 —— 掌握度写入、错题本闯关全程一条都没走到。
 * ⚠️ 而且测试账号最好是**脏的**(有错题/掌握度/收藏)。零数据账号只走得到空态分支,
 *    "空"和"坏"长得一样的 bug 它永远碰不到。见 fail-states.mjs。
 *
 * 用法:
 *   BASE=http://localhost:4173 node scripts/vocab/audit/e2e.mjs          # 只跑匿名
 *   BASE=... EMAIL=... PASS=... node scripts/vocab/audit/e2e.mjs         # 匿名 + 登录
 *   BASE=<vercel preview> VBP=<bypass token> ...                          # 打 preview 要带 bypass
 *
 * 退出码:0 = 全绿;1 = 有路径不通过 / 登录态该跑却跑不起来。
 * 末行固定输出 GATE_VERDICT —— **别用管道取退出码**(管道会吞掉,已踩过)。
 */
import { chromium } from "playwright";
import { loadEnv } from "../env.mjs";

const env = loadEnv(process.cwd(), { quiet: true });
const U = env.VITE_SUPABASE_URL, K = env.VITE_SUPABASE_PUBLISHABLE_KEY;
const BASE = (process.env.BASE || "http://localhost:4173").replace(/\/$/, "");
const { EMAIL, PASS, VBP } = process.env;

if (!U || !K) {
  console.error("✗ 缺 VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY —— 没有它们页面连数据都拉不到,跑了也是假绿");
  process.exit(1);
}

const PATHS = [
  ["/vocab", "词汇中心"], ["/vocab/today", "今日学习"], ["/vocab/scenes", "场景列表"],
  ["/vocab/toefl", "词库页"], ["/vocab/toefl/quiz", "英汉选择"], ["/vocab/toefl/match", "词汇配对"],
  ["/vocab/toefl/listen", "听音辨义"], ["/vocab/toefl/spell", "听写挑战"], ["/vocab/mistakes", "错题本"],
  ["/vocab/listen", "磨耳朵"], ["/vocab/chunks", "词块与习语"], ["/vocab/expressions", "中文这样说"],
  ["/vocab/confusion", "易混词辨析"], ["/vocab/dictation", "默写纸"],
];

/* 「失败文案」清单。⚠️ 加新的失败态文案时要同步加到这里,否则新写的失败态
   在冒烟里是隐形的 —— 那就白写了。
 *
 * ⚠️ **「页面加载出错」「应用已更新」这两条是 RouteErrorBoundary 的兜底文案,
 *    少了它们这道门抓不到"整页崩了"** —— 而那正是它存在的唯一理由。
 *    实测过:把 VocabMistakes 改成一进来就 throw,边界接住并渲染出 67 字的兜底页,
 *    正文长度过了空白阈值、又不含任何"加载失败"字样 → **整轮照样 PASS**。
 *    一个连整页崩溃都判绿的冒烟闸,比没有更糟(它给人已经验过的错觉)。 */
const FAIL_TEXT = /加载失败|没能加载出来|没能加载 ——|出错了|页面加载出错|应用已更新|Something went wrong|词库不存在/;

/* 控制台里出现它 = 某个路由组件抛到了错误边界。
 * ⚠️ 为什么单挑这一条而不是"有 console.error 就判失败":
 *    体检实测每一页都有 functions/v1/translate 的 CORS 报错(全站性,与本板块无关),
 *    按 console.error 一刀切会让这道门恒红,然后被人绕过。 */
const BOUNDARY_MARK = "[RouteErrorBoundary]";

const b = await chromium.launch();
const ctx = await b.newContext({
  viewport: { width: 390, height: 844 },
  ...(VBP ? { extraHTTPHeaders: { "x-vercel-protection-bypass": VBP } } : {}),
});
const page = await ctx.newPage();

const errs = [], net = [];
let crashed = false;            // 路由组件抛进了错误边界(见 BOUNDARY_MARK)
page.on("pageerror", e => { crashed = true; errs.push("pageerror: " + String(e).slice(0, 160)); });
page.on("console", m => {
  const t = m.text();
  if (m.type() !== "error") return;
  /* [vocab] ✗ 是我们**自己**打的静默失败日志(report.ts),它用的是 warn 不是 error;
     真走到这里说明是别的东西炸了,照记。 */
  if (t.includes(BOUNDARY_MARK)) crashed = true;
  errs.push("console: " + t.slice(0, 160));
});
page.on("response", res => {
  const u = res.url();
  if (u.includes("/rest/v1/") && res.status() >= 400) net.push(`${res.status()} ${u.split("/rest/v1/")[1].slice(0, 90)}`);
});

async function sweep(label) {
  console.log(`\n══ ${label} ══`);
  let ok = true;
  for (const [p, name] of PATHS) {
    errs.length = 0; net.length = 0; crashed = false;
    try {
      await page.goto(BASE + p, { waitUntil: "networkidle", timeout: 90000 });
    } catch {
      console.log(`✗ ${name.padEnd(10)} ${p.padEnd(22)} 导航超时`);
      ok = false; continue;
    }
    await page.waitForTimeout(3000);
    const t = await page.evaluate(() => document.body.innerText);
    const fail = FAIL_TEXT.test(t) || crashed;
    /* 去掉全站固定壳(底部 tab / 登录胶囊 / 返回)之后还剩不到 40 字 = 这一页其实没渲染出来 */
    const blank = t.replace(/Home|Courses|Mistakes|Me|首页|课程|错题|我的|登录|←|返回首页/g, "").trim().length < 40;
    const bad = fail || blank || net.length > 0;
    if (bad) ok = false;
    const flag = crashed ? "✗整页崩溃" : FAIL_TEXT.test(t) ? "✗失败文案" : blank ? "✗内容空白" : net.length ? "✗有4xx" : "✓";
    console.log(`${flag} ${name.padEnd(10)} ${p.padEnd(22)} 文本${String(t.length).padStart(5)}字  4xx/5xx:${net.length}  JS错:${errs.length}`);
    net.slice(0, 3).forEach(n => console.log(`      NET ${n}`));
    errs.slice(0, 2).forEach(e => console.log(`      JS  ${e}`));
    if (fail || blank) console.log(`      文本: ${t.slice(0, 150).replace(/\n/g, " | ")}`);
  }
  return ok;
}

let ok = await sweep("匿名(未登录)");

if (EMAIL && PASS) {
  const r = await fetch(`${U}/auth/v1/token?grant_type=password`, {
    method: "POST", headers: { apikey: K, "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASS }),
  });
  const s = await r.json();
  if (!s?.access_token) {
    console.error(`\n✗ 登录失败 —— 登录态这一半**判失败**,不是跳过:${JSON.stringify(s).slice(0, 160)}`);
    ok = false;
  } else {
    await page.goto(BASE + "/vocab", { waitUntil: "commit", timeout: 90000 });
    await page.evaluate(([k, sess]) => localStorage.setItem(k, JSON.stringify(sess)),
      [`sb-${new URL(U).hostname.split(".")[0]}-auth-token`, s]);
    await page.goto(BASE + "/vocab", { waitUntil: "networkidle", timeout: 90000 });
    await page.waitForTimeout(4000);
    /* 硬校验:登录后页面上一个"未登录"字样都不该有 */
    const loggedIn = await page.evaluate(() => !document.body.innerText.includes("未登录"));
    if (!loggedIn) {
      console.error("\n✗ 会话注入没生效,仍是未登录态 —— 登录态这一半判失败,不是跳过");
      ok = false;
    } else {
      console.log(`\n(测试用户 ${s.user.id})`);
      ok = await sweep(`登录态 · ${EMAIL}`) && ok;
    }
  }
} else {
  console.log("\n⚠️ 未给 EMAIL/PASS → **登录态整半没跑**。");
  console.log("   匿名那一半只能证明页面能开,证明不了掌握度写入 / 错题本闯关 / 今日学习结算。");
}

await b.close();
console.log(`\nGATE_VERDICT ${ok ? "PASS" : "FAIL"}`);
process.exit(ok ? 0 : 1);
