import type { GameWord } from "./types";

/**
 * 情景闯关题目：从 language chunk 派生的完形填空，但**严格过滤**。
 * 目标：每道题挖空后英文本身就强烈指向唯一答案（真语境辨析），
 * 而不是"英文有一堆词都能填、全靠中文提示猜"（那就和 quiz 重复了）。
 *
 * 两条规则：
 *  1) 挖空过滤（isStrongCloze）：只保留"空前有实义词(名/动)紧贴、构成强搭配"的 chunk；
 *     砍掉万能槽位 my ___ / a big ___ / the ___ day / by ___ / on the ___ 这类。
 *  2) 干扰项（pickDistractors）：同形(单词↔单词/短语↔短语)、首词各不相同(去扎堆)、
 *     优先同单元同类，构成真辨析；而非随机同年级词。
 *
 * 严格过滤后可出题的词会明显减少——这是刻意的：宁可题少、每道都真辨析。
 * 不落库、不需人工写句库。
 */
export type ContextItem = {
  wordId: string;
  answer: string;
  cloze: string;
  cn: string;
  /**
   * 语块原文（未挖空），朗读与"揭晓完整短语"都用它。
   *
   * 为什么不从 cloze 回填：makeCloze 的匹配是**大小写不敏感**的（必须如此，否则
   * headword "yum" 找不到语块 "Yum!"，那 6 道题会整体消失——实测池子 835→829）。
   * 但 `cloze.replace("____", answer)` 回填的是 headword 自己的小写词形，
   * 于句首会把 "Yum!" 变成 "yum!"：显示不符课本，且**多出一个只差大小写的 TTS 缓存对象**
   * （内容寻址 key 大小写敏感）。带上原文即根除，将来新内容也不会再产生这类重复。
   */
  full: string;
};

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function makeCloze(chunkEn: string, headword: string): string | null {
  const hw = headword.trim();
  if (!hw) return null;
  const boundary = /^[a-zA-Z]+$/.test(hw);
  const pattern = boundary
    ? new RegExp(`\\b${escapeRegExp(hw)}\\b`, "i")
    : new RegExp(escapeRegExp(hw), "i");
  if (!pattern.test(chunkEn)) return null;
  return chunkEn.replace(pattern, "____");
}

// 弱锚词：出现在空前也不构成"强搭配"（限定词/介词/连词/代词/泛化形容词/数词）。
// 只有这些以外的词（名词/动词等实义词）才算"内容锚"，能把空指向具体答案。
const STOP = new Set(
  (
    // 限定词 / 代词 / 介词 / 连词
    "a an the this that these those my your his her its our their some any no each all both other another " +
    "i you he she it we they me him them us there here what which whose who whom " +
    "of to in on at by for with from into onto about over under near as than and or but so " +
    // 泛化 / 描述性形容词（adj+名 属于弱搭配，砍）
    "big small little tiny huge large red blue green yellow black white brown pink orange purple grey gray " +
    "nice good bad new old long short tall fat thin hot cold warm cool great fine happy sad busy free clean " +
    "dirty easy hard quiet loud kind brave famous delicious beautiful pretty lovely cute funny hungry thirsty " +
    "tired sick ill ready sure right wrong real true whole half only own same different special important main " +
    "favourite favorite first second third fourth fifth next last every many much more most less fast slow " +
    "high low young dear poor rich strong weak wet dry full empty dark light soft sweet sour bright"
  ).split(/\s+/),
);
const NUMBER =
  /^(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|\d+)$/i;
// 开放动词：后面能接一大类宾语、没有唯一答案（like 什么都能 like），这些做锚也砍。
const OPEN_VERB = new Set(
  "like likes have has want wants see sees get gets got make makes made do does did find finds found love loves need needs use uses know knows".split(
    /\s+/,
  ),
);

