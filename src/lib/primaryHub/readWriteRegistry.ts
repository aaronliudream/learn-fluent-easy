import unit1ReadWriteSimplified from "@/data/primaryHub/readWrite/unit1_read_write_simplified.json";
import type { ReadWriteSimplifiedConfig } from "@/lib/primaryHub/readWriteTypes";

const CONFIGS: ReadWriteSimplifiedConfig[] = [
  unit1ReadWriteSimplified as ReadWriteSimplifiedConfig,
];

export function getReadWriteConfig(
  unitId: string,
  stageIdx: number,
): ReadWriteSimplifiedConfig | null {
  return CONFIGS.find((c) => c.unitId === unitId && c.stageIdx === stageIdx) ?? null;
}
