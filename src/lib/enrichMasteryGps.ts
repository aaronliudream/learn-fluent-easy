/**
 * Align Learning Center / Dashboard GPS data with corpus-based vocab stats
 * (same source as 家长中心 · AchievementBanner).
 */
import {
  aggregateScopeRows,
  applyCorpusVocabScope,
  fetchStageVocabMasteryStats,
  type ScopeLike,
} from "@/lib/stageVocabStats";

export type GpsStageKey = "primary" | "junior" | "senior";

export type EnrichedGpsPayload<T extends ScopeLike> = {
  scopes: T[];
  stageProps: Array<{
    stage: GpsStageKey;
    master: number;
    fluent: number;
    weak: number;
    none: number;
    total: number;
    score_pct: number;
    proportion_pct: number;
  }>;
  moduleProps: Array<{
    module: string;
    master: number;
    fluent: number;
    weak: number;
    none: number;
    total: number;
    score_pct: number;
    proportion_pct: number;
  }>;
  overall: ReturnType<typeof aggregateScopeRows>;
};

const STAGES: GpsStageKey[] = ["primary", "junior", "senior"];

export async function enrichMasteryGpsData<T extends ScopeLike>(
  userId: string,
  scopes: T[],
): Promise<EnrichedGpsPayload<T>> {
  const [juniorVocab, seniorVocab] = await Promise.all([
    fetchStageVocabMasteryStats("junior", userId),
    fetchStageVocabMasteryStats("senior", userId),
  ]);

  let enriched = applyCorpusVocabScope(scopes, "junior", juniorVocab);
  enriched = applyCorpusVocabScope(enriched, "senior", seniorVocab);

  const stageProps = STAGES.map((stage) => {
    const rows = enriched.filter((r) => r.stage === stage);
    const agg = aggregateScopeRows(rows);
    const propTotal = rows.reduce((s, r) => s + (r.proportion_pct ?? 0), 0);
    return { stage, ...agg, proportion_pct: propTotal };
  });

  const moduleSet = [...new Set(enriched.map((r) => r.module))];
  const moduleProps = moduleSet.map((module) => {
    const rows = enriched.filter((r) => r.module === module);
    const agg = aggregateScopeRows(rows);
    const propTotal = rows.reduce((s, r) => s + (r.proportion_pct ?? 0), 0);
    return { module, ...agg, proportion_pct: propTotal };
  });

  const overall = aggregateScopeRows(enriched);

  return { scopes: enriched, stageProps, moduleProps, overall };
}
