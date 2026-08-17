/**
 * 一次性修复:`fro` → `to and fro`(副词,来回地;往复地)。
 *
 * ── 为什么单独写一支,而不是走 generate-content.mjs ─────────────────
 * 内容 SQL 的 ① 带着 `AND w.def_zh IS NULL` 护栏 —— 那是**14,776 个词唯一的一道
 * 屏障**,挡的是流水线每次跑都可能静默盖掉人工内容、而且盖了无迹可寻。
 * Aaron 定:**不为改一个词把它做成开关**。所以这支自己出 SQL,
 * 且**全程按 id 锁定**(`WHERE id = '<uuid>'`),不走 lower(headword)、
 * 不依赖 def_zh 是否为空 —— 作用面就这一行,开关也就不需要存在。
 *
 * ⚠️ 但**内容照样过 runAllGates**。一次性 ≠ 免检。
 * ⚠️ 旧的 4 条音频(词 1 + 例句 3)全部作废 —— 它们念的是错文本
 *    ("Children often run fro their parents")。这里重烧,并在断言里
 *    显式核对**新 URL 不等于旧 URL**,防止哪一步没生效还一路绿灯。
 *
 * 用法:node scripts/vocab/fix-fro-to-and-fro.mjs [--dry-run]
 * 产出:SQLAA/vocab_fix_to_and_fro.sql(由 Aaron 执行,本脚本从不写库)
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runAllGates, ngrams } from './gates.mjs';
import { loadEnv, requireKeys } from './env.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..', '..');
const DATA = path.join(HERE, 'data');
const GEN = path.join(DATA, 'generated');
const DRY = process.argv.includes('--dry-run');

const WORD_ID = 'b6c4e0b9-d44a-45c8-af06-842ce6498d51';
const OLD_HEADWORD = 'fro';
const NEW_HEADWORD = 'to and fro';

/** 旧音频 URL —— 从库里现查,不写死。断言要拿它当"必须变掉"的对照。 */
const ENV = loadEnv(REPO, { quiet: true });
requireKeys(ENV, ['VITE_SUPABASE_URL', 'VITE_SUPABASE_PUBLISHABLE_KEY']);
const K = ENV.VITE_SUPABASE_PUBLISHABLE_KEY;
const H = { apikey: K, Authorization: `Bearer ${K}` };
const rest = async q => {
  const r = await fetch(`${ENV.VITE_SUPABASE_URL}/rest/v1/${q}`, { headers: H });
  if (!r.ok) throw new Error(`REST ${r.status}: ${(await r.text()).slice(0, 200)}`);
  return r.json();
};

const CONTENT = {
  ipa: '/ˌtuː ən ˈfroʊ/',
  def_zh: '来回地；往复地',
  def_en: 'Moving repeatedly in one direction and then back again.',
  examples: [
    {
      collocation: 'swaying to and fro', scene: 'environment',
      sentence: 'The tall branches were swaying to and fro in the evening wind.',
      translation_zh: '高高的树枝在晚风中来回摇曳。',
    },
    {
      collocation: 'paced to and fro', scene: 'daily_life',
      sentence: 'She paced to and fro outside the room while waiting for news.',
      translation_zh: '等消息的时候，她在房间外来回踱步。',
    },
    {
      collocation: 'moved to and fro', scene: 'work',
      sentence: 'Workers moved to and fro between the loading dock and the storage area.',
      translation_zh: '工人们在装卸区和仓储区之间来回走动。',
    },
  ],
};

/* ── ① 过闸 ───────────────────────────────────────────────────── */
const row = (await rest(`vocab_words?select=id,headword,pos,freq_rank,audio_url&id=eq.${WORD_ID}`))[0];
if (!row) throw new Error(`库里没有 id=${WORD_ID}`);
if (row.headword.toLowerCase() !== OLD_HEADWORD && row.headword.toLowerCase() !== NEW_HEADWORD) {
  throw new Error(`id=${WORD_ID} 的 headword 是 "${row.headword}",既不是 ${OLD_HEADWORD} 也不是 ${NEW_HEADWORD} —— 库和预期对不上,停`);
}
const oldEx = await rest(`vocab_examples?select=id,sort_order,audio_url&word_id=eq.${WORD_ID}&order=sort_order`);
console.log(`· 库内现状:headword="${row.headword}" · 例句 ${oldEx.length} 条 · 词音频 ${row.audio_url ? '有' : '无'}`);

