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
 * 三条硬规矩：
 *   1. **档位来自映射表，代码里不含任何默认档**。`scripts/audio/audio-sources/<section>.json`
 *      缺失 → 直接退出（提示需先产出该 section 的可达档位矩阵），绝不退回默认档位生成一批错档对象。
 *   2. **覆盖率检查**：section 数据目录下每个文件都必须在映射表里被显式分类
 *      （sources / audioFree / artifacts 三选一）。出现未分类文件 → 报错退出。
 *      新增内容文件时必须手工加一行，宁可挡住管线，也不默认"它大概没音频"。
 *   3. **增量**：只输出"还不存在"的对象（逐条 HEAD 探测），已有对象不重复列入。
 *
 * 退出码：0 = 无缺口；1 = 有缺口（--precheck 下可用于 CI 拦截）；2 = 配置/覆盖率错误。
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { pickers } from './pickers.mjs';
import { strayUnderContentParents } from './coverage.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');

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

const die = (code, msg) => { console.error(msg); process.exit(code); };
if (!SECTION) die(2, '用法：--section <primary|junior|senior|american> [--precheck] [--out <csv>]');

// ---------------- 映射表 ----------------
const CFG_PATH = path.join(HERE, 'audio-sources', `${SECTION}.json`);
if (!fs.existsSync(CFG_PATH)) {
  die(2,
`✗ 找不到 ${SECTION} 的档位映射表：${path.relative(REPO, CFG_PATH)}

这不是可以"用默认档位先跑起来"的情况：档位错了会生成一批没人播的对象，
而且没有任何审计能发现（它们 HTTP 200、体积正常、就是永远不会被命中）。

要接入 ${SECTION}，先做两步：
  1. 产出该 section 的可达语速档矩阵（做法参照 docs/audio/B4_1_speed_matrix.md：
     逐个音频调用点核源码，区分固定档 / 按年级档 / 用户可切换档 / getKidSpeed）
  2. 按 primary.json 的结构写 scripts/audio/audio-sources/${SECTION}.json`);
}
const cfg = JSON.parse(fs.readFileSync(CFG_PATH, 'utf8'));
const VOICE = cfg.voiceId;
if (!VOICE) die(2, `✗ ${SECTION}.json 缺 voiceId`);

// ---------------- key / url ----------------
const norm = (s) => String(s).trim().replace(/[\u2018\u2019\u201B\u2032]/g, "'");
const keyOf = (text, speed) =>
  `elevenlabs|${VOICE}|${Math.min(1.2, Math.max(0.6, Number(speed) || 0.95))}||${text}`;
const hashOf = (k) => crypto.createHash('sha256').update(k, 'utf8').digest('hex');
const CDN = (process.env.AUDIO_CDN_BASE || 'https://audio.bigmooneducation.com').replace(/\/$/, '');
const SUPA = (process.env.GOLDEN_SUPABASE_URL || 'https://degqpiiddkxcuzwombwp.supabase.co').replace(/\/$/, '');
const cdnUrl = (k) => { const h = hashOf(k); return `${CDN}/${h.slice(0, 2)}/${h}.mp3`; };
const storageUrl = (k) => { const h = hashOf(k); return `${SUPA}/storage/v1/object/public/tts-audio/${h.slice(0, 2)}/${h}.mp3`; };

// ---------------- 档位展开 ----------------
function speedsFor(tierName, grade) {
  const t = cfg.tiers?.[tierName];
  if (!t) die(2, `✗ 映射表里没有档位定义 "${tierName}"`);
  if (Array.isArray(t.speeds)) return t.speeds;
  if (t.byGrade) {
    if (grade == null) die(2, `✗ 档位 "${tierName}" 需要 grade，但该内容源没有 gradeFrom`);
    const s = t.byGrade[String(grade)];
    if (s == null) die(2, `✗ 档位 "${tierName}" 未定义 grade=${grade} 的速度（映射表 byGrade 缺这一档）`);
    return [s];
  }
  die(2, `✗ 档位 "${tierName}" 既没有 speeds 也没有 byGrade`);
}


