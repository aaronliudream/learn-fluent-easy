import type { SentenceLessonConfig } from "./sentenceTypes";
import {
  basename,
  registryKey,
  resolveRegistryIdentity,
  warnRegistryDev,
} from "./registryDiscovery";

const sentenceModules = import.meta.glob("../../data/primaryHub/sentence/*.json", {
  eager: true,
  import: "default",
}) as Record<string, SentenceLessonConfig>;

function isSentenceLessonConfig(value: unknown): value is SentenceLessonConfig {
  if (!value || typeof value !== "object") return false;
  const v = value as SentenceLessonConfig;
  return (
    typeof v.lessonId === "string" &&
    Array.isArray(v.subModules) &&
    v.subModules.length > 0
  );
}

function loadSentenceLessons(): SentenceLessonConfig[] {
  const byKey = new Map<string, SentenceLessonConfig>();

  for (const [filePath, raw] of Object.entries(sentenceModules)) {
    if (!isSentenceLessonConfig(raw)) {
      warnRegistryDev(
        `sentence: skipped "${basename(filePath)}" — invalid SentenceLessonConfig (missing subModules).`,
      );
      continue;
    }

    const identity = resolveRegistryIdentity(filePath, raw, {
      requireStageIdx: true,
      kind: "sentence",
    });
    if (!identity) continue;

    const { unitId, stageIdx } = identity;
    const key = registryKey(unitId, stageIdx);

    if (raw.unitId !== unitId || raw.stageIdx !== stageIdx) {
      warnRegistryDev(
        `sentence: "${basename(filePath)}" JSON unitId/stageIdx (${raw.unitId}@${raw.stageIdx}) differs from resolved (${unitId}@${stageIdx}); using resolved values.`,
      );
    }

    if (byKey.has(key)) {
      warnRegistryDev(
        `sentence: duplicate entry for ${unitId} stage ${stageIdx}; "${basename(filePath)}" overrides previous file.`,
      );
    }

    byKey.set(key, { ...raw, unitId, stageIdx });
  }

  return [...byKey.values()];
}

const LESSONS = loadSentenceLessons();

export function getSentenceLesson(unitId: string, stageIdx: number): SentenceLessonConfig | null {
  return LESSONS.find((l) => l.unitId === unitId && l.stageIdx === stageIdx) ?? null;
}

/** @internal Exposed for unit tests */
export function __getSentenceLessonsForTest(): SentenceLessonConfig[] {
  return LESSONS;
}
