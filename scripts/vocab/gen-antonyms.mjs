/**
 * B 段:反义词 —— 写入 vocab_words.antonyms text[]
 *
 * 输入是 A 段成品(headword / pos / def_zh / def_en),不再查库,也不重复烧词表。
 *
 * ══ 这一段最大的质量风险:**模型会硬编反义词** ══
 *
 * 大量词根本没有反义词 —— attorney / participant / vaccine / theater 这些名词,
 * 你问模型"它的反义词是什么",它一定会给你编一个出来(defendant? bystander?)。
 * 这和 def_zh 那次"1-2 个义项被读成总是给 2 个"是同一个病:
 * **模型倾向于填满你给的槽位**。所以 prompt 用强措辞把"多数词没有反义词"顶在最前面,
 * 并且机器闸门这一侧**允许空数组**,不把空当失败。
 *
 * 六道闸门(b1-b6),全部离线可测:
 *   b1 形态合法      单个英文词(允许连字符,**不允许空格**),不含中文;
 *                    正则由 spec.mjs 的 SPEC.antonyms 推出,长度上下限也在那里
 *   b2 不是自己      不得等于 headword 或其屈折形/派生形
 *   b3 不同根        不得与 headword 共词干(拦 happy→happier 这种)
 *                    ⚠️ un-/in-/dis- 前缀反义词**不受影响**(它们不以词干打头),
 *                       appropriate ↔ inappropriate 照常通过
 *   b4 数量上限      取自 spec.mjs 的 SPEC.antonyms.max,空数组合法
 *   b5 组内不重复    大小写归一后互不相同
 *   b6 真词 + 词性对 查 ECDICT:该词必须存在,且词性与 headword 至少交叠一个
 *                    ⚠️ 没有 ECDICT 索引时这道闸**跳过并明说**,不静默放行
 *
 * 用法:
 *   node scripts/vocab/gen-antonyms.mjs --limit=20 --no-emit     # 小批试跑,只落 JSON
 *   node scripts/vocab/gen-antonyms.mjs                          # 全量 + 出 SQL + 出送审件
 *   node scripts/vocab/gen-antonyms.mjs --emit-only              # 只从已有 JSON 出件
 *
 * ⚠️ 本脚本只读 + 产出文件,绝不写库。SQL 一律交 Aaron 跑。
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { inflectionsOf, stemOf } from './gates.mjs';
import { SPEC, antonymShapeRe } from './spec.mjs';
import {
  DATA, GEN, arg, flag, callJson, pool, generateWithGates,
  loadCache, saveCache, loadWordPool, q, qArr, writeSql, writeReview,
} from './llm.mjs';

const BANK = arg('bank', 'toefl');
const LIMIT = Number(arg('limit', '0')) || Infinity;
const CONCURRENCY = Number(arg('concurrency', '4'));
const NO_EMIT = flag('no-emit');
const EMIT_ONLY = flag('emit-only');
const CACHE_FILE = `${BANK}-antonyms.json`;

/* ── ECDICT 索引(b6 用) ──
 * 只留 word → pos,用于判"这词真存在吗、词性对得上吗"。
 * 索引文件是构建缓存不进仓库(和 ecdict.csv 本身一样),
 * 缺了就跳过 b6 并在报告里写明**跳过了**,不假装验过。 */
