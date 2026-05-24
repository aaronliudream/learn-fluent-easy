/**

 * High-school (gaokao) content — 人教版 PEP bundled data (from 7 PDFs).

 */



import catalogJson from "@/data/gaokao/catalog.json";

import pepBundle from "@/data/gaokao/pep-bundle.json";

import type { GrammarQuestion } from "@/components/grammar/GrammarQuestionCard";

import type { GaokaoReadingArticleSeed } from "@/data/gaokao/readingArticles";

import type { GaokaoGradeBand } from "@/lib/gaokaoPep";

import { bookById, type GaokaoPepBookId } from "@/lib/gaokaoPep";



export type GaokaoCatalogPoint = {

  id?: string;

  slug: string;

  kp_id: string;

  title: string;

  cefr: string;

  grade_band: GaokaoGradeBand;

  year_band: 1 | 2 | 3;

  pep_book: GaokaoPepBookId;

  pep_unit: string;

  module_code: string;

  category_code: string;

  explanation: string;

  typical_example: string | null;

  common_mistake: string | null;

  exam_frequency: string;

  difficulty: number;

  sort_order: number;

};



export type GaokaoCatalogModule = {

  id: string;

  code: string;

  name_cn: string;

  name_en: string;

  emoji: string;

  description_cn: string | null;

  sort_order: number;

};



export type GaokaoCatalogCategory = {

  id: string;

  module_id: string;

  code: string;

  name_cn: string;

  name_en: string;

  difficulty: number;

  exam_frequency: string;

  sort_order: number;

};



export type GaokaoVocabEntry = {

  id: string;

  word: string;

  phonetic: string | null;

  pos: string | null;

  meaning_cn: string;

  meaning_en: string | null;

  example_en: string | null;

  example_cn: string | null;

  star_level: number | null;

  accent: "UK" | "US" | "BOTH" | null;

  theme: string | null;

  freq_rank: number | null;

  exam_frequency: number | null;

  gaokao_level: number | null;

  year_band: number;

  grade_band: GaokaoGradeBand;

  pep_book: GaokaoPepBookId;

  is_hot_topic: boolean | null;

};



export type GaokaoWritingPrompt = {

  id: string;

  topic: string;

  year_band: number;

  grade_band: GaokaoGradeBand;

  pep_book: GaokaoPepBookId;

  prompt_cn: string;

  prompt_en: string;

  requirements: string[];

  min_words: number;

  max_words: number;

  difficulty: number;

  sample_answer: string | null;

  scoring_rubric: string | null;

  title_en: string | null;

  high_sentences: string[];

  error_pairs: { wrong: string; correct: string; note?: string }[];

  paragraph_template: string | null;

};



export type GaokaoListeningQuestion = {

  type?: "choice" | "fill" | "judge";

  q: string;

  options: string[];

  answer: string;

  explanation?: string;

};



export type GaokaoListeningExercise = {

  id: string;

  title: string;

  topic: string | null;

  year_band: number;

  grade_band: GaokaoGradeBand;

  pep_book: GaokaoPepBookId;

  difficulty: number;

  kind: string | null;

  duration_sec: number | null;

  transcript: string;

  translation_cn: string | null;

  questions: GaokaoListeningQuestion[];

  key_vocab: { word: string; cn: string }[];

  audio_url: string | null;

};



export type GaokaoClozeBlank = {

  id: string;

  blank_no: number;

  option_a: string;

  option_b: string;

  option_c: string;

  option_d: string;

  correct_answer: string;

  pos_tag: string | null;

  skill_tag: string | null;

  skill_method: string | null;

  general_explanation: string | null;

  explanation_a: string | null;

  explanation_b: string | null;

  explanation_c: string | null;

  explanation_d: string | null;

};



export type GaokaoClozePassage = {

  id: string;

  passage_no: number;

  title: string;

  topic: string | null;

  topic_group: string | null;

  genre: string | null;

  difficulty: number;

  word_count: number | null;

  blank_count: number;

  recommended_minutes: number;

  source_book_label: string;

  year_band: number;

  grade_band: GaokaoGradeBand;

  pep_book: GaokaoPepBookId;

  is_published: boolean;

  sort_order: number;

  body_with_placeholders: string;

  translation_zh: string | null;

  article_analysis: string | null;

  exam_points: string | null;

  blanks: GaokaoClozeBlank[];

};



