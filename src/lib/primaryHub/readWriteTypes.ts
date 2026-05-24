export type LookAndWriteQuestion = {
  image: string;
  imageAlt: string;
  hints: string[];
  answer: string;
  hint_text: string;
};

export type ReadAndFillMapConfig = {
  sentences: string[];
  rows: Array<
    Array<{
      id: string;
      label: string;
      fixed: boolean;
      answer?: string;
    }>
  >;
  pickerLabels: string[];
};

export type WordOrderQuestion = {
  words: string[];
  answer: string;
  label?: string;
};

export type FillDialogBlank = {
  id: string;
  keywords: string[];
  reference?: string;
};

export type FillDialogConfig = {
  patternTags: string[];
  lines: Array<{
    role: string;
    parts: Array<{ type: "text"; value: string } | { type: "blank"; blankId: string }>;
  }>;
  blanks: FillDialogBlank[];
};

export type ReadWritePhaseConfig =
  | { type: "look_and_write"; questions: LookAndWriteQuestion[]; pointsPerQuestion: number }
  | { type: "read_and_fill_map"; pointsIfAllCorrect: number } & ReadAndFillMapConfig
  | { type: "word_order"; questions: WordOrderQuestion[]; pointsPerQuestion: number }
  | { type: "fill_dialog"; pointsIfAllCorrect: number } & FillDialogConfig;

export type ReadWriteConfig = {
  unitId: string;
  stageIdx: number;
  title: string;
  totalPoints: number;
  stage_1: Extract<ReadWritePhaseConfig, { type: "look_and_write" }>;
  stage_2: Extract<ReadWritePhaseConfig, { type: "read_and_fill_map" }>;
  stage_3: Extract<ReadWritePhaseConfig, { type: "word_order" }>;
  stage_4: Extract<ReadWritePhaseConfig, { type: "fill_dialog" }>;
};
