/**
 * 关10 · 本课通关。stage10 综合题(choice + transform),得分率 ≥80% 点亮 🏆(见 QuizRunner 结算)。
 */
import { useCallback, useMemo } from "react";
import { QuizRunner, questionsToItems } from "@/components/american/QuizRunner";
import { markStageComplete, recordMastery, type LessonBundle } from "@/lib/american/data";

export function AmericanFinalQuizStage({ bundle, onDone }: { bundle: LessonBundle; onDone?: () => void }) {
  const qs = useMemo(() => bundle.questions.filter((q) => q.stage === 10), [bundle]);
  const items = useMemo(() => questionsToItems(qs), [qs]);

  const onAnswer = useCallback((id: string, ok: boolean) => { void recordMastery("am_question", id, ok); }, []);
  const onComplete = useCallback(() => {
    void markStageComplete(bundle.lesson.id, 10);
    if (onDone) setTimeout(onDone, 1800);
  }, [bundle.lesson.id, onDone]);

  return <QuizRunner items={items} onAnswer={onAnswer} onComplete={onComplete} />;
}
