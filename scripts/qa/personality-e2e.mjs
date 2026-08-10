/**
 * 性格测评端到端门 —— 真答完 60 题,核对页面给出的类型。
 *
 * ★为什么不能只靠单测★
 * 单测只证明「给定 answers 对象 → 算出 ESTJ-A」。它证明不了:
 * 页面把哪个圆点写进了 answers、题目顺序有没有漏题、翻页会不会丢作答、
 * 中英两版是不是同一套计分。这道门把这一整条链路跑一遍:
 *   读题库源码 → 按目标类型决定每道题点第几个圆点 → 真点 → 读页面上的字母。
 *
 * ★怎么保证这道门不是「摆设绿」★
 * 带 --mutate 跑一遍:所有题一律点中间那个圆点。这时页面必然给出 INFP-T
 * (平衡计分下全中点),与期望的 ESTJ-A 不符 → 门必须变红。
 * 门写完之后**必须**跑一次 --mutate 确认它会红,否则你不知道它在不在工作。
 *
 * 用法:
 *   npm run build && node scripts/qa/personality-e2e.mjs
 *   node scripts/qa/personality-e2e.mjs --mutate     # 变异测试,期望 FAIL
 *   node scripts/qa/personality-e2e.mjs --base=https://xxx.vercel.app
 */
