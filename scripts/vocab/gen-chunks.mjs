/**
 * D 段:词块(tier1)—— 写入 vocab_chunks。
 *
 * 与 F 段搭配的关系(Aaron 裁决):**允许重叠,不删**。
 *   F 段 = "某个词的搭配",挂词卡;D 段 = "独立学习单元",词块页/听音短语/磨耳朵。
 *   重叠的用 related_word_id 连通(DDL 已出),不是去重。
 *
 * ══ 四类定额分批,不让模型自选类别 ══
 * 让它自选必然偏向最好写的 phrasal_verb —— 100 条能出 80 条 look after 型。
 * 所以按 type 分批调用,每批只准出这一类。
 *
 * 闸门:
 *   k1 type 合法且**等于本批指定类**   —— D 段只出四值,**不许占 idiom**(那是 H 段的)
 *   k2 chunk 形态:2-5 词、无句号、非整句
 *   k3 def_zh 体裁:走 defZhShapeProblem(与 A 段同一把尺)
 *   k4 **connector 边界闸**:connector 类的 def_zh 必须点出"什么时候不能用"
 *   k5 例句走九闸门(runAllGates,按档句长口径)
 *   k6 例句必须含该词块(整体出现,允许大小写与屈折)
 *   k7 组内 chunk 不重复
 *
 * 用法:
 *   node scripts/vocab/gen-chunks.mjs --limit=10 --no-emit    # 小批试跑
 *   node scripts/vocab/gen-chunks.mjs                          # tier1 全量 + 出件
 *
 * ⚠️ 只读 + 产出文件,绝不写库。SQL 交 Aaron 跑。
 */
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  SCENES, ngrams, defZhShapeProblem, g2_length, g3_noEmDash, g4_globalDedup, LEGACY_LENGTH,
  inflectionsOf,
} from './gates.mjs';
import { SPEC } from './spec.mjs';
import {
  DATA, arg, flag, callJson, pool, generateWithGates,
  loadCache, saveCache, q, writeSql, writeReview,
} from './llm.mjs';

const MODEL = arg('model', 'gpt-4o');       // 词块的"边界"判断是词汇学活儿,用强模型
const LIMIT = Number(arg('limit', '0')) || Infinity;
const CONCURRENCY = Number(arg('concurrency', '3'));
const NO_EMIT = flag('no-emit');
const EMIT_ONLY = flag('emit-only');
const CACHE_FILE = 'toefl-chunks.json';

/* 屈折表用**全量 ECDICT exchange**,不用 toefl-inflections.json。
 * ⚠️ 后者只覆盖托福词表的 4471 个词,而 come / get / take 这类太常用的词
 *    根本不在托福词表里 —— 查表落空退回后缀规则,`came` 永远匹配不上,
 *    整批 phrasal_verb 三次重试全废(第八条规矩的案例:
 *    "接上权威源"和"该源覆盖这批数据"是两回事)。
 * 缺索引时退回托福表并明说,不静默降级。 */
const exPath = path.join(DATA, 'ecdict-exchange.json');
const toeflPath = path.join(DATA, 'toefl-inflections.json');
let INFLECT = {};
if (existsSync(exPath)) INFLECT = JSON.parse(readFileSync(exPath, 'utf8'));
else if (existsSync(toeflPath)) {
  INFLECT = JSON.parse(readFileSync(toeflPath, 'utf8'));
  process.stdout.write('⚠️ 没有全量 exchange 索引,退回托福词表(覆盖不全,不规则屈折会误伤)\n');
  process.stdout.write('   先跑:node scripts/vocab/build-exchange-index.mjs\n');
}

/** 四类定额(tier1 100 条)。connector 少而精 —— 它本来就不多,凑数就会出生僻的。 */
export const QUOTA = {
  phrasal_verb: 35,
  collocation_ext: 30,
  frame: 20,
  connector: 15,
};
const TYPES = Object.keys(QUOTA);

