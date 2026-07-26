#!/usr/bin/env node
/**
 * 音频巡检（把 Phase A 的审计逻辑固化成可重复任务）。
 *
 * 用法：
 *   node scripts/audio/audit-audio.mjs --section primary
 *   node scripts/audio/audit-audio.mjs --section primary --threshold 0 --out data/audio-audit/audit_primary.json
 *
 * **不需要任何凭据**：只对公开 CDN / 生产站点发 HEAD，不碰 Supabase 密钥、不调 edge。
 * 因此可以放进 CI 定时跑（见 docs/audio/AUDIO_PIPELINE.md 的「巡检」章节）。
 *
 * 退出码：
 *   0 = 三条前置断言通过且缺失数 ≤ 阈值
 *   1 = 前置通过但缺失超阈值（真实缺口）
 *   3 = **前置断言未通过 → 本轮结论作废**（不是"全绿"，也不是普通失败，单独一个码便于告警区分）
 *   2 = 配置/覆盖率错误
 *
 * ⚠️ 结构：所有分支都 `return <code>`，由末尾统一收口。既不在中途 process.exit()
 * （fetch 后硬退会触发 Windows libuv 断言、污染退出码），也不用"设 exitCode 后继续跑"
 * 的写法——那会让提前返回的分支继续执行后面的逻辑（实际踩过）。
 */
import fs from 'node:fs';
import path from 'node:path';
import {
  REPO, ConfigError, loadConfig, checkCoverage, extractItems, probeExistence,
  cacheKeyOf, cdnUrlOf,
} from './extract.mjs';
import { makeCanaryItem, checkMissing, assertCanary, assertNoFake200, reviewDeclarations } from './audit-core.mjs';

const argv = process.argv.slice(2);
const arg = (f, d) => { const i = argv.lastIndexOf(f); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };

const SECTION = arg('--section', 'primary');
const THRESHOLD = Number(arg('--threshold', '0'));
const OUT = arg('--out', `data/audio-audit/audit_${SECTION}.json`);
const SITE = arg('--site', 'https://www.bigmoonenglish.com').replace(/\/$/, '');
const CONC = Number(arg('--concurrency', '8'));

/** 必然不存在的静态资源：命中 SPA 兜底就会变成 200 text/html（审计里的原始故障形态）。 */
const FAKE200_PROBES = [
  '/audio/primary/phonics/g4v2_u1/water.mp3',
  '/audio/primary/phonics/g4v2_u1/tiger.mp3',
  '/assets/index-DOESNOTEXIST-audit.js',
  '/primary/finalChallenge_images/definitely-not-here-audit.png',
];

