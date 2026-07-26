#!/usr/bin/env node
/**
 * 生产域路由/静态资源实测（vercel.json SPA 兜底改造的线上验收）。
 *
 * 三类断言：
 *   1. SPA 路由（src/App.tsx 里全部 path=，:param 换样例值）→ 必须 200 且 content-type 是 text/html
 *   2. 真实静态文件（public/ 与 dist/ 抽样）→ 必须 200 且 content-type **不是** text/html
 *   3. 缺失资源探针 → 必须 404，绝不能是 200 + text/html（那就是"假 200"，本次改造要消灭的东西）
 *
 * 用法：
 *   node scripts/audio/verify-production-routing.mjs                      # 默认 https://bigmoonenglish.com
 *   node scripts/audio/verify-production-routing.mjs --base https://x.com --assets 120
 *   --out 指定 CSV 输出路径
 * 退出码：0 全绿 / 1 有失败（SPA 路由失败时应立即回滚部署）。
 */
import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const arg = (f, d) => { const i = argv.indexOf(f); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const BASE = arg('--base', 'https://www.bigmoonenglish.com').replace(/\/$/, '');
const ASSET_N = Number(arg('--assets', '120'));
const OUT = arg('--out', 'data/audio-audit/b1_production_verify.csv');
const CONC = Number(arg('--concurrency', '8'));

// ---- 1) SPA 路由：必须还原 <Route> 嵌套 ----
// 坑：子路由的 path 是**相对**父路由的。直接把 path= 原值前面加 "/" 会造出
// /course、/semester/x1 这种根本不存在的假 URL（它们靠 SPA 兜底照样 200，测了等于没测），
// 同时把 /primary/hub/4/semester/... 这类真实嵌套路由整片漏掉。
function extractRoutes(src) {
  const tokens = [];
  const re = /<Route\b|<\/Route>/g;
  let m;
  while ((m = re.exec(src))) tokens.push({ kind: m[0], idx: m.index });
  const out = [];
  const stack = [];
  for (const t of tokens) {
    if (t.kind === '</Route>') { stack.pop(); continue; }
    let depth = 0, end = -1, selfClose = false;
    for (let j = t.idx; j < src.length; j++) {
      const c = src[j];
      if (c === '{') depth++;
      else if (c === '}') depth--;
      else if (c === '>' && depth === 0) { end = j; selfClose = src[j - 1] === '/'; break; }
    }
    const tag = src.slice(t.idx, end + 1);
    const pm = /\spath="([^"]*)"/.exec(tag);
    const p = pm ? pm[1] : null;
    const parent = stack.join('/');
    if (p !== null) out.push((p.startsWith('/') ? p : `${parent}/${p}`).replace(/\/+/g, '/'));
    if (!selfClose) stack.push(p === null ? '' : p);
  }
  return out;
}
// 参数用**真实值**填充（不是 x1），这样测的是用户真的会访问的 URL 形状
const REAL_PARAMS = {
  grade: '4', semId: 'grade4_volume2', unitId: 'g4v2_u1', stageIdx: '1', levelId: '1',
  segment: 'primary', testId: '1', volume: '7', unit: '1', bookKey: 'tom-sawyer',
  bookNo: '1', lessonId: 'am1_l01', catKey: 'daily', dialogueId: '1', slug: 'x',
  id: '1', studentId: '1', pointId: '1', kpId: '1', examId: '1', reportId: '1',
  group: 'required', index: '1', stage: '1', state: 'todo',
};
const fillParams = (tpl) => tpl.replace(/:([A-Za-z0-9_]+)/g, (_, n) => REAL_PARAMS[n] ?? 'x1').replace(/\*/g, 'y2');
const routeTemplates = extractRoutes(fs.readFileSync('src/App.tsx', 'utf8'));
const spaUrls = [...new Set(routeTemplates.map((t) => fillParams(t.startsWith('/') ? t : '/' + t)))];

// ---- 2) 真实静态文件抽样 ----
const walk = (d, a = []) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, a); else a.push(p);
  }
  return a;
};
// 只取 public/：这些路径在线上是稳定的。**不能**用本地 dist/assets/*，
// 那些文件名带 build hash，本地构建与线上构建 hash 不同，测了只会测出"本地这版没上线"。
// 线上真实的 /assets/* 在下面从生产 index.html 里解析。
let files = [];
for (const d of ['public']) {
  if (fs.existsSync(d)) files = files.concat(walk(d).map((f) => '/' + path.relative(d, f).split(path.sep).join('/')));
}
files = [...new Set(files)].filter((f) => !f.endsWith('.md')).sort();
// 按扩展名分层，保证每种类型都抽到（不是只抽到一堆 png）
const byExt = new Map();
for (const f of files) {
  const e = (f.split('.').pop() || '').toLowerCase();
  byExt.set(e, [...(byExt.get(e) ?? []), f]);
}
const assetUrls = [];
for (const [, arr] of byExt) {
  const n = Math.max(2, Math.round((arr.length / files.length) * ASSET_N));
  const step = Math.max(1, arr.length / n);
  for (let i = 0; i < n && Math.floor(i * step) < arr.length; i++) assetUrls.push(arr[Math.floor(i * step)]);
}

// ---- 3) 缺失探针 ----
const missingUrls = [
  '/audio/primary/phonics/g4v2_u1/water.mp3',
  '/audio/primary/phonics/g4v2_u1/tiger.mp3',
  '/assets/index-DOESNOTEXIST-b1verify.js',
  '/primary/finalChallenge_images/definitely-not-here-b1verify.png',
];