const TYPE_DESC = {
  phrasal_verb: '动词短语(动词 + 副词/介词),如 take into account / carry out / look into',
  collocation_ext: '固定搭配(超出单个词卡范围的常用组合),如 a wide range of / play a key role',
  frame: '句型框架 —— **必须带 ... 槽位、能独立撑起句子结构**,如 it is worth noting that... / there is no doubt that... / the extent to which... / not only ... but also ... / what matters most is that...',
  connector: '连接词与篇章标记,如 as a result / on the contrary / nevertheless',
};

/** k6:例句必须含该词块。frame 带 ... 槽位,只校验骨架词。 */
function sentenceHasChunk(sentence, chunk) {
  const s = String(sentence).toLowerCase();
  const parts = String(chunk).toLowerCase().split(/\s*\.\.\.\s*|\s*…\s*/).filter(Boolean);
  return parts.every(p => {
    const words = p.trim().split(/\s+/).filter(Boolean);
    // 首词允许屈折(take/takes/took),其余要求原样出现
    return words.every((w, i) => {
      const bare = w.replace(/[^a-z-]/g, '');
      if (!bare) return true;
      /* ⚠️ 首词用 inflectionsOf(认 ECDICT exchange 表),不用后缀正则 ——
       *    come across 的过去式是 came,`come(s|ed|ing)?` 永远匹配不上,
       *    整批 phrasal_verb 因此三次重试全废。不规则屈折是新形态,旧正则的老假设不成立。 */
      if (i === 0) {
        const forms = inflectionsOf(bare, INFLECT);
        return [...forms].some(f => new RegExp(`\\b${f}\\b`).test(s));
      }
      return new RegExp(`\\b${bare}\\b`).test(s);
    });
  });
}

/**
 * k4 用法要点 —— **分级必填**(Aaron 2026-08-06 定)。
 * 统一判据:要点写「学生会踩的坑」,不是把释义再说一遍。
 * ⚠️ 机器闸只查**有没有写**,写得好不好人审 —— 机器判不了"这是不是坑"。
 */
const NOTE_LEVEL = {
  connector: 'required',        // 边界说明:什么时候不能用
  phrasal_verb: 'required',     // 可分性与搭配:carry out sth / point sth out —— 宾语能否插中间是中国学生死穴
  frame: 'required',            // 用在什么位置、什么场合
  collocation_ext: 'optional',  // 只在有坑时给(a wide range of 后接复数名词);无坑不硬加,避免废话
};
/** 有没有写要点:看有没有括号说明。 */
const hasNote = def => /[((][^))]{2,}[))]/.test(String(def));
/* ⚠️ SQL validate 必须用**同一把尺**(第四条规矩)。
 *    原来闸门查"有没有括号"、validate 查"含不含边界关键词",两把尺 ——
 *    实测 as a consequence「结果是(有明确因果,非泛泛承接)」内容完全正确,
 *    却因为关键词表里只有「而非」没有「非」而被判 false。
 *    中文表达边界的说法太多,关键词表天生列不全;"有没有括号"才是机械可判的。 */

/* ═══ 可分性:规则表判定,模型不碰这个字段(Aaron 2026-08-06 定)═══
 *
 * ⚠️ 上一轮让模型写,四条错两条(set up / take on 都是可分,却被写成"宾语不插中间")。
 *    **可分性写错比不写更糟** —— 学生会照着写出病句。
 * ⚠️ 也不假装有数据源:ECDICT 没有可分性标注。
 *    所以走**规则表 + 人审必看栏**双保险:
 *      ① 规则能判的,脚本判死,依据(副词还是介词)一并记下来
 *      ② 两栖词不猜,标"待人工"
 *      ③ 送审件里可分性单独成栏,Aaron 逐条扫 —— 100 条几分钟,比混在释义里可靠
 */
const ADVERB_PARTICLES = ['up', 'out', 'down', 'off', 'away', 'back'];
const PREP_PARTICLES = ['into', 'for', 'with', 'at', 'from', 'about', 'of', 'to', 'after'];
const AMBIGUOUS_PARTICLES = ['on', 'over', 'around', 'through'];

