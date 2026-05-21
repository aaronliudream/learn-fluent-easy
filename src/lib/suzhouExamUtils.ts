import type { ExamPaper, ExamQuestion, ExamSection } from "@/data/exams";

export type ExamMode = "exam" | "practice" | "review";

export const SECTION_META: Record<
  ExamSection,
  { title: string; instruction: string; scoreLabel: string; pointsPerQuestion: number }
> = {
  cloze: {
    title: "第一部分 · 完形填空",
    instruction: "请认真阅读下面短文，从短文后各题所给的 A、B、C、D 四个选项中，选出最佳选项。",
    scoreLabel: "共 10 小题 · 每小题 1 分 · 满分 10 分",
    pointsPerQuestion: 1,
  },
  reading: {
    title: "第二部分 · 阅读理解",
    instruction: "请认真阅读下面短文，从短文后各题所给的 A、B、C、D 四个选项中，选出最佳选项。",
    scoreLabel: "共 15 小题 · 每小题 2 分 · 满分 30 分",
    pointsPerQuestion: 2,
  },
  restore: {
    title: "第三部分 · 信息还原",
    instruction: "请认真阅读下面短文，从短文后的选项中选出能填入空白处的最佳选项。选项中有两项为多余选项。",
    scoreLabel: "共 5 小题 · 每小题 1 分 · 满分 5 分",
    pointsPerQuestion: 1,
  },
  vocab_fill: {
    title: "第四部分 · 词汇运用（第一节）",
    instruction: "根据下列句子所给汉语注释或首字母，写出空缺处各单词的正确形式。每空限填一词。",
    scoreLabel: "共 8 小题 · 每小题 1 分 · 满分 8 分",
    pointsPerQuestion: 1,
  },
  vocab_bank: {
    title: "第四部分 · 词汇运用（第二节）",
    instruction: "请认真阅读下面短文，从方框中选择适当的单词或短语，填入其正确形式。每个单词或短语仅用一次。",
    scoreLabel: "共 5 小题 · 每小题 1 分 · 满分 5 分",
    pointsPerQuestion: 1,
  },
  passage_fill: {
    title: "第五部分 · 短文填空",
    instruction: "请认真阅读下面短文，填入 1 个适当的单词或括号内单词的正确形式。",
    scoreLabel: "共 10 小题 · 每小题 1 分 · 满分 10 分",
    pointsPerQuestion: 1,
  },
  response: {
    title: "第六部分 · 阅读表达",
    instruction: "请认真阅读下面短文，用英语回答文后的问题。",
    scoreLabel: "共 3 小题 · 满分 7 分（54 题 2 分 · 55 题 2 分 · 56 题 3 分）",
    pointsPerQuestion: 2,
  },
  writing: {
    title: "第七部分 · 书面表达",
    instruction: "根据提示用英语写一篇短文。",
    scoreLabel: "共 1 题 · 满分 25 分",
    pointsPerQuestion: 25,
  },
};

const RESPONSE_POINTS: Record<string, number> = { q54: 2, q55: 2, q56: 3 };

export function questionPoints(q: ExamQuestion): number {
  if (q.section === "response") return RESPONSE_POINTS[q.id] ?? 2;
  if (q.section === "writing") return 25;
  return SECTION_META[q.section].pointsPerQuestion;
}

export function isAutoGraded(q: ExamQuestion): boolean {
  return q.type === "multiple_choice" || q.type === "letter_choice" || q.type === "fill_blank";
}