const CT_BY_EXT = {
  mp3: 'audio', mp4: 'video', png: 'image', jpg: 'image', jpeg: 'image', gif: 'image', svg: 'image',
  webp: 'image', ico: 'image', css: 'text/css', js: 'javascript', mjs: 'javascript', json: 'json',
  webmanifest: 'manifest', txt: 'text/plain', xml: 'xml', html: 'text/html',
};

async function probe(url, attempts = 3) {
  for (let a = 0; a < attempts; a++) {
    try {
      const r = await fetch(BASE + url, { method: 'HEAD', redirect: 'manual', signal: AbortSignal.timeout(20000) });
      if (r.status < 500) return { status: r.status, ct: r.headers.get('content-type') || '', len: r.headers.get('content-length') || '' };
    } catch { /* retry */ }
    await new Promise((x) => setTimeout(x, 700 * (a + 1)));
  }
  return { status: 0, ct: '', len: '' };
}

// 线上真实构建产物：从生产 index.html 解析 /assets/*.js|css（每次部署 hash 都会变，必须运行时抓）
const liveAssets = [];
try {
  const html = await (await fetch(`${BASE}/`, { signal: AbortSignal.timeout(20000) })).text();
  const refs = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+\.(?:js|css))"/g)].map((m) => m[1]);
  liveAssets.push(...[...new Set(refs)].slice(0, 12));
} catch { /* 抓不到就只测 public/ */ }

const jobs = [
  ...spaUrls.map((u) => ({ kind: 'spa_route', url: u, expect: '200 text/html' })),
  ...assetUrls.map((u) => ({ kind: 'static_asset', url: u, expect: u.endsWith('.html') ? '200 text/html' : '200 非 text/html' })),
  ...liveAssets.map((u) => ({ kind: 'live_build_asset', url: u, expect: '200 非 text/html' })),
  ...missingUrls.map((u) => ({ kind: 'missing_probe', url: u, expect: '404' })),
];
console.log(`base=${BASE}`);
console.log(`SPA 路由 ${spaUrls.length} 条 / 静态资源抽样 ${assetUrls.length} 个 / 缺失探针 ${missingUrls.length} 条 → 共 ${jobs.length} 次 HEAD`);

const results = [];
let done = 0;
const queue = [...jobs];
await Promise.all(Array.from({ length: CONC }, async () => {
  for (;;) {
    const j = queue.shift();
    if (!j) return;
    const r = await probe(j.url);
    const isHtml = r.ct.includes('text/html');
    let verdict;
    const htmlAsset = j.url.endsWith('.html'); // public/ 里本来就有几个真 .html，它们理应是 text/html
    if (j.kind === 'spa_route') verdict = r.status === 200 && isHtml ? 'PASS' : 'FAIL';
    else if (j.kind === 'static_asset' || j.kind === 'live_build_asset') {
      verdict = r.status === 200 && (htmlAsset ? isHtml : !isHtml) ? 'PASS' : 'FAIL';
    } else verdict = r.status === 404 ? 'PASS' : 'FAIL';
    const ext = (j.url.split('.').pop() || '').toLowerCase();
    const ctHint = CT_BY_EXT[ext];
    const ctOk = j.kind !== 'static_asset' || !ctHint || r.ct.includes(ctHint);
    results.push({ ...j, http_status: r.status, content_type: r.ct, content_length: r.len, ct_family_ok: ctOk ? 'yes' : 'no', verdict });
    if (++done % 60 === 0) console.log(`  ${done}/${jobs.length}`);
  }
}));

const by = (k, v) => results.filter((r) => r.kind === k && r.verdict === v).length;
const fails = results.filter((r) => r.verdict === 'FAIL');
const ctOdd = results.filter((r) => r.kind === 'static_asset' && r.ct_family_ok === 'no');

const COLS = ['kind', 'url', 'expect', 'http_status', 'content_type', 'content_length', 'ct_family_ok', 'verdict'];
const esc = (v) => { const s = String(v ?? ''); return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, '﻿' + [COLS.join(',')].concat(
  results.sort((a, b) => a.kind.localeCompare(b.kind) || a.url.localeCompare(b.url))
    .map((r) => COLS.map((c) => esc(r[c])).join(',')),
).join('\n') + '\n', 'utf8');

console.log('\n================ 生产域验收 ================');
console.log(`SPA 路由      : PASS ${by('spa_route', 'PASS')} / FAIL ${by('spa_route', 'FAIL')}（共 ${spaUrls.length}）`);
console.log(`静态资源      : PASS ${by('static_asset', 'PASS')} / FAIL ${by('static_asset', 'FAIL')}（共 ${assetUrls.length}）`);
console.log(`缺失探针(应404): PASS ${by('missing_probe', 'PASS')} / FAIL ${by('missing_probe', 'FAIL')}（共 ${missingUrls.length}）`);
console.log(`content-type 家族异常: ${ctOdd.length}`);
console.log(`CSV: ${OUT}`);
if (fails.length) {
  console.log(`\n❌ 失败 ${fails.length} 条：`);
  for (const f of fails.slice(0, 40)) console.log(`  [${f.kind}] ${f.url} → ${f.http_status} ${f.content_type}（期望 ${f.expect}）`);
  if (fails.some((f) => f.kind === 'spa_route')) console.log('\n⚠ 有 SPA 路由失败 → 应立即回滚这次合并。');
  process.exit(1);
}
console.log('\n✅ 全绿');