const MODULE_IDS: Record<string, string> = {

  sentence: "a1111111-1111-4111-8111-000000000001",

  tense: "a1111111-1111-4111-8111-000000000002",

  clause: "a1111111-1111-4111-8111-000000000003",

};



const CATEGORY_IDS: Record<string, string> = {

  "basic-sv": "c1111111-1111-4111-8111-000000000001",

  phrases: "c1111111-1111-4111-8111-000000000002",

  "present-continuous": "c1111111-1111-4111-8111-000000000003",

};



const catalog = catalogJson as {

  modules: Omit<GaokaoCatalogModule, "id">[];

  categories: (Omit<GaokaoCatalogCategory, "id" | "module_id"> & { module_code: string })[];

};



type PepBundle = {

  points: GaokaoCatalogPoint[];

  grammarQuestions: Record<string, GrammarQuestion[]>;

  readingArticles: GaokaoReadingArticleSeed[];

  vocab?: GaokaoVocabEntry[];

  writingPrompts?: GaokaoWritingPrompt[];

  listeningExercises?: GaokaoListeningExercise[];

  clozePassages?: GaokaoClozePassage[];

};



const bundle = pepBundle as PepBundle;



const POINT_ID_BY_SLUG: Record<string, string> = Object.fromEntries(

  bundle.points.map((p) => [p.slug, p.id ?? p.slug]),

);



export function gaokaoPointUuid(slug: string): string {

  return POINT_ID_BY_SLUG[slug] ?? slug;

}



export function listGrammarModules(): GaokaoCatalogModule[] {

  return catalog.modules

    .map((m) => ({ ...m, id: MODULE_IDS[m.code] ?? m.code }))

    .sort((a, b) => a.sort_order - b.sort_order);

}



export function listGrammarCategories(): GaokaoCatalogCategory[] {

  return catalog.categories

    .map((c) => ({

      id: CATEGORY_IDS[c.code] ?? c.code,

      module_id: MODULE_IDS[c.module_code] ?? c.module_code,

      code: c.code,

      name_cn: c.name_cn,

      name_en: c.name_en,

      difficulty: c.difficulty,

      exam_frequency: c.exam_frequency,

      sort_order: c.sort_order,

    }))

    .sort((a, b) => a.sort_order - b.sort_order);

}



export function listGrammarPoints(opts?: {

  yearBand?: number | null;

  gradeBand?: GaokaoGradeBand | null;

}): (GaokaoCatalogPoint & { id: string; question_count: number; module_id: string; category_id: string })[] {

  let pts = bundle.points;

  if (opts?.yearBand) pts = pts.filter((p) => p.year_band === opts.yearBand);

  if (opts?.gradeBand) pts = pts.filter((p) => p.grade_band === opts.gradeBand);

  return pts

    .map((p) => ({

      ...p,

      id: gaokaoPointUuid(p.slug),

      module_id: MODULE_IDS[p.module_code] ?? p.module_code,

      category_id: CATEGORY_IDS[p.category_code] ?? p.category_code,

      question_count: (bundle.grammarQuestions[p.slug] ?? []).length,

    }))

    .sort((a, b) => a.sort_order - b.sort_order);

}



export function getGrammarPointBySlug(slug: string) {

  const p = bundle.points.find((x) => x.slug === slug);

  if (!p) return null;

  const book = bookById(p.pep_book);

  return {

    ...p,

    id: gaokaoPointUuid(p.slug),

    module_id: MODULE_IDS[p.module_code] ?? p.module_code,

    category_id: CATEGORY_IDS[p.category_code] ?? p.category_code,

    pep_book_label: book?.label ?? p.pep_book,

    question_count: (bundle.grammarQuestions[p.slug] ?? []).length,

  };

}



