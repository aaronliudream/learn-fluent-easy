/**
 * Live corpus sizes from Supabase — single source for progress denominators.
 * Keep fallbacks in sync after major ingests (see docs/vocab/*_ingest_report.md).
 */
import { supabase } from "@/integrations/supabase/client";

/** Fallback if count query fails (2921 legacy + ~652 PEP 必修, minus overlap). */
export const GAOKAO_VOCAB_FALLBACK = 3573;
export const JUNIOR_VOCAB_FALLBACK = 2373;

export type CorpusStage = "junior" | "senior";

export async function countGaokaoVocabCorpus(): Promise<number> {
  const { count, error } = await supabase
    .from("gaokao_vocab")
    .select("id", { count: "exact", head: true })
    .eq("stage", "senior");
  if (error || count == null) return GAOKAO_VOCAB_FALLBACK;
  return count;
}

export async function countJuniorVocabCorpus(): Promise<number> {
  const { count, error } = await supabase
    .from("junior_vocab")
    .select("id", { count: "exact", head: true });
  if (error || count == null) return JUNIOR_VOCAB_FALLBACK;
  return count;
}

export async function countVocabCorpus(stage: CorpusStage): Promise<number> {
  return stage === "junior" ? countJuniorVocabCorpus() : countGaokaoVocabCorpus();
}

/** Paginated fetch of all vocab row ids for scoping mastery numerators. */
export async function fetchVocabCorpusIds(stage: CorpusStage): Promise<Set<string>> {
  const table = stage === "junior" ? "junior_vocab" : "gaokao_vocab";
  const ids = new Set<string>();
  const pageSize = 1000;
  let from = 0;
  for (;;) {
    let q = supabase.from(table).select("id").range(from, from + pageSize - 1);
    if (stage === "senior") q = q.eq("stage", "senior");
    const { data, error } = await q;
    if (error) break;
    const batch = data ?? [];
    for (const row of batch) ids.add((row as { id: string }).id);
    if (batch.length < pageSize) break;
    from += pageSize;
  }
  return ids;
}

export async function countGaokaoGrammarCorpus(): Promise<number> {
  const { count, error } = await supabase
    .from("gaokao_grammar_points")
    .select("id", { count: "exact", head: true });
  if (error || count == null) return 298;
  return count;
}

export async function countGaokaoReadingCorpus(): Promise<number> {
  const { count, error } = await supabase
    .from("gaokao_reading_articles")
    .select("id", { count: "exact", head: true });
  if (error || count == null) return 65;
  return count;
}

export async function countJuniorReadingCorpus(): Promise<number> {
  const { count, error } = await supabase
    .from("junior_reading_passages")
    .select("id", { count: "exact", head: true });
  if (error || count == null) return 91;
  return count;
}
