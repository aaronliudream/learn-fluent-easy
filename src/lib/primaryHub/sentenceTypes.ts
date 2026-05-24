export type SentenceLine = {
  en: string;
  zh: string;
};

export type SentenceItem = {
  id: string;
  question: SentenceLine;
  answer: SentenceLine | null;
  tag: string;
};

export type SentenceSubModule = {
  id: "A" | "B";
  title: string;
  description: string;
  color: "blue" | "pink";
  estimatedMinutes: number;
  lockedUntil?: "A";
  sentences: SentenceItem[];
};

export type SentenceLessonConfig = {
  lessonId: string;
  unitId: string;
  stageIdx: number;
  title: string;
  transitionMessage: string;
  subModules: SentenceSubModule[];
};
