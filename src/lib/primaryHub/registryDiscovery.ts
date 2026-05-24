/** PEP primary-hub unit id embedded in filenames, e.g. g4v2_u1, gk1_required1_u2 */
export const UNIT_ID_IN_FILENAME = /(g\d+v\d+_u\d+|gk\d+_[a-z0-9]+_u\d+)/;

/** Legacy stage suffix, e.g. g4v2_u1_stage6.json */
export const STAGE_IDX_IN_FILENAME = /_stage(\d+)/;

export function basename(filePath: string): string {
  const parts = filePath.split(/[/\\]/);
  return parts[parts.length - 1] ?? filePath;
}

export function extractUnitIdFromPath(filePath: string): string | null {
  const match = basename(filePath).match(UNIT_ID_IN_FILENAME);
  return match?.[1] ?? null;
}

export function extractStageIdxFromPath(filePath: string): number | null {
  const match = basename(filePath).match(STAGE_IDX_IN_FILENAME);
  return match ? Number.parseInt(match[1], 10) : null;
}

export function warnRegistryDev(message: string): void {
  if (import.meta.env.DEV) {
    console.warn(`[primaryHub registry] ${message}`);
  }
}

type RegistryIdentityData = {
  unitId?: string;
  stageIdx?: number;
};

/**
 * Resolve unitId / stageIdx for registry entries.
 * Filename unit id is preferred; JSON fields are fallback for legacy names.
 */
export function resolveRegistryIdentity(
  filePath: string,
  data: RegistryIdentityData,
  options: { requireStageIdx: boolean; kind: string },
): { unitId: string; stageIdx: number } | null {
  const fileUnitId = extractUnitIdFromPath(filePath);
  const unitId = fileUnitId ?? data.unitId;

  if (!unitId) {
    warnRegistryDev(
      `${options.kind}: skipped "${basename(filePath)}" — cannot resolve unitId (expected prefix like g4v2_u2_grammar.json).`,
    );
    return null;
  }

  if (!fileUnitId && data.unitId) {
    warnRegistryDev(
      `${options.kind}: "${basename(filePath)}" uses unitId from JSON ("${data.unitId}"). Prefer renaming to include unit id, e.g. g4v2_u1_read_write.json.`,
    );
  }

  const fileStageIdx = extractStageIdxFromPath(filePath);
  const stageIdx = fileStageIdx ?? data.stageIdx;

  if (options.requireStageIdx && stageIdx === undefined) {
    warnRegistryDev(
      `${options.kind}: skipped "${basename(filePath)}" — cannot resolve stageIdx (use _stageN suffix or stageIdx in JSON).`,
    );
    return null;
  }

  return { unitId, stageIdx: stageIdx ?? 0 };
}

export function registryKey(unitId: string, stageIdx: number): string {
  return `${unitId}::${stageIdx}`;
}
