#!/usr/bin/env node
/**
 * 内容源 → 待生成音频清单（预生成管线的适配层）。
 *
 * 用法：
 *   node scripts/audio/export-content-audio-list.mjs --section primary --precheck
 *   node scripts/audio/export-content-audio-list.mjs --section primary --out data/audio-audit/pipeline_list.csv
 *   node scripts/audio/export-content-audio-list.mjs --section primary --source course-vocab --precheck
 *   （产出的 CSV 直接喂 scripts/audio/backfill-missing-audio.ts --list <csv>）
 *
 * 抽取/校验逻辑全在 scripts/audio/extract.mjs —— 与巡检 audit-audio.mjs **共用同一份**，
 * 避免两套抽取器漂移（漂了以后巡检就查不到导出漏掉的东西）。
 *
 * 硬规矩：映射表缺失 / 未分类文件 / 游离目录 / 未验证的表源 → 一律 exit 2，绝不默认放行。
 * 退出码：0 = 正常（--precheck 时表示无缺口）；1 = --precheck 且有缺口；2 = 配置/覆盖率错误。
 */
import fs from 'node:fs';
import path from 'node:path';
import { REPO, ConfigError, loadConfig, checkCoverage, extractItems, probeExistence } from './extract.mjs';
import { toCsv } from './csv.mjs';

const argv = process.argv.slice(2);
// 取**最后一次**出现，这样 `npm run audio:precheck -- --section junior` 能覆盖 npm script 里写死的 --section primary
const arg = (f, d) => { const i = argv.lastIndexOf(f); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const has = (f) => argv.includes(f);

const SECTION = arg('--section', '');
const ONLY_SOURCE = arg('--source', '');
const OUT = arg('--out', `data/audio-audit/${SECTION || 'section'}_pipeline_list.csv`);
const PRECHECK = has('--precheck');
const NO_PROBE = has('--no-probe');
const CONC = Number(arg('--concurrency', '8'));

if (!SECTION) {
  console.error('用法：--section <primary|junior|senior|american> [--precheck] [--out <csv>]');
  process.exit(2);
}

let cfg;
let allFiles;
let rows;
try {
  cfg = loadConfig(SECTION);
  allFiles = checkCoverage(cfg);
  rows = await extractItems(cfg, { allFiles, onlySource: ONLY_SOURCE });
} catch (e) {
  if (e instanceof ConfigError) { console.error(e.message); process.exit(2); }
  throw e;
}

console.log(`section=${SECTION} 映射表=scripts/audio/audio-sources/${SECTION}.json`);
console.log(`覆盖率检查 + 反向哨兵通过：${allFiles.length} 个文件全部已分类`);
console.log(`可达 (文本 × 档位) 唯一对象 ${rows.size} 个`);

let missing = [...rows.values()];
if (NO_PROBE) {
  console.log('(--no-probe：跳过存在性探测，输出全量可达清单)');
} else {
  const probed = await probeExistence([...new Set(missing.map((r) => r.cdn_url))], {
    concurrency: CONC,
    onProgress: (d, t) => console.log(`  探测 ${d}/${t}`),
  });
  const before = missing.length;
  const unknownCount = missing.filter((r) => probed.get(r.cdn_url)?.unknown).length;
  missing = missing.filter((r) => !probed.get(r.cdn_url)?.exists);
  console.log(`已存在 ${before - missing.length} / 待生成 ${missing.length}`);
  if (unknownCount) {
    // 生成本身是幂等的（backfill 每条先 HEAD 再决定），所以 unknown 留在清单里无害；
    // 但必须报出来，否则"待生成 N"会被当成"确定缺 N 条"。
    console.log(`  ⚠ 其中 ${unknownCount} 条是**探测没探明白**（限流/抖动），不代表确定缺失；`);
    console.log(`    它们留在清单里是安全的（backfill 会先 HEAD，已存在则记 skipped），但别当成真实缺口计数。`);
    console.log(`    想拿准确数字：降低 --concurrency 重跑。`);
  }
}

if (missing.length) {
  const byTier = {};
  for (const r of missing) { const t = r.field.split('@')[1]; byTier[t] = (byTier[t] ?? 0) + 1; }
  console.log('缺口按档位:', JSON.stringify(byTier));
}

if (PRECHECK) {
  console.log(missing.length ? `\n⚠ 有 ${missing.length} 个缺口，跑 npm run audio:backfill 生成` : '\n✅ 无缺口');
  process.exit(missing.length ? 1 : 0);
}

const COLS = ['cache_key', 'text', 'voice_id', 'speed', 'cdn_url', 'storage_url', 'source_ref', 'record_id', 'field'];
fs.mkdirSync(path.dirname(path.join(REPO, OUT)), { recursive: true });
fs.writeFileSync(path.join(REPO, OUT), toCsv(COLS, missing), 'utf8');
console.log(`\n清单已写入 ${OUT}（${missing.length} 条）`);
console.log(missing.length
  ? `下一步：node scripts/audio/backfill-missing-audio.ts --list ${OUT} --out data/audio-audit/pipeline_result.csv`
  : '无需生成。');
// 写清单模式：写出去就算成功（退 0），好让 `导出 && 生成` 能串起来。
// 「有缺口 → 非零退出」这个 CI 语义只属于 --precheck。
process.exit(0);
