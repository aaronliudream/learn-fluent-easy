/**
 * B/C/D/F/G 五段生成器共用的骨架。
 *
 * ⚠️ 为什么抽出来:A 段的 callModel / 并发 / 断点续跑 / 失败回喂
 * 这套逻辑在 generate-content.mjs 里,五个新生成器各抄一份必然漂移 ——
 * 改好了限流退避、忘了改另外四个,下一次限流就又炸。
 * (prompt-rules.mjs 抽出来就是同一个理由。)
 *
 * A 段暂不改造成用这个模块:它已经跑完 4471 词并通过验收,
 * 动它等于让已验收的产出重新面临风险,收益为零。新段用新骨架。
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv, requireKeys } from './env.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const REPO = path.resolve(HERE, '..', '..');
export const DATA = path.join(HERE, 'data');
export const GEN = path.join(DATA, 'generated');

export const ENV = loadEnv(REPO);
export const arg = (k, d) => process.argv.find(a => a.startsWith(`--${k}=`))?.split('=').slice(1).join('=') ?? d;
export const flag = k => process.argv.includes(`--${k}`);

/**
 * 致命错误:**账户级/凭据级问题,重试一万次也不会好**。
 *
 * ⚠️ 由来(2026-08-09):本机没有 OPENAI_API_KEY 时跑 generate-content,
 *    `requireKeys` 抛出的错被上层当成"这一词生成失败"接住,
 *    重试三次后记进 failed.json,最后报「通过 0 · 失败 2」——
 *    **把"没有密钥"报成了"内容三次没过闸"**。
 *    真放量 3812 词的话,会烧完整个列表然后告诉你"闸门拒绝率 100%"。
 *    与烧音频那边的 credit_balance_exhausted 是同一类:
 *    **账户级错误必须立刻中止整轮,不能退化成逐条失败。**
 */
export class FatalLlmError extends Error {}

const FATAL_PATTERNS = [
  '缺少环境变量',                       // 本地没配 key
  'invalid_api_key', 'Incorrect API key',
  'insufficient_quota', 'credit_balance_exhausted', 'billing_hard_limit_reached',
  'account_deactivated',
];

/** 调模型,强制 JSON schema 输出。限流/5xx 指数退避,最多 5 次。 */
export async function callJson({ system, user, schemaName, schema, model = 'gpt-4o-mini', temperature = 0.7 }) {
  try {
    requireKeys(ENV, ['OPENAI_API_KEY']);
  } catch (e) {
    throw new FatalLlmError(e.message);   // ← 不是"这一词失败",是整轮没法跑
  }
  const body = {
    model, temperature,
    messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
    response_format: { type: 'json_schema', json_schema: { name: schemaName, strict: true, schema } },
  };
  for (let backoff = 0; backoff < 5; backoff++) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ENV.OPENAI_API_KEY}` },
      body: JSON.stringify(body),
    });
    if (res.status === 429 || res.status >= 500) {
      const wait = 2000 * 2 ** backoff;
      process.stdout.write(`  · HTTP ${res.status},${wait}ms 后重试\n`);
      await new Promise(r => setTimeout(r, wait));
      continue;
    }
    if (!res.ok) {
      const body = (await res.text()).slice(0, 300);
      /* 401/403 或体里带账户级关键词 → 致命,立即中止,别一条条重试到天亮 */
      if (res.status === 401 || res.status === 403 || FATAL_PATTERNS.some(p => body.includes(p))) {
        throw new FatalLlmError(`OpenAI HTTP ${res.status}(账户/凭据级,已中止): ${body}`);
      }
      throw new Error(`OpenAI HTTP ${res.status}: ${body}`);
    }
    return JSON.parse((await res.json()).choices[0].message.content);
  }
  throw new Error('OpenAI 连续限流,放弃');
}

/** 固定并发的任务池。worker(item, index) 抛错由调用方在 worker 内自行接住。 */
export async function pool(items, concurrency, worker) {
  let next = 0;
  const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (true) {
      const i = next++;
      if (i >= items.length) return;
      await worker(items[i], i);
    }
  });
  await Promise.all(runners);
}

/**
 * 带闸门的重试:失败原因**回喂**给模型,不做无信息的盲重试。
 * (A 段实测:回喂后二次通过率远高于原样重问。)
 * @param gate 返回 string[] 失败说明;空数组=通过
 */
export async function generateWithGates({ build, gate, attempts = 3, label }) {
  let notes = null;
  for (let a = 1; a <= attempts; a++) {
    let payload;
    try { payload = await build(notes); }
    catch (e) { notes = [`上次调用出错:${e.message}`]; continue; }
    const fails = gate(payload);
    if (!fails.length) return { ok: true, payload, attempts: a };
    notes = fails;
    if (a === attempts) return { ok: false, fails, label };
  }
  return { ok: false, fails: ['未知'], label };
}

/** JSON 缓存读写(断点续跑的载体)。 */
export function loadCache(file) {
  mkdirSync(GEN, { recursive: true });
  const p = path.join(GEN, file);
  return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : {};
}
export function saveCache(file, obj) {
  mkdirSync(GEN, { recursive: true });
  writeFileSync(path.join(GEN, file), JSON.stringify(obj, null, 2), 'utf8');
}

/** A 段成品(4471 词的释义 + 例句)是 B/C/D/F/G 的输入池。 */
export function loadWordPool(bank = 'toefl') {
  const p = path.join(GEN, `${bank}-content.json`);
  if (!existsSync(p)) throw new Error(`找不到 ${p} —— B/C/D/F/G 都以 A 段成品为输入`);
  return Object.values(JSON.parse(readFileSync(p, 'utf8')));
}

export const esc = s => String(s ?? '').replace(/'/g, "''");
export const q = s => (s === null || s === undefined || s === '') ? 'NULL' : `'${esc(s)}'`;
/** text[] 字面量。空数组写成 NULL —— '{}' 和 NULL 在页面上都是"没有",但 NULL 更省。 */
export const qArr = a => (!a || !a.length) ? 'NULL' : `ARRAY[${a.map(x => q(x)).join(', ')}]::text[]`;

export function writeSql(name, body) {
  mkdirSync(path.join(REPO, 'SQLAA'), { recursive: true });
  writeFileSync(path.join(REPO, 'SQLAA', name), body, 'utf8');
  const kb = (Buffer.byteLength(body, 'utf8') / 1024).toFixed(0);
  process.stdout.write(`→ SQLAA/${name}(${kb} KB)\n`);
  if (kb > 900) process.stdout.write(`  ⚠️ 超过 900 KB,Supabase 网页 SQL 编辑器可能拒绝,考虑切片\n`);
}
export function writeReview(name, body) {
  mkdirSync(path.join(REPO, 'REVIEWAA'), { recursive: true });
  writeFileSync(path.join(REPO, 'REVIEWAA', name), body, 'utf8');
  process.stdout.write(`→ REVIEWAA/${name}\n`);
}
