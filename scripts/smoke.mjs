/**
 * 冒烟门 —— 起 preview、无头开几个页面、收集 Console 红字,有红字就非零退出。
 *
 * ★为什么必须有它★
 * 2026-07-26 全站白屏:`MistakeReviewGate` 里一处 TDZ(`useRevealScroll(revealed)`
 * 写在 `revealed` 声明之前)。当时 `npm run build` 是绿的、`check:undef` 也报绿
 * (后者其实根本没在运行),两条"证据"全是空的 —— 因为**没有任何一道门真的把页面跑起来过**。
 * esbuild 不做类型检查,Vite dev 用原生 ESM 也容忍很多生产 rollup 才炸的写法。
 * 这道门补的就是这个洞:真渲染、真收 console。
 *
 * 用法:
 *   npm run build && npm run smoke              # 默认起 preview 自己管生命周期
 *   npm run smoke -- --base=https://xxx.vercel.app   # 直接打线上/Preview 地址
 *   npm run smoke -- --routes=/,/junior,/primary     # 自定义路径
 *
 * 退出码:0=零红字;1=有红字或页面崩了。
 */
import { spawn, spawnSync } from 'node:child_process';
import { chromium } from 'playwright';

// ★只在第一个 = 处切★ 用 split('=')[1] 会把带查询串的 URL 拦腰截断:
// `--routes=/,/personality?lang=en,/junior` 会变成 `/,/personality?lang`,
// 后面几条路由**静默消失**,清单看着写了其实没测(2026-08-09 踩到)。
const arg = (k, d) => {
  const hit = process.argv.find((a) => a.startsWith(`--${k}=`));
  return hit === undefined ? d : hit.slice(`--${k}=`.length);
};
// ★默认清单常驻三条「故意的坏 id」★ 它们专守兜底路径 —— 真实用户手打错、点旧收藏才会走到,
// 除了自动化没有别的办法能测到。2026-07-27 高中册页崩就是这类路径没人测。
const DEFAULT_ROUTES = [
  '/', '/junior', '/primary',
  '/junior/hub/7/semester/__BOGUS__',
  '/gaokao/hub/1/semester/__BOGUS__',
  '/primary/hub/3/semester/__BOGUS__',
].join(',');
const ROUTES = arg('routes', DEFAULT_ROUTES).split(',').map((s) => s.trim()).filter(Boolean);
const EXTERNAL = arg('base', '');
const PORT = Number(arg('port', '4173'));
const BASE = EXTERNAL || `http://localhost:${PORT}`;

// 这些是"噪声"不是"故障":第三方脚本、扩展、以及浏览器对缺图/字体的抱怨。
// 白名单保持极短 —— 宁可多报也不要漏掉真错。
const IGNORE = [
  /favicon/i,
  /Failed to load resource.*(?:404|net::ERR_)/i,   // 静态资源缺失单独看,不作为崩溃判据
  /Download the React DevTools/i,
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitServer(url, tries = 60) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, { method: 'GET' });
      if (r.ok) return true;
    } catch { /* 还没起来 */ }
    await sleep(500);
  }
  return false;
}

/**
 * ★端口上有别人的 preview = 这道门的结论全部作废★
 * 2026-08-09:另一个工作树留下 78 个没杀干净的 `vite preview`(不带 --strictPort 时
 * vite 会自动往后找端口,于是占了 4173、4179-4217 一整片)。本脚本 --strictPort
 * 抢不到端口就悄悄退出,而 waitServer 却能连上**别人的旧 dist** ——
 * 门于是对着另一个分支的构建打分,报出的 404 是假的,报出的绿也是假的。
 * 所以:端口已经有人就直接退出,绝不将就复用。
 */
let server = null;
if (!EXTERNAL) {
  let occupied = false;
  try { occupied = (await fetch(BASE)).ok; } catch { occupied = false; }
  if (occupied) {
    console.log(`SMOKE_VERDICT: FAIL(端口 ${PORT} 上已经有服务在跑 —— 多半是上次没杀干净的 preview,`);
    console.log(`  它服务的可能是别的 dist,继续跑出来的红绿都不作数。先杀掉它,或换 --port=xxxx)`);
    process.exit(2);
  }
  server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
    stdio: 'ignore', shell: true,
  });
  if (!(await waitServer(BASE))) {
    console.log(`SMOKE_VERDICT: FAIL(preview 起不来 @ ${BASE})`);
    stopServer();
    process.exit(1);
  }
}

/** Windows 上 shell:true 的 kill 只杀 cmd 外壳,vite 子进程会活下来占住端口 —— 必须连进程树一起杀。 */
function stopServer() {
  if (!server) return;
  if (process.platform === 'win32' && server.pid) {
    try {
      spawnSync('taskkill', ['/pid', String(server.pid), '/T', '/F'], { stdio: 'ignore', shell: true });
    } catch { /* 尽力而为 */ }
  }
  server.kill();
}

const browser = await chromium.launch();
const problems = [];
let checked = 0;

for (const route of ROUTES) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } }); // 手机竖屏
  const errs = [];
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    const t = m.text();
    if (IGNORE.some((re) => re.test(t))) return;
    errs.push(`console.error: ${t}`);
  });
  page.on('pageerror', (e) => errs.push(`pageerror: ${e.message}`));

  const url = BASE + route;
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
    await sleep(1200);                       // 留给首屏异步渲染
    // 白屏判据:body 里几乎没有可见文字
    const textLen = await page.evaluate(() => (document.body?.innerText || '').trim().length);
    if (textLen < 20) errs.push(`白屏:body 可见文字仅 ${textLen} 字`);
  } catch (e) {
    errs.push(`导航失败: ${e.message}`);
  }
  checked++;
  console.log(`  ${errs.length ? '✗' : '✓'} ${route}${errs.length ? '  ← ' + errs.length + ' 个问题' : ''}`);
  errs.forEach((x) => problems.push(`${route}  ${x}`));
  await page.close();
}

await browser.close();
stopServer();

if (problems.length) {
  console.log('\n  明细:');
  problems.forEach((p) => console.log('    ✗ ' + p));
}
console.log(`\nSMOKE_VERDICT: ${problems.length ? 'FAIL' : 'PASS'}(${checked} 个页面 · ${problems.length} 个问题)`);
process.exit(problems.length ? 1 : 0);
