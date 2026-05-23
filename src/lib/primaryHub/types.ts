export type PrimaryHubGrade = 3 | 4 | 5 | 6;

export type VocabItem = { en: string; cn: string; emoji: string };

export type QuizQuestion = {
  q: string;
  opts: string[];
  answer: number;
  point?: string;
  dim?: "vocab" | "sentence" | "listening" | "phonics";
  audio?: string;
  unitTitle?: string;
  id?: number;
};

export type ListeningQuestion = {
  audio: string;
  opts: string[];
  answer: number;
};

export type StageDef = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  type: "vocab" | "listenWord" | "match" | "storybook" | "sentence" | "write" | "listenSent" | "finalQuiz";
  time: string;
};

export type UnitDef = {
  id: string;
  num: number;
  title: string;
  cn: string;
  emoji: string;
  available: boolean;
  vocabulary: VocabItem[];
  dialogues: Array<{ title: string; lines: Array<{ role: string; text: string; cn: string }> }>;
  storybook?: {
    title: string;
    titleCn: string;
    cover: string;
    pages: Array<{ emoji: string; en: string; cn: string; hint: string }>;
    questions: Array<{ q: string; opts: string[]; answer: number }>;
  };
  stages: StageDef[];
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
  reviewSchedule: unknown[];
  reviewHistory: unknown[];
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
};

export type PrimaryHubPersist = {
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
  { key: "sentence", label: "句型", emoji: "💬" },
  { key: "listening", label: "听力", emoji: "👂" },
  { key: "phonics", label: "语音", emoji: "🔤" },
] as const;

export const DEFAULT_STAGES: StageDef[] = [
  { id: "s1", title: "认识单词", subtitle: "8个核心单词", icon: "📚", type: "vocab", time: "5分钟" },
  { id: "s2", title: "听音辨词", subtitle: "听力训练", icon: "🎧", type: "listenWord", time: "5分钟" },
  { id: "s3", title: "单词配对", subtitle: "巩固词义", icon: "🎮", type: "match", time: "5分钟" },
  { id: "s4", title: "趣味绘本", subtitle: "故事中学习", icon: "📖", type: "storybook", time: "8分钟" },
  { id: "s5", title: "学习句型", subtitle: "4个核心句型", icon: "💬", type: "sentence", time: "5分钟" },
  { id: "s6", title: "默写挑战", subtitle: "动手拼写", icon: "✏️", type: "write", time: "8分钟" },
  { id: "s7", title: "听力测试", subtitle: "听句选答案", icon: "🎯", type: "listenSent", time: "6分钟" },
  { id: "s8", title: "最终通关", subtitle: "综合挑战", icon: "🏆", type: "finalQuiz", time: "10分钟" },
];
