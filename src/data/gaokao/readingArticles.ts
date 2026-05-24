/**
 * Reading article types + bundle re-export (人教版 PEP PDF-sourced).
 */

export type GaokaoReadingQuestion = {
  id: string;
  sort_order: number;
  stem: string;
  question_type: string;
  question_type_cn: string | null;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: "A" | "B" | "C" | "D";
  explanation_a: string | null;
  explanation_b: string | null;
  explanation_c: string | null;
  explanation_d: string | null;
  general_explanation: string | null;
  locate_paragraph: number | null;
  key_sentence: string | null;
  difficulty: number;
};

export type GaokaoReadingArticleSeed = {
  id: string;
  title: string;
  body: string;
  grade_band: "g1" | "g2" | "g3";
  year_band: 1 | 2 | 3;
  pep_book: string;
  pep_unit: string;
  word_count: number;
  recommended_minutes: number;
  difficulty: number;
  cefr_level: string;
  genre: string;
  genre_label: string;
  specific_topic: string;
  topic_group: string;
  theme_context: string;
  lexile_score: number;
  sub_band: string | null;
  source_label: string;
  sort_order: number;
  paragraph_structure: string | null;
  writing_techniques: string | null;
  core_question_types: string | null;
  exam_strategies: string | null;
  topic_connection: string | null;
  useful_sentences: { en: string; cn: string }[] | null;
  argumentation_logic: string | null;
  questions: GaokaoReadingQuestion[];
};

import pepBundle from "@/data/gaokao/pep-bundle.json";

/** Hand-curated 必修一 passages kept in bundle build; full list from PDF extract. */
export const GAOKAO_READING_ARTICLES = pepBundle.readingArticles as GaokaoReadingArticleSeed[];
