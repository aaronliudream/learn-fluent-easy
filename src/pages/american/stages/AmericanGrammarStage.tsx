/**
 * 关5 · 语法专项。stage5 题(choice + transform),每题记 am_question;
 * 带 grammar_point_id 的额外记 am_grammar_point(答对2次=考点掌握,供将来专项互通)。
 */
import { useCallback, useMemo } from "react";
import { QuizRunner, questionsToItems } from "@/components/american/QuizRunner";
import { GrammarTipsView, type TipContent } from "@/components/grammar/GrammarTipsCard";
import { markStageComplete, recordMastery, type LessonBundle } from "@/lib/american/data";
import { recordAmericanMistake, americanLessonLabel } from "@/lib/american/americanMistake";

export function AmericanGrammarStage({ bundle, onDone }: { bundle: LessonBundle; onDone?: () => void }) {
  const qs = useMemo(() => bundle.questions.filter((q) => q.stage === 5), [bundle]);
  const gpMap = useMemo(() => new Map(qs.map((q) => [q.id, q.grammar_point_id])), [qs]);
  const items = useMemo(() => questionsToItems(qs), [qs]);

  const onAnswer = useCallback((id: string, ok: boolean) => {
    void recordMastery("am_question", id, ok);
    const gp = gpMap.get(id);
    if (gp) void recordMastery("am_grammar_point", gp, ok);
  }, [gpMap]);

  const onComplete = useCallback(() => {
    void markStageComplete(bundle.lesson.id, 5);
    if (onDone) setTimeout(onDone, 1400);
  }, [bundle.lesson.id, onDone]);

  // 关5「教了再考」:题目前先展示语法小知识折叠卡(本课术语现场拆解)。无卡→不渲染。
  const card = bundle.lesson.grammar_card;
  const header = card ? (
    <div className="mx-auto max-w-2xl px-4 pt-4">
      <GrammarTipsView tip={card as TipContent} />
    </div>
  ) : undefined;

  const label = americanLessonLabel(bundle.lesson);
  return <QuizRunner items={items} onAnswer={onAnswer} onComplete={onComplete}
    onRecordMistake={(it, picked, ok) => recordAmericanMistake(it, picked, ok, label)} header={header} />;
}
