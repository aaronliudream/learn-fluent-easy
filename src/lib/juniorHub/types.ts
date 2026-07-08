// 7|8|9 = 初中(不可改动);10|11|12 = 高中(必修=10 高一 / 选必=11 高二 / 复习=12),加法接入,不影响初中逻辑。
export type JuniorHubGrade = 7 | 8 | 9 | 10 | 11 | 12;

export type VocabItem = {
  en: string;
  cn: string;
  emoji?: string;
  phonetic?: string; // 音标(junior_vocab.phonetic;英音)
  chunks?: { en: string; cn: string }[];
};

export type QuizQuestion = {
  q: string;
  opts: string[];
  answer: number;
  point?: string;
  dim?: "vocab" | "grammar" | "reading" | "listening" | "writing";
  audio?: string;
  unitTitle?: string;
  id?: number;
  explanation?: string;
  /** 学生本次所选项下标(仅错题写入用,做题/判分不依赖)。 */
  picked?: number;
};

export type ListeningQuestion = {
  audio: string;
  opts: string[];
  answer: number;
  /** 学生本次所选项下标(仅错题写入用,做题/判分不依赖)。 */
  picked?: number;
};

export type ReadingBlock = {
  passage: string;
  passageCn: string;
  questions: QuizQuestion[];
};

export type WritingCard = {
  key: string;
  labelCn: string;
  hint?: string;
  default?: string;
  options?: string[];
};

export type WritingBlock = {
  prompt: string;
  promptCn: string;
  sampleWords: string[];
  // ↓ 可选「四屏写作」字段;旧单元无这些字段时组件自动回退到简易文本框。
  topic?: string;
  opener?: string;
  cards?: WritingCard[];
  templates?: { l1: string[]; l2: string[]; l3: string[] };
  connectors?: string[];
  minWords?: number;
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
    | "cloze"
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
  /** 多语法点「综合测试」用;有此字段(>=1)则该单元语法关走合并抽题测试。 */
  grammarCodes?: string[];
  /** 单知识点专项:配 kp 的 code(如 g7-t16-adj)则语法关只练该 kp(优先于 grammarCode/grammarCodes)。 */
  grammarKpCode?: string;
  grammarQuiz: QuizQuestion[];
  reading: ReadingBlock | null;
  writing: WritingBlock | null;
  quizQuestions: QuizQuestion[];
  listeningQuestions: ListeningQuestion[];
  /** 单元通关专属迷你阅读(短文2-3句+转述题,不撞阅读关)。buildFinalQuiz 优先用它。 */
  finalReading?: {
    passage: string;
    questions: Array<{ q: string; options: string[]; answer: string; explanation?: string }>;
  };
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
  /** 核心词汇关已看到的最高组号(0-based)。纯浏览进度,不算掌握度;随 state 云同步。 */
  vocabGroup?: number;
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
  lastActiveAt?: number; // 最后做题活跃时间(给 dashboard「继续上次」排序用)
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