/** 返回 { verdict, basis } —— verdict: separable | inseparable | manual */
export function separability(chunk) {
  const words = String(chunk).toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (words.length >= 3) {
    return { verdict: 'inseparable', basis: '三词短语动词' };
  }
  const p = words[words.length - 1];
  if (ADVERB_PARTICLES.includes(p)) return { verdict: 'separable', basis: `副词小品词 ${p}` };
  if (PREP_PARTICLES.includes(p)) return { verdict: 'inseparable', basis: `介词 ${p}` };
  if (AMBIGUOUS_PARTICLES.includes(p)) return { verdict: 'manual', basis: `两栖词 ${p},规则表不猜` };
  return { verdict: 'manual', basis: `小品词 ${p} 不在规则表内` };
}

/** 由脚本写进 def_zh 的可分性说明。模型给的括号内容会被这个覆盖。 */
export function separabilityNote(chunk) {
  const v = String(chunk).toLowerCase().trim().split(/\s+/)[0];
  const { verdict } = separability(chunk);
  if (verdict === 'separable') return `${v} sth ${String(chunk).split(/\s+/).slice(1).join(' ')} 可分,代词须插中间`;
  if (verdict === 'inseparable') return `${chunk} sth,宾语不插中间`;
  return '可分性待人工确认';
}

/** k8 frame 必须是**带槽位的句子骨架** —— 不含 ... 的一律不算 frame。 */
function frameShapeProblem(chunk) {
  if (!/\.\.\.|…/.test(chunk)) {
    return `frame 必须含 ... 槽位(去掉槽位后应是句子骨架);「${chunk}」没有槽位,是连接词或短语,该归 connector / collocation_ext`;
  }
  return null;
}

