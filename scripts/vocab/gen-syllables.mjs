/**
 * G 段:音节拆分 —— 写入 vocab_words.syllables[] / syllable_ipa[]。
 *
 * ══ 假设差异表(第八条规矩,自列自核)══
 *
 * | 假设(A~F 段成立) | G 段实际形态 | 处理 |
 * | --- | --- | --- |
 * | 目标是「词」,闸门查词在不在句子里 | 目标是**字母序列**,没有句子 | g1/g7/g13 全部不适用 |
 * | 每条内容有例句 | **没有例句** | g2/g3/g4/g6/g9 全部不适用 |
 * | 正确性靠语义判断,机器只能查形式 | **正确性几乎完全机械可判** | 人审密度可低于前几段 |
 * | 产出是新增行 | **UPDATE 已上线的 4470 词** | 要基线 + 反向还原(沿用弱信号那套) |
 * | 批量结构:分类定额 | 全量同质,无类别 | 分批只为控风险 |
 *
 * **边界值**(刻意造进小批):
 *   单音节词(the / strength)· 连字符词(self-defense)· 最长词(characteristics)
 *   · 缩写/专名(TOEFL 词表里少见但有)· 带撇号的词
 *
 * ══ 两道 A 段没有的强闸(DDL 注释里就定了)══
 *   y1 **音节按序拼接必须逐字母等于 headword** —— 拼不回即拒。
 *      这是本段的核心闸:它把"音节拆错"这件事变成**机械可判**的。
 *   y2 syllable_ipa 数组长度必须等于 syllables 长度。
 *
 * 另加:
 *   y3 每个音节非空、只含字母/连字符/撇号
 *   y4 音节数合理(1-8;超过 8 的多半是把字母一个个拆了)
 *   y5 IPA 段非空且不含拉丁字母以外的可疑字符(只做形式检查,读音对错人审)
 *
 *   node scripts/vocab/gen-syllables.mjs --limit=20 --no-emit   # 小批(含边界样本)
 *   node scripts/vocab/gen-syllables.mjs                        # 全量 + 出件
 *
 * ⚠️ 只读 + 产出文件,绝不写库。SQL 交 Aaron 跑。
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DATA, arg, flag, callJson, pool, loadCache, saveCache, loadWordPool, q, qArr, writeSql, writeReview,
} from './llm.mjs';

const BANK = 'toefl';
const LIMIT = Number(arg('limit', '0')) || Infinity;
const CONCURRENCY = Number(arg('concurrency', '8'));
const MODEL = arg('model', 'gpt-4o-mini');   // 拆音节是规则活儿,mini 足够;y1 硬闸兜底
const BATCH = Number(arg('batch', '12'));    // 一次问多少个词
const NO_EMIT = flag('no-emit');
const EMIT_ONLY = flag('emit-only');
const CACHE_FILE = `${BANK}-syllables.json`;

/* ⚠️ 重音统一**不标**(Aaron 2026-08-06 裁决)。
 * 由来:4471 词里重音标记严重不一致 —— 有标 ˈæl·aɪ、有不标 ə·tɜr·ni、还有标错位的,
 * 覆盖率不明。而拆读模式逐音节显示时,重音符本身就是视觉噪音;
 * 重音信息交给音频。补齐 4471 词的重音标注,成本远高于收益。
 * 生成端一律剥除,DB 侧另有补丁清存量。 */
export const stripStress = s => String(s).replace(/[ˈˌ]/g, '');

/* 成节辅音统一写成 schwa + 辅音(Aaron 在 irreconcilable 那条已裁:
 * 「末段成节辅音符 bl̩ 改常规写法」)。模型对 -ble/-gle/-dle 词尾
 * 写的是 bl / ɡl / dl,不含元音过不了 y7 —— 而它们确实是音节,
 * 只是写法问题。机械补 ə,与裁决一致。 */
