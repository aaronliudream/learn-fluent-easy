// Heuristic categorisation of slang phrases into emotion families so we can
// present "carded" entry points like 震惊 / 夸赞 / 吐槽 / 调侃 etc.
//
// We keep this pure-frontend & rule-based: scan the Chinese meaning + the
// phrase itself for emotion keywords and return the best-matching family.
// Each slang gets exactly ONE primary family (the first match in priority
// order) so the cards don't double-count, and one secondary tag is allowed
// for filtering. This is intentionally simple and good enough for browse —
// the truth-source remains the slang itself.

import type { Idiom } from "@/data/idioms";

export type EmotionKey =
  | "shock"      // 震惊 / 难以置信
  | "praise"     // 夸赞 / 厉害 / 酷
  | "roast"      // 吐槽 / 嘲讽 / 抱怨
  | "tease"      // 调侃 / 玩笑 / 八卦
  | "agree"      // 同意 / 支持 / 共鸣
  | "vibe"       // 氛围 / 情绪状态 / 累、慌
  | "other";     // fallback (won't show as a card unless populated)

export const EMOTION_META: Record<EmotionKey, {
  label: string;
  emoji: string;
  blurb: string;
  // Tailwind gradient classes for the card.
  grad: string;
  ring: string;
}> = {
  shock:  { label: "震惊",       emoji: "😱", blurb: "难以置信、傻眼、wtf",      grad: "from-rose-500 to-orange-500",     ring: "ring-rose-400/40" },
  praise: { label: "夸赞",       emoji: "🔥", blurb: "牛、酷、绝、太顶了",       grad: "from-amber-500 to-pink-500",      ring: "ring-amber-400/40" },
  roast:  { label: "吐槽",       emoji: "🙄", blurb: "嘲讽、抱怨、阴阳怪气",     grad: "from-violet-500 to-fuchsia-500",  ring: "ring-violet-400/40" },
  tease:  { label: "调侃八卦",   emoji: "😏", blurb: "开玩笑、搞事、吃瓜",       grad: "from-sky-500 to-cyan-500",        ring: "ring-sky-400/40" },
  agree:  { label: "同意共鸣",   emoji: "💯", blurb: "对对对、真的、+1",         grad: "from-emerald-500 to-teal-500",    ring: "ring-emerald-400/40" },
  vibe:   { label: "氛围情绪",   emoji: "😮‍💨", blurb: "累、慌、浪、躺平",         grad: "from-indigo-500 to-blue-500",     ring: "ring-indigo-400/40" },
  other:  { label: "其他",       emoji: "🎲", blurb: "未分类的趣味俚语",         grad: "from-slate-500 to-zinc-500",      ring: "ring-slate-400/40" },
};

// Order matters: the FIRST matching family wins (so "震惊" beats "吐槽"
// when a phrase has both). Keep keywords short & high-signal.
const RULES: { key: EmotionKey; needles: RegExp }[] = [
  { key: "shock",  needles: /震惊|难以置信|傻眼|目瞪|不敢相信|吓|惊|无语|懵|崩溃|哇塞|天哪|搞什么|wtf|omg|傻了|绝了|惊呆/i },
  { key: "praise", needles: /厉害|牛|酷|帅|赞|太顶|顶级|超棒|出色|出彩|高级|强|绝|绝活|香|帅气|帅炸|无敌|NB|nb|6|666|爽|火|燃|顶/i },
  { key: "roast",  needles: /嘲|讽|吐槽|挖苦|阴阳|损|怼|怪|抱怨|不爽|烂|垃圾|拉|废|废物|无语|蠢|装|做作|演|戏|尴尬|拉胯|敷衍|甩锅/i },
  { key: "tease",  needles: /玩笑|开玩笑|调侃|逗|戏弄|八卦|爆料|吃瓜|搞事|搞笑|搞怪|乐|皮|抖|耍|捉弄|起哄|拱火|嗑|嗑cp|嗑糖|秀恩爱/i },
  { key: "agree",  needles: /同意|支持|赞同|认同|共鸣|对|没错|确实|真的|+1|真是|我懂|懂的|说得对|有道理|准|绝对|完全|举双手|赞成/i },
  { key: "vibe",   needles: /累|疲惫|困|慌|焦虑|emo|丧|伤心|难过|开心|高兴|兴奋|嗨|燃|浪|躺平|摆烂|内卷|社死|尬|放松|chill|冷静|烦/i },
];

const cache = new Map<number, EmotionKey>();

export function classifyIdiom(it: Idiom): EmotionKey {
  if (cache.has(it.id)) return cache.get(it.id)!;
  const hay = `${it.meaning_cn} ${it.example_cn ?? ""}`;
  for (const r of RULES) {
    if (r.needles.test(hay)) {
      cache.set(it.id, r.key);
      return r.key;
    }
  }
  cache.set(it.id, "other");
  return "other";
}

export function groupByEmotion(items: Idiom[]): Record<EmotionKey, Idiom[]> {
  const groups: Record<EmotionKey, Idiom[]> = {
    shock: [], praise: [], roast: [], tease: [], agree: [], vibe: [], other: [],
  };
  for (const it of items) groups[classifyIdiom(it)].push(it);
  return groups;
}

export const VISIBLE_EMOTIONS: EmotionKey[] = [
  "shock", "praise", "roast", "tease", "agree", "vibe",
];
