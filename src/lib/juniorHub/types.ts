export type JuniorHubGrade = 7 | 8 | 9;

export type VocabItem = { en: string; cn: string; emoji: string };

export type QuizQuestion = {
  q: string;
  opts: string[];
  answer: number;
  point?: string;
  dim?: "vocab" | "grammar" | "reading" | "listening" | "writing";
  audio?: string;
  unitTitle?: string;
  id?: number;
};

export type ListeningQuestion = {
  audio: string;
  opts: string[];
  answer: number;
};

export type ReadingBlock = {
  passage: string;
  passageCn: string;
  questions: QuizQuestion[];
};

export type WritingBlock = {
  prompt: string;
  promptCn: string;
  sampleWords: string[];
};

export type StageDef = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  type:
    | "vocab"
    | "listenWord"
    | "match"
    | "grammar"
    | "reading"
    | "listening"
    | "writing"
    | "finalQuiz";
  time: string;
};

export type UnitDef = {
  id: string;
  num: number;
  unitKey: string;
  book: string;
  title: string;
  cn: string;
  emoji: string;
  available: boolean;
  vocabulary: VocabItem[];
  dialogues: Array<{ title: string; lines: Array<{ role: string; text: string; cn: string }> }>;
  stages: StageDef[];
  grammarTitle: string;
  grammarCode: string | null;
  grammarQuiz: QuizQuestion[];
  reading: ReadingBlock | null;
  writing: WritingBlock | null;
  quizQuestions: QuizQuestion[];
  listeningQuestions: ListeningQuestion[];
};

export type SemesterDef = {
  name: string;
  available: boolean;
  units: UnitDef[];
};

export type GradeCourseDef = {
  name: string;
  semesters: Record<string, SemesterDef>;
};

export type UnitState = {
  completedStages: number[];
  stars: number;
  firstCompleteDate: string | null;
  lastAiTestAtProgress: number;
};

export type Mistake = QuizQuestion & {
  unitId?: string;
  unitTitle?: string;
  date?: string;
  id: number;
};

export type DimResults = Record<string, { correct: number; total: number }>;

export type AITestRecord = {
  date: string;
  time: string;
  correct: number;
  total: number;
  percent: number;
  dims: DimResults;
  atStage: number;
  unitId?: string;
};

export type JuniorHubPersist = {
  user: { name: string; avatar: string };
  units: Record<string, UnitState>;
  mistakes: Mistake[];
  lastAITest: number | null;
  aiTestCount: number;
  aiTestHistory: AITestRecord[];
  currentUnit: string;
  currentSemester: string;
};

export const AI_DIMENSIONS = [
  { key: "vocab", label: "词汇", emoji: "📖" },
  { key: "grammar", label: "语法", emoji: "🧩" },
  { key: "reading", label: "阅读", emoji: "📕" },
  { key: "listening", label: "听力", emoji: "👂" },
  { key: "writing", label: "写作", emoji: "✍️" },
] as const;

/** Trigger AI test every 10% unit progress (1/10). */
export const AI_TEST_PROGRESS_STEP = 0.1;
