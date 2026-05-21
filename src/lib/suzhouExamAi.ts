import type { ExamPaper, ExamQuestion } from "@/data/exams";
import type { ExamMode } from "@/lib/suzhouExamUtils";
import {
  checkCorrect,
  isAutoGraded,
  questionNum,
  questionsInUnit,
  isUnitComplete,
  shouldShowExplanation,
  getReadingBlocks,
} from "@/lib/suzhouExamUtils";

export function buildQuestionSnapshot(
  exam: ExamPaper,
  q: ExamQuestion,
  answers: Record<string, string>,
  mode: ExamMode,
): Record<string, unknown> {
  const num = questionNum(q.id);
  const userAnswer = answers[q.id] ?? "";
  const ok = checkCorrect(q, userAnswer);
  const passageKey =
    q.section === "reading"
      ? getReadingBlocks(exam).find((b) => num >= b.from && num <= b.to)?.passageKey ??
        `reading_${getReadingBlocks(exam).find((b) => num >= b.from && num <= b.to)?.label ?? "A"}`
      : q.section;

  const passage =
    typeof passageKey === "string" && exam.passages[passageKey]
      ? exam.passages[passageKey].slice(0, 1200)
      : exam.passages[q.section]?.slice(0, 1200);

  return {
    exam_id: exam.id,
    exam_title: exam.title,
    exam_year: exam.year,
    exam_mode: mode,
    question_id: q.id,
    question_num: num,
    section: q.section,
    type: q.type,
    stem: q.stem,
    options: q.options,
    correct_answer: q.answer,
    user_answer: userAnswer,
    is_correct: ok,
    explanation: q.explanation,
    knowledge_point: q.knowledge_point,
    passage_excerpt: passage,
    auto_graded: isAutoGraded(q),
  };
}

export function buildExamSnapshot(
  exam: ExamPaper,
  answers: Record<string, string>,
  mode: ExamMode,
  submitted: boolean,
): Record<string, unknown> {
  const visible = exam.questions.filter((q) =>
    shouldShowExplanation(mode, exam, q, answers, submitted),
  );

  return {
    exam_id: exam.id,
    exam_title: exam.title,
    exam_year: exam.year,
    exam_mode: mode,
    submitted,
    topic: `苏州中考真题 · ${exam.title}`,
    question_count: visible.length,
    questions: visible.map((q) => {
      const snap = buildQuestionSnapshot(exam, q, answers, mode);
      return {
        num: snap.question_num,
        section: q.section,
        stem: q.stem || q.knowledge_point,
        correct_answer: q.answer,
        user_answer: answers[q.id] ?? "",
        is_correct: snap.is_correct,
        knowledge_point: q.knowledge_point,
      };
    }),
  };
}

export function isAssistantUnlocked(
  exam: ExamPaper,
  mode: ExamMode,
  submitted: boolean,
  answers: Record<string, string>,
): boolean {
  if (mode === "review") return true;
  if (mode === "exam") return submitted;
  return exam.questions.some((q) => isUnitComplete(questionsInUnit(exam, q), answers));
}

export function assistantLockedHint(mode: ExamMode): string {
  if (mode === "exam") {
    return "请完成并提交试卷后再问小月，避免提前泄题 ✨";
  }
  return "请先把本题所在题组全部答完，再向小月提问 ✨";
}

export const SUZHOU_TUTOR_STARTERS = [
  "为什么我错了？",
  "帮我讲讲这道题的思路",
  "再出 3 道同类小测练练（也可点下方「练 3 道同类题」按钮）",
];
