import { LEVELS, LESSON_CONTENT, type LessonContent } from "@/data/course";
import PREGENERATED_LESSONS from "@/data/aiLessons.json";

const PREGEN_MAP = PREGENERATED_LESSONS as unknown as Record<string, LessonContent>;

/** Lowercase + strip very common English inflections so "books" ~ "book". */
const normalizeWord = (raw: string): string => {
  let w = raw.toLowerCase().trim();
  // strip surrounding punctuation
  w = w.replace(/^[^a-z']+|[^a-z']+$/g, "");
  if (!w) return "";
  // simple stemmer — good enough to catch dup vocab across lessons
  if (w.length > 4 && w.endsWith("ies")) return w.slice(0, -3) + "y";
  if (w.length > 3 && w.endsWith("es")) return w.slice(0, -2);
  if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss")) return w.slice(0, -1);
  if (w.length > 4 && w.endsWith("ing")) return w.slice(0, -3);
  if (w.length > 4 && w.endsWith("ed")) return w.slice(0, -2);
  return w;
};

const tokenize = (text: string): string[] => {
  return text
    .split(/[^A-Za-z']+/)
    .map(normalizeWord)
    .filter((w) => w.length > 0);
};

const collectWordsFromLesson = (title: string, set: Set<string>) => {
  const c = LESSON_CONTENT[title] ?? PREGEN_MAP[title];
  if (!c) return;
  c.vocab?.forEach((v) => {
    const n = normalizeWord(v.word);
    if (n) set.add(n);
  });
  c.reading?.forEach((p) => {
    tokenize(p.en ?? "").forEach((w) => set.add(w));
  });
};

/**
 * Returns the set of (normalized) English words that have already appeared
 * in any lesson BEFORE the given lesson coordinate, looking at both vocab
 * lists and reading passages. Used by the Vocabulary section to keep only
 * brand-new words for the current lesson.
 */
export const getPriorLessonWords = (
  levelId: number,
  unitId: number,
  lessonId: number,
): Set<string> => {
  const seen = new Set<string>();
  outer: for (const level of LEVELS) {
    for (const unit of level.units) {
      for (const lesson of unit.lessons) {
        if (
          level.id === levelId &&
          unit.id === unitId &&
          lesson.id === lessonId
        ) {
          break outer;
        }
        collectWordsFromLesson(lesson.title, seen);
      }
    }
  }
  return seen;
};

export const isWordNew = (word: string, seen: Set<string>): boolean => {
  const n = normalizeWord(word);
  if (!n) return true;
  return !seen.has(n);
};