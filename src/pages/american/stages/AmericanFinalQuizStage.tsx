/**
 * 关10 · 本课通关(Plan C #3)。
 * 口径:关10 全对才通关亮星 🏆。某轮有错 → 该轮结束直接重考错题子集(选项重新打散防背位置),
 * 循环到某轮全对才 markStageComplete + 亮星。每题作答记 am_question(答错也进 SRS 复习池)。
 */
import { useCallback, useMemo, useState } from "react";
import { T } from "@/i18n/T";
import { QuizRunner, questionsToItems, type QuizItem } from "@/components/american/QuizRunner";
import { markStageComplete, recordMastery, type LessonBundle } from "@/lib/american/data";
import { recordAmericanMistake, americanLessonLabel } from "@/lib/american/americanMistake";

/** choice 选项重新打散并回算 answerIndex(reveal 无选项,原样返回)。 */
function reshuffle(item: QuizItem): QuizItem {
  if (item.kind !== "choice") return item;
  const correct = item.options[item.answerIndex];
  const opts = item.options.slice();
  for (let i = opts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [opts[i], opts[j]] = [opts[j], opts[i]];
  }
  return { ...item, options: opts, answerIndex: opts.indexOf(correct) };
}

export function AmericanFinalQuizStage({ bundle, onDone }: { bundle: LessonBundle; onDone?: () => void }) {
  const allItems = useMemo(
    () => questionsToItems(bundle.questions.filter((q) => q.stage === 10)),
    [bundle],
  );
  const [roundItems, setRoundItems] = useState<QuizItem[]>(() => allItems);
  const [round, setRound] = useState(0);
  const [passed, setPassed] = useState(false);

  const onAnswer = useCallback((id: string, ok: boolean) => { void recordMastery("am_question", id, ok); }, []);

  const onComplete = useCallback((_pct: number, wrongIds: string[]) => {
    const wrongSet = new Set(wrongIds);
    const wrongItems = roundItems.filter((it) => wrongSet.has(it.id));
    if (wrongItems.length === 0) {
      // 全对 → 通关 + 亮星
      void markStageComplete(bundle.lesson.id, 10);
      setPassed(true);
      if (onDone) setTimeout(onDone, 1800);
    } else {
      // 有错 → 重考错题子集(选项重打散),轮次+1
      setRoundItems(wrongItems.map(reshuffle));
      setRound((r) => r + 1);
    }
  }, [roundItems, bundle.lesson.id, onDone]);

  const label = americanLessonLabel(bundle.lesson);

  if (passed) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-5xl">🏆</p>
        <h2 className="mt-3 text-xl font-bold text-slate-800"><T>本课通关!</T></h2>
        <p className="mt-1 text-sm text-slate-500"><T>全部答对,拿下这一课</T></p>
      </div>
    );
  }

  return (
    <div>
      {round > 0 && (
        <div className="mx-auto mt-4 max-w-2xl px-4">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
            <T>重考错题</T> · <T>第</T> {round} <T>轮</T> · <T>还剩</T> {roundItems.length} <T>题,全对才通关</T>
          </div>
        </div>
      )}
      <QuizRunner key={round} items={roundItems} onAnswer={onAnswer} onComplete={onComplete}
        onRecordMistake={(it, picked, ok) => recordAmericanMistake(it, picked, ok, label)} suppressFinish />
    </div>
  );
}
