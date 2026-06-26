import type { JuniorHubGrade } from "./types";

const VALID: JuniorHubGrade[] = [7, 8, 9, 10, 11, 12];

export function resolveJuniorHubGrade(raw: string | undefined): JuniorHubGrade {
  const n = Number(raw);
  if (VALID.includes(n as JuniorHubGrade)) return n as JuniorHubGrade;
  return 7;
}
