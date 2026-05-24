export type ReadWriteChoiceOption = {
  text: string;
  correct: boolean;
};

export type ReadWritePictureVisual =
  | "place_books"
  | "place_playground"
  | "floor_building"
  | "room_row"
  | "student_count";

export type ReadWritePictureChoiceQuestion = {
  type: "picture_choice";
  visual: ReadWritePictureVisual;
  imageAlt: string;
  prompt_zh?: string;
  hint_zh?: string;
  options: ReadWriteChoiceOption[];
};

export type ReadWriteFillChoiceQuestion = {
  type: "fill_choice";
  sentence: string;
  hint_zh?: string;
  correctSentence?: string;
  options: ReadWriteChoiceOption[];
};

export type ReadWriteSimplifiedQuestion =
  | ReadWritePictureChoiceQuestion
  | ReadWriteFillChoiceQuestion;

/** One-question-per-screen read/write flow (5 MCQs). */
export type ReadWriteSimplifiedConfig = {
  unitId: string;
  stageIdx: number;
  title: string;
  totalPoints: number;
  pointsPerQuestion: number;
  questions: ReadWriteSimplifiedQuestion[];
};
