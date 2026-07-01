import type { GameWord } from "./types";

/**
 * 情景闯关题目：从每个词的 language chunk 自动派生的完形填空。
 * 把 chunk 里的目标词挖空 → 学生在真实搭配语境里选词，比孤立选词更接近"用起来"。
 * 不落库、不需人工写句库：题目全部来自已有的 chunks 数据。
 */
export type ContextItem = {
  wordId: string; // 对应 GameWord.id，用于 SRS 记分
  answer: string; // 被挖空的目标词（原样大小写）
  cloze: string; // 已把目标词替换成 ____ 的英文短语
  cn: string; // 该搭配的中文
};

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// 把 chunk 文本里第一处目标词替换成空格线；替换不到返回 null（该 chunk 不可用）
function makeCloze(chunkEn: string, headword: string): string | null {
  const hw = headword.trim();
  if (!hw) return null;
  // 纯字母词用词边界，避免 by 命中 baby；含空格/连字符的短语用普通子串匹配
  const boundary = /^[a-zA-Z]+$/.test(hw);
  const pattern = boundary
    ? new RegExp(`\\b${escapeRegExp(hw)}\\b`, "i")
    : new RegExp(escapeRegExp(hw), "i");
  if (!pattern.test(chunkEn)) return null;
  return chunkEn.replace(pattern, "____");
}

/** 为一批词生成情景题池：每个词取其所有"含该词"的 chunk 各成一题。 */
export function buildContextItems(words: GameWord[]): ContextItem[] {
  const items: ContextItem[] = [];
  for (const w of words) {
    for (const c of w.chunks ?? []) {
      const cloze = makeCloze(c.en, w.en);
      if (!cloze) continue;
      items.push({ wordId: w.id, answer: w.en, cloze, cn: c.cn });
    }
  }
  return items;
}

/** 哪些词至少有一道可用情景题（用于 SRS 选词前过滤词池）。 */
export function wordsWithContext(words: GameWord[]): GameWord[] {
  return words.filter((w) => (w.chunks ?? []).some((c) => makeCloze(c.en, w.en) !== null));
}