export function getGrammarQuestionsForPoint(slug: string): GrammarQuestion[] {

  return (bundle.grammarQuestions[slug] ?? []) as GrammarQuestion[];

}



export function listReadingArticles(opts?: {

  yearBand?: number | null;

  gradeBand?: GaokaoGradeBand | null;

}): GaokaoReadingArticleSeed[] {

  let list = bundle.readingArticles as GaokaoReadingArticleSeed[];

  if (opts?.yearBand) list = list.filter((a) => a.year_band === opts.yearBand);

  if (opts?.gradeBand) list = list.filter((a) => a.grade_band === opts.gradeBand);

  return [...list].sort((a, b) => a.sort_order - b.sort_order);

}



export function getReadingArticleById(id: string): GaokaoReadingArticleSeed | null {

  return (bundle.readingArticles as GaokaoReadingArticleSeed[]).find((a) => a.id === id) ?? null;

}



export function listGaokaoVocab(opts?: { yearBand?: number | null }): GaokaoVocabEntry[] {

  let list = bundle.vocab ?? [];

  if (opts?.yearBand) list = list.filter((v) => v.year_band === opts.yearBand);

  return [...list].sort((a, b) => (a.freq_rank ?? 0) - (b.freq_rank ?? 0));

}



export function listWritingPrompts(opts?: { yearBand?: number | null }): GaokaoWritingPrompt[] {

  let list = bundle.writingPrompts ?? [];

  if (opts?.yearBand) list = list.filter((p) => p.year_band === opts.yearBand);

  return [...list].sort((a, b) => a.year_band - b.year_band || a.topic.localeCompare(b.topic));

}



export function getWritingPromptById(id: string): GaokaoWritingPrompt | null {

  return (bundle.writingPrompts ?? []).find((p) => p.id === id) ?? null;

}



export function listListeningExercises(opts?: { yearBand?: number | null }): GaokaoListeningExercise[] {

  let list = bundle.listeningExercises ?? [];

  if (opts?.yearBand) list = list.filter((e) => e.year_band === opts.yearBand);

  return [...list].sort((a, b) => a.title.localeCompare(b.title));

}



export function getListeningExerciseById(id: string): GaokaoListeningExercise | null {

  return (bundle.listeningExercises ?? []).find((e) => e.id === id) ?? null;

}



export function listClozePassages(opts?: { yearBand?: number | null }): GaokaoClozePassage[] {

  let list = (bundle.clozePassages ?? []).filter((p) => p.is_published);

  if (opts?.yearBand) list = list.filter((p) => p.year_band === opts.yearBand);

  return [...list].sort((a, b) => a.sort_order - b.sort_order);

}



export function getClozePassageById(id: string): GaokaoClozePassage | null {

  return (bundle.clozePassages ?? []).find((p) => p.id === id) ?? null;

}



export function isLocalPepClozePassage(id: string): boolean {

  return (bundle.clozePassages ?? []).some((p) => p.id === id);

}



export function grammarMetaTag(point: GaokaoCatalogPoint): string {

  const grade =

    point.grade_band === "g1" ? "高一" : point.grade_band === "g2" ? "高二" : "高三";

  const topic = point.title.split("（")[0].split("(")[0].trim();

  return `${grade}-${topic}-${point.cefr}`;

}



export function countLocalGrammarPoints(): number {

  return bundle.points.length;

}



export function countLocalReadingArticles(): number {

  return bundle.readingArticles.length;

}



export function countLocalGaokaoVocab(): number {

  return bundle.vocab?.length ?? 0;

}



export function countLocalClozePassages(): number {

  return bundle.clozePassages?.length ?? 0;

}



export function countLocalWritingPrompts(): number {

  return bundle.writingPrompts?.length ?? 0;

}



export function countLocalListeningExercises(): number {

  return bundle.listeningExercises?.length ?? 0;

}



export function pepSourceLabel(point: GaokaoCatalogPoint): string {

  const book = bookById(point.pep_book);

  return `人教版 ${book?.label ?? point.pep_book} · ${point.pep_unit}`;

}