export const normSyllabic = s => String(s)
  .replace(/^([bdɡptkfvszʃʒθðmn]+)([lmnr])̩?$/u, '$1ə$2');

/** y1 的归一化:比对时忽略大小写,并剥掉连字符与撇号 —— 拆分不必保留符号。 */
const norm = s => String(s).toLowerCase().replace(/[^a-z]/g, '');

export function gateSyllable(word, out) {
  const fails = [];
  const syl = Array.isArray(out?.syllables) ? out.syllables : null;
  const ipa = Array.isArray(out?.syllable_ipa) ? out.syllable_ipa : null;
  if (!syl || !syl.length) return ['y3 syllables 为空'];
  if (!ipa || !ipa.length) return ['y2 syllable_ipa 为空'];

  /* y1 —— 本段核心闸:按序拼接必须逐字母等于 headword。
   * 这一条把"音节拆错"从语义判断变成了机械判断,也是这一段
   * 敢于放量、人审密度可以低于前几段的唯一依据。 */
  const joined = norm(syl.join(''));
  if (joined !== norm(word.headword)) {
    fails.push(`y1 拼接回来是「${syl.join('-')}」→ ${joined},与「${word.headword}」不符`);
  }
  // y2 两个数组等长
  if (syl.length !== ipa.length) {
    fails.push(`y2 syllables ${syl.length} 段 / syllable_ipa ${ipa.length} 段,长度不等`);
  }
  // y3 每段形态
  syl.forEach((s, i) => {
    if (!String(s).trim()) fails.push(`y3 第 ${i + 1} 段为空`);
    else if (!/^[A-Za-z'-]+$/.test(String(s).trim())) fails.push(`y3 第 ${i + 1} 段「${s}」含非字母字符`);
  });
  // y4 音节数合理 —— 超过 8 段的多半是把字母一个个拆了
  if (syl.length > 8) fails.push(`y4 拆成了 ${syl.length} 段,疑似逐字母拆分`);
  /* y5 IPA 段形式检查。读音对错人审,机器查这几条形式:
   * ⚠️ 后两条是 Aaron 抽审 G 段后加的,防同类:
   *   · 段内出现 . 号 —— bipedal 的音标混进了点号
   *   · 段内没有元音 —— broad-brimmed 把单辅音 /d/ 拆成一段、
   *     undifferentiated 把塞擦音 ʧ 单独成段。**单辅音不成音节**。 */
  /* ⚠️ 元音集必须含 **ɚ / ɝ**(r 色化中央元音)和**成节辅音符**(下加点 ̩)——
   *    voter 的 tɚ、flavor 的 vɚ 都是合法音节,漏了它们会误报 190+ 条。
   *    第七条规矩:新闸门必须拿已通过样本回跑,正是这一步抓出来的。 */
  const VOWEL = /[aeiouæɑɒɔəɜɚɝɪʊʌɛyøœɐɘɵɤɯʏʉɞɶ̩]/i;
  ipa.forEach((p, i) => {
    const t = String(p).trim();
    if (!t) { fails.push(`y5 第 ${i + 1} 段 IPA 为空`); return; }
    if (/[A-Za-z]{6,}/.test(t)) fails.push(`y5 第 ${i + 1} 段 IPA「${p}」疑似写成了拼写不是音标`);
    if (t.includes('.')) fails.push(`y6 第 ${i + 1} 段 IPA「${p}」含点号 —— 段内不该有分隔符`);
    if (!VOWEL.test(t)) fails.push(`y7 第 ${i + 1} 段 IPA「${p}」不含元音 —— 单辅音/塞擦音不能自成音节`);
  });
  return fails;
}

const SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['items'],
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        required: ['headword', 'syllables', 'syllable_ipa'],
        properties: {
          headword: { type: 'string' },
          syllables: { type: 'array', items: { type: 'string' } },
          syllable_ipa: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  },
};

const SYSTEM = 'You are a phonetician. Answer only with the required JSON. Never drop or add letters.';

function buildPrompt(words) {
  return `把下面每个英文单词拆成音节,并给出每个音节的国际音标。

${words.map(w => `  ${w.headword}${w.ipa ? `   整词音标 ${w.ipa}` : ''}`).join('\n')}

硬要求:
  · **syllables 按顺序拼起来必须逐字母等于原词** —— 一个字母都不能多、不能少、不能改。
    ✅ minimize -> ["min","i","mize"]      拼回 minimize ✓
    ❌ minimize -> ["mi","ni","mize"]      拼回 minimize ✓ 但拆分点错(mi-ni 不是音节边界)
    ❌ minimize -> ["min","i","mise"]      拼回 minimise ✗ 改了字母,直接判废
  · syllable_ipa 与 syllables **一一对应、长度相同**,每段是该音节的音标(不带斜杠)。
    ✅ min/i/mize -> ["mɪn","ɪ","maɪz"]
  · 连字符词按整词拆,连字符可以留在某一段里(self-defense -> ["self-","de","fense"])。
  · 单音节词就给一段(strength -> ["strength"] / ["streŋθ"])。
  · 不要把单词逐字母拆开。`;
}

async function main() {
  const words = loadWordPool(BANK);
  const cache = loadCache(CACHE_FILE);

  if (!EMIT_ONLY) {
    /* 小批时**刻意造边界样本**(第八条):单音节 / 连字符 / 最长 / 带撇号。 */
    let pending = words.filter(w => !(w.headword in cache));
    if (LIMIT !== Infinity) {
      const pick = [];
      const take = (f, n) => { for (const w of pending) { if (pick.includes(w) || !f(w)) continue; pick.push(w); if (--n <= 0) break; } };
      take(w => w.headword.length <= 5, 4);                    // 短词,多为单音节
      take(w => w.headword.includes('-'), 3);                  // 连字符
      take(w => w.headword.length >= 13, 4);                   // 最长
      take(w => w.headword.includes("'"), 2);                  // 带撇号
      take(() => true, LIMIT - pick.length);                   // 补足
      pending = pick.slice(0, LIMIT);
      process.stdout.write(`· 小批 ${pending.length} 条(含边界样本:短词/连字符/长词/撇号)\n`);
    } else {
      process.stdout.write(`· 待办 ${pending.length} 词(已缓存 ${Object.keys(cache).length})\n`);
    }

    const batches = [];
    for (let i = 0; i < pending.length; i += BATCH) batches.push(pending.slice(i, i + BATCH));

    let ok = 0, rej = 0, n = 0; const why = new Map();
    await pool(batches, CONCURRENCY, async (batch) => {
      /* 部分接受:过闸的收下。G 段是 UPDATE 已上线内容,但**每条互相独立**,
       * 且 y1 是硬闸(拼不回就是错的)—— 收下的都是机械验证过的,
       * 不存在弱信号那种"改了一半没有回滚点"的问题(出件时一次性出 SQL)。 */
      for (let a = 1; a <= 3; a++) {
        const left = batch.filter(w => !(w.headword in cache));
        if (!left.length) break;
        let items;
        try {
          items = await callJson({
            system: SYSTEM, user: buildPrompt(left), schemaName: 'syllables',
            schema: SCHEMA, model: MODEL, temperature: 0, maxTokens: 1200,
          }).then(x => x.items);
        } catch { continue; }
        for (const it of items) {
          const w = left.find(x => x.headword.toLowerCase() === String(it.headword).toLowerCase());
          if (!w) continue;
          /* ⚠️ **先归一化再过闸** —— 顺序反了的话闸门看到的还是模型的原始写法(bl),
           *    而归一化恰恰是为了让它通过。18 个 -ble/-gle 词就卡在这个顺序上。 */
          it.syllable_ipa = it.syllable_ipa.map(x => normSyllabic(stripStress(x)));
          const f = gateSyllable(w, it);
          if (f.length) { rej++; const k = f[0].slice(0, 40); why.set(k, (why.get(k) ?? 0) + 1); continue; }
          cache[w.headword] = { syllables: it.syllables, syllable_ipa: it.syllable_ipa };
          ok++;
        }
      }
      if (++n % 20 === 0) { saveCache(CACHE_FILE, cache); process.stdout.write(`  … ${n}/${batches.length} 批(收 ${ok} 拒 ${rej})\n`); }
    });
    saveCache(CACHE_FILE, cache);
    process.stdout.write(`\n收 ${ok} · 拒 ${rej} · 缓存合计 ${Object.keys(cache).length}\n`);
    for (const [k, c] of [...why].sort((a, b) => b[1] - a[1]).slice(0, 5)) process.stdout.write(`  拒因 ×${c}:${k}\n`);
  }

  if (NO_EMIT) {
    for (const [hw, v] of Object.entries(cache).slice(0, 20)) {
      process.stdout.write(`  ${hw.padEnd(18)} ${v.syllables.join(' · ')}   [${v.syllable_ipa.join(' · ')}]\n`);
    }
    return;
  }
  emit(words, cache);
}

function emit(words, cache) {
  const byHw = new Map(words.map(w => [w.headword, w]));
  const rows = Object.entries(cache).filter(([hw]) => byHw.has(hw));
  const bad = rows.filter(([hw, v]) => gateSyllable(byHw.get(hw), v).length);
  process.stdout.write(`\n出件前全量复检:${rows.length} 词,不合格 ${bad.length}\n`);
  if (bad.length) {
    bad.slice(0, 8).forEach(([hw, v]) => process.stdout.write(`  ✗ ${hw}: ${gateSyllable(byHw.get(hw), v)[0]}\n`));
    process.stdout.write('⚠️ 不出 SQL\n'); process.exitCode = 1; return;
  }

  const vals = rows.map(([hw, v]) =>
    `  (${q(hw.toLowerCase())}, ${qArr(v.syllables)}, ${qArr(v.syllable_ipa)})`).join(',\n');

  writeSql(`vocab_${BANK}_syllables.sql`, `-- G 段 音节拆分 —— ${rows.length} 词
--
-- ⚠️ 本段的正确性**几乎完全机械可判**:核心闸 y1 要求
--    「音节按序拼接必须逐字母等于 headword」,拼不回即拒。
--    所以这一段的人审密度可以低于前几段 —— 拼得回、两数组等长,就是对的;
--    剩下人审的只有「拆分点是否符合发音直觉」这一层。
--
-- 前置:vocab_syllables_and_dictionary_ddl.sql 已跑(syllables / syllable_ipa 两列)。
-- 幂等:按 lower(headword) UPDATE。⚠️ 由 Aaron 执行。

BEGIN;

SELECT 'BEFORE' AS stage, count(*) AS with_syllables FROM vocab_words WHERE syllables IS NOT NULL;

UPDATE vocab_words w
   SET syllables = v.syllables, syllable_ipa = v.syllable_ipa, updated_at = now()
  FROM (VALUES
${vals}
  ) AS v(headword, syllables, syllable_ipa)
 WHERE lower(w.headword) = v.headword;

SELECT 'AFTER' AS stage, count(*) AS with_syllables FROM vocab_words WHERE syllables IS NOT NULL;

-- ── count-validate:四行都必须是 t,否则 ROLLBACK ──
SELECT '有音节的词 = ${rows.length}' AS expect,
       (SELECT count(*) FROM vocab_words WHERE syllables IS NOT NULL) = ${rows.length} AS ok
UNION ALL
SELECT '两个数组逐词等长',
       NOT EXISTS (SELECT 1 FROM vocab_words WHERE syllables IS NOT NULL
                    AND array_length(syllables, 1) IS DISTINCT FROM array_length(syllable_ipa, 1))
UNION ALL
SELECT '音节拼接回来等于原词(核心闸,DB 侧复验)',
       NOT EXISTS (
         SELECT 1 FROM vocab_words
          WHERE syllables IS NOT NULL
            AND lower(regexp_replace(array_to_string(syllables, ''), '[^a-zA-Z]', '', 'g'))
                IS DISTINCT FROM lower(regexp_replace(headword, '[^a-zA-Z]', '', 'g'))
       )
UNION ALL
SELECT '没有空音节段',
       NOT EXISTS (SELECT 1 FROM vocab_words, unnest(syllables) AS s
                    WHERE syllables IS NOT NULL AND btrim(s) = '');

COMMIT;
`);

  /* 反向还原 —— G 段也是 UPDATE 已上线词表。两列改前都是 NULL,退回即置空。 */
  writeSql(`vocab_${BANK}_syllables_rollback.sql`, `-- G 段音节 · 反向还原(两列置空)
-- ⚠️ 只在出问题时跑。改前这两列全是 NULL,退回就是置空,不需要基线快照。
-- 由 Aaron 执行。

BEGIN;
UPDATE vocab_words SET syllables = NULL, syllable_ipa = NULL, updated_at = now()
 WHERE lower(headword) IN (${rows.map(([hw]) => q(hw.toLowerCase())).join(', ')});
SELECT '已全部置空' AS expect,
       NOT EXISTS (SELECT 1 FROM vocab_words WHERE syllables IS NOT NULL
                    AND lower(headword) IN (${rows.map(([hw]) => q(hw.toLowerCase())).join(', ')})) AS ok;
COMMIT;
`);

  /* 送审件:按音节数分组抽样 + 边界样本单独成栏。
   * ⚠️ 这一段人审看的**不是"拆得对不对"**(y1 已机械保证字母不丢),
   *    而是**"拆分点符不符合发音直觉"** —— 这是机器判不了的那一层。 */
  const byCount = new Map();
  for (const [hw, v] of rows) {
    const k = v.syllables.length;
    if (!byCount.has(k)) byCount.set(k, []);
    byCount.get(k).push([hw, v]);
  }
  const line = ([hw, v]) => `| ${hw} | ${v.syllables.join(' · ')} | ${v.syllable_ipa.join(' · ')} |`;
  const boundary = rows.filter(([hw]) => hw.includes('-') || hw.includes("'") || hw.length >= 14 || hw.length <= 4);

  writeReview(`vocab_${BANK}_syllables.md`, `# G 段 音节拆分 · 送审件(${rows.length} 词)

机器闸 y1-y5 全量复检 **0 不合格**。

## 这一段人审看什么

**不是"拆得对不对"** —— 核心闸 y1 已经机械保证「按序拼接逐字母等于原词」,
字母不会丢、不会改。DB 侧的 count-validate 还会**再复验一遍**同一条。

**要看的是"拆分点符不符合发音直觉"** —— 这是机器判不了的那一层。
例:\`minimize\` 拆成 \`mi·ni·mize\` 也能拼回原词,但 \`min·i·mize\` 才是对的音节边界。

## 边界样本(${boundary.length} 条)—— 连字符 / 撇号 / 超长 / 超短

| 词 | 音节 | 音标 |
| --- | --- | --- |
${boundary.slice(0, 30).map(line).join('\n')}

## 按音节数分组抽样

${[...byCount.keys()].sort((a, b) => a - b).map(k => {
    const list = byCount.get(k);
    const step = Math.max(1, Math.floor(list.length / 12));
    return `### ${k} 音节(${list.length} 词)

| 词 | 音节 | 音标 |
| --- | --- | --- |
${list.filter((_, i) => i % step === 0).slice(0, 12).map(line).join('\n')}
`;
  }).join('\n')}
`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(e => { process.stderr.write(`\n${e.stack || e.message}\n`); process.exit(1); });
}
