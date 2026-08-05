/**
 * 词汇内容生成 pipeline —— **词库无关(bank-agnostic)**
 *
 * 输入是 vocab_words 里 def_zh 为空的词,不关心这词属于哪个库;
 * --bank 只用来圈定本批范围(不传就是全库所有缺内容的词)。
 * 例句难度按**词自身的 freq_rank 层级**定,同样不看词库 —— 一个高频词
 * 不会因为挂在托福库下就配 C1 句子。
 *
 * 每词一次 gpt-4o-mini 调用,输出:
 *   { ipa, def_zh, def_en, examples: [3 × { collocation, scene, sentence, translation_zh }] }
 *
 * 九道机器闸门在 ./gates.mjs(独立模块,可离线单测:node scripts/vocab/test-gates.mjs)
 *   g1 目标词存在(认屈折形+派生形)  g2 长度 8-16   g3 em-dash
 *   g4 全局 4-gram 去重 >50% 拒       g5 三句 scene/collocation 互斥
 *   g6 同词三句两两 4-gram 重合 >30% 拒
 *   g7 collocation 必须含目标词(拦同义词冒充搭配)
 *   g8 中文译文标点全角          g9 三句首词互异
 *
 * def_zh 的义项规则在 ./prompt-rules.mjs(与 repair-defzh.mjs 共用,避免两份漂移)。
 * 任一失败 → 整词重生成,最多 3 次;仍失败记入 data/failed.json。
 * 重试时把**具体失败原因回喂给模型**,不做无信息的盲重试。
 *
 * 断点续跑:
 *   · 待办清单来自 DB(def_zh IS NULL),SQL 跑过一批,下次自然就不再出现
 *   · 本地 data/generated/<bank>-content.json 也会跳过(SQL 还没跑时重跑不浪费 token)
 *   · g4 的全局语料从这个 JSON 载入 → 跨批次去重真的是全局的
 *
 * 用法:
 *   node scripts/vocab/generate-content.mjs --bank=toefl --limit=200
 *   node scripts/vocab/generate-content.mjs --bank=toefl --limit=5 --dry-run   # 不调 API,打印将要处理的词
 *   node scripts/vocab/generate-content.mjs --bank=toefl --emit-sql            # 只从已有 JSON 出 SQL,不调 API
 *
 * 环境:OPENAI_API_KEY(进程环境变量,或 .env.local / .env)
 *
 * ⚠️ 本脚本只读库 + 产出文件,绝不写库。SQL 一律交 Aaron 跑。
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SCENES, runAllGates, ngrams, LENGTH_BY_TIER } from './gates.mjs';
import { loadEnv, requireKeys } from './env.mjs';
import { DEF_ZH_RULE, FUNCTION_WORD_RULE, isFunctionWord } from './prompt-rules.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..', '..');
const DATA = path.join(HERE, 'data');
const GEN = path.join(DATA, 'generated');

const arg = (k, d) => process.argv.find(a => a.startsWith(`--${k}=`))?.split('=').slice(1).join('=') ?? d;
const BANK = arg('bank', '');
const LIMIT = Number(arg('limit', '200'));
const MODEL = arg('model', 'gpt-4o-mini');
const CONCURRENCY = Number(arg('concurrency', '4'));
const MAX_ATTEMPTS = 3;
const DRY = process.argv.includes('--dry-run');
const EMIT_ONLY = process.argv.includes('--emit-sql');
/* --no-emit:只生成、只落 JSON,不出 SQL 也不出送审件。
 * 用于小批试跑(先让 Aaron 看产出质量,确认 prompt 合格再放全量)。
 * ⚠️ 试跑的词照样进 data/generated/<bank>-content.json,
 *    全量跑时 pending 过滤会跳过它们**不重复烧 token**,
 *    但 emit() 是把整个 JSON 全量输出的,所以这几个词照常出现在最终 SQL 里,不会漏。 */
const NO_EMIT = process.argv.includes('--no-emit');

