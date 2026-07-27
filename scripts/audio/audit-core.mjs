/**
 * 巡检内核（无副作用、无网络，探测函数由外部注入 → 可被单测直接驱动）。
 *
 * 设计要点：**先证明检查器不空转，再信它的结论。**
 * 四条前置断言任一不过 → 整轮判无效，禁止输出"全绿"：
 *   1. 假 200 探针：4 条**必然不存在**的静态资源必须返回 404。返回 200 text/html 说明
 *      SPA 兜底回归，那时所有"缺失检查"都会假绿（这就是审计里 water.mp3 的原始故障）。
 *   2. 金丝雀：往被检查集合里注入一个**必然缺失**的 key（随机 UUID 文本），
 *      断言检查器能把它报成缺失。报不出来 = 检查器空转（例如探测函数恒返回 200）。
 *   3. 反向哨兵：无游离内容目录（见 coverage.mjs）。
 *   4. 探测确定性：不允许有 unknown（重试用完仍是 429/5xx/超时）。unknown 既不是"在"也不是
 *      "不在"，把它当成缺失会让人去重生成本来就存在的对象 —— CI 上撞 CDN 限流时踩过，
 *      19 条实际存在的被报成缺口（本地逐条复验 19/19 都是 200）。
 */
import crypto from 'node:crypto';

/** 必然缺失的金丝雀条目：随机 UUID 文本，不可能有人合成过。 */
export function makeCanaryItem(voiceId, cdnUrlOf, cacheKeyOf) {
  const text = `audio-audit canary ${crypto.randomUUID()}`;
  const key = cacheKeyOf(voiceId, text, 0.85);
  return {
    cache_key: key, text, voice_id: voiceId, speed: 0.85,
    cdn_url: cdnUrlOf(key), storage_url: '',
    source_ref: '(canary)', record_id: '(canary)', field: 'canary@fixed',
    __canary: true,
  };
}

/**
 * 跑一轮缺失检查。
 * @param items 待检查条目（含金丝雀）
 * @param probe async (urls) => Map<url, {exists:boolean,...}>
 */
export async function checkMissing(items, probe) {
  const urls = [...new Set(items.map((i) => i.cdn_url))];
  const probed = await probe(urls);
  // 三态：确定不在 = missing；没拿到确定答案 = unknown（限流/抖动/超时）。
  // ⚠️ unknown **不能**并进 missing —— 那会把"没探明白"报成"没有音频"，
  // 让人去重新生成本来就在的对象。CI 上撞 CDN 限流时踩过：19 条实际存在的被报成缺失。
  // 兼容旧探测器（只回 exists 的实现）：没有 unknown 字段时退回原语义。
  const unknown = items.filter((i) => probed.get(i.cdn_url)?.unknown === true);
  const missing = items.filter((i) => {
    const p = probed.get(i.cdn_url);
    if (p && 'unknown' in p) return p.missing === true;
    return !p?.exists;
  });
  return { probed, missing, unknown };
}

/**
 * 探测确定性判定：有 unknown 就说明这轮探测没探明白。
 * 与金丝雀/假200 同级——**结论不可信，整轮作废**，而不是当成缺口报红。
 */
export function assertProbeConclusive(unknown, total) {
  return unknown.length === 0
    ? { passed: true, reason: `全部 ${total} 条都拿到确定答案（200 或 404/400）` }
    : {
      passed: false,
      reason: `${unknown.length}/${total} 条探测没拿到确定答案（重试用完仍是 429/5xx/超时）。`
        + '这些既不能算"在"也不能算"不在" —— 本轮缺失统计不可信，'
        + '降低 --concurrency 后重跑（CDN 限流是最常见原因）。',
    };
}

/**
 * 金丝雀判定：金丝雀必须出现在 missing 里。
 * @returns {{passed:boolean, reason:string}}
 */
