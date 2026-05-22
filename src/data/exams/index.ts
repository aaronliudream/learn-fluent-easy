import { SUZHOU_2019 } from "./suzhou-2019";
import { SUZHOU_2020 } from "./suzhou-2020";
import { SUZHOU_2021 } from "./suzhou-2021";
import { SUZHOU_2022 } from "./suzhou-2022";
import { SUZHOU_2023 } from "./suzhou-2023";
import { SUZHOU_2024 } from "./suzhou-2024";
import type { ExamPaper } from "./types";

export type { ExamPaper, ExamQuestion, ExamSection, QuestionType, ReadingBlock } from "./types";
export { SUZHOU_2019 } from "./suzhou-2019";
export { SUZHOU_2020 } from "./suzhou-2020";
export { SUZHOU_2021 } from "./suzhou-2021";
export { SUZHOU_2022 } from "./suzhou-2022";
export { SUZHOU_2023 } from "./suzhou-2023";
export { SUZHOU_2024 } from "./suzhou-2024";

const EXAMS: Record<string, ExamPaper> = {
  "suzhou-2024": SUZHOU_2024,
  "suzhou-2023": SUZHOU_2023,
  "suzhou-2022": SUZHOU_2022,
  "suzhou-2021": SUZHOU_2021,
  "suzhou-2020": SUZHOU_2020,
  "suzhou-2019": SUZHOU_2019,
};

export function getExam(id: string): ExamPaper | undefined {
  return EXAMS[id];
}

export function listExams(): ExamPaper[] {
  return Object.values(EXAMS).sort((a, b) => b.year - a.year);
}