/* ── env ── */
const ENV = loadEnv(REPO);
requireKeys(ENV, ['VITE_SUPABASE_URL', 'VITE_SUPABASE_PUBLISHABLE_KEY']);
const SUPA_URL = ENV.VITE_SUPABASE_URL;
const ANON = ENV.VITE_SUPABASE_PUBLISHABLE_KEY;

/* ── 只读 DB(anon key) ──
 * ⚠️ PostgREST 单次最多 1000 行,一律翻页,别裸查。 */
async function rest(pathname, params) {
  const url = new URL(`${SUPA_URL}/rest/v1/${pathname}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url, { headers: { apikey: ANON, Authorization: `Bearer ${ANON}` } });
  if (!res.ok) throw new Error(`REST ${pathname} HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

async function restPaged(pathname, params, page = 1000) {
  const out = [];
  for (let offset = 0; ; offset += page) {
    const chunk = await rest(pathname, { ...params, offset: String(offset), limit: String(page) });
    out.push(...chunk);
    if (chunk.length < page) return out;
  }
}

/** 试跑用:直接从 CSV 取词,不查库。
 *  用途是**放量全库前先验难度档产出质量** —— B2/C1 的词还没灌进 DB,
 *  查库拿不到,但 prompt 质量必须在灌库前就验过。
 *  用法: --from-csv --tier=B2 --limit=10   (配 --no-emit,只看不出 SQL)
 *  ⚠️ 这条路径拿不到 word_id,所以只能配 --no-emit,不产 SQL。 */
function fetchFromCsv(tier, limit) {
  const csv = path.join(DATA, `${BANK || 'toefl'}.csv`);
  if (!existsSync(csv)) throw new Error(`找不到 ${csv},先跑 ingest-toefl.mjs`);
  const rows = readFileSync(csv, 'utf8').trim().split(/\r?\n/).slice(1).map(l => {
    const [headword, pos, freq_rank] = l.split(',');
    return { id: null, headword, pos, freq_rank: freq_rank ? Number(freq_rank) : null };
  });
  // tier='all' 专供放量:不按难度档筛,全池都要,按 freq_rank 顺序取
  const picked = tier === "all"
    ? rows
    : rows.filter(r => r.freq_rank && cefrFor(r.freq_rank).level === tier);
  if (tier === "all") return picked.slice(0, limit);
  // 均匀铺开取样,别全挤在该档最前面(那样只看得到该档最简单的词)
  const step = Math.max(1, Math.floor(picked.length / limit));
  const out = [];
  for (let i = 0; i < picked.length && out.length < limit; i += step) out.push(picked[i]);
  return out;
}

/** 待办词:def_zh 为空;--bank 只圈范围,不进入生成逻辑。 */
async function fetchPending() {
  let idFilter = null;
  if (BANK) {
    const banks = await rest('vocab_banks', { select: 'id,code', code: `eq.${BANK}` });
    if (!banks.length) throw new Error(`vocab_banks 里没有 code='${BANK}'`);
    const links = await restPaged('vocab_word_banks', { select: 'word_id', bank_id: `eq.${banks[0].id}` });
    idFilter = links.map(l => l.word_id);
    if (!idFilter.length) return [];
  }

  const rows = [];
  if (idFilter) {
    // id IN (...) 分片,避免 URL 过长
    for (let i = 0; i < idFilter.length; i += 100) {
      const slice = idFilter.slice(i, i + 100);
      rows.push(...await rest('vocab_words', {
        select: 'id,headword,pos,freq_rank,def_zh',
        id: `in.(${slice.join(',')})`,
        def_zh: 'is.null',
        order: 'freq_rank.asc.nullslast',
      }));
    }
  } else {
    rows.push(...await restPaged('vocab_words', {
      select: 'id,headword,pos,freq_rank,def_zh',
      def_zh: 'is.null',
      order: 'freq_rank.asc.nullslast',
    }));
  }
  rows.sort((a, b) => (a.freq_rank ?? 1e9) - (b.freq_rank ?? 1e9) || a.headword.localeCompare(b.headword));
  return rows;
}

/* ── 难度分层:按词自身频率,与词库无关 ──
 * ⚠️ 阈值按**方案 D 词池的实际分布**重标(2026-08-03)。
 *   老阈值(2000/6000/15000)是照未过滤的 6955 词池定的,套到 D 池上严重偏斜:
 *   batch1 200 词会算出 A2 22 / B1 178 / B2 0 / C1 0 —— 首批例句几乎全是 B1。
 *   新阈值 1500/4000/10000 下,D 池 4473 词分布才拉得开。 */
function cefrFor(freqRank) {
  const r = freqRank ?? Number.MAX_SAFE_INTEGER;
  if (r <= 1500) return { level: 'A2', note: '高频常用词:句子要短、结构简单、日常语域' };
  if (r <= 4000) return { level: 'B1', note: '中频词:一般复杂度,可用从句但别套叠' };
  if (r <= 10000) return { level: 'B2', note: '偏学术词:可用较正式的措辞与抽象主语' };
  return { level: 'C1', note: '低频学术词:正式语域,允许名词化与复杂搭配' };
}

/* ── prompt ── */
const SYSTEM = `You write vocabulary study cards for Chinese learners of English.
You return ONLY valid JSON matching the provided schema. No prose, no markdown.`;

function buildPrompt(word, cefr, failureNotes) {
  const retry = failureNotes?.length
    ? `\n\nYOUR PREVIOUS ATTEMPT WAS REJECTED. Fix exactly these problems:\n${failureNotes.map(f => `- ${f}`).join('\n')}\nRegenerate all three examples.`
    : '';
  const fnRule = isFunctionWord(word.pos) ? `

${FUNCTION_WORD_RULE}` : '';
  return `Word: "${word.headword}"${word.pos ? `  (part of speech: ${word.pos})` : ''}
Frequency rank: ${word.freq_rank ?? 'unknown'} -> target sentence difficulty: ${cefr.level}. ${cefr.note}

Produce a study card with these HARD requirements:

1. ipa: American English IPA for "${word.headword}", wrapped in slashes, e.g. /ˈæb.sɪ.stəns/.
2. def_zh: 中文释义.
${DEF_ZH_RULE.split('\n').map(l => '   ' + l).join('\n')}
3. def_en: English definition, AT MOST 15 words.
   ⚠️ NEVER use "${word.headword}" (or any inflected/derived form of it) inside def_en.
   A definition that contains the word being defined teaches nothing.
   Bad:  outrageous -> "Extremely shocking or bad; outrageous behavior is unacceptable." ❌
   Good: outrageous -> "Extremely shocking, offensive, or unacceptable." ✅
4. examples: EXACTLY 3 objects. Each anchors ONE high-frequency collocation of "${word.headword}".
   - Order the three by collocation frequency: examples[0] uses the MOST frequent collocation, examples[2] the least.
   - The three collocations MUST be different from one another.
   - scene MUST be one of: ${SCENES.join(', ')}.
   - The three scenes MUST all be different from one another.
   - sentence: between ${LENGTH_BY_TIER[cefr.level]?.[0] ?? 8} and ${LENGTH_BY_TIER[cefr.level]?.[1] ?? 16} words
     (this range is set by the ${cefr.level} difficulty tier - harder words get longer,
     more complex sentences). "${word.headword}" must appear in a natural inflected
     form (plural / tense / comparative as the sentence requires) - do not force the bare form.
   - The three sentences must NOT share sentence structure: they must not all start with
     "The" or "A", and their subjects must not all be the same kind of entity
     (e.g. not all three a person, not all three an abstract noun).
   - Do NOT reuse wording across the three sentences. Each must be independently written,
     not one template with the scene word swapped.
   - The three sentences must each START WITH A DIFFERENT WORD.
   - collocation MUST contain "${word.headword}" itself (or an inflected form of it).
     A synonym is NOT a collocation: for "attorney", "lawyer" is wrong,
     "defense attorney" is right.
   - translation_zh: 该句的中文翻译, 自然流畅. 标点必须全部用全角
     (句末用 "。", 句中停顿用 "，"), 中文里绝对不要出现半角的 , . ! ? 。
     ⚠️ 忠实翻译: 不许增译(加英文里没有的内容), 也不许漏译.
     反例: EN "A packed audience attended the concert last night."
           ZH "昨晚，观众席座无虚席，演唱会非常成功。" ❌ ("演唱会非常成功" 英文里没有)
   - ⚠️ 三条例句用的必须都是 def_zh 里给出的义项, 不许跑到别的义项去.
     反例: def_zh "浪漫；爱情关系" 却造 "romance languages"(罗曼语族, 另一个义项) ❌
5. NEVER use an em-dash (—) or en-dash (–) anywhere in any field. Use commas or periods.
6. Difficulty is set by the word's own frequency (${cefr.level}), NOT by any exam.${fnRule}${retry}`;

}

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['ipa', 'def_zh', 'def_en', 'examples'],
  properties: {
    ipa: { type: 'string' },
    def_zh: { type: 'string' },
    def_en: { type: 'string' },
    examples: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['collocation', 'scene', 'sentence', 'translation_zh'],
        properties: {
          collocation: { type: 'string' },
          scene: { type: 'string', enum: SCENES },
          sentence: { type: 'string' },
          translation_zh: { type: 'string' },
        },
      },
    },
  },
};