export function normalizeAnswer(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

export function checkCorrect(q: ExamQuestion, userAnswer: string | undefined): boolean | null {
  if (!userAnswer?.trim()) return false;
  if (!isAutoGraded(q)) return null;
  if (q.type === "multiple_choice" || q.type === "letter_choice") {
    return userAnswer.trim().toUpperCase() === q.answer.trim().toUpperCase();
  }
  return normalizeAnswer(userAnswer) === normalizeAnswer(q.answer);
}

export function groupQuestionsBySection(exam: ExamPaper): { section: ExamSection; questions: ExamQuestion[] }[] {
  const order: ExamSection[] = [
    "cloze", "reading", "restore", "vocab_fill", "vocab_bank", "passage_fill", "response", "writing",
  ];
  return order
    .map((section) => ({
      section,
      questions: exam.questions.filter((q) => q.section === section),
    }))
    .filter((g) => g.questions.length > 0);
}

export function sectionScore(
  questions: ExamQuestion[],
  answers: Record<string, string>,
): { earned: number; max: number; correct: number; total: number } {
  let earned = 0;
  let max = 0;
  let correct = 0;
  for (const q of questions) {
    max += questionPoints(q);
    const ok = checkCorrect(q, answers[q.id]);
    if (ok === true) {
      earned += questionPoints(q);
      correct += 1;
    }
  }
  return { earned, max, correct, total: questions.length };
}

export function examAutoScore(exam: ExamPaper, answers: Record<string, string>) {
  const auto = exam.questions.filter(isAutoGraded);
  const earned = auto.reduce((sum, q) => {
    return checkCorrect(q, answers[q.id]) ? sum + questionPoints(q) : sum;
  }, 0);
  const max = auto.reduce((sum, q) => sum + questionPoints(q), 0);
  const correct = auto.filter((q) => checkCorrect(q, answers[q.id])).length;
  return { earned, max, correct, total: auto.length };
}

export function questionNum(id: string): number {
  return parseInt(id.replace("q", ""), 10);
}

/** 阅读理解按篇章分组：材料 + 对应题号 */
export const READING_PASSAGE_BLOCKS = [
  { label: "A", title: "Music Festival", kind: "poster" as const, from: 11, to: 13 },
  { label: "B", passageKey: "reading_B" as const, from: 14, to: 17 },
  { label: "C", passageKey: "reading_C" as const, from: 18, to: 21 },
  { label: "D", passageKey: "reading_D" as const, from: 22, to: 25 },
];

export function readingBlockQuestions(questions: ExamQuestion[], from: number, to: number): ExamQuestion[] {
  return questions.filter((q) => {
    const n = questionNum(q.id);
    return n >= from && n <= to;
  });
}

/** 同一「题组」内的题目：阅读=一篇材料；其他大题=整个部分 */
export function questionsInUnit(exam: ExamPaper, q: ExamQuestion): ExamQuestion[] {
  if (q.section === "reading") {
    const n = questionNum(q.id);
    const block = READING_PASSAGE_BLOCKS.find((b) => n >= b.from && n <= b.to);
    if (!block) return [q];
    return exam.questions.filter(
      (qq) => qq.section === "reading" && questionNum(qq.id) >= block.from && questionNum(qq.id) <= block.to,
    );
  }
  return exam.questions.filter((qq) => qq.section === q.section);
}

export function isUnitComplete(unitQuestions: ExamQuestion[], answers: Record<string, string>): boolean {
  if (!unitQuestions.length) return false;
  return unitQuestions.every((q) => !!answers[q.id]?.trim());
}

export function unitLabelForQuestion(q: ExamQuestion): string {
  if (q.section === "reading") {
    const n = questionNum(q.id);
    const block = READING_PASSAGE_BLOCKS.find((b) => n >= b.from && n <= b.to);
    return block ? `Passage ${block.label}` : "阅读理解";
  }
  return SECTION_META[q.section].title.split("·")[0]?.trim() ?? q.section;
}

export function shouldShowExplanation(
  mode: ExamMode,
  exam: ExamPaper,
  q: ExamQuestion,
  answers: Record<string, string>,
  submitted: boolean,
): boolean {
  if (mode === "review") return true;
  if (mode === "exam") return submitted;
  return isUnitComplete(questionsInUnit(exam, q), answers);
}

export function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export const MODE_LABELS: Record<ExamMode, string> = {
  exam: "考试模式",
  practice: "练习模式",
  review: "复习模式",
};