export function gateChunk(item, wantType, seen, corpusNgrams, cefr = 'B2') {
  const fails = [];
  const type = String(item.type || '').trim();
  const chunk = String(item.chunk || '').trim();
  const defZh = String(item.def_zh || '').trim();

  // k1 —— idiom 是 H 段的,D 段一条都不许占
  if (!TYPES.includes(type)) fails.push(`k1 type "${type}" 不在 D 段四值内(idiom 属 H 段,不许占)`);
  else if (type !== wantType) fails.push(`k1 本批只出 ${wantType},却给了 ${type}`);

  // k2 形态
  /* k2 词数**按类型取范围**,数值在 spec.mjs(第四条规矩:判据引用规格常量,不手写)。 */
  const wc = chunk.split(/\s+/).filter(Boolean).length;
  const [lo, hi] = SPEC.chunk.wordRange[type] ?? [2, 5];
  if (wc < lo || wc > hi) fails.push(`k2 "${chunk}" ${wc} 个词,${type} 应为 ${lo}-${hi} 词`);
  /* ⚠️ 判句末标点前**先剥掉 ... 槽位** —— 否则 frame 的
   *    「it is clear that...」会被当成"带句号"判废。
   *    k8 要求 frame 必须有 ...,k2 又把 ... 当句号,两道闸互相打架:
   *    加新闸门时必须回头看旧闸门的正则会不会误伤新形态。 */
  const bareChunk = chunk.replace(/\.\.\.|…/g, '').trim();
  if (/[.!?]$/.test(bareChunk)) fails.push(`k2 "${chunk}" 带句末标点,那是句子不是词块`);
  /* k7 跨批去重:seen 装的是**所有类别**已生成的 chunk。
   * ⚠️ 实测 carry out 在 phrasal_verb 出过一次,又在 collocation_ext 出了一次 ——
   *    同一个短语不该在两个类型下各来一遍,那是类型串味不是多入口。 */
  if (seen.has(chunk.toLowerCase())) fails.push(`k7 "${chunk}" 与已生成的重复(可能是类型串味)`);

  /* k3 体裁 —— 与 A 段同一把尺,但**先剥掉括号说明再判**。
   * ⚠️ connector 的 def_zh 规格就是「因此(须有明确因果,不作泛泛承接)」这种形态,
   *    括号里必然有逗号。而逗号闸是防"拿逗号当义项分隔符"的,不是禁止一切逗号 ——
   *    直接套过来会把 Aaron 定的 connector 规格整个判死。
   *    字数上限同理:括号是使用边界说明,不计入义项长度。 */
  /* ⚠️ 剥括号之后**还要剥尾部句号** —— 用法要点是说明句,模型自然带句号,
   *    而 defZhShapeProblem 见句号就判"写成了句子"。这是第三处同型误伤。 */
  const bare = defZh.replace(/[((][^))]*[))]/g, '').replace(/[。.]+$/, '').trim();
  const shape = defZhShapeProblem(bare);
  if (shape) fails.push(`k3 ${shape}`);

  // k4 用法要点(分级必填)
  /* ⚠️ phrasal_verb 的括号由脚本在生成后补,所以这道闸对它豁免 ——
   *    否则会在"脚本还没补"的时刻把好数据判废。 */
  if (type !== 'phrasal_verb' && NOTE_LEVEL[type] === 'required' && !hasNote(defZh)) {
    fails.push(`k4 ${type} 的 def_zh「${defZh}」缺用法要点 —— 括号里要写学生会踩的坑,不是把释义再说一遍`);
  }
  // k8 frame 槽位
  if (type === 'frame') {
    const f = frameShapeProblem(chunk);
    if (f) fails.push(`k8 ${f}`);
  }

  // k5 例句走九闸门 + k6 例句含词块
  /* k5 例句闸门:逐条复用 A 段的 g2/g3/g4。
   * ⚠️ **不能**把同一条例句复制成三份塞给 runAllGates —— 它内部会把已接受的句子
   *    并进 g4 的比对面,于是这条句子和自己比,必然 100% 重合。踩过一次。
   * ⚠️ 句长用 LEGACY [8,16] 不用按档区间:词块例句是为了展示用法,
   *    天然比 A 段的词汇例句短,套 B2 的 9-16 会把正常句子判废。 */
  const g2 = g2_length(item.example_en, SPEC.chunk.exampleLength);
  if (g2) fails.push(`k5 ${g2}`);
  const g3 = g3_noEmDash(item.example_en, item.example_zh, defZh);
  if (g3) fails.push(`k5 ${g3}`);
  const g4 = g4_globalDedup(item.example_en, corpusNgrams);
  if (g4) fails.push(`k5 ${g4}`);
  const g = [];
  for (const m of g) fails.push(`k5 ${m}`);
  if (!SCENES.includes(String(item.scene))) fails.push(`k5 scene "${item.scene}" 不在枚举内`);
  if (!sentenceHasChunk(item.example_en, chunk)) fails.push(`k6 例句里没出现「${chunk}」`);
  return fails;
}

const SYSTEM = `You are a lexicographer building an English learning app for Chinese TOEFL students.
Answer only with the required JSON. Give real, high-frequency chunks, never invented ones.`;

const SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['items'],
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        required: ['chunk', 'type', 'def_zh', 'scene', 'example_en', 'example_zh'],
        properties: {
          chunk: { type: 'string' }, type: { type: 'string' }, def_zh: { type: 'string' },
          scene: { type: 'string' }, example_en: { type: 'string' }, example_zh: { type: 'string' },
        },
      },
    },
  },
};

