import type { ExamPaper, ExamQuestion } from "@/data/exams";
import { getReadingBlocks, questionNum } from "@/lib/suzhouExamUtils";

export function supportsSuzhouPractice(q: ExamQuestion): boolean {
  return q.type === "multiple_choice" || q.type === "letter_choice";
}

export function buildUserWrongOptionLabel(q: ExamQuestion, userAnswer: string): string | undefined {
  const ans = userAnswer?.trim();
  if (!ans) return undefined;
  if (q.type === "multiple_choice" || q.type === "letter_choice") {
    const letter = ans.toUpperCase();
    const text = q.options?.[letter];
    return text ? `${letter}. ${text}` : letter;
  }
  return ans;
}

/** 供 generate-practice-questions 使用的原题上下文 */
export function buildSuzhouPracticeStem(exam: ExamPaper, q: ExamQuestion): string {
  const num = questionNum(q.id);
  const lines: string[] = [
    `【苏州中考真题 · ${exam.title}】`,
    `第 ${num} 题 · ${q.knowledge_point} · ${q.section}`,
  ];

  if (q.section === "reading") {
    const block = getReadingBlocks(exam).find((b) => num >= b.from && num <= b.to);
    const passageKey = block?.passageKey ?? (block ? `reading_${block.label}` : undefined);
    const passage = passageKey ? exam.passages[passageKey] : undefined;
    if (passage) {
      lines.push("", "【阅读材料节选】", passage.slice(0, 900));
    }
  } else if (q.section === "cloze") {
    const passage = exam.passages.cloze;
    if (passage) lines.push("", "【完形填空材料节选】", passage.slice(0, 900));
  } else if (q.section === "restore") {
    const passage = exam.passages.restore;
    if (passage) lines.push("", "【信息还原对话】", passage.slice(0, 900));
  }

  if (q.stem) lines.push("", "【题干】", q.stem);
  if (q.options && Object.keys(q.options).length > 0) {
    lines.push("", "【选项】", Object.entries(q.options).map(([k, v]) => `${k}. ${v}`).join("  "));
  }
  if (q.explanation) {
    lines.push("", "【解析要点】", q.explanation.slice(0, 400));
  }
  lines.push("", `【正确答案】${q.answer}`);

  return lines.join("\n");
}

export function suzhouSectionHint(section: ExamQuestion["section"]): string {
  switch (section) {
    case "grammar":
      return "单项填空：给出一个含空格的英文句子 + A/B/C/D 四选项，考查语法或词汇辨析";
    case "cloze":
      return "完形填空：给 80~120 词短文节选 + 单句题干 + A/B/C/D，考查上下文逻辑与词汇";
    case "reading":
      return "阅读理解：给 80~120 词英文段落 + 单选 A/B/C/D，考查细节/推理/主旨";
    case "restore":
      return "信息还原：给对话上下文 + 单选 A/B/C/D（选项为句子），考查语篇衔接";
    default:
      return "单选题 A/B/C/D，难度对标苏州中考";
  }
}
