import { SUZHOU_2022, type ExamPaper } from "./suzhou-2022";

export type { ExamPaper, ExamQuestion, ExamSection, QuestionType } from "./suzhou-2022";
export { SUZHOU_2022 } from "./suzhou-2022";

const EXAMS: Record<string, ExamPaper> = {
  "suzhou-2022": SUZHOU_2022,
};

export function getExam(id: string): ExamPaper | undefined {
  return EXAMS[id];
}

export function listExams(): ExamPaper[] {
  return Object.values(EXAMS);
}
