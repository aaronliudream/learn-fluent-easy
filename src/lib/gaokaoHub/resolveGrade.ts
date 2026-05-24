import type { GaokaoHubGrade } from "./types";

export function resolveGaokaoHubGrade(raw: string | undefined): GaokaoHubGrade {
  const n = Number(raw);
  if (n === 1 || n === 2 || n === 3) return n;
  return 1;
}
