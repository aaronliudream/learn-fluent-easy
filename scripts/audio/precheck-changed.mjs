#!/usr/bin/env node
/**
 * 上线前置闸：只检查**本次改动到的内容文件**有没有音频缺口。
 *
 * 为什么要有它：周巡检的检出延迟最长 7 天，而这 7 天里新内容在自动播路径上就是静音
 * （`speak.ts` 非手势分支遇冷 key 只预热不出声）。文档里的"合入前跑两步"会被跳过，
 * 尤其是同时跑三条内容产线的时候。所以把 precheck 做成 PR 闸，让"忘了跑"变成红叉。
 *
 * 用法：
 *   node scripts/audio/precheck-changed.mjs --base origin/main            # 与 base 比 diff
 *   node scripts/audio/precheck-changed.mjs --files "a.json b.json"       # 显式给文件
 *
 * 不需要任何凭据：只对公开 CDN 发 HEAD。
 * 抽取逻辑复用 extract.mjs，金丝雀复用 audit-core.mjs —— 不另写一份。
 *
 * 退出码：0 = 无缺口/无内容改动；1 = 有缺口；2 = 配置错误；3 = 金丝雀失败（本轮作废）。
 *
 * ⚠️ 结构说明：所有分支都必须走 `return <code>`，由末尾统一 finish()。
 * 不要在中途调 process.exit()：fetch 之后立刻硬退会在 Windows 触发 libuv 断言
 * (Assertion failed: !(handle->flags & UV_HANDLE_CLOSING))，退出码可能被污染。
 * 也不要用「设 exitCode 后继续往下跑」的写法——那会让提前返回的分支继续执行后面的逻辑
 * （实际踩过：`--files src/App.tsx` 本该 0 退出，结果继续跑到末尾输出缺口提示并退 1）。
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import {
  REPO, ConfigError, loadConfig, checkCoverage, extractItems, probeExistence,
  cacheKeyOf, cdnUrlOf,
} from './extract.mjs';
import { makeCanaryItem, checkMissing, assertCanary } from './audit-core.mjs';
import { toCsv } from './csv.mjs';

const argv = process.argv.slice(2);
const arg = (f, d) => { const i = argv.lastIndexOf(f); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };

const SECTION = arg('--section', 'primary');
const BASE = arg('--base', '');
const FILES_ARG = arg('--files', '');
const CONC = Number(arg('--concurrency', '8'));

async function main() {
  const t0 = Date.now();
  const secs = () => ((Date.now() - t0) / 1000).toFixed(1);

  // ---------------- 改动文件 ----------------
  let changed = [];
  if (FILES_ARG) {
    changed = FILES_ARG.split(/[\s,]+/).filter(Boolean);
  } else if (BASE) {
    try {
      const out = execSync(`git diff --name-only --diff-filter=ACMR ${BASE}...HEAD`, { cwd: REPO, encoding: 'utf8' });
      changed = out.split(/\r?\n/).filter(Boolean);
    } catch (e) {
      console.error(`✗ 取 diff 失败（base=${BASE}）：${e.message}`);
      return 2;
    }
  } else {
    console.error('用法：--base <ref> 或 --files "<以空格分隔的文件>"');
    return 2;
  }
  changed = changed.map((f) => f.replace(/\\/g, '/'));

  // ---------------- 配置 + 覆盖率（新内容文件没分类要在这里就挡住）----------------
  let cfg;
  let allFiles;
  try {
    cfg = loadConfig(SECTION);
    allFiles = checkCoverage(cfg);
  } catch (e) {
    if (e instanceof ConfigError) { console.error(e.message); return 2; }
    throw e;
  }

  const inScope = changed.filter((f) => cfg.dataRoots.some((r) => f === r || f.startsWith(`${r}/`)));
  if (!inScope.length) {
    console.log(`本次改动没有触及 ${SECTION} 的内容目录（${cfg.dataRoots.join(', ')}），无需检查。`);
    console.log(`改动文件 ${changed.length} 个，其中内容文件 0 个。耗时 ${secs()}s`);
    return 0;
  }
  console.log(`改动文件 ${changed.length} 个，其中 ${SECTION} 内容文件 ${inScope.length} 个：`);
  for (const f of inScope) console.log('   ' + f);

  // ---------------- 只抽这些文件 ----------------
  let items;
  try {
    items = [...(await extractItems(cfg, { allFiles: inScope, allowEmptySources: true })).values()];
  } catch (e) {
    if (e instanceof ConfigError) { console.error(e.message); return 2; }
    throw e;
  }
  if (!items.length) {
    console.log('\n这些内容文件里没有需要朗读的文本（可能只改了中文/图片等字段），无需生成。');
    console.log(`耗时 ${secs()}s`);
    return 0;
  }

  // ---------------- 金丝雀 + 探测 ----------------
  const canary = makeCanaryItem(cfg.voiceId, cdnUrlOf, cacheKeyOf);
  console.log(`\n待检查 ${items.length} 个 (文本 × 档位) 对象（+1 金丝雀）…`);
  const { missing } = await checkMissing([...items, canary], (urls) => probeExistence(urls, { concurrency: CONC }));

  const canaryVerdict = assertCanary(missing, canary);
  if (!canaryVerdict.passed) {
    console.error(`\n✗ 金丝雀失败 → 本轮结论作废（不得当成"无缺口"通过）：${canaryVerdict.reason}`);
    return 3;
  }
  console.log(`金丝雀 ✅（${canaryVerdict.reason}）`);

  const realMissing = missing.filter((m) => !m.__canary);
  if (!realMissing.length) {
    console.log(`\n✅ 无缺口：这 ${items.length} 个对象都已存在。耗时 ${secs()}s`);
    return 0;
  }

  const byTier = {};
  for (const m of realMissing) { const t = m.field.split('@')[1]; byTier[t] = (byTier[t] ?? 0) + 1; }
  console.log(`\n❌ 缺口 ${realMissing.length} 个（按档位 ${JSON.stringify(byTier)}），耗时 ${secs()}s`);
  for (const m of realMissing.slice(0, 30)) {
    console.log(`   ✗ ${JSON.stringify(m.text)} @${m.speed}  ← ${m.source_ref} ${m.record_id}`);
  }
  if (realMissing.length > 30) console.log(`   …另有 ${realMissing.length - 30} 条`);

  const listPath = `data/audio-audit/precheck_${SECTION}_list.csv`;
  const COLS = ['cache_key', 'text', 'voice_id', 'speed', 'cdn_url', 'storage_url', 'source_ref', 'record_id', 'field'];
  fs.mkdirSync(path.dirname(path.join(REPO, listPath)), { recursive: true });
  fs.writeFileSync(path.join(REPO, listPath), toCsv(COLS, realMissing), 'utf8');

  console.log(`
────────────────────────────────────────────────────────
这批新内容的音频还没生成。**自动播路径上冷 key 等于没有声音**
（游戏切词、关卡自动读题、闯关每题 250ms 自动播），所以要在合入前补掉。

在本地仓库根目录跑（需要 .env 里的 anon key，CI 没有凭据所以不能代跑）：

    npm run audio:backfill

只想补本 PR 这批（清单已写好）：

    node scripts/audio/backfill-missing-audio.ts --list ${listPath} \\
      --out data/audio-audit/precheck_result.csv

跑完重推本 PR，这个闸会自动变绿。
────────────────────────────────────────────────────────`);
  return 1;
}

const code = await main();
// 设 exitCode 让事件循环自然退完（undici keep-alive 句柄还在关闭，硬退会触发 libuv 断言）；
// 再挂一个 unref 定时器兜底，避免 keep-alive socket 把进程吊住。
process.exitCode = code;
setTimeout(() => process.exit(code), 8000).unref();