async function callModel(word, cefr, failureNotes) {
  requireKeys(ENV, ['OPENAI_API_KEY']);
  const key = ENV.OPENAI_API_KEY;
  const body = {
    model: MODEL,
    temperature: 0.8,
    messages: [
      { role: 'system', content: SYSTEM },
      { role: 'user', content: buildPrompt(word, cefr, failureNotes) },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: { name: 'vocab_card', strict: true, schema: SCHEMA },
    },
  };
  for (let backoff = 0; backoff < 5; backoff++) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify(body),
    });
    if (res.status === 429 || res.status >= 500) {
      const wait = 2000 * 2 ** backoff;
      process.stdout.write(`  · HTTP ${res.status},${wait}ms 后重试\n`);
      await new Promise(r => setTimeout(r, wait));
      continue;
    }
    if (!res.ok) throw new Error(`OpenAI HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
    const data = await res.json();
    return JSON.parse(data.choices[0].message.content);
  }
  throw new Error('OpenAI 连续限流,放弃');
}

/* ── 主流程 ── */
async function main() {
  mkdirSync(GEN, { recursive: true });
  const FROM_CSV_EARLY = process.argv.includes('--from-csv');
  const TIER_EARLY = arg('tier', 'B2');
  /* ⚠️ 试跑必须写到**独立缓存**。共用 <bank>-content.json 的话:
   *   ① B2/C1 试跑词并不在 DB 里,却会被 emit 进 batch SQL,UPDATE 匹配不到、
   *      count-validate 直接对不上;
   *   ② 和正式跑并发时两边互相覆盖同一个文件。 */
  /* 放量通道(--allow-emit-from-csv)要与已有的 198 词合并出总 SQL,所以走**主缓存**;
   * 试跑通道仍走独立缓存。 */
  const ALLOW_EMIT_CSV_EARLY = process.argv.includes('--allow-emit-from-csv');
  const resultsPath = (FROM_CSV_EARLY && !ALLOW_EMIT_CSV_EARLY)
    ? path.join(GEN, `${BANK || 'all'}-trial-${TIER_EARLY}.json`)   // 试跑独立缓存,不污染正式数据
    : path.join(GEN, `${BANK || 'all'}-content.json`);
  const failedPath = path.join(DATA, 'failed.json');
  const inflectPath = path.join(DATA, `${BANK || 'toefl'}-inflections.json`);

  const results = existsSync(resultsPath) ? JSON.parse(readFileSync(resultsPath, 'utf8')) : {};
  const inflectTable = existsSync(inflectPath) ? JSON.parse(readFileSync(inflectPath, 'utf8')) : {};
  const failed = existsSync(failedPath) ? JSON.parse(readFileSync(failedPath, 'utf8')) : {};

  // g4 全局语料:所有历史已接受句子
  const corpus = [];
  for (const rec of Object.values(results)) {
    for (const ex of rec.examples || []) corpus.push(ngrams(ex.sentence));
  }
  process.stdout.write(`· 全局去重语料:${corpus.length} 句(来自 ${Object.keys(results).length} 个已生成词)\n`);

  if (EMIT_ONLY) {
    emit(results);
    return;
  }

  const FROM_CSV = process.argv.includes('--from-csv');
  const TIER = arg('tier', 'B2');
  /* 放量通道:--allow-emit-from-csv 显式开启后,from-csv 也可以出 SQL。
   * 之所以安全:content SQL 是按 lower(headword) 匹配的,**不需要 word_id**。
   * 前提是词本体已经在库里 —— 所以清单里把灌词 SQL 排在内容 SQL 之前。
   * 不开这个开关时仍然强制 --no-emit,防止试跑误出 SQL。 */
  const ALLOW_EMIT_CSV = process.argv.includes('--allow-emit-from-csv');
  if (FROM_CSV && !NO_EMIT && !ALLOW_EMIT_CSV) throw new Error('--from-csv 默认是试跑通道,要出 SQL 请显式加 --allow-emit-from-csv');

  const source = FROM_CSV ? fetchFromCsv(TIER, LIMIT) : await fetchPending();
  const pending = source.filter(w => !results[w.headword.toLowerCase()]).slice(0, LIMIT);
  if (FROM_CSV) process.stdout.write(`· 试跑通道:从 CSV 取 ${TIER} 档 ${pending.length} 词(不查库、不出 SQL)\n`);
  process.stdout.write(`· 待生成 ${pending.length} 词${BANK ? `(范围 --bank=${BANK})` : '(全库)'}\n`);
  if (!pending.length) { process.stdout.write('  没有待办词。若 SQL 还没跑,先跑 batch1 灌词表。\n'); emit(results); return; }

  if (DRY) {
    for (const w of pending.slice(0, 20)) {
      process.stdout.write(`  ${w.headword.padEnd(18)} rank=${String(w.freq_rank ?? '-').padStart(6)}  → ${cefrFor(w.freq_rank).level}\n`);
    }
    process.stdout.write(`  (--dry-run:未调用 API)\n`);
    return;
  }

  let ok = 0, ko = 0;
  const queue = [...pending];
  // 顺序保证 g4 语料一致性:并发内各自比对 corpus 快照 + 已完成的,收敛后统一入库
  const workers = Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
    while (queue.length) {
      const word = queue.shift();
      const cefr = cefrFor(word.freq_rank);
      let notes = null, saved = false, lastRejected = null;
      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        let payload;
        try {
          payload = await callModel(word, cefr, notes);
        } catch (e) {
          notes = [`API 错误:${e.message}`];
          process.stdout.write(`  ✗ ${word.headword} 第${attempt}次 API 失败:${e.message}\n`);
          continue;
        }
        // useTierLength:新生成走按档句长(A2 8-12 / B1 8-14 / B2 10-16 / C1 12-20)
        // ⚠️ cefr 要挂在**第一个参数**上 —— runAllGates 读的是 word.cefr,不是 payload.cefr
        const fails = runAllGates({ ...word, cefr: cefr.level }, payload, corpus, inflectTable, { useTierLength: true });
        if (!fails.length) {
          results[word.headword.toLowerCase()] = {
            word_id: word.id, headword: word.headword, pos: word.pos,
            freq_rank: word.freq_rank, cefr: cefr.level, ...payload,
            _attempts: attempt, _model: MODEL,
          };
          for (const ex of payload.examples) corpus.push(ngrams(ex.sentence));
          delete failed[word.headword.toLowerCase()];
          ok++; saved = true;
          process.stdout.write(`  ✓ ${word.headword} (${cefr.level}, 第${attempt}次)\n`);
          break;
        }
        notes = fails;
        lastRejected = payload;              // 留证:失败时能直接看模型到底写了什么
        process.stdout.write(`  ↻ ${word.headword} 第${attempt}次被闸门拦下:${fails[0]}\n`);
      }
      if (!saved) {
        // ⚠️ 一定要把被拒的原文存下来。只存原因的话,排查时还得再烧一次 API
        //    才知道模型写了啥(2026-08-03 试跑 defense 就是这么绕了一圈)。
        failed[word.headword.toLowerCase()] = {
          headword: word.headword, freq_rank: word.freq_rank,
          reasons: notes, at: 'gate', rejected_payload: lastRejected,
        };
        ko++;
        process.stdout.write(`  ✗✗ ${word.headword} 三次未过闸,记入 failed.json\n`);
      }
      writeFileSync(resultsPath, JSON.stringify(results, null, 2), 'utf8');
      writeFileSync(failedPath, JSON.stringify(failed, null, 2), 'utf8');
    }
  });
  await Promise.all(workers);

  process.stdout.write(`\n· 完成:通过 ${ok} · 失败 ${ko} · 累计已生成 ${Object.keys(results).length}\n`);
  emit(results);
}

/* ── 产出 SQL + 送审样本 ── */
function emit(results) {
  if (NO_EMIT) {
    process.stdout.write(`· --no-emit:跳过 SQL 与送审件(累计已生成 ${Object.keys(results).length} 词,全在 JSON 里)\n`);
    return;
  }
  const list = Object.values(results);
  if (!list.length) { process.stdout.write('· 无内容可出 SQL\n'); return; }
  writeSql(list);
  writeSample(list);
}

const esc = s => String(s ?? '').replace(/'/g, "''");
const q = s => (s === null || s === undefined || s === '') ? 'NULL' : `'${esc(s)}'`;

function writeSql(list) {
  const bank = BANK || 'all';
  const wordRows = list.map(w => `  (${q(w.headword.toLowerCase())}, ${q(w.ipa)}, ${q(w.def_zh)}, ${q(w.def_en)})`).join(',\n');
  const exRows = list.flatMap(w =>
    w.examples.map((ex, i) =>
      `  (${q(w.headword.toLowerCase())}, ${i + 1}, ${q(ex.collocation)}, ${q(ex.sentence)}, ${q(ex.translation_zh)}, ${q(ex.scene)})`)
  ).join(',\n');
  const exCount = list.reduce((n, w) => n + w.examples.length, 0);

  const sql = `-- 词汇内容 batch1:${list.length} 词 · ${exCount} 例句
-- 生成: node scripts/vocab/generate-content.mjs --bank=${bank} --emit-sql
-- 模型: ${list[0]._model || 'gpt-4o-mini'} · 六道机器闸门全过
-- ⚠️ 由 Aaron 执行。脚本本身从不写库。
--
-- 幂等: vocab_words 按 lower(headword) 定位更新;
--       vocab_examples 走 ON CONFLICT (word_id, sort_order)(索引 vocab_examples_word_id_sort_order_key)。
--       重复跑只会覆盖同一批内容,不产生重复行。
--
-- scene(academic/news/daily_life/... 共 10 类)既用于生成期的 g5/g6 闸门判定,
-- 也一并入库,将来可按场景筛例句。

BEGIN;

-- scene 列的安全网。2026-08-03 出这份 SQL 时已实测确认 vocab_examples.scene
-- 存在(text, nullable),所以这句就是个 no-op,留着是防回滚/换环境时缺列。
ALTER TABLE vocab_examples ADD COLUMN IF NOT EXISTS scene text;

SELECT 'BEFORE' AS stage,
       (SELECT count(*) FROM vocab_words WHERE def_zh IS NOT NULL) AS words_with_def,
       (SELECT count(*) FROM vocab_examples) AS examples;

-- ① 释义 / 音标
UPDATE vocab_words w
   SET ipa        = v.ipa,
       def_zh     = v.def_zh,
       def_en     = v.def_en,
       updated_at = now()
  FROM (VALUES
${wordRows}
  ) AS v(headword, ipa, def_zh, def_en)
 WHERE lower(w.headword) = v.headword;

-- ② 例句
INSERT INTO vocab_examples (word_id, sort_order, collocation, sentence, translation_zh, scene)
SELECT w.id, v.sort_order, v.collocation, v.sentence, v.translation_zh, v.scene
  FROM (VALUES
${exRows}
  ) AS v(headword, sort_order, collocation, sentence, translation_zh, scene)
  JOIN vocab_words w ON lower(w.headword) = v.headword
ON CONFLICT (word_id, sort_order) DO UPDATE
  SET collocation    = EXCLUDED.collocation,
      sentence       = EXCLUDED.sentence,
      translation_zh = EXCLUDED.translation_zh,
      scene          = EXCLUDED.scene;

SELECT 'AFTER' AS stage,
       (SELECT count(*) FROM vocab_words WHERE def_zh IS NOT NULL) AS words_with_def,
       (SELECT count(*) FROM vocab_examples) AS examples;

-- ── count-validate:四行都必须是 t,否则 ROLLBACK ──
SELECT 'words_with_def = ${list.length}' AS expect,
       (SELECT count(*) FROM vocab_words WHERE def_zh IS NOT NULL) = ${list.length} AS ok
UNION ALL
SELECT 'examples = ${exCount}',
       (SELECT count(*) FROM vocab_examples) = ${exCount}
UNION ALL
SELECT 'every word with a definition has exactly 3 examples',
       NOT EXISTS (
         SELECT 1
           FROM vocab_words w
          WHERE w.def_zh IS NOT NULL
            AND (SELECT count(*) FROM vocab_examples e WHERE e.word_id = w.id) <> 3
       )
UNION ALL
SELECT 'every example has a scene from the 10-value enum',
       NOT EXISTS (
         SELECT 1 FROM vocab_examples
          WHERE scene IS NULL
             OR scene NOT IN (${SCENES.map(s => `'${s}'`).join(', ')})
       );

COMMIT;
`;
  const out = path.join(REPO, 'SQLAA', `vocab_${bank}_content_batch1.sql`);
  mkdirSync(path.dirname(out), { recursive: true });
  writeFileSync(out, sql, 'utf8');
  process.stdout.write(`· 内容 SQL(${list.length} 词/${exCount} 句) → SQLAA/vocab_${bank}_content_batch1.sql\n`);
}

function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * 抽 16 词送审 —— **不是纯随机**,要尽量铺开 scene 和词性。
 * 纯随机抽出来很可能 12 个名词、场景全挤在 news/work,审不出覆盖问题。
 * 做法:确定性打乱后贪心挑,每次选"能新覆盖最多 scene + 新词性"的那个词;
 * 覆盖满了之后剩余名额按打乱顺序补齐。种子固定,复跑抽到同一批。
 */
function pickDiverse(list, n = 16) {
  const rnd = mulberry32(20260803);
  const shuffled = [...list].map(w => ({ w, k: rnd() })).sort((a, b) => a.k - b.k).map(x => x.w);
  const posOf = w => (w.pos || '?').split('/')[0];

  const picked = [];
  const seenScene = new Set();
  const seenPos = new Set();
  const taken = new Set();

  while (picked.length < Math.min(n, shuffled.length)) {
    let best = null, bestScore = -1;
    for (const w of shuffled) {
      if (taken.has(w.headword)) continue;
      const newScenes = new Set((w.examples || []).map(e => e.scene).filter(s => !seenScene.has(s)));
      const score = newScenes.size * 2 + (seenPos.has(posOf(w)) ? 0 : 3);
      if (score > bestScore) { bestScore = score; best = w; }
    }
    if (!best) break;
    taken.add(best.headword);
    picked.push(best);
    (best.examples || []).forEach(e => seenScene.add(e.scene));
    seenPos.add(posOf(best));
  }
  return { picked, seenScene, seenPos };
}

function writeSample(list) {
  const bank = BANK || 'all';
  const { picked, seenScene, seenPos } = pickDiverse(list, 16);

  const body = picked.map((w, n) => `### ${n + 1}. ${w.headword}  ${w.pos ? `*${w.pos}*` : ''}

| | |
| --- | --- |
| 音标 | ${w.ipa} |
| 中文释义 | ${w.def_zh} |
| 英文释义 | ${w.def_en} |
| freq_rank | ${w.freq_rank ?? '—'} |
| 难度档 | ${w.cefr} |

| # | 搭配 | 场景 | 例句 | 译文 |
| ---: | --- | --- | --- | --- |
${w.examples.map((e, i) => `| ${i + 1} | ${e.collocation} | \`${e.scene}\` | ${e.sentence} | ${e.translation_zh} |`).join('\n')}
`).join('\n');

  const tierCount = list.reduce((m, w) => { m[w.cefr] = (m[w.cefr] || 0) + 1; return m; }, {});
  const sceneCount = list.reduce((m, w) => { (w.examples || []).forEach(e => { m[e.scene] = (m[e.scene] || 0) + 1; }); return m; }, {});

  const md = `# 托福词汇内容 batch1 · 送审样本

> 抽 ${picked.length} 词(种子固定 20260803,复跑抽到同样这批)。
> **不是纯随机** —— 贪心挑成尽量铺开 scene 与词性,免得 16 个全是名词、场景全挤在 news。
> 本批覆盖 **${seenScene.size}/10 个 scene**、**${seenPos.size} 种词性**(${[...seenPos].map(p => p === '?' ? '词性缺失' : p).join(' / ')})。
> (\`词性缺失\` = ECDICT 的 translation 里没有词性前缀,全库 53 个词属于这种,\`pos\` 为空。)
> 全量 ${list.length} 词见 \`scripts/vocab/data/generated/${bank}-content.json\`。

## 全量 ${list.length} 词的分布(不只是抽样这 16 个)

难度档:${Object.entries(tierCount).sort().map(([k, v]) => `${k} ${v}`).join(' · ')}

场景(共 ${list.length * 3} 条例句):${SCENES.map(s => `${s} ${sceneCount[s] || 0}`).join(' · ')}

## 这批内容是怎么把住质量的

**九道**机器闸门,任一不过就整词重生成(最多 3 次),仍不过记入 \`scripts/vocab/data/failed.json\`:

| 闸门 | 判据 | 拦的是什么 |
| --- | --- | --- |
| g1 | 句中含 headword 或其屈折形/派生形 | 例句根本没用上目标词 |
| g2 | 例句 8-16 词 | 太短没语境 / 太长读不动 |
| g3 | 全字段扫 em-dash / en-dash | 破折号(中文排版里很丑) |
| g4 | 与**历史全部**已生成句 4-gram 重合 >50% | 跨词、跨批次的套话复读 |
| g5 | 三句 scene 互不相同且在枚举内;三句 collocation 互不相同 | 三句其实在讲同一个用法 |
| g6 | 同词任意两句 4-gram 重合 >30% | "换个场景词、其余照抄"的偷懒句 |
| g7 | collocation 必须含目标词或其屈折/派生形 | 拿同义词冒充搭配(attorney→"lawyer") |
| g8 | 译文句末须全角句号;中文后不许跟半角标点 | 中英标点混排 |
| g9 | 三句首词两两不同 | 同一个句式模子套三遍 |

场景枚举固定 10 个:\`${SCENES.join('`, `')}\`。

\`scene\` 既服务于 g5/g6 判定,也**随例句一并入库**(\`vocab_examples.scene\`),将来可按场景筛例句。

## 请重点看这几点

1. **中文释义准不准**、有没有把次要义当主义。
2. **搭配是不是真高频**,顺序是不是真按频率(句1 应该是最常见的说法)。
3. **例句像不像人写的** —— 三句之间是不是真的换了写法,不是同一个模子。
4. **难度档合不合适**:高频词配 A2 句、低频学术词配 B2/C1 句。

---

${body}`;
  const out = path.join(REPO, 'REVIEWAA', `vocab_${bank}_batch1_sample.md`);
  mkdirSync(path.dirname(out), { recursive: true });
  writeFileSync(out, md, 'utf8');
  process.stdout.write(`· 送审样本(${picked.length} 词) → REVIEWAA/vocab_${bank}_batch1_sample.md\n`);
}

main().catch(e => { process.stderr.write(`✗ ${e.stack || e.message}\n`); process.exit(1); });
