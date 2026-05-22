import type { ExamPaper, ExamQuestion, ExamSection } from "@/data/exams";
import type { DiagnosisRow, NextStepCard } from "@/components/exam/DiagnosisExtras";
import { supabase } from "@/integrations/supabase/client";
import {
  checkCorrect,
  getSectionMeta,
  groupQuestionsBySection,
  isAutoGraded,
  questionNum,
  sectionScore,
  type ExamMode,
} from "@/lib/suzhouExamUtils";

export type SectionScoreRow = {
  section: ExamSection;
  label: string;
  earned: number;
  max: number;
  correct: number;
  total: number;
  pct: number;
};

const SECTION_TRAP: Partial<Record<ExamSection, string>> = {
  grammar: "语法规则混淆",
  cloze: "语境线索忽略",
  reading: "细节定位偏差",
  restore: "段落匹配错误",
  vocab_fill: "词形变化失误",
  vocab_bank: "词义搭配错误",
  passage_fill: "语法形式错误",
  translation: "中英转换偏差",
  response: "要点提取不全",
};

export function formatSuzhouAnswer(q: ExamQuestion, raw?: string): string {
  if (!raw?.trim()) return "—";
  const a = raw.trim();
  if (q.type === "multiple_choice" || q.type === "letter_choice") {
    const opt = q.options?.[a.toUpperCase()] ?? q.options?.[a.toLowerCase()];
    return opt ? `${a.toUpperCase()}. ${opt}` : a.toUpperCase();
  }
  return a;
}

export function buildSectionScores(
  exam: ExamPaper,
  answers: Record<string, string>,
): SectionScoreRow[] {
  return groupQuestionsBySection(exam)
    .filter((g) => g.questions.some(isAutoGraded))
    .map(({ section, questions }) => {
      const graded = questions.filter(isAutoGraded);
      const sc = sectionScore(graded, answers, exam);
      const label = getSectionMeta(exam, section).title.split("·")[0]?.trim() ?? section;
      const pct = sc.max ? Math.round((sc.earned / sc.max) * 100) : 0;
      return { section, label, earned: sc.earned, max: sc.max, correct: sc.correct, total: sc.total, pct };
    });
}

export function buildSuzhouDiagnosisRows(
  exam: ExamPaper,
  answers: Record<string, string>,
): DiagnosisRow[] {
  return exam.questions.filter(isAutoGraded).map((q) => {
    const isCorrect = checkCorrect(q, answers[q.id]) === true;
    return {
      index: questionNum(q.id),
      point: q.knowledge_point || getSectionMeta(exam, q.section).title.split("·")[0]?.trim() || q.section,
      isCorrect,
      trap: isCorrect ? null : SECTION_TRAP[q.section] ?? "知识盲区",
    };
  });
}

export function pickWeakestSections(rows: SectionScoreRow[], limit = 2): string[] {
  return [...rows]
    .filter((r) => r.max > 0)
    .sort((a, b) => a.pct - b.pct)
    .slice(0, limit)
    .map((r) => r.label);
}

export function countSuzhouMistakes(exam: ExamPaper, answers: Record<string, string>): number {
  return exam.questions.filter(isAutoGraded).filter((q) => checkCorrect(q, answers[q.id]) === false).length;
}

export function findFirstWrongQuestion(
  exam: ExamPaper,
  answers: Record<string, string>,
): ExamQuestion | null {
  return exam.questions.filter(isAutoGraded).find((q) => checkCorrect(q, answers[q.id]) === false) ?? null;
}

export async function saveSuzhouMistakes(exam: ExamPaper, answers: Record<string, string>) {
  try {
    const { data: u } = await supabase.auth.getUser();
    if (!u?.user) return;
    const wrong = exam.questions.filter(isAutoGraded).filter((q) => checkCorrect(q, answers[q.id]) === false);
    if (wrong.length === 0) return;

    await Promise.all(
      wrong.map((q) =>
        supabase.from("user_mistakes").upsert(
          {
            user_id: u.user!.id,
            module: "junior_suzhou_exam",
            source_key: `${exam.id}:${q.id}`,
            source_label: `${exam.title} · 第${questionNum(q.id)}题`,
            question: q.stem?.trim() || q.knowledge_point || `第${questionNum(q.id)}题`,
            user_answer: formatSuzhouAnswer(q, answers[q.id]),
            correct_answer: formatSuzhouAnswer(q, q.answer),
            explanation: q.explanation || null,
            snapshot: {
              exam_id: exam.id,
              exam_title: exam.title,
              question_id: q.id,
              section: q.section,
              knowledge_point: q.knowledge_point,
            },
            last_wrong_at: new Date().toISOString(),
            is_resolved: false,
          } as any,
          { onConflict: "user_id,module,source_key" },
        ),
      ),
    );
  } catch {
    /* non-blocking */
  }
}

export function buildSuzhouNextSteps({
  examId,
  examTitle,
  weakestLabel,
  mistakeCount,
  onAskAI,
  navigate,
}: {
  examId: string;
  examTitle: string;
  weakestLabel: string;
  mistakeCount: number;
  onAskAI: () => void;
  navigate: (path: string) => void;
}): NextStepCard[] {
  return [
    {
      tag: "薄弱板块",
      title: `${weakestLabel || "重点板块"} · 再练一遍`,
      desc: `针对《${examTitle}》中得分较低的板块，用练习模式重新巩固。`,
      meta: "约 20–40 分钟 · 可暂停保存",
      onClick: () => navigate(`/junior/suzhou/${examId}?mode=practice`),
    },
    {
      tag: "错题攻坚",
      title: mistakeCount > 0 ? `${mistakeCount} 道错题已入库` : "巩固今日所学",
      desc:
        mistakeCount > 0
          ? "错题本会在 1、3、7、14 天后安排复习，直到连续两次答对。"
          : "本次客观题全对，可和小月聊聊书面表达或阅读长难句。",
      meta: mistakeCount > 0 ? "约 10 分钟 · FSRS 复习" : "随时可问 AI",
      onClick: () => (mistakeCount > 0 ? navigate("/mistakes") : onAskAI()),
    },
    {
      tag: "更多真题",
      title: "换一套苏州真题模考",
      desc: "在不同年份真题中迁移今天学到的解题方法。",
      meta: "约 90 分钟 · 考试/练习模式",
      onClick: () => navigate("/junior/suzhou"),
    },
  ];
}

export type AutoScore = {
  earned: number;
  max: number;
  correct: number;
  total: number;
};

export function buildReportPayload({
  exam,
  answers,
  mode,
  autoScore,
}: {
  exam: ExamPaper;
  answers: Record<string, string>;
  mode: Exclude<ExamMode, "review">;
  autoScore: AutoScore;
}) {
  const sectionScores = buildSectionScores(exam, answers);
  const diagnosis = buildSuzhouDiagnosisRows(exam, answers);
  const mistakeCount = countSuzhouMistakes(exam, answers);
  const weakSections = pickWeakestSections(sectionScores);
  const scorePct = autoScore.max ? Math.round((autoScore.earned / autoScore.max) * 100) : 0;

  return {
    examId: exam.id,
    examTitle: exam.title,
    mode,
    scorePct,
    earned: autoScore.earned,
    maxScore: autoScore.max,
    correctCount: autoScore.correct,
    totalGraded: autoScore.total,
    mistakeCount,
    sectionScores,
    diagnosis,
    weakSections,
    answers: { ...answers },
    submittedAt: new Date().toISOString(),
  };
}
