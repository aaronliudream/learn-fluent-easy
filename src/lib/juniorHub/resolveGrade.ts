import type { JuniorHubGrade } from "./types";

export function resolveJuniorHubGrade(raw: string | undefined): JuniorHubGrade {
  const n = Number(raw);
  if (n === 7 || n === 8 || n === 9) return n;
  return 7;
}
