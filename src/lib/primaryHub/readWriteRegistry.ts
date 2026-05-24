import type { ReadWriteSimplifiedConfig } from "@/lib/primaryHub/readWriteTypes";
import { warnPictureChoiceQuestion } from "@/lib/primaryHub/readWriteTypes";
import {
  basename,
  registryKey,
  resolveRegistryIdentity,
  warnRegistryDev,
} from "./registryDiscovery";

const readWriteModules = import.meta.glob("../../data/primaryHub/readWrite/*.json", {
  eager: true,
  import: "default",
}) as Record<string, ReadWriteSimplifiedConfig>;

function isReadWriteSimplifiedConfig(value: unknown): value is ReadWriteSimplifiedConfig {
  if (!value || typeof value !== "object") return false;
  const v = value as ReadWriteSimplifiedConfig;
  return (
    typeof v.unitId === "string" &&
    typeof v.stageIdx === "number" &&
    Array.isArray(v.questions) &&
    v.questions.length > 0
  );
}

function loadReadWriteConfigs(): ReadWriteSimplifiedConfig[] {
  const byKey = new Map<string, ReadWriteSimplifiedConfig>();

  for (const [filePath, raw] of Object.entries(readWriteModules)) {
    if (!isReadWriteSimplifiedConfig(raw)) {
      warnRegistryDev(
        `readWrite: skipped "${basename(filePath)}" — not a ReadWriteSimplifiedConfig (expected "questions" array; legacy multi-stage files are ignored).`,
      );
      continue;
    }

    const identity = resolveRegistryIdentity(filePath, raw, {
      requireStageIdx: true,
      kind: "readWrite",
    });
    if (!identity) continue;

    const { unitId, stageIdx } = identity;
    const key = registryKey(unitId, stageIdx);

    if (raw.unitId !== unitId || raw.stageIdx !== stageIdx) {
      warnRegistryDev(
        `readWrite: "${basename(filePath)}" JSON unitId/stageIdx (${raw.unitId}@${raw.stageIdx}) differs from resolved (${unitId}@${stageIdx}); using resolved values.`,
      );
    }

    if (byKey.has(key)) {
      warnRegistryDev(
        `readWrite: duplicate entry for ${unitId} stage ${stageIdx}; "${basename(filePath)}" overrides previous file.`,
      );
    }

    raw.questions.forEach((question, index) => {
      if (question.type === "picture_choice") {
        warnPictureChoiceQuestion(question, `${basename(filePath)} q${index + 1}`);
      }
    });

    byKey.set(key, { ...raw, unitId, stageIdx });
  }

  return [...byKey.values()];
}

const CONFIGS = loadReadWriteConfigs();

export function getReadWriteConfig(
  unitId: string,
  stageIdx: number,
): ReadWriteSimplifiedConfig | null {
  return CONFIGS.find((c) => c.unitId === unitId && c.stageIdx === stageIdx) ?? null;
}

/** @internal Exposed for unit tests */
export function __getReadWriteConfigsForTest(): ReadWriteSimplifiedConfig[] {
  return CONFIGS;
}
