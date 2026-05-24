import { hasUnitActivity, stripEmptyUnits } from "./hubCloudMerge";
import { loadPersist, PRIMARY_HUB_GRADES } from "./storage";
import type { PrimaryHubGrade, PrimaryHubPersist } from "./types";

export function snapshotLocalProgressByGrade(): Partial<Record<PrimaryHubGrade, PrimaryHubPersist>> {
  const out: Partial<Record<PrimaryHubGrade, PrimaryHubPersist>> = {};
  for (const g of PRIMARY_HUB_GRADES) {
    const p = stripEmptyUnits(loadPersist(g));
    if (hasUnitActivity(p.units) || p.mistakes.length > 0) out[g] = p;
  }
  return out;
}

export function hasAnyLocalPrimaryHubProgress(): boolean {
  return Object.keys(snapshotLocalProgressByGrade()).length > 0;
}
