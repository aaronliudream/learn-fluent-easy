/**
 * 场景短文里的「链上说法」高亮 —— 教学捕捉点:
 * 用户读短文时要一眼看出「刚才那条链上的词,在这篇文章里长什么样、放在哪个位置」。
 *
 * 与 highlight.ts 的区别:那边高亮**单个 headword**(词库例句用),
 * 这边要高亮**整条链的 8-15 个说法**,而且多数是词组
 * (add to cart / place an order / track the package),不是单词。
 *
 * 三条匹配规则:
 *   ① 单词节点:走 highlight.ts 的屈折表(browse → browsing / browsed)。
 *      ⚠️ 复用而非另写 —— 两套屈折规则必然漂移,漂移点恰好是最该高亮的变形。
 *   ② 词组节点:**首词允许屈折**,其余词按原样、词间允许任意空白
 *      (place an order → placing an order;track the package → tracked the package)。
 *      只放宽首词是因为词组里变的几乎总是那个动词,放宽全部会误伤。
 *   ③ contrast 节点:text_en 形如「free shipping vs. expedited shipping」,
 *      整串在短文里永远不会原样出现 —— 必须按 vs. 切成两个说法分别匹配。
 *
 * 长的优先:「free shipping」和「shipping」同时在链上时,短文里的
 * 「free shipping」必须整体命中,不能被切成 free +〔shipping〕。
 */
import { inflectionsOf } from "@/lib/vocab/highlight";

export type SceneTerm = {
  /** 对应的节点 id —— 点高亮词要能定位回链上那一环 */
  itemId: string;
  /** 用于匹配的表面形(contrast 会拆成两条,共用同一个 itemId) */
  surface: string;
};

export type SceneSeg = {
  text: string;
  /** 命中的节点 id;null = 普通文字 */
  itemId: string | null;
};

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** contrast 的「A vs. B」拆成 A、B 两条;其余原样返回。 */
export function splitContrast(textEn: string): string[] {
  const parts = String(textEn || "").split(/\s+vs\.?\s+/i);
  return parts.map(p => p.trim()).filter(Boolean);
}

/**
 * 单条说法 → 正则片段。
 *
 * 词组放宽**首尾两个词**的屈折,中间的词按原样:
 *   · 动词短语变在头上:place an order → placing an order / placed an order
 *   · 名词短语变在尾上:product review → product reviews;shipping delay → shipping delays
 * 只放宽首尾是有意的 —— 中间那些是介词/冠词(an / the / to),它们不变形,
 * 放宽了只会让「add to cart」这种去误吃别的句子。
 */
function patternFor(surface: string): string | null {
  const words = surface.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return null;

  /* 词间分隔符一律放宽成「空格 / 连字符 / 什么都没有」。
   * 链上存的是词典形,短文里写的是行文形,同一个说法三种写法都真实出现过:
   *   follow up → follow-up   burn out → burnout   check-out → check out
   * 实测全库 292 条说法,不放宽会白白漏掉这三类。
   * ⚠️ 两端有 \b 兜着,放开到零宽也不会咬进别的词里。 */
  const SEP = "[\\s-]*";
  /** 词内的连字符同样放宽 —— check-out 这种节点本身就带连字符。 */
  const flex = (s: string) => escape(s).split("-").join(SEP);

  // 长的形式排前面,正则交替是**最左最先匹配**,不排序会让 browse 抢在 browsing 前面
  const formsOf = (w: string) =>
    [...inflectionsOf(w)].sort((a, b) => b.length - a.length).map(flex).join("|");

  if (words.length === 1) return `\\b(?:${formsOf(words[0])})\\b`;

  const head = `(?:${formsOf(words[0])})`;
  const tail = `(?:${formsOf(words[words.length - 1])})`;
  const middle = words.slice(1, -1).map(flex);
  return `\\b${[head, ...middle, tail].join(SEP)}\\b`;
}

type Compiled = { itemId: string; re: RegExp; pattern: string };

/**
 * 编译一条链的全部说法。
 * 返回 segments(text) —— 把短文切成「命中 / 未命中」片段,拼回去与原文逐字相同。
 */
export function buildSceneHighlighter(terms: SceneTerm[]) {
  const compiled: Compiled[] = [];
  for (const t of terms) {
    const pattern = patternFor(t.surface);
    if (!pattern) continue;
    compiled.push({ itemId: t.itemId, pattern, re: new RegExp(`^(?:${pattern})$`, "i") });
  }
  /* 长说法优先:按表面形长度降序进交替分支。
   * 正则交替取**最先能匹配上的分支**(不是最长的),所以顺序就是优先级 ——
   * 不排的话「free shipping」会被前面的「shipping」抢走一半。 */
  const ordered = [...compiled].sort((a, b) => b.pattern.length - a.pattern.length);
  const combined = ordered.length
    ? new RegExp(ordered.map(c => `(?:${c.pattern})`).join("|"), "gi")
    : null;

  return function segments(text: string): SceneSeg[] {
    const src = String(text || "");
    if (!combined || !src) return [{ text: src, itemId: null }];

    const out: SceneSeg[] = [];
    let last = 0;
    combined.lastIndex = 0;
    for (let m = combined.exec(src); m; m = combined.exec(src)) {
      const hit = m[0];
      if (!hit) { combined.lastIndex++; continue; }   // 零宽匹配保护,别死循环
      // 命中的是哪个节点:拿完整匹配串回测各条自己的正则,第一个吃下的就是它
      const owner = ordered.find(c => c.re.test(hit));
      if (m.index > last) out.push({ text: src.slice(last, m.index), itemId: null });
      out.push({ text: hit, itemId: owner?.itemId ?? null });
      last = m.index + hit.length;
    }
    if (last < src.length) out.push({ text: src.slice(last), itemId: null });

    // 合并相邻的普通片段,少建 DOM 节点
    const merged: SceneSeg[] = [];
    for (const s of out) {
      const prev = merged[merged.length - 1];
      if (prev && prev.itemId === null && s.itemId === null) prev.text += s.text;
      else merged.push({ ...s });
    }
    return merged;
  };
}
