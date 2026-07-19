/**
 * 关9 · 情景应答。stage9 情景题(reveal 型):看情景 → 想怎么回应 → 显示参考答案自评。
 */
import { useCallback, useMemo } from "react";
import { QuizRunner, questionsToItems } from "@/components/american/QuizRunner";
import { markStageComplete, recordMastery, type LessonBundle } from "@/lib/american/data";
import { recordAmericanMistake, americanLessonLabel } from "@/lib/american/americanMistake";

export function AmericanScenarioStage({ bundle, onDone }: { bundle: LessonBundle; onDone?: () => void }) {
  const qs = useMemo(() => bundle.questions.filter((q) => q.stage === 9), [bundle]);
  const items = useMemo(() => questionsToItems(qs), [qs]);

  const onAnswer = useCallback((id: string, ok: boolean) => { void recordMastery("am_question", id, ok); }, []);
  const onComplete = useCallback(() => {
    void markStageComplete(bundle.lesson.id, 9);
    if (onDone) setTimeout(onDone, 1400);
  }, [bundle.lesson.id, onDone]);

  const label = americanLessonLabel(bundle.lesson);
  return <QuizRunner items={items} onAnswer={onAnswer} onComplete={onComplete}
    onRecordMistake={(it, picked, ok) => recordAmericanMistake(it, picked, ok, label)} />;
}
