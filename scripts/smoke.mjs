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
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const arg = (k, d) => (process.argv.find((a) => a.startsWith(`--${k}=`))?.split('=')[1]) ?? d;
const ROUTES = arg('routes', '/,/junior,/primary').split(',').map((s) => s.trim()).filter(Boolean);
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

let server = null;
if (!EXTERNAL) {
  server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
    stdio: 'ignore', shell: true,
  });
  if (!(await waitServer(BASE))) {
    console.log(`SMOKE_VERDICT: FAIL(preview 起不来 @ ${BASE})`);
    server.kill();
    process.exit(1);
  }
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
if (server) server.kill();

if (problems.length) {
  console.log('\n  明细:');
  problems.forEach((p) => console.log('    ✗ ' + p));
}
console.log(`\nSMOKE_VERDICT: ${problems.length ? 'FAIL' : 'PASS'}(${checked} 个页面 · ${problems.length} 个问题)`);
process.exit(problems.length ? 1 : 0);
