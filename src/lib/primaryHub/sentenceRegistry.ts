import g4v2U1Grammar from "@/data/primaryHub/sentence/g4v2_u1_grammar.json";
import type { SentenceLessonConfig } from "./sentenceTypes";

const LESSONS: SentenceLessonConfig[] = [g4v2U1Grammar as SentenceLessonConfig];

export function getSentenceLesson(unitId: string, stageIdx: number): SentenceLessonConfig | null {
  return LESSONS.find((l) => l.unitId === unitId && l.stageIdx === stageIdx) ?? null;
}
