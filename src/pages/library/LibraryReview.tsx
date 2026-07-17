/**
 * 图书馆词库复习 · 一次复习会话(在「我的词库」内切换进入,不新开路由)。
 * 数据只写三处(DECISIONS.md D14 红线):mastery_progress / library_vocab_favorites / user_mistakes(module=library_vocab)。
 * 聚合口径:一个词本次所有题都答对 = 该词本次「做对」→ 记掌握度 100、跨天连对 +1(同天不重复)、移出错题;
 *           只要错一题 → 掌握度按正确率、跨天连对清零、把「第一处答错」写进错题本。
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LibraryQuizRunner, type QuizItem } from "@/components/library/LibraryQuizRunner";
import GameResult from "@/pages/primaryHub/vocabGames/GameResult";
import { buildReviewQuestions, type ReviewItemMeta, type ReviewMode } from "@/lib/library/reviewQuestions";
import { recordLibraryVocabMastery } from "@/lib/library/mastery";
import { recordVocabStreak, VOCAB_MASTER_STREAK, listLibraryFavorites, vocabIsDueToday, type LibraryFavorite } from "@/lib/library/favorites";
import { recordLibraryVocabMistake, resolveLibraryVocabMistake } from "@/lib/library/mistakes";
import { bumpReviewStreak } from "@/lib/library/reviewStreak";
import { isFunctionWord } from "@/lib/library/wordClass";

type Phase = "loading" | "empty" | "quiz" | "done";

type TermAgg = {
  meta: ReviewItemMeta;
  correct: number;
  total: number;
  firstWrong?: { stem: string; opts: string[]; answerIdx: number; pickedIdx: number | null; explanation?: string | null };
};

export default function LibraryReview({
  favs,
  poolFavs,
  onExit,
  mode,
}: {
  favs: LibraryFavorite[]; // 出题集(通常=今日待复习)
  poolFavs?: LibraryFavorite[]; // 干扰项池(通常=全部收藏);省略则=favs
  onExit: () => void;
  mode: ReviewMode;
}) {
  const en = mode === "en"; // en 模式界面文案也走英文(用户不懂中文)
  const [phase, setPhase] = useState<Phase>("loading");
  const [items, setItems] = useState<QuizItem[]>([]);
  const [metaMap, setMetaMap] = useState<Record<string, ReviewItemMeta>>({});
  const [runKey, setRunKey] = useState(0); // 重开一轮 → 换 key 重挂 Runner
  const [result, setResult] = useState<{ pct: number; correct: number; total: number; mastered: number } | null>(null);
  const [emptyKind, setEmptyKind] = useState<"toofew" | "done">("toofew"); // 空态原因:凑不齐题 / 今日已清零
  // 本次会话已「整词全答对」的词(key=kind:term)。「再练一轮」重建时排除它们——它们已 last_correct_date=今天、不再 due,
  // 不该当天重出(修复:再练一轮复用过期 due 快照把已答对词又端出来)。跨轮累积,退出复习(组件卸载)自然清零。
  const sessionMasteredRef = useRef<Set<string>>(new Set());

  const itemById = useMemo(() => {
    const m = new Map<string, QuizItem>();
    for (const it of items) m.set(it.id, it);
    return m;
  }, [items]);

  const aggRef = useRef<Map<string, TermAgg>>(new Map());

  const build = useCallback(async (refetch = false) => {
    setPhase("loading");
    setResult(null);
    aggRef.current = new Map();
    // 出题集:初次用父传入的「今日待复习」快照;「再练一轮」时(refetch)从 DB 重取、按 vocabIsDueToday 重滤
    // ——彻底防过期快照(刚答对的词 last_correct_date=今天 → 不再 due)。再叠一层:排除本次会话已全答对的词。
    let dueSet = favs;
    let pool = poolFavs ?? favs;
    if (refetch) {
      const all = await listLibraryFavorites();
      const reviewable = all.filter((f) => !isFunctionWord(f.term, f.pos));
      dueSet = reviewable.filter(vocabIsDueToday);
      pool = reviewable;
    }
    dueSet = dueSet.filter((f) => !sessionMasteredRef.current.has(`${f.kind}:${f.term}`));
    const built = await buildReviewQuestions(dueSet, mode, pool);
    if (built.items.length === 0) {
      setEmptyKind(refetch ? "done" : "toofew"); // 再练一轮后空=今日清零;初次空=收藏太少
      setPhase("empty");
      return;
    }
    setItems(built.items);
    setMetaMap(built.meta);
    setPhase("quiz");
  }, [favs, poolFavs, mode]);

  useEffect(() => {
    void build();
  }, [build]);

  const onAnswer = useCallback(
    (id: string, isCorrect: boolean, pickedIndex?: number) => {
      const meta = metaMap[id];
      if (!meta) return;
      const key = `${meta.kind}:${meta.term}`;
      const agg = aggRef.current.get(key) ?? { meta, correct: 0, total: 0 };
      agg.total += 1;
      if (isCorrect) agg.correct += 1;
      else if (!agg.firstWrong) {
        const it = itemById.get(id);
        if (it && it.kind === "choice") {
          agg.firstWrong = {
            stem: it.context ? `${it.stem}\n${it.context}` : it.stem,
            opts: it.options,
            answerIdx: it.answerIndex,
            pickedIdx: pickedIndex ?? null,
            explanation: it.explanation ?? null,
          };
        }
      }
      aggRef.current.set(key, agg);
    },
    [metaMap, itemById],
  );

  const onComplete = useCallback(
    async (pct: number, _wrongIds: string[]) => {
      let masteredNow = 0;
      let correctTerms = 0;
      const aggs = [...aggRef.current.values()];
      for (const agg of aggs) {
        const allCorrect = agg.total > 0 && agg.correct === agg.total;
        if (allCorrect) {
          correctTerms += 1;
          sessionMasteredRef.current.add(`${agg.meta.kind}:${agg.meta.term}`); // 本次全对 → 再练一轮不再重出
        }
        const termPct = agg.total > 0 ? Math.round((agg.correct / agg.total) * 100) : 0;
        try {
          await recordLibraryVocabMastery(agg.meta.kind, agg.meta.term, allCorrect ? 100 : termPct);
        } catch (e) {
          console.warn("[library review] mastery write failed", e);
        }
        const streak = await recordVocabStreak(agg.meta.term, agg.meta.kind, allCorrect);
        if (streak?.mastered) masteredNow += 1;
        if (allCorrect) {
          await resolveLibraryVocabMistake(agg.meta.kind, agg.meta.term);
        } else if (agg.firstWrong) {
          await recordLibraryVocabMistake({
            kind: agg.meta.kind,
            term: agg.meta.term,
            stem: agg.firstWrong.stem,
            opts: agg.firstWrong.opts,
            answerIdx: agg.firstWrong.answerIdx,
            pickedIdx: agg.firstWrong.pickedIdx,
            explanation: agg.firstWrong.explanation,
          });
        }
      }
      // 完成一次复习 = 今天学过 → 记连续学习天数(幂等,一天一次)。
      try {
        await bumpReviewStreak();
      } catch (e) {
        console.warn("[library review] streak bump failed", e);
      }
      setResult({ pct, correct: correctTerms, total: aggs.length, mastered: masteredNow });
      setPhase("done");
    },
    [],
  );

  const again = useCallback(() => {
    setRunKey((k) => k + 1);
    void build(true); // 从 DB 重取 due + 排除本次已全对 → 只重出答错的
  }, [build]);

  if (phase === "loading") {
    return <p className="py-16 text-center text-sm text-slate-400">{en ? "Building your quiz…" : "正在出题…"}</p>;
  }
  if (phase === "empty") {
    const done = emptyKind === "done";
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-slate-500">
          {done
            ? (en ? "All caught up for today! 🎉" : "今日待复习都清零啦!🎉")
            : (en ? "Not enough saved words to make a full question yet." : "收藏太少,还凑不齐一道题的选项。")}
        </p>
        <p className="mt-1 text-xs text-slate-400">
          {done
            ? (en ? "Come back tomorrow to keep your streak going." : "明天再来,保持连续学习。")
            : (en ? "Save a few more words while reading, then come back." : "多收藏几个词/语块,或先去精读再来复习。")}
        </p>
        <button
          type="button"
          onClick={onExit}
          className="mt-5 rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-500"
        >
          {en ? "Back" : "返回词库"}
        </button>
      </div>
    );
  }

  return (
    <div>
      <LibraryQuizRunner key={runKey} items={items} onAnswer={onAnswer} onComplete={onComplete} suppressFinish />
      {phase === "done" && result && (
        <GameResult
          title={en ? (result.pct >= 80 ? "Review complete!" : "Keep going!") : result.pct >= 80 ? "复习完成!" : "继续加油!"}
          emoji={result.pct >= 80 ? "🏆" : result.pct >= 60 ? "👍" : "💪"}
          stars={result.pct >= 90 ? 3 : result.pct >= 70 ? 2 : result.pct >= 40 ? 1 : 0}
          lines={
            en
              ? [
                  `All correct on ${result.correct}/${result.total} words`,
                  result.mastered > 0
                    ? `🎉 ${result.mastered} word(s) mastered (${VOCAB_MASTER_STREAK}-day streak)`
                    : `Get a word right on ${VOCAB_MASTER_STREAK} different days to master it — come back tomorrow`,
                ]
              : [
                  `本次全对 ${result.correct}/${result.total} 个词`,
                  result.mastered > 0 ? `🎉 ${result.mastered} 个词达成掌握(连对 ${VOCAB_MASTER_STREAK} 天)` : "连对满 3 天即掌握,明天再来巩固",
                ]
          }
          onAgain={again}
          onHome={onExit}
          againLabel={en ? "🔄 Again" : "🔄 再练一轮"}
          homeLabel={en ? "Back" : "返回词库"}
        />
      )}
    </div>
  );
}
