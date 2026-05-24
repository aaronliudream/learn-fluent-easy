import { warnRegistryDev } from "./registryDiscovery";

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

export const BUILTIN_READWRITE_PICTURE_VISUALS = [
  "place_books",
  "place_playground",
  "floor_building",
  "room_row",
  "student_count",
] as const satisfies readonly ReadWritePictureVisual[];

export type ReadWritePictureChoiceQuestion = {
  type: "picture_choice";
  /** Built-in SVG illustration (Unit 1 legacy visuals). */
  visual?: ReadWritePictureVisual;
  /** External image URL or site-relative path under public/ (preferred for new units). */
  image?: string;
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

export type ReadWritePictureDisplay =
  | { mode: "image"; src: string }
  | { mode: "visual"; visual: ReadWritePictureVisual };

/** Recommended public path for unit read/write illustrations. */
export function defaultReadWriteImagePath(unitId: string, filename: string): string {
  const trimmed = filename.replace(/^\//, "");
  return `/primary/hub/${unitId}/${trimmed}`;
}

export function isReadWritePictureVisual(value: string): value is ReadWritePictureVisual {
  return (BUILTIN_READWRITE_PICTURE_VISUALS as readonly string[]).includes(value);
}

export function hasPictureChoiceIllustration(
  question: Pick<ReadWritePictureChoiceQuestion, "visual" | "image">,
): boolean {
  return Boolean(question.image?.trim() || question.visual);
}

/**
 * Resolve picture_choice illustration. When both `image` and `visual` are set, `image` wins.
 */
export function resolvePictureChoiceDisplay(
  question: Pick<ReadWritePictureChoiceQuestion, "visual" | "image">,
): ReadWritePictureDisplay | null {
  const image = question.image?.trim();
  if (image) {
    return { mode: "image", src: image };
  }
  if (question.visual) {
    return { mode: "visual", visual: question.visual };
  }
  return null;
}

export function warnPictureChoiceQuestion(
  question: ReadWritePictureChoiceQuestion,
  context: string,
): void {
  const hasImage = Boolean(question.image?.trim());
  const hasVisual = Boolean(question.visual);

  if (!hasImage && !hasVisual) {
    warnRegistryDev(
      `readWrite: ${context} picture_choice missing both "image" and "visual"; will show alt-only placeholder.`,
    );
    return;
  }

  if (hasImage && hasVisual) {
    warnRegistryDev(
      `readWrite: ${context} picture_choice has both "image" and "visual"; using image (visual ignored).`,
    );
  }

  if (question.visual && !isReadWritePictureVisual(question.visual)) {
    warnRegistryDev(
      `readWrite: ${context} picture_choice has unknown visual "${question.visual}".`,
    );
  }
}