const IDX_PATH = path.join(DATA, 'ecdict-index.json');
function loadEcdictIndex() {
  if (existsSync(IDX_PATH)) return JSON.parse(readFileSync(IDX_PATH, 'utf8'));
  const src = path.join(tmpdir(), 'ecdict-source', 'ecdict.csv');
  if (!existsSync(src)) return null;
  process.stdout.write('· 首次运行:从 ecdict.csv 建索引(约 20 秒)…\n');
  const idx = {};
  const text = readFileSync(src, 'utf8');
  let head = true;
  for (const line of text.split('\n')) {
    if (head) { head = false; continue; }
    if (!line) continue;
    // ECDICT 是标准 CSV,word 在第 1 列、translation 第 4、pos 第 5。
    // 只取前 5 个字段,且要处理引号包裹的字段(translation 里有逗号)。
    const cells = parseCsvPrefix(line, 5);
    const w = (cells[0] || '').trim().toLowerCase();
    if (!w || !/^[a-z][a-z' -]*$/.test(w)) continue;
    // pos 形如 "n:52/v:30/adj:18",取词性字母部分
    const posRaw = cells[4] || '';
    const tags = [...posRaw.matchAll(/([a-z]+):/g)].map(m => m[1]);
    // pos 列常为空(ingest 时实测 toefl 行全空),空就退回从 translation 前缀解析
    /* ⚠️ 两个都踩过的坑:
     * ① translation 里的换行是**字面的两个字符 \n**,不是真换行(CSV 里被引号包着,
     *    原样存的转义序列)。只匹配真换行会一条也命中不了。
     * ② ECDICT 用 **`a.` 标形容词、`ad.` 标副词**,不是 `adj.`/`adv.`。
     *    漏掉 `a` 的后果极其隐蔽:safe 的 "a. 安全的" 被整条丢掉,只剩
     *    "n. 保险箱",于是 `toxic → safe`、`vulnerable → secure`、`bizarre → normal`
     *    这些**完全正确**的反义词被 b6 判成"词性不交叠"。
     *    实测误杀率 8.8%,而且全是好数据 —— 闸门错了比没闸门更坏。
     *    ⚠️ `a` 必须放在 alternation 最后,否则会抢在 adj/adv/aux 前面匹配掉。 */
    const fromTr = [...String(cells[3] || '')
      .matchAll(/(?:^|\\n|\n)\s*(vt|vi|adj|adv|prep|conj|pron|int|num|art|aux|ad|n|v|a)\./g)].map(m => m[1]);
    const posSet = [...new Set([...tags, ...fromTr])];
    if (posSet.length) idx[w] = posSet.join('/');
    else if (!(w in idx)) idx[w] = '';        // 存在但词性未知
  }
  writeFileSync(IDX_PATH, JSON.stringify(idx), 'utf8');
  process.stdout.write(`· 索引建好:${Object.keys(idx).length} 词 → ${path.relative(process.cwd(), IDX_PATH)}\n`);
  return idx;
}

/** 极简 CSV 前缀解析:只解析前 n 个字段,支持双引号包裹与 "" 转义。 */
function parseCsvPrefix(line, n) {
  const out = [];
  let i = 0;
  while (out.length < n && i <= line.length) {
    if (line[i] === '"') {
      let s = ''; i++;
      while (i < line.length) {
        if (line[i] === '"' && line[i + 1] === '"') { s += '"'; i += 2; continue; }
        if (line[i] === '"') { i++; break; }
        s += line[i++];
      }
      out.push(s); if (line[i] === ',') i++;
    } else {
      const j = line.indexOf(',', i);
      if (j === -1) { out.push(line.slice(i)); break; }
      out.push(line.slice(i, j)); i = j + 1;
    }
  }
  return out;
}

/* ── 闸门 ── */
/** ⚠️ `a` → adj、`ad` → adv 是 ECDICT 的写法,必须归一,否则 adj 永远匹配不上。 */
const POS_ALIAS = { vt: 'v', vi: 'v', a: 'adj', ad: 'adv', adj: 'adj', adv: 'adv', n: 'n', v: 'v' };
const normPos = p => String(p || '').toLowerCase().split(/[\/,]/)
  .map(s => s.replace(/\.$/, '').trim()).map(s => POS_ALIAS[s] || s).filter(Boolean);

const SHAPE_RE = antonymShapeRe();

export function gateAntonyms(word, list, ecdict) {
  const fails = [];
  const hw = String(word.headword).toLowerCase();
  if (!Array.isArray(list)) return ['b4 antonyms 不是数组'];
  if (list.length > SPEC.antonyms.max) fails.push(`b4 给了 ${list.length} 个反义词,最多 ${SPEC.antonyms.max} 个`);

  const forms = inflectionsOf(hw, {});
  const stem = stemOf(hw);
  const seen = new Set();

  for (const raw of list) {
    const a = String(raw || '').trim();
    const low = a.toLowerCase();
    /* ⚠️ 正则由 SPEC 推出来,不在这里手写字符集。
     *    第一版手写时把空格放了进去,于是 gush → "hold back" 这种**短语**过了闸,
     *    而 prompt 明写"只给单个英文词" —— 判据双写必然漂(第四条规矩)。 */
    if (!SHAPE_RE.test(a)) { fails.push(`b1 "${a}" 不是单个英文词(短语/含空格/形态不合法)`); continue; }
    if (low === hw || forms.has(low)) { fails.push(`b2 "${a}" 就是目标词本身或其屈折形`); continue; }
    if (stem.length >= 5 && low.startsWith(stem)) { fails.push(`b3 "${a}" 与 "${hw}" 同根,不是反义词`); continue; }
    if (seen.has(low)) { fails.push(`b5 "${a}" 在组内重复`); continue; }
    seen.add(low);
    if (ecdict) {
      if (!(low in ecdict)) { fails.push(`b6 "${a}" 不在 ECDICT 里,可能是编的`); continue; }
      const ap = normPos(ecdict[low]);
      const hp = normPos(word.pos);
      // 任一侧词性未知就不判 —— 宁可漏判,不误杀
      if (ap.length && hp.length && !ap.some(p => hp.includes(p))) {
        fails.push(`b6 "${a}" 词性 ${ap.join('/')} 与 "${hw}" 的 ${hp.join('/')} 不交叠`);
      }
    }
  }
  return fails;
}

const SYSTEM = `You are a lexicographer building an English-Chinese vocabulary app for Chinese students.
Answer only with the required JSON. Never invent words.`;

const SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['antonyms'],
  properties: {
    antonyms: { type: 'array', items: { type: 'string' }, description: `0-${SPEC.antonyms.max} 个反义词,没有就给空数组` },
  },
};

function buildPrompt(w, notes) {
  return `目标词:${w.headword}${w.pos ? `  (${w.pos})` : ''}
中文释义:${w.def_zh}
英文释义:${w.def_en}

给出这个词的反义词,最多 ${SPEC.antonyms.max} 个,放进 antonyms 数组。

⚠️ **多数词没有反义词。没有就给空数组 [],这是正确答案,不是失败。**
   反义词只存在于**有明确对立面**的词:形容词的程度/性质、方向、状态、少数动词。
   绝大多数**具体名词和专业名词根本没有反义词** —— 不要为了填满数组硬编。
   反例(必须给空数组):
     attorney(律师)     -> []   ❌ 不是 defendant,那是"被告",不是"律师的反面"
     participant(参与者) -> []   ❌ 不是 bystander,旁观者不是参与者的对立面
     vaccine(疫苗)      -> []
     theater(剧院)      -> []
     hypothesis(假设)   -> []
   正例:
     abundant(丰富的)   -> ["scarce", "sparse"]
     ascend(上升)       -> ["descend"]
     temporary(临时的)  -> ["permanent"]
     appropriate(恰当的)-> ["inappropriate"]        (加否定前缀是合法反义词)

硬要求:
  · 只给**单个英文词**(允许连字符),不要短语、不要解释、不要中文。
  · 反义词的**词性必须与目标词一致** —— 形容词配形容词,动词配动词。
    ❌ fast(adj.) -> "slowly"(adv.)   ✅ fast(adj.) -> "slow"
  · 反义词必须是**真实存在的常用英语词**,不许生造。
  · 不许给目标词自己的屈折形或同根词(happy -> happier ❌)。
  · 若目标词有多个义项,只针对**第一个义项**给反义词。
${notes?.length ? `\n上一次的产出被机器闸门拒了,原因如下,请针对性修正:\n${notes.map(n => `  · ${n}`).join('\n')}` : ''}`;
}

async function main() {
  const words = loadWordPool(BANK);
  const cache = loadCache(CACHE_FILE);
  const ecdict = loadEcdictIndex();
  if (!ecdict) process.stdout.write('⚠️ 没找到 ECDICT 索引,**b6(真词 + 词性)这道闸门本次跳过**\n');
  else process.stdout.write(`· ECDICT 索引 ${Object.keys(ecdict).length} 词,b6 生效\n`);

  /* ── 缓存重验:闸门改过之后,旧缓存必须重新过闸 ──
   * ⚠️ 断点续跑的 pending 过滤是"在缓存里就跳过",这意味着**旧闸门放行的脏数据
   *    会永远绕过新闸门**。b1 收紧(禁短语)、b6 修好词性解析之后,
   *    实测 2325 条缓存里有 10 条不再合格 —— 不淘汰的话它们会直接进 SQL。
   *    淘汰掉就会被当成 pending 重新生成,自然带上新规格。 */
  const byHw = new Map(words.map(w => [w.headword, w]));
  const evicted = [];
  for (const hw of Object.keys(cache)) {
    const w = byHw.get(hw);
    if (!w) continue;
    if (gateAntonyms(w, cache[hw], ecdict).length) { delete cache[hw]; evicted.push(hw); }
  }
  if (evicted.length) {
    process.stdout.write(`· 缓存重验:${evicted.length} 条按当前闸门已不合格,淘汰后重生成(${evicted.slice(0, 6).join(', ')}${evicted.length > 6 ? '…' : ''})\n`);
    saveCache(CACHE_FILE, cache);
  }

  if (!EMIT_ONLY) {
    const pending = words.filter(w => !(w.headword in cache)).slice(0, LIMIT === Infinity ? undefined : LIMIT);
    process.stdout.write(`· 待办 ${pending.length} 词(已缓存 ${Object.keys(cache).length})\n`);

    let ok = 0, failed = 0, n = 0;
    await pool(pending, CONCURRENCY, async (w) => {
      const r = await generateWithGates({
        label: w.headword,
        build: notes => callJson({
          system: SYSTEM, user: buildPrompt(w, notes),
          schemaName: 'antonyms', schema: SCHEMA, temperature: 0.3,
        }).then(x => x.antonyms),
        gate: list => gateAntonyms(w, list, ecdict),
      });
      n++;
      if (r.ok) { cache[w.headword] = r.payload; ok++; }
      else { failed++; process.stdout.write(`  ✗ ${w.headword}: ${r.fails.join(' / ')}\n`); }
      if (n % 50 === 0) { saveCache(CACHE_FILE, cache); process.stdout.write(`  … ${n}/${pending.length}(失败 ${failed})\n`); }
    });
    saveCache(CACHE_FILE, cache);
    const rate = n ? (failed / n * 100).toFixed(1) : '0.0';
    process.stdout.write(`\n完成 ${ok} · 失败 ${failed} · 失败率 ${rate}%\n`);
    if (Number(rate) > 5) process.stdout.write('⚠️ 失败率超过 5%,按护栏应停下来看原因\n');
  }

  if (NO_EMIT) return;
  emit(words, cache, ecdict);
}

function emit(words, cache, ecdict) {
  const rows = words.filter(w => w.headword in cache);
  const withAnt = rows.filter(w => cache[w.headword].length > 0);
  const total = withAnt.reduce((n, w) => n + cache[w.headword].length, 0);

  /* 全量复检:出件前把闸门再跑一遍。
   * ⚠️ 生成期通过 ≠ 现在通过 —— 闸门可能在两次运行之间改过(g13 就是这么加的)。 */
  const bad = rows.filter(w => gateAntonyms(w, cache[w.headword], ecdict).length);
  process.stdout.write(`\n出件前全量复检:${rows.length} 词,不合格 ${bad.length}\n`);
  if (bad.length) {
    bad.slice(0, 10).forEach(w => process.stdout.write(`  ✗ ${w.headword}: ${gateAntonyms(w, cache[w.headword], ecdict).join(' / ')}\n`));
    process.stdout.write('⚠️ 有不合格项,不出 SQL\n');
    process.exitCode = 1;
    return;
  }

  const values = withAnt.map(w => `  (${q(w.headword.toLowerCase())}, ${qArr(cache[w.headword])})`).join(',\n');
  writeSql(`vocab_${BANK}_antonyms.sql`, `-- B 段 反义词 —— ${withAnt.length} 词 / ${total} 个反义词
-- 覆盖率 ${withAnt.length}/${rows.length}(${(withAnt.length / rows.length * 100).toFixed(1)}%)。
-- ⚠️ 覆盖率低是**预期**:多数词没有反义词,空的就不写库(antonyms 保持 NULL)。
-- 闸门 b1-b6 全过(b6 = 查 ECDICT 验真词 + 词性交叠${ecdict ? '' : ',本次因缺索引跳过'})。
-- 幂等:按 lower(headword) 定位 UPDATE。⚠️ 由 Aaron 执行。

BEGIN;

SELECT 'BEFORE' AS stage, count(*) AS words_with_antonyms FROM vocab_words WHERE antonyms IS NOT NULL;

UPDATE vocab_words w
   SET antonyms = v.antonyms, updated_at = now()
  FROM (VALUES
${values}
  ) AS v(headword, antonyms)
 WHERE lower(w.headword) = v.headword;

SELECT 'AFTER' AS stage, count(*) AS words_with_antonyms FROM vocab_words WHERE antonyms IS NOT NULL;

-- ── count-validate:四行都必须是 t,否则 ROLLBACK ──
SELECT '有反义词的词 = ${withAnt.length}' AS expect,
       (SELECT count(*) FROM vocab_words WHERE antonyms IS NOT NULL) = ${withAnt.length} AS ok
UNION ALL
SELECT '反义词总数 = ${total}',
       (SELECT coalesce(sum(array_length(antonyms, 1)), 0) FROM vocab_words WHERE antonyms IS NOT NULL) = ${total}
UNION ALL
SELECT '没有词配了超过 3 个反义词',
       NOT EXISTS (SELECT 1 FROM vocab_words WHERE array_length(antonyms, 1) > 3)
UNION ALL
SELECT '没有反义词等于它自己',
       NOT EXISTS (SELECT 1 FROM vocab_words WHERE lower(headword) = ANY(SELECT lower(unnest(antonyms))));

COMMIT;
`);

  /* 送审件:分两块 —— 有反义词的抽样,以及**判空的抽样**。
   * ⚠️ 只给"有反义词"的样本,审不出这一段真正的风险(硬编)。
   *    判空对不对同样要人眼看,所以两块都要给。 */
  const sample = withAnt.filter((_, i) => i % Math.max(1, Math.floor(withAnt.length / 24)) === 0).slice(0, 24);
  const empties = rows.filter(w => !cache[w.headword].length);
  const emptySample = empties.filter((_, i) => i % Math.max(1, Math.floor(empties.length / 16)) === 0).slice(0, 16);

  writeReview(`vocab_${BANK}_antonyms_sample.md`, `# B 段 反义词 · 送审件

覆盖 **${withAnt.length}/${rows.length}** 词(${(withAnt.length / rows.length * 100).toFixed(1)}%),共 ${total} 个反义词。
其余 ${empties.length} 词判定为**没有反义词**,不写库。

机器闸门 b1-b6 全量复检 **0 不合格**${ecdict ? `(b6 查 ECDICT ${Object.keys(ecdict).length} 词索引)` : '(⚠️ b6 因缺 ECDICT 索引本次跳过)'}。

## 一、有反义词的(${sample.length} 词抽样)

| 词 | 词性 | 释义 | 反义词 |
| --- | --- | --- | --- |
${sample.map(w => `| ${w.headword} | ${w.pos ?? ''} | ${w.def_zh} | **${cache[w.headword].join(' / ')}** |`).join('\n')}

## 二、判定"没有反义词"的(${emptySample.length} 词抽样)

这一块才是本段的主要风险 —— **模型倾向于填满槽位**,硬编反义词。
下面这些是它判空的,请看有没有该有反义词却被判空的。

| 词 | 词性 | 释义 |
| --- | --- | --- |
${emptySample.map(w => `| ${w.headword} | ${w.pos ?? ''} | ${w.def_zh} |`).join('\n')}
`);
}

/* ⚠️ 只有当本文件是**入口**时才执行。
 * 踩过:用 `node -e "import('./gen-antonyms.mjs')"` 想看一眼导出,
 * 结果 main() 直接开跑,真调 API 烧到 2550 词才被发现。
 * 模块被 import 时必须什么都不做 —— 这是所有"脚本兼模块"文件的默认要求。 */
const isEntry = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isEntry) {
  if (flag('build-index')) {
    // 只建 ECDICT 索引然后退出,不生成任何内容、不调 API
    const idx = loadEcdictIndex();
    process.stdout.write(idx ? `✓ 索引就绪:${Object.keys(idx).length} 词\n` : '✗ 找不到 ecdict.csv\n');
  } else {
    main().catch(e => { process.stderr.write(`\n${e.stack || e.message}\n`); process.exit(1); });
  }
}