// ---------------- 文件匹配 ----------------
const globToRe = (g) => new RegExp('^' + g.split('*').map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('[^/]*') + '$');
const listFiles = (dir) => {
  const out = [];
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p); else out.push(path.relative(REPO, p).split(path.sep).join('/'));
    }
  };
  walk(dir);
  return out;
};

// 覆盖率检查：section 数据根目录下每个文件都必须被显式分类。
// 根目录必须由配置显式声明（dataRoots）——不能从已配置的 glob 反推目录：
// 那样新增一个**全新子目录**时它压根不在扫描范围里，会被静默放行（实测踩过）。
const roots = cfg.dataRoots;
if (!Array.isArray(roots) || !roots.length) {
  die(2, `✗ ${SECTION}.json 缺 dataRoots：覆盖率检查需要显式声明要递归扫描的数据根目录`);
}
// 反向哨兵：dataRoots 自己是个单点——新建一个**不在 dataRoots 内**的顶层内容目录，
// 扫描器不会扫、也不知道它存在，又回到静默放行。所以再枚举一层父目录，
// 任何既不在 dataRoots、也不在 outOfScope 里的游离条目 → 报错退出。
const stray = strayUnderContentParents(cfg, REPO);
if (stray.length) {
  die(2,
`✗ 反向哨兵未通过：${stray.length} 个内容条目既不在 dataRoots 内，也没有 outOfScope 声明。

${stray.map((f) => '   ' + f).join('\n')}

要么把它纳入 dataRoots（属于本 section 的内容），
要么在 outOfScope 里显式声明并写清 why（属于别的 section / 不是内容 / 暂不接入）。
不声明就挡住管线：新建内容目录却没人告诉音频管线，是"缺口从此不可见"的典型起点。`);
}

const declared = [...(cfg.sources ?? []), ...(cfg.audioFree ?? []), ...(cfg.artifacts ?? [])]
  .map((s) => s.files).filter(Boolean).map(globToRe);
const allFiles = [...new Set(roots.flatMap((r) => (fs.existsSync(path.join(REPO, r)) ? listFiles(path.join(REPO, r)) : [])))];
const unclassified = allFiles.filter((f) => !declared.some((re) => re.test(f)));
if (unclassified.length) {
  die(2,
`✗ 覆盖率检查未通过：${unclassified.length} 个内容文件没有在 ${path.relative(REPO, CFG_PATH)} 里分类。

${unclassified.map((f) => '   ' + f).join('\n')}

每个文件必须显式归入三类之一：
   sources   —— 有朗读文本，需声明 picker 与 tiers（生成哪几档）
   audioFree —— 确认无音频，写明依据
   artifacts —— 产物而非内容源
不允许"默认当作无音频"：漏一个内容源 = 那批文本永远是冷合成，自动播路径上就是静音。`);
}

// ---------------- 抽取 ----------------
const gradeOf = (rel, how) => {
  if (how !== 'filename') return null;
  const m = /grade(\d)/.exec(rel);
  return m ? Number(m[1]) : null;
};
const rows = new Map(); // cache_key -> row
let sourcesRun = 0;
for (const s of cfg.sources ?? []) {
  if (ONLY_SOURCE && s.id !== ONLY_SOURCE) continue;
  if (String(s.files).startsWith('table:')) {
    // 表源路径尚未用真实数据验证过 → **硬失败**，绝不 warn-and-skip。
    // 理由：跳过 = 那批内容根本没被读过，而 precheck 会报"零缺口"、退出码 0、CI 绿灯，
    // 人看到绿的就不再怀疑 —— 与假 200、CRLF 静默失效同一类。
    die(2,
`✗ 内容源 ${s.id} 是表源（${s.files}），但表源代码路径尚未用真实数据验证过，已封印。

解除封印前请先：
  1. 用该表的真实数据跑通一次抽取（字段名、筛选条件、grade 来源都要对）
  2. 与对应 section 的可达档位矩阵核对档位
  3. 在本文件里移除这道封印，并补一条针对表源的单测

在此之前宁可整轮失败，也不要静默跳过 —— 跳过会让 precheck 谎报零缺口。`);
  }
  const re = globToRe(s.files);
  const files = allFiles.filter((f) => re.test(f));
  if (!files.length) die(2, `✗ 内容源 ${s.id} 的 files 模式没有匹配到任何文件：${s.files}`);
  const pick = pickers[s.picker];
  if (!pick) die(2, `✗ 内容源 ${s.id} 的 picker "${s.picker}" 未实现（可用：${Object.keys(pickers).join(', ')}）`);
  for (const rel of files) {
    const abs = path.join(REPO, rel);
    const json = rel.endsWith('.json') ? JSON.parse(fs.readFileSync(abs, 'utf8')) : null;
    const grade = gradeOf(rel, s.gradeFrom);
    for (const item of pick(json, { absPath: abs, rel, grade })) {
      const text = norm(item.text);
      if (!text) continue;
      for (const tier of s.tiers) {
        for (const sp of speedsFor(tier, grade)) {
          const k = keyOf(text, sp);
          if (rows.has(k)) continue;
          rows.set(k, {
            cache_key: k, text, voice_id: VOICE, speed: sp,
            cdn_url: cdnUrl(k), storage_url: storageUrl(k),
            source_ref: rel, record_id: item.record_id, field: `${item.field}@${tier}`,
          });
        }
      }
    }
  }
  sourcesRun++;
}
console.log(`section=${SECTION} 映射表=${path.relative(REPO, CFG_PATH)}`);
console.log(`覆盖率检查通过：${allFiles.length} 个文件全部已分类`);
console.log(`内容源 ${sourcesRun} 个 → 可达 (文本 × 档位) 唯一对象 ${rows.size} 个`);