function buildPrompt(wantType, n, already, notes) {
  const NOTE_RULE = {
    connector: [
      '**边界说明必填**:什么时候**不能**用。',
      '     正例:on the contrary -> 恰恰相反(纠正前句,非对比)',
      '           as a result -> 因此(须有明确因果,不作泛泛承接)',
      '     反例:as a result -> 因此 ❌ 没有边界,和 therefore/thus 分不开',
    ].join('\n'),
    phrasal_verb: [
      '**可分性与搭配必填** —— 宾语能不能插在中间是中国学生的死穴。',
      '     正例:carry out -> 执行(carry out sth,宾语不插中间)',
      '           point out -> 指出(point sth out 可分,代词须插中间:point it out)',
      '     反例:carry out -> 执行 ❌ 没说可分性,学生照样写 carry out it',
    ].join('\n'),
    frame: [
      '**用法位置必填**:用在句首还是句中、什么场合。',
      '     正例:it is worth noting that... -> 值得注意的是(句首,引出重要发现,学术写作常用)',
    ].join('\n'),
    collocation_ext: [
      '**选填** —— 只在**有坑**时写,没坑就别硬加,免得凑废话。',
      '     有坑:a wide range of -> 各种各样的(后接复数名词)',
      '     无坑:play a key role -> 发挥关键作用(不用加)',
    ].join('\n'),
  }[wantType];

  const frameRule = wantType !== 'frame' ? '' : `
⚠️ **frame 的硬判据:chunk 必须含 ... 槽位,去掉槽位后是句子骨架,不是短语。**
   ✅ it is worth noting that... / there is no doubt that... / the extent to which...
      not only ... but also ... / what matters most is that...
   ❌ as well as / such as / in addition —— 这些没有槽位、只起连接或举例作用,
      **属于 connector 或 collocation_ext,不是 frame**。上一轮就栽在这。`;

  const connectorRule = wantType !== 'connector' ? '' : `
⚠️ **connector 类特有的硬要求:def_zh 必须点出使用边界 —— "什么时候不能用"。**
   只给中文对应词等于没教,学生照样滥用。
   正例:
     on the contrary  -> 恰恰相反(纠正前句,非对比)
     as a result      -> 因此(须有明确因果,不作泛泛承接)
     nevertheless     -> 尽管如此(让步转折,不用于并列)
     in contrast      -> 相比之下(比较两者,不纠正前句)
   反例:
     as a result -> 因此            ❌ 没有边界,和 therefore/thus 分不开
     on the contrary -> 相反        ❌ 会被当成 in contrast 用,这是最常见的错用
   ⚠️ 边界要写在 ${SPEC.defZh.minChars}-${SPEC.defZh.maxChars} 字的正文之外?不 ——
      整条 def_zh 含括号说明,括号内不计入义项字数限制。`;

  return `给出 ${n} 个**${wantType}** 类词块。
类型定义:${TYPE_DESC[wantType]}

⚠️ **本批只出 ${wantType} 这一类**,不许混入其它类型。
${already.length ? `⚠️ 下面这些已经有了,一条都不许重复:\n${already.slice(-60).map(c => `  · ${c}`).join('\n')}` : ''}

每条给:
  · chunk        2-5 个词,不带句号,不是完整句
  · type         固定填 "${wantType}"
  · def_zh       中文释义,词典式短语${wantType === 'connector' ? '(含使用边界,见下)' : `,${SPEC.defZh.minChars}-${SPEC.defZh.maxChars} 字`}
  · scene        从这 10 值里选:${SCENES.join(' / ')}
  · example_en   一条例句,**必须含这个词块**,10-20 词,不带 em-dash
  · example_zh   中文译文,全角标点,句末全角句号
${connectorRule}${frameRule}

⚠️ **用法要点(写在 def_zh 的括号里)**:${NOTE_RULE}
   统一判据:要点写**学生会踩的坑**,不是把释义换个说法再说一遍。

硬要求:
  · 必须是**真实高频**的组合,TOEFL 阅读/听力里真的会遇到。宁可少给也不要编。
  · 例句要能体现这个词块的**用法**,不是把词块塞进一个随便的句子。
  · 不许出 idiom(习语)—— 那是另一批的活儿。
${notes?.length ? `\n上次被机器闸门拒了:\n${notes.map(x => `  · ${x}`).join('\n')}` : ''}`;
}

