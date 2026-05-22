/**
 * Unified vocab mastery stats — same rules for 家长中心, 学习中心, ContinueCard.
 * Denominator: live corpus in DB. Numerator: unified_mastery (GPS) scoped to corpus ids.
 */
import { supabase } from "@/integrations/supabase/client";
import {
  countVocabCorpus,
  fetchVocabCorpusIds,
  type CorpusStage,
} from "@/lib/corpusTotals";

export type VocabMasterySnapshot = {
  total: number;
  mastered: number;
  fluent: number;
  weak: number;
  touched: number;
  untouched: number;
  due: number;
  /** mastered / total, 0–100 */
  percent: number;
};

type UnifiedRow = {
  item_id: string;
  state: string | null;
  due_at: string | null;
};

export async function fetchStageVocabMasteryStats(
  stage: CorpusStage,
  userId: string,
): Promise<VocabMasterySnapshot> {
  const [total, corpusIds] = await Promise.all([
    countVocabCorpus(stage),
    fetchVocabCorpusIds(stage),
  ]);

  const empty: VocabMasterySnapshot = {
    total,
    mastered: 0,
    fluent: 0,
    weak: 0,
    touched: 0,
    untouched: total,
    due: 0,
    percent: 0,
  };

  if (!userId || corpusIds.size === 0) return empty;

  const { data } = await supabase
    .from("unified_mastery")
    .select("item_id,state,due_at")
    .eq("user_id", userId)
    .eq("stage", stage)
    .eq("module", "vocab");

  let mastered = 0;
  let fluent = 0;
  let weak = 0;
  let due = 0;
  const now = Date.now();

  for (const r of (data ?? []) as UnifiedRow[]) {
    if (!corpusIds.has(r.item_id)) continue;
    const st = r.state ?? "none";
    if (st === "master") mastered += 1;
    else if (st === "fluent") fluent += 1;
    else if (st === "weak") weak += 1;
    if (r.due_at && new Date(r.due_at).getTime() <= now && st !== "master") due += 1;
  }

  const touched = mastered + fluent + weak;
  const untouched = Math.max(0, total - touched);

  return {
    total,
    mastered,
    fluent,
    weak,
    touched,
    untouched,
    due,
    percent: total ? Math.round((mastered / total) * 100) : 0,
  };
}

/** Map snapshot to useMasteryOverview ModuleStat fields. */
export function vocabSnapshotToModuleFields(s: VocabMasterySnapshot) {
  return {
    total: s.total,
    mastered: s.mastered,
    learned: s.fluent + s.weak,
    due: s.due,
    percent: s.percent,
    untouched: s.untouched,
  };
}

export type ScopeLike = {
  stage: string;
  grade: number;
  module: string;
  master: number;
  fluent: number;
  weak: number;
  none: number;
  total: number;
  score_pct: number;
  proportion_pct?: number;
};

/** Replace GPS vocab scope rows with corpus-aligned counts (same as 家长中心). */
export function applyCorpusVocabScope<T extends ScopeLike>(
  scopes: T[],
  stage: CorpusStage,
  snap: VocabMasterySnapshot,
): T[] {
  let hit = false;
  const out = scopes.map((row) => {
    if (row.stage !== stage || row.module !== "vocab") return row;
    hit = true;
    return {
      ...row,
      master: snap.mastered,
      fluent: snap.fluent,
      weak: snap.weak,
      none: snap.untouched,
      total: snap.total,
      score_pct: snap.percent,
    };
  });
  if (!hit && snap.total > 0) {
    out.push({
      stage,
      grade: stage === "junior" ? 7 : 10,
      module: "vocab",
      master: snap.mastered,
      fluent: snap.fluent,
      weak: snap.weak,
      none: snap.untouched,
      total: snap.total,
      score_pct: snap.percent,
      proportion_pct: 0,
    } as T);
  }
  return out;
}

export function aggregateScopeRows(rows: ScopeLike[]): {
  master: number;
  fluent: number;
  weak: number;
  none: number;
  total: number;
  score_pct: number;
} {
  const a = { master: 0, fluent: 0, weak: 0, none: 0, total: 0, score_pct: 0 };
  for (const r of rows) {
    a.master += r.master;
    a.fluent += r.fluent;
    a.weak += r.weak;
    a.none += r.none;
    a.total += r.total;
  }
  if (a.total > 0) {
    a.score_pct = Math.round(((a.master + a.fluent * 0.7 + a.weak * 0.3) / a.total) * 1000) / 10;
  }
  return a;
}
