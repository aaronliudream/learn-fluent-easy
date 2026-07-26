#!/usr/bin/env node
/**
 * 校验 vercel.json 的 SPA 兜底 rewrite 三件事（纯本地、离线、无副作用）：
 *   1. 全部 SPA 路由（从 src/App.tsx 抓 path=，:param 换成样例值）仍然回 index.html
 *   2. public/ 与 dist/ 里**真实存在**的每个文件都不会被 rewrite 吞掉
 *   3. 几条**不存在**的资源路径落到 404，而不是被伪装成 200 + index.html
 *      —— 第 3 条正是小学音频审计里"拼读 mp3 假 200"的根因。
 *
 * 用法（仓库根目录）：node scripts/audio/verify-rewrite-coverage.mjs
 * 退出码：0 全绿 / 1 有问题。适合放进 CI，改 vercel.json 或加新类型静态资源时自动拦。
 */
import fs from 'node:fs';
import path from 'node:path';
const src = JSON.parse(fs.readFileSync('vercel.json', 'utf8')).rewrites[0].source;
const re = new RegExp('^' + src + '$');

// 1) 全部路由（:param → 样例值）必须仍进 index.html
const routes = [...fs.readFileSync('src/App.tsx', 'utf8').matchAll(/path="([^"]*)"/g)].map((m) => m[1]);
const concrete = routes.map((r) => ('/' + r).replace(/\/+/g, '/').replace(/:[A-Za-z0-9_]+/g, 'x1').replace(/\*/g, 'y2'));
const spaBad = concrete.filter((p) => !re.test(p));
console.log('路由样本:', routes.length, '| 被误伤:', spaBad.length, spaBad.slice(0, 5));

// 2) public/ 与 dist/ 里真实存在的每个文件都不得进 index.html
const walk = (d, a = []) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, a); else a.push(p);
  }
  return a;
};
let files = [];
for (const d of ['public', 'dist']) if (fs.existsSync(d)) files = files.concat(walk(d).map((f) => '/' + path.relative(d, f).split(path.sep).join('/')));
const uniq = [...new Set(files)];
const assetBad = uniq.filter((p) => re.test(p));
console.log('静态文件样本:', uniq.length, '| 仍会被吞成 index.html:', assetBad.length, assetBad.slice(0, 5));

// 3) 缺失资源（不存在的文件路径）也必须不进 index.html —— 这才是假 200 的根因
const missingProbes = [
  '/audio/primary/phonics/g4v2_u1/water.mp3',
  '/assets/index-DOESNOTEXIST.js',
  '/primary/finalChallenge_images/nope.png',
  '/audio/primary/phonics/g4v2_u1/README.md',
];
const probeBad = missingProbes.filter((p) => re.test(p));
console.log('缺失资源探针:', missingProbes.length, '| 仍会被吞成 index.html:', probeBad.length, probeBad);

console.log(spaBad.length === 0 && assetBad.length === 0 && probeBad.length === 0
  ? '✅ 路由全绿 + 静态资源零漏网 + 缺失资源全部落 404'
  : '❌ 有问题');
process.exit(spaBad.length + assetBad.length + probeBad.length === 0 ? 0 : 1);
