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
import { loadDbEnv, fetchTableRows, TableSourceError } from './table-source.mjs';
// 唯一实现：播放侧发给 edge 的就是 cleanForTTS 之后的文本，抽取必须用同一个函数算 key。
import { cleanForTTS } from '../../src/lib/ttsClean.ts';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const REPO = path.resolve(HERE, '../..');

export class ConfigError extends Error {}

export const CDN_BASE = (process.env.AUDIO_CDN_BASE || 'https://audio.bigmooneducation.com').replace(/\/$/, '');
const STORAGE_BASE = (process.env.AUDIO_STORAGE_BASE || 'https://degqpiiddkxcuzwombwp.supabase.co').replace(/\/$/, '');

/**
 * 文本 → **送进 TTS 的那一串**（cache key 就是按它算的）。
 *
 * 两步，缺一不可：
 *   ① trim + 弯撇号归一 —— 与 `toHubTtsText`（src/lib/primaryHub/speech.ts）一致
 *   ② `cleanForTTS` —— 与 `fetchTTS`（src/lib/speak.ts:411）一致：
 *      它在**发给 edge 之前**就把文本换掉了（剥说话人标记、把 sb/sth/etc. 展开成整词），
 *      而 edge 是拿收到的文本算 hash 的。所以对象真正落在 cleanForTTS 之后的 key 上。
 *
 * ⚠️ 这里曾经只做 ①：凡是 cleanForTTS 会改写的文本（junior 实测 292 条：
 * "make sb's bed" → "make somebody's bed"、带 W:/M: 的听力原文…），
 * 抽取算出的 key 与 app 实际请求的 key **不是同一个** —— 生成的对象没人播，
 * 播的时候又当成冷 key 重新合成。primary 侧 0 条受影响（没有 sb/sth/标记），
 * 所以此前的 3436/3436 不受影响。
 *
 * cleanForTTS 直接从 src 引入（Node 24 原生支持 import .ts），**不另写一份** ——
 * 另写必然漂，漂了就是同一个 bug 换个地方复发。
 */
const normText = (s) => cleanForTTS(String(s).trim().replace(/[\u2018\u2019\u201B\u2032]/g, "'"));
/**
 * provider 必须**按 voice 派生**，与 supabase/functions/tts/index.ts:310-315 一致：
 *   voiceId 以 "el:" 开头 → elevenlabs，否则 → openai。
 * 曾经这里把 provider 写死成 'elevenlabs'——对小学（恒 el:lily）碰巧无害，
 * 但初中有一部分走 `speak()` 的用户默认音色（nova），写死就会算出**根本不存在的 key**，
 * 从而虚报一批缺口。
 */
export const cacheKeyOf = (voice, text, speed) => {
  const provider = String(voice).startsWith('el:') ? 'elevenlabs' : 'openai';
  return `${provider}|${voice}|${Math.min(1.2, Math.max(0.6, Number(speed) || 0.95))}||${text}`;
};
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

/**
 * 转交校验：outOfScope 里写了 `ownedBy: "<section>"` 的路径，必须真的落在那个 section 的
 * dataRoots / extraFiles 里。
 *
 * 为什么单独加这一道：把一个目录从 A 的排除表移到 B 之后，最容易出的错不是"漏声明"，
 * 而是"两边都以为对方管着"——A 说 ownedBy B，B 的 dataRoots 里压根没有它。
 * 那样两边巡检都绿，那批内容却谁都不扫。这里让它变成硬失败。
 */
