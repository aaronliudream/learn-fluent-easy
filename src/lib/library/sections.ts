/**
 * 图书馆阅读器 · 章内分节(纯显示层)。
 * 切在自然段落边界(绝不按句数机械切)。章 < 600 词不分节。节数 clamp[3,10]、每节≈300词。
 * ⚠️ 纯函数,只算显示用的节边界/节号;绝不参与 furthest_seq/停留判定。
 */
export const SECTION_TARGET_WORDS = 300;
export const SECTION_MIN_CHAPTER_WORDS = 600; // 章太短不分节(伊索那种)
export const SECTION_MAX = 10; // 上限 10(不是 8):否则最长的章每节反而最大、里程碑最少,方向反

export function countWords(text: string | null | undefined): number {
  return (text || "").trim().split(/\s+/).filter(Boolean).length;
}

/**
 * 由各段词数算节边界。返回:boundaries=会「起新节」的段下标集合(0-based,不含 0);total=总节数。
 * 章 < 600 词 或 段数 < 3 → 不分节({boundaries:空, total:1})。
 */
export function computeSections(paraWords: number[]): { boundaries: Set<number>; total: number } {
  const totalWords = paraWords.reduce((a, b) => a + b, 0);
  const n = paraWords.length;
  if (totalWords < SECTION_MIN_CHAPTER_WORDS || n < 3) return { boundaries: new Set(), total: 1 };
  const M = Math.min(SECTION_MAX, Math.max(3, Math.round(totalWords / SECTION_TARGET_WORDS)));
  const target = totalWords / M;
  const boundaries = new Set<number>();
  let acc = 0;
  for (let i = 0; i < n; i++) {
    acc += paraWords[i];
    // 已够一节 且 还没到 M-1 条界 且 后面还有段 → 下一段起新节
    if (acc >= target && boundaries.size + 1 < M && i + 1 < n) {
      boundaries.add(i + 1);
      acc = 0;
    }
  }
  return { boundaries, total: boundaries.size + 1 };
}

/** 某段下标(0-based)属于第几节(1-based)。 */
export function sectionOfPara(paraIndex: number, boundaries: Set<number>): number {
  let sec = 1;
  for (const b of boundaries) if (paraIndex >= b) sec++;
  return sec;
}
