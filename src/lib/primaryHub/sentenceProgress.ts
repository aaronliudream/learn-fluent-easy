import type { SentenceLessonConfig, SentenceSubModule } from "./sentenceTypes";
import type { UnitState } from "./types";

export function getSentenceCompletedIds(us: UnitState): Set<string> {
  return new Set(us.sentenceCompleted ?? []);
}

export function countSubmoduleDone(
  mod: SentenceSubModule,
  completed: Set<string>,
): number {
  return mod.sentences.filter((s) => completed.has(s.id)).length;
}

export function isSubmoduleComplete(mod: SentenceSubModule, completed: Set<string>): boolean {
  return countSubmoduleDone(mod, completed) >= mod.sentences.length;
}

export function isSubmoduleUnlocked(
  mod: SentenceSubModule,
  modules: SentenceSubModule[],
  completed: Set<string>,
): boolean {
  if (!mod.lockedUntil) return true;
  const prereq = modules.find((m) => m.id === mod.lockedUntil);
  return prereq ? isSubmoduleComplete(prereq, completed) : true;
}

export function getSentenceLessonPercent(lesson: SentenceLessonConfig, completed: Set<string>): number {
  const total = lesson.subModules.reduce((n, m) => n + m.sentences.length, 0);
  if (total === 0) return 0;
  const done = lesson.subModules.reduce(
    (n, m) => n + countSubmoduleDone(m, completed),
    0,
  );
  return Math.round((done / total) * 100);
}

export function isSentenceLessonComplete(lesson: SentenceLessonConfig, completed: Set<string>): boolean {
  return lesson.subModules.every((m) => isSubmoduleComplete(m, completed));
}
