/**
 * 独立抽样复验：**不看** backfill 自己写的 status，直接对 CDN 发 HEAD。
 *
 * 为什么要有这一步：生成脚本的"created"是它自己判的。它判错（或它的复验逻辑本身有 bug）时，
 * 结果 CSV 一样是满屏 created。所以收尾必须有一条**不依赖脚本自报**的证据链——
 * 从清单里按档位分层抽样，重新 HEAD 一遍，200 且 ≥2KB 才算数。
 *
 * 用法：
 *   node scripts/audio/junior-sample-verify.mjs --lists a.csv,b.csv [--per-tier 12] [--seed 7]
 *   （--lists 传**生成用的清单**，不是结果 CSV；档位取清单的 field 列 @ 后缀）
 */
import fs from 'node:fs';
import path from 'node:path';
import { REPO } from './extract.mjs';
import { parseCsv } from './csv.mjs';

const arg = (n, d) => { const i = process.argv.indexOf(n); return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : d; };
const PER_TIER = Number(arg('--per-tier', '12'));
const MIN_BYTES = 2048;

/** 固定种子的伪随机（可复现；不用 Math.random，免得复跑抽到另一批说不清） */
const mulberry = (seed) => () => {
  seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const head = async (url, attempts = 4) => {
  for (let a = 0; a < attempts; a++) {
    try {
      const r = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(25_000) });
      if ([200, 400, 404].includes(r.status)) return { status: r.status, bytes: Number(r.headers.get('content-length') || 0) };
    } catch { /* 退避重试 */ }
    await new Promise((r) => setTimeout(r, 1200 * 2 ** a + Math.random() * 300));
  }
  return { status: 0, bytes: 0 };
};

const lists = arg('--lists', '').split(',').filter(Boolean);
if (!lists.length) { console.error('用法：--lists <清单csv[,清单csv...]> [--per-tier N]'); process.exit(2); }

const rows = lists.flatMap((rel) => parseCsv(fs.readFileSync(path.join(REPO, rel), 'utf8')));
const byTier = new Map();
for (const r of rows) {
  const tier = r.field.split('@')[1] ?? '(无)';
  (byTier.get(tier) ?? byTier.set(tier, []).get(tier)).push(r);
}

const rnd = mulberry(Number(arg('--seed', '7')));
const picked = [];
for (const [tier, list] of byTier) {
  // Fisher-Yates（不用 sort(()=>rnd()-0.5)：那种"洗牌"是有偏的，抽样会系统性偏向某些位置）
  const idx = [...list.keys()];
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  for (const i of idx.slice(0, Math.min(PER_TIER, list.length))) picked.push({ tier, ...list[i] });
}
console.log(`分层抽样 ${picked.length} 条（每档最多 ${PER_TIER}）：${[...byTier].map(([t, l]) => `${t}=${Math.min(PER_TIER, l.length)}/${l.length}`).join('  ')}`);

const bad = [];
const stat = new Map();
let done = 0;
const q = [...picked];
const worker = async () => {
  for (let r = q.shift(); r; r = q.shift()) {
    const h = await head(r.cdn_url);
    const ok = h.status === 200 && h.bytes >= MIN_BYTES;
    const s = stat.get(r.tier) ?? { ok: 0, bad: 0, bytes: [] };
    if (ok) { s.ok++; s.bytes.push(h.bytes); } else { s.bad++; bad.push({ ...r, ...h }); }
    stat.set(r.tier, s);
    if (++done % 20 === 0) console.log(`  已验 ${done}/${picked.length}`);
  }
};
await Promise.all([worker(), worker(), worker()]);

console.log('\n档位            通过/抽样   体积中位数');
for (const [tier, s] of stat) {
  const b = s.bytes.sort((x, y) => x - y);
  console.log(`  ${tier.padEnd(14)} ${String(s.ok).padStart(3)}/${String(s.ok + s.bad).padEnd(4)}  ${b.length ? b[Math.floor(b.length / 2)] + 'B' : '-'}`);
}
if (bad.length) {
  console.log(`\n✗ 未通过 ${bad.length} 条（全部列出）：`);
  for (const b of bad) console.log(`  [${b.tier}] HTTP ${b.status} ${b.bytes}B  ${b.cdn_url}\n      text=${JSON.stringify(b.text.slice(0, 60))}`);
  process.exitCode = 1;
} else {
  console.log(`\n✅ 抽样 ${picked.length}/${picked.length} 全部 200 且 ≥${MIN_BYTES}B`);
}
