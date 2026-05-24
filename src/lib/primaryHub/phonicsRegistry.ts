import { G4V2_U1_PHONICS, type G4v2U1PhonicsConfig } from "@/data/primaryHub/phonics/g4v2_u1_er";

export type PhonicsConfig = G4v2U1PhonicsConfig;

const PHONICS_BY_UNIT: Record<string, PhonicsConfig> = {
  [G4V2_U1_PHONICS.unitId]: G4V2_U1_PHONICS,
};

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