/* g4 语料:跨所有库,但**排除这个词自己**(它旧的三条烂句子也在里面,
   拿新句子跟自己的旧句子比毫无意义,只会假报重合)。 */
const corpus = [];
for (const f of (await import('node:fs')).readdirSync(GEN)) {
  if (!f.endsWith('-content.json') || f.includes('trial') || f.includes('before-')) continue;
  const j = JSON.parse(readFileSync(path.join(GEN, f), 'utf8'));
  for (const [k, rec] of Object.entries(j)) {
    if (k === OLD_HEADWORD || k === NEW_HEADWORD) continue;
    for (const ex of rec.examples || []) corpus.push(ngrams(ex.sentence));
  }
}
const inflect = existsSync(path.join(DATA, 'cet6-inflections.json'))
  ? JSON.parse(readFileSync(path.join(DATA, 'cet6-inflections.json'), 'utf8')) : {};
const cefr = row.freq_rank <= 1500 ? 'A2' : row.freq_rank <= 4000 ? 'B1' : row.freq_rank <= 10000 ? 'B2' : 'C1';
const fails = runAllGates({ ...row, headword: NEW_HEADWORD, cefr }, CONTENT, corpus, inflect, { useTierLength: true });
if (fails.length) {
  console.error(`x 内容没过闸(${cefr}),不出 SQL:`);
  for (const f of fails) console.error('   ' + f);
  process.exit(1);
}
console.log(`✓ 内容过闸(${cefr},${corpus.length} 句语料比对)`);