export function assertCanary(missing, canary) {
  const found = missing.some((m) => m.cache_key === canary.cache_key);
  return found
    ? { passed: true, reason: '金丝雀被正确报成缺失' }
    : {
      passed: false,
      reason: '金丝雀没有被报成缺失 —— 检查器在空转（探测函数可能恒返回存在、'
        + '或 missing 计算有误）。本轮结论一律作废，不得输出"全绿"。',
    };
}

/** 假 200 探针判定：每条都必须 404。 */
export function assertNoFake200(probeResults) {
  const bad = probeResults.filter((r) => r.status !== 404);
  return bad.length === 0
    ? { passed: true, reason: `${probeResults.length} 条缺失资源探针全部 404` }
    : {
      passed: false,
      reason: `${bad.length} 条探针不是 404（${bad.map((b) => `${b.url} → ${b.status} ${b.contentType}`).join('; ')}）。`
        + '若为 200 text/html，说明 SPA 兜底回归，所有缺失检查都会假绿 —— 本轮作废。',
    };
}

/**
 * 复核映射表里的"声明"是否还成立（防声明过期）：
 *   - audioFree：声明无音频的文件，其消费组件里不应出现播放调用
 *   - audioFree + assertUnreferenced：该文件名在源码里应零引用
 *   - outOfScope status=unverified：本身就是"尚未确认"，每轮提示一次
 * @param readFile (relPath) => string，找不到文件应抛错
 * @param grepRepo (needle) => string[] 命中该字符串的文件列表
 * @param matchFiles (glob) => string[] 把映射表里的 glob 展开成真实文件（assertUnreferenced 用）
 */
export function reviewDeclarations(cfg, { readFile, grepRepo, matchFiles }) {
  const PLAY_PATTERNS = ['speak(', 'speakKid(', 'hubSpeak(', 'hubSpeakAtSpeed(', 'speakFromUrl(', 'new Audio(', 'speechSynthesis'];
  const items = [];

  for (const af of cfg.audioFree ?? []) {
    for (const consumer of af.consumers ?? []) {
      let src;
      try { src = readFile(consumer); } catch {
        items.push({ kind: 'audioFree', severity: 'warn', target: consumer, detail: '声明里的消费组件已不存在，声明可能过期' });
        continue;
      }
      const hits = PLAY_PATTERNS.filter((p) => src.includes(p));
      if (hits.length) {
        items.push({
          kind: 'audioFree', severity: 'warn', target: consumer,
          detail: `声明为无音频，但组件里出现播放调用：${hits.join(', ')} —— 该内容源可能需要改成 sources 并声明档位`,
        });
      }
    }
    if (af.assertUnreferenced) {
      // files 可能是 glob（`_backup/*.json`）。直接拿 basename 去 grep 会变成搜 "*.json"，
      // 命中一大片、每轮都告警 —— 一个永远在响的告警等于没有告警。
      // 有 files 清单时把 glob 展开成真实文件名逐个 grep；展开不到就明说，不假装通过。
      const pat = String(af.files);
      const names = pat.includes('*')
        ? (matchFiles ? matchFiles(pat).map((f) => f.split('/').pop()) : null)
        : [pat.split('/').pop()];
      if (!names) {
        items.push({
          kind: 'audioFree', severity: 'warn', target: pat,
          detail: 'assertUnreferenced 用了 glob，但本次没有文件清单可展开 —— 零引用断言这轮没真正执行',
        });
        continue;
      }
      const refs = [...new Set(names.flatMap((n) => grepRepo(n)))].filter((f) => !f.startsWith('scripts/audio/'));
      if (refs.length) {
        items.push({
          kind: 'audioFree', severity: 'warn', target: af.files,
          detail: `声明为零引用，但仍被这些文件引用：${refs.join(', ')}`,
        });
      }
    }
  }

  for (const os of cfg.outOfScope ?? []) {
    if (os.status === 'unverified') {
      items.push({
        kind: 'outOfScope', severity: 'warn', target: (os.paths ?? []).join(', '),
        detail: `status=unverified：尚未确认是否有朗读入口。${os.why ?? ''} —— 查清后改成 confirmed，本告警自然消失`,
      });
    }
  }
  return items;
}
