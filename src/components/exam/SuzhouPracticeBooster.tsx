import { PracticeBooster } from "@/components/exam/PracticeBooster";
import type { ExamPaper, ExamQuestion } from "@/data/exams";
import {
  buildSuzhouPracticeStem,
  buildUserWrongOptionLabel,
  supportsSuzhouPractice,
} from "@/lib/suzhouExamPractice";

/** 苏州卷 · 解析后一键练 3 道同类选择题 */
export function SuzhouPracticeBooster({
  exam,
  question,
  userAnswer,
}: {
  exam: ExamPaper;
  question: ExamQuestion;
  userAnswer: string;
}) {
  if (!supportsSuzhouPractice(question)) return null;

  return (
    <PracticeBooster
      module="junior_suzhou_exam"
      examLevel="junior_suzhou"
      section={question.section}
      sourceQuestionId={`${exam.id}:${question.id}`}
      sourceQuestionStem={buildSuzhouPracticeStem(exam, question)}
      fallbackKnowledgePointLabel={question.knowledge_point}
      userWrongOption={buildUserWrongOptionLabel(question, userAnswer)}
      startLabel="练 3 道同类题"
    />
  );
}