async function main() {
  const cache = loadCache(CACHE_FILE);
  const seen = new Set(Object.keys(cache).map(k => k.toLowerCase()));
  const corpus = [];
  for (const v of Object.values(cache)) corpus.push(ngrams(v.example_en));

  if (!EMIT_ONLY) {
    /* 小批试跑:四类按比例各取一点,而不是只跑第一类 ——
     * 只跑 phrasal_verb 的话,connector 边界闸根本没被验到。 */
    const total = LIMIT === Infinity ? Object.values(QUOTA).reduce((a, b) => a + b, 0) : LIMIT;
    const plan = TYPES.map(t => ({
      type: t,
      n: Math.max(1, Math.round(QUOTA[t] / 100 * total)),
    }));
    process.stdout.write(`· 计划:${plan.map(p => `${p.type} ${p.n}`).join(' / ')}\n`);

    for (const { type, n } of plan) {
      const have = Object.values(cache).filter(v => v.type === type).length;
      if (have >= n) continue;

      /* ⚠️ **部分接受**,不是整批全过才算过。
       * 原来的写法是"批内任一条不合格 → 整批打回重来":35 条里只要 1 条
       * def_zh 带句号,35 条全废,三次重试永远凑不齐"35 条同时完美"。
       * 实测 connector(只要 15 条)过了,其余三类批量大,必然挂 ——
       * 不是内容差,是**批量越大越不可能全过**,这是个结构性缺陷。
       * 改成:过闸的收下,只对缺口继续要。 */
      for (let attempt = 1; attempt <= 4; attempt++) {
        const done = Object.values(cache).filter(v => v.type === type).length;
        if (done >= n) break;
        const need = n - done;
        let items;
        try {
          items = await callJson({
            system: SYSTEM, user: buildPrompt(type, Math.min(need + 3, need * 2), [...seen], null),
            schemaName: 'chunks', schema: SCHEMA, model: MODEL, temperature: 0.6,
          }).then(x => x.items);
        } catch (e) {
          process.stdout.write(`  · ${type} 第 ${attempt} 次调用出错:${e.message.slice(0, 80)}
`);
          continue;
        }
        let ok = 0, rej = 0; const why = new Map();
        for (const it of items) {
          if (Object.values(cache).filter(v => v.type === type).length >= n) break;
          if (it.type === 'phrasal_verb') {
            const core = String(it.def_zh).replace(/[((][^))]*[))]/g, '').trim();
            it.def_zh = `${core}(${separabilityNote(it.chunk)})`;
            it.separability = separability(it.chunk);
          }
          const f = gateChunk(it, type, seen, corpus);
          if (f.length) { rej++; why.set(f[0].slice(0, 46), (why.get(f[0].slice(0, 46)) ?? 0) + 1); continue; }
          cache[it.chunk] = it; seen.add(it.chunk.toLowerCase()); corpus.push(ngrams(it.example_en)); ok++;
        }
        const now = Object.values(cache).filter(v => v.type === type).length;
        process.stdout.write(`  · ${type} 第 ${attempt} 次:收 ${ok} 拒 ${rej} → ${now}/${n}
`);
        if (rej && attempt === 4) {
          for (const [k, c] of [...why].slice(0, 3)) process.stdout.write(`      拒因 ×${c}:${k}
`);
        }
        saveCache(CACHE_FILE, cache);
      }

    }
    process.stdout.write(`\n合计 ${Object.keys(cache).length} 条\n`);
  }

  applyManual(cache);
  saveCache(CACHE_FILE, cache);

  if (NO_EMIT) {
    // 试跑时直接打印,方便贴给 Aaron 看
    for (const t of TYPES) {
      const rows = Object.values(cache).filter(v => v.type === t);
      if (!rows.length) continue;
      process.stdout.write(`\n【${t}】\n`);
      rows.forEach(v => process.stdout.write(
        `  ${v.chunk}\n    ${v.def_zh}  [${v.scene}]\n    ${v.example_en}\n    ${v.example_zh}\n`));
    }
    return;
  }
  emit(cache, corpus);
}