export function checkHandoffs(cfg) {
  const norm = (p) => String(p).replace(/\\/g, '/').replace(/\/+$/, '');
  for (const o of cfg.outOfScope ?? []) {
    if (!o.ownedBy) continue;
    let target;
    try {
      target = JSON.parse(fs.readFileSync(configPath(o.ownedBy), 'utf8'));
    } catch {
      throw new ConfigError(`✗ outOfScope 声明 ownedBy: "${o.ownedBy}"，但读不到 ${o.ownedBy}.json —— 这批内容实际上没人接管`);
    }
    const covered = [...(target.dataRoots ?? []), ...(target.extraFiles ?? []).map((e) => e.path ?? e)].map(norm);
    const orphan = (o.paths ?? []).map(norm).filter((p) => !covered.some((c) => p === c || c.startsWith(`${p}/`) || p.startsWith(`${c}/`)));
    if (orphan.length) {
      throw new ConfigError(
`✗ 转交校验未通过：以下路径声明 ownedBy: "${o.ownedBy}"，但 ${o.ownedBy}.json 的 dataRoots/extraFiles 并不覆盖它们：

${orphan.map((p) => '   ' + p).join('\n')}

两边都以为对方管着 = 这批内容谁都不扫，而两边巡检都是绿的。`);
    }
  }
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
  checkHandoffs(cfg);
  const declared = [...(cfg.sources ?? []), ...(cfg.audioFree ?? []), ...(cfg.artifacts ?? [])]
    .map((s) => s.files).filter(Boolean).map(globToRe);
  // extraFiles：**不在 dataRoots 里、但确实被朗读**的单个文件（例如把文本写死在页面组件里的
  // SENTENCE_PATTERNS）。必须逐个存在，否则文件一改名就静默少一批文本。
  const extra = (cfg.extraFiles ?? []).map((e) => e.path ?? e);
  const missing = extra.filter((f) => !fs.existsSync(path.join(REPO, f)));
  if (missing.length) {
    throw new ConfigError(
`✗ extraFiles 里有 ${missing.length} 个文件不存在：

${missing.map((f) => '   ' + f).join('\n')}

这些是"文本写死在代码里"的内容源。文件改名/挪走却没同步这里 = 那批文本从此不在盘点内。`);
  }
  const allFiles = [...new Set([...cfg.dataRoots.flatMap((r) => listFilesUnder(r)), ...extra])];
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

/** 该 section 声明的表源（`files` 以 `table:` 开头）。供调用方在跳过它们时如实说明。 */
export const tableSourcesOf = (cfg) =>
  (cfg.sources ?? []).filter((s) => String(s.files).startsWith('table:'))
    .map((s) => ({ id: s.id, table: String(s.files).slice('table:'.length), tiers: s.tiers }));

const gradeOf = (rel, how) => {
  if (how !== 'filename') return null;
  const m = /grade(\d)/.exec(rel);
  return m ? Number(m[1]) : null;
};

/**
 * 按映射表抽出全部「可达 (文本 × 档位)」对象。
 * @returns {Map<string, {cache_key,text,voice_id,speed,cdn_url,storage_url,source_ref,record_id,field}>}
 */
export async function extractItems(cfg, { allFiles, onlySource = '', allowEmptySources = false, skipTables = false } = {}) {
  const files = allFiles ?? checkCoverage(cfg);
  const rows_ = new Map();
  for (const s of cfg.sources ?? []) {
    if (onlySource && s.id !== onlySource) continue;
    if (skipTables && String(s.files).startsWith('table:')) continue; // 调用方负责把跳过的表源**说出来**（见 tableSourcesOf）
    if (String(s.files).startsWith('table:')) {
      // 表源已解封（依据见 table-source.mjs 末尾三条）。取数走 fetchTableRows：
      // 分页触顶硬失败 + 抽取数必须与 count=exact 相等，绝不静默截断。
      const pick = pickers[s.picker];
      if (!pick) throw new ConfigError(`✗ 内容源 ${s.id} 的 picker "${s.picker}" 未实现（可用：${Object.keys(pickers).join(', ')}）`);
      if (!s.filters || !/^in\.\(/.test(String(s.filters.grade ?? ''))) {
        throw new ConfigError(
`✗ 表源 ${s.id} 必须显式声明 grade 过滤（形如 "grade": "in.(7,8,9)"）。

junior_* 系列是**初中与高中混表**：初中 publisher 是 junior / junior_fltrp，
pep / fltrp / sufe 是高中的。只按 publisher 过滤会把高中行算进来。`);
      }
      let rows;
      try {
        const db = loadDbEnv(REPO);
        rows = await fetchTableRows(db, { table: String(s.files).slice('table:'.length), ...s });
      } catch (e) {
        if (e instanceof TableSourceError) throw new ConfigError(e.message);
        throw e;
      }
      for (const item of pick(rows, { source: s })) {
        const text = normText(item.text);
        if (!text) continue;
        // picker 可以为**单条**指定档位（对话按说话人分男女声就靠这个）。
        // 指定的档位必须在该 source 的 tiers 里声明过，否则 exit 2 ——
        // 不允许出现"映射表没覆盖的组合"，那正是会生成一批没人播的对象的路子。
        let tiers = s.tiers;
        if (item.tier) {
          if (!s.tiers.includes(item.tier)) {
            throw new ConfigError(
`✗ 内容源 ${s.id} 的 picker 给某条文本指定了档位 "${item.tier}"，但该源的 tiers 里没有它（只有 ${s.tiers.join(', ')}）。
   映射表未覆盖的组合一律判错：放行等于按一个没人播的 key 生成音频。`);
          }
          tiers = [item.tier];
        }
        for (const tier of tiers) {
          const voice = cfg.tiers?.[tier]?.voiceId ?? cfg.voiceId;
          for (const sp of speedsFor(cfg, tier, item.grade ?? null)) {
            const k = cacheKeyOf(voice, text, sp);
            if (rows_.has(k)) continue;
            rows_.set(k, {
              cache_key: k, text, voice_id: voice, speed: sp,
              cdn_url: cdnUrlOf(k), storage_url: storageUrlOf(k),
              source_ref: `table:${String(s.files).slice('table:'.length)}`,
              record_id: item.record_id, field: `${item.field}@${tier}`,
            });
          }
        }
      }
      continue;
    }
    const re = globToRe(s.files);
    const matched = files.filter((f) => re.test(f));
    // 全量模式下"某内容源匹配不到文件"= 映射表写错了，必须炸；
    // 「只扫改动文件」模式下大部分源本来就匹配不到，属正常（由 allowEmptySources 打开）。
    if (!matched.length && !allowEmptySources) {
      throw new ConfigError(`✗ 内容源 ${s.id} 的 files 模式没有匹配到任何文件：${s.files}`);
    }
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
          // 音色按档位取：junior 的"用户设置音色"档是 nova，其余仍是 section 的 el:lily。
          const voice = cfg.tiers?.[tier]?.voiceId ?? cfg.voiceId;
          for (const sp of speedsFor(cfg, tier, grade)) {
            const k = cacheKeyOf(voice, text, sp);
            if (rows_.has(k)) continue;
            rows_.set(k, {
              cache_key: k, text, voice_id: voice, speed: sp,
              cdn_url: cdnUrlOf(k), storage_url: storageUrlOf(k),
              source_ref: rel, record_id: item.record_id, field: `${item.field}@${tier}`,
            });
          }
        }
      }
    }
  }
  return rows_;
}

