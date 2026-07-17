import { recordMastery, loadMastery, type MasteryRow } from "@/lib/masteryProgress";
import type { LibraryFavoriteKind } from "@/lib/library/favorites";

// 图书馆词库复习掌握度:复用 mastery_progress(星级/百分比/遗忘曲线),无 edge function。
// module 独立命名空间 "library_vocab_review",item_id = "<kind>:<term>"(如 word:spring / chunk:in the world)。
// 🚨 红线(DECISIONS.md D14):图书馆复习只准写 mastery_progress / library_vocab_favorites / user_mistakes;
//    绝不写 junior_word_mastery / gaokao_user_mastery / unified_mastery_manual(初中词汇碎片化坑)。
export const LIBRARY_VOCAB_REVIEW_MODULE = "library_vocab_review";

const itemId = (kind: LibraryFavoriteKind, term: string) => `${kind}:${term}`;

/** 提交一次单词/语块复习结果 → 更新掌握度。pct=100 答对 / 0 答错。 */
export function recordLibraryVocabMastery(kind: LibraryFavoriteKind, term: string, pct: number) {
  return recordMastery({ module: LIBRARY_VOCAB_REVIEW_MODULE, itemId: itemId(kind, term), pct });
}

/** 拉取图书馆词库复习全部掌握度 → Map<"kind:term", row>。 */
export function loadLibraryVocabMastery(): Promise<Record<string, MasteryRow>> {
  return loadMastery(LIBRARY_VOCAB_REVIEW_MODULE);
}
