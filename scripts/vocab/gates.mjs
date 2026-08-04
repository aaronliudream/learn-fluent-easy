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

/** g1 目标词存在:句中出现 headword 或其屈折形。 */
export function g1_targetPresent(sentence, headword, table) {
  const forms = inflectionsOf(headword, table);
  const hit = targetTokens(sentence).some(t => forms.has(t));
  return hit ? null : `g1 目标词缺席:句中找不到 "${headword}" 或其屈折形`;
}

/** g2 长度 8-16 词。 */
export function g2_length(sentence) {
  const n = words(sentence).length;
  return (n >= 8 && n <= 16) ? null : `g2 长度 ${n} 词,超出 8-16`;
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
export function runAllGates(word, payload, corpusNgramSets, inflectTable) {
  const fails = [];
  const examples = payload?.examples;

  const g5 = g5_mutualExclusive(examples);
  if (g5) fails.push(g5);

  if (Array.isArray(examples)) {
    // 本词内部已接受的句子也要进 g4 的比对面,避免三句自己撞车漏网
    const running = [...corpusNgramSets];
    examples.forEach((ex, i) => {
      const tag = `例${i + 1}`;
      const checks = [
        g1_targetPresent(ex.sentence, word.headword, inflectTable),
        g2_length(ex.sentence),
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
  }

  // def_en 15 词内(不是闸门编号内的,但同属硬约束,一并卡)
  if (payload?.def_en && words(payload.def_en).length > 15) {
    fails.push(`def_en ${words(payload.def_en).length} 词,超过 15`);
  }
  return fails;
}
