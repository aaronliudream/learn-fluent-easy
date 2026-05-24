export type GaokaoHubGrade = 1 | 2 | 3;

export type {
  VocabItem,
  QuizQuestion,
  ListeningQuestion,
  ReadingBlock,
  WritingBlock,
  StageDef,
  UnitDef,
  SemesterDef,
  GradeCourseDef,
  UnitState,
  Mistake,
  DimResults,
  AITestRecord,
} from "@/lib/juniorHub/types";

import type { JuniorHubPersist } from "@/lib/juniorHub/types";

export type GaokaoHubPersist = JuniorHubPersist;

export {
  AI_DIMENSIONS,
  AI_TEST_PROGRESS_STEP,
} from "@/lib/juniorHub/types";
