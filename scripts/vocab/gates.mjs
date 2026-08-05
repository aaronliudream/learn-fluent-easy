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
function targetTokens(sentence) {
  return String(sentence).toLowerCase()
    .split(/[\s\-–—/]+/)
    .map(t => t.replace(/[^a-z']/g, ''))
    .filter(Boolean)
    .map(t => t.replace(/'s$/, ''));
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
function matchesForm(token, headword, forms) {
  if (forms.has(token)) return true;
  if (headword.length >= 5 && token.length > headword.length && token.startsWith(headword)) {
    const tail = token.slice(headword.length);
    if (tail.length <= 4 && /^[a-z]+$/.test(tail)) return true;
  }
  return false;
}

/** g1 目标词存在:句中出现 headword 或其屈折形/派生形。 */
export function g1_targetPresent(sentence, headword, table) {
  const hw = headword.toLowerCase();
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
export const LENGTH_BY_TIER = { A2: [8, 12], B1: [8, 14], B2: [9, 16], C1: [10, 20] };
export const LEGACY_LENGTH = [8, 16];

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
export function g4_globalDedup(sentence, corpusNgramSets, threshold = 0.5) {
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
    const toks = c.toLowerCase().split(/[\s\-–—/]+/)
      .map(t => t.replace(/[^a-z']/g, '')).filter(Boolean).map(t => t.replace(/'s$/, ''));
    if (!toks.some(t => matchesForm(t, hw, forms))) {
      return `g7 第${i + 1}条搭配 "${c}" 里没有目标词 "${headword}",是同义词不是搭配`;
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
export function g12_defEnNotCircular(defEn, headword, table) {
  const hw = String(headword).toLowerCase();
  const forms = inflectionsOf(hw, table);
  const toks = String(defEn || '').toLowerCase().split(/[\s\-–—/]+/)
    .map(t => t.replace(/[^a-z']/g, '')).filter(Boolean).map(t => t.replace(/'s$/, ''));
  const hit = toks.find(t => matchesForm(t, hw, forms));
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
  const parts = s.split('；');
  if (parts.length > 2) return `def_zh 有 ${parts.length} 个义项,最多 2 个`;
  const tooLong = parts.find(p => p.trim().length > 12);
  if (tooLong) return `def_zh 义项过长(${tooLong.trim().length} 字):「${tooLong.trim()}」`;
  const marker = EXPLANATORY_MARKERS.find(m => s.includes(m));
  if (marker) return `def_zh 是解释句不是词典释义(命中标记词「${marker}」):「${s}」`;
  return null;
}

/** g6 同词三句相似度:任意两句 4-gram 重合 >30% 拒(防"换个场景词其余照抄")。 */
export function g6_intraWordSimilarity(examples, threshold = 0.3) {
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
      g8_zhPunctuation(examples),
      g9_distinctOpeners(examples),
      // g11 不在这里 —— 长度比版本实测假阳/假阴双失败,真正的 g11 在 verify-content.mjs
    ]) if (c) fails.push(c);
  }

  // def_en 15 词内(不是闸门编号内的,但同属硬约束,一并卡)
  if (payload?.def_en && words(payload.def_en).length > 15) {
    fails.push(`def_en ${words(payload.def_en).length} 词,超过 15`);
  }
  const circular = g12_defEnNotCircular(payload?.def_en, word.headword, inflectTable);
  if (circular) fails.push(circular);
  return fails;
}
