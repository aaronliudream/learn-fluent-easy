export type SentenceLine = {
  en: string;
  zh: string;
};

export type SentenceTrainingType =
  | "listening_response"
  | "fill_word"
  | "sentence_choice"
  | "structure_transfer"
  | "skip_chant"
  | "match"
  | "sentence_order";

export type SentenceTrainingOption = {
  text: string;
  correct: boolean;
};

export type SentenceTraining = {
  type: SentenceTrainingType;
  promptZh?: string;
  scenarioZh?: string;
  sentenceTemplate?: string;
  options?: SentenceTrainingOption[];
  explanationZh?: string;
  skipReason?: "rote_phrase" | "chant_song";
  /** match(连线):多组英↔中配对。 */
  pairs?: SentenceLine[];
  /** sentence_order(连词成句):乱序词块 + 正确顺序。 */
  tokens?: string[];
  answer?: string[];
};

export type SentenceItem = {
  id: string;
  question: SentenceLine;
  answer: SentenceLine | null;
  tag: string;
  /** Optional Stage-3 training drill. Absent or type "skip_chant" → original read-aloud flow. */
  training?: SentenceTraining;
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
