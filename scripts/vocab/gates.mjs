/**
 * 词汇内容生成的六道机器闸门(独立成模块,便于离线单测)。
 *
 * 分层:
 *   g1..g4 逐句判(每条例句单独过)
 *   g5..g6 整词判(同一个词的三句放一起才看得出来)
 * 任一失败 → 整词重生成(不做单句补,单句补会破坏"三句互斥"的整体性)。
 *
 * 设计要点:
 *  · g4 的语料是**全局累积**的 —— 跨批次、跨词库都算,所以第 5 批不会
 *    重复第 1 批的句子。语料从落盘的 results JSON 载入。
 *  · 重合率定义写死在这里,别在调用方另算一套。
 */

import { SPEC } from './spec.mjs';

export const SCENES = [
  'academic', 'news', 'daily_life', 'work', 'science_tech',
  'health', 'environment', 'education', 'travel', 'culture',
];

const EM_DASHES = /[—–]/;          // — (em) 和 – (en)

/** 分词:只数含字母的 token,标点不算词。撇号缩写(don't)算一个词。 */
export function words(sentence) {
  return String(sentence).split(/\s+/).filter(t => /[A-Za-z]/.test(t));
}

/** 归一化 token 流,用于 n-gram:小写、剥非字母。 */
function normTokens(sentence) {
  return String(sentence).toLowerCase().split(/\s+/)
    .map(t => t.replace(/[^a-z']/g, ''))
    .filter(Boolean);
}

export function ngrams(sentence, n = 4) {
  const t = normTokens(sentence);
  const out = new Set();
  for (let i = 0; i + n <= t.length; i++) out.add(t.slice(i, i + n).join(' '));
  return out;
}

/** A 中有多大比例的 4-gram 在 B 里出现过。用于 g4(新句 vs 旧语料)。 */
export function overlapRatio(a, b) {
  if (!a.size) return 0;
  let hit = 0;
  for (const g of a) if (b.has(g)) hit++;
  return hit / a.size;
}

/** 对称重合率,用于 g6(同词两句之间,谁抄谁都算)。 */
export function symmetricOverlap(a, b) {
  if (!a.size || !b.size) return 0;
  let hit = 0;
  for (const g of a) if (b.has(g)) hit++;
  return hit / Math.min(a.size, b.size);
}

/** 屈折形推导:优先用 ECDICT 的 exchange 表,查不到再落后缀规则。 */
export function inflectionsOf(headword, table = {}) {
  const hw = headword.toLowerCase();
  const forms = new Set([hw, ...(table[hw] || [])]);
  const add = f => forms.add(f);
  // 后缀兜底(表里没有的词才用得上,故意宽松:g1 是"在不在",宁松勿严)
  add(hw + 's'); add(hw + 'es'); add(hw + 'ed'); add(hw + 'd'); add(hw + 'ing');
  add(hw + 'ly'); add(hw + 'er'); add(hw + 'est');
  if (/[^aeiou]y$/.test(hw)) {
    const stem = hw.slice(0, -1);
    add(stem + 'ies'); add(stem + 'ied'); add(stem + 'ier'); add(stem + 'iest'); add(stem + 'ily');
  }
  if (/e$/.test(hw)) {
    const stem = hw.slice(0, -1);
    add(stem + 'ing'); add(stem + 'ed'); add(stem + 'es'); add(stem + 'er'); add(stem + 'est');
  }
  if (/[^aeiou][aeiou][^aeiouwxy]$/.test(hw)) {           // 重读闭音节双写:plan→planning
    const dbl = hw + hw.slice(-1);
    add(dbl + 'ing'); add(dbl + 'ed'); add(dbl + 'er'); add(dbl + 'est');
  }
  return forms;
}

/* ── 逐句闸门 ───────────────────────────────────────────── */

/** g1 专用分词:**先按连字符/斜杠切开再剥非字母**。
 *  ⚠️ 不能复用 normTokens —— 它直接把 '-' 当噪声剥掉,
 *     "self-defense" 会被粘成 "selfdefense",于是 defense 这种词
 *     三次生成全被误判成"目标词缺席"(2026-08-03 试跑实际踩到)。
 *     连字符复合词里出现目标词是**合法用法**,必须算命中。 */
/* ⚠️ 所有格要**两种都剥**:`student's` 剥 `'s`,`grandparents'`(复数所有格)只剩一个撇号。
 * 2026-08-10 实测:headword `grandparents` + 搭配 "grandparents' house" 被 g13 判成
 * 「与目标词同根,是同义反复」—— 但那**就是目标词本身的所有格**,不是另一个同根词。
 * 对照组 "student's book" + `student` 是过的,差别只在那个 s。
 * 这已经是"文本包含判据必须先形态归一"这条踩的第四次了(屈折 / 虚位主语 / 物主代词 / 复数所有格)。
 * ⚠️ 方向:剥得更干净 → token 更容易匹配上 headword。
 *    对 g1/g7(匹配上=放行)是放宽,对 g12(匹配上=判循环定义)是收紧 ——
 *    收紧那一侧是对的:释义里写 "the word's ..." 本来就是循环定义。改完照第七条跑了全量回归。 */
function targetTokens(sentence) {
  // 弯引号归一:实测 layman’s terms 里的 ’ 不是 ',尾部 's 剥不掉,
  // token 停在 "layman’s" 上,g13 认不出它就是 headword 本身。
  const s = String(sentence).toLowerCase().replace(/[’‘]/g, "'");
  // ① 按连字符/斜杠切开:让 "self-defense" 里的 defense 命中 defense
  const split = s.split(/[\s\-–—/]+/)
    .map(t => t.replace(/[^a-z']/g, ''))
    .filter(Boolean)
    .map(t => t.replace(/'s$|'$/, ''));
  /* ② 只按空白切、**保留连字符**:让 "well-being" 整体命中 headword "well-being"。
   * ⚠️ 只有 ① 会漏掉带连字符的 headword —— 句子里的 well-being 被切成 well+being,
   *    永远匹配不上 "well-being" 本身。全池 18 个连字符词曾因此 100% 生成失败。
   *    两套 token 都要,缺一不可:①管"复合词里含目标词",②管"目标词本身是复合词"。 */
  const whole = s.split(/\s+/)
    .map(t => t.replace(/^[^a-z]+|[^a-z]+$/g, ''))   // 只剥两端标点,中间连字符留着
    .filter(Boolean)
    .map(t => t.replace(/'s$|'$/, ''));
  return [...split, ...whole];
}

/**
 * 词形命中判定(g1 与 g7 共用)。
 *
 * 除了屈折形表和后缀规则,还放行**派生形**:token 以 headword 打头、
 * 且多出来的尾巴不超过 4 个字母。
 * ⚠️ 这条是补 2026-08-03 实战漏洞:inflation 的搭配 "inflationary pressures"
 *    被 g7 判成"同义词不是搭配"——但 inflationary 就是 inflation 的派生形容词,
 *    属于误杀。屈折表和 -s/-ed/-ing 那套后缀规则覆盖不到 -ary/-al/-ous 这类派生后缀。
 * 限定 headword 至少 5 个字母,避免短词过度放行(band → bandit 这种)。
 */
/**
 * token 是不是 headword 的屈折形/派生形。
 *
 * ⚠️ `strict` 存在的理由 —— **同一个判据在不同闸门里方向是反的**:
 *   · g1「句中有没有目标词」:判成"是" → **放行**。宽松只会多放行,代价可接受,
 *     所以用"前缀 + ≤4 个字母尾巴"兜底(inflectionsOf 的注释写的"宁松勿严"就是这个意思)。
 *   · g12「def_en 有没有循环定义」:判成"是" → **拒绝**。宽松在这里直接变成**误伤**。
 *
 * 2026-08-10 实测的误伤:`miner` 的释义 "A person who works in extracting minerals
 * from the earth." 被判循环 —— `minerals` 只是**恰好以 miner 开头**,和 miner 是两个词。
 * 这个词因此三轮重试全废、始终没有内容。
 *
 * → strict 只认屈折表和标准后缀(inflectionsOf 给的那套),不认前缀兜底。
 */
function matchesForm(token, headword, forms, strict = false) {
  if (forms.has(token)) return true;
  if (strict) return false;
  if (headword.length >= 5 && token.length > headword.length && token.startsWith(headword)) {
    const tail = token.slice(headword.length);
    if (tail.length <= 4 && /^[a-z]+$/.test(tail)) return true;
  }
  return false;
}

/** g1 目标词存在:句中出现 headword 或其屈折形/派生形。 */
/**
 * 短语词条(headword 带空格,如 `inasmuch as`)。
 *
 * ⚠️ 由来(2026-08-14):词表里混进了**不能独立成词**的半截固定搭配 ——
 *    `inasmuch` 只以 `inasmuch as` 出现,给半截词写释义本身就是矛盾的,
 *    所以要原地改成短语词条。改完才发现闸门全是**按单个 token 比对**的:
 *    句子里再怎么写 "inasmuch as",也没有任何一个 token 等于 "inasmuch as",
 *    g1 会一口咬定"句中找不到目标词",g7 同理。
 *    —— 这不是内容的问题,是闸门从来没见过短语词条。
 * 判据换成**词序列包含**:把句子和短语都归一成 token 数组,比子序列。
 *    (⚠️ 不能直接 `sentence.includes(hw)` —— 标点、大小写、连续空格都会漏,
 *     text-contains-needs-normalization 那条已经栽过三次。)
 */
export const isPhraseHeadword = hw => /\s/.test(String(hw).trim());

function phrasePresent(text, phrase, table = {}) {
  /* 句子侧分词。每个 token 附带"它后面是不是有句读标点"。
     ⚠️ 这一位是用来拦 "He took care, of course, to lock the door." 的:
        剥完标点之后 token 序列**确实**是 took care of,字面完全命中,
        但那是「took care」+「of course」两个成分,不是 take care of。
        固定短语内部不会被逗号/分号/句号切开 —— 这是**表层可查**的。 */
  const hay = String(text).toLowerCase().replace(/[’‘]/g, "'").split(/[\s\-–—/]+/)
    .map(raw => ({
      t: raw.replace(/[^a-z']/g, '').replace(/'s$|'$/, ''),
      /* ⚠️ 复数所有格 "patients'" 末位是 s' 不是 's —— 只判 's$ 的话
         'take sb's temperature' + "take patients' temperature" 会被误拦。
         同一处形态归一已经栽过四次(屈折/虚位主语/物主/复数所有格),两种都判。 */
      poss: /'s$|s'$/.test(raw.replace(/[^a-z']/g, '')),
      brk: /[,;:.!?]$/.test(raw),
    })).filter(x => x.t);

  /**
   * ── 词条侧:槽位 / 择一 / 可选 ──────────────────────────────────
   * 教材词表里 50 个带元变量的词条不是同一类东西,实测分四种:
   *   37 纯槽位      drive sb. crazy / try one's best
   *    5 动词槽位    succeed in doing sth —— 句子里是 "succeeded in **passing** the exam"
   *    4 槽位带斜杠  fight against sb/sth —— sb 和 sth 是**同一个**槽位的两种写法
   *    4 括号可选    run low (on sth) —— 括号里的部分可有可无
   *
   * ⚠️ 词条侧**不能按 / 切分**(句子侧可以)。按 / 切的话 "sb/sth" 会变成两个槽位,
   *    要求句子里连着出现两个名词性成分 —— 那 4 个词永远匹配不上。
   * ⚠️ 槽位是**精确匹配,不是放宽**,四类各有各的可填集合:
   *      NOM  名词性成分,1~3 token
   *      POSS 1~2 token 且**末位是所有格**(容 "the child's")
   *      REFL 反身代词闭集
   *      GER  -ing 形式,单个(doing sth 里的 doing)
   *      VERB 单个 token(do sth 里的 do)—— 前后都有字面量夹着,过宽的风险有限
   *    松成"含这几个实词就算"的话,\`fro\` 那种病句会重演,而这次是 50 个词。
   */
  const POSSESSIVE = new Set(['my', 'your', 'his', 'her', 'its', 'our', 'their', 'ones']);
  const REFLEXIVE = new Set(['myself', 'yourself', 'himself', 'herself', 'itself',
    'ourselves', 'yourselves', 'themselves', 'oneself']);
  const NOM_MAX = 3;

  const bare = w => w.toLowerCase().replace(/[^a-z'\/]/g, '');
  function kindOf(w) {
    const b = bare(w);
    if (!b) return null;
    /* sb/sth 这种:斜杠两侧都是名词性元变量 → **一个** NOM 槽位 */
    if (/^(sb|sth|sw)(\/(sb|sth|sw))+$/.test(b)) return { slot: 'NOM' };
    if (b === "one's" || b === "sb's" || b === "sth's") return { slot: 'POSS' };
    if (b === 'oneself') return { slot: 'REFL' };
    if (/^(sb|sth|sw)$/.test(b)) return { slot: 'NOM' };
    if (b === 'doing') return { slot: 'GER' };
    if (b === 'do') return { slot: 'VERB' };
    /* in/into、with/to、on/upon:字面量的两种写法,任一命中即可 */
    /* ⚠️ 字面量要和**句子侧用同一套归一**:句子侧 token 会剥掉尾部 's
       (what's → what),词条侧不剥的话 "what's more" 永远匹配不上自己的例句。
       2026-08-19 全量回归就是这么抓到的 —— 16,616 词里坏 1 个。
       ⚠️ 但**槽位识别必须在剥之前做**:one's / sb's 剥完就成了 one / sb,
          物主槽位会被误认成名词槽位。所以顺序是:先认槽位,再剥。 */
    const strip = x => x.replace(/'s$|'$/, '');
    if (b.includes('/')) return { alts: b.split('/').filter(Boolean).map(strip) };
    return { lit: strip(b) };
  }

  const parts = [];
  let optDepth = 0;
  for (const raw of String(phrase).toLowerCase().replace(/[’‘]/g, "'").split(/[\s\-–—]+/)) {
    if (!raw) continue;
    const opensHere = (raw.match(/\(/g) || []).length;
    const closesHere = (raw.match(/\)/g) || []).length;
    optDepth += opensHere;
    const k = kindOf(raw);
    /* 括号里的成分**可有可无** —— "run low (on sth)" 的核心是 run low。
       ⚠️ 逐个标可选(不是整组全有或全无):对这几个词来说效果一样,而且实现里
          不需要再维护一层分组状态,少一处能写错的地方。 */
    if (k) parts.push({ ...k, optional: optDepth > 0 });
    optDepth = Math.max(0, optDepth - closesHere);
  }
  if (!parts.length) return false;
  const forms = parts.map(p => p.lit ? inflectionsOf(p.lit, table)
    : p.alts ? p.alts.map(a => inflectionsOf(a, table)) : null);

  function match(i, j) {
    if (j >= parts.length) return true;
    const p = parts[j];
    /* 可选成分:先试"跳过它" —— 跳过成功就不用再往下匹配 */
    if (p.optional && match(i, j + 1)) return true;
    if (i >= hay.length) return false;
    const brkBad = k => j < parts.length - 1 && hay[k].brk;

    if (p.lit) {
      const h = hay[i].t;
      if (h !== p.lit && !forms[j].has(h)) return false;
      return brkBad(i) ? false : match(i + 1, j + 1);
    }
    if (p.alts) {
      const h = hay[i].t;
      if (!p.alts.includes(h) && !forms[j].some(f => f.has(h))) return false;
      return brkBad(i) ? false : match(i + 1, j + 1);
    }
    if (p.slot === 'POSS') {
      /* 吃 1~2 个,**末位必须是所有格**:容 "her best" 也容 "the child's temperature",
         但不容 "the best"(末位不是所有格)。判据是"末位是",不是"含有"。 */
      for (let n = 1; n <= 2 && i + n <= hay.length; n++) {
        const last = hay[i + n - 1];
        if (!(POSSESSIVE.has(last.t) || last.poss)) continue;
        let bad = false;
        for (let k = i; k < i + n; k++) if (brkBad(k)) { bad = true; break; }
        if (bad) break;
        if (match(i + n, j + 1)) return true;
      }
      return false;
    }
    if (p.slot === 'REFL') {
      if (!REFLEXIVE.has(hay[i].t)) return false;
      return brkBad(i) ? false : match(i + 1, j + 1);
    }
    if (p.slot === 'GER') {
      if (!/ing$/.test(hay[i].t)) return false;      // doing → passing / cleaning
      return brkBad(i) ? false : match(i + 1, j + 1);
    }
    if (p.slot === 'VERB') {
      return brkBad(i) ? false : match(i + 1, j + 1);  // 单个任意 token,前后有字面量夹着
    }
    /* NOM:吃 1~NOM_MAX 个。⚠️ 上界必须有 —— 没上界的话
       "He drives a car and everyone is crazy about it" 也会被吃成命中。 */
    for (let n = 1; n <= NOM_MAX && i + n <= hay.length; n++) {
      let bad = false;
      for (let k = i; k < i + n; k++) if (brkBad(k)) { bad = true; break; }
      if (bad) break;
      if (match(i + n, j + 1)) return true;
    }
    return false;
  }

  for (let i = 0; i < hay.length; i++) if (match(i, 0)) return true;
  return false;
}



export function g1_targetPresent(sentence, headword, table) {
  const hw = headword.toLowerCase();
  if (isPhraseHeadword(hw)) {
    return phrasePresent(sentence, hw, table) ? null
      : `g1 目标词缺席:句中找不到短语 "${headword}"(短语词条必须整体出现,不能只用其中半截)`;
  }
  const forms = inflectionsOf(hw, table);
  const hit = targetTokens(sentence).some(t => matchesForm(t, hw, forms));
  return hit ? null : `g1 目标词缺席:句中找不到 "${headword}" 或其屈折形`;
}

/** 按难度档的句长区间。
 *  由来:统一 8-16 时实测三档语言复杂度几乎没差别 ——
 *  平均词数 10.0 / 10.3 / 10.1,长词占比反而 29.3% → 25.5% 递减。
 *  长度约束把句法复杂度压平了,分档等于只是个标签,故按档放开。
 *  ⚠️ 只对**新生成**生效;回溯复检存量内容时仍用 [8,16],
 *     否则会把已验收的句子全判成不合格。 */
/* 2026-08-05 调:B2 下限 10→9、C1 下限 12→10。
 * 放量实测 4273 词时,失败原因里 47/67 是 g2,且几乎全是「9 词,超出 10-16」——
 * 模型自然写出来就是 8-9 词,硬顶下限只能靠重试凑长度,凑出来的句子还注水。
 * 句子该多长由内容决定,不该为了填档位注水。上限不动。
 * ⚠️ 已生成的内容不回溯(Aaron 定),本次调整只对之后的生成生效。 */
/* ⚠️ 数值在 spec.mjs,这里只是转出去。别在这里写字面量(第四条规矩)。 */
export const LENGTH_BY_TIER = SPEC.example.lengthByTier;
export const LEGACY_LENGTH = SPEC.example.legacyLength;

/** g2 句长。range 不传则用统一的 8-16(存量口径)。 */
export function g2_length(sentence, range = LEGACY_LENGTH) {
  const [lo, hi] = range;
  const n = words(sentence).length;
  return (n >= lo && n <= hi) ? null : `g2 长度 ${n} 词,超出 ${lo}-${hi}`;
}

/** g3 em-dash 扫描(例句/译文/释义全扫,不只例句)。 */
export function g3_noEmDash(...texts) {
  for (const t of texts) {
    if (t && EM_DASHES.test(t)) return `g3 含 em-dash/en-dash:"${String(t).slice(0, 40)}"`;
  }
  return null;
}

/** g4 全局 4-gram 去重:与已生成语料重合 >50% 拒。 */
export function g4_globalDedup(sentence, corpusNgramSets, threshold = SPEC.dedup.globalMax) {
  const a = ngrams(sentence);
  if (!a.size) return null;                      // 太短的句子交给 g2 管
  for (const b of corpusNgramSets) {
    const r = overlapRatio(a, b);
    if (r > threshold) return `g4 与已生成句 4-gram 重合 ${(r * 100).toFixed(0)}% (>50%)`;
  }
  return null;
}

/* ── 整词闸门 ───────────────────────────────────────────── */

/** g5 同词三句互斥:scene 三值互不相同且都在枚举内;collocation 互不相同。 */
export function g5_mutualExclusive(examples) {
  if (!Array.isArray(examples) || examples.length !== 3) {
    return `g5 例句数量 ${examples?.length ?? 0},必须正好 3 条`;
  }
  const scenes = examples.map(e => String(e.scene || '').trim());
  for (const s of scenes) {
    if (!SCENES.includes(s)) return `g5 scene "${s}" 不在枚举内`;
  }
  if (new Set(scenes).size !== 3) return `g5 三句 scene 重复:${scenes.join(' / ')}`;

  const cols = examples.map(e => String(e.collocation || '').trim().toLowerCase());
  if (cols.some(c => !c)) return 'g5 有 collocation 为空';
  if (new Set(cols).size !== 3) return `g5 三句 collocation 重复:${cols.join(' / ')}`;
  return null;
}

/** g7 搭配必须真是搭配:collocation 里要含目标词或其屈折形。
 *  拦的是"拿同义词冒充搭配" —— 试跑时 attorney 的搭配写成了 `lawyer`,
 *  那不是搭配,例句里也就无从体现用法。
 *  `self-defense`、`concerned about`、`participants in a study` 都能过。 */
export function g7_collocationContainsWord(examples, headword, table) {
  const hw = headword.toLowerCase();
  const forms = inflectionsOf(hw, table);
  for (let i = 0; i < examples.length; i++) {
    const c = String(examples[i].collocation || '');
    // 与 g1 共用同一套分词(含"保留连字符"的那一路),否则 well-being 这类
    // headword 的搭配「student well-being」会被判成"不含目标词"。
    /* 短语词条:搭配里必须含**整个短语**,不能只含半截(见 g1 的 isPhraseHeadword 注释) */
    if (isPhraseHeadword(hw)) {
      if (!phrasePresent(c, hw, table)) {
        return `g7 第${i + 1}条搭配 "${c}" 里没有完整短语 "${headword}"`;
      }
      continue;
    }
    const toks = targetTokens(c);
    if (!toks.some(t => matchesForm(t, hw, forms))) {
      return `g7 第${i + 1}条搭配 "${c}" 里没有目标词 "${headword}",是同义词不是搭配`;
    }
  }
  return null;
}

/* ── g13 搭配不得同根同义反复 ──────────────────────────────────────────
 * 由来:Aaron 真机审 16 词抽样时抓到 melodious 的搭配写成 "melodious melodies"
 * —— g7 只要求"搭配里含目标词",这条**过得了 g7**,但它是同义反复:
 * 学生看不到这个词跟别的词怎么搭,只看到它跟自己搭。
 *
 * 判据:搭配里除了目标词本身(及其屈折/派生形)之外,不许再出现**同根**的另一个词。
 * 同根 = 该 token 以 headword 的词干打头。
 *
 * ⚠️ 为什么用"剥后缀求词干"而不是"最长公共前缀":
 *    公共前缀会被 inter- / trans- / pre- / con- 这类**共享前缀**骗到 ——
 *    international vs interest 公共前缀 "inter" 有 5 位,会误判成同根。
 *    剥后缀是从词尾还原词根,不吃这个亏(international -> internation,
 *    interest 不以它打头)。
 * ⚠️ 词干短于 5 位就整条跳过。read(4 位)会把 ready 误判成同根,
 *    宁可漏判也不误杀 —— 这个闸门只在证据确凿时才拦。
 */
const DERIV_SUFFIXES = [
  'ization', 'isation', 'ication', 'ousness', 'iveness', 'ability', 'ibility',
  'ational', 'ically', 'iously', 'ously', 'ation', 'ition', 'ement', 'ities',
  'ility', 'ively', 'ative', 'itive', 'ious', 'eous', 'uous', 'ness', 'ment',
  'tion', 'sion', 'ance', 'ence', 'ancy', 'ency', 'ical', 'able', 'ible',
  'ship', 'hood', 'ings', 'ers', 'ing', 'ist', 'ism', 'ity', 'ify', 'ize',
  'ise', 'ate', 'ary', 'ory', 'ive', 'ial', 'ual', 'ous', 'ful', 'age',
  'ies', 'ied', 'al', 'ic', 'ly', 'er', 'or', 'ed', 'es', 'y', 's',
];
export function stemOf(word) {
  const w = String(word).toLowerCase().replace(/[^a-z]/g, '');
  for (const suf of DERIV_SUFFIXES) {
    if (w.length - suf.length >= 5 && w.endsWith(suf)) return w.slice(0, w.length - suf.length);
  }
  return w;
}
export function g13_collocationNotSameRoot(examples, headword, table) {
  const hw = headword.toLowerCase();
  /* 短语词条跳过:"同根同义反复"是给单词定义的(melodious melodies)。
     对 "inasmuch as" 求词干会得到 "inasmuchas" 这种拼接产物,判什么都没意义 ——
     与其硬判,不如明写这条不适用(第九条:分不清就别硬判)。 */
  if (isPhraseHeadword(hw)) return null;
  const forms = inflectionsOf(hw, table);
  const stem = stemOf(hw);
  if (stem.length < 5) return null;                 // 词干太短,证据不足,不拦
  for (let i = 0; i < examples.length; i++) {
    const c = String(examples[i].collocation || '');
    /* ⚠️ 只用"按连字符切开"那一路分词,不用 targetTokens 的保留连字符那一路。
     * 实测:nutrient-rich foods / tamper-proof packaging / starch-based products
     * 这些都是好搭配,但整体 token "nutrient-rich" 既不算 headword 的屈折形
     * (尾巴带连字符、超 4 位),又以词干打头 —— 会被误判成同根同义反复。
     * 拆开后 "nutrient" 命中 headword 被跳过、"rich" 无关,才是对的口径。
     * 12 条初扫里 9 条是这个误报。 */
    const toks = String(c).toLowerCase().replace(/[’‘]/g, "'")
      .split(/[\s\-–—/]+/).map(t => t.replace(/[^a-z']/g, '').replace(/'s$|'$/, '')).filter(Boolean);
    for (const t of new Set(toks)) {
      if (t.length < 4) continue;
      if (matchesForm(t, hw, forms)) continue;      // 这就是 g7 要求的目标词本身
      if (t.startsWith(stem)) {
        return `g13 第${i + 1}条搭配 "${c}" 里的 "${t}" 与目标词 "${headword}" 同根,是同义反复不是搭配`;
      }
    }
  }
  return null;
}

/** g8 中文译文标点规范:必须全角句末,且中文字符后不许跟半角标点。
 *  试跑实测 attorney 三条译文全用半角 `.` 收尾(12 全角 / 3 半角混排)。
 *  只在**中文字符紧跟**半角标点时判违规,所以 "3.14"、"U.S." 不会误伤。 */
const CJK_THEN_HALF = /[一-鿿][,.!?;:]/;
export function g8_zhPunctuation(examples) {
  for (let i = 0; i < examples.length; i++) {
    const t = String(examples[i].translation_zh || '').trim();
    if (!t) return `g8 第${i + 1}条译文为空`;
    if (!/[。！？]$/.test(t)) {
      return `g8 第${i + 1}条译文句末不是全角句号:"…${t.slice(-8)}"`;
    }
    if (CJK_THEN_HALF.test(t)) {
      return `g8 第${i + 1}条译文中文里混了半角标点:"${t.slice(0, 24)}"`;
    }
  }
  return null;
}

/** g9 三句首词互异 —— 防同一个句式模子套三遍。
 *  ⚠️ 原方案是"开头两个词不得同形",但实测拦不住:
 *     "Concerned parents often…" vs "Concerned citizens organized…"
 *     两句的双词前缀是不同的("concerned parents" ≠ "concerned citizens"),
 *     真正雷同的是**首词**。所以收紧成首词两两互异。
 *  这条同时天然覆盖了 prompt 里"不能三句都以 The/A 开头"。 */
export function g9_distinctOpeners(examples) {
  const firsts = examples.map(e =>
    String(e.sentence || '').trim().split(/\s+/)[0]?.toLowerCase().replace(/[^a-z']/g, '') || '');
  for (let i = 0; i < firsts.length; i++) {
    for (let j = i + 1; j < firsts.length; j++) {
      if (firsts[i] && firsts[i] === firsts[j]) {
        return `g9 第${i + 1}句与第${j + 1}句首词相同("${firsts[i]}"),句式雷同`;
      }
    }
  }
  return null;
}

/**
 * ⚠️⚠️ 长度比版本的 g11 —— **实测失败,已从 runAllGates 摘除,不要再接回去**。
 *
 * 原想用"中文字数 / 英文词数"当零成本代理指标判增译。198 词回溯实测结果是
 * **两个方向都不成立**:
 *   · 假阳性:incredible「许多艺术家拥有令人难以置信的才能,激励着他人。」比值 2.63 被判增译,
 *     但它是忠实翻译 —— 中文只是把 incredible 译得长。
 *   · 假阴性:真正的增译 packed「昨晚,观众席座无虚席,**演唱会非常成功**」
 *     (后半句英文里没有)比值只有 2.00,稳稳低于阈值,照样放行。
 * 命中 2 个全是假阳性,真样本 0 个。这种闸门比没有更糟 —— 它给人"已经查过"的错觉。
 *
 * 真正的 g11 改由 verify-content.mjs 的校验调用做(与 g10 合并进同一次调用,
 * 边际成本为零)。此函数仅保留供回溯诊断参考,不参与放行判定。
 */
export function g11_lengthRatioDiagnostic(examples, maxRatio = 2.6, minRatio = 0.8) {
  for (let i = 0; i < examples.length; i++) {
    const en = words(examples[i].sentence).length;
    const zh = String(examples[i].translation_zh || '').replace(/[^一-鿿]/g, '').length;
    if (!en) continue;
    const r = zh / en;
    if (r > maxRatio) {
      return `g11 第${i + 1}条译文疑似增译:${en} 个英文词译出 ${zh} 个汉字(比值 ${r.toFixed(2)} > ${maxRatio})`;
    }
    if (r < minRatio) {
      return `g11 第${i + 1}条译文疑似漏译:${en} 个英文词只译出 ${zh} 个汉字(比值 ${r.toFixed(2)} < ${minRatio})`;
    }
  }
  return null;
}

/**
 * def_en 禁循环定义:英文释义里不许出现目标词本身或其屈折/派生形。
 * 实测捕获:outrageous 的 def_en 是
 *   "Extremely shocking or bad; outrageous behavior is unacceptable."
 * 拿 outrageous 解释 outrageous,对学习者零信息量。纯机械判定,零成本。
 */
/**
 * g14 占位符不许进 IPA。
 *
 * ⚠️ 由来(2026-08-19):`drive sb. crazy` 这类词条里的 sb./sth./one's 是**词典记号**,
 *    不是词。模型会把它们当单词转写:
 *        argue with sb  → /ˈɑːrɡ.ju wɪð ˈsʌb./     把 sb 念成 "sub"
 *        add sth to sth → /æd sʌmθɪŋ tu sʌmθɪŋ/    把 sth 念成 "something"
 *    用户在词卡上看到 /ˈsʌb./ 就是一串没有意义的音。
 *    提示词里写了"IPA 不含占位符"它照样犯 —— 所以要一道能**自愈**的闸:
 *    判失败会带着原因重生成,而不是等人眼在几十条里挑。
 * ⚠️ 只对**含占位符的词条**生效。别的词条不受影响 —— 比如 subject 的
 *    /ˈsʌb.dʒɪkt/ 本来就该有 sʌb,对它开这条就是误伤。
 */
/**
 * ⚠️ 这道门只管**读不出来的缩写**(sb / sth / sw),不管 one's / oneself / doing。
 *
 * 一开始两类一起卡,连挂 6 个词、三轮重试全撞同一堵墙,以为是模型不听提示词 ——
 * 其实是判据定错了:sb 是词典缩写,没人把它念成 /'sʌb/;
 * 而 one's 是真实词形,"pull one's weight" 读出来就是 /pʊl wʌnz weɪt/,
 * 纸质词典的成语条目也是这么标的。
 * 模型连着三次给同一个答案时,先怀疑判据,别先怀疑模型。
 */
const PLACEHOLDER_HW = /\b(sb|sth|sw)\b|sb\.|sth\.|sb's|\(/i;
const PLACEHOLDER_IPA = /s\s*ʌ\s*b|sʌmθ|\bsb\b|\bsth\b/i;
export function g14_ipaNoPlaceholder(ipa, headword) {
  if (!PLACEHOLDER_HW.test(String(headword))) return null;
  if (!ipa) return null;
  return PLACEHOLDER_IPA.test(String(ipa))
    ? `g14 ipa 里把占位符当成词读了("${ipa}")—— sb./sth. 是词典缩写不是词,IPA 只给实词部分`
    : null;
}

export function g12_defEnNotCircular(defEn, headword, table) {
  const hw = String(headword).toLowerCase();
  /* 短语词条同样要判循环:def_en 里出现 "to and fro" 就是拿自己解释自己。
     ⚠️ 不加这个分支的话,g12 对短语词条**恒放行** —— 单 token 永远等不上带空格的
     词条,判据不是"没问题",是根本没判。刚在音频 SQL 那边栽过同型的空断言。 */
  if (isPhraseHeadword(hw)) {
    return phrasePresent(defEn || '', hw, table)
      ? `def_en 循环定义:释义里出现了目标短语本身("${headword}")` : null;
  }
  const forms = inflectionsOf(hw, table);
  const toks = String(defEn || '').toLowerCase().split(/[\s\-–—/]+/)
    .map(t => t.replace(/[^a-z']/g, '')).filter(Boolean).map(t => t.replace(/'s$|'$/, ''));
  /* strict:这道门判"是"就是拒绝,不能用 g1 那套宽松前缀兜底(见 matchesForm 注释)。 */
  const hit = toks.find(t => matchesForm(t, hw, forms, true));
  return hit ? `def_en 循环定义:释义里出现了目标词本身("${hit}")` : null;
}

/**
 * def_zh 体裁检测 —— 判"这是词典释义还是解释句"。
 *
 * 由来:前两轮只查了句号和长度,漏掉一批**没有句号、长度也不超**的短解释句,
 * 抽样 16 词里命中 7 个。这类残留靠长度判不出来,只能靠**解释性标记词**:
 *   colonial ❌「与殖民地相关的」      ✅ 殖民的；殖民地的
 *   minimize ❌「使某物变得最小」      ✅ 使最小化；尽量减少
 *   survivor ❌「在灾难中存活下来的人」 ✅ 幸存者
 * 判据:命中任一标记词即视为解释句。标记词表可继续补。
 */
export const EXPLANATORY_MARKERS = [
  '某物', '某人', '某事', '某种',
  '的行为', '的状态', '的人', '的过程', '的性质', '的能力', '的东西', '的事物', '的方式',
  '相关的', '有关的',
  '一种', '一组', '一系列', '一个',
  '通常', '尤其', '特别是', '例如', '是指', '指的是', '用于',
];

/** 返回问题描述,合格返回 null。与 repair-defzh 的 shapeOk 共用同一套判据。 */
export function defZhShapeProblem(defZh) {
  const s = String(defZh || '').trim();
  if (!s) return 'def_zh 为空';
  if (/[。.!?！？]/.test(s)) return 'def_zh 写成了句子(含句号)';
  /* ⚠️ 逗号/顿号当分隔符是**绕过体裁闸的后门**(2026-08-05 Aaron 查 monochrome 时暴露)。
   *    「单色，单色图像」在闸门眼里是**一个** 7 字义项,于是:
   *      ① ≤2 义项那条约束形同虚设(想塞几个塞几个)
   *      ② 双义统计把它算成单义
   *      ③ 前端 optionText 只按 '；' 切,选项里会整个显示「推，挤」
   *    实测全池 43 条(1.0%),而且多数本身就是同义堆砌(推/挤、拖/拉、抛弃/放弃)。
   *    分隔符只能是全角分号 —— 这是规格,闸门必须照着卡。 */
  if (/[，,、]/.test(s)) return `def_zh 用了逗号/顿号当分隔符:「${s}」(分隔符只能是「${SPEC.defZh.sep}」)`;
  const parts = s.split(SPEC.defZh.sep);
  if (parts.length > SPEC.defZh.maxSenses) return `def_zh 有 ${parts.length} 个义项,最多 ${SPEC.defZh.maxSenses} 个`;
  /* ⚠️ 2026-08-05 收紧 12 → 8。prompt 里定的规格一直是"每义项 2-8 个汉字",
   *    检测器却放到 12,中间这一档漏网:honor「尊敬或对成就或品质的认可」、
   *    diagnose「通过检查来识别疾病或问题」—— 没踩任何标记词、也没句号,
   *    照样是解释句不是释义。阈值必须跟规格同一个数,不然就是自己给自己开后门。
   *    实测全池只有 8 个词落在 9-12 这一档(0.2%),收紧不会误伤。 */
  /* ⚠️ 下限判据补上(2026-08-05)。原来只卡上限、不卡下限,而规格写的是区间 ——
   *    又是"判据没照规格写全"(第四条规矩的同型问题)。
   *    两端都从 SPEC 取数,不写字面量。 */
  const tooShort = parts.find(p => p.trim().length < SPEC.defZh.minChars);
  if (tooShort) return `def_zh 义项过短(${tooShort.trim().length} 字,规格 ${SPEC.defZh.minChars}-${SPEC.defZh.maxChars}):「${tooShort.trim()}」`;
  const tooLong = parts.find(p => p.trim().length > SPEC.defZh.maxChars);
  if (tooLong) return `def_zh 义项过长(${tooLong.trim().length} 字,规格 ${SPEC.defZh.minChars}-${SPEC.defZh.maxChars}):「${tooLong.trim()}」`;
  /* 标记词只在**长片段**里才说明是解释句。
   * ⚠️ 短义项本身就等于标记词是合法的:notably「显著地；尤其」、customarily「通常；一般」——
   *    「尤其」「通常」正是这些副词的标准释义。不加这条长度前提会把它们全判成解释句(实测误报)。
   *    判据:逐个义项看,只有该义项**超过 4 字**且含标记词,才算解释句。 */
  const marker = parts
    .map(p => p.trim())
    .filter(p => p.length > 4)
    .flatMap(p => EXPLANATORY_MARKERS.filter(m => p.includes(m)))[0];
  if (marker) return `def_zh 是解释句不是词典释义(命中标记词「${marker}」):「${s}」`;
  /* 中文释义里混英文 = 模型没想出中文对应词,直接把原词/屈折形抄进来充数。
   * 实测样例:inappropriate「不当的， inappropriate 的」、resemblance「相似；相 resemblance」、
   * stagger「摇晃； staggered 也指错开」—— 对中国学习者零信息量。
   * 放量 4471 词时这类占 def_zh 不合格的一部分,机械可查,不该漏。 */
  if (/[A-Za-z]/.test(s)) return `def_zh 里混入英文字母:「${s}」`;
  return null;
}

/** g6 同词三句相似度:任意两句 4-gram 重合 >30% 拒(防"换个场景词其余照抄")。 */
export function g6_intraWordSimilarity(examples, threshold = SPEC.dedup.intraWordMax) {
  const sets = examples.map(e => ngrams(e.sentence));
  for (let i = 0; i < sets.length; i++) {
    for (let j = i + 1; j < sets.length; j++) {
      const r = symmetricOverlap(sets[i], sets[j]);
      if (r > threshold) {
        return `g6 第${i + 1}句与第${j + 1}句 4-gram 重合 ${(r * 100).toFixed(0)}% (>30%)`;
      }
    }
  }
  return null;
}

/**
 * 跑全部六道闸门。返回失败原因数组(空数组 = 全过)。
 * corpusNgramSets: 已接受句子的 4-gram 集合数组(全局语料)。
 */
export function runAllGates(word, payload, corpusNgramSets, inflectTable, opts = {}) {
  const fails = [];
  const examples = payload?.examples;
  /* 句长区间:新生成传 useTierLength=true 走按档区间;
   * 回溯复检存量内容不传,沿用 8-16,免得把已验收的句子全判废。 */
  const range = opts.useTierLength && LENGTH_BY_TIER[word?.cefr]
    ? LENGTH_BY_TIER[word.cefr]
    : LEGACY_LENGTH;

  const g5 = g5_mutualExclusive(examples);
  if (g5) fails.push(g5);

  if (Array.isArray(examples)) {
    // 本词内部已接受的句子也要进 g4 的比对面,避免三句自己撞车漏网
    const running = [...corpusNgramSets];
    examples.forEach((ex, i) => {
      const tag = `例${i + 1}`;
      const checks = [
        g1_targetPresent(ex.sentence, word.headword, inflectTable),
        g2_length(ex.sentence, range),
        g3_noEmDash(ex.sentence, ex.translation_zh, payload.def_en, payload.def_zh),
        g4_globalDedup(ex.sentence, running),
      ];
      for (const c of checks) if (c) fails.push(`${tag} ${c}`);
      running.push(ngrams(ex.sentence));
    });
    if (!g5) {
      const g6 = g6_intraWordSimilarity(examples);
      if (g6) fails.push(g6);
    }
    for (const c of [
      g7_collocationContainsWord(examples, word.headword, inflectTable),
      g13_collocationNotSameRoot(examples, word.headword, inflectTable),
      g8_zhPunctuation(examples),
      g9_distinctOpeners(examples),
      // g11 不在这里 —— 长度比版本实测假阳/假阴双失败,真正的 g11 在 verify-content.mjs
    ]) if (c) fails.push(c);
  }

  {
    const g14 = g14_ipaNoPlaceholder(payload?.ipa, word?.headword);
    if (g14) fails.push(g14);
  }

  // def_en 15 词内(不是闸门编号内的,但同属硬约束,一并卡)
  if (payload?.def_en && words(payload.def_en).length > SPEC.defEn.maxWords) {
    fails.push(`def_en ${words(payload.def_en).length} 词,超过 ${SPEC.defEn.maxWords}`);
  }
  const circular = g12_defEnNotCircular(payload?.def_en, word.headword, inflectTable);
  if (circular) fails.push(circular);
  return fails;
}
