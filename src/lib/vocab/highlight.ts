/**
 * 例句里的目标词高亮 —— 教学捕捉点:用户扫一眼就该看到这个词长在句子哪个位置。
 *
 * ⚠️ 匹配规则必须与内容流水线的 g1 闸门**同一套**
 *    (scripts/vocab/gates.mjs 的 targetTokens + inflectionsOf + matchesForm)。
 *    那边判"例句里到底有没有这个词"用的就是这套;两边不一致会出现
 *    "闸门说有、页面不高亮"的怪事 —— 而且恰恰是那些屈折/派生形,
 *    也就是最需要高亮提示的情况。
 *
 * 覆盖三类:
 *   ① 原形 / 屈折形:abandon → abandoned / abandoning / abandons
 *   ② 派生形:inflation → inflationary(词干打头 + 尾巴 ≤4 字母)
 *   ③ 连字符复合词:self-defense 里的 defense 也要亮(按连字符切开后逐段判)
 * 不覆盖:shipwright 里的 wright —— 那是后缀不是词干,属于另一个词,g7 也是这么判的。
 */

/** 屈折形推导(后缀规则,与 gates.mjs 的 inflectionsOf 保持一致)。 */
function inflectionsOf(headword: string): Set<string> {
  const hw = headword.toLowerCase();
  const forms = new Set<string>([hw]);
  const add = (f: string) => forms.add(f);
  add(hw + "s"); add(hw + "es"); add(hw + "ed"); add(hw + "d"); add(hw + "ing");
  add(hw + "ly"); add(hw + "er"); add(hw + "est");
  if (/[^aeiou]y$/.test(hw)) {
    const stem = hw.slice(0, -1);
    add(stem + "ies"); add(stem + "ied"); add(stem + "ier"); add(stem + "iest"); add(stem + "ily");
  }
  if (/e$/.test(hw)) {
    const stem = hw.slice(0, -1);
    add(stem + "ing"); add(stem + "ed"); add(stem + "es"); add(stem + "er"); add(stem + "est");
  }
  if (/[^aeiou][aeiou][^aeiouwxy]$/.test(hw)) {   // 重读闭音节双写:plan → planning
    const dbl = hw + hw.slice(-1);
    add(dbl + "ing"); add(dbl + "ed"); add(dbl + "er"); add(dbl + "est");
  }
  return forms;
}

/** 与 gates.mjs matchesForm 一致:命中屈折表,或"词干打头 + 尾巴 ≤4 字母"的派生形。 */
function matchesForm(token: string, headword: string, forms: Set<string>): boolean {
  if (forms.has(token)) return true;
  if (headword.length >= 5 && token.length > headword.length && token.startsWith(headword)) {
    const tail = token.slice(headword.length);
    if (tail.length <= 4 && /^[a-z]+$/.test(tail)) return true;
  }
  return false;
}

export type Seg = { text: string; hit: boolean };

/**
 * 把句子切成片段,标出哪些片段是目标词。
 * 连字符/斜杠当分隔符 → "self-defense" 切成 self | - | defense,只亮 defense。
 */
export function highlightSegments(sentence: string, headword: string): Seg[] {
  const hw = String(headword || "").toLowerCase();
  if (!sentence || !hw) return [{ text: sentence || "", hit: false }];
  const forms = inflectionsOf(hw);

  // 用捕获组 split,分隔符会保留在结果里,拼回去与原句逐字相同
  const parts = String(sentence).split(/([A-Za-z']+)/g);
  const out: Seg[] = [];
  for (const p of parts) {
    if (!p) continue;
    const isWord = /^[A-Za-z']+$/.test(p);
    if (!isWord) { out.push({ text: p, hit: false }); continue; }
    const norm = p.toLowerCase().replace(/[^a-z']/g, "").replace(/'s$/, "");
    out.push({ text: p, hit: matchesForm(norm, hw, forms) });
  }
  // 合并相邻同态片段,减少 DOM 节点
  const merged: Seg[] = [];
  for (const s of out) {
    const last = merged[merged.length - 1];
    if (last && last.hit === s.hit) last.text += s.text;
    else merged.push({ ...s });
  }
  return merged;
}

/** 高亮色:spec 身份色体系内的深蓝(cet6 同色)。 */
export const HILITE = "#185FA5";
