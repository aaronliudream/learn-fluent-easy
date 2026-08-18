/**
 * 给教材缺口这一批烧音频 —— **按文本烧**,不按库里的行。
 *
 * ⚠️ 为什么不用 generate-audio.mjs:那支是按**库里已存在的行**找活干的
 *    (def_zh 非空 且 audio_url 为空)。这 981 个词和 2,943 条例句**库里还不存在** ——
 *    Aaron 还没跑建词条/内容 SQL。所以这里按文本烧,URL 落进缓存,
 *    最后用 headword / (headword, sort_order) 当键出回填 SQL。
 *
 * ⚠️ 合成参数必须与全库定版一致:openai | alloy | speed 1 | accent 空。
 *    差一个字符,存储键(内容哈希)就变,前端 predictCdnUrl 会指向另一个文件。
 *    这组参数是拿库里现存音频的文件名反解证实的,不是猜的。
 *
 * ⚠️ 断点续跑:每合成一条就**原子写**缓存(先写 .tmp 再 rename)。
 *    这个文件会长到几百 KB,而任务被杀过多次 —— 杀在写中途留下的就是截断的 JSON,
 *    下次 JSON.parse 直接抛,几千条进度全丢。
 *
 * 用法:node scripts/vocab/burn-textbook-audio.mjs [--concurrency=14] [--emit-sql] [--shards=N]
 */
import { readFileSync, writeFileSync, existsSync, renameSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv, requireKeys } from './env.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..', '..');
const GEN = path.join(HERE, 'data', 'generated');
const arg = (k, d) => process.argv.find(a => a.startsWith(`--${k}=`))?.split('=').slice(1).join('=') ?? d;
const CONCURRENCY = Math.max(1, Number(arg('concurrency', '14')) || 1);
const THROTTLE = Number(arg('throttle', '150'));
const SHARDS = Math.max(1, Number(arg('shards', '1')) || 1);
const EMIT_ONLY = process.argv.includes('--emit-sql');

const ENV = loadEnv(REPO, { quiet: true });
requireKeys(ENV, ['VITE_SUPABASE_URL', 'VITE_SUPABASE_PUBLISHABLE_KEY']);
const K = ENV.VITE_SUPABASE_PUBLISHABLE_KEY;

const content = JSON.parse(readFileSync(path.join(GEN, 'textbook-content.json'), 'utf8'));
const CACHE = path.join(GEN, 'textbook-audio.json');
const cache = existsSync(CACHE) ? JSON.parse(readFileSync(CACHE, 'utf8')) : { words: {}, examples: {} };
const tmp = CACHE + '.tmp';
const save = () => { writeFileSync(tmp, JSON.stringify(cache, null, 2), 'utf8'); renameSync(tmp, CACHE); };

const FATAL = ['credit_balance_exhausted', 'insufficient_quota', 'billing_hard_limit_reached'];
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function synth(text) {
  for (let b = 0; b < 5; b++) {
    const res = await fetch(`${ENV.VITE_SUPABASE_URL}/functions/v1/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: K, Authorization: `Bearer ${K}` },
      body: JSON.stringify({ text, voiceId: 'alloy', speed: 1, accent: '', format: 'url' }),
    });
    const body = await res.text();
    /* ⚠️ 余额耗尽回的是 429、edge 包成 502,和真限流长得一模一样,
       只有**响应体**里写着 insufficient_quota。不看体就退避重试的话,
       几千条能空跑一整夜,日志里全是"限流,重试中"。 */
    if (FATAL.some(p => body.includes(p))) {
      const e = new Error(`TTS 账户不可用,已中止整轮。去 https://platform.openai.com/settings/organization/billing/ 充值。\n   原文:${body.slice(0, 240)}`);
      e.fatal = true; throw e;
    }
    if (res.status === 429 || res.status >= 500) { await sleep(2000 * 2 ** b); continue; }
    if (!res.ok) throw new Error(`tts HTTP ${res.status}: ${body.slice(0, 160)}`);
    const d = JSON.parse(body);
    if (!d?.audioUrl) throw new Error(`没返回 audioUrl:${body.slice(0, 160)}`);
    return d.audioUrl;
  }
  throw new Error('连续限流,放弃');
}

const CDN = /^https:\/\/audio\.bigmooneducation\.com\/[0-9a-f]{2}\/[0-9a-f]{64}\.mp3$/;

