export type ExamSection =
  | "grammar"        // 单项填空（2019–2021）
  | "cloze"          // 完形填空
  | "reading"        // 阅读理解
  | "restore"        // 信息还原
  | "vocab_fill"     // 词汇运用 第一节
  | "vocab_bank"     // 词汇运用 第二节
  | "passage_fill"   // 短文填空
  | "translation"    // 句子翻译（2019–2020）
  | "response"       // 阅读表达
  | "writing";       // 书面表达

export type QuestionType =
  | "multiple_choice"
  | "letter_choice"
  | "fill_blank"
  | "short_answer"
  | "essay";

export interface ExamQuestion {
  id: string;
  type: QuestionType;
  section: ExamSection;
  stem: string;
  options?: Record<string, string>;
  answer: string;
  explanation: string;
  knowledge_point: string;
}

export interface ReadingBlock {
  label: string;
  from: number;
  to: number;
  kind?: "passage" | "poster" | "library_poster" | "egg_article";
  passageKey?: string;
  /** resources 中的结构化材料键，如 library_poster_A */
  resourceKey?: string;
  title?: string;
}

export interface ExamPaper {
  id: string;
  title: string;
  province: string;
  city: string;
  year: number;
  total_score: number;
  duration_seconds: number;
  /** 阅读理解篇章分组；未设置时使用默认 2022 布局 */
  reading_blocks?: ReadingBlock[];
  passages: Record<string, string>;
  resources?: Record<string, unknown>;
  questions: ExamQuestion[];
}