async function main() {
  const started = new Date().toISOString();
  const report = {
    section: SECTION, startedAt: started, site: SITE, threshold: THRESHOLD,
    preflight: {}, totals: {}, missing: [], declarationsToReview: [], verdict: 'unknown',
  };
  const writeReport = () => {
    fs.mkdirSync(path.dirname(path.join(REPO, OUT)), { recursive: true });
    report.finishedAt = new Date().toISOString();
    fs.writeFileSync(path.join(REPO, OUT), JSON.stringify(report, null, 2) + '\n', 'utf8');
    console.log(`\n结构化结果 → ${OUT}`);
  };
    // 所有中止分支都 return 码，由末尾统一收口；不在中途 process.exit()（见文件头注释）
    const bail = (code, msg) => { console.error(msg); writeReport(); return code; };

  // ---------------- 配置 ----------------
  let cfg;
  let allFiles;
  try {
    cfg = loadConfig(SECTION);
    allFiles = checkCoverage(cfg);   // 含反向哨兵（前置断言 ③）
  } catch (e) {
    if (e instanceof ConfigError) {
      report.preflight.sentinel = { passed: false, reason: e.message.split('\n')[0] };
      report.verdict = 'invalid:config';
      return bail(2, e.message);
    }
    throw e;
  }
  report.preflight.sentinel = { passed: true, reason: `反向哨兵通过；${allFiles.length} 个文件全部已分类` };
  console.log(`section=${SECTION} | 文件 ${allFiles.length} 全部已分类 ✅（前置③ 反向哨兵通过）`);

  // ---------------- 前置断言① 假 200 探针 ----------------
  const probeResults = [];
  for (const p of FAKE200_PROBES) {
    let status = 0;
    let ct = '';
    for (let a = 0; a < 3; a++) {
      try {
        const r = await fetch(SITE + p, { method: 'HEAD', redirect: 'manual', signal: AbortSignal.timeout(20000) });
        status = r.status; ct = r.headers.get('content-type') || '';
        if (status < 500) break;
      } catch { /* retry */ }
      await new Promise((x) => setTimeout(x, 800 * (a + 1)));
    }
    probeResults.push({ url: SITE + p, status, contentType: ct });
  }
  const fake200 = assertNoFake200(probeResults);
  report.preflight.fake200 = { ...fake200, probes: probeResults };
  console.log(`前置① 假200探针：${fake200.passed ? '✅' : '❌'} ${fake200.reason}`);

  // ---------------- 抽取 + 金丝雀 ----------------
  let items;
  try {
    items = [...(await extractItems(cfg, { allFiles })).values()];
  } catch (e) {
    if (e instanceof ConfigError) { report.verdict = 'invalid:config'; return bail(2, e.message); }
    throw e;
  }
  const canary = makeCanaryItem(cfg.voiceId, cdnUrlOf, cacheKeyOf);
  console.log(`可达对象 ${items.length} 个（+1 金丝雀），开始探测…`);

  const { missing } = await checkMissing([...items, canary], (urls) =>
    probeExistence(urls, { concurrency: CONC, onProgress: (d, t) => console.log(`  探测 ${d}/${t}`) }));

  const canaryVerdict = assertCanary(missing, canary);
  report.preflight.canary = { ...canaryVerdict, cacheKey: canary.cache_key };
  console.log(`前置② 金丝雀：${canaryVerdict.passed ? '✅' : '❌'} ${canaryVerdict.reason}`);

  // ---------------- 前置未过 → 整轮作废 ----------------
  const preflightOk = fake200.passed && canaryVerdict.passed && report.preflight.sentinel.passed;
  if (!preflightOk) {
    report.verdict = 'invalid:preflight';
    report.totals = { reachable: items.length, note: '前置断言未通过，缺失统计不可信，已丢弃' };
    return bail(3,
  `\n✗ 前置断言未通过 → **本轮巡检作废**，不输出任何"全绿"结论。
     假200探针：${fake200.passed ? 'ok' : fake200.reason}
     金丝雀：${canaryVerdict.passed ? 'ok' : canaryVerdict.reason}
     反向哨兵：${report.preflight.sentinel.passed ? 'ok' : report.preflight.sentinel.reason}`);
  }

  // ---------------- 主体统计 ----------------
  const realMissing = missing.filter((m) => !m.__canary);
  report.totals = {
    reachable: items.length,
    existing: items.length - realMissing.length,
    missing: realMissing.length,
    coverage: `${items.length - realMissing.length}/${items.length}`,
  };
  report.missing = realMissing.map((m) => ({
    cache_key: m.cache_key, text: m.text, speed: m.speed,
    source_ref: m.source_ref, record_id: m.record_id, field: m.field, cdn_url: m.cdn_url,
  }));

  // ---------------- 声明复核（audioFree + outOfScope unverified）----------------
  const grepRepo = (needle) => {
    const hits = [];
    const walk = (dir) => {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        if (e.name === 'node_modules' || e.name === '.git' || e.name === 'dist') continue;
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walk(p);
        else if (/\.(ts|tsx|mjs|js|json)$/.test(e.name)) {
          try { if (fs.readFileSync(p, 'utf8').includes(needle)) hits.push(path.relative(REPO, p).split(path.sep).join('/')); }
          catch { /* ignore */ }
        }
      }
    };
    walk(path.join(REPO, 'src'));
    return hits;
  };
  report.declarationsToReview = reviewDeclarations(cfg, {
    readFile: (rel) => fs.readFileSync(path.join(REPO, rel), 'utf8'),
    grepRepo,
  });

  // ---------------- 输出 ----------------
  console.log(`\n=== ${SECTION} 巡检结果 ===`);
  console.log(`覆盖：${report.totals.coverage}（缺失 ${report.totals.missing} / 阈值 ${THRESHOLD}）`);
  if (realMissing.length) {
    const byTier = {};
    for (const m of realMissing) { const t = m.field.split('@')[1]; byTier[t] = (byTier[t] ?? 0) + 1; }
    console.log('缺失按档位:', JSON.stringify(byTier));
    for (const m of realMissing.slice(0, 20)) console.log(`   ✗ ${JSON.stringify(m.text)} @${m.speed} ${m.record_id}`);
    if (realMissing.length > 20) console.log(`   …另有 ${realMissing.length - 20} 条，详见 ${OUT}`);
  }
  if (report.declarationsToReview.length) {
    console.log(`\n声明待复核 ${report.declarationsToReview.length} 条（不判失败，但不静默）：`);
    for (const d of report.declarationsToReview) console.log(`   ⚠ [${d.kind}] ${d.target} — ${d.detail}`);
  }

  const over = realMissing.length > THRESHOLD;
  report.verdict = over ? 'fail:missing-over-threshold' : 'pass';
  console.log(over ? `\n❌ 缺失 ${realMissing.length} 超阈值 ${THRESHOLD}` : `\n✅ 通过（前置三条全过，缺失 ${realMissing.length} ≤ 阈值 ${THRESHOLD}）`);
  writeReport();
    return over ? 1 : 0;

}

const code = await main();
// 设 exitCode 让事件循环自然退完（undici keep-alive 句柄还在关闭，硬退会触发 libuv 断言）；
// 再挂 unref 定时器兜底，避免 keep-alive socket 把进程吊住。
process.exitCode = code;
setTimeout(() => process.exit(code), 8000).unref();