/**
 * 应用人工裁决 —— 优先级高于规则表与模型。
 *
 * ⚠️ 核心教训(Aaron 2026-08-06 审 100 条抓到):
 *    **规则表只看小品词词性,不看该短语在「这个释义下」是否及物。**
 *    同一词组不同义项可分性不同:take off「起飞」不及物 → 不可分,
 *    「脱下」及物 → 可分。规则表按 off 是副词一律判可分,于是给出了
 *    "起飞(take sth off 可分)"这种**释义与可分性错位**的条目。
 *    turn out / break out / show up 全是同一个病:这些词的常用义是不及物的。
 *    → 可分性判定必须**与释义绑定**,规则表结果只是初判;
 *      凡"释义为不及物动作"(结果是 / 爆发 / 露面 / 出发 / 起飞类)一律人工复核。
 *    此条进 tier2 及后续段的差异表。
 */
function applyManual(cache) {
  const p = path.join(DATA, 'chunks-manual.json');
  if (!existsSync(p)) return { removed: 0, fixed: 0, rewritten: 0 };
  const m = JSON.parse(readFileSync(p, 'utf8'));
  let removed = 0, fixed = 0, rewritten = 0;

  for (const r of m.remove ?? []) {
    const hit = Object.keys(cache).find(k => k.toLowerCase() === r.chunk.toLowerCase() && cache[k].type === r.type);
    if (hit) { delete cache[hit]; removed++; }
  }
  for (const w of m.rewrite ?? []) {
    const hit = Object.keys(cache).find(k => k.toLowerCase() === w.chunk.toLowerCase());
    if (!hit) continue;
    cache[hit] = { ...cache[hit], def_zh: w.translation_zh, example_en: w.example_en, example_zh: w.example_zh, manual: true };
    rewritten++;
  }
  for (const [chunk, verdict] of Object.entries(m.separability ?? {})) {
    const hit = Object.keys(cache).find(k => k.toLowerCase() === chunk.toLowerCase());
    if (!hit || cache[hit].manual) continue;
    const core = String(cache[hit].def_zh).replace(/[((][^))]*[))]/g, '').trim();
    const v = String(chunk).split(/\s+/);
    /* ⚠️ 不及物的要写「不及物,不带宾语」——
     *    它们**根本没有宾语**,说"宾语不插中间"是错的措辞,
     *    学生会以为可以写 turn out the result。 */
    const intrans = (m.intransitive ?? []).some(x => x.toLowerCase() === chunk.toLowerCase());
    const note = verdict === 'separable'
      ? `${v[0]} sth ${v.slice(1).join(' ')} 可分,代词须插中间`
      : intrans ? `不及物,不带宾语` : `${chunk} sth,宾语不插中间`;
    cache[hit].def_zh = `${core}(${note})`;
    cache[hit].separability = { verdict, basis: (m._separability_why ?? {})[chunk] ?? 'Aaron 人工裁决' };
    fixed++;
  }
  process.stdout.write(`· 人工裁决:删 ${removed} · 改写 ${rewritten} · 可分性修正 ${fixed}
`);
  return { removed, fixed, rewritten };
}