import { spawn, spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { chromium } from 'playwright';

const arg = (k, d) => (process.argv.find((a) => a.startsWith(`--${k}=`))?.split('=')[1]) ?? d;
const MUTATE = process.argv.includes('--mutate');
const EXTERNAL = arg('base', '');
const PORT = Number(arg('port', '4174'));
const BASE = EXTERNAL || `http://localhost:${PORT}`;

/* ── 1. 从题库源码解析出 (语句 → key) ───────────────────────────── */
const src = readFileSync('src/lib/personality/items.ts', 'utf8');
const ITEM_RE = /\{ id: "(\w+)", scale: "(\w+)", key: (-?1), en: "([^"]*)", zh: "([^"]*)" \}/g;
const items = [];
for (const m of src.matchAll(ITEM_RE)) {
  items.push({ id: m[1], scale: m[2], key: Number(m[3]), en: m[4], zh: m[5] });
}
if (items.length !== 60) {
  console.log(`PERSONALITY_E2E_VERDICT: FAIL(题库解析出 ${items.length} 题,期望 60 —— 先修解析器再谈别的)`);
  process.exit(1);
}
const byText = new Map();
for (const it of items) {
  byText.set(it.zh, it);
  byText.set(it.en, it);
}

/**
 * 目标类型 → 每题该点第几个圆点(1-5)。
 *
 * 每个量表的「A 极」字母依次是 E/S/T/J/A。目标字母落在 A 极就把该量表全推高
 * (key=+1 的题选 5、key=-1 的题选 1,翻转后每题都是 5),落在 B 极就全推低。
 *
 * ⚠️ 两轮的目标类型**不能是同一个**,也不能有一个恰好等于变异模式的产物。
 *    变异模式全点中间 → 平衡计分下必出 INFP-T;所以英文那轮如果也测 INFP-T,
 *    --mutate 就杀不到它(第一版踩过:变异只把中文那轮判红,英文全绿)。
 */
const A_POLE = { EI: 'E', SN: 'S', TF: 'T', JP: 'J', AT: 'A' };
const SCALES_IN_CODE = ['EI', 'SN', 'TF', 'JP'];
function planFor(code) {
  const [type, suffix] = code.split('-');
  const wantHigh = {};
  SCALES_IN_CODE.forEach((s, i) => { wantHigh[s] = type[i] === A_POLE[s]; });
  wantHigh.AT = suffix === A_POLE.AT;
  return (it) => {
    const high = wantHigh[it.scale];
    return high ? (it.key === 1 ? 5 : 1) : it.key === 1 ? 1 : 5;
  };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function waitServer(url, tries = 60) {
  for (let i = 0; i < tries; i++) {
    try { if ((await fetch(url)).ok) return true; } catch { /* 还没起来 */ }
    await sleep(500);
  }
  return false;
}

/**
 * ★踩过的坑:端口上有别人的 preview★
 * Windows 上 spawn(shell:true) 的 kill 只杀掉 cmd 外壳,vite 子进程会活下来。
 * 下一次跑的时候 --strictPort 抢不到端口、新 preview 悄悄退出,而 waitServer
 * 却能连上**上一次的旧 dist** —— 门于是对着旧构建打分,红绿都不作数。
 * 所以先探一下:端口已经有人,直接退出并说清楚,绝不将就复用。
 */
let server = null;
if (!EXTERNAL) {
  let occupied = false;
  try { occupied = (await fetch(BASE)).ok; } catch { occupied = false; }
  if (occupied) {
    console.log(`PERSONALITY_E2E_VERDICT: FAIL(端口 ${PORT} 上已经有服务在跑 —— 那多半是上一次没杀干净的 preview,`);
    console.log(`  它服务的是旧 dist,继续跑出来的结论不作数。先 taskkill,或换 --port=xxxx)`);
    process.exit(2);
  }
  server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore', shell: true });
  if (!(await waitServer(BASE))) {
    console.log(`PERSONALITY_E2E_VERDICT: FAIL(preview 起不来 @ ${BASE})`);
    stopServer();
    process.exit(1);
  }
}

/** Windows 上必须连着进程树一起杀,否则端口会一直被占着(见上面那段注释)。 */
function stopServer() {
  if (!server) return;
  // ★必须同步★ 用 spawn 起 taskkill,脚本抛异常退出时子进程根本来不及跑,
  // 端口就一直被占着(第一版就是这么留下三个僵尸 preview 的)。
  if (process.platform === 'win32' && server.pid) {
    try {
      spawnSync('taskkill', ['/pid', String(server.pid), '/T', '/F'], { stdio: 'ignore', shell: true });
    } catch { /* 尽力而为 */ }
  }
  server.kill();
}

const problems = [];
const note = (ok, msg) => { console.log(`  ${ok ? '✓' : '✗'} ${msg}`); if (!ok) problems.push(msg); };

/** 跑完一整轮:选语言 → 开始 → 12 屏 × 5 题 → 结果页。返回结果页读到的东西。 */
async function runOnce(page, lang, expectedCode) {
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));

  await page.goto(`${BASE}/personality?lang=${lang}`, { waitUntil: 'networkidle' });

  // 介绍页 → 开始(第一个按钮就是主 CTA)
  // ★别用 'main button' 抓主 CTA★ 顶栏(含中/英切换)就在 <main> 里,
  // first() 抓到的是语言按钮 —— 点了它测评根本不会开始,门却一路等到超时。
  await page.locator('[data-testid="pt-start"]').click();
  await page.waitForSelector('[data-testid="pt-progress"]');

  const plan = planFor(expectedCode);
  let answered = 0;
  for (let screen = 0; screen < 12; screen++) {
    const groups = page.locator('[role="radiogroup"]');
    const count = await groups.count();
    if (count !== 5) return { fatal: `第 ${screen + 1} 屏有 ${count} 道题,期望 5` };
    for (let i = 0; i < count; i++) {
      const g = groups.nth(i);
      const statement = (await g.getAttribute('aria-label')) ?? '';
      const item = byText.get(statement);
      if (!item) return { fatal: `第 ${screen + 1} 屏第 ${i + 1} 题在题库里找不到:「${statement.slice(0, 30)}…」` };
      // ★变异开关★ 一律点中间 → 结果必然不是期望类型,门应当变红
      const choice = MUTATE ? 3 : plan(item);
      await g.locator('button[role="radio"]').nth(choice - 1).click();
      answered++;
    }
    const shown = Number(await page.getAttribute('[data-testid="pt-progress"]', 'data-answered'));
    if (shown !== answered) return { fatal: `进度对不上:点了 ${answered} 题,页面显示 ${shown}` };
    await page.locator('[data-testid="pt-next"]').click();
  }

  await page.waitForSelector('[data-testid="pt-code"]', { timeout: 5000 });
  const code = (await page.textContent('[data-testid="pt-code"]'))?.trim();
  const dims = {};
  for (const scale of ['EI', 'SN', 'TF', 'JP', 'AT']) {
    const el = page.locator(`[data-testid="pt-dim-${scale}"]`);
    dims[scale] = {
      letter: await el.getAttribute('data-letter'),
      clarity: Number(await el.getAttribute('data-clarity')),
    };
  }
  // 只取内容区:顶栏里「返回首页 / 中文」是语言开关本身,不该被算成泄漏。
  // 另外 textContent 会连隐藏元素的文字一起读出来 —— 第一版拿 'main' 判,
  // 结果被顶栏那个 hidden sm:inline 的「返回首页」判了红,那是假阳性。
  const bodyText = (await page.textContent('[data-testid="pt-content"]')) ?? '';
  return { code, dims, errors, bodyText, answered };
}