// ---------------- 增量：只留还不存在的 ----------------
async function head(url) {
  for (let a = 0; a < 3; a++) {
    try {
      const r = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(20000) });
      if (r.status === 200 || r.status === 400 || r.status === 404) {
        return { status: r.status, bytes: Number(r.headers.get('content-length') || 0) };
      }
    } catch { /* retry */ }
    await new Promise((x) => setTimeout(x, 800 * (a + 1)));
  }
  return { status: 0, bytes: 0 };
}

let missing = [...rows.values()];
if (!NO_PROBE) {
  const all = [...rows.values()];
  const found = [];
  let done = 0;
  const q = [...all];
  await Promise.all(Array.from({ length: CONC }, async () => {
    for (;;) {
      const r = q.shift();
      if (!r) return;
      const h = await head(r.cdn_url);
      if (h.status === 200 && h.bytes >= 2048) found.push(r.cache_key);
      if (++done % 500 === 0) console.log(`  探测 ${done}/${all.length}`);
    }
  }));
  const ok = new Set(found);
  missing = all.filter((r) => !ok.has(r.cache_key));
  console.log(`已存在 ${ok.size} / 缺口 ${missing.length}`);
} else {
  console.log('(--no-probe：跳过存在性探测，输出全量可达清单)');
}

const byTier = {};
for (const r of missing) { const t = r.field.split('@')[1]; byTier[t] = (byTier[t] ?? 0) + 1; }
if (missing.length) console.log('缺口按档位:', JSON.stringify(byTier));

if (PRECHECK) {
  console.log(missing.length ? `\n⚠ 有 ${missing.length} 个缺口，跑 npm run audio:backfill 生成` : '\n✅ 无缺口');
  process.exit(missing.length ? 1 : 0);
}

const COLS = ['cache_key', 'text', 'voice_id', 'speed', 'cdn_url', 'storage_url', 'source_ref', 'record_id', 'field'];
const esc = (v) => { const s = String(v ?? ''); return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
fs.mkdirSync(path.dirname(path.join(REPO, OUT)), { recursive: true });
fs.writeFileSync(path.join(REPO, OUT),
  '\uFEFF' + [COLS.join(',')].concat(missing.map((r) => COLS.map((c) => esc(r[c])).join(','))).join('\n') + '\n', 'utf8');
console.log(`\n清单已写入 ${OUT}（${missing.length} 条）`);
console.log(missing.length
  ? `下一步：node scripts/audio/backfill-missing-audio.ts --list ${OUT} --out data/audio-audit/pipeline_result.csv`
  : '无需生成。');
// 写清单模式：写出去就算成功（退 0），好让 `导出 && 生成` 能串起来。
// 「有缺口 → 非零退出」这个 CI 语义只属于 --precheck。
process.exit(0);
