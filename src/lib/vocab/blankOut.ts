/**
 * 把例句里的目标词挖成空 —— 辨析专项练习的题干生成。
 *
 * ⚠️ **必须容忍屈折**。`vocab_examples.sentence` 里出现的往往不是词条原形:
 *    headword `allegiance` 可能以 `allegiance` 出现,但 `taper` 会写成 `tapering`、
 *    `involve` 写成 `involved`。朴素的 `sentence.includes(headword)` 会大面积漏掉,
 *    表现是"大部分词出不了题",而且是静默的 —— 只会看到题库莫名其妙的小。
 *    这个坑我在别处栽过三次(came across / Her birthday escaped / learn from his mistakes)。
 *
 * ⚠️ 反过来也要防**过度匹配**:`art` 不该在 `start` 里被挖掉。所以一律加词边界。
 *
 * ⚠️ 找不到就**返回 null,不硬造**。宁可这个词不出题,也不能给一个
 *    "挖空位置和答案对不上"的题 —— 那种题学生做完会更困惑。
 *
 * 真库实测(2026-08-09,辨析组全部 978 个词各取第一条例句):
 *   **975 / 978 = 99.7% 能挖出空**。漏的 3 个:
 *   fungus→fungi、stratum→strata(拉丁语不规则复数)、cataclysm→cataclysmic。
 *   ⚠️ 没有为这 3 个再加规则:多加后缀等于放大过度匹配的风险,
 *      而收益是 1000 个词里的 3 个。按"分不清就别硬判",让它们跳过。
 */

/** 英语常见屈折后缀。按长度降序试,避免 `-s` 抢在 `-es` 前面。 */
const SUFFIXES = ["ingly", "ances", "ences", "ments", "ation", "ings", "edly", "ance", "ence", "ment", "ies", "ing", "ely", "est", "ers", "ed", "es", "er", "ly", "s", "d"];

/** 词干:去掉一层常见后缀;顺带处理 `-ies → -y` 和双写辅音(running → run)。 */
function stems(word: string): string[] {
  const w = word.toLowerCase();
  const out = new Set<string>([w]);
  for (const suf of SUFFIXES) {
    if (w.length > suf.length + 2 && w.endsWith(suf)) {
      const base = w.slice(0, -suf.length);
      out.add(base);
      out.add(base + "e");                                   // taping → tape
      if (suf === "ies") out.add(base + "y");                 // studies → study
      if (/(.)\1$/.test(base)) out.add(base.slice(0, -1));    // running → run
    }
  }
  return [...out];
}

function esc(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** 可以接在词干后面的屈折尾巴。放进一个组里,允许一个也不接。 */
const TAIL = "(?:e?s|es|ed|d|ing|ings|er|ers|est|ly|ance|ence|ment|ments|ation|ations)?";

/**
 * 由一个基本形造出**能匹配它各种屈折形**的正则片段。
 *
 * ⚠️ 这里要处理的是两个方向,少一个就会静默漏题:
 *    ① 词条是屈折形、句子里是原形(tapering ← taper)—— 靠 stems() 先剥;
 *    ② 词条是原形、句子里是屈折形(study → studies)—— 靠下面这三条形变规则。
 *    第一版只做了 ①,于是 study / run / simplify 全部挖不出空。
 */
function pattern(base: string): string {
  let core: string;
  if (/y$/i.test(base)) {
    core = esc(base.slice(0, -1)) + "(?:y|i)";           // study → studies / studied
  } else if (/e$/i.test(base)) {
    core = esc(base.slice(0, -1)) + "e?";                // involve → involved / involving
  } else if (/[bdfglmnprt]$/i.test(base)) {
    core = esc(base) + esc(base.slice(-1)) + "?";        // run → running(末辅音双写)
  } else {
    core = esc(base);
  }
  return `\\b${core}${TAIL}\\b`;
}

export const BLANK = "______";

/**
 * 在 sentence 中找到 headword(容忍屈折)并替换成下划线。
 * @returns 挖空后的句子;找不到返回 null。
 */
export function blankOut(sentence: string, headword: string): string | null {
  const s = (sentence || "").trim();
  const h = (headword || "").trim();
  if (!s || !h) return null;

  /* 多词词条(look after)整体匹配,词间允许空格或连字符 */
  if (/\s/.test(h)) {
    const re = new RegExp(`\\b${h.split(/\s+/).map(esc).join("[\\s-]+")}\\b`, "i");
    return re.test(s) ? s.replace(re, BLANK) : null;
  }

  /* 单词:先试整词,再试"词干 + 任意常见屈折尾巴"。
     ⚠️ 词干至少 3 个字符才用来构造模糊匹配 —— 否则 `be`、`go` 的词干
        会匹配到句子里一大片无关的词。 */
  const exact = new RegExp(`\\b${esc(h)}\\b`, "i");
  if (exact.test(s)) return s.replace(exact, BLANK);

  /* ⚠️ 词干至少 3 个字符才做模糊匹配 —— 否则 be / go 的词干会在句子里乱挖。
     ⚠️ 候选里要包含 h 自己:词条本来就是原形时(study),没有可剥的后缀,
        但仍需要 pattern() 把它变成能匹配 studies 的形态。 */
  for (const st of stems(h)) {
    if (st.length < 3) continue;
    const re = new RegExp(pattern(st), "i");
    if (re.test(s)) return s.replace(re, BLANK);
  }
  return null;
}
