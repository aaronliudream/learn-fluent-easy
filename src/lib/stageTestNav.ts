/** Route to the correct stage-test play page for a test row. */
export function stageTestPlayPath(
  segment: string,
  grade: number,
  testId: string,
  opts?: { module?: string | null; question_source?: string | null },
): string {
  const ai =
    segment === "junior" &&
    opts?.question_source === "ai_generated" &&
    opts?.module &&
    opts.module !== "vocab";
  if (ai) {
    return `/junior/stage-assessment/${grade}/${testId}`;
  }
  return `/stage-test/${segment}/${grade}/${testId}`;
}
