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
 * 退出码：0 = 无缺口/无内容改动；1 = 有缺口；2 = 配置错误；3 = 本轮作废（金丝雀失败，或探测撞限流没拿到确定答案）。
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
  cacheKeyOf, cdnUrlOf, tableSourcesOf,
} from './extract.mjs';
import { makeCanaryItem, checkMissing, assertCanary, assertProbeConclusive } from './audit-core.mjs';
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

  // in-scope = dataRoots 下的文件 **+ extraFiles**（文本写死在代码里的内容源，
  // 例如 junior 句型关的 SENTENCE_PATTERNS 就在 JuniorHubStagePlay.tsx 里）。
  // 漏掉 extraFiles，改那 4 组句型就绕过闸门了。
  const extraFiles = (cfg.extraFiles ?? []).map((e) => e.path ?? e);
  const inScope = changed.filter((f) =>
    cfg.dataRoots.some((r) => f === r || f.startsWith(`${r}/`)) || extraFiles.includes(f));
  if (!inScope.length) {
    const scopeDesc = [...cfg.dataRoots, ...extraFiles].join(', ');
    console.log(`本次改动没有触及 ${SECTION} 的内容范围（${scopeDesc}），无需检查。`);
    console.log(`改动文件 ${changed.length} 个，其中内容文件 0 个。耗时 ${secs()}s`);
    return 0;
  }
  console.log(`改动文件 ${changed.length} 个，其中 ${SECTION} 内容文件 ${inScope.length} 个：`);
  for (const f of inScope) console.log('   ' + f);

  // ---------------- 只抽这些文件 ----------------
  //
  // **表源在 PR 闸里一律跳过**，而且要说出来。三个理由：
  //   ① DB 内容不在 diff 里 —— 用 SQL 往 junior_vocab 加词，任何 PR 都看不到，
  //      按文件 diff 触发的闸门在结构上就管不到它（那是周巡检的活）。
  //   ② 一改任意一个 junior JSON 就把整张表拉进来探测（junior_vocab 展开后约 1.2 万对象），
  //      每个 PR 十几分钟，还会用**无关的** DB 缺口把这个 PR 判红。
  //   ③ 闸门的契约写在文件头："只检查本次改动到的内容文件"。表源不属于"本次改动"。
  // 静默跳过是不行的——那会让人以为闸门覆盖了 DB。所以这里逐条列出来 + 指向周巡检。
  const tables = tableSourcesOf(cfg);
  if (tables.length) {
    console.log(`\n⏭ 跳过 ${tables.length} 个表源（DB 内容不在 diff 里，按文件 diff 的闸门覆盖不到）：`);
    for (const t of tables) console.log(`   ${t.id} → ${t.table} @${(t.tiers ?? []).join('/')}`);
    console.log(`   这部分由周巡检 audio-audit（--section ${SECTION} --threshold 0）兜住，最长 7 天检出。`);
  }

  let items;
  try {
    items = [...(await extractItems(cfg, { allFiles: inScope, allowEmptySources: true, skipTables: true })).values()];
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
  const { missing, unknown } = await checkMissing([...items, canary], (urls) => probeExistence(urls, { concurrency: CONC }));

  // 探测确定性：有 unknown 就说明这轮没探明白（CDN 限流最常见）。
  // 那时**不能**把它们算成缺口去卡作者——那是冤枉人。整轮作废、让 CI 重跑。
  const conclusive = assertProbeConclusive(unknown, items.length + 1);
  if (!conclusive.passed) {
    console.error(`
✗ 探测没拿到确定答案 → 本轮作废（不判缺口、也不判通过）：${conclusive.reason}`);
    for (const u of unknown.slice(0, 10)) console.error(`   ? ${JSON.stringify(u.text)} ${u.cdn_url}`);
    return 3;
  }

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

在本地仓库根目录跑（需要 .env 里的 anon key，CI 没有凭据所以不能代跑）。
清单已经写好，直接补本 PR 这批：

    node scripts/audio/backfill-missing-audio.ts --list ${listPath} \\
      --out data/audio-audit/precheck_${SECTION}_result.csv \\
      --progress data/audio-audit/precheck_${SECTION}_progress.json

想把 ${SECTION} 的缺口全补一遍（不只本 PR）：

    node scripts/audio/export-content-audio-list.mjs --section ${SECTION} \\
      --out data/audio-audit/${SECTION}_gap_list.csv
    node scripts/audio/backfill-missing-audio.ts --list data/audio-audit/${SECTION}_gap_list.csv \\
      --out data/audio-audit/${SECTION}_gap_result.csv \\
      --progress data/audio-audit/${SECTION}_gap_progress.json

跑完重推本 PR，这个闸会自动变绿。
────────────────────────────────────────────────────────`);
  return 1;
}

const code = await main();
// 设 exitCode 让事件循环自然退完（undici keep-alive 句柄还在关闭，硬退会触发 libuv 断言）；
// 再挂一个 unref 定时器兜底，避免 keep-alive socket 把进程吊住。
process.exitCode = code;
setTimeout(() => process.exit(code), 8000).unref();