/* ── ② 重烧音频 ───────────────────────────────────────────────── */
const FATAL = ['credit_balance_exhausted', 'insufficient_quota', 'billing_hard_limit_reached'];
async function synth(text) {
  const res = await fetch(`${ENV.VITE_SUPABASE_URL}/functions/v1/tts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: K, Authorization: `Bearer ${K}` },
    body: JSON.stringify({ text, voiceId: 'alloy', speed: 1, accent: '', format: 'url' }),
  });
  const body = await res.text();
  if (FATAL.some(p => body.includes(p))) throw new Error(`TTS 账户不可用,已中止:${body.slice(0, 200)}`);
  if (!res.ok) throw new Error(`tts HTTP ${res.status}: ${body.slice(0, 200)}`);
  const d = JSON.parse(body);
  if (!d?.audioUrl) throw new Error(`没返回 audioUrl:${body.slice(0, 200)}`);
  return d.audioUrl;
}

if (DRY) { console.log('· --dry-run:不烧音频、不出 SQL'); process.exit(0); }

const wordAudio = await synth(NEW_HEADWORD);
console.log(`  词   ${wordAudio}`);
for (const ex of CONTENT.examples) {
  ex.audio_url = await synth(ex.sentence);
  console.log(`  例句 ${ex.audio_url}`);
}

/* 新旧必须不同 —— 相同就说明念的还是旧文本(内容寻址,文本一样才会同名)。 */
const oldUrls = new Set([row.audio_url, ...oldEx.map(e => e.audio_url)].filter(Boolean));
const newUrls = [wordAudio, ...CONTENT.examples.map(e => e.audio_url)];
const reused = newUrls.filter(u => oldUrls.has(u));
if (reused.length) throw new Error(`新音频里有 ${reused.length} 条和旧的同名 —— 文本没换成功`);
const CDN = /^https:\/\/audio\.bigmooneducation\.com\/[0-9a-f]{2}\/[0-9a-f]{64}\.mp3$/;
if (newUrls.some(u => !CDN.test(u))) throw new Error('新音频 URL 形态不合法');

/* ── ③ 出 SQL(全程按 id 锁定) ────────────────────────────────── */
const esc = s => String(s).replace(/'/g, "''");
const q = s => `'${esc(s)}'`;
const sql = `-- 一次性修复:${OLD_HEADWORD} → ${NEW_HEADWORD}(副词,来回地;往复地)
-- 生成: node scripts/vocab/fix-fro-to-and-fro.mjs
-- ⚠️ 由 Aaron 执行。脚本本身从不写库。
--
-- 病因:词表里混进了**不能独立成词**的半截固定搭配。fro 只以 to and fro 出现,
--       于是它那三条例句全是病句("Children often run fro their parents"),
--       释义也错("向后;反方向" → 实际是"来回地"),而且**九道闸门全过、音频都烧了**。
--       def_zh IS NULL 那类检查抓不到它 —— 它不是生成失败,是侥幸生成成功。
--
-- ⚠️ 全程**按 id 锁定**(WHERE id = '${WORD_ID}'):
--    · 不走 lower(headword) —— 那样得先假定库里叫什么,改名前后还不一样;
--    · 不加 def_zh IS NULL —— 这一行本来就有释义,加了等于自己把自己挡掉;
--    · 但也因此**不开任何通用覆盖通道**:内容 SQL 里 def_zh IS NULL 那道护栏
--      原样保留。作用面就这一行、这一次。
--
-- ⚠️ 旧音频 4 条(词 1 + 例句 3)**全部作废**:它们念的是错文本。已重烧,
--    下面断言里显式核对"新 URL ≠ 旧 URL"。

BEGIN;

SELECT 'BEFORE' AS stage, headword, def_zh, ipa, audio_url
  FROM vocab_words WHERE id = '${WORD_ID}'::uuid;

-- ① 改名 + 释义 + 音标 + 词音频(一条 UPDATE,按 id)
UPDATE vocab_words
   SET headword   = ${q(NEW_HEADWORD)},
       pos        = 'adv.',
       ipa        = ${q(CONTENT.ipa)},
       def_zh     = ${q(CONTENT.def_zh)},
       def_en     = ${q(CONTENT.def_en)},
       audio_url  = ${q(wordAudio)},
       updated_at = now()
 WHERE id = '${WORD_ID}'::uuid;

-- ② 三条例句整体换掉(连音频)。走 ON CONFLICT 是为了**行在不在都成立**:
--    现在这三行是存在的,但用 UPDATE 的话万一哪天不在了就静默改 0 行。
INSERT INTO vocab_examples (word_id, sort_order, collocation, sentence, translation_zh, scene, audio_url)
VALUES
${CONTENT.examples.map((e, i) => `  ('${WORD_ID}'::uuid, ${i + 1}, ${q(e.collocation)}, ${q(e.sentence)}, ${q(e.translation_zh)}, ${q(e.scene)}, ${q(e.audio_url)})`).join(',\n')}
ON CONFLICT (word_id, sort_order) DO UPDATE
  SET collocation    = EXCLUDED.collocation,
      sentence       = EXCLUDED.sentence,
      translation_zh = EXCLUDED.translation_zh,
      scene          = EXCLUDED.scene,
      audio_url      = EXCLUDED.audio_url;

-- ③ 多余例句清掉(现在没有,但 sort_order >3 的残留会让"例句数=3"这条断言炸,
--    与其让 Aaron 手工排查,不如在这里按 id 收干净)
DELETE FROM vocab_examples WHERE word_id = '${WORD_ID}'::uuid AND sort_order > 3;

SELECT 'AFTER' AS stage, headword, def_zh, ipa, audio_url
  FROM vocab_words WHERE id = '${WORD_ID}'::uuid;

-- ── 断言:不过就抛异常整笔回滚 ──────────────────────────────────
DO $gate$
DECLARE
  v_head text; v_audio text; n int; n_links int;
BEGIN
  -- ⑴ 改名核对
  SELECT headword, audio_url INTO v_head, v_audio FROM vocab_words WHERE id = '${WORD_ID}'::uuid;
  IF v_head IS NULL THEN RAISE EXCEPTION 'id ${WORD_ID} 这一行不存在'; END IF;
  IF lower(v_head) <> ${q(NEW_HEADWORD)} THEN
    RAISE EXCEPTION '改名没生效:headword 现在是 "%"', v_head; END IF;

  -- ⑵ id 护栏:全库不许有第二个 ${NEW_HEADWORD}
  --    ⚠️ 改名最阴的失败方式是"库里本来就有一个同名词条",改完变成两条并存,
  --       两条都能查到、都能学,但用户看到的是哪条全看排序 —— 表面完全正常。
  SELECT count(*) INTO n FROM vocab_words WHERE lower(headword) = ${q(NEW_HEADWORD)};
  IF n <> 1 THEN RAISE EXCEPTION '全库有 % 个 "${NEW_HEADWORD}",应当正好 1 个', n; END IF;

  -- ⑶ 挂载核对(改名的全部风险在这:词还在,只是从所有词库里消失)
  SELECT count(*) INTO n_links FROM vocab_word_banks WHERE word_id = '${WORD_ID}'::uuid;
  IF n_links = 0 THEN RAISE EXCEPTION '改名后一个词库都没挂上 —— 挂载关系断了'; END IF;

  -- ⑷ 释义/音标真的写进去了
  PERFORM 1 FROM vocab_words
   WHERE id = '${WORD_ID}'::uuid AND def_zh = ${q(CONTENT.def_zh)}
     AND def_en = ${q(CONTENT.def_en)} AND ipa = ${q(CONTENT.ipa)};
  IF NOT FOUND THEN RAISE EXCEPTION '释义/音标没写进去或与给定值不一致'; END IF;

  -- ⑸ 例句正好 3 条,且内容就是本次给的三句
  SELECT count(*) INTO n FROM vocab_examples WHERE word_id = '${WORD_ID}'::uuid;
  IF n <> 3 THEN RAISE EXCEPTION '例句 % 条,应当正好 3 条', n; END IF;
  SELECT count(*) INTO n FROM vocab_examples e
    JOIN (VALUES
${CONTENT.examples.map((e, i) => `      (${i + 1}, ${q(e.sentence)})`).join(',\n')}
    ) AS v(sort_order, sentence) ON v.sort_order = e.sort_order AND v.sentence = e.sentence
   WHERE e.word_id = '${WORD_ID}'::uuid;
  IF n <> 3 THEN RAISE EXCEPTION '只有 % 条例句是本次给的句子,旧病句没换干净', n; END IF;

  -- ⑹ scene 合法
  SELECT count(*) INTO n FROM vocab_examples
   WHERE word_id = '${WORD_ID}'::uuid
     AND (scene IS NULL OR scene NOT IN ('academic','news','daily_life','work','science_tech','health','environment','education','travel','culture'));
  IF n > 0 THEN RAISE EXCEPTION '有 % 条例句的 scene 非法', n; END IF;

  -- ⑺ 音频形态 + **新旧必须不同**(旧的念的是错文本,同名就等于没换)
  SELECT count(*) INTO n FROM (
    SELECT audio_url FROM vocab_words WHERE id = '${WORD_ID}'::uuid
    UNION ALL SELECT audio_url FROM vocab_examples WHERE word_id = '${WORD_ID}'::uuid
  ) t WHERE t.audio_url IS NULL
      OR t.audio_url !~ '^https://audio\\.bigmooneducation\\.com/[0-9a-f]{2}/[0-9a-f]{64}\\.mp3$';
  IF n > 0 THEN RAISE EXCEPTION '有 % 条音频缺失或形态不合法', n; END IF;

  SELECT count(*) INTO n FROM (
    SELECT audio_url FROM vocab_words WHERE id = '${WORD_ID}'::uuid
    UNION ALL SELECT audio_url FROM vocab_examples WHERE word_id = '${WORD_ID}'::uuid
  ) t WHERE t.audio_url IN (${[...oldUrls].map(q).join(', ')});
  IF n > 0 THEN RAISE EXCEPTION '有 % 条音频还是旧文件 —— 念的是错文本,没换成功', n; END IF;

  RAISE NOTICE '${OLD_HEADWORD} → ${NEW_HEADWORD} 全部核对通过:仍挂在 % 个词库上,3 条例句 + 4 条新音频', n_links;
END
$gate$;

COMMIT;
`;

mkdirSync(path.join(REPO, 'SQLAA'), { recursive: true });
writeFileSync(path.join(REPO, 'SQLAA', 'vocab_fix_to_and_fro.sql'), sql, 'utf8');
console.log('· SQL → SQLAA/vocab_fix_to_and_fro.sql');

/* 本地内容 JSON 也要跟着改 —— 不然 regress-gates 会永远拿那三条病句当"已验收内容"重放,
   而且下次 --delta 合并语料时还会把病句喂进 g4 的比对面。 */
const cp = path.join(GEN, 'cet6-content.json');
const j = JSON.parse(readFileSync(cp, 'utf8'));
delete j[OLD_HEADWORD];
j[NEW_HEADWORD] = {
  word_id: WORD_ID, headword: NEW_HEADWORD, pos: 'adv.', freq_rank: row.freq_rank, cefr,
  ...CONTENT, audio_url: wordAudio,
  _manual: true,
  _why: '词表混进半截固定搭配:fro 只以 to and fro 出现,原三条例句全是病句且已入库。按 id 一次性修复,不开通用覆盖通道。',
};
writeFileSync(cp, JSON.stringify(j, null, 2), 'utf8');
console.log('· 本地 cet6-content.json 已同步(删 fro,加 to and fro)');