/** 并发 HEAD 探测；判定「存在」= 200 且 ≥ minBytes（默认 2KB，用来揪出空音频）。 */
export async function probeExistence(urls, { concurrency = 8, minBytes = 2048, onProgress, attempts = 5 } = {}) {
  const result = new Map();
  const q = [...urls];
  let done = 0;
  const head = async (url) => {
    for (let a = 0; a < attempts; a++) {
      try {
        const r = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(20000) });
        // 只有这三个状态是**确定答案**：200=在、404/400=不在。
        // 429/5xx/超时都不是答案，退避重试；重试用完仍没答案 → 记 unknown，绝不当成"不在"。
        if (r.status === 200 || r.status === 400 || r.status === 404) {
          return { status: r.status, bytes: Number(r.headers.get('content-length') || 0), ct: r.headers.get('content-type') || '' };
        }
      } catch { /* retry */ }
      await new Promise((x) => setTimeout(x, 800 * 2 ** a + Math.floor(Math.random() * 400)));
    }
    return { status: 0, bytes: 0, ct: '' };
  };
  await Promise.all(Array.from({ length: concurrency }, async () => {
    for (;;) {
      const u = q.shift();
      if (!u) return;
      const h = await head(u);
      // 三态，别再压成两态：
      //   exists  —— 确定在（200 且体积够）
      //   missing —— 确定不在（404/400，或 200 但体积过小=空音频）
      //   unknown —— 没拿到确定答案（限流/网关抖动/超时）
      // 曾经把 unknown 压成 exists:false：CI 上并发探 1.4 万条撞到 CDN 限流，
      // 19 条**实际存在**的对象被报成缺失（本地逐条复验 19/19 都是 200）。
      // 把不确定说成结论，和假绿是同一类错误，只是方向相反。
      const unknown = h.status === 0;
      result.set(u, {
        ...h,
        unknown,
        exists: h.status === 200 && h.bytes >= minBytes,
        missing: !unknown && !(h.status === 200 && h.bytes >= minBytes),
      });
      if (onProgress && ++done % 500 === 0) onProgress(done, urls.length);
    }
  }));
  return result;
}
