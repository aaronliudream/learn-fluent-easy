import { G4V2_U1_PHONICS, type G4v2U1PhonicsConfig } from "@/data/primaryHub/phonics/g4v2_u1_er";
import {
  basename,
  extractUnitIdFromPath,
  warnRegistryDev,
} from "./registryDiscovery";

export type PhonicsConfig = G4v2U1PhonicsConfig;

function isPhonicsConfig(value: unknown): value is PhonicsConfig {
  if (!value || typeof value !== "object") return false;
  const v = value as PhonicsConfig;
  return (
    typeof v.unitId === "string" &&
    typeof v.phonics_rule === "string" &&
    Array.isArray(v.stage_1_listen)
  );
}

function extractPhonicsFromModule(
  mod: Record<string, unknown>,
): PhonicsConfig | null {
  if (mod.default && isPhonicsConfig(mod.default)) {
    return mod.default;
  }
  for (const value of Object.values(mod)) {
    if (isPhonicsConfig(value)) {
      return value;
    }
  }
  return null;
}

const phonicsTsModules = import.meta.glob("../../data/primaryHub/phonics/*.ts", {
  eager: true,
}) as Record<string, Record<string, unknown>>;

const phonicsJsonModules = import.meta.glob("../../data/primaryHub/phonics/*.json", {
  eager: true,
  import: "default",
}) as Record<string, PhonicsConfig>;

function loadPhonicsByUnit(): Record<string, PhonicsConfig> {
  const byUnit: Record<string, PhonicsConfig> = {};

  for (const [filePath, mod] of Object.entries(phonicsTsModules)) {
    if (basename(filePath) === "index.ts") continue;

    const config = extractPhonicsFromModule(mod);
    if (!config) {
      warnRegistryDev(
        `phonics: skipped "${basename(filePath)}" — no exported PhonicsConfig (object with unitId, phonics_rule, stage_1_listen).`,
      );
      continue;
    }

    const fileUnitId = extractUnitIdFromPath(filePath);
    const unitId = fileUnitId ?? config.unitId;

    if (!fileUnitId) {
      warnRegistryDev(
        `phonics: "${basename(filePath)}" uses unitId from module ("${config.unitId}"). Prefer renaming to g4v2_u1_er.ts.`,
      );
    }

    if (byUnit[unitId]) {
      warnRegistryDev(
        `phonics: duplicate entry for ${unitId}; "${basename(filePath)}" overrides previous file.`,
      );
    }

    byUnit[unitId] = config.unitId === unitId ? config : { ...config, unitId };
  }

  for (const [filePath, raw] of Object.entries(phonicsJsonModules)) {
    if (!isPhonicsConfig(raw)) {
      warnRegistryDev(
        `phonics: skipped "${basename(filePath)}" — invalid PhonicsConfig JSON.`,
      );
      continue;
    }

    const fileUnitId = extractUnitIdFromPath(filePath);
    const unitId = fileUnitId ?? raw.unitId;

    if (!fileUnitId) {
      warnRegistryDev(
        `phonics: "${basename(filePath)}" uses unitId from JSON ("${raw.unitId}"). Prefer g4v2_u2_er.json naming.`,
      );
    }

    if (byUnit[unitId]) {
      warnRegistryDev(
        `phonics: duplicate entry for ${unitId}; "${basename(filePath)}" overrides previous file.`,
      );
    }

    byUnit[unitId] = raw.unitId === unitId ? raw : { ...raw, unitId };
  }

  return byUnit;
}

const PHONICS_BY_UNIT = loadPhonicsByUnit();

export function getPhonicsForUnit(unitId: string): PhonicsConfig | null {
  return PHONICS_BY_UNIT[unitId] ?? null;
}

export function phonicsPath(
  grade: number,
  semId: string,
  unitId: string,
  stageIdx: number,
): string {
  return `/primary/hub/${grade}/semester/${semId}/unit/${unitId}/stage/${stageIdx}/phonics`;
}

/** @internal Exposed for unit tests */
export function __getPhonicsByUnitForTest(): Record<string, PhonicsConfig> {
  return PHONICS_BY_UNIT;
}

/** @internal Ensure glob-loaded config matches legacy export (regression guard). */
export function __assertG4v2U1PhonicsParityForTest(): boolean {
  const loaded = getPhonicsForUnit("g4v2_u1");
  return loaded?.phonics_rule === G4V2_U1_PHONICS.phonics_rule;
}