function cleanTok(t: string): string {
  return t.replace(/[^a-zA-Z']/g, "").toLowerCase();
}
function isContent(tok: string): boolean {
  const t = cleanTok(tok);
  return t.length >= 2 && !STOP.has(t) && !NUMBER.test(t);
}

/**
 * 强搭配判定：空前必须有"内容锚"紧贴——
 *  - 锚紧挨空（距离1，如 "science ____"、"Chinese ____"），或
 *  - 距离2 且中间只隔一个 of/the（如 "a pair of ____"、"play the ____"）。
 * 其余（my ___ / a big ___ / by ___ / on the ___ / go to the ___ / the ___ day）一律砍。
 */
function isStrongCloze(cloze: string): boolean {
  const toks = cloze.split(/\s+/);
  const blankIdx = toks.findIndex((t) => t.includes("____"));
  if (blankIdx <= 0) return false; // 空在句首=无左语境，砍
  const left = toks.slice(0, blankIdx);
  // 找最靠近空的内容锚
  let anchorIdx = -1;
  for (let i = left.length - 1; i >= 0; i--) {
    if (isContent(left[i])) {
      anchorIdx = i;
      break;
    }
  }
  if (anchorIdx === -1) return false;
  if (OPEN_VERB.has(cleanTok(left[anchorIdx]))) return false; // like ___ / have ___ 开放槽位，砍
  const distance = blankIdx - anchorIdx;
  if (distance === 1) return true;
  if (distance === 2) {
    const mid = cleanTok(toks[anchorIdx + 1]);
    return mid === "of" || mid === "the";
  }
  return false;
}

/** 生成情景题池：只收通过强搭配过滤、且**答案为单词**的 chunk（多词答案干扰项难可靠匹配）。 */
export function buildContextItems(words: GameWord[]): ContextItem[] {
  const items: ContextItem[] = [];
  for (const w of words) {
    if (w.en.trim().split(/\s+/).length > 1) continue; // 只收单词答案
    for (const c of w.chunks ?? []) {
      const cloze = makeCloze(c.en, w.en);
      if (!cloze || !isStrongCloze(cloze)) continue;
      items.push({ wordId: w.id, answer: w.en, cloze, cn: c.cn, full: c.en });
    }
  }
  return items;
}

/** 哪些词至少有一道通过过滤的强搭配情景题（SRS 选词前过滤词池）。 */
export function wordsWithContext(words: GameWord[]): GameWord[] {
  const ok = new Set(buildContextItems(words).map((it) => it.wordId));
  return words.filter((w) => ok.has(w.id));
}

const tokenCount = (s: string) => s.trim().split(/\s+/).length;
const firstTok = (s: string) => s.trim().split(/\s+/)[0].toLowerCase();

// 粗粒度词性分桶：让干扰项和答案能填进同一个空、语法通（名词空只配名词等）。
const ORDINAL = /(th|st|nd|rd)$/i;
const KNOWN_ADJ = new Set(
  ("worried afraid angry sad happy excited bored proud nervous hungry thirsty tired hard-working clever lazy honest " +
    "polite shy strict careful cheap expensive healthy tasty terrible wonderful interesting exciting boring difficult " +
    "heavy safe dangerous cloudy sunny rainy snowy windy active helpful useful silly fantastic amazing").split(/\s+/),
);
// 副词/叹词/连接词等，永不做干扰项（会破坏语法：如 "open the too"）
const ADVERB_JUNK = new Set(
  "too also just still again now then well please yes ok thanks sorry hello hi bye back up down off out here there very really quite always usually often sometimes never together maybe of course".split(
    /\s+/,
  ),
);
const IRREG_PAST = new Set(
  "went ate rode had slept read hurt cleaned stayed washed watched saw made took got came gave found bought sang flew drew swam".split(
    /\s+/,
  ),
);
const NOUN_ING = new Set(
  "morning evening building ceiling king spring string thing nothing something everything clothing during".split(/\s+/),
);
// 动名兼类词：塞进名词空会语法不通（"a science turn"），永不做名词干扰项。
const VERB_NOUN_AMBIG = new Set(
  ("turn help like study watch play run walk talk work call cook dance visit answer show move open close start " +
    "stop wait live give take drink read wash stay want get make find see look feel try need use love hope wish " +
    "care jump smile dream fly ride drive swim hike camp fish clean cut hurt plant rain snow book count").split(
    /\s+/,
  ),
);
// 功能词/数词/副词/兼类动词永不做干扰项
const NEVER_DISTRACTOR = new Set([
  ...STOP,
  ...ADVERB_JUNK,
  ...VERB_NOUN_AMBIG,
  ..."mine yours hers ours theirs".split(/\s+/),
]);

function posBucket(w: GameWord): "num" | "adj" | "act" | "verb" | "noun" {
  const en = w.en.toLowerCase().trim();
  if (NUMBER.test(en) || ORDINAL.test(en)) return "num";
  const ctext = (w.chunks ?? []).map((c) => c.en.toLowerCase()).join(" | ");
  // chunk 里出现 very/feel/look/be + 该词 → 形容词
  const adjLead = new RegExp(
    `\\b(very|so|too|really|quite|feel|feels|felt|look|looks|looked|am|is|are|was|were|get|gets|got)\\s+(a\\s+)?${escapeRegExp(
      en,
    )}\\b`,
  );
  if (KNOWN_ADJ.has(en) || adjLead.test(ctext)) return "adj";
  if (IRREG_PAST.has(en) || /ed$/.test(en)) return "verb";
  if (/ing$/.test(en) && !NOUN_ING.has(en)) return "act";
  return "noun";
}

// 语法自检：按空前一词推断这个空期望什么词性（very ___ 要形容词，其余多为名词位）。
function slotExpectsAdj(cloze: string): boolean {
  const toks = cloze.split(/\s+/);
  const bi = toks.findIndex((t) => t.includes("____"));
  const prev = bi > 0 ? cleanTok(toks[bi - 1]) : "";
  return ["very", "so", "too", "really", "quite"].includes(prev);
}

/**
 * 挑 3 个干扰项，构成真辨析：
 *  - 同词性桶 + 语法自检（按空前一词确认"填进去语法通"：形容词空只收形容词、名词空只收名词/活动，排兼类动词）
 *  - 同词数（单词↔单词）
 *  - 首词各不相同（去扎堆）、排除功能词/数词/兼类动词、非答案/非同义
 * 凑不齐 3 个就返回不足 3 个 → 调用方跳过该题（宁缺毋滥）。
 */
export function pickDistractors(
  answer: GameWord,
  cloze: string,
  pool: GameWord[],
  seed: number,
): string[] {
  const tc = tokenCount(answer.en);
  const wantPos = posBucket(answer);
  const adjSlot = slotExpectsAdj(cloze);
  const cand = pool.filter((w) => {
    if (w.en === answer.en || w.cn === answer.cn) return false;
    if (tokenCount(w.en) !== tc) return false;
    if (NEVER_DISTRACTOR.has(w.en.toLowerCase())) return false;
    const b = posBucket(w);
    if (b !== wantPos) return false; // 和答案同桶
    // 语法自检：形容词空只放形容词；名词空只放名词/活动（挡住兼类动词/数词误入）
    if (adjSlot) return b === "adj";
    return b === "noun" || b === "act";
  });
  const shuffled = cand.sort((a, b) => {
    // 同单元优先（≈同语义场：食物单元配食物、文具单元配文具）
    const ua = a.unitId === answer.unitId ? 0 : 1;
    const ub = b.unitId === answer.unitId ? 0 : 1;
    if (ua !== ub) return ua - ub;
    const ka = (a.id.charCodeAt(0) + seed * 7) % 101;
    const kb = (b.id.charCodeAt(0) + seed * 11) % 101;
    return ka - kb || a.id.localeCompare(b.id);
  });
  const out: string[] = [];
  const usedFirst = new Set<string>([firstTok(answer.en)]);
  for (const w of shuffled) {
    if (out.length >= 3) break;
    const f = firstTok(w.en);
    if (usedFirst.has(f) || out.includes(w.en)) continue;
    usedFirst.add(f);
    out.push(w.en);
  }
  return out;
}
