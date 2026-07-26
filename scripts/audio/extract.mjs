/**
 * 映射表加载 + 覆盖率/哨兵校验 + 内容抽取（无副作用，导出 CLI 与巡检共用）。
 *
 * 抽成模块的理由和 csv.mjs 一样：导出清单与巡检**必须用同一套抽取逻辑**。
 * 两份实现会漂，漂了以后巡检就查不到导出漏掉的东西——又是一次"检查器说没问题"。
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { pickers } from './pickers.mjs';
import { strayUnderContentParents } from './coverage.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const REPO = path.resolve(HERE, '../..');

export class ConfigError extends Error {}

export const CDN_BASE = (process.env.AUDIO_CDN_BASE || 'https://audio.bigmooneducation.com').replace(/\/$/, '');
const STORAGE_BASE = (process.env.AUDIO_STORAGE_BASE || 'https://degqpiiddkxcuzwombwp.supabase.co').replace(/\/$/, '');

const normText = (s) => String(s).trim().replace(/[\u2018\u2019\u201B\u2032]/g, "'");
export const cacheKeyOf = (voice, text, speed) =>
  `elevenlabs|${voice}|${Math.min(1.2, Math.max(0.6, Number(speed) || 0.95))}||${text}`;
const hashOf = (k) => crypto.createHash('sha256').update(k, 'utf8').digest('hex');
export const cdnUrlOf = (k) => { const h = hashOf(k); return `${CDN_BASE}/${h.slice(0, 2)}/${h}.mp3`; };
export const storageUrlOf = (k) => { const h = hashOf(k); return `${STORAGE_BASE}/storage/v1/object/public/tts-audio/${h.slice(0, 2)}/${h}.mp3`; };

const globToRe = (g) => new RegExp('^' + g.split('*').map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('[^/]*') + '$');

export function configPath(section) {
  return path.join(HERE, 'audio-sources', `${section}.json`);
}

export function loadConfig(section) {
  const p = configPath(section);
  if (!fs.existsSync(p)) {
    throw new ConfigError(
`✗ 找不到 ${section} 的档位映射表：${path.relative(REPO, p)}

这不是可以"用默认档位先跑起来"的情况：档位错了会生成一批没人播的对象，
而且没有任何审计能发现（它们 HTTP 200、体积正常、就是永远不会被命中）。

要接入 ${section}，先做两步：
  1. 产出该 section 的可达语速档矩阵（做法参照 docs/audio/B4_1_speed_matrix.md）
  2. 按 primary.json 的结构写 scripts/audio/audio-sources/${section}.json`);
  }
  const cfg = JSON.parse(fs.readFileSync(p, 'utf8'));
  if (!cfg.voiceId) throw new ConfigError(`✗ ${section}.json 缺 voiceId`);
  if (!Array.isArray(cfg.dataRoots) || !cfg.dataRoots.length) {
    throw new ConfigError(`✗ ${section}.json 缺 dataRoots：覆盖率检查需要显式声明要递归扫描的数据根目录`);
  }
  // outOfScope 必须逐条带 status，缺失即报错：没有 status 的排除项 = 把"不知道"记录成"没问题"
  const bad = (cfg.outOfScope ?? []).filter((o) => o.status !== 'confirmed' && o.status !== 'unverified');
  if (bad.length) {
    throw new ConfigError(
`✗ ${section}.json 有 ${bad.length} 条 outOfScope 缺少合法 status（必须是 confirmed 或 unverified）：

${bad.map((o) => '   ' + (o.paths ?? []).join(', ')).join('\n')}

  confirmed  —— 已确认（跨 section / 已核实无播放调用），why 里要写依据
  unverified —— 尚未确认，巡检每轮告警一次，不判失败
无 status 的排除项等于把"不知道"写成了"没问题"，这里不接受。`);
  }
  return cfg;
}

export function listFilesUnder(relDir) {
  const abs = path.join(REPO, relDir);
  if (!fs.existsSync(abs)) return [];
  const out = [];
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else out.push(path.relative(REPO, p).split(path.sep).join('/'));
    }
  };
  walk(abs);
  return out;
}

/** 反向哨兵 + 覆盖率检查。返回本 section 数据根下的全部文件。 */
export function checkCoverage(cfg) {
  const stray = strayUnderContentParents(cfg, REPO);
  if (stray.length) {
    throw new ConfigError(
`✗ 反向哨兵未通过：${stray.length} 个内容条目既不在 dataRoots 内，也没有 outOfScope 声明。

${stray.map((f) => '   ' + f).join('\n')}

要么纳入 dataRoots，要么在 outOfScope 里显式声明（含 status 与 why）。
新建内容目录却没人告诉音频管线，是"缺口从此不可见"的典型起点。`);
  }
  const declared = [...(cfg.sources ?? []), ...(cfg.audioFree ?? []), ...(cfg.artifacts ?? [])]
    .map((s) => s.files).filter(Boolean).map(globToRe);
  const allFiles = [...new Set(cfg.dataRoots.flatMap((r) => listFilesUnder(r)))];
  const unclassified = allFiles.filter((f) => !declared.some((re) => re.test(f)));
  if (unclassified.length) {
    throw new ConfigError(
`✗ 覆盖率检查未通过：${unclassified.length} 个内容文件没有在映射表里分类。

${unclassified.map((f) => '   ' + f).join('\n')}

必须显式归入 sources / audioFree / artifacts 之一。
不允许"默认当作无音频"：漏一个内容源 = 那批文本永远是冷合成，自动播路径上就是静音。`);
  }
  return allFiles;
}

