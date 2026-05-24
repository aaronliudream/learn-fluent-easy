import g4v2U1Stage6 from "@/data/primaryHub/readWrite/g4v2_u1_stage6.json";
import type { ReadWriteConfig } from "@/lib/primaryHub/readWriteTypes";

const CONFIGS: ReadWriteConfig[] = [g4v2U1Stage6 as ReadWriteConfig];

export function getReadWriteConfig(unitId: string, stageIdx: number): ReadWriteConfig | null {
  return CONFIGS.find((c) => c.unitId === unitId && c.stageIdx === stageIdx) ?? null;
}