function emit() {
  const wordRows = Object.entries(cache.words);
  const exRows = Object.entries(cache.examples).map(([k, v]) => {
    const i = k.lastIndexOf('#');
    return { headword: k.slice(0, i), sort: Number(k.slice(i + 1)), url: v };
  });
  const bad = [...wordRows.map(([, u]) => u), ...exRows.map(r => r.url)].filter(u => !CDN.test(u));
  if (bad.length) { console.error(`x ${bad.length} 条 URL 形态不合法,不出 SQL`); process.exit(1); }
  const esc = s => String(s).replace(/'/g, "''");
  const q = s => `'${esc(s)}'`;
  const per = { w: Math.ceil(wordRows.length / SHARDS), e: Math.ceil(exRows.length / SHARDS) };
  for (let i = 0; i < SHARDS; i++) {
    const w = wordRows.slice(i * per.w, (i + 1) * per.w);
    const e = exRows.slice(i * per.e, (i + 1) * per.e);
    if (!w.length && !e.length) continue;
    const sql = `-- 教材批音频回填【第 ${i + 1}/${SHARDS} 片】:${w.length} 词 + ${e.length} 例句
-- 生成: node scripts/vocab/burn-textbook-audio.mjs --emit-sql --shards=${SHARDS}
-- 合成参数: openai | alloy | speed 1 | accent 空(与全库定版同参,前端点播不会再现合成)
-- ⚠️ 由 Aaron 执行。脚本本身从不写库。
--
-- ⚠️ **顺序是硬的**:建词条 SQL → 内容 SQL → 本份。
--    本份按 lower(headword) / (headword, sort_order) 定位 —— 词和例句都得先存在。
-- ⚠️ audio_url 一律取 tts edge 实际返回值,不是本地猜的 hash
--    (edge 会按地区选 provider,provider 进哈希,自己猜必错)。

BEGIN;

CREATE TEMP TABLE _aw(headword text PRIMARY KEY, url text) ON COMMIT DROP;
CREATE TEMP TABLE _ae(headword text, sort_order int, url text, PRIMARY KEY (headword, sort_order)) ON COMMIT DROP;
${w.length ? `INSERT INTO _aw(headword, url) VALUES\n${w.map(([h, u]) => `  (${q(h)}, ${q(u)})`).join(',\n')};\n` : ''}${e.length ? `INSERT INTO _ae(headword, sort_order, url) VALUES\n${e.map(r => `  (${q(r.headword)}, ${r.sort}, ${q(r.url)})`).join(',\n')};\n` : ''}
UPDATE vocab_words w SET audio_url = a.url
  FROM _aw a WHERE lower(w.headword) = a.headword;

UPDATE vocab_examples e SET audio_url = a.url
  FROM _ae a JOIN vocab_words w ON lower(w.headword) = a.headword
 WHERE e.word_id = w.id AND e.sort_order = a.sort_order;

DO $gate$
DECLARE v_n int;
BEGIN
  -- ⑴ 词:本片每条都写进去了,且值一致
  SELECT count(*) INTO v_n FROM _aw a
    LEFT JOIN vocab_words w ON lower(w.headword) = a.headword
   WHERE w.id IS NULL OR w.audio_url IS DISTINCT FROM a.url;
  IF v_n <> 0 THEN RAISE EXCEPTION '本片有 % 个词的音频没写进去或不一致(词不存在也算)', v_n; END IF;

  -- ⑵ 例句:同上
  SELECT count(*) INTO v_n FROM _ae a
    LEFT JOIN vocab_words w ON lower(w.headword) = a.headword
    LEFT JOIN vocab_examples e ON e.word_id = w.id AND e.sort_order = a.sort_order
   WHERE e.id IS NULL OR e.audio_url IS DISTINCT FROM a.url;
  IF v_n <> 0 THEN RAISE EXCEPTION '本片有 % 条例句的音频没写进去或不一致', v_n; END IF;

  -- ⑶ 临时表行数与声明一致(空表会让上面两条真空通过)
  SELECT count(*) INTO v_n FROM _aw;
  IF v_n <> ${w.length} THEN RAISE EXCEPTION '词应有 ${w.length} 行,实际 %', v_n; END IF;
  SELECT count(*) INTO v_n FROM _ae;
  IF v_n <> ${e.length} THEN RAISE EXCEPTION '例句应有 ${e.length} 行,实际 %', v_n; END IF;

  -- ⑷ 形态:全部是 CDN 内容寻址路径
  SELECT count(*) INTO v_n FROM (SELECT url FROM _aw UNION ALL SELECT url FROM _ae) t
   WHERE t.url !~ '^https://audio\\.bigmooneducation\\.com/[0-9a-f]{2}/[0-9a-f]{64}\\.mp3$';
  IF v_n <> 0 THEN RAISE EXCEPTION '本片 % 条 URL 形态不合法', v_n; END IF;

  RAISE NOTICE '本片回填 % 词 + % 例句', ${w.length}, ${e.length};
END
$gate$;

COMMIT;
`;
    const name = `vocab_textbook_audio_part${i + 1}of${SHARDS}.sql`;
    mkdirSync(path.join(REPO, 'SQLAA'), { recursive: true });
    writeFileSync(path.join(REPO, 'SQLAA', name), sql, 'utf8');
    console.log(`· 音频回填 SQL(${w.length} 词 + ${e.length} 例句) → SQLAA/${name}`);
  }
}

if (EMIT_ONLY) { emit(); process.exit(0); }

const jobs = [];
for (const w of Object.values(content)) {
  const h = w.headword.toLowerCase();
  if (!cache.words[h]) jobs.push({ kind: 'w', key: h, text: w.headword });
  w.examples.forEach((e, i) => {
    const k = `${h}#${i + 1}`;
    if (!cache.examples[k]) jobs.push({ kind: 'e', key: k, text: e.sentence });
  });
}
console.log(`· 待烧 ${jobs.length} 条(已缓存 词 ${Object.keys(cache.words).length} · 例句 ${Object.keys(cache.examples).length})`);

let done = 0; let fatal = null;
const total = jobs.length;
await Promise.all(Array.from({ length: Math.min(CONCURRENCY, jobs.length) }, async () => {
  while (jobs.length && !fatal) {
    const j = jobs.shift();
    try {
      const url = await synth(j.text);
      if (j.kind === 'w') cache.words[j.key] = url; else cache.examples[j.key] = url;
      done++;
      if (done % 100 === 0 || done === total) console.log(`  ✓ [${done}/${total}] ${j.text.slice(0, 42)}`);
    } catch (err) {
      /* ⚠️ 账户级错误不能吞:吞了会带着"每条都失败"把整批跑完。
         并发下必须让**所有** worker 都停,只 throw 自己那条没用。 */
      if (err.fatal) { fatal = err; save(); break; }
      console.log(`  ✗ ${j.text.slice(0, 34)}: ${err.message.slice(0, 80)}`);
    }
    save();
    await sleep(THROTTLE);
  }
}));
if (fatal) { console.error(`\n✗✗ ${fatal.message}`); process.exit(1); }
console.log(`\n· 完成 ${done}/${total}`);
emit();
