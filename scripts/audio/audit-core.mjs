/**
 * 巡检内核（无副作用、无网络，探测函数由外部注入 → 可被单测直接驱动）。
 *
 * 设计要点：**先证明检查器不空转，再信它的结论。**
 * 三条前置断言任一不过 → 整轮判无效，禁止输出"全绿"：
 *   1. 假 200 探针：4 条**必然不存在**的静态资源必须返回 404。返回 200 text/html 说明
 *      SPA 兜底回归，那时所有"缺失检查"都会假绿（这就是审计里 water.mp3 的原始故障）。
 *   2. 金丝雀：往被检查集合里注入一个**必然缺失**的 key（随机 UUID 文本），
 *      断言检查器能把它报成缺失。报不出来 = 检查器空转（例如探测函数恒返回 200）。
 *   3. 反向哨兵：无游离内容目录（见 coverage.mjs）。
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
  const missing = items.filter((i) => !probed.get(i.cdn_url)?.exists);
  return { probed, missing };
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
 */
export function reviewDeclarations(cfg, { readFile, grepRepo }) {
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
      const base = String(af.files).split('/').pop();
      const refs = grepRepo(base).filter((f) => !f.startsWith('scripts/audio/'));
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
