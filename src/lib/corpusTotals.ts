/**
 * Live corpus sizes from Supabase — single source for progress denominators.
 * Keep fallbacks in sync after major ingests (see docs/vocab/*_ingest_report.md).
 */
import { supabase } from "@/integrations/supabase/client";
import {
  countLocalClozePassages,
  countLocalGrammarPoints,
  countLocalListeningExercises,
  countLocalReadingArticles,
  countLocalWritingPrompts,
} from "@/lib/gaokaoContent";
import { countGaokaoVocabPool, fetchGaokaoVocabPool, GAOKAO_VOCAB_POOL_FALLBACK } from "@/lib/gaokaoVocabPool";

/** Fallback if Supabase vocab pool is unreachable. */
export const GAOKAO_VOCAB_FALLBACK = GAOKAO_VOCAB_POOL_FALLBACK;
export const JUNIOR_VOCAB_FALLBACK = 2179;

export type CorpusStage = "junior" | "senior";

export async function countGaokaoVocabCorpus(): Promise<number> {
  try {
    return await countGaokaoVocabPool();
  } catch {
    return GAOKAO_VOCAB_FALLBACK;
  }
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
  if (stage === "senior") {
    const pool = await fetchGaokaoVocabPool();
    return new Set(pool.map((v) => v.id));
  }
  const ids = new Set<string>();
  const pageSize = 1000;
  let from = 0;
  for (;;) {
    const { data, error } = await supabase
      .from("junior_vocab")
      .select("id")
      .range(from, from + pageSize - 1);
    if (error) break;
    const batch = data ?? [];
    for (const row of batch) ids.add((row as { id: string }).id);
    if (batch.length < pageSize) break;
    from += pageSize;
  }
  return ids;
}

export async function countGaokaoGrammarCorpus(): Promise<number> {
  return countLocalGrammarPoints();
}

export async function countGaokaoReadingCorpus(): Promise<number> {
  return countLocalReadingArticles();
}

export async function countGaokaoClozeCorpus(): Promise<number> {
  return countLocalClozePassages();
}

export async function countGaokaoWritingCorpus(): Promise<number> {
  return countLocalWritingPrompts();
}

export async function countGaokaoListeningCorpus(): Promise<number> {
  return countLocalListeningExercises();
}

export async function countJuniorReadingCorpus(): Promise<number> {
  const { count, error } = await supabase
    .from("junior_reading_passages")
    .select("id", { count: "exact", head: true });
  if (error || count == null) return 91;
  return count;
}
