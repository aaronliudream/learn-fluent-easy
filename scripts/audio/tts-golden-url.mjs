#!/usr/bin/env node
/**
 * tts edge function —— URL 构造黄金测试
 *
 * 为什么要有它：`supabase/functions/tts/index.ts` 生成的音频 URL 是内容寻址的，
 * 任何一处改动（哈希输入、路径分片、CDN 域拼接）都会让已生成的几千个对象**全部失联**。
 * 这个测试用线上真实存在、且在音频审计里逐条 HTTP 校验过的 439 条 URL 当基准，
 * 断言**完整 URL 字符串**（含域名与裸 path）逐字相等——不是只比 hash。
 *
 * 怎么保证测的是"真代码"而不是复刻品：
 *   本脚本不重写任何算法，而是从 index.ts 里**按锚点原样抠出**下列片段，
 *   拼成一个临时 TS 模块交给 Node 原生类型擦除执行：
 *     OPENAI_VOICES / ELEVENLABS_VOICE_MAP / isMainlandChina / sha256Hex /
 *     SUPABASE_URL / BUCKET / AUDIO_CDN_BASE / storageUrlFor / publicUrlFor /
 *     以及 serve() 里从 `const requestedVoice` 到 `const cdnUrl = publicUrlFor(path)` 的整段。
 *   任何一处锚点找不到，直接判失败——源码结构变了就该有人来看一眼。
 *
 * 用法：
 *   node scripts/audio/tts-golden-url.mjs
 *   AUDIO_CDN_BASE=https://audio.bigmooneducation.com node scripts/audio/tts-golden-url.mjs
 * 退出码：0 = 全绿；1 = 有不等或抽取失败。
 *
 * 注：AUDIO_CDN_BASE 不是密钥，它就是每条音频 URL 里公开可见的域名；
 *     线上该值配在 Supabase secrets 里，此处默认值与线上一致。
 */
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '../..');
const SRC = join(REPO, 'supabase/functions/tts/index.ts');
const FIXTURE = join(HERE, 'fixtures/tts-golden-439.json');

const ENV = {
  SUPABASE_URL: process.env.GOLDEN_SUPABASE_URL || 'https://degqpiiddkxcuzwombwp.supabase.co',
  AUDIO_CDN_BASE: process.env.AUDIO_CDN_BASE || 'https://audio.bigmooneducation.com',
  SUPABASE_SERVICE_ROLE_KEY: 'test-not-used',
};

const src = readFileSync(SRC, 'utf8').replace(/\r\n/g, '\n');

/** 从源码里按"起始行前缀 → 终止行"原样抠出一段，抠不到就抛错。 */
function block(startsWith, endLine) {
  const lines = src.split('\n');
  const i = lines.findIndex((l) => l.startsWith(startsWith));
  if (i < 0) throw new Error(`抽取失败：找不到起始锚点 ${JSON.stringify(startsWith)}`);
  if (endLine === null) return lines[i];
  for (let j = i + 1; j < lines.length; j++) {
    if (lines[j] === endLine) return lines.slice(i, j + 1).join('\n');
  }
  throw new Error(`抽取失败：${JSON.stringify(startsWith)} 之后找不到终止行 ${JSON.stringify(endLine)}`);
}

/** 抠 serve() 内部从 A 行到 B 行（含）的整段，保持缩进与内容原样。 */
function region(startsWith, endsWith) {
  const lines = src.split('\n');
  const i = lines.findIndex((l) => l.trimStart().startsWith(startsWith));
  if (i < 0) throw new Error(`抽取失败：找不到区间起点 ${JSON.stringify(startsWith)}`);
  const j = lines.findIndex((l, k) => k > i && l.trimStart().startsWith(endsWith));
  if (j < 0) throw new Error(`抽取失败：找不到区间终点 ${JSON.stringify(endsWith)}`);
  return lines.slice(i, j + 1).join('\n');
}

const parts = {
  openaiVoices: block('const OPENAI_VOICES = ', null),
  elevenMap: block('const ELEVENLABS_VOICE_MAP: Record<string, string> = {', '};'),
  isMainland: block('function isMainlandChina(req: Request): boolean {', '}'),
  sha256: block('async function sha256Hex(s: string): Promise<string> {', '}'),
  supabaseUrl: block('const SUPABASE_URL = ', null),
  bucket: block('const BUCKET = ', null),
  cdnBase: block('const AUDIO_CDN_BASE = ', null),
  storageUrlFor: block('function storageUrlFor(path: string): string {', '}'),
  publicUrlFor: block('function publicUrlFor(path: string): string {', '}'),
  keyRegion: region('const requestedVoice =', 'const cdnUrl = publicUrlFor(path);'),
};

const module_ = `// AUTO-GENERATED —— 全部片段逐字抠自 supabase/functions/tts/index.ts，勿手改。
const __ENV: Record<string, string> = ${JSON.stringify(ENV)};
const Deno = { env: { get: (k: string) => __ENV[k] } };

${parts.openaiVoices}
${parts.elevenMap}
${parts.isMainland}
${parts.sha256}
${parts.supabaseUrl}
${parts.bucket}
${parts.cdnBase}
${parts.storageUrlFor}
${parts.publicUrlFor}

export async function buildUrl(
  body: { text: string; voiceId?: string; speed?: number; accent?: string },
  req: Request,
) {
  const { text, voiceId, speed, accent } = body;
${parts.keyRegion}
  return { cdnUrl, keyInput, hash, path };
}
`;

const dir = mkdtempSync(join(tmpdir(), 'tts-golden-'));
const modPath = join(dir, 'extracted.ts');
writeFileSync(modPath, module_, 'utf8');

const { buildUrl } = await import(pathToFileURL(modPath).href);

// 非中国大陆请求：与绝大多数用户、以及当初生成这 439 条音频时的环境一致
const req = new Request('https://example.test/', { headers: { 'accept-language': 'en-US' } });

const fx = JSON.parse(readFileSync(FIXTURE, 'utf8'));
let pass = 0;
const fails = [];
for (const c of fx.cases) {
  const { cdnUrl } = await buildUrl({ text: c.text, voiceId: c.voiceId, speed: c.speed, accent: c.accent }, req);
  if (cdnUrl === c.expectedUrl) pass++;
  else fails.push({ text: c.text, grade: c.grade, speed: c.speed, expected: c.expectedUrl, got: cdnUrl });
}

console.log(`fixture: ${FIXTURE.replace(REPO + '\\', '').replace(/\\/g, '/')}`);
console.log(`来源: ${fx._meta.source}`);
console.log(`AUDIO_CDN_BASE = ${ENV.AUDIO_CDN_BASE}`);
console.log(`\n完整 URL 字符串逐字比对：${pass}/${fx.cases.length} 相等`);
if (fails.length) {
  console.log(`\n❌ 不相等 ${fails.length} 条（最多列 10 条）：`);
  for (const f of fails.slice(0, 10)) {
    console.log(`  "${f.text}" G${f.grade} @${f.speed}\n    期望 ${f.expected}\n    实得 ${f.got}`);
  }
  console.log('\n结论：URL 构造与线上不一致，禁止 deploy。');
  process.exit(1);
}
console.log('✅ 439/439 全绿：仓库代码构造出的 URL 与线上真实对象逐字相同。');