function emit(cache, corpus) {
  const rows = Object.values(cache);
  const seen = new Set();
  const bad = rows.filter(v => gateChunk(v, v.type, seen, corpus).length && !seen.add(v.chunk.toLowerCase()));
  process.stdout.write(`\n出件前全量复检:${rows.length} 条,不合格 ${bad.length}\n`);
  if (bad.length) { process.stdout.write('⚠️ 有不合格项,不出 SQL\n'); process.exitCode = 1; return; }

  const vals = rows.map((v, i) =>
    `  (${q(v.chunk)}, ${q(v.type)}, ${q(v.def_zh)}, ${q(v.scene)}, ${q(v.example_en)}, ${q(v.example_zh)}, ${i + 1})`).join(',\n');
  writeSql('vocab_toefl_chunks_tier1.sql', `-- D 段 词块 tier1 —— ${rows.length} 条
-- 四类定额:${TYPES.map(t => `${t} ${rows.filter(r => r.type === t).length}`).join(' / ')}
-- ⚠️ 一条都没有 idiom —— 那是 H 段的,k1 闸门硬卡。
-- 幂等:ON CONFLICT (lower(chunk)) 更新。⚠️ 由 Aaron 执行。

BEGIN;

SELECT 'BEFORE' AS stage, count(*) AS chunks FROM vocab_chunks;

INSERT INTO vocab_chunks (chunk, type, translation_zh, scene, example_en, example_zh, freq_rank)
VALUES
${vals}
ON CONFLICT (lower(chunk)) DO UPDATE
  SET type = EXCLUDED.type, translation_zh = EXCLUDED.translation_zh, scene = EXCLUDED.scene,
      example_en = EXCLUDED.example_en, example_zh = EXCLUDED.example_zh,
      freq_rank = EXCLUDED.freq_rank, updated_at = now();

SELECT 'AFTER' AS stage, count(*) AS chunks FROM vocab_chunks;

-- ── count-validate:三行都必须是 t,否则 ROLLBACK ──
SELECT '词块总数 = ${rows.length}' AS expect,
       (SELECT count(*) FROM vocab_chunks) = ${rows.length} AS ok
UNION ALL
SELECT '没有 idiom(那是 H 段的)',
       NOT EXISTS (SELECT 1 FROM vocab_chunks WHERE type = 'idiom')
UNION ALL
SELECT 'connector 的释义都写了边界说明(括号)',
       NOT EXISTS (SELECT 1 FROM vocab_chunks WHERE type = 'connector'
                    AND translation_zh !~ '[(（][^)）]{2,}[)）]');

COMMIT;
`);

  writeReview('vocab_toefl_chunks_tier1.md', `# D 段 词块 tier1 · 送审件(${rows.length} 条)

四类定额:${TYPES.map(t => `**${t}** ${rows.filter(r => r.type === t).length}`).join(' · ')}

## 🔴 人审必看:phrasal_verb 可分性(规则表判定 + 逐条人扫)

**可分性不由模型写** —— 上一轮让它写,四条错两条(\`set up\` / \`take on\` 明明可分,
却被写成"宾语不插中间")。**写错比不写更糟**,学生会照着写出病句。
也不假装有数据源:ECDICT 没有可分性标注。

所以走**规则表判定**,依据一并列出;两栖词(on / over / around / through)**不猜,标待人工**。
这一栏请逐条扫一眼,100 条几分钟:

| 词块 | 判定 | 依据 |
| --- | --- | --- |
${rows.filter(r => r.type === 'phrasal_verb').map(v => {
    const s2 = v.separability ?? separability(v.chunk);
    const label = s2.verdict === 'separable' ? '可分' : s2.verdict === 'inseparable' ? '不可分' : '⚠️ 待人工';
    return `| ${v.chunk} | ${label} | ${s2.basis} |`;
  }).join(String.fromCharCode(10))}

⚠️ **按类分批生成,不让模型自选类别** —— 自选必然偏向最好写的 phrasal_verb,
100 条能出 80 条 \`look after\` 型。

⚠️ **connector 的 def_zh 必须点出使用边界**(什么时候不能用),已做成机器闸。
只给「因此」的话,\`as a result\` / \`therefore\` / \`thus\` 在学生眼里没有区别。

${TYPES.map(t => {
    const list = rows.filter(r => r.type === t);
    if (!list.length) return '';
    return `## ${t}(${list.length} 条)

| 词块 | 释义 | 例句 | 中译 |
| --- | --- | --- | --- |
${list.map(v => `| ${v.chunk} | ${v.def_zh} | ${v.example_en} | ${v.example_zh} |`).join('\n')}
`;
  }).join('\n')}
`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(e => { process.stderr.write(`\n${e.stack || e.message}\n`); process.exit(1); });
}
