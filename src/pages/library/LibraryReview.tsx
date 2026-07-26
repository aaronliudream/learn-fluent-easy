/**
 * 图书馆词库复习 · 一次复习会话(在「我的词库」内切换进入,不新开路由)。
 * 数据只写三处(DECISIONS.md D14 红线):mastery_progress / library_vocab_favorites / user_mistakes(module=library_vocab)。
 * 聚合口径:一个词本次所有题都答对 = 该词本次「做对」→ 记掌握度 100、跨天连对 +1(同天不重复)、移出错题;
 *           只要错一题 → 掌握度按正确率、跨天连对清零、把「第一处答错」写进错题本。
 *
 * 分批(REVIEW_BATCH_SIZE):一轮只出前 N 个待复习词(sortForReview 定序),不再把今日全量塞进一轮。
 * 中途保存:上面那三处**逐题写**(答完一题立刻落该词的库),中途退出不再整轮作废;
 *           整轮聚合计数(连续学习天数 / 每日复习词数)仍只在整轮完成时各写一次。
 * 断点续做不需要额外状态:答对的词当天不再 due,下次进来自然接着做剩下的。
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LibraryQuizRunner, type QuizItem } from "@/components/library/LibraryQuizRunner";
import GameResult from "@/pages/primaryHub/vocabGames/GameResult";
import { buildReviewQuestions, type ReviewItemMeta, type ReviewMode } from "@/lib/library/reviewQuestions";
import { recordLibraryVocabMastery } from "@/lib/library/mastery";
import {
  recordVocabStreak,
  VOCAB_MASTER_STREAK,
  REVIEW_BATCH_SIZE,
  sortForReview,
  listLibraryFavorites,
  vocabIsDueToday,
  type LibraryFavorite,
} from "@/lib/library/favorites";
import { recordLibraryVocabMistake, resolveLibraryVocabMistake } from "@/lib/library/mistakes";
import { bumpReviewStreak } from "@/lib/library/reviewStreak";
import { bumpReviewDaily } from "@/lib/library/reviewDaily";
import { isFunctionWord } from "@/lib/library/wordClass";

type Phase = "loading" | "empty" | "quiz" | "done";

type TermAgg = {
  meta: ReviewItemMeta;
  correct: number;
  total: number;
  firstWrong?: { stem: string; opts: string[]; answerIdx: number; pickedIdx: number | null; explanation?: string | null };
};

/** 写库失败静默重试一次,再失败只 warn —— 不弹错、不阻塞下一题(逐题写库的可靠性兜底)。 */
async function retryOnce<T>(fn: () => Promise<T>, tag: string): Promise<T | null> {
  try {
    return await fn();
  } catch {
    try {
      return await fn();
    } catch (e) {
      console.warn(`[library review] ${tag} write failed`, e);
      return null;
    }
  }
}

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
  const [result, setResult] = useState<
    { pct: number; correct: number; total: number; mastered: number; remaining: number } | null
  >(null);
  const [emptyKind, setEmptyKind] = useState<"toofew" | "done">("toofew"); // 空态原因:凑不齐题 / 今日已清零
  // 本次会话已「出过题」的词(key=kind:term)。下一批重建时排除它们 → 「再来一轮」永远是不重复的下一批。
  // 含答错的词(它们仍 due,留到下次会话/明天),也含被 assemble 跳过的词(避免同一批反复卡在凑不齐选项的词上)。
  // 跨轮累积,退出复习(组件卸载)自然清零。
  const servedRef = useRef<Set<string>>(new Set());
  // 逐题写库时累计的「本次达成掌握」数(原先在 onComplete 里数,现在写库提前了,计数跟着提前)。
  const masteredRef = useRef(0);
  // 已逐题落库的词,防同词二次写。当前 buildReviewQuestions 是「一词一题」,该集合等价于去重保险。
  const savedRef = useRef<Set<string>>(new Set());

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
    savedRef.current = new Set();
    masteredRef.current = 0;
    // 出题集:初次用父传入的「今日待复习」快照;「再来一轮」时(refetch)从 DB 重取、按 vocabIsDueToday 重滤
    // ——彻底防过期快照(刚答对的词 last_correct_date=今天 → 不再 due)。再叠一层:排除本次会话已出过题的词。
    let dueSet = favs;
    let pool = poolFavs ?? favs;
    if (refetch) {
      const all = await listLibraryFavorites();
      const reviewable = all.filter((f) => !isFunctionWord(f.term, f.pos));
      dueSet = reviewable.filter(vocabIsDueToday);
      pool = reviewable;
    }
    dueSet = dueSet.filter((f) => !servedRef.current.has(`${f.kind}:${f.term}`));
    // 分批:排序(接近掌握的先测 → 久未复习的 → 建档早的)后只取一批,再交给出题器。
    // 切在 buildReviewQuestions 之前 —— 出题器的「一词一题」和虚词过滤是修过的行为,不动它。
    const batch = sortForReview(dueSet).slice(0, REVIEW_BATCH_SIZE);
    const built = await buildReviewQuestions(batch, mode, pool);
    if (built.items.length === 0) {
      setEmptyKind(refetch ? "done" : "toofew"); // 再来一轮后空=今日清零;初次空=收藏太少
      setPhase("empty");
      return;
    }
    // 整批(而非只有成功出题的词)记为已出过 —— 凑不齐 4 个选项的词若留在池里,
    // 会被下一批的排序再次选中、再次跳过,「再来一轮」就卡住不前。代价是「还剩 M 个」
    // 少算这些出不了题的词,对用户无害(它们本来也测不了)。
    for (const f of batch) servedRef.current.add(`${f.kind}:${f.term}`);
    setItems(built.items);
    setMetaMap(built.meta);
    setPhase("quiz");
  }, [favs, poolFavs, mode]);

  useEffect(() => {
    void build();
  }, [build]);

  /**
   * 落一个词的库(掌握度 / 跨天连对 / 错题本)。原先整轮结束才跑,现在答完一题立刻跑 ——
   * 中途退出不再作废,且答对的词立刻 last_correct_date=今天、不再 due,下次进来自然接着做剩下的。
   */
  const persistTerm = useCallback(async (agg: TermAgg) => {
    const { meta, correct, total, firstWrong } = agg;
    const allCorrect = total > 0 && correct === total;
    const termPct = total > 0 ? Math.round((correct / total) * 100) : 0;
    await retryOnce(() => recordLibraryVocabMastery(meta.kind, meta.term, allCorrect ? 100 : termPct), "mastery");
    const streak = await retryOnce(() => recordVocabStreak(meta.term, meta.kind, allCorrect), "streak");
    if (streak?.mastered) masteredRef.current += 1;
    if (allCorrect) {
      await retryOnce(() => resolveLibraryVocabMistake(meta.kind, meta.term), "mistake resolve");
    } else if (firstWrong) {
      await retryOnce(
        () =>
          recordLibraryVocabMistake({
            kind: meta.kind,
            term: meta.term,
            stem: firstWrong.stem,
            opts: firstWrong.opts,
            answerIdx: firstWrong.answerIdx,
            pickedIdx: firstWrong.pickedIdx,
            explanation: firstWrong.explanation,
          }),
        "mistake record",
      );
    }
  }, []);

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
      // 逐题落库(不 await,不挡下一题)。一词一题 → 此刻该词结果已定;savedRef 兜住同词二次写。
      if (!savedRef.current.has(key)) {
        savedRef.current.add(key);
        void persistTerm(agg);
      }
    },
    [metaMap, itemById, persistTerm],
  );

  const onComplete = useCallback(
    async (pct: number, _wrongIds: string[]) => {
      // 逐词的三处写库(掌握度/连对/错题本)已在 onAnswer 逐题跑完,这里不再重跑 ——
      // 只补「整轮」聚合计数,各只 +1,不随题数重复累加。
      const aggs = [...aggRef.current.values()];
      const correctTerms = aggs.filter((a) => a.total > 0 && a.correct === a.total).length;
      // 完成一次复习 = 今天学过 → 记连续学习天数(幂等,一天一次)。
      await retryOnce(() => bumpReviewStreak(), "streak bump");
      // 今天复习了多少个词/块 → 累加(成长图橙柱)。本次涉及的不同词数 = aggs.length。
      void bumpReviewDaily(aggs.length);
      // 还剩多少个词待复习:从 DB 重取(逐题写库后 due 已是最新)再排除本次会话已出过的词。
      let remaining = 0;
      try {
        const all = await listLibraryFavorites();
        remaining = all
          .filter((f) => !isFunctionWord(f.term, f.pos))
          .filter(vocabIsDueToday)
          .filter((f) => !servedRef.current.has(`${f.kind}:${f.term}`)).length;
      } catch (e) {
        console.warn("[library review] remaining count failed", e); // 数不出来 → 按 0 算,只是不给「再来一轮」
      }
      setResult({ pct, correct: correctTerms, total: aggs.length, mastered: masteredRef.current, remaining });
      setPhase("done");
    },
    [],
  );

  // 「再来一轮」永远手动触发,不自动接着开下一批。
  const again = useCallback(() => {
    setRunKey((k) => k + 1);
    void build(true); // 从 DB 重取 due + 排除本次会话已出过的词 → 不重复的下一批
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
          // 还有剩 → 「本轮完成」+ 再来一轮;全清 → 「今日完成」且不给再来一轮的入口。
          title={
            result.remaining > 0
              ? en
                ? result.pct >= 80 ? "Batch complete!" : "Keep going!"
                : result.pct >= 80 ? "本轮完成!" : "继续加油!"
              : en ? "All done for today!" : "今日完成!"
          }
          emoji={result.pct >= 80 ? "🏆" : result.pct >= 60 ? "👍" : "💪"}
          stars={result.pct >= 90 ? 3 : result.pct >= 70 ? 2 : result.pct >= 40 ? 1 : 0}
          lines={
            en
              ? [
                  `All correct on ${result.correct}/${result.total} words`,
                  result.mastered > 0
                    ? `🎉 ${result.mastered} word(s) mastered (${VOCAB_MASTER_STREAK}-day streak)`
                    : `Get a word right on ${VOCAB_MASTER_STREAK} different days to master it — come back tomorrow`,
                  result.remaining > 0
                    ? `${result.remaining} word(s) left for today`
                    : "Nothing left to review today.",
                ]
              : [
                  `本次全对 ${result.correct}/${result.total} 个词`,
                  result.mastered > 0 ? `🎉 ${result.mastered} 个词达成掌握(连对 ${VOCAB_MASTER_STREAK} 天)` : "连对满 3 天即掌握,明天再来巩固",
                  result.remaining > 0 ? `还剩 ${result.remaining} 个词待复习` : "今天的词都复习完啦",
                ]
          }
          onAgain={result.remaining > 0 ? again : undefined}
          onHome={onExit}
          againLabel={en ? "🔄 Next batch" : "🔄 再来一轮"}
          homeLabel={en ? "Back" : "返回词库"}
        />
      )}
    </div>
  );
}