function speedsFor(cfg, tierName, grade) {
  const t = cfg.tiers?.[tierName];
  if (!t) throw new ConfigError(`✗ 映射表里没有档位定义 "${tierName}"`);
  if (Array.isArray(t.speeds)) return t.speeds;
  if (t.byGrade) {
    if (grade == null) throw new ConfigError(`✗ 档位 "${tierName}" 需要 grade，但该内容源没有 gradeFrom`);
    const s = t.byGrade[String(grade)];
    if (s == null) throw new ConfigError(`✗ 档位 "${tierName}" 未定义 grade=${grade} 的速度`);
    return [s];
  }
  throw new ConfigError(`✗ 档位 "${tierName}" 既没有 speeds 也没有 byGrade`);
}

const gradeOf = (rel, how) => {
  if (how !== 'filename') return null;
  const m = /grade(\d)/.exec(rel);
  return m ? Number(m[1]) : null;
};

/**
 * 按映射表抽出全部「可达 (文本 × 档位)」对象。
 * @returns {Map<string, {cache_key,text,voice_id,speed,cdn_url,storage_url,source_ref,record_id,field}>}
 */
export function extractItems(cfg, { allFiles, onlySource = '' } = {}) {
  const files = allFiles ?? checkCoverage(cfg);
  const rows = new Map();
  for (const s of cfg.sources ?? []) {
    if (onlySource && s.id !== onlySource) continue;
    if (String(s.files).startsWith('table:')) {
      throw new ConfigError(
`✗ 内容源 ${s.id} 是表源（${s.files}），但表源代码路径尚未用真实数据验证过，已封印。

解除封印前请先：
  1. 用该表的真实数据跑通一次抽取（字段名、筛选条件、grade 来源都要对）
  2. 与对应 section 的可达档位矩阵核对档位
  3. 移除这道封印，并补一条针对表源的单测

在此之前宁可整轮失败，也不要静默跳过 —— 跳过会让 precheck 谎报零缺口。`);
    }
    const re = globToRe(s.files);
    const matched = files.filter((f) => re.test(f));
    if (!matched.length) throw new ConfigError(`✗ 内容源 ${s.id} 的 files 模式没有匹配到任何文件：${s.files}`);
    const pick = pickers[s.picker];
    if (!pick) throw new ConfigError(`✗ 内容源 ${s.id} 的 picker "${s.picker}" 未实现（可用：${Object.keys(pickers).join(', ')}）`);
    for (const rel of matched) {
      const abs = path.join(REPO, rel);
      const json = rel.endsWith('.json') ? JSON.parse(fs.readFileSync(abs, 'utf8')) : null;
      const grade = gradeOf(rel, s.gradeFrom);
      for (const item of pick(json, { absPath: abs, rel, grade })) {
        const text = normText(item.text);
        if (!text) continue;
        for (const tier of s.tiers) {
          for (const sp of speedsFor(cfg, tier, grade)) {
            const k = cacheKeyOf(cfg.voiceId, text, sp);
            if (rows.has(k)) continue;
            rows.set(k, {
              cache_key: k, text, voice_id: cfg.voiceId, speed: sp,
              cdn_url: cdnUrlOf(k), storage_url: storageUrlOf(k),
              source_ref: rel, record_id: item.record_id, field: `${item.field}@${tier}`,
            });
          }
        }
      }
    }
  }
  return rows;
}

/** 并发 HEAD 探测；判定「存在」= 200 且 ≥ minBytes（默认 2KB，用来揪出空音频）。 */
export async function probeExistence(urls, { concurrency = 8, minBytes = 2048, onProgress } = {}) {
  const result = new Map();
  const q = [...urls];
  let done = 0;
  const head = async (url) => {
    for (let a = 0; a < 3; a++) {
      try {
        const r = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(20000) });
        if (r.status === 200 || r.status === 400 || r.status === 404) {
          return { status: r.status, bytes: Number(r.headers.get('content-length') || 0), ct: r.headers.get('content-type') || '' };
        }
      } catch { /* retry */ }
      await new Promise((x) => setTimeout(x, 800 * (a + 1)));
    }
    return { status: 0, bytes: 0, ct: '' };
  };
  await Promise.all(Array.from({ length: concurrency }, async () => {
    for (;;) {
      const u = q.shift();
      if (!u) return;
      const h = await head(u);
      result.set(u, { ...h, exists: h.status === 200 && h.bytes >= minBytes });
      if (onProgress && ++done % 500 === 0) onProgress(done, urls.length);
    }
  }));
  return result;
}
