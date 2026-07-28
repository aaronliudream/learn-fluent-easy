/**
 * ①「清单跟着改动走」的机械检查 —— 交付前自检。
 *
 * ★为什么有它★
 * 2026-07-27:我改了三条线的册页返回按钮,却在 smoke 清单里一条册页 URL 都没写,
 * 于是高中册页整页崩(TDZ)一路过关到线上。**门没坏,是喂给门的清单不含改动面。**
 * 这个脚本把那个流程漏洞变成机械检查:改了哪个页面,清单里就必须有它的 URL。
 *
 * 用法:
 *   node scripts/qa/smoke-coverage-check.mjs --routes=/,/junior,/junior/hub/7/semester/x
 *   node scripts/qa/smoke-coverage-check.mjs --routes=... --base=origin/main
 *
 * 退出码:0=改动面已覆盖;1=有改过的页面没被任何 smoke URL 命中。
 */
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const arg = (k, d) => (process.argv.find(a => a.startsWith(`--${k}=`))?.split('=')[1]) ?? d;
const ROUTES = arg('routes', '').split(',').map(s => s.trim()).filter(Boolean);
const BASE = arg('base', 'origin/main');

if (!ROUTES.length) {
  console.log('用法:--routes=/a,/b  (与本次 npm run smoke 用的清单一致)');
  process.exit(2);
}

let changed = [];
try {
  // ★不带 ...HEAD★ —— 那样只比「已提交」的差异,未提交的工作区改动看不见。
  // 2026-07-27 实测踩到:改了 7 个页面还没 commit,自检报「本次没有改动页面」直接放行。
  // 交付前自检本来就该覆盖工作区,所以这里比的是「工作区 vs BASE」。
  changed = execSync(`git diff --name-only ${BASE}`, { encoding: 'utf8' })
    .split('\n').map(s => s.trim()).filter(Boolean);
} catch (e) {
  console.log('取 diff 失败(仓库状态异常?):', e.message);
  process.exit(2);
}

const pages = changed.filter(p => /^src\/pages\/.+\.tsx$/.test(p));
if (!pages.length) {
  console.log(`COVERAGE_VERDICT: PASS(本次没有改动 src/pages/*.tsx,无需路由覆盖)`);
  process.exit(0);
}

// 从 App.tsx 解析路由表(element 里可能包了一层守卫,取全部组件标识符)
const app = readFileSync('src/App.tsx', 'utf8');
const compRoutes = {};
for (const m of app.matchAll(/<Route\s+path="([^"]+)"\s+element=\{([\s\S]*?)\}\s*\/>/g)) {
  const [, path, el] = m;
  for (const c of new Set([...el.matchAll(/<([A-Z][A-Za-z0-9_]*)/g)].map(x => x[1]))) {
    (compRoutes[c] ||= []).push(path);
  }
}
// 嵌套路由(<Route path="semester/:semId" …/>)的 path 不带前缀,靠特征段匹配即可

const base = p => p.split('/').pop().replace(/\.tsx$/, '');
/** 路由模式能否被某条 smoke URL 命中:按静态段逐段比对,:param 段通配。 */
const covered = (routePath) => {
  const rp = routePath.split('/').filter(Boolean);
  return ROUTES.some(u => {
    const up = u.split('?')[0].split('/').filter(Boolean);
    // 嵌套 path 只有尾部若干段 → 允许在 URL 尾部对齐
    if (rp.length > up.length) return false;
    const off = up.length - rp.length;
    return rp.every((seg, i) => seg.startsWith(':') || seg === up[off + i]);
  });
};

const missing = [];
for (const p of pages) {
  const rs = compRoutes[base(p)] || [];
  if (!rs.length) continue;               // 组件层/无直接路由 → 不强制
  if (!rs.some(covered)) missing.push([p, rs]);
}

console.log(`改动的页面 ${pages.length} 个 · smoke 清单 ${ROUTES.length} 条`);
for (const [p, rs] of missing) {
  console.log(`  ✗ ${p}\n      路由:${rs.join(' , ')}\n      → 本次 smoke 清单里没有命中它的 URL`);
}
console.log(`\nCOVERAGE_VERDICT: ${missing.length ? 'FAIL' : 'PASS'}(未覆盖 ${missing.length} 个改动页面)`);
process.exit(missing.length ? 1 : 0);