const browser = await chromium.launch();
try {
  /* ── 中文版:答成 ESTJ-A ── */
  {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const r = await runOnce(page, 'zh', 'ESTJ-A');
    if (r.fatal) note(false, `中文版 ${r.fatal}`);
    else {
      note(r.answered === 60, `中文版答满 60 题(实际 ${r.answered})`);
      note(r.code === 'ESTJ-A', `中文版结果 = ${r.code}(期望 ESTJ-A)`);
      note(
        ['EI', 'SN', 'TF', 'JP'].every((s) => r.dims[s].clarity === 100),
        `四维清晰度全 100(实际 ${['EI', 'SN', 'TF', 'JP'].map((s) => `${r.dims[s].letter}${r.dims[s].clarity}`).join(' ')})`,
      );
      // 自动化点得飞快 → 「过快」探针必须报出来,证明质量检查真的接线了
      note(r.bodyText.includes('1.5 秒'), '「过快」质量探针在自动化速度下被触发');
      note(r.bodyText.includes('大五人格'), '结果页含大五人格面板');
      note(r.errors.length === 0, `控制台零红字(实际 ${r.errors.length} 条${r.errors[0] ? ':' + r.errors[0].slice(0, 90) : ''})`);
    }
    await page.close();
  }

  /* ── 英文版:答成 ESFP-T(混合型,四个字母两高两低),且结果页不出现中文 ── */
  {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const r = await runOnce(page, 'en', 'ESFP-T');
    if (r.fatal) note(false, `英文版 ${r.fatal}`);
    else {
      note(r.code === 'ESFP-T', `英文版结果 = ${r.code}(期望 ESFP-T)`);
      note(r.bodyText.includes('Big Five'), '英文结果页含 Big Five 面板');
      note(!/[一-鿿]/.test(r.bodyText), '英文结果页无中文泄漏');
      note(r.errors.length === 0, `英文版控制台零红字(实际 ${r.errors.length} 条)`);
    }
    await page.close();
  }

  /* ── 断点续答:答 7 题后刷新,作答不丢 ── */
  {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(`${BASE}/personality?lang=zh`, { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });
    // ★别用 'main button' 抓主 CTA★ 顶栏(含中/英切换)就在 <main> 里,
  // first() 抓到的是语言按钮 —— 点了它测评根本不会开始,门却一路等到超时。
  await page.locator('[data-testid="pt-start"]').click();
    const groups = page.locator('[role="radiogroup"]');
    for (let i = 0; i < 5; i++) await groups.nth(i).locator('button[role="radio"]').nth(4).click();
    await page.locator('[data-testid="pt-next"]').click();
    for (let i = 0; i < 2; i++) await groups.nth(i).locator('button[role="radio"]').nth(4).click();
    await page.reload({ waitUntil: 'networkidle' });
    // 刷新后回到介绍页,主 CTA 应该是「继续上次的作答 (7/60)」
    const cta = (await page.textContent('[data-testid="pt-start"]')) ?? '';
    note(cta.includes('7/60'), `刷新后主按钮显示续答进度(实际「${cta.trim().slice(0, 24)}」)`);
    await page.close();
  }
} finally {
  await browser.close();
  stopServer();
}

const verdict = problems.length ? 'FAIL' : 'PASS';
console.log(`\nPERSONALITY_E2E_VERDICT: ${verdict}(问题 ${problems.length}${MUTATE ? ' · 变异模式,FAIL 才是对的' : ''})`);
process.exit(problems.length ? 1 : 0);
