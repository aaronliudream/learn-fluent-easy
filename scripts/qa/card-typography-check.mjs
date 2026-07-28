/**
 * 选版页卡片字号实测(初中 /junior + 高中 /gaokao)。
 *
 * 起因:Aaron 要「版本年份看得清」,字号比出版社全名(sub)明显大。
 * 字号是视觉改动,不靠读 className 估 —— 起 preview 用无头浏览器读 computed style。
 *
 * 断言:① tagline 字号 > sub 字号 ② 初中/高中 tagline 字号一致(两页同规格)
 *       ③ tagline 字号 ≥ 15px(定稿档位,防以后被别的改动悄悄调小)
 * 用法:先 npm run build,再 node scripts/qa/card-typography-check.mjs
 */
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';

const PORT = 4173;
const PAGES = [
  { url: `http://localhost:${PORT}/gaokao`, label: '高中', cards: 3 },
  { url: `http://localhost:${PORT}/junior`, label: '初中', cards: 2 },
];
const MIN_TAGLINE_PX = 15;

const server = spawn('npx', ['vite', 'preview', '--port', String(PORT)], { shell: true, stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
await sleep(4000);

let bad = 0;
const sizes = {};
try {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  for (const { url, label, cards } of PAGES) {
    await page.goto(url, { waitUntil: 'networkidle' });
    // 卡片 = 指向 ?publisher= 的链接;取每张卡最后两个 span(sub / tagline)
    const rows = await page.$$eval('a[href*="publisher="]', (els) =>
      els.map((el) => {
        const spans = [...el.querySelectorAll('span')];
        const px = (s) => (s ? parseFloat(getComputedStyle(s).fontSize) : null);
        const wt = (s) => (s ? getComputedStyle(s).fontWeight : null);
        return {
          text: spans.at(-1)?.textContent?.trim() ?? '',
          taglinePx: px(spans.at(-1)),
          taglineWeight: wt(spans.at(-1)),
          subPx: px(spans.at(-2)),
        };
      }),
    );
    if (rows.length !== cards) { bad++; console.log(`  ✗ ${label} 抓到 ${rows.length} 张卡,期望 ${cards}`); continue; }
    for (const r of rows) {
      const ok = r.taglinePx > r.subPx && r.taglinePx >= MIN_TAGLINE_PX;
      if (!ok) bad++;
      console.log(`  ${ok ? '✓' : '✗'} ${label} 「${r.text}」 tagline ${r.taglinePx}px/${r.taglineWeight} vs sub ${r.subPx}px`);
    }
    sizes[label] = rows[0].taglinePx;
  }
  await browser.close();
} finally {
  server.kill();
}

if (sizes['初中'] !== sizes['高中']) {
  bad++;
  console.log(`  ✗ 两页字号不一致:初中 ${sizes['初中']}px vs 高中 ${sizes['高中']}px —— 应当同规格`);
} else {
  console.log(`  ✓ 初中/高中 tagline 同为 ${sizes['初中']}px`);
}
console.log(`TYPOGRAPHY_VERDICT: ${bad ? 'FAIL' : 'PASS'}(问题 ${bad})`);
process.exit(bad ? 1 : 0);
